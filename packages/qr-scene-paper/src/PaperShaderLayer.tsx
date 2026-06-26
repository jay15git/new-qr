"use client"

import { Component, type CSSProperties, type ReactNode, useMemo, useState } from "react"
import { Dithering } from "@paper-design/shaders-react"
import { buildPaperShaderRenderProps } from "@new-qr/qr-scene-shaders"

import type { ScenePaperShaderState } from "@new-qr/qr-scene-schema"

import { PAPER_SHADER_COMPONENTS_BY_ID } from "./shader-components"

type PaperShaderLayerProps = {
  paperShader: ScenePaperShaderState
  className?: string
  style?: CSSProperties
  fallbackColor?: string
}

class PaperShaderErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.hasError ? null : this.props.children
  }
}

export function hasPaperShaderWebGlSupport() {
  if (typeof document === "undefined") {
    return false
  }

  const canvas = document.createElement("canvas")

  try {
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}

function buildShaderProps(paperShader: ScenePaperShaderState) {
  return buildPaperShaderRenderProps({
    shaderId: paperShader.shaderId,
    params: paperShader.params,
    frame: paperShader.frame,
    speed: paperShader.speed,
    paused: paperShader.paused,
    image: paperShader.image,
  })
}

export function PaperShaderLayer({
  paperShader,
  className,
  style,
  fallbackColor = "#111827",
}: PaperShaderLayerProps) {
  const [canRenderShader] = useState(hasPaperShaderWebGlSupport)
  const [hasError, setHasError] = useState(false)
  const ShaderComponent = PAPER_SHADER_COMPONENTS_BY_ID[paperShader.shaderId] ?? Dithering
  const shaderProps = useMemo(() => buildShaderProps(paperShader), [paperShader])

  if (!canRenderShader || hasError) {
    return (
      <div
        aria-hidden="true"
        className={className}
        style={{
          backgroundColor: fallbackColor,
          height: "100%",
          width: "100%",
          ...style,
        }}
      />
    )
  }

  return (
    <PaperShaderErrorBoundary onError={() => setHasError(true)}>
      <ShaderComponent
        {...shaderProps}
        aria-hidden="true"
        className={className}
        data-shader-canvas-host
        style={{
          height: "100%",
          width: "100%",
          ...style,
        }}
      />
    </PaperShaderErrorBoundary>
  )
}

export async function capturePaperShaderFrame(
  canvas: HTMLCanvasElement,
  mimeType = "image/png",
  quality = 0.92,
) {
  return canvas.toDataURL(mimeType, quality)
}
