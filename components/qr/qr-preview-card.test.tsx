import { createRef } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

describe("QrPreviewCard", () => {
  it("renders the dashboard preview canvas with a reduced footer", () => {
    const markup = renderToStaticMarkup(
      <QrPreviewCard
        canDownload
        downloadName="new-qr"
        errorMessage={null}
        onDownload={vi.fn()}
        onDownloadNameChange={vi.fn()}
        onReset={vi.fn()}
        previewRef={createRef<HTMLDivElement>()}
        state={createDefaultQrStudioState()}
        variant="dashboard"
      />,
    )

    expect(markup).toContain('data-slot="dashboard-preview-canvas"')
    expect(markup).toContain('data-slot="dashboard-proof-stage"')
    expect(markup).toContain('data-slot="dashboard-preview-footer"')
    expect(markup).toContain("Export stage")
    expect(markup).not.toContain('data-slot="card"')
    expect(markup).not.toContain('data-slot="card-header"')
    expect(markup).not.toContain('data-slot="card-content"')
    expect(markup).not.toContain('data-slot="card-footer"')
    expect(markup).toContain("Reset defaults")
    expect(markup).not.toContain("Export filename")
    expect(markup).not.toContain("Download")
  })

  it("keeps the dashboard preview pane fixed without its own scroll area", () => {
    const markup = renderToStaticMarkup(
      <QrPreviewCard
        canDownload
        downloadName="new-qr"
        errorMessage={null}
        onDownload={vi.fn()}
        onDownloadNameChange={vi.fn()}
        onReset={vi.fn()}
        previewRef={createRef<HTMLDivElement>()}
        state={createDefaultQrStudioState()}
        variant="dashboard"
      />,
    )

    expect(markup).toContain('data-slot="dashboard-proof-stage"')
    expect(markup).toContain("dashboard-preview-shell")
    expect(markup).toContain("max-h-[calc(100svh-19rem)]")
    expect(markup).toContain("lg:max-h-[calc(100svh-21rem)]")
    expect(markup).toContain("rounded-[2rem]")
    expect(markup).toContain("bg-[linear-gradient(180deg,oklch(0.96_0.006_90),oklch(0.91_0.012_90))]")
    expect(markup).not.toContain("overflow-y-auto")
    expect(markup).not.toContain("overflow-auto")
  })
})
