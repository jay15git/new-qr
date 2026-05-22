import type { ExtensionFunction } from "qr-code-styling"

import {
  getQrBackgroundShapeDefinition,
  type QrBackgroundShapeDefinition,
} from "@/components/qr/qr-background-shapes"
import {
  getActiveCustomDotShape,
  type CustomDotShape,
} from "@/components/qr/custom-dot-shapes"
import { createDotsPaletteExtension } from "@/components/qr/qr-dots-palette"
import { createCustomDotShapeExtension } from "@/components/qr/qr-svg-custom-shape-extension"
import {
  clampBackgroundShapeOffset,
  clampBackgroundShapeOpacity,
  clampBackgroundShapePaddingPx,
  DEFAULT_BACKGROUND_SHAPE_OPTIONS,
  clampQrSize,
  getAssetValue,
  hasActiveBackgroundShapeOptions,
  type QrDotMatrixAnimationOptions,
  type QrStudioState,
  type StudioGradient,
} from "@/components/qr/qr-studio-state"

type QrAnimationRenderMode = "export" | "none" | "preview"

const SVG_NS = "http://www.w3.org/2000/svg"
const DOTS_CLIP_PATH_PREFIX = "clip-path-dot-color-"

export function buildQrExtension(
  state: QrStudioState,
  options: { animationMode?: QrAnimationRenderMode } = {},
) {
  const extensions: ExtensionFunction[] = []
  const customDotShape = getSvgCustomDotShape(state)
  const backgroundImage = getAssetValue(state.backgroundImage)
  const backgroundShape = backgroundImage
    ? null
    : getQrBackgroundShapeDefinition(state.backgroundShapeId)
  const alignedCornerGradientExtension = createAlignedCornerGradientExtension(state)
  const dotMatrixAnimationExtension = createDotMatrixAnimationExtension(
    state,
    options.animationMode ?? "none",
  )

  if (backgroundImage) {
    extensions.push(
      createBackgroundImageExtension(
        backgroundImage,
        state.backgroundOptions.round,
      ),
    )
  }

  if (backgroundShape) {
    extensions.push(createBackgroundShapeExtension(backgroundShape, state))
  } else if (!backgroundImage && hasActiveBackgroundSurfaceOptions(state.backgroundShapeOptions)) {
    extensions.push(createBackgroundSurfaceExtension(state))
  }

  if (customDotShape) {
    extensions.push(createCustomDotShapeExtension(customDotShape))
  }

  if (state.dotsColorMode === "palette") {
    extensions.push(
      createDotsPaletteExtension({
        palette: state.dotsPalette,
        seed: state.data.trim(),
      }),
    )
  }

  if (alignedCornerGradientExtension) {
    extensions.push(alignedCornerGradientExtension)
  }

  if (dotMatrixAnimationExtension) {
    extensions.push(dotMatrixAnimationExtension)
  }

  if (extensions.length === 0) {
    return null
  }

  return (
    svg: Parameters<ExtensionFunction>[0],
    options: Parameters<ExtensionFunction>[1],
  ) => {
    for (const extension of extensions) {
      extension(svg, options)
    }
  }
}

export function getQrExtensionKey(
  state: QrStudioState,
  options: { animationMode?: QrAnimationRenderMode } = {},
) {
  const animationMode = options.animationMode ?? "none"

  return JSON.stringify({
    animation:
      shouldApplyDotMatrixAnimation(state, animationMode)
        ? state.dotMatrixAnimation
        : null,
    animationMode,
    backgroundImage: getAssetValue(state.backgroundImage),
    backgroundRound: state.backgroundOptions.round,
    backgroundShapeGradient: getBackgroundShapeGradientKey(state),
    backgroundShapeId: getAssetValue(state.backgroundImage)
      ? null
      : state.backgroundShapeId,
    backgroundShapeOptions: getAssetValue(state.backgroundImage)
      ? null
      : state.backgroundShapeOptions,
    cornersDotGradient: getAlignedCornerGradientKey(state.cornersDotGradient),
    cornersSquareGradient: getAlignedCornerGradientKey(
      state.cornersSquareGradient,
    ),
    customDotShape: getSvgCustomDotShape(state),
    dotsColorMode: state.dotsColorMode,
    dotsPalette: state.dotsPalette,
    seed: state.data.trim(),
  })
}

export function createDotMatrixAnimationExtension(
  state: QrStudioState,
  mode: QrAnimationRenderMode,
): ExtensionFunction | null {
  if (!shouldApplyDotMatrixAnimation(state, mode)) {
    return null
  }

  return (svg) => {
    const document = svg.ownerDocument

    if (!document) {
      return
    }

    svg.querySelectorAll('[data-qr-layer="dot-matrix-animation"]').forEach((node) => {
      node.remove()
    })

    const dotLayers = getDotClipLayers(svg)

    if (dotLayers.length === 0) {
      return
    }

    const dotShapes = dotLayers.flatMap((layer) => layer.shapes)
    const metrics = collectDotMatrixMetrics(dotShapes)

    if (!metrics) {
      return
    }

    const group = document.createElementNS(SVG_NS, "g")
    group.setAttribute("data-qr-layer", "dot-matrix-animation")
    group.setAttribute(
      "class",
      [
        "qr-dot-matrix-layer",
        `qr-dot-loader-${state.dotMatrixAnimation.loader}`,
        `qr-dot-pattern-${state.dotMatrixAnimation.pattern}`,
        `qr-dot-shape-${state.dotMatrixAnimation.dotShape}`,
        state.dotMatrixAnimation.bloom ? "qr-dot-matrix-bloom" : "",
        state.dotMatrixAnimation.hoverAnimated ? "qr-dot-matrix-hover" : "",
        state.dotMatrixAnimation.muted ? "qr-dot-matrix-muted" : "",
      ].filter(Boolean).join(" "),
    )
    group.setAttribute("data-qr-dot-loader", state.dotMatrixAnimation.loader)
    group.appendChild(createDotMatrixAnimationStyle(document))
    group.setAttribute(
      "style",
      [
        `--qr-dot-matrix-color:${resolveDotMatrixColor(state)}`,
        `--qr-dot-matrix-duration:${getDotMatrixAnimationDuration(state.dotMatrixAnimation)}s`,
        `--qr-dot-matrix-halo:${formatSvgNumber(state.dotMatrixAnimation.halo)}`,
        `--qr-dot-matrix-opacity-base:${formatSvgNumber(state.dotMatrixAnimation.opacityBase)}`,
        `--qr-dot-matrix-opacity-mid:${formatSvgNumber(state.dotMatrixAnimation.opacityMid)}`,
        `--qr-dot-matrix-opacity-peak:${formatSvgNumber(state.dotMatrixAnimation.opacityPeak)}`,
        `--qr-dot-matrix-scale:${formatSvgNumber(state.dotMatrixAnimation.overlayScale / 100)}`,
      ].join(";"),
    )

    for (const layer of dotLayers) {
      for (const shape of layer.shapes) {
        const coordinates = resolveDotMatrixCoordinates(shape, metrics)

        if (!coordinates) {
          continue
        }

        if (!shouldRenderDotMatrixOverlayModule(coordinates, metrics, state.dotMatrixAnimation.pattern)) {
          continue
        }

        const animatedShape = shape.cloneNode(true) as SVGElement
        animatedShape.removeAttribute("clip-path")
        animatedShape.setAttribute("fill", resolveDotMatrixColor(state))
        animatedShape.setAttribute("data-qr-dot-loader", state.dotMatrixAnimation.loader)
        animatedShape.setAttribute("class", "qr-dot-matrix-module")
        animatedShape.setAttribute("style", getDotMatrixModuleStyle(coordinates, metrics))
        group.appendChild(animatedShape)
      }
    }

    if (group.children.length <= 1) {
      return
    }

    svg.insertBefore(group, findDotMatrixLayerAnchor(svg))
  }
}

