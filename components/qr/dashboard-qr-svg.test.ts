import { describe, expect, it } from "vitest"

import {
  createDashboardSurfaceQrState,
  stripXmlDeclaration,
} from "@/components/qr/dashboard-qr-svg"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

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
})
