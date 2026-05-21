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
  type QrStudioState,
  type StudioGradient,
} from "@/components/qr/qr-studio-state"

export function buildQrExtension(state: QrStudioState) {
  const extensions: ExtensionFunction[] = []
  const customDotShape = getSvgCustomDotShape(state)
  const backgroundImage = getAssetValue(state.backgroundImage)
  const backgroundShape = backgroundImage
    ? null
    : getQrBackgroundShapeDefinition(state.backgroundShapeId)
  const alignedCornerGradientExtension = createAlignedCornerGradientExtension(state)

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

export function getQrExtensionKey(state: QrStudioState) {
  return JSON.stringify({
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
