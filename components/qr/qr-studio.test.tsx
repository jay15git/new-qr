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
  it("uses fluid desktop columns for the dashboard workspace", () => {
    const markup = renderToStaticMarkup(<QrStudio variant="dashboard" />)

    expect(markup).toContain("lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,.9fr)]")
    expect(markup).toContain("xl:grid-cols-[minmax(0,1.6fr)_minmax(24rem,1fr)]")
    expect(markup).toContain("2xl:grid-cols-[minmax(0,1.7fr)_minmax(26rem,1fr)]")
    expect(markup).toContain("lg:w-full")
  })
})
