import { isValidElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/desktop/desktop-toolbar-prototype", () => ({
  DesktopToolbarPrototype: () => <div data-testid="desktop-toolbar-prototype" />,
}))

vi.mock("next/font/local", () => ({
  default: () => ({
    className: "mock-satoshi-font",
  }),
}))

import { DesktopToolbarPrototype } from "@/components/desktop/desktop-toolbar-prototype"
import DesktopPage, { metadata } from "./page"

describe("desktop page", () => {
  it("exposes metadata for the desktop workspace prototype", () => {
    expect(metadata.title).toBe("Desktop Workspace")
    expect(metadata.description).toContain("floating toolbar")
  })

  it("renders the desktop toolbar prototype inside the route shell", () => {
    const page = DesktopPage()

    expect(isValidElement(page)).toBe(true)
    expect(page.type).toBe("main")
    expect(page.props.className).toContain("mock-satoshi-font")
    expect(page.props.className).toContain("min-h-dvh")
    expect(page.props["data-slot"]).toBe("desktop-page")

    const prototype = page.props.children

    expect(isValidElement(prototype)).toBe(true)
    expect(prototype.type).toBe(DesktopToolbarPrototype)
  })
})
