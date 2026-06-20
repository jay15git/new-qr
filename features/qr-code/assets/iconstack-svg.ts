import type { StudioGradient } from "@/features/qr-code/model/state"

const ICONSTACK_GRADIENT_ID = "iconstack-icon-gradient"

export function svgMarkupToDataUrl(markup: string) {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`
}

export function recolorSvgMarkup(svg: string, color: string) {
  let next = svg

  next = next.replaceAll("currentColor", color)
  next = next.replace(/stroke="(?!none)([^"]+)"/gi, `stroke="${color}"`)
  next = next.replace(/fill="(?!none)([^"]+)"/gi, `fill="${color}"`)

  return next
}

export function createIconstackIconDataUrl(svg: string, color: string) {
  return svgMarkupToDataUrl(recolorSvgMarkup(svg, color))
}

export function createIconstackIconGradientDataUrl(svg: string, gradient: StudioGradient) {
  const gradientMarkup = createSvgGradientMarkup(gradient)
  const fillValue = `url(#${ICONSTACK_GRADIENT_ID})`
  const withDefinitions = injectSvgDefinitions(svg, gradientMarkup)

  return svgMarkupToDataUrl(
    withDefinitions
      .replaceAll("currentColor", fillValue)
      .replace(/stroke="(?!none)([^"]+)"/gi, `stroke="${fillValue}"`)
      .replace(/fill="(?!none)([^"]+)"/gi, `fill="${fillValue}"`),
  )
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
    return `<radialGradient id="${ICONSTACK_GRADIENT_ID}">${colorStopsMarkup}</radialGradient>`
  }

  const rotationDegrees = (gradient.rotation * 180) / Math.PI

  return `<linearGradient id="${ICONSTACK_GRADIENT_ID}" gradientUnits="objectBoundingBox" gradientTransform="rotate(${rotationDegrees} 0.5 0.5)">${colorStopsMarkup}</linearGradient>`
}