function shouldApplyDotMatrixAnimation(
  state: QrStudioState,
  mode: QrAnimationRenderMode,
) {
  if (!state.dotMatrixAnimation.enabled || state.type !== "svg") {
    return false
  }

  if (!state.dotMatrixAnimation.animated && !state.dotMatrixAnimation.hoverAnimated) {
    return false
  }

  if (mode === "preview") {
    return true
  }

  if (mode === "export") {
    return state.dotMatrixAnimation.exportAnimatedSvg
  }

  return false
}

type DotClipLayer = {
  element: SVGRectElement
  fill: string
  shapes: SVGElement[]
}

type DotMatrixMetrics = {
  cellSize: number
  maxCol: number
  maxRow: number
  originX: number
  originY: number
}

type DotMatrixCoordinates = {
  col: number
  row: number
}

type DotMatrixAnchor = {
  size?: number
  x: number
  y: number
}

function getDotClipLayers(svg: SVGElement): DotClipLayer[] {
  return Array.from(svg.querySelectorAll("rect"))
    .map((element) => {
      const clipPathId = getClipPathId(element.getAttribute("clip-path"))

      if (!clipPathId?.startsWith(DOTS_CLIP_PATH_PREFIX)) {
        return null
      }

      const clipPath = Array.from(svg.querySelectorAll("clipPath")).find(
        (candidate) => candidate.getAttribute("id") === clipPathId,
      )

      if (!clipPath) {
        return null
      }

      const shapes = Array.from(clipPath.children).filter(
        (child): child is SVGElement => isSvgElementLike(child),
      )

      if (shapes.length === 0) {
        return null
      }

      return {
        element,
        fill: element.getAttribute("fill") ?? "currentColor",
        shapes,
      } satisfies DotClipLayer
    })
    .filter((layer): layer is DotClipLayer => layer !== null)
}

function getClipPathId(clipPath: string | null) {
  return /url\(['"]?#([^'")]+)['"]?\)/.exec(clipPath ?? "")?.[1] ?? null
}

function isSvgElementLike(node: Element): node is SVGElement {
  return typeof node.getAttribute === "function" && typeof node.setAttribute === "function"
}

function collectDotMatrixMetrics(dotShapes: SVGElement[]): DotMatrixMetrics | null {
  const anchors = dotShapes
    .map((shape) => getDotMatrixAnchor(shape))
    .filter((anchor): anchor is DotMatrixAnchor => anchor !== null)

  if (anchors.length === 0) {
    return null
  }

  const explicitSizes = anchors
    .map((anchor) => anchor.size)
    .filter((size): size is number => size !== undefined && Number.isFinite(size) && size > 0)
  const cellSize =
    explicitSizes.length > 0
      ? Math.min(...explicitSizes)
      : getSmallestPositiveDelta([
          ...anchors.map((anchor) => anchor.x),
          ...anchors.map((anchor) => anchor.y),
        ])

  if (!Number.isFinite(cellSize) || cellSize <= 0) {
    return null
  }

  const originX = Math.min(...anchors.map((anchor) => anchor.x))
  const originY = Math.min(...anchors.map((anchor) => anchor.y))
  const coordinates = anchors.map((anchor) => ({
    col: Math.max(0, Math.round((anchor.x - originX) / cellSize)),
    row: Math.max(0, Math.round((anchor.y - originY) / cellSize)),
  }))

  return {
    cellSize,
    maxCol: Math.max(...coordinates.map((coordinate) => coordinate.col)),
    maxRow: Math.max(...coordinates.map((coordinate) => coordinate.row)),
    originX,
    originY,
  }
}

function resolveDotMatrixCoordinates(shape: SVGElement, metrics: DotMatrixMetrics) {
  const anchor = getDotMatrixAnchor(shape)

  if (!anchor) {
    return null
  }

  return {
    col: Math.max(0, Math.round((anchor.x - metrics.originX) / metrics.cellSize)),
    row: Math.max(0, Math.round((anchor.y - metrics.originY) / metrics.cellSize)),
  }
}

function getDotMatrixAnchor(shape: SVGElement): DotMatrixAnchor | null {
  if (shape.tagName.toLowerCase() === "rect") {
    const x = getDotNumericAttribute(shape, "x")
    const y = getDotNumericAttribute(shape, "y")
    const width = getDotNumericAttribute(shape, "width")
    const height = getDotNumericAttribute(shape, "height")

    if (x !== null && y !== null && width !== null && height !== null) {
      return { size: Math.min(width, height), x, y }
    }
  }

  if (shape.tagName.toLowerCase() === "circle") {
    const cx = getDotNumericAttribute(shape, "cx")
    const cy = getDotNumericAttribute(shape, "cy")
    const r = getDotNumericAttribute(shape, "r")

    if (cx !== null && cy !== null && r !== null) {
      return { size: r * 2, x: cx - r, y: cy - r }
    }
  }

  if (shape.tagName.toLowerCase() === "path") {
    return getPathAnchor(shape.getAttribute("d"))
  }

  return null
}

function getPathAnchor(pathDefinition: string | null): DotMatrixAnchor | null {
  if (!pathDefinition) {
    return null
  }

  const match =
    /M\s*([+-]?(?:\d+\.?\d*|\.\d+))[\s,]+([+-]?(?:\d+\.?\d*|\.\d+))/.exec(pathDefinition)

  if (!match) {
    return null
  }

  const x = Number(match[1])
  const y = Number(match[2])

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }

  return { x, y }
}

