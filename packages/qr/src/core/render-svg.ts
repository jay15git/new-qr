import { ReactQRCode } from "../react-qr-code"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import type { NewQrCodeProps } from "../types"
import { applyPortableQrSvgExtensions } from "./svg-extension"
import { portablePropsToReactQrProps } from "./map-props"

export function stripXmlDeclaration(markup: string) {
  return markup
    .replace(/<\?xml[\s\S]*?\?>\s*/i, "")
    .replace(/<!doctype[\s\S]*?>\s*/i, "")
    .trim()
}

export function renderNewQrSvg(props: NewQrCodeProps) {
  const markup = stripXmlDeclaration(
    renderToStaticMarkup(createElement(ReactQRCode, portablePropsToReactQrProps(props))),
  )

  if (typeof DOMParser === "undefined") {
    return markup
  }

  const document = new DOMParser().parseFromString(markup, "image/svg+xml")
  const svg = document.documentElement

  if (svg.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
    return markup
  }

  applyPortableQrSvgExtensions(svg as unknown as SVGElement, props)
  return new XMLSerializer().serializeToString(svg)
}
