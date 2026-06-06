import type { DraftingCanvasLayer } from "@/components/drafting/drafting-layer-state"

const SVG_NS = "http://www.w3.org/2000/svg"

export function hasDraftingLayerShadow(layer: DraftingCanvasLayer) {
  return (
    layer.shadow.opacity > 0 &&
    (layer.shadow.blur > 0 || layer.shadow.offsetX !== 0 || layer.shadow.offsetY !== 0)
  )
}

export function applyDraftingQrForegroundShadow(
  markup: string,
  layer: DraftingCanvasLayer,
) {
  if (!hasDraftingLayerShadow(layer) || typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return markup
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(markup, "image/svg+xml")
  const svg = document.documentElement

  if (svg.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
    return markup
  }

  const foregroundChildren = Array.from(svg.children).filter(
    (child) => child.tagName.toLowerCase() !== "defs" && !isQrBackgroundLayer(child),
  )

  if (foregroundChildren.length === 0) {
    return markup
  }

  const filterId = `${getSvgId(layer.id)}-foreground-shadow`
  const existingFilter = Array.from(svg.querySelectorAll("filter")).find(
    (node) => node.getAttribute("id") === filterId,
  )
  const defs = getOrCreateSvgDefs(document, svg)
  const filter = createForegroundShadowFilter(document, filterId, layer)
  const group = document.createElementNS(SVG_NS, "g")
  const firstForegroundChild = foregroundChildren[0] ?? null

  existingFilter?.remove()
  defs.appendChild(filter)
  group.setAttribute("data-drafting-qr-shadow-source", "true")
  group.setAttribute("filter", `url(#${filterId})`)
  svg.insertBefore(group, firstForegroundChild)

  for (const child of foregroundChildren) {
    group.appendChild(child)
  }

  return new XMLSerializer().serializeToString(svg)
}

function getOrCreateSvgDefs(document: Document, svg: Element) {
  const existingDefs = Array.from(svg.children).find(
    (child) => child.tagName.toLowerCase() === "defs",
  )

  if (existingDefs) {
    return existingDefs
  }

  const defs = document.createElementNS(SVG_NS, "defs")
  svg.insertBefore(defs, svg.firstChild)
  return defs
}

function createForegroundShadowFilter(
  document: Document,
  filterId: string,
  layer: DraftingCanvasLayer,
) {
  const filter = document.createElementNS(SVG_NS, "filter")
  const dropShadow = document.createElementNS(SVG_NS, "feDropShadow")

  filter.setAttribute("id", filterId)
  filter.setAttribute("x", "-50%")
  filter.setAttribute("y", "-50%")
  filter.setAttribute("width", "200%")
  filter.setAttribute("height", "200%")
  dropShadow.setAttribute("dx", String(layer.shadow.offsetX))
  dropShadow.setAttribute("dy", String(layer.shadow.offsetY))
  dropShadow.setAttribute("stdDeviation", String(layer.shadow.blur / 2))
  dropShadow.setAttribute("flood-color", layer.shadow.color)
  dropShadow.setAttribute("flood-opacity", String(layer.shadow.opacity / 100))
  filter.appendChild(dropShadow)

  return filter
}

function isQrBackgroundLayer(child: Element) {
  const layer = child.getAttribute("data-qr-layer")

  if (layer?.startsWith("background-")) {
    return true
  }

  return (
    child.tagName.toLowerCase() === "rect" &&
    child.getAttribute("clip-path")?.includes("clip-path-background-color") === true
  )
}

function getSvgId(value: string) {
  return value.replace(/[^\w-]+/g, "-")
}
