import { convertQrSvgToDom, type DomLayerNode } from "@new-qr/qr-scene-codegen"

import type { DraftingCardState } from "@/features/workspace/model/card-state"
import {
  DEFAULT_DRAFTING_TEXT_LAYER,
  type DraftingCanvasLayer,
  type DraftingTextRun,
} from "@/features/workspace/model/layers"
import { layoutDraftingText } from "@/features/workspace/rendering/text-layout"
import {
  applyDraftingQrForegroundShadow,
  hasDraftingLayerShadow,
} from "@/features/workspace/rendering/qr-layer-shadow"
import { scaleNestedSvgMarkup } from "@/features/workspace/rendering/qr-artwork"
import { getShapeSvgPath } from "@/features/workspace/rendering/shape-layer"
import { QR_BACKGROUND_SHAPES } from "@/features/qr-code/styles/background-shapes"
import {
  getDraftingQrBackgroundSvgMarkup,
} from "@/features/workspace/components/QrBackground"
import {
  cssPropertiesToInlineStyle,
  getDraftingCardDomStyle,
  getDraftingImageDomStyle,
  getDraftingShapeDomStyle,
  getExportLayerEffectStyle,
  getExportLayerPlacementStyle,
  getTextLayerStyle,
  getTextRunStyle,
  serializeCssProperties,
} from "@/features/workspace/rendering/layer-dom-styles"
import type { QrStudioState } from "@/features/qr-code/model/state"
import { getDraftingQrLayerLayout } from "@/features/qr-code/rendering/svg-extension"

import { getDraftingLayerBounds } from "./layered-svg-parts"

export type LayeredDomParts = {
  bounds: {
    height: number
    minX: number
    minY: number
    width: number
  }
  domLayers: DomLayerNode[]
}

export async function buildLayeredDomParts({
  cardState,
  layers,
  qrMarkup,
  state,
}: {
  cardState: DraftingCardState
  layers: DraftingCanvasLayer[]
  qrMarkup: string
  state: QrStudioState
}): Promise<LayeredDomParts> {
  const bounds = getDraftingLayerBounds(layers, state)
  const domLayers = layers
    .filter((layer) => layer.isVisible)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((layer) => getDraftingLayerDomNode(layer, cardState, qrMarkup, state))
    .filter((node): node is DomLayerNode => Boolean(node))

  return { bounds, domLayers }
}

function getDraftingLayerDomNode(
  layer: DraftingCanvasLayer,
  cardState: DraftingCardState,
  qrMarkup: string,
  state: QrStudioState,
): DomLayerNode | null {
  if (!layer.isVisible) {
    return null
  }

  if (layer.kind === "group") {
    return getDraftingGroupLayerDom(layer, cardState, qrMarkup, state)
  }

  if (layer.kind === "card") {
    return getDraftingCardLayerDom(layer, cardState)
  }

  if (layer.kind === "text") {
    return getDraftingTextLayerDom(layer)
  }

  if (layer.kind === "image") {
    return getDraftingImageLayerDom(layer)
  }

  if (layer.kind === "shape") {
    return getDraftingShapeLayerDom(layer)
  }

  return getDraftingQrLayerDom(layer, qrMarkup, state)
}

function getDraftingGroupLayerDom(
  layer: DraftingCanvasLayer,
  cardState: DraftingCardState,
  qrMarkup: string,
  state: QrStudioState,
): DomLayerNode {
  const children = (layer.children ?? [])
    .filter((child) => child.isVisible)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((child) => getDraftingLayerDomNode(child, cardState, qrMarkup, state))
    .filter((node): node is DomLayerNode => Boolean(node))

  return {
    kind: "group",
    id: layer.id,
    bounds: {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    },
    style: {
      ...getExportLayerPlacementStyle(layer),
      ...getExportLayerEffectStyle(layer),
      overflow: "visible",
    },
    children,
  }
}

function getDraftingCardLayerDom(
  layer: DraftingCanvasLayer,
  cardState: DraftingCardState,
): DomLayerNode {
  return {
    kind: "card",
    id: layer.id,
    bounds: {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    },
    style: {
      ...getExportLayerPlacementStyle(layer),
      ...getExportLayerEffectStyle(layer),
      ...getDraftingCardDomStyle(cardState, layer),
      overflow: "hidden",
    },
  }
}