function getDotNumericAttribute(shape: SVGElement, attributeName: string) {
  const value = shape.getAttribute(attributeName)

  if (value === null) {
    return null
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function getSmallestPositiveDelta(values: number[]) {
  const uniqueValues = Array.from(new Set(values.filter(Number.isFinite))).sort((a, b) => a - b)
  let smallestDelta = Number.POSITIVE_INFINITY

  for (let index = 1; index < uniqueValues.length; index += 1) {
    const delta = uniqueValues[index] - uniqueValues[index - 1]

    if (delta > 0 && delta < smallestDelta) {
      smallestDelta = delta
    }
  }

  return smallestDelta
}

function getDotMatrixAnimationDuration(animation: QrDotMatrixAnimationOptions) {
  return formatSvgNumber(4.7 - Math.min(5, Math.max(1, animation.speed)) * 0.58)
}

function getDotMatrixModuleStyle(
  coordinates: DotMatrixCoordinates,
  metrics: DotMatrixMetrics,
) {
  const centerRow = metrics.maxRow / 2
  const centerCol = metrics.maxCol / 2
  const rowN = metrics.maxRow > 0 ? coordinates.row / metrics.maxRow : 0
  const colN = metrics.maxCol > 0 ? coordinates.col / metrics.maxCol : 0
  const diagonal = rowN + colN
  const distance = Math.hypot(coordinates.row - centerRow, coordinates.col - centerCol)
  const maxDistance = Math.max(1, Math.hypot(centerRow, centerCol))
  const ring = distance / maxDistance
  const angle = Math.atan2(coordinates.row - centerRow, coordinates.col - centerCol)
  const index = coordinates.row * (metrics.maxCol + 1) + coordinates.col

  return [
    `--qr-dot-row:${coordinates.row}`,
    `--qr-dot-col:${coordinates.col}`,
    `--qr-dot-index:${index}`,
    `--qr-dot-row-n:${formatSvgNumber(rowN)}`,
    `--qr-dot-col-n:${formatSvgNumber(colN)}`,
    `--qr-dot-diagonal:${formatSvgNumber(diagonal)}`,
    `--qr-dot-ring:${formatSvgNumber(ring)}`,
    `--qr-dot-angle:${formatSvgNumber(angle)}`,
    `--qr-dot-distance:${formatSvgNumber(distance)}`,
    `--qr-dot-order:${formatSvgNumber(((coordinates.row * 2 + coordinates.col * 3) % 17) / 17)}`,
  ].join(";")
}

function shouldRenderDotMatrixOverlayModule(
  coordinates: DotMatrixCoordinates,
  metrics: DotMatrixMetrics,
  pattern: QrDotMatrixAnimationOptions["pattern"],
) {
  if (pattern === "full") {
    return true
  }

  const centerRow = metrics.maxRow / 2
  const centerCol = metrics.maxCol / 2
  const rowDistance = Math.abs(coordinates.row - centerRow)
  const colDistance = Math.abs(coordinates.col - centerCol)
  const distance = Math.hypot(rowDistance, colDistance)
  const maxDistance = Math.max(1, Math.hypot(centerRow, centerCol))
  const ring = distance / maxDistance
  const edgeDistance = Math.min(
    coordinates.row,
    coordinates.col,
    metrics.maxRow - coordinates.row,
    metrics.maxCol - coordinates.col,
  )

  if (pattern === "outline") {
    return edgeDistance <= 1
  }

  if (pattern === "diamond") {
    return (
      Math.abs(rowDistance - colDistance) <= 1 ||
      rowDistance + colDistance <= Math.max(2, Math.min(metrics.maxRow, metrics.maxCol) * 0.18)
    )
  }

  if (pattern === "cross") {
    return Math.abs(coordinates.row - centerRow) <= 1 || Math.abs(coordinates.col - centerCol) <= 1
  }

  if (pattern === "rings") {
    return Math.abs((ring * 5) % 1 - 0.5) > 0.25
  }

  if (pattern === "rose") {
    const angle = Math.atan2(coordinates.row - centerRow, coordinates.col - centerCol)

    return Math.cos(angle * 4) * 0.35 + 0.55 > ring
  }

  return true
}

function resolveDotMatrixColor(state: QrStudioState) {
  const animation = state.dotMatrixAnimation

  if (animation.colorPreset === "theme") {
    return animation.customColor || state.dotsOptions.color || "#22d3ee"
  }

  const presetColors: Record<QrDotMatrixAnimationOptions["colorPreset"], string> = {
    aurora: "#a78bfa",
    fire: "#fb7185",
    mint: "#34d399",
    neon: "#22d3ee",
    ocean: "#38bdf8",
    prism: "#f0abfc",
    sunset: "#fb923c",
    theme: animation.customColor || state.dotsOptions.color || "#22d3ee",
  }

  return presetColors[animation.colorPreset]
}

function createDotMatrixAnimationStyle(document: Document) {
  const style = document.createElementNS(SVG_NS, "style")

  style.setAttribute("data-qr-layer", "dot-matrix-animation")
  style.textContent = `
.qr-dot-matrix-layer {
  pointer-events: none;
}
.qr-dot-matrix-module {
  animation-duration: var(--qr-dot-matrix-duration);
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  filter: drop-shadow(0 0 calc(8px * var(--qr-dot-matrix-halo)) var(--qr-dot-matrix-color));
  opacity: var(--qr-dot-matrix-opacity-base);
  transform-box: fill-box;
  transform-origin: center;
}
.qr-dot-matrix-muted .qr-dot-matrix-module {
  opacity: calc(var(--qr-dot-matrix-opacity-base) * 0.65);
}
.qr-dot-matrix-bloom .qr-dot-matrix-module {
  filter: drop-shadow(0 0 calc(4px + 10px * var(--qr-dot-matrix-halo)) var(--qr-dot-matrix-color));
}
.qr-dot-matrix-hover:not(:hover) .qr-dot-matrix-module {
  animation-play-state: paused;
}
.qr-dot-shape-diamond .qr-dot-matrix-module {
  transform: scale(var(--qr-dot-matrix-scale)) rotate(45deg);
}
.qr-dot-shape-circle .qr-dot-matrix-module,
.qr-dot-shape-square .qr-dot-matrix-module,
.qr-dot-shape-hearts .qr-dot-matrix-module {
  transform: scale(var(--qr-dot-matrix-scale));
}
.qr-dot-loader-neon-drift .qr-dot-matrix-module { animation-name: qr-dot-loader-pulse; animation-delay: calc((var(--qr-dot-diagonal) + var(--qr-dot-order)) * -0.42s); }
.qr-dot-loader-pulse-ladder .qr-dot-matrix-module { animation-name: qr-dot-loader-step; animation-delay: calc(var(--qr-dot-row-n) * -1.4s); }
.qr-dot-loader-core-spiral .qr-dot-matrix-module { animation-name: qr-dot-loader-spin; animation-delay: calc((var(--qr-dot-angle) + var(--qr-dot-ring) * 4) * -0.22s); }
.qr-dot-loader-twin-orbit .qr-dot-matrix-module { animation-name: qr-dot-loader-orbit; animation-delay: calc((var(--qr-dot-ring) + var(--qr-dot-col-n)) * -0.9s); }
.qr-dot-loader-prism-sweep .qr-dot-matrix-module { animation-name: qr-dot-loader-sweep; animation-delay: calc(var(--qr-dot-col-n) * -1.6s); }
.qr-dot-loader-flux-columns .qr-dot-matrix-module { animation-name: qr-dot-loader-bars; animation-delay: calc(var(--qr-dot-col) * -0.08s); }
.qr-dot-loader-block-drop .qr-dot-matrix-module { animation-name: qr-dot-loader-drop; animation-delay: calc((1 - var(--qr-dot-row-n)) * -1.2s); }
.qr-dot-loader-strobe-stack .qr-dot-matrix-module { animation-name: qr-dot-loader-strobe; animation-delay: calc(var(--qr-dot-order) * -0.8s); }
.qr-dot-loader-glyph-pulse .qr-dot-matrix-module { animation-name: qr-dot-loader-glyph; animation-delay: calc(var(--qr-dot-order) * -1.8s); }
.qr-dot-loader-crt-glide .qr-dot-matrix-module { animation-name: qr-dot-loader-crt; animation-delay: calc((var(--qr-dot-row-n) + var(--qr-dot-col-n) * 0.35) * -1.6s); }
.qr-dot-loader-echo-ring .qr-dot-matrix-module { animation-name: qr-dot-loader-ring; animation-delay: calc(var(--qr-dot-ring) * -1.8s); }
.qr-dot-loader-origin-wave .qr-dot-matrix-module { animation-name: qr-dot-loader-wave; animation-delay: calc(var(--qr-dot-distance) * -0.08s); }
.qr-dot-loader-core-rotor .qr-dot-matrix-module { animation-name: qr-dot-loader-rotor; animation-delay: calc(var(--qr-dot-angle) * -0.28s); }
.qr-dot-loader-prism-bloom .qr-dot-matrix-module { animation-name: qr-dot-loader-bloom; animation-delay: calc((var(--qr-dot-ring) + var(--qr-dot-order)) * -1s); }
.qr-dot-loader-helix-glow .qr-dot-matrix-module { animation-name: qr-dot-loader-helix; animation-delay: calc((var(--qr-dot-row-n) * 2 - var(--qr-dot-col-n)) * -1.1s); }
.qr-dot-loader-helix-core .qr-dot-matrix-module { animation-name: qr-dot-loader-core; animation-delay: calc((var(--qr-dot-col-n) * 2 + var(--qr-dot-row-n)) * -1s); }
.qr-dot-loader-half-helix .qr-dot-matrix-module { animation-name: qr-dot-loader-half; animation-delay: calc((var(--qr-dot-col-n) + var(--qr-dot-ring)) * -1.2s); }
.qr-dot-loader-sound-bars .qr-dot-matrix-module { animation-name: qr-dot-loader-bars; animation-delay: calc(var(--qr-dot-col) * -0.11s); }
.qr-dot-loader-infinity-run .qr-dot-matrix-module { animation-name: qr-dot-loader-infinity; animation-delay: calc((var(--qr-dot-row-n) + var(--qr-dot-col-n)) * -1.1s); }
.qr-dot-loader-mobius-run .qr-dot-matrix-module { animation-name: qr-dot-loader-mobius; animation-delay: calc((var(--qr-dot-diagonal) + var(--qr-dot-ring)) * -0.8s); }
@keyframes qr-dot-loader-pulse { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 42% { opacity: var(--qr-dot-matrix-opacity-peak); transform: scale(calc(var(--qr-dot-matrix-scale) * 1.14)); } 66% { opacity: var(--qr-dot-matrix-opacity-mid); } }
@keyframes qr-dot-loader-step { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 35%, 55% { opacity: var(--qr-dot-matrix-opacity-peak); } 72% { opacity: var(--qr-dot-matrix-opacity-mid); } }
@keyframes qr-dot-loader-spin { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); transform: scale(var(--qr-dot-matrix-scale)) rotate(0deg); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); transform: scale(calc(var(--qr-dot-matrix-scale) * 1.2)) rotate(90deg); } }
@keyframes qr-dot-loader-orbit { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 25%, 75% { opacity: var(--qr-dot-matrix-opacity-mid); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); } }
@keyframes qr-dot-loader-sweep { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 45% { opacity: var(--qr-dot-matrix-opacity-peak); } 58% { opacity: var(--qr-dot-matrix-opacity-mid); } }
@keyframes qr-dot-loader-bars { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); transform: scaleY(calc(var(--qr-dot-matrix-scale) * 0.72)); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); transform: scaleY(calc(var(--qr-dot-matrix-scale) * 1.28)); } }
@keyframes qr-dot-loader-drop { 0% { opacity: var(--qr-dot-matrix-opacity-base); transform: translateY(-12%) scale(var(--qr-dot-matrix-scale)); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); transform: translateY(0) scale(calc(var(--qr-dot-matrix-scale) * 1.08)); } 100% { opacity: var(--qr-dot-matrix-opacity-base); transform: translateY(12%) scale(var(--qr-dot-matrix-scale)); } }
@keyframes qr-dot-loader-strobe { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 12%, 20%, 52% { opacity: var(--qr-dot-matrix-opacity-peak); } 16%, 44% { opacity: var(--qr-dot-matrix-opacity-mid); } }
@keyframes qr-dot-loader-glyph { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); transform: scale(var(--qr-dot-matrix-scale)); } 40% { opacity: var(--qr-dot-matrix-opacity-peak); transform: scale(calc(var(--qr-dot-matrix-scale) * 0.78)); } }
@keyframes qr-dot-loader-crt { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 48% { opacity: var(--qr-dot-matrix-opacity-peak); } 54% { opacity: var(--qr-dot-matrix-opacity-mid); } }
@keyframes qr-dot-loader-ring { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); transform: scale(calc(var(--qr-dot-matrix-scale) * 1.16)); } }
@keyframes qr-dot-loader-wave { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 46% { opacity: var(--qr-dot-matrix-opacity-peak); } 62% { opacity: var(--qr-dot-matrix-opacity-mid); } }
@keyframes qr-dot-loader-rotor { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); transform: scale(var(--qr-dot-matrix-scale)) rotate(0deg); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); transform: scale(calc(var(--qr-dot-matrix-scale) * 1.1)) rotate(180deg); } }
@keyframes qr-dot-loader-bloom { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); filter: drop-shadow(0 0 calc(9px + 12px * var(--qr-dot-matrix-halo)) var(--qr-dot-matrix-color)); } }
@keyframes qr-dot-loader-helix { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 35%, 65% { opacity: var(--qr-dot-matrix-opacity-peak); } }
@keyframes qr-dot-loader-core { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); transform: scale(calc(var(--qr-dot-matrix-scale) * 1.12)); } }
@keyframes qr-dot-loader-half { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 45% { opacity: var(--qr-dot-matrix-opacity-peak); } 60% { opacity: var(--qr-dot-matrix-opacity-mid); } }
@keyframes qr-dot-loader-infinity { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); } 40%, 60% { opacity: var(--qr-dot-matrix-opacity-peak); } }
@keyframes qr-dot-loader-mobius { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); transform: scale(var(--qr-dot-matrix-scale)) rotate(0deg); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); transform: scale(calc(var(--qr-dot-matrix-scale) * 1.08)) rotate(135deg); } }
@media (prefers-reduced-motion: reduce) {
  .qr-dot-matrix-layer {
    display: none;
  }
  .qr-dot-matrix-module {
    animation: none;
    opacity: 0;
  }
}`

  return style
}

function findDotMatrixLayerAnchor(svg: SVGElement) {
  return Array.from(svg.children).find((child) => {
    if (!isSvgElementLike(child)) {
      return false
    }

    if (child.tagName.toLowerCase() === "image") {
      return true
    }

    const clipPath = child.getAttribute("clip-path") ?? ""

    return clipPath.includes("clip-path-corners-square-color-")
  }) ?? null
}

function createBackgroundShapeExtension(
  shape: QrBackgroundShapeDefinition,
  state: Pick<QrStudioState, "backgroundGradient" | "backgroundOptions" | "backgroundShapeOptions">,
): ExtensionFunction {
  return (svg, options) => {
    const document = svg.ownerDocument

    if (!document) {
      return
    }

    svg.querySelectorAll('[data-qr-layer="background-shape"]').forEach((node) => {
      node.remove()
    })
    svg.querySelectorAll('[data-qr-layer="background-shape-gradient"]').forEach((node) => {
      node.remove()
    })
    svg.querySelectorAll('[data-qr-layer="background-shape-blur"]').forEach((node) => {
      node.remove()
    })
    svg.querySelectorAll('[data-qr-layer="background-shape-blur-filter"]').forEach((node) => {
      node.remove()
    })

    const width = options.width ?? 300
    const height = options.height ?? 300
    const shapeOptions = normalizeBackgroundShapeOptions(state.backgroundShapeOptions)
    const metrics = getBackgroundRenderMetrics(width, height, shapeOptions)
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    const transform = getBackgroundShapeTransform(
      shape,
      metrics.backingRegion,
    )
    const fill = getBackgroundShapeFill(svg, state, metrics.outerWidth, metrics.outerHeight)

    applySvgRenderBounds(svg, metrics)
    const insertReference = wrapQrContent(svg, metrics.translateX, metrics.translateY)

    path.setAttribute("data-qr-layer", "background-shape")
    path.setAttribute("d", shape.path)
    path.setAttribute("transform", transform)
    path.setAttribute("fill", fill)
    applyBackgroundShapeStroke(path, shapeOptions)

    const blurPath = createBackgroundShapeBlurPath({
      d: shape.path,
      metrics,
      shapeOptions,
      svg,
      transform,
    })

    if (blurPath) {
      svg.insertBefore(blurPath, insertReference)
    }

    svg.insertBefore(path, insertReference)
  }
}

function normalizeBackgroundShapeOptions(
  options:
    | (Partial<QrStudioState["backgroundShapeOptions"]> & {
        sizePercent?: number
      })
    | undefined,
) {
  const legacyPaddingPx =
    options?.paddingPx === undefined && typeof options?.sizePercent === "number"
      ? getLegacyBackgroundShapePaddingPx(options.sizePercent)
      : undefined

  return {
    ...DEFAULT_BACKGROUND_SHAPE_OPTIONS,
    ...options,
    edgeBlur: coerceNonNegativeSvgNumber(
      options?.edgeBlur ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.edgeBlur,
      DEFAULT_BACKGROUND_SHAPE_OPTIONS.edgeBlur,
    ),
    paddingPx: coerceNonNegativeSvgNumber(
      options?.paddingPx ?? legacyPaddingPx ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.paddingPx,
      DEFAULT_BACKGROUND_SHAPE_OPTIONS.paddingPx,
    ),
    shadowColor: options?.shadowColor ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowColor,
    shadowOffsetX: clampBackgroundShapeOffset(
      options?.shadowOffsetX ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetX,
    ),
    shadowOffsetY: clampBackgroundShapeOffset(
      options?.shadowOffsetY ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetY,
    ),
    shadowOpacity: clampBackgroundShapeOpacity(
      options?.shadowOpacity ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOpacity,
    ),
    strokeOpacity: clampBackgroundShapeOpacity(
      options?.strokeOpacity ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeOpacity,
    ),
    strokeWidth: coerceNonNegativeSvgNumber(
      options?.strokeWidth ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeWidth,
      DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeWidth,
    ),
  }
}

function coerceNonNegativeSvgNumber(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.max(0, value)
}

function getLegacyBackgroundShapePaddingPx(sizePercent: number) {
  if (!Number.isFinite(sizePercent) || sizePercent <= 100) {
    return 0
  }

  return clampBackgroundShapePaddingPx(((sizePercent - 100) / 200) * 240)
}

function applyBackgroundShapeStroke(
  path: Element,
  shapeOptions: ReturnType<typeof normalizeBackgroundShapeOptions>,
) {
  if (shapeOptions.strokeWidth <= 0) {
    path.removeAttribute("stroke")
    path.removeAttribute("stroke-width")
    path.removeAttribute("stroke-opacity")
    path.removeAttribute("stroke-linejoin")
    return
  }

  path.setAttribute("stroke", shapeOptions.strokeColor)
  path.setAttribute("stroke-width", formatSvgNumber(shapeOptions.strokeWidth))
  path.setAttribute("stroke-opacity", formatSvgNumber(shapeOptions.strokeOpacity / 100))
  path.setAttribute("stroke-linejoin", "round")
}

function hasActiveBackgroundSurfaceOptions(
  options: Partial<QrStudioState["backgroundShapeOptions"]> | undefined,
) {
  return hasActiveBackgroundShapeOptions(normalizeBackgroundShapeOptions(options))
}

type BackgroundRenderMetrics = {
  backingRegion: {
    height: number
    width: number
    x: number
    y: number
  }
  bottomEffectOutset: number
  outerHeight: number
  outerWidth: number
  leftEffectOutset: number
  rightEffectOutset: number
  shapeOutset: number
  topEffectOutset: number
  totalOutset: number
  translateX: number
  translateY: number
}

function getBackgroundRenderMetrics(
  width: number,
  height: number,
  shapeOptions: ReturnType<typeof normalizeBackgroundShapeOptions>,
): BackgroundRenderMetrics {
  const shapeOutset = shapeOptions.paddingPx
  const strokeOutset = Math.ceil(shapeOptions.strokeWidth / 2)
  const shadowGeometryIsActive =
    shapeOptions.edgeBlur > 0 ||
    shapeOptions.shadowOffsetX !== 0 ||
    shapeOptions.shadowOffsetY !== 0
  const shadowAlphaOutset = shadowGeometryIsActive
    ? strokeOutset + Math.ceil(shapeOptions.edgeBlur * 2)
    : strokeOutset
  const leftEffectOutset = Math.max(strokeOutset, shadowAlphaOutset - shapeOptions.shadowOffsetX)
  const rightEffectOutset = Math.max(strokeOutset, shadowAlphaOutset + shapeOptions.shadowOffsetX)
  const topEffectOutset = Math.max(strokeOutset, shadowAlphaOutset - shapeOptions.shadowOffsetY)
  const bottomEffectOutset = Math.max(strokeOutset, shadowAlphaOutset + shapeOptions.shadowOffsetY)
  const translateX = shapeOutset + leftEffectOutset
  const translateY = shapeOutset + topEffectOutset

  return {
    backingRegion: {
      height: height + shapeOutset * 2,
      width: width + shapeOutset * 2,
      x: leftEffectOutset,
      y: topEffectOutset,
    },
    bottomEffectOutset,
    leftEffectOutset,
    outerHeight: height + shapeOutset * 2 + topEffectOutset + bottomEffectOutset,
    outerWidth: width + shapeOutset * 2 + leftEffectOutset + rightEffectOutset,
    rightEffectOutset,
    shapeOutset,
    topEffectOutset,
    totalOutset: Math.max(translateX, translateY),
    translateX,
    translateY,
  }
}

export function getQrBackgroundRenderMetrics(
  state: Pick<QrStudioState, "backgroundShapeOptions" | "height" | "width">,
) {
  return getBackgroundRenderMetrics(
    clampQrSize(state.width),
    clampQrSize(state.height),
    normalizeBackgroundShapeOptions(state.backgroundShapeOptions),
  )
}

export function getQrRenderedDimensions(
  state: Pick<
    QrStudioState,
    "backgroundImage" | "backgroundShapeId" | "backgroundShapeOptions" | "height" | "width"
  >,
) {
  const width = clampQrSize(state.width)
  const height = clampQrSize(state.height)

  if (
    getAssetValue(state.backgroundImage) ||
    (state.backgroundShapeId === "none" &&
      !hasActiveBackgroundSurfaceOptions(state.backgroundShapeOptions))
  ) {
    return {
      height,
      width,
    }
  }

  const metrics = getBackgroundRenderMetrics(
    width,
    height,
    normalizeBackgroundShapeOptions(state.backgroundShapeOptions),
  )

  return {
    height: metrics.outerHeight,
    width: metrics.outerWidth,
  }
}

export function scaleQrBackgroundShapeOptions(
  options: QrStudioState["backgroundShapeOptions"],
  scale: number,
): QrStudioState["backgroundShapeOptions"] {
  const shapeOptions = normalizeBackgroundShapeOptions(options)

  return {
    ...shapeOptions,
    edgeBlur: coerceNonNegativeSvgNumber(shapeOptions.edgeBlur * scale, shapeOptions.edgeBlur),
    paddingPx: coerceNonNegativeSvgNumber(shapeOptions.paddingPx * scale, shapeOptions.paddingPx),
    shadowOffsetX: coerceSvgNumber(shapeOptions.shadowOffsetX * scale, shapeOptions.shadowOffsetX),
    shadowOffsetY: coerceSvgNumber(shapeOptions.shadowOffsetY * scale, shapeOptions.shadowOffsetY),
    strokeWidth: coerceNonNegativeSvgNumber(
      shapeOptions.strokeWidth * scale,
      shapeOptions.strokeWidth,
    ),
  }
}

function applySvgRenderBounds(svg: SVGElement, metrics: BackgroundRenderMetrics) {
  svg.setAttribute("width", formatSvgNumber(metrics.outerWidth))
  svg.setAttribute("height", formatSvgNumber(metrics.outerHeight))
  svg.setAttribute(
    "viewBox",
    `0 0 ${formatSvgNumber(metrics.outerWidth)} ${formatSvgNumber(metrics.outerHeight)}`,
  )
}

function coerceSvgNumber(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return value
}

function wrapQrContent(svg: SVGElement, translateX: number, translateY: number) {
  if (translateX <= 0 && translateY <= 0) {
    return getFirstDrawableSvgChild(svg)
  }

  const existingGroup = svg.querySelector('[data-qr-layer="qr-content"]')

  if (existingGroup) {
    existingGroup.setAttribute(
      "transform",
      `translate(${formatSvgNumber(translateX)} ${formatSvgNumber(translateY)})`,
    )
    return existingGroup
  }

  const document = svg.ownerDocument
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
  const children = Array.from(svg.children).filter(
    (child) =>
      child.tagName.toLowerCase() !== "defs" && !isManagedBackgroundLayer(child),
  )

  group.setAttribute("data-qr-layer", "qr-content")
  group.setAttribute(
    "transform",
    `translate(${formatSvgNumber(translateX)} ${formatSvgNumber(translateY)})`,
  )

  for (const child of children) {
    group.appendChild(child)
  }

  svg.appendChild(group)

  return group
}

function getFirstDrawableSvgChild(svg: SVGElement) {
  return (
    Array.from(svg.children).find(
      (child) =>
        child.tagName.toLowerCase() !== "defs" && !isManagedBackgroundLayer(child),
    ) ?? null
  )
}

function isManagedBackgroundLayer(node: Element) {
  const layer = node.getAttribute("data-qr-layer")

  return Boolean(layer?.startsWith("background-"))
}

function createBackgroundSurfaceExtension(
  state: Pick<QrStudioState, "backgroundGradient" | "backgroundOptions" | "backgroundShapeOptions">,
): ExtensionFunction {
  return (svg, options) => {
    const document = svg.ownerDocument

    if (!document) {
      return
    }

    svg.querySelectorAll('[data-qr-layer="background-surface-blur"]').forEach((node) => {
      node.remove()
    })
    svg.querySelectorAll('[data-qr-layer="background-surface-blur-filter"]').forEach((node) => {
      node.remove()
    })

    const width = options.width ?? 300
    const height = options.height ?? 300
    const shapeOptions = normalizeBackgroundShapeOptions(state.backgroundShapeOptions)
    const metrics = getBackgroundRenderMetrics(width, height, shapeOptions)
    const region = metrics.backingRegion
    const radius = (Math.min(region.width, region.height) / 2) * state.backgroundOptions.round
    const backgroundRect =
      getQrBackgroundSurfaceRect(svg) ??
      document.createElementNS("http://www.w3.org/2000/svg", "rect")
    const fill = getBackgroundShapeFill(svg, state, metrics.outerWidth, metrics.outerHeight)

    backgroundRect.remove()
    backgroundRect.setAttribute("data-qr-layer", "background-surface")
    backgroundRect.setAttribute("fill", fill)
    backgroundRect.removeAttribute("clip-path")
    applySvgRenderBounds(svg, metrics)
    const insertReference = wrapQrContent(svg, metrics.translateX, metrics.translateY)

    applyBackgroundSurfaceRect(backgroundRect, region, radius)
    applyBackgroundShapeStroke(backgroundRect, shapeOptions)

    const blurRect = createBackgroundSurfaceBlurRect({
      radius,
      region,
      shapeOptions,
      svg,
    })

    if (blurRect) {
      svg.insertBefore(blurRect, insertReference)
    }

    svg.insertBefore(backgroundRect, insertReference)
  }
}

function getQrBackgroundSurfaceRect(svg: SVGElement) {
  return Array.from(svg.children).find(
    (child) =>
      child.tagName.toLowerCase() === "rect" &&
      child.getAttribute("data-qr-layer") !== "background-surface-blur",
  )
}

function applyBackgroundSurfaceRect(
  rect: Element,
  region: BackgroundRenderMetrics["backingRegion"],
  radius: number,
) {
  rect.setAttribute("x", formatSvgNumber(region.x))
  rect.setAttribute("y", formatSvgNumber(region.y))
  rect.setAttribute("width", formatSvgNumber(region.width))
  rect.setAttribute("height", formatSvgNumber(region.height))
  rect.setAttribute("rx", formatSvgNumber(radius))
  rect.setAttribute("ry", formatSvgNumber(radius))
}

function createBackgroundSurfaceBlurRect({
  radius,
  region,
  shapeOptions,
  svg,
}: {
  radius: number
  region: BackgroundRenderMetrics["backingRegion"]
  shapeOptions: ReturnType<typeof normalizeBackgroundShapeOptions>
  svg: SVGElement
}) {
  if (!hasActiveBackgroundShapeShadow(shapeOptions)) {
    return null
  }

  const document = svg.ownerDocument

  if (!document) {
    return null
  }

  const filterId = "background-surface-blur-filter"
  const filter = createBackgroundShapeShadowFilter({
    filterId,
    layer: "background-surface-blur-filter",
    metrics: {
      height: region.height + shapeOptions.edgeBlur * 4 + Math.abs(shapeOptions.shadowOffsetY),
      width: region.width + shapeOptions.edgeBlur * 4 + Math.abs(shapeOptions.shadowOffsetX),
      x: 0,
      y: 0,
    },
    shapeOptions,
    svg,
  })

  getOrCreateSvgDefs(svg).appendChild(filter)

  const blurRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")

  blurRect.setAttribute("data-qr-layer", "background-surface-blur")
  blurRect.setAttribute("fill", shapeOptions.shadowColor)
  blurRect.setAttribute("filter", `url('#${filterId}')`)
  applyBackgroundShapeShadowSourceStroke(blurRect, shapeOptions)
  applyBackgroundSurfaceRect(blurRect, region, radius)

  return blurRect
}

function createBackgroundShapeBlurPath({
  d,
  metrics,
  shapeOptions,
  svg,
  transform,
}: {
  d: string
  metrics: BackgroundRenderMetrics
  shapeOptions: ReturnType<typeof normalizeBackgroundShapeOptions>
  svg: SVGElement
  transform: string
}) {
  if (!hasActiveBackgroundShapeShadow(shapeOptions)) {
    return null
  }

  const document = svg.ownerDocument

  if (!document) {
    return null
  }

  const filterId = "background-shape-blur-filter"
  const filter = createBackgroundShapeShadowFilter({
    filterId,
    layer: "background-shape-blur-filter",
    metrics: {
      height: metrics.outerHeight,
      width: metrics.outerWidth,
      x: 0,
      y: 0,
    },
    shapeOptions,
    svg,
  })

  getOrCreateSvgDefs(svg).appendChild(filter)

  const blurPath = document.createElementNS("http://www.w3.org/2000/svg", "path")

  blurPath.setAttribute("data-qr-layer", "background-shape-blur")
  blurPath.setAttribute("d", d)
  blurPath.setAttribute("fill", shapeOptions.shadowColor)
  blurPath.setAttribute("filter", `url('#${filterId}')`)
  blurPath.setAttribute("transform", transform)
  applyBackgroundShapeShadowSourceStroke(blurPath, shapeOptions)

  return blurPath
}

function hasActiveBackgroundShapeShadow(
  shapeOptions: ReturnType<typeof normalizeBackgroundShapeOptions>,
) {
  return (
    shapeOptions.shadowOpacity > 0 &&
    (shapeOptions.edgeBlur > 0 ||
      shapeOptions.shadowOffsetX !== 0 ||
      shapeOptions.shadowOffsetY !== 0)
  )
}

function applyBackgroundShapeShadowSourceStroke(
  node: Element,
  shapeOptions: ReturnType<typeof normalizeBackgroundShapeOptions>,
) {
  if (shapeOptions.strokeWidth <= 0) {
    node.removeAttribute("stroke")
    node.removeAttribute("stroke-width")
    node.removeAttribute("stroke-linejoin")
    return
  }

  node.setAttribute("stroke", shapeOptions.shadowColor)
  node.setAttribute("stroke-width", formatSvgNumber(shapeOptions.strokeWidth))
  node.setAttribute("stroke-linejoin", "round")
}

function createBackgroundShapeShadowFilter({
  filterId,
  layer,
  metrics,
  shapeOptions,
  svg,
}: {
  filterId: string
  layer: string
  metrics: {
    height: number
    width: number
    x: number
    y: number
  }
  shapeOptions: ReturnType<typeof normalizeBackgroundShapeOptions>
  svg: SVGElement
}) {
  const document = svg.ownerDocument
  const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
  const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur")
  const offset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset")
  const flood = document.createElementNS("http://www.w3.org/2000/svg", "feFlood")
  const composite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite")

  filter.setAttribute("id", filterId)
  filter.setAttribute("data-qr-layer", layer)
  filter.setAttribute("filterUnits", "userSpaceOnUse")
  filter.setAttribute("x", formatSvgNumber(metrics.x))
  filter.setAttribute("y", formatSvgNumber(metrics.y))
  filter.setAttribute("width", formatSvgNumber(metrics.width))
  filter.setAttribute("height", formatSvgNumber(metrics.height))
  blur.setAttribute("in", "SourceAlpha")
  blur.setAttribute("result", "shadow-blur")
  blur.setAttribute("stdDeviation", formatSvgNumber(shapeOptions.edgeBlur))
  offset.setAttribute("dx", formatSvgNumber(shapeOptions.shadowOffsetX))
  offset.setAttribute("dy", formatSvgNumber(shapeOptions.shadowOffsetY))
  offset.setAttribute("in", "shadow-blur")
  offset.setAttribute("result", "shadow-offset")
  flood.setAttribute("flood-color", shapeOptions.shadowColor)
  flood.setAttribute("flood-opacity", formatSvgNumber(shapeOptions.shadowOpacity / 100))
  flood.setAttribute("result", "shadow-color")
  composite.setAttribute("in", "shadow-color")
  composite.setAttribute("in2", "shadow-offset")
  composite.setAttribute("operator", "in")

  filter.appendChild(blur)
  filter.appendChild(offset)
  filter.appendChild(flood)
  filter.appendChild(composite)

  return filter
}

function getBackgroundShapeFill(
  svg: SVGElement,
  state: Pick<QrStudioState, "backgroundGradient" | "backgroundOptions">,
  width: number,
  height: number,
) {
  if (!state.backgroundGradient.enabled) {
    return state.backgroundOptions.color
  }

  const gradientId = "background-shape-gradient"
  const gradient = createBackgroundShapeGradient(svg, state.backgroundGradient, {
    height,
    id: gradientId,
    width,
  })

  if (gradient) {
    getOrCreateSvgDefs(svg).appendChild(gradient)
    return `url('#${gradientId}')`
  }

  return state.backgroundOptions.color
}

function createBackgroundShapeGradient(
  svg: SVGElement,
  gradient: StudioGradient,
  {
    height,
    id,
    width,
  }: {
    height: number
    id: string
    width: number
  },
) {
  const document = svg.ownerDocument

  if (!document) {
    return null
  }

  const gradientElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    gradient.type === "radial" ? "radialGradient" : "linearGradient",
  )

  gradientElement.setAttribute("id", id)
  gradientElement.setAttribute("data-qr-layer", "background-shape-gradient")
  gradientElement.setAttribute("gradientUnits", "userSpaceOnUse")

  if (gradient.type === "radial") {
    gradientElement.setAttribute("cx", String(width / 2))
    gradientElement.setAttribute("cy", String(height / 2))
    gradientElement.setAttribute("r", String(Math.max(width, height) / 2))
  } else {
    const endpoints = getLinearGradientEndpoints({
      height,
      rotation: gradient.rotation,
      width,
      x: 0,
      y: 0,
    })

    gradientElement.setAttribute("x1", String(endpoints.x1))
    gradientElement.setAttribute("y1", String(endpoints.y1))
    gradientElement.setAttribute("x2", String(endpoints.x2))
    gradientElement.setAttribute("y2", String(endpoints.y2))
  }

  for (const colorStop of gradient.colorStops) {
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop")
    stop.setAttribute("offset", String(colorStop.offset))
    stop.setAttribute("stop-color", colorStop.color)
    gradientElement.appendChild(stop)
  }

  return gradientElement
}

function getBackgroundShapeTransform(
  shape: QrBackgroundShapeDefinition,
  region: BackgroundRenderMetrics["backingRegion"],
) {
  const scale =
    Math.min(region.width / shape.viewBox.width, region.height / shape.viewBox.height)
  const x = region.x + (region.width - shape.viewBox.width * scale) / 2
  const y = region.y + (region.height - shape.viewBox.height * scale) / 2

  return `translate(${formatSvgNumber(x)} ${formatSvgNumber(y)}) scale(${formatSvgNumber(scale)})`
}

function formatSvgNumber(value: number) {
  if (Math.abs(value) < 0.000001) {
    return "0"
  }

  return Number(value.toFixed(4)).toString()
}

function getBackgroundShapeGradientKey(
  state: Pick<QrStudioState, "backgroundGradient" | "backgroundShapeId" | "backgroundShapeOptions">,
) {
  if (
    !state.backgroundGradient.enabled ||
    (state.backgroundShapeId === "none" &&
      !hasActiveBackgroundSurfaceOptions(state.backgroundShapeOptions))
  ) {
    return null
  }

  return state.backgroundGradient
}

export function createAlignedCornerGradientExtension(
  state: Pick<QrStudioState, "cornersDotGradient" | "cornersSquareGradient">,
): ExtensionFunction | null {
  const cornerSquareRotation = getAlignedCornerGradientRotation(
    state.cornersSquareGradient,
  )
  const cornerDotRotation = getAlignedCornerGradientRotation(
    state.cornersDotGradient,
  )

  if (cornerSquareRotation === null && cornerDotRotation === null) {
    return null
  }

  return (svg) => {
    if (cornerSquareRotation !== null) {
      alignCornerGradientDirection(svg, {
        gradientIdPrefix: "corners-square-color-",
        rotation: cornerSquareRotation,
      })
    }

    if (cornerDotRotation !== null) {
      alignCornerGradientDirection(svg, {
        gradientIdPrefix: "corners-dot-color-",
        rotation: cornerDotRotation,
      })
    }
  }
}

function createBackgroundImageExtension(
  imageHref: string,
  backgroundRound: number,
): ExtensionFunction {
  return (svg, options) => {
    const document = svg.ownerDocument

    if (!document) {
      return
    }

    svg.querySelectorAll('[data-qr-layer="background-image"]').forEach((node) => {
      node.remove()
    })
    svg.querySelectorAll('[data-qr-layer="background-image-clip"]').forEach((node) => {
      node.remove()
    })

    const backgroundImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    )
    const width = String(options.width ?? 300)
    const height = String(options.height ?? 300)

    backgroundImage.setAttribute("data-qr-layer", "background-image")
    backgroundImage.setAttribute("href", imageHref)
    backgroundImage.setAttribute("x", "0")
    backgroundImage.setAttribute("y", "0")
    backgroundImage.setAttribute("width", width)
    backgroundImage.setAttribute("height", height)
    backgroundImage.setAttribute("preserveAspectRatio", "xMidYMid slice")
    backgroundImage.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      imageHref,
    )

    const clipPathId = addRoundedBackgroundImageClip(svg, backgroundRound, options)

    if (clipPathId) {
      backgroundImage.setAttribute("clip-path", `url('#${clipPathId}')`)
    }

    const insertReference = getBackgroundImageInsertReference(svg)
    svg.insertBefore(backgroundImage, insertReference)
  }
}

