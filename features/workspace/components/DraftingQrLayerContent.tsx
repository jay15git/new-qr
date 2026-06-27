"use client"

import { memo, useMemo, type CSSProperties } from "react"

import { toPortableQrConfig } from "@/features/qr-code/adapters/portable-config"
import { BitjsonAnimatedQr } from "@/features/qr-code/components/BitjsonAnimatedQr"
import { shouldUseBitjsonMotionPreview } from "@/features/qr-code/motion/bitjson-bridge"
import type { QrStudioState } from "@/features/qr-code/model/state"
import {
  getDraftingQrDomPlacementStyle,
  getDraftingQrLayerLayout,
} from "@/features/qr-code/rendering/svg-extension"
import { DraftingQrBackground } from "@/features/workspace/components/QrBackground"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import { NewQrCode } from "@new-qr/qr/react"

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
  qrMarkup: _qrMarkup,
  shapeTiltInnerStyle,
  shapeTiltPerspectiveStyle,
  state,
}: DraftingQrLayerContentProps) {
  const layout = getDraftingQrLayerLayout(layer.width, state, layer.height)
  const qrPlacementStyle = getDraftingQrDomPlacementStyle(layout)
  const useAnimatedQr = shouldUseBitjsonMotionPreview(state) && Boolean(canvasSvgMarkup)
  const portableConfig = useMemo(() => toPortableQrConfig(state), [state])

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
        <div
          className="pointer-events-none z-10 overflow-hidden"
          data-slot="drafting-qr-component"
          style={{
            ...qrPlacementStyle,
            transformStyle: shapeTiltInnerStyle.transformStyle,
          }}
        >
          <NewQrCode {...portableConfig} />
        </div>
      </div>
    </div>
  )
})
