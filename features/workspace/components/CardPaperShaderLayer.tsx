"use client"

import { Component, type CSSProperties, type ReactNode, useMemo, useState } from "react"

import type { DraftingCardPaperShaderState } from "@/features/workspace/model/card-state"
import { getPaperShaderDefinition } from "@/features/workspace/rendering/paper-shaders"

type DraftingCardPaperShaderLayerProps = {
  paperShader: DraftingCardPaperShaderState
}

type DraftingCardPaperShaderRendererProps = {
  dataSlot: string
  onError: () => void
  paperShader: DraftingCardPaperShaderState
  renderOptions?: Record<string, unknown>
  style: CSSProperties
}

type PaperShaderErrorBoundaryProps = {
  children: ReactNode
  onError: () => void
}

class PaperShaderErrorBoundary extends Component<
  PaperShaderErrorBoundaryProps,
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
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}

export function hasDraftingPaperShaderWebGlSupport() {
  if (typeof document === "undefined") return false
  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("jsdom")
  ) {
    return false
  }

  const canvas = document.createElement("canvas")
  try {
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}

function buildDraftingPaperShaderRenderProps(
  paperShader: DraftingCardPaperShaderState,
  renderOptions?: Record<string, unknown>,
) {
  const definition = getPaperShaderDefinition(paperShader.shaderId)

  return {
    ...paperShader.params,
    frame: paperShader.frame,
    ...(definition.requiresImage && paperShader.image.value
      ? { image: paperShader.image.value }
      : {}),
    speed: paperShader.paused ? 0 : paperShader.speed,
    ...definition.renderOptions,
    ...renderOptions,
  }
}

export function DraftingCardPaperShaderRenderer({
  dataSlot,
  onError,
  paperShader,
  renderOptions,
  style,
}: DraftingCardPaperShaderRendererProps) {
  const definition = getPaperShaderDefinition(paperShader.shaderId)
  const ShaderComponent = definition.component
  const shaderProps = useMemo(
    () => buildDraftingPaperShaderRenderProps(paperShader, renderOptions),
    [paperShader, renderOptions],
  )

  return (
    <PaperShaderErrorBoundary key={paperShader.shaderId} onError={onError}>
      <ShaderComponent
        {...shaderProps}
        aria-hidden="true"
        data-slot={dataSlot}
        data-shader-canvas-host
        style={style}
      />
    </PaperShaderErrorBoundary>
  )
}

export function DraftingCardPaperShaderLayer({
  paperShader,
}: DraftingCardPaperShaderLayerProps) {
  const [canRenderShader] = useState(hasDraftingPaperShaderWebGlSupport)
  const [shaderErrorId, setShaderErrorId] = useState<string | null>(null)
  const hasShaderError = shaderErrorId === paperShader.shaderId

  if (!canRenderShader || hasShaderError) {
    return null
  }

  return (
    <DraftingCardPaperShaderRenderer
      dataSlot="dashboard-compose-card-paper-shader"
      onError={() => setShaderErrorId(paperShader.shaderId)}
      paperShader={paperShader}
      style={{
        borderRadius: "inherit",
        height: "100%",
        inset: 0,
        pointerEvents: "none",
        position: "absolute",
        width: "100%",
        zIndex: 0,
      }}
    />
  )
}