function addRoundedBackgroundImageClip(
  svg: SVGElement,
  backgroundRound: number,
  options: Parameters<ExtensionFunction>[1],
) {
  if (backgroundRound <= 0) {
    return null
  }

  const document = svg.ownerDocument

  if (!document) {
    return null
  }

  const width = options.width ?? 300
  const height = options.height ?? 300
  const size = Math.min(width, height)
  const clipPathId = "clip-path-background-image"
  const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath")
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")

  clipPath.setAttribute("id", clipPathId)
  clipPath.setAttribute("data-qr-layer", "background-image-clip")
  rect.setAttribute("x", String((width - size) / 2))
  rect.setAttribute("y", String((height - size) / 2))
  rect.setAttribute("width", String(size))
  rect.setAttribute("height", String(size))
  rect.setAttribute("rx", String((size / 2) * backgroundRound))
  clipPath.appendChild(rect)
  getOrCreateSvgDefs(svg).appendChild(clipPath)

  return clipPathId
}

function getOrCreateSvgDefs(svg: SVGElement) {
  const existingDefs = Array.from(svg.children).find(
    (child) => child.tagName.toLowerCase() === "defs",
  )

  if (existingDefs) {
    return existingDefs
  }

  const defs = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "defs")
  svg.insertBefore(defs, svg.firstChild)

  return defs
}

