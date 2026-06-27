import { convertQrSvgToDom, type DomLayerNode } from "@new-qr/qr-scene-codegen"

import { buildDraftingQrBackgroundPreviewSvgMarkup } from "@/features/workspace/components/QrBackground"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import type { QrStudioState } from "@/features/qr-code/model/state"
import { getDraftingQrLayerLayout } from "@/features/qr-code/rendering/svg-extension"

export type DraftingQrBackgroundDomModules = {
  layoutHeight: number
  layoutWidth: number
  nodes: DomLayerNode[]
  shapeId: string
}

function applyBackgroundShapeDomEffects(
  nodes: DomLayerNode[],
  state: QrStudioState,
): DomLayerNode[] {
  if (nodes.length === 0) {
    return nodes
  }

  const { shadowOpacity, shadowOffsetX, shadowOffsetY, edgeBlur, shadowColor } =
    state.backgroundShapeOptions
  const hasShadow =
    shadowOpacity > 0 &&
    (edgeBlur > 0 || shadowOffsetX !== 0 || shadowOffsetY !== 0)

  if (!hasShadow) {
    return nodes
  }

  const alpha = Math.max(0, Math.min(100, shadowOpacity)) / 100
  const [r, g, b] = hexToRgb(shadowColor)
  const boxShadow = `${shadowOffsetX}px ${shadowOffsetY}px ${Math.max(0, edgeBlur)}px rgba(${r}, ${g}, ${b}, ${alpha})`

  return nodes.map((node, index) =>
    index === 0
      ? {
          ...node,
          style: {
            ...node.style,
            boxShadow,
          },
        }
      : node,
  )
}

function hexToRgb(color: string) {
  const normalized = color.trim().replace("#", "")
  if (normalized.length !== 6) {
    return [0, 0, 0] as const
  }

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ] as const
}

export function buildDraftingQrBackgroundDomModules(
  layer: DraftingCanvasLayer,
  state: QrStudioState,
): DraftingQrBackgroundDomModules | null {
  const previewSvg = buildDraftingQrBackgroundPreviewSvgMarkup(layer, state)
  if (!previewSvg) {
    return null
  }

  const layout = getDraftingQrLayerLayout(layer.width, state, layer.height)
  const layoutWidth = Math.max(1, layout.metrics.outerWidth)
  const layoutHeight = Math.max(1, layout.metrics.outerHeight)
  const nodes = convertQrSvgToDom(previewSvg, {
    height: layoutHeight,
    idPrefix: `${layer.id}-qr-background`,
    width: layoutWidth,
  })

  if (nodes.length === 0) {
    return null
  }

  const shapeId = state.backgroundShapeId === "none" ? "rect" : state.backgroundShapeId

  return {
    layoutHeight,
    layoutWidth,
    nodes: applyBackgroundShapeDomEffects(nodes, state),
    shapeId,
  }
}
