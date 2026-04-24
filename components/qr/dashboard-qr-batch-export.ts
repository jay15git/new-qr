import { zipSync } from "fflate"
import type { FileExtension } from "qr-code-styling"

import type { DashboardComposeSvgNode } from "@/components/qr/dashboard-compose-scene"
import {
  getDashboardRasterExportScale,
  getLossyRasterEncoderQuality,
  type DashboardRasterExtension,
} from "@/components/qr/dashboard-raster-export"

const DASHBOARD_QR_NODE_EXPORT_MAX_DIMENSION = 4096

export type DashboardQrFileExportNode = Pick<
  DashboardComposeSvgNode,
  "id" | "name" | "naturalHeight" | "naturalWidth" | "originalSvgMarkup"
>

type DashboardQrNodeExportOptions = {
  extension: FileExtension
  name: string
  node: DashboardQrFileExportNode
  qualityPercent: number
}

type DashboardQrBatchZipExportOptions = {
  extension: FileExtension
  name: string
  nodes: DashboardQrFileExportNode[]
  qualityPercent: number
}

export async function downloadDashboardQrNodeExport({
  extension,
  name,
  node,
  qualityPercent,
}: DashboardQrNodeExportOptions) {
  const result = await renderDashboardQrNodeExport({
    extension,
    node,
    qualityPercent,
  })

  downloadBlob(result.blob, `${sanitizeDownloadFileName(name)}.${extension}`)
}

export async function downloadDashboardQrBatchZipExport({
  extension,
  name,
  nodes,
  qualityPercent,
}: DashboardQrBatchZipExportOptions) {
  const files = await Promise.all(
    nodes.map(async (node) => {
      const result = await renderDashboardQrNodeExport({
        extension,
        node,
        qualityPercent,
      })

      return {
        data: new Uint8Array(await result.blob.arrayBuffer()),
        name: node.name,
      }
    }),
  )
  const fileNameCounts = new Map<string, number>()
  const zipped = zipSync(
    Object.fromEntries(
      files.map((file) => [
        getUniqueDownloadFileName(file.name, extension, fileNameCounts),
        file.data,
      ]),
    ),
    {
      level: extension === "png" ? 0 : 6,
      mtime: new Date("1980-01-01T00:00:00.000Z"),
    },
  )
  const zipBuffer = (zipped.buffer as ArrayBuffer).slice(
    zipped.byteOffset,
    zipped.byteOffset + zipped.byteLength,
  )

  downloadBlob(
    new Blob([zipBuffer], { type: "application/zip" }),
    `${sanitizeDownloadFileName(name)}.zip`,
  )
}

async function renderDashboardQrNodeExport({
  extension,
  node,
  qualityPercent,
}: Omit<DashboardQrNodeExportOptions, "name">) {
  if (extension === "svg") {
    return {
      blob: new Blob([node.originalSvgMarkup], {
        type: "image/svg+xml;charset=utf-8",
      }),
      extension,
    }
  }

  const dimensions = getDashboardQrNodeRasterDimensions(node, qualityPercent)
  const svgBlob = new Blob([node.originalSvgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  })
  const image = await loadSvgBlobAsImage(svgBlob)
  const canvas = document.createElement("canvas")

  canvas.width = dimensions.width
  canvas.height = dimensions.height

  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("The browser could not create a canvas context for export.")
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return {
    blob: await canvasToBlob(
      canvas,
      getMimeTypeForRasterExtension(extension),
      extension === "png" ? undefined : getLossyRasterEncoderQuality(qualityPercent),
    ),
    extension,
  }
}

function getDashboardQrNodeRasterDimensions(
  node: DashboardQrFileExportNode,
  qualityPercent: number,
) {
  const requestedScale = getDashboardRasterExportScale(qualityPercent)
  const effectiveScale = Math.max(
    1,
    Math.min(
      requestedScale,
      DASHBOARD_QR_NODE_EXPORT_MAX_DIMENSION / node.naturalWidth,
      DASHBOARD_QR_NODE_EXPORT_MAX_DIMENSION / node.naturalHeight,
    ),
  )

  return {
    height: Math.max(1, Math.round(node.naturalHeight * effectiveScale)),
    width: Math.max(1, Math.round(node.naturalWidth * effectiveScale)),
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

function getUniqueDownloadFileName(
  name: string,
  extension: FileExtension,
  counts: Map<string, number>,
) {
  const baseName = sanitizeDownloadFileName(name)
  const nextCount = (counts.get(baseName) ?? 0) + 1

  counts.set(baseName, nextCount)

  return `${baseName}${nextCount > 1 ? `-${nextCount}` : ""}.${extension}`
}

function sanitizeDownloadFileName(name: string) {
  const sanitized = name
    .replace(/[\u0000-\u001f<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim()

  return sanitized || "QR Code"
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
