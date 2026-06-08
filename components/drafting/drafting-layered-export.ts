import type { DraftingCardState } from "@/components/drafting/drafting-card-state"
import {
  DEFAULT_DRAFTING_TEXT_LAYER,
  type DraftingCanvasLayer,
  type DraftingTextRun,
} from "@/components/drafting/drafting-layer-state"
import {
  ensureDraftingFontsForLayers,
  getDraftingFontCssFamily,
} from "@/components/drafting/drafting-font-registry"
import { layoutDraftingText } from "@/components/drafting/drafting-text-layout"
import {
  applyDraftingQrForegroundShadow,
  hasDraftingLayerShadow,
} from "@/components/drafting/drafting-qr-layer-shadow"
import {
  createDraftingQrArtworkState,
  sanitizeDraftingQrArtworkMarkup,
} from "@/components/drafting/drafting-qr-artwork"
import {
  getDraftingQrBackgroundBounds,
  getDraftingQrBackgroundSvgMarkup,
} from "@/components/drafting/drafting-qr-background"
import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import type { QrStudioState } from "@/components/qr/qr-studio-state"

export async function downloadDraftingSvgExport({
  name,
  state,
}: {
  name: string
  state: QrStudioState
}) {
  const payload = await buildDashboardQrNodePayload(state, { animationMode: "export" })
  const blob = new Blob([payload.markup], { type: "image/svg+xml;charset=utf-8" })

  downloadBlob(blob, `${name}.svg`)
}

export async function buildDraftingLayeredNodePayload({
  cardState,
  layers,
  name,
  nodeId,
  state,
}: {
  cardState: DraftingCardState
  layers: DraftingCanvasLayer[]
  name: string
  nodeId: string
  state: QrStudioState
}) {
  await ensureDraftingFontsForLayers(layers)

  const qrPayload = await buildDashboardQrNodePayload(createDraftingQrArtworkState(state), {
    animationMode: "export",
  })
  const qrArtworkMarkup = sanitizeDraftingQrArtworkMarkup(qrPayload.markup)
  const visibleLayers = layers
    .filter((layer) => layer.isVisible)
    .sort((a, b) => a.zIndex - b.zIndex)
  const bounds = getDraftingLayerBounds(visibleLayers, state)

  return {
    id: nodeId,
    name,
    naturalHeight: bounds.height,
    naturalWidth: bounds.width,
    originalSvgMarkup: buildDraftingLayeredSvgMarkup({
      bounds,
      cardState,
      layers: visibleLayers,
      qrMarkup: qrArtworkMarkup,
      state,
    }),
  }
}

type DraftingLayerBounds = {
  height: number
  minX: number
  minY: number
  width: number
}

function buildDraftingLayeredSvgMarkup({
  bounds,
  cardState,
  layers,
  qrMarkup,
  state,
}: {
  bounds: DraftingLayerBounds
  cardState: DraftingCardState
  layers: DraftingCanvasLayer[]
  qrMarkup: string
  state: QrStudioState
}) {
  const defs = layers
    .flatMap(getDraftingLayerFilterMarkups)
    .filter(Boolean)
    .join("")
  const body = layers
    .map((layer) =>
      layer.kind === "group"
        ? getDraftingGroupLayerSvg(layer, cardState, qrMarkup, state)
        : layer.kind === "card"
          ? getDraftingCardLayerSvg(layer, cardState)
          : layer.kind === "text"
            ? getDraftingTextLayerSvg(layer)
            : getDraftingQrLayerSvg(layer, qrMarkup, state),
    )
    .join("")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}"><defs>${defs}</defs>${body}</svg>`
}

function getDraftingLayerBounds(
  layers: DraftingCanvasLayer[],
  state: QrStudioState,
): DraftingLayerBounds {
  if (layers.length === 0) {
    return {
      height: 1,
      minX: 0,
      minY: 0,
      width: 1,
    }
  }

  const visualBounds = layers.map((layer) => {
    if (layer.kind === "qr") {
      return getDraftingQrBackgroundBounds(layer, state)
    }

    return {
      maxX: layer.x + layer.width,
      maxY: layer.y + layer.height,
      minX: layer.x,
      minY: layer.y,
    }
  })
  const minX = Math.floor(Math.min(...visualBounds.map((bounds) => bounds.minX)))
  const minY = Math.floor(Math.min(...visualBounds.map((bounds) => bounds.minY)))
  const maxX = Math.ceil(Math.max(...visualBounds.map((bounds) => bounds.maxX)))
  const maxY = Math.ceil(Math.max(...visualBounds.map((bounds) => bounds.maxY)))

  return {
    height: Math.max(1, maxY - minY),
    minX,
    minY,
    width: Math.max(1, maxX - minX),
  }
}

