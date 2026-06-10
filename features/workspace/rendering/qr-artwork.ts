import {
  DEFAULT_BACKGROUND_SHAPE_OPTIONS,
  type QrStudioState,
} from "@/features/qr-code/model/state"

export function createDraftingQrArtworkState(state: QrStudioState): QrStudioState {
  return {
    ...state,
    backgroundGradient: {
      ...state.backgroundGradient,
      enabled: false,
    },
    backgroundImage: {
      source: "none",
      value: undefined,
      presetId: undefined,
      presetColor: undefined,
    },
    backgroundOptions: {
      ...state.backgroundOptions,
      transparent: true,
    },
    backgroundShapeId: "none",
    backgroundShapeOptions: { ...DEFAULT_BACKGROUND_SHAPE_OPTIONS },
  }
}

export function sanitizeDraftingQrArtworkMarkup(markup: string) {
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return markup
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(markup, "image/svg+xml")
  const svg = document.documentElement

  if (svg.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
    return markup
  }

  for (const child of Array.from(svg.children)) {
    if (isLegacyQrBackingNode(child)) {
      child.remove()
    }
  }

  for (const filter of Array.from(svg.querySelectorAll("filter"))) {
    if (isLegacyQrBackingNode(filter)) {
      filter.remove()
    }
  }

  for (const clipPath of Array.from(svg.querySelectorAll("clipPath"))) {
    if (isLegacyQrBackingNode(clipPath)) {
      clipPath.remove()
    }
  }

  for (const defs of Array.from(svg.querySelectorAll("defs"))) {
    if (defs.children.length === 0) {
      defs.remove()
    }
  }

  return new XMLSerializer().serializeToString(svg)
}

function isLegacyQrBackingNode(node: Element) {
  const layer = node.getAttribute("data-qr-layer")

  if (layer?.startsWith("background-")) {
    return true
  }

  const id = node.getAttribute("id")

  if (id?.includes("clip-path-background-color")) {
    return true
  }

  return (
    node.tagName.toLowerCase() === "rect" &&
    node.getAttribute("clip-path")?.includes("clip-path-background-color") === true
  )
}
