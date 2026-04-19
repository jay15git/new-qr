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
  it("renders the dashboard as a full-height three-pane shell with the preview pane itself acting as the compose surface", () => {
    const markup = renderToStaticMarkup(<QrStudio variant="dashboard" />)
    const modeToggleIndex = markup.indexOf('data-slot="mode-toggle"')
    const downloadLabelIndex = markup.indexOf("Download")

    expect(markup).toContain('aria-label="QR editor dashboard"')
    expect(markup).toContain('data-slot="dashboard-top-strip"')
    expect(markup).toContain('data-slot="dashboard-workspace"')
    expect(markup).toContain('data-testid="section-rail"')
    expect(markup).toContain('data-slot="dashboard-settings-panel"')
    expect(markup).toContain('data-slot="dashboard-settings-stage"')
    expect(markup).toContain('data-slot="dashboard-settings-measure"')
    expect(markup).toContain('data-slot="dashboard-settings-motion"')
    expect(markup).toContain('data-slot="dashboard-settings-scroll"')
    expect(markup).toContain("overflow-x-hidden")
    expect(markup).toContain("pb-10")
    expect(markup).toContain('data-direction="0"')
    expect(markup).toContain('data-slot="dashboard-preview-pane"')
    expect(markup).toContain('data-slot="dashboard-compose-surface"')
    expect(markup).toContain('data-slot="dashboard-compose-controls"')
    expect(markup).toContain('data-slot="dashboard-compose-viewport"')
    expect(markup).toContain('data-slot="dashboard-compose-reset"')
    expect(markup).toContain(
      'data-slot="dashboard-compose-controls" class="pointer-events-none absolute inset-x-5 bottom-4 z-20 flex justify-center px-2 sm:inset-x-6 lg:inset-x-8"',
    )
    expect(markup).toContain('aria-label="Export controls"')
    expect(markup).toContain("lg:grid-cols-[5.75rem_minmax(22rem,29rem)_minmax(24rem,1fr)]")
    expect(markup).toContain("xl:grid-cols-[6rem_minmax(24rem,31rem)_minmax(26rem,1fr)]")
    expect(markup).toContain("h-screen")
    expect(markup).toContain("lg:h-full")
    expect(markup).toContain("Export filename")
    expect(markup).toContain('data-slot="mode-toggle"')
    expect(markup).toContain("Appearance")
    expect(markup).toContain("Download")
    expect(modeToggleIndex).toBeGreaterThan(-1)
    expect(downloadLabelIndex).toBeGreaterThan(modeToggleIndex)
    expect(markup).toContain("Reset defaults")
    expect(markup).toContain("min-h-screen")
    expect(markup).not.toContain('data-slot="dashboard-compose-meta"')
    expect(markup).not.toContain('data-slot="dashboard-compose-frame"')
    expect(markup).not.toContain('data-slot="dashboard-compose-label"')
    expect(markup).not.toContain('data-slot="dashboard-compose-size"')
    expect(markup).not.toContain('data-slot="dashboard-proof-stage"')
    expect(markup).not.toContain('data-slot="dashboard-preview-footer"')
    expect(markup).not.toContain('data-slot="dashboard-preview-shell"')
    expect(markup).not.toContain("aspect-square")
    expect(markup).not.toContain("Compose surface")
    expect(markup).not.toContain("Content")
    expect(markup).not.toContain("960 × 640")
    expect(markup).not.toContain(">Dashboard<")
    expect(markup).not.toContain(">QR Studio<")
    expect(markup).not.toContain("lg:grid-cols-[6.5rem_minmax(20rem,26rem)_minmax(22rem,1fr)]")
    expect(markup).not.toContain("lg:grid-cols-[6.5rem_minmax(20rem,1fr)_minmax(22rem,32vw)]")
    expect(markup).not.toContain('data-slot="dashboard-settings-controls"')
    expect(markup).not.toContain("dashboard-sidebar")
    expect(markup).not.toContain("sidebar-provider")
    expect(markup).not.toContain('data-slot="dashboard-settings-stage" class="relative flex min-h-0 flex-1 flex-col overflow-hidden"')
  })
})
