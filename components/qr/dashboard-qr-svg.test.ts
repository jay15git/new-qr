import { describe, expect, it, vi } from "vitest"

vi.mock("qr-code-styling", () => ({
  default: class MockQRCodeStyling {
    private options: { height?: number; width?: number }

    constructor(options: { height?: number; width?: number }) {
      this.options = options
    }

    applyExtension() {}

    async getRawData() {
      return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${this.options.width}" height="${this.options.height}"></svg>`,
      )
    }
  },
}))

import {
  buildDashboardQrNodePayload,
  createDashboardSurfaceQrState,
  stripXmlDeclaration,
} from "@/components/qr/dashboard-qr-svg"
import {
  createDefaultQrStudioState,
  setSquareQrSize,
} from "@/components/qr/qr-studio-state"

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
  })
})
