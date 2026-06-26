"use client"

import { memo, useMemo, type CSSProperties } from "react"

import { BitjsonAnimatedQr } from "@/features/qr-code/components/BitjsonAnimatedQr"
import { shouldUseBitjsonMotionPreview } from "@/features/qr-code/motion/bitjson-bridge"
import type { QrStudioState } from "@/features/qr-code/model/state"
import {
  getDraftingQrDomPlacementStyle,
  getDraftingQrLayerLayout,
} from "@/features/qr-code/rendering/svg-extension"
import { DraftingQrBackground } from "@/features/workspace/components/QrBackground"
import { buildDraftingQrPreviewScaledMarkup } from "@/features/workspace/export/layered-dom-parts"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"

type DraftingQrLayerContentProps = {
  canvasSvgMarkup: string | null
  layer: DraftingCanvasLayer
  qrMarkup: string
  shapeTiltInnerStyle: CSSProperties
  shapeTiltPerspectiveStyle: CSSProperties
  state: QrStudioState
}

export const DraftingQrLayerContent = memo(function DraftingQrLayerContent({
  canvasSvgMarkup,
  layer,
  qrMarkup,
  shapeTiltInnerStyle,
  shapeTiltPerspectiveStyle,
  state,
}: DraftingQrLayerContentProps) {
  const layout = getDraftingQrLayerLayout(layer.width, state)
  const qrPlacementStyle = getDraftingQrDomPlacementStyle(layout)
  const useAnimatedQr = shouldUseBitjsonMotionPreview(state) && Boolean(canvasSvgMarkup)
  const scaledQrMarkup = useMemo(
    () => (useAnimatedQr ? null : buildDraftingQrPreviewScaledMarkup(layer, qrMarkup, state)),
    [layer.height, layer.id, layer.width, qrMarkup, state, useAnimatedQr],
  )

  if (useAnimatedQr) {
    return (
      <div className="relative h-full w-full" style={shapeTiltPerspectiveStyle}>
        <div className="relative h-full w-full" style={shapeTiltInnerStyle}>
          <DraftingQrBackground layer={layer} state={state} />
          <BitjsonAnimatedQr
            canvasSvgMarkup={canvasSvgMarkup}
            height={layout.innerHeight}
            state={state}
            style={{
              ...qrPlacementStyle,
              transformStyle: shapeTiltInnerStyle.transformStyle,
              zIndex: 10,
            }}
            width={layout.innerWidth}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full" style={shapeTiltPerspectiveStyle}>
      <div className="relative h-full w-full" style={shapeTiltInnerStyle}>
        <DraftingQrBackground layer={layer} state={state} />
        {scaledQrMarkup ? (
          <div
            className="pointer-events-none z-10 max-h-none max-w-none [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: scaledQrMarkup }}
            data-slot="drafting-qr-dom"
            style={{
              ...qrPlacementStyle,
              transformStyle: shapeTiltInnerStyle.transformStyle,
            }}
          />
        ) : null}
      </div>
    </div>
  )
})
