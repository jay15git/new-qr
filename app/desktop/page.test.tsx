import { readFileSync } from "node:fs"
import { isValidElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/features/desktop-shell/components/DesktopWorkspace", () => ({
  DesktopWorkspace: ({ fontClassName }: { fontClassName?: string }) => (
    <div data-font-class-name={fontClassName} data-testid="desktop-workspace" />
  ),
}))

vi.mock("next/font/local", () => ({
  default: () => ({
    className: "mock-satoshi-font",
  }),
}))

import { DesktopWorkspace } from "@/features/desktop-shell/components/DesktopWorkspace"
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

  it("keeps portaled layer appearance popovers in sync with desktop light mode", () => {
    const workspaceSource = readFileSync("features/desktop-shell/components/DesktopWorkspace.tsx", "utf8")

    expect(workspaceSource).toContain(
      'body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"]',
    )
    expect(workspaceSource).toContain("rgba(255, 255, 255, 0.86)")
    expect(workspaceSource).toContain('input[type="number"]')
  })
})
