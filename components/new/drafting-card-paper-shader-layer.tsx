"use client"

import { Component, type ReactNode, useMemo, useState } from "react"

import type { DraftingCardPaperShaderState } from "@/components/new/drafting-card-state"
import { getPaperShaderDefinition } from "@/components/new/drafting-paper-shaders"

type DraftingCardPaperShaderLayerProps = {
  paperShader: DraftingCardPaperShaderState
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

function hasWebGlSupport() {
  if (typeof document === "undefined") return false

  const canvas = document.createElement("canvas")
  return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
}

export function DraftingCardPaperShaderLayer({
  paperShader,
}: DraftingCardPaperShaderLayerProps) {
  const [canRenderShader] = useState(hasWebGlSupport)
  const [shaderErrorId, setShaderErrorId] = useState<string | null>(null)
  const definition = getPaperShaderDefinition(paperShader.shaderId)
  const ShaderComponent = definition.component
  const hasShaderError = shaderErrorId === paperShader.shaderId
  const shaderProps = useMemo(
    () => ({
      ...paperShader.params,
      frame: paperShader.frame,
      ...(definition.requiresImage && paperShader.image.value
        ? { image: paperShader.image.value }
        : {}),
      speed: paperShader.paused ? 0 : paperShader.speed,
      ...definition.renderOptions,
    }),
    [
      definition.renderOptions,
      definition.requiresImage,
      paperShader.frame,
      paperShader.image.value,
      paperShader.params,
      paperShader.paused,
      paperShader.speed,
    ],
  )

  if (!canRenderShader || hasShaderError) {
    return null
  }

  return (
    <PaperShaderErrorBoundary
      key={paperShader.shaderId}
      onError={() => setShaderErrorId(paperShader.shaderId)}
    >
      <ShaderComponent
        {...shaderProps}
        aria-hidden="true"
        data-slot="dashboard-compose-card-paper-shader"
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
    </PaperShaderErrorBoundary>
  )
}
