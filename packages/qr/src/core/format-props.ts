import type { NewQrCodeProps } from "../types"

const DEFAULTS: Partial<NewQrCodeProps> = {
  module: "square",
  finderInner: "square",
  finderOuter: "square",
  foreground: "#000000",
  background: "#ffffff",
  margin: 12,
  size: 320,
  colorMode: "solid",
  motion: "none",
  gradient: "none",
}

export function formatPortableQrPropsForCodegen(props: NewQrCodeProps) {
  const formatted: Record<string, unknown> = {
    value: props.value,
  }

  const entries: Array<keyof NewQrCodeProps> = [
    "module",
    "finderInner",
    "finderOuter",
    "foreground",
    "background",
    "margin",
    "size",
    "colorMode",
    "palette",
    "gradient",
    "logo",
    "motion",
    "motionPreset",
  ]

  for (const key of entries) {
    const value = props[key]
    const defaultValue = DEFAULTS[key]

    if (value === undefined || value === null) {
      continue
    }

    if (JSON.stringify(value) === JSON.stringify(defaultValue)) {
      continue
    }

    if (key === "gradient" && value === "none") {
      continue
    }

    if (key === "motion" && value === "none") {
      continue
    }

    formatted[key] = value
  }

  return formatted
}

export { portablePropsToReactQrProps } from "./map-props"
export { applyPortableQrSvgExtensions } from "./svg-extension"
export { renderNewQrSvg, stripXmlDeclaration } from "./render-svg"
