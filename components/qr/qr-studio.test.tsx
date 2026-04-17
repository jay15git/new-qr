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

vi.mock("@/components/qr/qr-section-rail", () => ({
  QrSectionRail: () => <div data-testid="section-rail" />,
}))

vi.mock("@/components/qr/qr-control-sections", () => ({
  QrControlSections: () => <div data-testid="control-sections" />,
}))

import { QrStudio } from "@/components/qr/qr-studio"

describe("QrStudio", () => {
  it("renders the dashboard as a full-height three-pane shell with scrollable settings controls", () => {
    const markup = renderToStaticMarkup(<QrStudio variant="dashboard" />)

    expect(markup).toContain('aria-labelledby="dashboard-title"')
    expect(markup).toContain("QR Studio")
    expect(markup).toContain('data-slot="dashboard-workspace"')
    expect(markup).toContain('data-testid="section-rail"')
    expect(markup).toContain('data-slot="dashboard-settings-panel"')
    expect(markup).toContain('data-slot="dashboard-settings-stage"')
    expect(markup).toContain('data-slot="dashboard-settings-measure"')
    expect(markup).toContain('data-slot="dashboard-settings-motion"')
    expect(markup).toContain('data-slot="dashboard-settings-scroll"')
    expect(markup).toContain('data-direction="0"')
    expect(markup).toContain('data-slot="dashboard-preview-pane"')
    expect(markup).toContain('data-slot="dashboard-preview-canvas"')
    expect(markup).toContain('data-slot="dashboard-preview-actions"')
    expect(markup).toContain("lg:grid-cols-[6.5rem_minmax(20rem,26rem)_minmax(22rem,1fr)]")
    expect(markup).toContain("xl:grid-cols-[6.5rem_minmax(21rem,28rem)_minmax(24rem,1fr)]")
    expect(markup).toContain("h-screen")
    expect(markup).toContain("lg:h-full")
    expect(markup).toContain("Export filename")
    expect(markup).toContain("Reset defaults")
    expect(markup).toContain("Content")
    expect(markup).toContain("min-h-screen")
    expect(markup).not.toContain("rounded-[2rem]")
    expect(markup).not.toContain("bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-card)_94%,transparent),color-mix(in_oklch,var(--color-card)_88%,black_12%))]")
    expect(markup).not.toContain("lg:grid-cols-[6.5rem_minmax(20rem,1fr)_minmax(22rem,32vw)]")
    expect(markup).not.toContain('data-slot="dashboard-settings-controls"')
    expect(markup).not.toContain("dashboard-sidebar")
    expect(markup).not.toContain("sidebar-provider")
  })
})
