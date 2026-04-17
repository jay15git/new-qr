import type { ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("qr-code-styling", () => ({
  default: class MockQRCodeStyling {
    append() {}
    update() {}
    applyExtension() {}
    async download() {}
  },
}))

vi.mock("@/components/sidebar-03/app-sidebar", () => ({
  DashboardSidebar: () => <div data-testid="dashboard-sidebar" />,
}))

vi.mock("@/components/qr/qr-control-sections", () => ({
  QrControlSections: () => <div data-testid="control-sections" />,
}))

vi.mock("@/components/qr/qr-preview-card", () => ({
  QrPreviewCard: () => <div data-testid="preview-card" />,
}))

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({
    children,
    className,
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-testid="sidebar-provider" className={className}>
      {children}
    </div>
  ),
}))

import { QrStudio } from "@/components/qr/qr-studio"

describe("QrStudio", () => {
  it("renders the dashboard as a stable three-panel desktop workspace", () => {
    const markup = renderToStaticMarkup(<QrStudio variant="dashboard" />)

    expect(markup).toContain('aria-labelledby="dashboard-title"')
    expect(markup).toContain("QR Studio")
    expect(markup).toContain("Settings panel")
    expect(markup).toContain("QR code panel")
    expect(markup).toContain("lg:grid-cols-[minmax(17.5rem,0.82fr)_minmax(0,1.5fr)]")
    expect(markup).not.toContain("xl:grid-cols-[minmax(18.5rem,0.82fr)_minmax(0,1.5fr)]")
    expect(markup).toContain("lg:sticky lg:top-6")
    expect(markup.indexOf("Settings panel")).toBeLessThan(markup.indexOf("QR code panel"))
  })
})
