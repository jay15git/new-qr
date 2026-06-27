import type { CSSProperties } from "react"

export type QrModuleStyle =
  | "square"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "extra-rounded"
  | "circle"
  | "diamond"
  | "heart"
  | "circuit-board"
  | "fluid"
  | "star"
  | "hexagon"

export type QrFinderStyle =
  | "square"
  | "dot"
  | "rounded"
  | "rounded-lg"
  | "circle"
  | "heart"
  | "diamond"
  | "leaf"
  | "bars"

export type NewQrGradientConfig = {
  type: "linear" | "radial"
  rotation?: number
  stops: [{ offset: number; color: string }, { offset: number; color: string }]
}

export type NewQrLogoConfig = {
  src: string
  size?: number
  excavate?: boolean
}

export type NewQrShaderConfig = {
  shaderId: string
  params?: Record<string, unknown>
}

export type NewQrCodeProps = {
  value: string
  size?: number
  module?: QrModuleStyle
  finderInner?: QrFinderStyle
  finderOuter?: QrFinderStyle
  foreground?: string
  background?: string
  margin?: number
  logo?: NewQrLogoConfig
  gradient?: NewQrGradientConfig | "none"
  colorMode?: "solid" | "gradient" | "palette"
  palette?: string[]
  motion?: "none" | "bitjson"
  motionPreset?: string
  className?: string
  style?: CSSProperties
}

export type PortableQrConfig = NewQrCodeProps