function getBackgroundImageInsertReference(svg: SVGElement) {
  const children = Array.from(svg.children)
  const backgroundRectIndex = children.findIndex(
    (child) => child.tagName.toLowerCase() === "rect",
  )

  if (backgroundRectIndex >= 0) {
    return children[backgroundRectIndex + 1] ?? null
  }

  return children.find((child) => child.tagName.toLowerCase() !== "defs") ?? null
}

function getSvgCustomDotShape(state: QrStudioState): CustomDotShape | null {
  if (state.type !== "svg") {
    return null
  }

  return getActiveCustomDotShape(state.dotsOptions.type)
}

function getAlignedCornerGradientKey(
  gradient: Pick<StudioGradient, "enabled" | "rotation" | "type">,
) {
  if (!gradient.enabled || gradient.type !== "linear") {
    return null
  }

  return {
    rotation: gradient.rotation,
    type: gradient.type,
  }
}

function getAlignedCornerGradientRotation(
  gradient: Pick<StudioGradient, "enabled" | "rotation" | "type">,
) {
  if (!gradient.enabled || gradient.type !== "linear") {
    return null
  }

  return gradient.rotation
}

function alignCornerGradientDirection(
  svg: SVGElement,
  {
    gradientIdPrefix,
    rotation,
  }: {
    gradientIdPrefix: string
    rotation: number
  },
) {
  const svgElements = getDescendantElements(svg)

  for (const gradient of svgElements) {
    if (
      gradient.tagName.toLowerCase() !== "lineargradient" ||
      !gradient.getAttribute("id")?.startsWith(gradientIdPrefix)
    ) {
      continue
    }

    const gradientId = gradient.getAttribute("id")

    if (!gradientId) {
      continue
    }

    const fillRect = svgElements.find(
      (element) =>
        element.tagName.toLowerCase() === "rect" &&
        getPaintServerId(element.getAttribute("fill")) === gradientId,
    )

    if (!fillRect) {
      continue
    }

    const region = getElementRegion(fillRect)

    if (!region) {
      continue
    }

    const endpoints = getLinearGradientEndpoints({
      ...region,
      rotation,
    })

    gradient.setAttribute("x1", String(endpoints.x1))
    gradient.setAttribute("y1", String(endpoints.y1))
    gradient.setAttribute("x2", String(endpoints.x2))
    gradient.setAttribute("y2", String(endpoints.y2))
  }
}

