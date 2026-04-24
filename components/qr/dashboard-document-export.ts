import type { FileExtension } from "qr-code-styling"

import {
  isDashboardQrNodeId,
  type DashboardComposeScene,
} from "@/components/qr/dashboard-compose-scene"
import {
  formatDashboardExportFileSize,
  getDashboardRasterExportScale,
  getLossyRasterEncoderQuality,
} from "@/components/qr/dashboard-raster-export"

export type DashboardDocumentExportMeasurement = {
  blobSizeBytes: number
  encoderQuality?: number
  extension: FileExtension
  height: number
  qualityPercent: number
  width: number
}

type DashboardDocumentExportOptions = {
  extension: FileExtension
  name: string
  qualityPercent: number
  scene: DashboardComposeScene
}

const DASHBOARD_DOCUMENT_EXPORT_MAX_DIMENSION = 4096

export { formatDashboardExportFileSize }

export async function downloadDashboardDocumentExport({
  extension,
  name,
  qualityPercent,
  scene,
}: DashboardDocumentExportOptions) {
  const result = await renderDashboardDocumentExport({
    extension,
    qualityPercent,
    scene,
  })

  downloadBlob(result.blob, `${name}.${extension}`)
}

export async function measureDashboardDocumentExport({
  extension,
  qualityPercent,
  scene,
}: Omit<DashboardDocumentExportOptions, "name">) {
  const result = await renderDashboardDocumentExport({
    extension,
    qualityPercent,
    scene,
  })

  return {
    blobSizeBytes: result.blob.size,
    encoderQuality: result.encoderQuality,
    extension: result.extension,
    height: result.height,
    qualityPercent: result.qualityPercent,
    width: result.width,
  } satisfies DashboardDocumentExportMeasurement
}

async function renderDashboardDocumentExport({
  extension,
  qualityPercent,
  scene,
}: Omit<DashboardDocumentExportOptions, "name">) {
  const svgMarkup = buildDashboardDocumentSvgMarkup(scene)

  if (extension === "svg") {
    return {
      blob: new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }),
      encoderQuality: undefined,
      extension,
      height: scene.canvasSize.height,
      qualityPercent,
      width: scene.canvasSize.width,
    }
  }

  const dimensions = getDashboardDocumentRasterDimensions(scene, qualityPercent)
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" })
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

  const mimeType = getMimeTypeForRasterExtension(extension)
  const encoderQuality =
    extension === "png" ? undefined : getLossyRasterEncoderQuality(qualityPercent)
  const blob = await canvasToBlob(canvas, mimeType, encoderQuality)

  return {
    blob,
    encoderQuality,
    extension,
    height: dimensions.height,
    qualityPercent,
    width: dimensions.width,
  }
}

function buildDashboardDocumentSvgMarkup(scene: DashboardComposeScene) {
  const pageRect = `<rect width="${scene.canvasSize.width}" height="${scene.canvasSize.height}" fill="${escapeAttribute(scene.document.backgroundColor)}" />`
  const nodesMarkup = [...scene.nodes]
    .filter((node) => node.isVisible)
    .sort((left, right) => left.zIndex - right.zIndex)
    .map((node) => {
      const transform = buildNodeTransform({
        height: node.naturalHeight,
        rotation: node.rotation,
        scale: node.scale,
        width: node.naturalWidth,
        x: node.x,
        y: node.y,
      })
      const style = [
        `opacity:${node.opacity}`,
        isDashboardQrNodeId(node.id) ? "mix-blend-mode:normal" : `mix-blend-mode:${node.blendMode}`,
      ].join(";")

      if (node.kind === "image") {
        return `<image href="${escapeAttribute(node.imageUrl)}" width="${node.naturalWidth}" height="${node.naturalHeight}" transform="${transform}" preserveAspectRatio="xMidYMid meet" style="${style}" />`
      }

      return `<g transform="${transform}" style="${style}">${node.originalSvgMarkup}</g>`
    })
    .join("")

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.canvasSize.width}" height="${scene.canvasSize.height}" viewBox="0 0 ${scene.canvasSize.width} ${scene.canvasSize.height}" fill="none">`,
    pageRect,
    nodesMarkup,
    "</svg>",
  ].join("")
}

function buildNodeTransform({
  height,
  rotation,
  scale,
  width,
  x,
  y,
}: {
  height: number
  rotation: number
  scale: number
  width: number
  x: number
  y: number
}) {
  const centerX = width * 0.5
  const centerY = height * 0.5

  return `translate(${x} ${y}) rotate(${rotation} ${centerX * scale} ${centerY * scale}) scale(${scale})`
}

function getDashboardDocumentRasterDimensions(
  scene: DashboardComposeScene,
  qualityPercent: number,
) {
  const requestedScale = getDashboardRasterExportScale(qualityPercent)
  const effectiveScale = Math.max(
    1,
    Math.min(
      requestedScale,
      DASHBOARD_DOCUMENT_EXPORT_MAX_DIMENSION / scene.canvasSize.width,
      DASHBOARD_DOCUMENT_EXPORT_MAX_DIMENSION / scene.canvasSize.height,
    ),
  )

  return {
    height: Math.max(1, Math.round(scene.canvasSize.height * effectiveScale)),
    requestedScale,
    scale: effectiveScale,
    width: Math.max(1, Math.round(scene.canvasSize.width * effectiveScale)),
  }
}

function getMimeTypeForRasterExtension(extension: Exclude<FileExtension, "svg">) {
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

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}
