import type { ExtensionFunction } from "qr-code-styling"

import {
  getActiveCustomDotShape,
  type CustomDotShape,
} from "@/components/qr/custom-dot-shapes"
import { createDotsPaletteExtension } from "@/components/qr/qr-dots-palette"
import { createCustomDotShapeExtension } from "@/components/qr/qr-svg-custom-shape-extension"
import {
  getAssetValue,
  type QrStudioState,
  type StudioGradient,
} from "@/components/qr/qr-studio-state"

export function buildQrExtension(state: QrStudioState) {
  const extensions: ExtensionFunction[] = []
  const customDotShape = getSvgCustomDotShape(state)
  const backgroundImage = getAssetValue(state.backgroundImage)
  const alignedCornerGradientExtension = createAlignedCornerGradientExtension(state)

  if (backgroundImage) {
    extensions.push(createBackgroundImageExtension(backgroundImage))
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

function createBackgroundImageExtension(imageHref: string): ExtensionFunction {
  return (svg, options) => {
    const document = svg.ownerDocument

    if (!document) {
      return
    }

    svg.querySelectorAll('[data-qr-layer="background-image"]').forEach((node) => {
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

    const insertReference = getBackgroundImageInsertReference(svg)
    svg.insertBefore(backgroundImage, insertReference)
  }
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
