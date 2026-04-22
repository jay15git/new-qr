import { describe, expect, it } from "vitest"

import {
  DASHBOARD_EDIT_SECTIONS,
  DEFAULT_DASHBOARD_EDIT_SECTION,
  getDashboardEditSectionChangeDirection,
  getDashboardEditSectionIndex,
} from "@/components/qr/dashboard-edit-sections"

describe("dashboard edit sections", () => {
  it("keeps layers as the default section and inserts inspector between layers and background", () => {
    expect(DEFAULT_DASHBOARD_EDIT_SECTION).toBe("layers")
    expect(DASHBOARD_EDIT_SECTIONS.map((section) => section.id)).toEqual([
      "layers",
      "inspector",
      "background",
    ])
    expect(getDashboardEditSectionIndex("inspector")).toBe(1)
  })

  it("computes edit rail direction with the inspector tab in the middle", () => {
    expect(getDashboardEditSectionChangeDirection("layers", "inspector")).toBe(1)
    expect(getDashboardEditSectionChangeDirection("inspector", "background")).toBe(1)
    expect(getDashboardEditSectionChangeDirection("background", "inspector")).toBe(-1)
    expect(getDashboardEditSectionChangeDirection("inspector", "layers")).toBe(-1)
    expect(getDashboardEditSectionChangeDirection("inspector", "inspector")).toBe(0)
  })
})
