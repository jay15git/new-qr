import { isValidElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/new/drafting-surface", () => ({
  DraftingSurface: () => <div data-testid="drafting-surface" />,
}))

import { DraftingSurface } from "@/components/new/drafting-surface"
import NewPage, { metadata } from "./page"

describe("new page", () => {
  it("exposes metadata that matches the drafting workspace route", () => {
    expect(metadata.title).toBe("New Workspace")
    expect(metadata.description).toContain("drafting surface")
  })

  it("renders the drafting surface inside the route shell", () => {
    const page = NewPage()

    expect(isValidElement(page)).toBe(true)
    expect(page.type).toBe("main")
    expect(page.props.className).toContain("bg-white")
    expect(page.props.className).toContain("dark:bg-[#050505]")
    expect(page.props["data-slot"]).toBe("new-page")

    const surface = page.props.children

    expect(isValidElement(surface)).toBe(true)
    expect(surface.type).toBe(DraftingSurface)
  })
})
