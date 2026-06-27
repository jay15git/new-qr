import { formatPortableQrPropsForCodegen } from "@new-qr/qr/core"
import type { NewQrCodeProps } from "@new-qr/qr"
import { emitNewQrCodeAttributes } from "@new-qr/qr/web-component"

function formatReactPropValue(key: string, value: unknown) {
  if (typeof value === "string") {
    return JSON.stringify(value)
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return `{${JSON.stringify(value)}}`
  }

  if (key === "gradient" || key === "logo" || key === "palette") {
    return `{${JSON.stringify(value)}}`
  }

  return `{${JSON.stringify(value)}}`
}

export function formatNewQrCodeReactProps(props: NewQrCodeProps) {
  const formatted = formatPortableQrPropsForCodegen(props)

  return Object.entries(formatted)
    .map(([key, value]) => `${key}=${formatReactPropValue(key, value)}`)
    .join(" ")
}

export function emitNewQrCodeReact(props: NewQrCodeProps, indent = "      ") {
  const propString = formatNewQrCodeReactProps(props)
  return `${indent}<NewQrCode ${propString} />`
}

export function emitNewQrCodeHtml(props: NewQrCodeProps) {
  const attributes = emitNewQrCodeAttributes(props)
  return `<new-qr-code ${attributes}></new-qr-code>`
}
