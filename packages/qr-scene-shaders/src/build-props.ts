import { shaderRequiresImage } from "./registry"

export type PaperShaderParamValue =
  | boolean
  | number
  | number[]
  | number[][]
  | string
  | string[]
  | undefined

export type PaperShaderParams = Record<string, PaperShaderParamValue>

export type SerializablePaperShaderState = {
  shaderId: string
  params: PaperShaderParams
  frame: number
  speed: number
  paused: boolean
  image?: {
    value?: string
  }
  renderOptions?: Record<string, unknown>
}

export function buildPaperShaderRenderProps(shader: SerializablePaperShaderState) {
  return {
    ...shader.params,
    frame: shader.frame,
    speed: shader.paused ? 0 : shader.speed,
    ...(shaderRequiresImage(shader.shaderId) && shader.image?.value
      ? { image: shader.image.value }
      : {}),
    ...shader.renderOptions,
  }
}
