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
  DEFAULT_DOT_MATRIX_ANIMATION,
  clampQrSize,
  getAssetValue,
  hasActiveBackgroundShapeOptions,
  type QrDotMatrixAnimationOptions,
  type QrDotMatrixSquareLoader,
  type QrStudioState,
  type StudioGradient,
} from "@/components/qr/qr-studio-state"

type QrAnimationRenderMode = "export" | "none" | "preview"

const SVG_NS = "http://www.w3.org/2000/svg"
const DOTS_CLIP_PATH_PREFIX = "clip-path-dot-color-"
const QR_MODULE_CLIP_PATH_PREFIXES = [DOTS_CLIP_PATH_PREFIX]
const DOT_MATRIX_TILE_SIZE = 5
const DOT_MATRIX_QUIET_TRACK_INDEX = -1

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

  return (svg, options) => {
    const document = svg.ownerDocument

    if (!document) {
      return
    }

    svg.querySelectorAll('[data-qr-layer="dot-matrix-animation"]').forEach((node) => {
      node.remove()
    })

    const dotLayers = getQrModuleClipLayers(svg)

    if (dotLayers.length === 0) {
      return
    }

    const dotShapes = dotLayers.flatMap((layer) => layer.shapes)
    const metrics = collectDotMatrixMetrics(dotShapes)

    if (!metrics) {
      return
    }

    const animationColors = resolveDotMatrixColors(state)
    const modules: DotMatrixModule[] = []

    for (const layer of dotLayers) {
      for (const shape of layer.shapes) {
        const coordinates = resolveDotMatrixCoordinates(shape, metrics)

        if (!coordinates) {
          continue
        }

        modules.push(createDotMatrixModule(shape, coordinates, metrics))
      }
    }

    if (modules.length === 0) {
      return
    }

    const tracks = createDotMatrixLoaderTracks(
      modules,
      state.dotMatrixAnimation,
    )

    if (tracks.size === 0) {
      return
    }

    suppressDotMatrixBaseLayers(dotLayers)

    const group = document.createElementNS(SVG_NS, "g")
    group.setAttribute("data-qr-layer", "dot-matrix-animation")
    group.setAttribute(
      "class",
      [
        "qr-dot-matrix-layer",
        `qr-dot-loader-${state.dotMatrixAnimation.loader}`,
        `qr-dot-pattern-${state.dotMatrixAnimation.pattern}`,
      ].filter(Boolean).join(" "),
    )
    group.setAttribute("data-qr-dot-loader", state.dotMatrixAnimation.loader)
    group.appendChild(createDotMatrixAnimationStyle(document, Array.from(tracks.values())))
    const defs = document.createElementNS(SVG_NS, "defs")
    defs.setAttribute("data-qr-layer", "dot-matrix-animation-defs")
    group.appendChild(defs)
    group.setAttribute(
      "style",
      [
        `--qr-dot-matrix-color:${animationColors.base}`,
        `--qr-dot-matrix-color-base:${animationColors.base}`,
        `--qr-dot-matrix-color-mid:${animationColors.mid}`,
        `--qr-dot-matrix-color-peak:${animationColors.peak}`,
        `--qr-dot-matrix-duration:${getDotMatrixAnimationDuration(state.dotMatrixAnimation)}s`,
        `--qr-dot-matrix-opacity-base:${formatSvgOpacity(getDotMatrixBaseOpacity(state.dotMatrixAnimation))}`,
        `--qr-dot-matrix-opacity-mid:${formatSvgOpacity(state.dotMatrixAnimation.opacityMid)}`,
        `--qr-dot-matrix-opacity-peak:${formatSvgOpacity(state.dotMatrixAnimation.opacityPeak)}`,
        `--qr-dot-matrix-scale:${formatSvgNumber(getDotMatrixOverlayScale(state.dotMatrixAnimation) / 100)}`,
      ].join(";"),
    )

    const coverRect = getDotMatrixCoverRect(svg, options, metrics)

    const sortedTracks = Array.from(tracks.values()).sort(
      (left, right) => left.index - right.index || left.topology.localeCompare(right.topology),
    )

    for (const [trackOffset, track] of sortedTracks.entries()) {
      const clipPath = document.createElementNS(SVG_NS, "clipPath")
      const clipPathId = `qr-dot-matrix-animation-clip-${trackOffset}`

      clipPath.setAttribute("id", clipPathId)
      clipPath.setAttribute("data-qr-layer", "dot-matrix-animation-clip")

      for (const qrModule of track.modules) {
        const shape = qrModule.shape.cloneNode(true) as SVGElement
        shape.removeAttribute("clip-path")
        applyDotMatrixOverlayScale(
          shape,
          metrics,
          getDotMatrixOverlayScale(state.dotMatrixAnimation),
        )
        clipPath.appendChild(shape)
      }

      defs.appendChild(clipPath)

      const animatedLayer = document.createElementNS(SVG_NS, "rect")
      animatedLayer.setAttribute("x", formatSvgNumber(coverRect.x))
      animatedLayer.setAttribute("y", formatSvgNumber(coverRect.y))
      animatedLayer.setAttribute("width", formatSvgNumber(coverRect.width))
      animatedLayer.setAttribute("height", formatSvgNumber(coverRect.height))
      animatedLayer.setAttribute("clip-path", `url('#${clipPathId}')`)
      animatedLayer.setAttribute("fill", animationColors.base)
      animatedLayer.setAttribute("data-qr-dot-loader", state.dotMatrixAnimation.loader)
      animatedLayer.setAttribute("data-qr-dot-track", String(track.index))
      animatedLayer.setAttribute("data-qr-dot-keyframes", track.keyframes)
      animatedLayer.setAttribute("data-qr-dot-duration-ms", String(track.durationMs))
      animatedLayer.setAttribute("data-qr-dot-easing", track.timingFunction)
      animatedLayer.setAttribute("data-qr-dot-topology", track.topology)
      animatedLayer.setAttribute("data-qr-dot-upstream-loader", track.upstreamLoader)
      if (track.upstreamClass) {
        animatedLayer.setAttribute("data-qr-dot-upstream-class", track.upstreamClass)
      }
      animatedLayer.setAttribute("data-qr-dot-grid", "5x5")
      animatedLayer.setAttribute("data-qr-dot-region", track.region)
      animatedLayer.setAttribute("data-qr-dot-state", track.state)
      animatedLayer.setAttribute(
        "class",
        track.state === "quiet"
          ? "qr-dot-matrix-track qr-dot-matrix-track-quiet"
          : "qr-dot-matrix-track",
      )
      animatedLayer.setAttribute(
        "style",
        getDotMatrixTrackStyle(track),
      )
      group.appendChild(animatedLayer)
    }

    if (group.children.length <= 2) {
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

  if (!state.dotMatrixAnimation.animated) {
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
  maxX: number
  maxY: number
  originX: number
  originY: number
}

type DotMatrixCoordinates = {
  col: number
  row: number
}

type DotMatrixModule = DotMatrixCoordinates & {
  angle: number
  colN: number
  diagonal: number
  distance: number
  distanceN: number
  hash: number
  index: number
  outline: number
  outlineN: number
  perimeterIndex: number
  regionCol: number
  regionIndex: number
  regionRow: number
  ring: number
  rowN: number
  shape: SVGElement
}

type DotMatrixAnchor = {
  size?: number
  x: number
  y: number
}

type DotMatrixTrack = {
  durationMs: number
  index: number
  keyframes: string
  modules: DotMatrixModule[]
  opacity?: number
  region: string
  state: "active" | "quiet"
  styleVars: Record<string, number | string>
  timingFunction: string
  topology: string
  upstreamClass?: string
  upstreamLoader: DotMatrixSquareLoaderId
}

type DotMatrixCell = {
  col: number
  index: number
  row: number
}

type DotMatrixCellAnimation = {
  active: boolean
  durationMs: number
  keyframes: string
  opacity?: number
  styleVars?: Record<string, number | string>
  timingFunction: string
  topology: string
  upstreamClass?: string
  upstreamLoader: DotMatrixSquareLoaderId
}

type DotMatrixLoaderSpec = {
  resolve: (cell: DotMatrixCell) => DotMatrixCellAnimation
  topology: string
  upstreamLoader: DotMatrixSquareLoaderId
}

type DotMatrixLoaderResolver = (
  cell: DotMatrixCell,
  upstreamLoader: DotMatrixSquareLoaderId,
  topology: string,
) => DotMatrixCellAnimation

function getQrModuleClipLayers(svg: SVGElement): DotClipLayer[] {
  return Array.from(svg.querySelectorAll("rect"))
    .map((element) => {
      const clipPathId = getClipPathId(element.getAttribute("clip-path"))

      if (!clipPathId || !QR_MODULE_CLIP_PATH_PREFIXES.some((prefix) => clipPathId.startsWith(prefix))) {
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

function suppressDotMatrixBaseLayers(dotLayers: DotClipLayer[]) {
  for (const layer of dotLayers) {
    layer.element.setAttribute("opacity", "0")
  }
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
    maxX: Math.max(...anchors.map((anchor) => anchor.x + (anchor.size ?? cellSize))),
    maxY: Math.max(...anchors.map((anchor) => anchor.y + (anchor.size ?? cellSize))),
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

function getDotMatrixAnimationSpeedMultiplier(animation: QrDotMatrixAnimationOptions) {
  return 2 ** ((3 - Math.min(5, Math.max(1, animation.speed))) / 2)
}

function getDotMatrixBaseOpacity(animation: QrDotMatrixAnimationOptions) {
  return animation.opacityBase
}

function getDotMatrixOverlayScale(animation: QrDotMatrixAnimationOptions) {
  return Math.max(DEFAULT_DOT_MATRIX_ANIMATION.overlayScale, animation.overlayScale)
}

const DOT_MATRIX_CENTER = (DOT_MATRIX_TILE_SIZE - 1) / 2
type DotMatrixSquareLoaderId =
  | "dotm-square-1"
  | "dotm-square-2"
  | "dotm-square-3"
  | "dotm-square-4"
  | "dotm-square-5"
  | "dotm-square-6"
  | "dotm-square-7"
  | "dotm-square-8"
  | "dotm-square-9"
  | "dotm-square-10"
  | "dotm-square-11"
  | "dotm-square-12"
  | "dotm-square-13"
  | "dotm-square-14"
  | "dotm-square-15"
  | "dotm-square-16"
  | "dotm-square-17"
  | "dotm-square-18"
  | "dotm-square-19"
  | "dotm-square-20"

const DOT_MATRIX_SPIRAL_INWARD: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [4, 1],
  [4, 2],
  [4, 3],
  [4, 4],
  [3, 4],
  [2, 4],
  [1, 4],
  [0, 4],
  [0, 3],
  [0, 2],
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3],
  [1, 3],
  [1, 2],
  [2, 2],
]
const DOT_MATRIX_OUTER_RING_CW: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [4, 1],
  [4, 2],
  [4, 3],
  [4, 4],
  [3, 4],
  [2, 4],
  [1, 4],
  [0, 4],
  [0, 3],
  [0, 2],
  [0, 1],
]
const DOT_MATRIX_MIDDLE_RING_CCW: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [2, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3],
  [1, 3],
  [1, 2],
]

const DOT_MATRIX_LOADER_SPECS: Record<QrDotMatrixSquareLoader, DotMatrixLoaderSpec> = {
  "block-drop": createDotMatrixLoaderSpec("dotm-square-7", "frame-mask", createGeneratedCellAnimation),
  "core-rotor": createDotMatrixLoaderSpec("dotm-square-13", "frame-mask", createGeneratedCellAnimation),
  "core-spiral": createDotMatrixLoaderSpec("dotm-square-3", "spiral-inward", (cell) =>
    createClassCellAnimation("dotm-square-3", "spiral-inward", "dmx-spiral-snake", "dmx-spiral-snake", 1500, {
      "--dmx-spiral-order": spiralInwardOrderValue(cell.index),
    }),
  ),
  "crt-glide": createDotMatrixLoaderSpec("dotm-square-10", "scan-line", createGeneratedCellAnimation),
  "echo-ring": createDotMatrixLoaderSpec("dotm-square-11", "ripple-echo", (cell) =>
    createClassCellAnimation("dotm-square-11", "ripple-echo", "dmx-ripple-echo", "dmx-ripple-echo", 1500, {
      "--dmx-ripple-ring": Math.max(Math.abs(cell.col - DOT_MATRIX_CENTER), Math.abs(cell.row - DOT_MATRIX_CENTER)),
      "--dmx-ripple-parity": (cell.row + cell.col) % 2,
    }),
  ),
  "flux-columns": createDotMatrixLoaderSpec("dotm-square-6", "column-snake", (cell) =>
    createClassCellAnimation("dotm-square-6", "column-snake", "dmx-square6-col-snake", "dmx-square6-col-snake", 1500, {
      "--dmx-col-pos": cell.col % 2 === 0 ? DOT_MATRIX_TILE_SIZE - 1 - cell.row : cell.row,
    }),
  ),
  "glyph-pulse": createDotMatrixLoaderSpec("dotm-square-9", "glyph-bits", (cell) => {
    return createClassCellAnimation(
      "dotm-square-9",
      "glyph-bits",
      "dmx-square9-bit",
      "dmx-square9-bit",
      5200,
      { "--dmx-square9-delay": cell.index % 6 },
      "steps(52, end)",
    )
  }),
  "half-helix": createDotMatrixLoaderSpec("dotm-square-17", "half-helix", createGeneratedCellAnimation),
  "helix-core": createDotMatrixLoaderSpec("dotm-square-16", "helix-core", createGeneratedCellAnimation),
  "helix-glow": createDotMatrixLoaderSpec("dotm-square-15", "helix-glow", createGeneratedCellAnimation),
  "infinity-run": createDotMatrixLoaderSpec("dotm-square-19", "infinity-run", createGeneratedCellAnimation),
  "mobius-run": createDotMatrixLoaderSpec("dotm-square-20", "mobius-run", createGeneratedCellAnimation),
  "neon-drift": createDotMatrixLoaderSpec("dotm-square-1", "diagonal-alt-sweep", (cell) =>
    createClassCellAnimation("dotm-square-1", "diagonal-alt-sweep", "dmx-diagonal-alt-sweep", "dmx-diagonal-alt-sweep", 1500, {
      "--dmx-diagonal-parity": (cell.row + cell.col) % 2,
      "--dmx-path": trBlPathNormFromIndex(cell.index),
    }),
  ),
  "origin-wave": createDotMatrixLoaderSpec("dotm-square-12", "center-origin-ripple", (cell) =>
    createClassCellAnimation("dotm-square-12", "center-origin-ripple", "dmx-center-origin-ripple", "dmx-center-origin-ripple", 1500, {
      "--dmx-center-ripple-ring": Math.abs(cell.row - 1) + Math.abs(cell.col - 1),
    }),
  ),
  "prism-bloom": createDotMatrixLoaderSpec("dotm-square-14", "diamond-bloom", createGeneratedCellAnimation),
  "prism-sweep": createDotMatrixLoaderSpec("dotm-square-5", "diagonal-snake", (cell) =>
    createClassCellAnimation("dotm-square-5", "diagonal-snake", "dmx-diagonal-snake", "dmx-diagonal-snake", 1500, {
      "--dmx-diagonal-snake-order": diagonalSnakeOrderValue(cell.index),
    }),
  ),
  "pulse-ladder": createDotMatrixLoaderSpec("dotm-square-2", "row-cycle-snake", createGeneratedCellAnimation),
  "sound-bars": createDotMatrixLoaderSpec("dotm-square-18", "sound-bars", createGeneratedCellAnimation),
  "strobe-stack": createDotMatrixLoaderSpec("dotm-square-8", "stack-drain", createGeneratedCellAnimation),
  "twin-orbit": createDotMatrixLoaderSpec("dotm-square-4", "twin-orbit", (cell) => {
    const outerOrder = outerRingClockwiseOrderValue(cell.index)
    if (outerOrder >= 0) {
      return createClassCellAnimation("dotm-square-4", "twin-orbit", "dmx-outer-snake", "dmx-outer-snake", 1500, {
        "--dmx-outer-order": outerOrder,
      })
    }

    const middleOrder = middleRingAntiClockwiseOrderValue(cell.index)
    if (middleOrder >= 0) {
      return createClassCellAnimation("dotm-square-4", "twin-orbit", "dmx-middle-snake", "dmx-middle-snake", 1500, {
        "--dmx-middle-order": middleOrder,
      })
    }

    return createQuietCellAnimation("dotm-square-4", "twin-orbit")
  }),
}

function createDotMatrixLoaderSpec(
  upstreamLoader: DotMatrixSquareLoaderId,
  topology: string,
  resolve: DotMatrixLoaderResolver,
): DotMatrixLoaderSpec {
  return {
    resolve: (cell) => resolve(cell, upstreamLoader, topology),
    topology,
    upstreamLoader,
  }
}

function createClassCellAnimation(
  upstreamLoader: DotMatrixSquareLoaderId,
  topology: string,
  upstreamClass: string,
  keyframes: string,
  durationMs: number,
  styleVars: Record<string, number | string>,
  timingFunction = "linear",
): DotMatrixCellAnimation {
  return {
    active: true,
    durationMs,
    keyframes,
    styleVars,
    timingFunction,
    topology,
    upstreamClass,
    upstreamLoader,
  }
}

function createQuietCellAnimation(
  upstreamLoader: DotMatrixSquareLoaderId,
  topology: string,
): DotMatrixCellAnimation {
  return {
    active: false,
    durationMs: 1500,
    keyframes: `${upstreamLoader}-quiet`,
    timingFunction: "linear",
    topology,
    upstreamLoader,
  }
}

function createGeneratedCellAnimation(
  cell: DotMatrixCell,
  upstreamLoader: DotMatrixSquareLoaderId,
  topology: string,
): DotMatrixCellAnimation {
  const durationByLoader: Record<DotMatrixSquareLoaderId, number> = {
    "dotm-square-1": 1500,
    "dotm-square-2": 1500,
    "dotm-square-3": 1500,
    "dotm-square-4": 1500,
    "dotm-square-5": 1500,
    "dotm-square-6": 1500,
    "dotm-square-7": 1900,
    "dotm-square-8": 2000,
    "dotm-square-9": 5200,
    "dotm-square-10": 1500,
    "dotm-square-11": 1500,
    "dotm-square-12": 1500,
    "dotm-square-13": 1550,
    "dotm-square-14": 1700,
    "dotm-square-15": 1600,
    "dotm-square-16": 1400,
    "dotm-square-17": 1600,
    "dotm-square-18": 1750,
    "dotm-square-19": 1700,
    "dotm-square-20": 1600,
  }

  return {
    active: true,
    durationMs: durationByLoader[upstreamLoader],
    keyframes: getGeneratedDotMatrixKeyframesName(upstreamLoader, cell),
    timingFunction: "linear",
    topology,
    upstreamLoader,
  }
}

function createDotMatrixModule(
  shape: SVGElement,
  coordinates: DotMatrixCoordinates,
  metrics: DotMatrixMetrics,
): DotMatrixModule {
  const centerRow = metrics.maxRow / 2
  const centerCol = metrics.maxCol / 2
  const distance = Math.hypot(coordinates.row - centerRow, coordinates.col - centerCol)
  const maxDistance = Math.max(1, Math.hypot(centerRow, centerCol))
  const angle = Math.atan2(coordinates.row - centerRow, coordinates.col - centerCol)
  const index = coordinates.row * (metrics.maxCol + 1) + coordinates.col
  const outlineDistance = Math.min(
    coordinates.row,
    coordinates.col,
    metrics.maxRow - coordinates.row,
    metrics.maxCol - coordinates.col,
  )
  const maxOutlineDistance = Math.max(1, Math.min(centerRow, centerCol))
  const perimeterIndex = getDotMatrixPerimeterIndex(coordinates, metrics)
  const colN = metrics.maxCol > 0 ? coordinates.col / metrics.maxCol : 0
  const rowN = metrics.maxRow > 0 ? coordinates.row / metrics.maxRow : 0
  const regionCol = getDotMatrixRegionCoordinate(colN)
  const regionRow = getDotMatrixRegionCoordinate(rowN)

  return {
    ...coordinates,
    angle,
    colN,
    diagonal:
      rowN +
      colN,
    distance,
    distanceN: distance / maxDistance,
    hash: getDotMatrixHash01(index, coordinates.row + coordinates.col * 17),
    index,
    outline: outlineDistance,
    outlineN: outlineDistance / maxOutlineDistance,
    perimeterIndex,
    regionCol,
    regionIndex: regionRow * DOT_MATRIX_TILE_SIZE + regionCol,
    regionRow,
    ring: getDotMatrixRing(coordinates, metrics),
    rowN,
    shape,
  }
}

function createDotMatrixLoaderTracks(
  modules: DotMatrixModule[],
  animation: QrDotMatrixAnimationOptions,
) {
  const spec = DOT_MATRIX_LOADER_SPECS[animation.loader] ?? DOT_MATRIX_LOADER_SPECS["neon-drift"]
  const tracks = new Map<string, DotMatrixTrack>()
  const speedMultiplier = getDotMatrixAnimationSpeedMultiplier(animation)
  const activePatternIndexes = new Set(getDotMatrixPatternIndexes(animation.pattern))

  for (const qrModule of modules) {
    const cell = getDotMatrixCell(qrModule)
    const resolved = activePatternIndexes.has(cell.index)
      ? spec.resolve(cell)
      : createQuietCellAnimation(spec.upstreamLoader, spec.topology)
    const assignment = {
      ...resolved,
      durationMs: Math.round(resolved.durationMs * speedMultiplier),
    }
    const trackIndex = assignment.active ? tracks.size : DOT_MATRIX_QUIET_TRACK_INDEX
    const styleVars = assignment.styleVars ?? {}
    const upstreamClass = assignment.upstreamClass ?? ""
    const trackKey = [
      assignment.active ? "active" : "quiet",
      assignment.upstreamLoader,
      assignment.topology,
      upstreamClass,
      assignment.keyframes,
      assignment.durationMs,
      assignment.timingFunction,
      assignment.opacity ?? "",
      stableDotMatrixStyleVarSignature(styleVars),
    ].join(":")
    const existing = tracks.get(trackKey)
    const region = `${qrModule.regionCol},${qrModule.regionRow}`

    if (existing) {
      existing.modules.push(qrModule)
      if (!existing.region.split(" ").includes(region)) {
        existing.region = `${existing.region} ${region}`
      }
      continue
    }

    tracks.set(trackKey, {
      durationMs: assignment.durationMs,
      index: trackIndex,
      keyframes: assignment.keyframes,
      modules: [qrModule],
      opacity: assignment.opacity,
      region,
      state: assignment.active ? "active" : "quiet",
      styleVars,
      timingFunction: assignment.timingFunction,
      topology: assignment.topology,
      upstreamClass: assignment.upstreamClass,
      upstreamLoader: assignment.upstreamLoader,
    })
  }

  return tracks
}

function getDotMatrixRegionCoordinate(value: number) {
  return Math.min(
    DOT_MATRIX_TILE_SIZE - 1,
    Math.max(0, Math.floor(clampDotMatrixUnit(value) * DOT_MATRIX_TILE_SIZE)),
  )
}

function getDotMatrixCell(module: DotMatrixModule): DotMatrixCell {
  return {
    col: module.regionCol,
    index: module.regionIndex,
    row: module.regionRow,
  }
}

function rowMajorIndex(row: number, col: number) {
  return row * DOT_MATRIX_TILE_SIZE + col
}

function indexToCoord(index: number): DotMatrixCell {
  return {
    col: index % DOT_MATRIX_TILE_SIZE,
    index,
    row: Math.floor(index / DOT_MATRIX_TILE_SIZE),
  }
}

function findDotMatrixCellIndex(
  path: ReadonlyArray<readonly [number, number]>,
  col: number,
  row: number,
) {
  return path.findIndex(([pathCol, pathRow]) => pathCol === col && pathRow === row)
}

function trBlPathNormFromIndex(index: number) {
  const { col, row } = indexToCoord(index)

  return (row + (DOT_MATRIX_TILE_SIZE - 1 - col)) / ((DOT_MATRIX_TILE_SIZE - 1) * 2)
}

function spiralInwardOrderValue(index: number) {
  const { col, row } = indexToCoord(index)

  return findDotMatrixCellIndex(DOT_MATRIX_SPIRAL_INWARD, col, row)
}

function outerRingClockwiseOrderValue(index: number) {
  const { col, row } = indexToCoord(index)

  return findDotMatrixCellIndex(DOT_MATRIX_OUTER_RING_CW, col, row)
}

function middleRingAntiClockwiseOrderValue(index: number) {
  const { col, row } = indexToCoord(index)

  return findDotMatrixCellIndex(DOT_MATRIX_MIDDLE_RING_CCW, col, row)
}

function diagonalSnakeOrderValue(index: number) {
  const { col, row } = indexToCoord(index)
  let order = 0

  for (let diagonal = 0; diagonal <= (DOT_MATRIX_TILE_SIZE - 1) * 2; diagonal += 1) {
    const cells: DotMatrixCell[] = []

    for (let candidateRow = 0; candidateRow < DOT_MATRIX_TILE_SIZE; candidateRow += 1) {
      const candidateCol = diagonal - candidateRow

      if (candidateCol >= 0 && candidateCol < DOT_MATRIX_TILE_SIZE) {
        cells.push(indexToCoord(rowMajorIndex(candidateRow, candidateCol)))
      }
    }

    const orderedCells = diagonal % 2 === 0 ? cells : [...cells].reverse()

    for (const cell of orderedCells) {
      if (cell.col === col && cell.row === row) {
        return order
      }

      order += 1
    }
  }

  return 0
}

function getDotMatrixPatternIndexes(pattern: QrDotMatrixAnimationOptions["pattern"]) {
  const indexes: number[] = []

  for (let row = 0; row < DOT_MATRIX_TILE_SIZE; row += 1) {
    for (let col = 0; col < DOT_MATRIX_TILE_SIZE; col += 1) {
      const index = rowMajorIndex(row, col)
      const distance = Math.hypot(row - DOT_MATRIX_CENTER, col - DOT_MATRIX_CENTER)
      const manhattan = Math.abs(row - DOT_MATRIX_CENTER) + Math.abs(col - DOT_MATRIX_CENTER)
      const angle = Math.atan2(row - DOT_MATRIX_CENTER, col - DOT_MATRIX_CENTER)
      const active =
        pattern === "full" ||
        (pattern === "diamond" && manhattan <= 2) ||
        (pattern === "outline" &&
          (row === 0 || col === 0 || row === DOT_MATRIX_TILE_SIZE - 1 || col === DOT_MATRIX_TILE_SIZE - 1)) ||
        (pattern === "cross" && (row === DOT_MATRIX_CENTER || col === DOT_MATRIX_CENTER)) ||
        (pattern === "rings" && (distance >= 1 || row === 0 || col === 0 || row === 4 || col === 4)) ||
        (pattern === "rose" && Math.abs(Math.sin(3 * angle)) > 0.5 && distance >= 1)

      if (active) {
        indexes.push(index)
      }
    }
  }

  return indexes
}

function stableDotMatrixStyleVarSignature(styleVars: Record<string, number | string>) {
  return Object.keys(styleVars)
    .sort()
    .map((key) => `${key}=${styleVars[key]}`)
    .join(";")
}

function getGeneratedDotMatrixKeyframesName(
  upstreamLoader: DotMatrixSquareLoaderId,
  cell: DotMatrixCell,
) {
  const squareNumber = upstreamLoader.replace("dotm-square-", "")

  return `dmx-square${squareNumber}-${upstreamLoader}-r${cell.row}c${cell.col}`.replaceAll(".", "-")
}

function getDotMatrixPerimeterIndex(
  coordinates: DotMatrixCoordinates,
  metrics: DotMatrixMetrics,
) {
  const { col, row } = coordinates

  if (row === 0) {
    return col
  }

  if (col === metrics.maxCol) {
    return metrics.maxCol + row
  }

  if (row === metrics.maxRow) {
    return metrics.maxCol + metrics.maxRow + (metrics.maxCol - col)
  }

  if (col === 0) {
    return metrics.maxCol * 2 + metrics.maxRow + (metrics.maxRow - row)
  }

  return -1
}

function getDotMatrixRing(coordinates: DotMatrixCoordinates, metrics: DotMatrixMetrics) {
  return Math.min(
    coordinates.row,
    coordinates.col,
    metrics.maxRow - coordinates.row,
    metrics.maxCol - coordinates.col,
  )
}

function getDotMatrixHash01(index: number, salt = 1) {
  const hash =
    (Math.imul(index + 1, 2654435761) ^
      Math.imul(index + salt + 7, 2246822519) ^
      Math.imul(salt + 3, 3266489917)) >>>
    0

  return (hash % 1000) / 1000
}

function clampDotMatrixUnit(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(0.999, value))
}

function getDotMatrixTrackStyle(track: DotMatrixTrack) {
  const style = [
    `--qr-dot-track:${track.index}`,
    `--qr-dot-duration-ms:${track.durationMs}`,
    `--qr-dot-easing:${track.timingFunction}`,
    `--qr-dot-keyframes-name:${track.keyframes}`,
    ...Object.entries(track.styleVars).map(([key, value]) => `${key}:${value}`),
  ]

  if (track.opacity !== undefined) {
    style.push(`opacity:${formatSvgNumber(track.opacity)}`)
  }

  return style.join(";")
}

function getDotMatrixCoverRect(
  svg: SVGElement,
  options: Parameters<ExtensionFunction>[1],
  metrics: DotMatrixMetrics,
) {
  const width =
    Number(options.width) ||
    Number(svg.getAttribute("width")) ||
    Math.max(metrics.maxX, metrics.originX + metrics.cellSize)
  const height =
    Number(options.height) ||
    Number(svg.getAttribute("height")) ||
    Math.max(metrics.maxY, metrics.originY + metrics.cellSize)

  return {
    height,
    width,
    x: 0,
    y: 0,
  }
}

function applyDotMatrixOverlayScale(
  shape: SVGElement,
  metrics: DotMatrixMetrics,
  overlayScale: number,
) {
  const scale = overlayScale / 100

  if (!Number.isFinite(scale) || Math.abs(scale - 1) < 0.001) {
    return
  }

  const anchor = getDotMatrixAnchor(shape)

  if (!anchor) {
    return
  }

  const size = anchor.size ?? metrics.cellSize
  const centerX = anchor.x + size / 2
  const centerY = anchor.y + size / 2
  const existingTransform = shape.getAttribute("transform")
  const scaleTransform = [
    `translate(${formatSvgNumber(centerX)} ${formatSvgNumber(centerY)})`,
    `scale(${formatSvgNumber(scale)})`,
    `translate(${formatSvgNumber(-centerX)} ${formatSvgNumber(-centerY)})`,
  ].join(" ")

  shape.setAttribute(
    "transform",
    existingTransform ? `${existingTransform} ${scaleTransform}` : scaleTransform,
  )
}

function resolveDotMatrixColors(state: QrStudioState) {
  const animation = state.dotMatrixAnimation
  const defaultLoaderColor = DEFAULT_DOT_MATRIX_ANIMATION.customColor

  if (animation.colorPreset === "theme") {
    const legacyCustomColor = animation.customColor || defaultLoaderColor

    return {
      base: animation.customColorBase || legacyCustomColor,
      mid: animation.customColorMid || legacyCustomColor,
      peak: animation.customColorPeak || legacyCustomColor,
    }
  }

  const presetColors: Record<QrDotMatrixAnimationOptions["colorPreset"], string> = {
    aurora: "#a78bfa",
    fire: "#fb7185",
    mint: "#34d399",
    neon: "#22d3ee",
    ocean: "#38bdf8",
    prism: "#f0abfc",
    sunset: "#fb923c",
    theme: animation.customColor || defaultLoaderColor,
  }

  const presetColor = presetColors[animation.colorPreset]

  return {
    base: presetColor,
    mid: presetColor,
    peak: presetColor,
  }
}

function createGeneratedDotMatrixKeyframes(
  name: string,
  upstreamLoader: DotMatrixSquareLoaderId,
  region: string,
) {
  const [col = 0, row = 0] = region.split(" ")[0]?.split(",").map(Number) ?? []
  const samples = getGeneratedDotMatrixOpacitySamples(upstreamLoader, {
    col,
    index: rowMajorIndex(row, col),
    row,
  })

  return createDotMatrixOpacityKeyframes(name, samples)
}

function getGeneratedDotMatrixOpacitySamples(
  upstreamLoader: DotMatrixSquareLoaderId,
  cell: DotMatrixCell,
) {
  switch (upstreamLoader) {
    case "dotm-square-2":
      return Array.from({ length: 10 }, (_, frame) => {
        const head = [4, 3, 2, 1, 0, 0, 1, 2, 3, 4][frame] ?? 0
        const distance = Math.abs(cell.row - head)
        const tail = [1, 0.82, 0.68, 0.54, 0.42, 0.31, 0.22, 0.14]
        return tail[distance + Math.abs(cell.col - (frame % DOT_MATRIX_TILE_SIZE))] ?? 0.08
      })
    case "dotm-square-7":
      return Array.from({ length: 11 }, (_, frame) => {
        const sequence = [0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 9]
        const step = sequence[frame] ?? 0
        const filled = DOT_MATRIX_TILE_SIZE - 1 - cell.row < step
        const cap = DOT_MATRIX_TILE_SIZE - 1 - cell.row === step
        return cap ? 1 : filled ? 0.42 : 0.08
      })
    case "dotm-square-8":
      return Array.from({ length: 24 }, (_, frame) => {
        if (frame < 9) {
          return DOT_MATRIX_TILE_SIZE - 1 - cell.row <= frame / 2 ? 0.52 : 0.08
        }
        if (frame < 14) {
          return frame % 2 === 0 ? 1 : 0.38
        }
        return cell.row <= (frame - 14) / 2 ? 0.08 : 0.52
      })
    case "dotm-square-10":
      return Array.from({ length: 5 }, (_, frame) => {
        const distance = Math.abs(cell.row - frame)
        return distance === 0 ? 1 : distance === 1 ? 0.72 : 0.08 + cell.col * 0.07
      })
    case "dotm-square-13":
      return Array.from({ length: 16 }, (_, frame) => {
        const order = outerRingClockwiseOrderValue(cell.index)
        if (cell.row === DOT_MATRIX_CENTER && cell.col === DOT_MATRIX_CENTER) {
          return frame % 4 === 0 ? 1 : 0.56
        }
        return order >= 0 && Math.abs(order - frame) <= 1 ? 1 : 0.08
      })
    case "dotm-square-14":
      return Array.from({ length: 6 }, (_, frame) => {
        const sequence = [0, 1, 2, 3, 2, 1]
        const distance = Math.abs(cell.row - DOT_MATRIX_CENTER) + Math.abs(cell.col - DOT_MATRIX_CENTER)
        return distance === sequence[frame] ? 1 : distance < sequence[frame] ? 0.52 : 0.08
      })
    case "dotm-square-15":
    case "dotm-square-16":
      return Array.from({ length: 20 }, (_, frame) => {
        const phase = (frame / 19) * Math.PI * 2 + cell.row * 1.24
        const left = Math.round(1.5 + 0.5 * Math.sin(phase))
        const right = DOT_MATRIX_TILE_SIZE - 1 - left
        const bridge = Math.cos(phase * 2) > 0.82 && cell.col === 2
        return cell.col === left || cell.col === right ? 1 : bridge ? 0.58 : Math.abs(cell.col - left) === 1 ? 0.24 : 0.08
      })
    case "dotm-square-17":
      return Array.from({ length: 20 }, (_, frame) => {
        const phase = (frame / 19) * Math.PI * 2 + cell.row * 1.24
        const strandCol = Math.round(2 + 2 * Math.sin(phase))
        return cell.col === strandCol ? 1 : Math.abs(cell.col - strandCol) === 1 ? 0.24 : 0.08
      })
    case "dotm-square-18":
      return Array.from({ length: 24 }, (_, frame) => {
        const colPhase = frame * 0.52 + cell.col * 1.15
        const level = Math.round(1 + ((Math.sin(colPhase) + 1) / 2) * 4)
        return DOT_MATRIX_TILE_SIZE - cell.row <= level ? 1 : 0.08
      })
    case "dotm-square-19":
      return Array.from({ length: 48 }, (_, frame) => {
        const a = (frame % DOT_MATRIX_OUTER_RING_CW.length)
        const b = (a + DOT_MATRIX_OUTER_RING_CW.length / 2) % DOT_MATRIX_OUTER_RING_CW.length
        const order = outerRingClockwiseOrderValue(cell.index)
        if (cell.row === DOT_MATRIX_CENTER && cell.col === DOT_MATRIX_CENTER) {
          return 0.62
        }
        return order === a || order === b ? 1 : order >= 0 && Math.min(Math.abs(order - a), Math.abs(order - b)) <= 2 ? 0.32 : 0.08
      })
    case "dotm-square-20":
      return Array.from({ length: DOT_MATRIX_OUTER_RING_CW.length }, (_, frame) => {
        const order = outerRingClockwiseOrderValue(cell.index)
        if (cell.row === DOT_MATRIX_CENTER && cell.col === DOT_MATRIX_CENTER) {
          return frame % 4 === 0 ? 0.62 : 0.08
        }
        return order === frame ? 1 : order >= 0 && Math.abs(order - frame) <= 2 ? 0.38 : 0.08
      })
    default:
      return [0.08, 1, 0.32, 0.08]
  }
}

function createDotMatrixOpacityKeyframes(name: string, samples: number[]) {
  const last = Math.max(1, samples.length - 1)
  const frames = samples.map((opacity, index) => {
    const percent = formatSvgNumber((index / last) * 100)

    const anchor = getDotMatrixAnchorValue(opacity)

    return `${percent}% { opacity: var(--qr-dot-matrix-opacity-${anchor}); fill: var(--qr-dot-matrix-color-${anchor}); }`
  })

  return `@keyframes ${name} { ${frames.join(" ")} }`
}

function getDotMatrixAnchorValue(sourceOpacity: number) {
  if (!Number.isFinite(sourceOpacity) || sourceOpacity <= 0.08) {
    return "base"
  }

  if (sourceOpacity >= 0.94) {
    return "peak"
  }

  return "mid"
}

function createDotMatrixAnimationStyle(document: Document, tracks: DotMatrixTrack[]) {
  const style = document.createElementNS(SVG_NS, "style")
  const generatedKeyframes = tracks
    .filter((track) => track.state === "active" && track.keyframes.includes("-dotm-square-"))
    .map((track) => createGeneratedDotMatrixKeyframes(track.keyframes, track.upstreamLoader, track.region))
    .join("\n")

  style.setAttribute("data-qr-layer", "dot-matrix-animation")
  style.textContent = `
.qr-dot-matrix-layer {
  pointer-events: none;
}
.qr-dot-matrix-track {
  animation-duration: calc(var(--qr-dot-duration-ms, 2200) * 1ms);
  animation-iteration-count: infinite;
  animation-name: var(--qr-dot-keyframes-name);
  animation-timing-function: var(--qr-dot-easing, ease-in-out);
  fill: var(--qr-dot-matrix-color-base);
  filter: drop-shadow(0 0 3px var(--qr-dot-matrix-color));
  opacity: var(--qr-dot-matrix-opacity-base);
}
.qr-dot-matrix-track-quiet {
  animation: none !important;
  opacity: var(--qr-dot-matrix-opacity-base);
  filter: none;
}
.qr-dot-matrix-track[data-qr-dot-upstream-class="dmx-diagonal-alt-sweep"] { animation-delay: calc((var(--dmx-path, 0) + var(--dmx-diagonal-parity, 0) * .08) * -1.5s); }
.qr-dot-matrix-track[data-qr-dot-upstream-class="dmx-spiral-snake"] { animation-delay: calc(var(--dmx-spiral-order, 0) * -56ms); }
.qr-dot-matrix-track[data-qr-dot-upstream-class="dmx-diagonal-snake"] { animation-delay: calc(var(--dmx-diagonal-snake-order, 0) * -48ms); }
.qr-dot-matrix-track[data-qr-dot-upstream-class="dmx-outer-snake"] { animation-delay: calc(var(--dmx-outer-order, 0) * -70ms); }
.qr-dot-matrix-track[data-qr-dot-upstream-class="dmx-middle-snake"] { animation-delay: calc(var(--dmx-middle-order, 0) * -96ms); }
.qr-dot-matrix-track[data-qr-dot-upstream-class="dmx-square6-col-snake"] { animation-delay: calc(var(--dmx-col-pos, 0) * -110ms); }
.qr-dot-matrix-track[data-qr-dot-upstream-class="dmx-ripple-echo"] { animation-delay: calc(var(--dmx-ripple-ring, 0) * -120ms); }
.qr-dot-matrix-track[data-qr-dot-upstream-class="dmx-center-origin-ripple"] { animation-delay: calc(var(--dmx-center-ripple-ring, 0) * -120ms); }
@keyframes qr-dot-loader-legacy { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 50% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } }
@keyframes dmx-diagonal-alt-sweep { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 44% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 68% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
@keyframes dmx-spiral-snake { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 10% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 34% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
@keyframes dmx-diagonal-snake { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 12% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 36% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
@keyframes dmx-outer-snake { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 8% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 30% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
@keyframes dmx-middle-snake { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 8% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 30% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
@keyframes dmx-square6-col-snake { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 18% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 42% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
@keyframes dmx-ripple-echo { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 35% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 60% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
@keyframes dmx-center-origin-ripple { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 32% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 62% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
@keyframes dmx-square9-bit { 0%, 100% { opacity: var(--qr-dot-matrix-opacity-base); fill: var(--qr-dot-matrix-color-base); } 8%, 22%, 38%, 56% { opacity: var(--qr-dot-matrix-opacity-peak); fill: var(--qr-dot-matrix-color-peak); } 14%, 30%, 48%, 68% { opacity: var(--qr-dot-matrix-opacity-mid); fill: var(--qr-dot-matrix-color-mid); } }
${generatedKeyframes}
@media (prefers-reduced-motion: reduce) {
  .qr-dot-matrix-layer {
    display: none;
  }
  .qr-dot-matrix-track {
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

    return child.tagName.toLowerCase() === "image"
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

function formatSvgOpacity(value: number) {
  if (!Number.isFinite(value)) {
    return "0"
  }

  return formatSvgNumber(Math.max(0, Math.min(1, value)))
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
