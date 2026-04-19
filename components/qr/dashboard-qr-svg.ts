import QRCodeStyling from "qr-code-styling"

import type { DashboardQrNodePayload } from "@/components/qr/dashboard-compose-scene"
import { buildQrExtension } from "@/components/qr/qr-rendering"
import { toQrCodeOptions, type QrStudioState } from "@/components/qr/qr-studio-state"

export function createDashboardSurfaceQrState(state: QrStudioState): QrStudioState {
  return {
    ...state,
    type: "svg",
  }
}

export function stripXmlDeclaration(markup: string) {
  return markup
    .replace(/<\?xml[\s\S]*?\?>\s*/i, "")
    .replace(/<!doctype[\s\S]*?>\s*/i, "")
    .trim()
}

export async function buildDashboardQrNodePayload(
  state: QrStudioState,
): Promise<DashboardQrNodePayload> {
  const dashboardState = createDashboardSurfaceQrState(state)
  const qrCode = new QRCodeStyling(toQrCodeOptions(dashboardState))
  const extension = buildQrExtension(dashboardState)

  if (extension) {
    qrCode.applyExtension(extension)
  }

  const rawData = await qrCode.getRawData("svg")

  if (!rawData) {
    throw new Error("QR SVG data is unavailable.")
  }

  const markup = await readQrMarkup(rawData)

  return {
    markup: stripXmlDeclaration(markup),
    naturalHeight: dashboardState.height,
    naturalWidth: dashboardState.width,
  }
}

async function readQrMarkup(rawData: Blob | Buffer | Uint8Array) {
  if (rawData instanceof Blob) {
    return rawData.text()
  }

  return new TextDecoder().decode(rawData)
}
