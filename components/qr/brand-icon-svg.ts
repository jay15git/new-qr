import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server.browser"

import type { BrandIconEntry } from "@/components/qr/brand-icon-catalog"
import type { StudioGradient } from "@/components/qr/qr-studio-state"

export const DEFAULT_BRAND_ICON_COLOR = "#111827"
const BRAND_ICON_SIZE = 256
const BRAND_ICON_GRADIENT_ID = "brand-icon-gradient"

function renderBrandIconMarkup(brandIcon: BrandIconEntry, color: string) {
  return renderToStaticMarkup(
    createElement(brandIcon.icon, {
      color,
      size: BRAND_ICON_SIZE,
      title: brandIcon.label,
    }),
  )
}

export function createBrandIconSvgMarkup(
  brandIcon: BrandIconEntry,
  color: string,
) {
  return renderBrandIconMarkup(brandIcon, color).replaceAll("currentColor", color)
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

export function createBrandIconGradientSvgMarkup(
  brandIcon: BrandIconEntry,
  gradient: StudioGradient,
) {
  const baseMarkup = renderBrandIconMarkup(brandIcon, DEFAULT_BRAND_ICON_COLOR)
  const gradientMarkup = createSvgGradientMarkup(gradient)
  const fillValue = `url(#${BRAND_ICON_GRADIENT_ID})`

  return injectSvgDefinitions(baseMarkup, gradientMarkup).replaceAll(
    "currentColor",
    fillValue,
  )
}

export function createBrandIconGradientDataUrl(
  brandIcon: BrandIconEntry,
  gradient: StudioGradient,
) {
  return svgMarkupToDataUrl(createBrandIconGradientSvgMarkup(brandIcon, gradient))
}

function injectSvgDefinitions(markup: string, definitionsMarkup: string) {
  return markup.replace(
    /<svg\b([^>]*)>/,
    `<svg$1><defs>${definitionsMarkup}</defs>`,
  )
}

function createSvgGradientMarkup(gradient: StudioGradient) {
  const colorStopsMarkup = gradient.colorStops
    .map(
      (colorStop) =>
        `<stop offset="${Math.round(colorStop.offset * 100)}%" stop-color="${colorStop.color}" />`,
    )
    .join("")

  if (gradient.type === "radial") {
    return `<radialGradient id="${BRAND_ICON_GRADIENT_ID}">${colorStopsMarkup}</radialGradient>`
  }

  const rotationDegrees = (gradient.rotation * 180) / Math.PI

  return `<linearGradient id="${BRAND_ICON_GRADIENT_ID}" gradientUnits="objectBoundingBox" gradientTransform="rotate(${rotationDegrees} 0.5 0.5)">${colorStopsMarkup}</linearGradient>`
}
