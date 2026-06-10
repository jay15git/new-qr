// @vitest-environment jsdom

import { describe, expect, it } from "vitest"

import {
  buildDashboardQrNodePayload,
  createDashboardSurfaceQrState,
  stripXmlDeclaration,
} from "@/features/qr-code/rendering/qr-svg"
import {
  createDefaultQrStudioState,
  setSquareQrSize,
} from "@/features/qr-code/model/state"

describe("dashboard qr svg helpers", () => {
  it("forces svg rendering for the dashboard surface without mutating the original state", () => {
    const state = createDefaultQrStudioState()
    state.type = "canvas"

    const dashboardState = createDashboardSurfaceQrState(state)

    expect(dashboardState.type).toBe("svg")
    expect(state.type).toBe("canvas")
    expect(dashboardState.width).toBe(state.width)
    expect(dashboardState.height).toBe(state.height)
  })

  it("removes xml declarations before the svg markup is inlined on the composer surface", () => {
    const markup =
      '<?xml version="1.0" standalone="no"?>\n<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" /></svg>'

    expect(stripXmlDeclaration(markup)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" /></svg>',
    )
  })

  it("uses the canonical qr size when building the dashboard payload", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 512)

    const payload = await buildDashboardQrNodePayload(state)

    expect(payload.naturalWidth).toBe(512)
    expect(payload.naturalHeight).toBe(512)
    expect(payload.markup).toContain("<svg")
    expect(payload.markup).toContain('width="512"')
    expect(payload.markup).toContain("width:100%")
  })

  it("renders ReactQRCode finder pattern styles into the dashboard payload", async () => {
    const state = createDefaultQrStudioState()
    state.finderPatternInnerSettings.type = "heart"
    state.finderPatternOuterSettings.type = "rounded-lg"

    const payload = await buildDashboardQrNodePayload(state)

    expect(payload.naturalWidth).toBe(state.width)
    expect(payload.naturalHeight).toBe(state.height)
    expect(payload.markup).toContain('data-testid="finder-patterns-inner"')
    expect(payload.markup).toContain('data-testid="finder-patterns-outer"')
  })

  it("reports expanded natural size when background effects grow outside the qr", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 320)
    state.backgroundShapeId = "circle"
    state.backgroundShapeOptions = {
      edgeBlur: 8,
      paddingPx: 24,
      shadowColor: "#020617",
      shadowOffsetX: 12,
      shadowOffsetY: -10,
      shadowOpacity: 58,
      strokeColor: "#111827",
      strokeOpacity: 50,
      strokeWidth: 6,
    }

    const payload = await buildDashboardQrNodePayload(state)

    expect(payload.naturalWidth).toBe(406)
    expect(payload.naturalHeight).toBe(406)
    expect(payload.markup).toContain('data-qr-layer="background-shape"')
  })
})
