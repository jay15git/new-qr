import type { DraftingCardState } from "@/features/workspace/model/card-state"
import { captureShaderCanvasSnapshot } from "@new-qr/qr-scene-export"

export async function captureCardShaderSnapshots(
  root: ParentNode | null,
  cardState: DraftingCardState,
) {
  if (!root) {
    return undefined
  }

  if (cardState.styleMode !== "paper-shader" && cardState.styleMode !== "image-filter") {
    return undefined
  }

  const canvas = root.querySelector<HTMLCanvasElement>(
    '[data-shader-canvas-host] canvas, [data-slot="dashboard-compose-card-paper-shader"] canvas, [data-slot="drafting-card-paper-shader-preview"] canvas',
  )

  if (!canvas) {
    return undefined
  }

  try {
    const snapshotUrl = await captureShaderCanvasSnapshot({
      canvas,
      width: canvas.width,
      height: canvas.height,
    })

    const shaderId =
      cardState.styleMode === "paper-shader"
        ? cardState.paperShader.shaderId
        : cardState.imageFilter.shaderId

    return {
      card: snapshotUrl,
      [shaderId]: snapshotUrl,
    }
  } catch {
    return undefined
  }
}
