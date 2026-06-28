import { buildDraftingQrStudioPreviewMarkup } from "@/features/qr-code/rendering/drafting-qr-preview"
import { rasterizeSvgMarkupToCanvas } from "@/features/qr-code/rendering/svg-raster"
import type { QrStudioState } from "@/features/qr-code/model/state"

export const DECODE_PREVIEW_SIZE = 512

export async function rasterizeStudioPreview(
  state: QrStudioState,
  size = DECODE_PREVIEW_SIZE,
  backgroundColor = "#ffffff",
): Promise<HTMLCanvasElement> {
  const markup = buildDraftingQrStudioPreviewMarkup(state, size, size)

  return rasterizeSvgMarkupToCanvas(markup, size, size, { backgroundColor })
}
