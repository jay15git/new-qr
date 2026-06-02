import { isValidElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/desktop/desktop-workspace", () => ({
  DesktopWorkspace: ({ fontClassName }: { fontClassName?: string }) => (
    <div data-font-class-name={fontClassName} data-testid="desktop-workspace" />
  ),
}))

vi.mock("next/font/local", () => ({
  default: () => ({
    className: "mock-satoshi-font",
  }),
}))

import { DesktopWorkspace } from "@/components/desktop/desktop-workspace"
import DesktopPage, { metadata } from "./page"

describe("desktop page", () => {
  it("exposes metadata for the desktop workspace", () => {
    expect(metadata.title).toBe("Desktop Workspace")
    expect(metadata.description).toContain("floating toolbar")
  })

  it("renders the desktop workspace inside the route shell", () => {
    const page = DesktopPage()

    expect(isValidElement(page)).toBe(true)
    expect(page.type).toBe("main")
    expect(page.props.className).toContain("mock-satoshi-font")
    expect(page.props.className).toContain("min-h-dvh")
    expect(page.props["data-slot"]).toBe("desktop-page")

    const workspace = page.props.children

    expect(isValidElement(workspace)).toBe(true)
    expect(workspace.type).toBe(DesktopWorkspace)
    expect(workspace.props.fontClassName).toBe("mock-satoshi-font")
  })
})
