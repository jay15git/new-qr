import { buildDraftingQrStudioPreviewMarkup } from "@/features/qr-code/rendering/drafting-qr-preview"
import type { QrStudioState } from "@/features/qr-code/model/state"
import { clampQrSize } from "@/features/qr-code/model/state"

const DECODE_PROOF_SIZE = 512

async function loadSvgMarkupAsImage(markup: string): Promise<HTMLImageElement> {
  const blob = new Blob([markup], { type: "image/svg+xml" })

  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load QR preview image."))
    }
    image.src = objectUrl
  })
}

/** @deprecated Replaced by paulmillr/qr decode path in `features/qr-code/scan-safety/`. */
export async function rasterizeQrStudioPreview(
  state: QrStudioState,
  size = DECODE_PROOF_SIZE,
  backgroundColor = "#ffffff",
): Promise<HTMLCanvasElement> {
  const qrSize = clampQrSize(state.width)
  const markup = buildDraftingQrStudioPreviewMarkup(state, qrSize, qrSize)
  const image = await loadSvgMarkupAsImage(markup)
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Could not create canvas context for decode proof.")
  }

  context.clearRect(0, 0, size, size)
  context.fillStyle = backgroundColor
  context.fillRect(0, 0, size, size)
  context.drawImage(image, 0, 0, size, size)

  return canvas
}

/** @deprecated Replaced by paulmillr/qr decode path in `features/qr-code/scan-safety/`. */
export async function decodeQrStudioPreview(
  state: QrStudioState,
  backgroundColor = "#ffffff",
): Promise<string | null> {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const { default: QrScanner } = await import("qr-scanner")
    const canvas = await rasterizeQrStudioPreview(state, DECODE_PROOF_SIZE, backgroundColor)

    const result = await QrScanner.scanImage(canvas, {
      returnDetailedScanResult: true,
    })

    if (typeof result === "string") {
      return result
    }

    return result.data ?? null
  } catch {
    return null
  }
}
