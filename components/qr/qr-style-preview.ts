import qrcode from "qrcode-generator"

export const STYLE_PREVIEW_SAMPLE_DATA = "https://example.com"

const STYLE_PREVIEW_CROP_SIZE = 7
const STYLE_PREVIEW_CROP_START = 6
const STYLE_PREVIEW_ERROR_CORRECTION_LEVEL = "Q"
const STYLE_PREVIEW_MODE = "Byte"

export const DOT_STYLE_PREVIEW_ROWS = Object.freeze(
  buildDotStylePreviewRows(),
) as ReadonlyArray<string>

export function isDotStylePreviewDark(rowIndex: number, columnIndex: number) {
  return DOT_STYLE_PREVIEW_ROWS[rowIndex]?.[columnIndex] === "1"
}

export function getDotStylePreviewNeighbor(
  rowIndex: number,
  columnIndex: number,
  offsetX: number,
  offsetY: number,
) {
  return isDotStylePreviewDark(rowIndex + offsetY, columnIndex + offsetX)
}

function buildDotStylePreviewRows() {
  const qr = qrcode(0, STYLE_PREVIEW_ERROR_CORRECTION_LEVEL)
  qr.addData(STYLE_PREVIEW_SAMPLE_DATA, STYLE_PREVIEW_MODE)
  qr.make()

  const moduleCount = qr.getModuleCount()
  const start = STYLE_PREVIEW_CROP_START

  if (start < 0 || start + STYLE_PREVIEW_CROP_SIZE > moduleCount) {
    throw new Error("QR preview crop exceeds the generated module matrix.")
  }

  return Array.from({ length: STYLE_PREVIEW_CROP_SIZE }, (_, rowOffset) =>
    Array.from({ length: STYLE_PREVIEW_CROP_SIZE }, (_, columnOffset) =>
      qr.isDark(start + rowOffset, start + columnOffset) ? "1" : "0",
    ).join(""),
  )
}
