// @vitest-environment jsdom

import { describe, expect, it } from "vitest"

import {
  buildDashboardQrNodePayload,
  createDashboardSurfaceQrState,
  renderDashboardQrSvgMarkup,
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

  it("applies palette module colors to the rendered dashboard qr payload", async () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "palette"
    state.dotsPalette = ["#04879c", "#0c3c78", "#f30a49"]

    const payload = await buildDashboardQrNodePayload(state)

    expect(payload.markup).toContain('data-qr-layer="dot-palette"')
    expect(payload.markup).toContain('fill="#04879c"')
    expect(payload.markup).toContain('fill="#0c3c78"')
    expect(payload.markup).toContain('fill="#f30a49"')
    expect(payload.markup).toContain('opacity="0"')
  })

  it("applies palette module colors to direct qr svg markup", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "palette"
    state.dotsPalette = ["#04879c", "#0c3c78", "#f30a49"]

    const markup = renderDashboardQrSvgMarkup(state)

    expect(markup).toContain('data-qr-layer="dot-palette"')
    expect(markup).toContain('fill="#04879c"')
    expect(markup).toContain('fill="#0c3c78"')
    expect(markup).toContain('fill="#f30a49"')
  })

  it.each(["circle", "diamond", "circuit-board"] as const)(
    "keeps all palette colors visible for %s data module shapes",
    (style) => {
      const state = createDefaultQrStudioState()
      state.dotsColorMode = "palette"
      state.dotsPalette = ["#111111", "#222222", "#333333", "#444444"]
      state.dataModulesSettings.type = style

      const markup = renderDashboardQrSvgMarkup(state)

      expect(markup).toContain('data-qr-layer="dot-palette"')
      for (const color of state.dotsPalette) {
        expect(markup).toContain(`fill="${color}"`)
      }
    },
  )

  it("applies module gradients without repainting finder patterns", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "gradient"
    state.dataModulesGradient = {
      enabled: true,
      type: "linear",
      rotation: Math.PI / 2,
      colorStops: [
        { offset: 0, color: "#101010" },
        { offset: 1, color: "#fafafa" },
      ],
    }

    const markup = renderDashboardQrSvgMarkup(state)

    expect(markup).toContain('data-qr-layer="dot-gradient"')
    expect(markup).toContain('data-qr-layer="dot-gradient-fill"')
    expect(markup).toContain('fill="url(\'#dot-gradient-definition\')"')
    expect(markup).toContain('data-testid="finder-patterns-inner"')
    expect(markup).toContain('data-testid="finder-patterns-outer"')
    expect(markup).toMatch(/<rect[^>]+fill="#111827"[^>]+data-testid="finder-patterns-inner"/)
    expect(markup).toMatch(/<path[^>]+fill="#111827"[^>]+data-testid="finder-patterns-outer"/)
    expect(markup).not.toContain('data-testid="finder-patterns-inner" fill="url(')
    expect(markup).not.toContain('data-testid="finder-patterns-outer" fill="url(')
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
