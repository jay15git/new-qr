import type { SerializablePaperShaderState } from "@new-qr/qr-scene-shaders"

export type SceneIrBounds = {
  minX: number
  minY: number
  width: number
  height: number
}

export type SceneIrShaderNode = {
  kind: "shader"
  shader: SerializablePaperShaderState
  bounds: { x: number; y: number; width: number; height: number }
  snapshotUrl?: string
  fallbackFill?: string
}

export type SceneIrAnimatedQrNode = {
  kind: "animated-qr"
  contents: string
  externalSvg: string
  bounds: { x: number; y: number; width: number; height: number }
  preset: string
  hoverEffect: string
}

export type SceneIrFontRef = {
  id: string
  family: string
  cssText?: string
  cssUrl?: string
}

export type SceneIr = {
  bounds: SceneIrBounds
  defs: string
  body: string
  shaders: SceneIrShaderNode[]
  animatedQr?: SceneIrAnimatedQrNode
  fonts: SceneIrFontRef[]
  componentName?: string
}

export type FrameworkTarget =
  | { framework: "svg" }
  | { framework: "react"; dialect: "jsx" | "tsx"; mode: "static"; componentName?: string }
  | { framework: "react"; dialect: "jsx" | "tsx"; mode: "live"; componentName?: string }
  | { framework: "vue"; lang: "js" | "ts" }
  | { framework: "svelte"; lang: "js" | "ts" }

export function isLiveReactTarget(
  target: FrameworkTarget,
): target is Extract<FrameworkTarget, { framework: "react"; mode: "live" }> {
  return target.framework === "react" && "mode" in target && target.mode === "live"
}
