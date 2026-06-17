import { ReactQRCode } from "@lglab/react-qr-code"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import type { DashboardQrNodePayload } from "@/features/qr-code/rendering/compose-scene"
import { buildQrExtension, getQrRenderedDimensions } from "@/features/qr-code/rendering/svg-extension"
import { type QrStudioState } from "@/features/qr-code/model/state"
import { toReactQrCodeProps } from "@/features/qr-code/adapters/react-qr-adapter"

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
  const extension = buildQrExtension(dashboardState)
  const markup = stripXmlDeclaration(
    renderToStaticMarkup(createElement(ReactQRCode, toReactQrCodeProps(dashboardState))),
  )

  if (extension) {
    return {
      markup: applyQrSvgExtension(markup, extension, dashboardState),
      naturalHeight: getQrRenderedDimensions(dashboardState).height,
      naturalWidth: getQrRenderedDimensions(dashboardState).width,
    }
  }

  return {
    markup,
    naturalHeight: getQrRenderedDimensions(dashboardState).height,
    naturalWidth: getQrRenderedDimensions(dashboardState).width,
  }
}

export function renderDashboardQrSvgMarkup(state: QrStudioState) {
  const dashboardState = createDashboardSurfaceQrState(state)
  const extension = buildQrExtension(dashboardState)
  const markup = stripXmlDeclaration(
    renderToStaticMarkup(createElement(ReactQRCode, toReactQrCodeProps(dashboardState))),
  )

  return extension ? applyQrSvgExtension(markup, extension, dashboardState) : markup
}

function applyQrSvgExtension(
  markup: string,
  extension: NonNullable<ReturnType<typeof buildQrExtension>>,
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
