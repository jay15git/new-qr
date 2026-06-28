import qrcode from "qrcode-generator"

import type { QrStudioState } from "@/features/qr-code/model/state"

const MIN_MODULE_PX = 3

export function getQrModuleCount(state: QrStudioState): number {
  const ecc = state.qrOptions.errorCorrectionLevel
  const qr = qrcode(state.qrOptions.typeNumber || 0, ecc)
  qr.addData(state.data.trim() || "https://example.com", state.qrOptions.mode)
  qr.make()
  return qr.getModuleCount()
}

export function getModulePixelSize(state: QrStudioState): number {
  const moduleCount = getQrModuleCount(state)
  const margin = Math.max(0, Math.floor(state.margin))
  const totalModules = moduleCount + margin * 2
  const qrSize = Math.max(1, state.width)

  return qrSize / totalModules
}

export function isModuleSizeTooSmall(state: QrStudioState): boolean {
  return getModulePixelSize(state) < MIN_MODULE_PX
}

export { MIN_MODULE_PX }