function getDraftingLayerFilterMarkup(layer: DraftingCanvasLayer) {
  const hasShadow =
    layer.kind !== "qr" &&
    layer.shadow.opacity > 0 &&
    (layer.shadow.blur > 0 || layer.shadow.offsetX !== 0 || layer.shadow.offsetY !== 0)
  const hasBlur = layer.blur > 0

  if (!hasShadow && !hasBlur) {
    return ""
  }

  return `<filter id="${getSvgId(layer.id)}-filter" x="-50%" y="-50%" width="200%" height="200%">${hasShadow ? `<feDropShadow dx="${layer.shadow.offsetX}" dy="${layer.shadow.offsetY}" stdDeviation="${layer.shadow.blur / 2}" flood-color="${escapeXml(layer.shadow.color)}" flood-opacity="${layer.shadow.opacity / 100}"/>` : ""}${hasBlur ? `<feGaussianBlur stdDeviation="${layer.blur}"/>` : ""}</filter>`
}

function getDraftingLayerFilterMarkups(layer: DraftingCanvasLayer): string[] {
  return [
    getDraftingLayerFilterMarkup(layer),
    ...(layer.children?.flatMap(getDraftingLayerFilterMarkups) ?? []),
  ].filter(Boolean)
}

function getDraftingCardLayerSvg(layer: DraftingCanvasLayer, cardState: DraftingCardState) {
  const filter = getDraftingLayerFilterMarkup(layer)
    ? ` filter="url(#${getSvgId(layer.id)}-filter)"`
    : ""
  const strokeWidth = Math.max(0, cardState.border.width)
  const stroke =
    strokeWidth > 0
      ? ` stroke="${escapeXml(cardState.border.color)}" stroke-opacity="${cardState.border.opacity / 100}" stroke-width="${strokeWidth}"`
      : ""

  return `<g opacity="${layer.opacity}" transform="${getDraftingLayerSvgTransform(layer)}"${filter}><rect x="0" y="0" width="${layer.width}" height="${layer.height}" rx="${cardState.cornerRadius}" fill="${escapeXml(cardState.fill)}"${stroke}/></g>`
}

function getDraftingGroupLayerSvg(
  layer: DraftingCanvasLayer,
  cardState: DraftingCardState,
  qrMarkup: string,
  state: QrStudioState,
): string {
  const filter = getDraftingLayerFilterMarkup(layer)
    ? ` filter="url(#${getSvgId(layer.id)}-filter)"`
    : ""
  const body: string = (layer.children ?? [])
    .filter((child) => child.isVisible)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((child) =>
      child.kind === "group"
        ? getDraftingGroupLayerSvg(child, cardState, qrMarkup, state)
        : child.kind === "card"
          ? getDraftingCardLayerSvg(child, cardState)
          : child.kind === "text"
            ? getDraftingTextLayerSvg(child)
            : getDraftingQrLayerSvg(child, qrMarkup, state),
    )
    .join("")

  return `<g opacity="${layer.opacity}" transform="${getDraftingLayerSvgTransform(layer)}"${filter}>${body}</g>`
}

function getDraftingQrLayerSvg(
  layer: DraftingCanvasLayer,
  qrMarkup: string,
  state: QrStudioState,
) {
  const filter = getDraftingLayerFilterMarkup(layer)
    ? ` filter="url(#${getSvgId(layer.id)}-filter)"`
    : ""
  const shadowedQrMarkup = hasDraftingLayerShadow(layer)
    ? applyDraftingQrForegroundShadow(qrMarkup, layer)
    : qrMarkup

  return `<g opacity="${layer.opacity}" transform="${getDraftingLayerSvgTransform(layer)}"${filter}>${getDraftingQrBackgroundSvgMarkup(layer, state)}${scaleNestedSvgMarkup(shadowedQrMarkup, layer.width, layer.height)}</g>`
}

