import type { DomLayerNode } from "@new-qr/qr-scene-codegen"

import { buildDraftingQrBackgroundSvgPayload } from "@/features/workspace/components/QrBackground"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import type { QrStudioState } from "@/features/qr-code/model/state"

export type DraftingQrBackgroundDomModules = {
  layoutHeight: number
  layoutWidth: number
  nodes: DomLayerNode[]
  shapeId: string
}

/** @deprecated Use buildDraftingQrBackgroundSvgPayload for new code. */
export function buildDraftingQrBackgroundDomModules(
  layer: DraftingCanvasLayer,
  state: QrStudioState,
): DraftingQrBackgroundDomModules | null {
  const payload = buildDraftingQrBackgroundSvgPayload(layer, state)
  if (!payload) {
    return null
  }

  return {
    layoutHeight: payload.height,
    layoutWidth: payload.width,
    nodes: [
      {
        kind: "module",
        id: `${layer.id}-qr-background`,
        bounds: {
          x: 0,
          y: 0,
          width: payload.width,
          height: payload.height,
        },
        style: {
          height: payload.height,
          left: 0,
          overflow: "visible",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          width: payload.width,
        },
        svgInner: payload.markup,
      },
    ],
    shapeId: payload.shapeId,
  }
}
