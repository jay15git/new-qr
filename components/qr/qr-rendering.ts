import type { ExtensionFunction } from "qr-code-styling"

import {
  getActiveCustomDotShape,
  type CustomDotShape,
} from "@/components/qr/custom-dot-shapes"
import { createDotsPaletteExtension } from "@/components/qr/qr-dots-palette"
import { createCustomDotShapeExtension } from "@/components/qr/qr-svg-custom-shape-extension"
import { getAssetValue, type QrStudioState } from "@/components/qr/qr-studio-state"

export function buildQrExtension(state: QrStudioState) {
  const extensions: ExtensionFunction[] = []
  const customDotShape = getSvgCustomDotShape(state)
  const backgroundImage = getAssetValue(state.backgroundImage)

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
    customDotShape: getSvgCustomDotShape(state),
    dotsColorMode: state.dotsColorMode,
    dotsPalette: state.dotsPalette,
    seed: state.data.trim(),
  })
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