function getDraftingTextLayerSvg(layer: DraftingCanvasLayer) {
  const filter = getDraftingLayerFilterMarkup(layer)
    ? ` filter="url(#${getSvgId(layer.id)}-filter)"`
    : ""
  const fontSize = layer.fontSize ?? DEFAULT_DRAFTING_TEXT_LAYER.fontSize
  const lineHeight = layer.lineHeight ?? DEFAULT_DRAFTING_TEXT_LAYER.lineHeight
  const textAlign = layer.textAlign ?? DEFAULT_DRAFTING_TEXT_LAYER.textAlign
  const anchor = textAlign === "center" ? "middle" : textAlign === "right" ? "end" : "start"
  const x = textAlign === "center" ? layer.width / 2 : textAlign === "right" ? layer.width : 0
  const hasTextRuns =
    Boolean(layer.textRuns?.length) &&
    layer.textRuns?.map((run) => run.text).join("") === (layer.text ?? "")

  if (!hasTextRuns) {
    const lines = layoutDraftingText(layer).lines
    const tspans = lines
      .map((line, index) => {
        const dy = index === 0 ? fontSize : fontSize * lineHeight

        return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`
      })
      .join("")
    const decoration = layer.underline ? ` text-decoration="underline"` : ""

    return `<g opacity="${layer.opacity}" transform="${getDraftingLayerSvgTransform(layer)}"${filter}><text fill="${escapeXml(layer.fill ?? DEFAULT_DRAFTING_TEXT_LAYER.fill)}" font-family="${escapeXml(getDraftingFontCssFamily({ fontFamily: layer.fontFamily, fontId: layer.fontId }))}" font-size="${fontSize}" font-style="${layer.fontStyle ?? DEFAULT_DRAFTING_TEXT_LAYER.fontStyle}" font-weight="${layer.fontWeight ?? DEFAULT_DRAFTING_TEXT_LAYER.fontWeight}" letter-spacing="${layer.letterSpacing ?? DEFAULT_DRAFTING_TEXT_LAYER.letterSpacing}" text-anchor="${anchor}"${decoration}>${tspans}</text></g>`
  }

  const lineRuns = splitDraftingTextRunsByLine(layer)
  const tspans = lineRuns
    .map((runs, lineIndex) => {
      const dy = lineIndex === 0 ? fontSize : fontSize * lineHeight
      const content = runs.map((run) => getDraftingTextRunSvg(layer, run)).join("")

      return `<tspan x="${x}" dy="${dy}">${content}</tspan>`
    })
    .join("")

  return `<g opacity="${layer.opacity}" transform="${getDraftingLayerSvgTransform(layer)}"${filter}><text letter-spacing="${layer.letterSpacing ?? DEFAULT_DRAFTING_TEXT_LAYER.letterSpacing}" text-anchor="${anchor}">${tspans}</text></g>`
}

function splitDraftingTextRunsByLine(layer: DraftingCanvasLayer) {
  const runs = getDraftingTextLayerRuns(layer)
  const lines: DraftingTextRun[][] = [[]]

  for (const run of runs) {
    const parts = run.text.split(/\r?\n/)

    parts.forEach((part, index) => {
      if (index > 0) {
        lines.push([])
      }

      if (part) {
        lines.at(-1)?.push({ ...run, text: part })
      }
    })
  }

  return lines.length > 0 ? lines : [[{ text: "" }]]
}

function getDraftingTextLayerRuns(layer: DraftingCanvasLayer): DraftingTextRun[] {
  const text = layer.text ?? ""

  if (!layer.textRuns?.length || layer.textRuns.map((run) => run.text).join("") !== text) {
    return text ? [{ text }] : []
  }

  return layer.textRuns
}

function getDraftingTextRunSvg(layer: DraftingCanvasLayer, run: DraftingTextRun) {
  const decoration = (run.underline ?? layer.underline) ? ` text-decoration="underline"` : ""

  return `<tspan fill="${escapeXml(run.fill ?? layer.fill ?? DEFAULT_DRAFTING_TEXT_LAYER.fill)}" font-family="${escapeXml(getDraftingFontCssFamily({ fontFamily: run.fontFamily ?? layer.fontFamily, fontId: run.fontId ?? layer.fontId }))}" font-size="${run.fontSize ?? layer.fontSize ?? DEFAULT_DRAFTING_TEXT_LAYER.fontSize}" font-style="${run.fontStyle ?? layer.fontStyle ?? DEFAULT_DRAFTING_TEXT_LAYER.fontStyle}" font-weight="${run.fontWeight ?? layer.fontWeight ?? DEFAULT_DRAFTING_TEXT_LAYER.fontWeight}"${decoration}>${escapeXml(run.text)}</tspan>`
}

function getDraftingLayerSvgTransform(layer: DraftingCanvasLayer) {
  const centerX = layer.width / 2
  const centerY = layer.height / 2

  return `translate(${layer.x} ${layer.y}) rotate(${layer.rotation} ${centerX} ${centerY})`
}

function scaleNestedSvgMarkup(markup: string, width: number, height: number) {
  const withScaledSelfClosingSvg = markup.replace(
    /<svg\b([^>]*)\/>/i,
    (_match, attributes: string) => {
      const nextAttributes = cleanNestedSvgAttributes(attributes)

      return `<svg${nextAttributes} width="${width}" height="${height}" preserveAspectRatio="none"></svg>`
    },
  )

  if (withScaledSelfClosingSvg !== markup) {
    return withScaledSelfClosingSvg
  }

  return markup.replace(
    /<svg\b([^>]*)>/i,
    (_match, attributes: string) => {
      const nextAttributes = cleanNestedSvgAttributes(attributes)

      return `<svg${nextAttributes} width="${width}" height="${height}" preserveAspectRatio="none">`
    },
  )
}

function cleanNestedSvgAttributes(attributes: string) {
  return String(attributes)
    .replace(/\swidth="[^"]*"/i, "")
    .replace(/\sheight="[^"]*"/i, "")
    .replace(/\spreserveAspectRatio="[^"]*"/i, "")
}

function getSvgId(value: string) {
  return value.replace(/[^\w-]+/g, "-")
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.download = fileName
  anchor.href = objectUrl
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}
