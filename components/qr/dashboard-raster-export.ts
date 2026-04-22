import QRCodeStyling, { type FileExtension } from "qr-code-styling"

import { createDashboardSurfaceQrState } from "@/components/qr/dashboard-qr-svg"
import { buildQrExtension } from "@/components/qr/qr-rendering"
import {
  clampQrSize,
  clampRasterExportQualityPercent,
  toQrCodeOptions,
  type QrStudioState,
} from "@/components/qr/qr-studio-state"

export const DASHBOARD_RASTER_EXPORT_QUALITY_PRESETS = [
  25,
  50,
  75,
  100,
] as const
export const DASHBOARD_RASTER_EXPORT_MAX_DIMENSION = 4096

export type DashboardRasterExtension = Exclude<FileExtension, "svg">

type DashboardRasterExportOptions = {
  extension: DashboardRasterExtension
  name: string
  qualityPercent: number
  state: QrStudioState
}

export type DashboardRasterExportMeasurement = {
  blobSizeBytes: number
  encoderQuality?: number
  extension: DashboardRasterExtension
  height: number
  qualityPercent: number
  width: number
}

export function isRasterExportExtension(
  extension: FileExtension,
): extension is DashboardRasterExtension {
  return extension !== "svg"
}

export function getDashboardRasterExportScale(qualityPercent: number) {
  const normalizedQualityPercent = clampRasterExportQualityPercent(qualityPercent)

  if (normalizedQualityPercent >= 100) {
    return 4
  }

  if (normalizedQualityPercent >= 75) {
    return 3
  }

  if (normalizedQualityPercent >= 50) {
    return 2
  }

  return 1
}

export function getDashboardRasterExportDimensions(
  state: QrStudioState,
  qualityPercent: number,
) {
  const requestedScale = getDashboardRasterExportScale(qualityPercent)
  const baseWidth = clampQrSize(state.width)
  const baseHeight = clampQrSize(state.height)
  const effectiveScale = Math.max(
    1,
    Math.min(
      requestedScale,
      DASHBOARD_RASTER_EXPORT_MAX_DIMENSION / baseWidth,
      DASHBOARD_RASTER_EXPORT_MAX_DIMENSION / baseHeight,
    ),
  )

  return {
    height: Math.max(1, Math.round(baseHeight * effectiveScale)),
    requestedScale,
    scale: effectiveScale,
    width: Math.max(1, Math.round(baseWidth * effectiveScale)),
  }
}

export function getLossyRasterEncoderQuality(qualityPercent: number) {
  return Math.max(0.25, clampRasterExportQualityPercent(qualityPercent) / 100)
}

export async function downloadDashboardRasterExport({
  extension,
  name,
  qualityPercent,
  state,
}: DashboardRasterExportOptions) {
  const result = await renderDashboardRasterExport({
    extension,
    qualityPercent,
    state,
  })

  downloadBlob(result.blob, `${name}.${extension}`)
}

export async function measureDashboardRasterExport({
  extension,
  qualityPercent,
  state,
}: Omit<DashboardRasterExportOptions, "name">) {
  const result = await renderDashboardRasterExport({
    extension,
    qualityPercent,
    state,
  })

  return {
    blobSizeBytes: result.blob.size,
    encoderQuality: result.encoderQuality,
    extension: result.extension,
    height: result.height,
    qualityPercent: result.qualityPercent,
    width: result.width,
  } satisfies DashboardRasterExportMeasurement
}

export function formatDashboardExportFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B"
  }

  const units = ["B", "KB", "MB", "GB"] as const
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const normalizedValue = bytes / 1024 ** unitIndex
  const decimals = normalizedValue >= 100 || unitIndex === 0 ? 0 : normalizedValue >= 10 ? 1 : 2

  return `${normalizedValue.toFixed(decimals)} ${units[unitIndex]}`
}

async function renderDashboardRasterExport({
  extension,
  qualityPercent,
  state,
}: Omit<DashboardRasterExportOptions, "name">) {
  const dimensions = getDashboardRasterExportDimensions(state, qualityPercent)
  const exportState = {
    ...createDashboardSurfaceQrState(state),
    height: dimensions.height,
    width: dimensions.width,
  }
  const qrCode = new QRCodeStyling(toQrCodeOptions(exportState))
  const qrExtension = buildQrExtension(exportState)

  if (qrExtension) {
    qrCode.applyExtension(qrExtension)
  }

  const rawSvg = await qrCode.getRawData("svg")

  if (!rawSvg) {
    throw new Error("QR SVG data is unavailable.")
  }

  const svgBlob = toExportBlob(rawSvg, "image/svg+xml")
  const image = await loadSvgBlobAsImage(svgBlob)
  const canvas = document.createElement("canvas")

  canvas.width = exportState.width
  canvas.height = exportState.height

  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("The browser could not create a canvas context for export.")
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const mimeType = getMimeTypeForRasterExtension(extension)
  const encoderQuality =
    extension === "png"
      ? undefined
      : getLossyRasterEncoderQuality(qualityPercent)
  const rasterBlob = await canvasToBlob(canvas, mimeType, encoderQuality)

  return {
    blob: rasterBlob,
    encoderQuality,
    extension,
    height: exportState.height,
    qualityPercent: clampRasterExportQualityPercent(qualityPercent),
    width: exportState.width,
  }
}

function getMimeTypeForRasterExtension(extension: DashboardRasterExtension) {
  switch (extension) {
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
  }
}

function toExportBlob(rawData: Blob | Buffer | Uint8Array, mimeType: string) {
  if (rawData instanceof Blob) {
    return rawData.type ? rawData : new Blob([rawData], { type: mimeType })
  }

  return new Blob([Uint8Array.from(rawData)], { type: mimeType })
}

async function loadSvgBlobAsImage(blob: Blob) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("The exported SVG could not be rasterized."))
    }
    image.src = objectUrl
  })
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
) {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("The raster export could not be encoded."))
        return
      }

      resolve(blob)
    }, mimeType, quality)
  })
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.download = fileName
  anchor.href = objectUrl
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}
