import { createRef } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

describe("QrPreviewCard", () => {
  it("uses the compact dashboard shell when requested", () => {
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

    expect(markup).toContain('data-size="sm"')
    expect(markup).toContain("Preview stage")
    expect(markup).toContain("<h2")
  })

  it("uses a light proof stage in dashboard mode while keeping export actions beneath it", () => {
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

    expect(markup).toContain("xl:min-h-[calc(100svh-13rem)]")
    expect(markup).toContain('data-slot="proof-stage"')
    expect(markup).toContain("bg-[linear-gradient(180deg,oklch(0.97_0.006_95),oklch(0.92_0.012_95))]")
    expect(markup).toContain("lg:size-[clamp(23rem,34vw,34rem)]")
    expect(markup).not.toContain("bg-[color-mix(in_oklch,var(--color-background)_90%,black_10%)]")
    expect(markup).toContain("Reset defaults")
  })
})
