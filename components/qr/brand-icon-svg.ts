import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server.browser"

import type { BrandIconEntry } from "@/components/qr/brand-icon-catalog"

export const DEFAULT_BRAND_ICON_COLOR = "#111827"
const BRAND_ICON_SIZE = 256

export function createBrandIconSvgMarkup(
  brandIcon: BrandIconEntry,
  color: string,
) {
  return renderToStaticMarkup(
    createElement(brandIcon.icon, {
      color,
      size: BRAND_ICON_SIZE,
      title: brandIcon.label,
    }),
  ).replaceAll("currentColor", color)
}

export function svgMarkupToDataUrl(markup: string) {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`
}

export function createBrandIconDataUrl(
  brandIcon: BrandIconEntry,
  color: string,
) {
  return svgMarkupToDataUrl(createBrandIconSvgMarkup(brandIcon, color))
}
