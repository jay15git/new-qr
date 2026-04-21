"use client"

import jsQR from "jsqr"

import type { DashboardComposeNode, DashboardComposeScene } from "@/components/qr/dashboard-compose-scene"
import { getDashboardComposeNode } from "@/components/qr/dashboard-compose-scene"
import type { QrQualityDecodeResult } from "@/components/qr/qr-quality"
import type { QrStudioState } from "@/components/qr/qr-studio-state"

const CANVAS_BACKGROUND_FALLBACK = "#ffffff"

export async function decodeDashboardQrScene(
  state: QrStudioState,
  scene: DashboardComposeScene,
): Promise<QrQualityDecodeResult> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      kind: "unverified",
      reason: "This environment cannot rasterize the composed dashboard scene.",
    }
  }

  const qrNode = getDashboardComposeNode(scene)

  if (!qrNode || !qrNode.isVisible) {
    return {
      kind: "failure",
      scaleTried: null,
    }
  }

  for (const scale of [1, 2] as const) {
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(scene.canvasSize.width * scale))
    canvas.height = Math.max(1, Math.round(scene.canvasSize.height * scale))

    const context = canvas.getContext("2d")

    if (!context) {
      return {
        kind: "unverified",
        reason: "The browser could not create a canvas context for verification.",
      }
    }

    context.save()
    context.scale(scale, scale)
    drawSceneBackground(context, scene)

    try {
      for (const node of getRenderableSceneNodes(scene)) {
        await drawComposeNode(context, node)
      }
    } catch (error) {
      return getUnverifiedDecodeResult(state, error)
    } finally {
      context.restore()
    }

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const decoded = jsQR(imageData.data, canvas.width, canvas.height, {
        inversionAttempts: "attemptBoth",
      })

      if (decoded?.data) {
        return {
          data: decoded.data,
          kind: "success",
          scale,
        }
      }
    } catch (error) {
      return getUnverifiedDecodeResult(state, error)
    }
  }

  return {
    kind: "failure",
    scaleTried: 2,
  }
}

function getRenderableSceneNodes(scene: DashboardComposeScene) {
  return [...scene.nodes]
    .filter((node) => node.isVisible)
    .sort((left, right) => left.zIndex - right.zIndex)
}

function drawSceneBackground(
  context: CanvasRenderingContext2D,
  scene: DashboardComposeScene,
) {
  if (scene.background.mode === "transparent") {
    context.fillStyle = CANVAS_BACKGROUND_FALLBACK
    context.fillRect(0, 0, scene.canvasSize.width, scene.canvasSize.height)
    return
  }

  if (scene.background.mode === "solid") {
    context.fillStyle = scene.background.color
    context.fillRect(0, 0, scene.canvasSize.width, scene.canvasSize.height)
    return
  }

  const [start, end] = scene.background.gradient.colorStops

  if (scene.background.gradient.type === "radial") {
    const gradient = context.createRadialGradient(
      scene.canvasSize.width * 0.5,
      scene.canvasSize.height * 0.5,
      0,
      scene.canvasSize.width * 0.5,
      scene.canvasSize.height * 0.5,
      Math.max(scene.canvasSize.width, scene.canvasSize.height) * 0.55,
    )

    gradient.addColorStop(start.offset, start.color)
    gradient.addColorStop(end.offset, end.color)
    context.fillStyle = gradient
    context.fillRect(0, 0, scene.canvasSize.width, scene.canvasSize.height)
    return
  }

  const halfWidth = scene.canvasSize.width * 0.5
  const halfHeight = scene.canvasSize.height * 0.5
  const vectorX = Math.cos(scene.background.gradient.rotation) * halfWidth
  const vectorY = Math.sin(scene.background.gradient.rotation) * halfHeight
  const gradient = context.createLinearGradient(
    halfWidth - vectorX,
    halfHeight - vectorY,
    halfWidth + vectorX,
    halfHeight + vectorY,
  )

  gradient.addColorStop(start.offset, start.color)
  gradient.addColorStop(end.offset, end.color)
  context.fillStyle = gradient
  context.fillRect(0, 0, scene.canvasSize.width, scene.canvasSize.height)
}

async function drawComposeNode(
  context: CanvasRenderingContext2D,
  node: DashboardComposeNode,
) {
  const width = node.naturalWidth * node.scale
  const height = node.naturalHeight * node.scale
  const image = await loadNodeImage(node)

  context.save()
  context.globalAlpha = node.opacity
  context.globalCompositeOperation = getCanvasBlendMode(node.blendMode)
  context.translate(node.x + width * 0.5, node.y + height * 0.5)
  context.rotate((node.rotation * Math.PI) / 180)
  context.drawImage(image, -width * 0.5, -height * 0.5, width, height)
  context.restore()
}

async function loadNodeImage(node: DashboardComposeNode) {
  if (node.kind === "image") {
    return loadImage(node.imageUrl)
  }

  const svgBlob = new Blob([node.originalSvgMarkup], {
    type: "image/svg+xml;charset=utf-8",
  })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    return await loadImage(svgUrl)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.crossOrigin = "anonymous"
    image.decoding = "async"
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load ${source}`))
    image.src = source
  })
}

function getCanvasBlendMode(mode: string): GlobalCompositeOperation {
  if (
    mode === "darken" ||
    mode === "lighten" ||
    mode === "multiply" ||
    mode === "normal" ||
    mode === "overlay" ||
    mode === "screen"
  ) {
    return mode === "normal" ? "source-over" : mode
  }

  return "source-over"
}

function getUnverifiedDecodeResult(
  state: QrStudioState,
  error: unknown,
): QrQualityDecodeResult {
  const message = error instanceof Error ? error.message : ""

  if (
    message.toLowerCase().includes("taint") ||
    message.toLowerCase().includes("cross-origin") ||
    message.toLowerCase().includes("security")
  ) {
    return {
      kind: "unverified",
      reason:
        state.logo.source === "url" || state.backgroundImage.source === "url"
          ? "Remote QR assets blocked pixel-level verification."
          : "A remote layer blocked pixel-level verification.",
    }
  }

  return {
    kind: "unverified",
    reason: "One or more dashboard layers could not be rasterized for verification.",
  }
}
