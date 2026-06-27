import type { DomLayerNode } from "@new-qr/qr-scene-codegen"

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
  const shapeId = state.backgroundShapeId === "none" ? "rect" : state.backgroundShapeId

  return {
    layoutHeight,
    layoutWidth,
    nodes: [
      {
        kind: "module",
        id: `${layer.id}-qr-background`,
        bounds: {
          x: 0,
          y: 0,
          width: layoutWidth,
          height: layoutHeight,
        },
        style: {
          height: layoutHeight,
          left: 0,
          overflow: "visible",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          width: layoutWidth,
        },
        svgInner: previewSvg,
      },
    ],
    shapeId,
  }
}
