import { createRef } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

describe("QrPreviewCard", () => {
  it("renders the settings preview card with export controls and filename input", () => {
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
      />,
    )

    expect(markup).toContain("Live preview")
    expect(markup).toContain("Export filename")
    expect(markup).toContain("Reset defaults")
    expect(markup).toContain("qr-code-styling")
    expect(markup).toContain("new-qr")
    expect(markup).toContain("SVG")
  })

  it("renders the direct qr mount stage in the settings card", () => {
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
      />,
    )

    expect(markup).toContain('data-slot="card"')
    expect(markup).toContain('data-slot="card-content"')
    expect(markup).not.toContain('data-slot="dashboard-compose-surface"')
    expect(markup).not.toContain('data-slot="dashboard-proof-stage"')
  })
})