function getDescendantElements(root: Element): Element[] {
  const descendants: Element[] = []
  const queue = [...Array.from(root.children)]

  while (queue.length > 0) {
    const element = queue.shift()

    if (!element) {
      continue
    }

    descendants.push(element)
    queue.push(...Array.from(element.children))
  }

  return descendants
}

function getPaintServerId(fillValue: string | null) {
  if (!fillValue) {
    return null
  }

  const match = fillValue.match(/^url\((['"]?)#(.+?)\1\)$/)

  return match?.[2] ?? null
}

function getElementRegion(element: Element) {
  const x = getNumericAttribute(element, "x")
  const y = getNumericAttribute(element, "y")
  const width = getNumericAttribute(element, "width")
  const height = getNumericAttribute(element, "height")

  if (
    x === null ||
    y === null ||
    width === null ||
    height === null ||
    width <= 0 ||
    height <= 0
  ) {
    return null
  }

  return { height, width, x, y }
}

function getNumericAttribute(element: Element, name: string) {
  const value = element.getAttribute(name)

  if (value === null) {
    return null
  }

  const numericValue = Number.parseFloat(value)

  return Number.isFinite(numericValue) ? numericValue : null
}

function getLinearGradientEndpoints({
  height,
  rotation,
  width,
  x,
  y,
}: {
  height: number
  rotation: number
  width: number
  x: number
  y: number
}) {
  const normalizedRotation = (rotation + 2 * Math.PI) % (2 * Math.PI)
  let x1 = x + width / 2
  let y1 = y + height / 2
  let x2 = x + width / 2
  let y2 = y + height / 2

  if (
    (normalizedRotation >= 0 && normalizedRotation <= 0.25 * Math.PI) ||
    (normalizedRotation > 1.75 * Math.PI && normalizedRotation <= 2 * Math.PI)
  ) {
    x1 -= width / 2
    y1 -= (height / 2) * Math.tan(rotation)
    x2 += width / 2
    y2 += (height / 2) * Math.tan(rotation)
  } else if (
    normalizedRotation > 0.25 * Math.PI &&
    normalizedRotation <= 0.75 * Math.PI
  ) {
    y1 -= height / 2
    x1 -= (width / 2) / Math.tan(rotation)
    y2 += height / 2
    x2 += (width / 2) / Math.tan(rotation)
  } else if (
    normalizedRotation > 0.75 * Math.PI &&
    normalizedRotation <= 1.25 * Math.PI
  ) {
    x1 += width / 2
    y1 += (height / 2) * Math.tan(rotation)
    x2 -= width / 2
    y2 -= (height / 2) * Math.tan(rotation)
  } else if (
    normalizedRotation > 1.25 * Math.PI &&
    normalizedRotation <= 1.75 * Math.PI
  ) {
    y1 += height / 2
    x1 += (width / 2) / Math.tan(rotation)
    y2 -= height / 2
    x2 -= (width / 2) / Math.tan(rotation)
  }

  return {
    x1: Math.round(x1),
    x2: Math.round(x2),
    y1: Math.round(y1),
    y2: Math.round(y2),
  }
}
