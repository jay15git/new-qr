import { ReactQRCode } from "@lglab/react-qr-code"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import type { DashboardQrNodePayload } from "@/features/qr-code/rendering/compose-scene"
import {
  buildQrExtension,
  createAlignedCornerGradientExtension,
  getQrRenderedDimensions,
} from "@/features/qr-code/rendering/svg-extension"
import { type QrStudioState } from "@/features/qr-code/model/state"
import { toReactQrCodeProps } from "@/features/qr-code/adapters/react-qr-adapter"
import { alignReactQrSvgToModuleGrid } from "@/features/workspace/rendering/qr-artwork"

export function createDashboardSurfaceQrState(state: QrStudioState): QrStudioState {
  return {
    ...state,
    type: "svg",
  }
}

export function stripXmlDeclaration(markup: string) {
  return markup
    .replace(/<\?xml[\s\S]*?\?>\s*/i, "")
    .replace(/<!doctype[\s\S]*?>\s*/i, "")
    .trim()
}

export async function buildDashboardQrNodePayload(
  state: QrStudioState,
): Promise<DashboardQrNodePayload> {
  const dashboardState = createDashboardSurfaceQrState(state)
  const markup = stripXmlDeclaration(
    renderToStaticMarkup(createElement(ReactQRCode, toReactQrCodeProps(dashboardState))),
  )

  return {
    markup: applyStudioQrSvgMarkupExtensions(markup, dashboardState),
    naturalHeight: getQrRenderedDimensions(dashboardState).height,
    naturalWidth: getQrRenderedDimensions(dashboardState).width,
  }
}

export function renderDashboardQrSvgMarkup(state: QrStudioState) {
  const dashboardState = createDashboardSurfaceQrState(state)
  const markup = stripXmlDeclaration(
    renderToStaticMarkup(createElement(ReactQRCode, toReactQrCodeProps(dashboardState))),
  )

  return applyStudioQrSvgMarkupExtensions(markup, dashboardState)
}

export function applyStudioQrSvgMarkupExtensions(markup: string, state: QrStudioState) {
  let result = markup
  const extension = buildQrExtension(state)

  if (extension) {
    result = applyQrSvgExtension(result, extension, state)
  }

  const cornerExtension = createAlignedCornerGradientExtension(state)

  if (cornerExtension) {
    result = applyQrSvgExtension(result, cornerExtension, state)
  }

  const renderedDimensions = getQrRenderedDimensions(state)

  return alignReactQrSvgToModuleGrid(
    result,
    renderedDimensions.width,
    renderedDimensions.height,
  )
}

function applyQrSvgExtension(
  markup: string,
  extension: (svg: SVGElement, options: { height?: number; width?: number }) => void,
  state: QrStudioState,
) {
  const parser = new DOMParser()
  const document = parser.parseFromString(markup, "image/svg+xml")
  const svg = document.documentElement as unknown as SVGElement

  if (svg.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
    throw new Error("QR SVG data is unavailable.")
  }

  extension(svg, {
    height: getQrRenderedDimensions(state).height,
    width: getQrRenderedDimensions(state).width,
  })

  return new XMLSerializer().serializeToString(svg)
}