function getDraftingTextLayerDom(layer: DraftingCanvasLayer): DomLayerNode {
  const textStyle = serializeCssProperties(getTextLayerStyle(layer) as Record<string, string | number>)
  const hasTextRuns =
    Boolean(layer.textRuns?.length) &&
    layer.textRuns?.map((run) => run.text).join("") === (layer.text ?? "")

  return {
    kind: "text",
    id: layer.id,
    bounds: {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    },
    style: {
      ...getExportLayerPlacementStyle(layer),
      ...getExportLayerEffectStyle(layer),
      ...textStyle,
      height: "fit-content",
      overflow: "hidden",
    },
    htmlContent: hasTextRuns ? getDraftingTextRunsHtml(layer) : undefined,
    content: hasTextRuns ? undefined : getDraftingTextContent(layer),
  }
}

function getDraftingImageLayerDom(layer: DraftingCanvasLayer): DomLayerNode {
  const imageValue = layer.imageValue ?? ""
  const imageStyle = getDraftingImageDomStyle(layer)

  return {
    kind: "image",
    id: layer.id,
    bounds: {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    },
    style: {
      ...getExportLayerPlacementStyle(layer),
      ...getExportLayerEffectStyle(layer),
      ...imageStyle,
      overflow: "hidden",
    },
    htmlContent: imageValue
      ? `<img alt="" src="${escapeHtml(imageValue)}" style="${cssPropertiesToInlineStyle({
          borderRadius: layer.cornerRadius ?? 0,
          height: "100%",
          objectFit: layer.imageFit ?? "cover",
          width: "100%",
        })}" />`
      : undefined,
    content: imageValue ? undefined : "Image",
  }
}

function getDraftingShapeLayerDom(layer: DraftingCanvasLayer): DomLayerNode {
  const shapeId = layer.shapeId ?? "rounded-square"
  const definition = QR_BACKGROUND_SHAPES.find((shape) => shape.id === shapeId)
  const fill = layer.fillMode === "none" ? "none" : escapeXml(layer.fill ?? "#E8E8E8")
  const strokeWidth = layer.strokeWidth ?? 0
  const stroke = layer.stroke ?? "#171717"
  const strokeOpacity = (layer.strokeOpacity ?? 100) / 100
  const strokeAttrs =
    strokeWidth > 0
      ? ` stroke="${escapeXml(stroke)}" stroke-width="${strokeWidth}" stroke-opacity="${strokeOpacity}"`
      : ""
  const innerMarkup = definition
    ? `<path d="${definition.path}" fill="${fill}"${strokeAttrs}/>`
    : getShapeSvgPath(shapeId).replace("/>", ` fill="${fill}"${strokeAttrs}/>`)
  const viewBox = definition
    ? `0 0 ${definition.viewBox.width} ${definition.viewBox.height}`
    : "0 0 100 100"

  return {
    kind: "shape",
    id: layer.id,
    bounds: {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    },
    style: {
      ...getExportLayerPlacementStyle(layer),
      ...getExportLayerEffectStyle(layer),
      ...getDraftingShapeDomStyle(layer),
      overflow: "visible",
    },
    svgInner: `<svg aria-hidden="true" width="${layer.width}" height="${layer.height}" viewBox="${viewBox}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${innerMarkup}</svg>`,
  }
}

export type DraftingQrDomContent =
  | { kind: "modules"; children: DomLayerNode[] }
  | { kind: "svg"; svgInner: string }

function getDraftingQrScaledMarkup(
  layer: DraftingCanvasLayer,
  qrMarkup: string,
  state: QrStudioState,
) {
  const layout = getDraftingQrLayerLayout(layer.width, state)
  const shadowedQrMarkup = hasDraftingLayerShadow(layer)
    ? applyDraftingQrForegroundShadow(qrMarkup, layer)
    : qrMarkup
  const scaledQrMarkup = scaleNestedSvgMarkup(
    shadowedQrMarkup,
    layout.innerWidth,
    layout.innerHeight,
  )

  return { layout, scaledQrMarkup, shadowedQrMarkup }
}

/** Preview-only: scaled QR svg markup for inner layout box. */
export function buildDraftingQrPreviewScaledMarkup(
  layer: DraftingCanvasLayer,
  qrMarkup: string,
  state: QrStudioState,
): string | null {
  if (!qrMarkup) {
    return null
  }

  const { scaledQrMarkup } = getDraftingQrScaledMarkup(layer, qrMarkup, state)
  return scaledQrMarkup
}

export type DraftingQrPreviewModules = {
  layoutHeight: number
  layoutWidth: number
  nodes: DomLayerNode[]
}

