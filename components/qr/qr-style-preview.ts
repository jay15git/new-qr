import qrcode from "qrcode-generator"

export const STYLE_PREVIEW_SAMPLE_DATA = "https://example.com"

const STYLE_PREVIEW_CROP_SIZE = 9
const STYLE_PREVIEW_CROP_START_COLUMN = 0
const STYLE_PREVIEW_CROP_START_ROW = 8
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
  const startColumn = STYLE_PREVIEW_CROP_START_COLUMN
  const startRow = STYLE_PREVIEW_CROP_START_ROW

  if (
    startRow < 0 ||
    startColumn < 0 ||
    startRow + STYLE_PREVIEW_CROP_SIZE > moduleCount ||
    startColumn + STYLE_PREVIEW_CROP_SIZE > moduleCount
  ) {
    throw new Error("QR preview crop exceeds the generated module matrix.")
  }

  return Array.from({ length: STYLE_PREVIEW_CROP_SIZE }, (_, rowOffset) =>
    Array.from({ length: STYLE_PREVIEW_CROP_SIZE }, (_, columnOffset) =>
      qr.isDark(startRow + rowOffset, startColumn + columnOffset) ? "1" : "0",
    ).join(""),
  )
}
