import { describe, expect, it } from "vitest"

import {
  createDefaultDraftingFilterEffect,
  DRAFTING_FILTER_VISIBLE_DEFAULTS,
  getDraftingFilterLabel,
  isDraftingFilterActive,
  toggleDraftingFilter,
} from "@/features/workspace/model/filters"

describe("drafting filter helpers", () => {
  it("exposes human-readable filter labels", () => {
    expect(getDraftingFilterLabel("hue-rotate")).toBe("Hue rotate")
    expect(getDraftingFilterLabel("saturation")).toBe("Saturation")
  })

  it("adds a visible-default filter when toggled on", () => {
    const next = toggleDraftingFilter([], "blur")

    expect(next).toHaveLength(1)
    expect(next[0]?.type).toBe("blur")
    expect(next[0]?.amount).toBe(DRAFTING_FILTER_VISIBLE_DEFAULTS.blur)
    expect(next[0]?.enabled).toBe(true)
  })

  it("removes a filter when toggled off", () => {
    const filters = [createDefaultDraftingFilterEffect("blur", { amount: 8 })]

    expect(toggleDraftingFilter(filters, "blur")).toEqual([])
  })

  it("tracks active filters by type", () => {
    const filters = [createDefaultDraftingFilterEffect("contrast", { amount: 120 })]

    expect(isDraftingFilterActive(filters, "contrast")).toBe(true)
    expect(isDraftingFilterActive(filters, "blur")).toBe(false)
    expect(
      isDraftingFilterActive(
        [createDefaultDraftingFilterEffect("blur", { enabled: false })],
        "blur",
      ),
    ).toBe(false)
  })
})