function readQrMarkupViewBox(markup: string) {
  const match = markup.match(/\bviewBox\s*=\s*(['"])([^'"]+)\1/i)
  if (match) {
    const parts = match[2].split(/[\s,]+/).map(Number.parseFloat)
    if (parts.length === 4 && parts.every((value) => Number.isFinite(value)) && parts[2] > 0 && parts[3] > 0) {
      return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] }
    }
  }

  return { x: 0, y: 0, width: 57, height: 57 }
}

function extractSvgInnerContent(markup: string) {
  const match = markup.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/i)
  return match ? match[1] : markup
}

/** Keep nested svg width/height aligned with viewBox so flatten does not bake resize scale. */
function normalizeQrSvgForDomConversion(markup: string) {
  const viewBox = readQrMarkupViewBox(markup)
  const inner = extractSvgInnerContent(markup)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewBox.width}" height="${viewBox.height}" viewBox="0 0 ${viewBox.width} ${viewBox.height}">${inner}</svg>`
}

/** Preview helper: QR modules in native viewBox coords; placement box stretches them on resize. */
export function buildDraftingQrPreviewModules(
  layer: DraftingCanvasLayer,
  qrMarkup: string,
  state: QrStudioState,
): DraftingQrPreviewModules | null {
  if (!qrMarkup) {
    return null
  }

  const shadowedQrMarkup = hasDraftingLayerShadow(layer)
    ? applyDraftingQrForegroundShadow(qrMarkup, layer)
    : qrMarkup
  const qrSvgMarkup = normalizeQrSvgForDomConversion(shadowedQrMarkup)
  const viewBox = readQrMarkupViewBox(qrSvgMarkup)
  const modules = convertQrSvgToDom(qrSvgMarkup, {
    width: viewBox.width,
    height: viewBox.height,
    idPrefix: layer.id,
  })

  return {
    layoutHeight: viewBox.height,
    layoutWidth: viewBox.width,
    nodes: modules,
  }
}

export function buildDraftingQrDomContent(
  layer: DraftingCanvasLayer,
  qrMarkup: string,
  state: QrStudioState,
): DraftingQrDomContent | null {
  if (!qrMarkup) {
    return null
  }

  const { layout, scaledQrMarkup } = getDraftingQrScaledMarkup(layer, qrMarkup, state)
  const backgroundMarkup = getDraftingQrBackgroundSvgMarkup(layer, state)
  const qrPositionedMarkup = `<g transform="translate(${layout.metrics.translateX} ${layout.metrics.translateY})">${scaledQrMarkup}</g>`
  const fullSvgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${layer.width}" height="${layer.height}" viewBox="0 0 ${layer.width} ${layer.height}" preserveAspectRatio="none">${backgroundMarkup}${qrPositionedMarkup}</svg>`

  if (state.dotMatrixAnimation.enabled && state.dotMatrixAnimation.animated) {
    return {
      kind: "svg",
      svgInner: fullSvgMarkup,
    }
  }

  const moduleChildren = convertQrSvgToDom(fullSvgMarkup, {
    width: layer.width,
    height: layer.height,
    idPrefix: layer.id,
  })

  return {
    kind: "modules",
    children: moduleChildren,
  }
}

function getDraftingQrLayerDom(
  layer: DraftingCanvasLayer,
  qrMarkup: string,
  state: QrStudioState,
): DomLayerNode {
  const baseNode: DomLayerNode = {
    kind: "qr",
    id: layer.id,
    bounds: {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
    },
    style: {
      ...getExportLayerPlacementStyle(layer),
      ...getExportLayerEffectStyle(layer),
      overflow: "visible",
    },
  }

  const domContent = buildDraftingQrDomContent(layer, qrMarkup, state)

  if (!domContent) {
    return baseNode
  }

  if (domContent.kind === "svg") {
    return {
      ...baseNode,
      svgInner: domContent.svgInner,
    }
  }

  return {
    ...baseNode,
    children: domContent.children,
  }
}

function getDraftingTextContent(layer: DraftingCanvasLayer) {
  return layoutDraftingText(layer).lines.join("\n")
}

function getDraftingTextRunsHtml(layer: DraftingCanvasLayer) {
  return getDraftingTextLayerRuns(layer)
    .map((run) => {
      const style = cssPropertiesToInlineStyle(getTextRunStyle(layer, run))
      return `<span style="${style}">${escapeHtml(run.text)}</span>`
    })
    .join("")
}

function getDraftingTextLayerRuns(layer: DraftingCanvasLayer): DraftingTextRun[] {
  const text = layer.text ?? ""

  if (!layer.textRuns?.length || layer.textRuns.map((run) => run.text).join("") !== text) {
    return text ? [{ text }] : []
  }

  return layer.textRuns
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function escapeXml(value: string) {
  return escapeHtml(value).replaceAll("'", "&apos;")
}
