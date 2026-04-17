import type { ReactNode } from "react"
import { isValidElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/qr/qr-studio", () => ({
  QrStudio: ({ variant }: { variant?: string }) => (
    <div data-testid="qr-studio" data-variant={variant} />
  ),
}))

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}))

import { QrStudio } from "@/components/qr/qr-studio"
import { TooltipProvider } from "@/components/ui/tooltip"
import DashboardPage, { metadata } from "./page"

describe("dashboard page", () => {
  it("exposes dashboard-specific metadata for route announcements", () => {
    expect(metadata.title).toBe("QR Studio Dashboard")
    expect(metadata.description).toContain("premium QR design studio")
  })

  it("renders the dashboard qr editor variant inside the tooltip provider", () => {
    const page = DashboardPage()

    expect(isValidElement(page)).toBe(true)
    expect(page.type).toBe(TooltipProvider)

    const studio = page.props.children

    expect(isValidElement(studio)).toBe(true)
    expect(studio.type).toBe(QrStudio)
    expect(studio.props.variant).toBe("dashboard")
  })
})
