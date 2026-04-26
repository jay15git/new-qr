import { isValidElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/new/drafting-surface", () => ({
  DraftingSurface: ({ fontClassName }: { fontClassName?: string }) => (
    <div data-font-class-name={fontClassName} data-testid="drafting-surface" />
  ),
}))

vi.mock("next/font/local", () => ({
  default: () => ({
    className: "mock-satoshi-font",
  }),
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
    expect(page.props.className).toContain("bg-[var(--drafting-page-bg)]")
    expect(page.props.className).toContain("mock-satoshi-font")
    expect(page.props.className).toContain("text-[var(--drafting-ink)]")
    expect(page.props["data-slot"]).toBe("new-page")

    const surface = page.props.children

    expect(isValidElement(surface)).toBe(true)
    expect(surface.type).toBe(DraftingSurface)
    expect(surface.props.fontClassName).toBe("mock-satoshi-font")
  })
})
