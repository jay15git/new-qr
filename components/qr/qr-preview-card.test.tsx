import { createRef } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

describe("QrPreviewCard", () => {
  it("renders dashboard preview actions below the qr image", () => {
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
    expect(markup).toContain('data-slot="dashboard-preview-actions"')
    expect(markup).not.toContain('data-slot="card"')
    expect(markup).not.toContain('data-slot="card-header"')
    expect(markup).not.toContain('data-slot="card-content"')
    expect(markup).not.toContain('data-slot="card-footer"')
    expect(markup).toContain("Export filename")
    expect(markup).toContain("Reset defaults")
    expect(markup).toContain('data-slot="field-group"')
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
    expect(markup).toContain("max-h-[calc(100svh-18rem)]")
    expect(markup).toContain("lg:max-h-[calc(100svh-20rem)]")
    expect(markup).toContain("bg-background")
    expect(markup).not.toContain("overflow-y-auto")
    expect(markup).not.toContain("overflow-auto")
  })
})
