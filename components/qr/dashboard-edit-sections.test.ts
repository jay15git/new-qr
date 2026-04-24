import { describe, expect, it } from "vitest"

import {
  DASHBOARD_EDIT_SECTIONS,
  DEFAULT_DASHBOARD_EDIT_SECTION,
  getDashboardEditSectionChangeDirection,
  getDashboardEditSectionIndex,
} from "@/components/qr/dashboard-edit-sections"

describe("dashboard edit sections", () => {
  it("defaults the document rail to page with position, assets, and layers following it", () => {
    expect(DEFAULT_DASHBOARD_EDIT_SECTION).toBe("page")
    expect(DASHBOARD_EDIT_SECTIONS.map((section) => section.id)).toEqual([
      "page",
      "position",
      "assets",
      "layers",
    ])
    expect(getDashboardEditSectionIndex("position")).toBe(1)
  })

  it("computes edit rail direction with the position and assets tabs in the middle", () => {
    expect(getDashboardEditSectionChangeDirection("page", "position")).toBe(1)
    expect(getDashboardEditSectionChangeDirection("position", "assets")).toBe(1)
    expect(getDashboardEditSectionChangeDirection("assets", "layers")).toBe(1)
    expect(getDashboardEditSectionChangeDirection("layers", "assets")).toBe(-1)
    expect(getDashboardEditSectionChangeDirection("assets", "position")).toBe(-1)
    expect(getDashboardEditSectionChangeDirection("position", "page")).toBe(-1)
    expect(getDashboardEditSectionChangeDirection("position", "position")).toBe(0)
  })
})
