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
    expect(markup).toContain("Live preview")
  })

  it("caps the dashboard preview footprint so export controls remain visible", () => {
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

    expect(markup).toContain("lg:max-w-[clamp(22rem,30vw,28rem)]")
    expect(markup).toContain("lg:max-h-[calc(100svh-2rem)]")
    expect(markup).toContain("lg:size-[clamp(15rem,calc(100svh-30rem),22rem)]")
    expect(markup).not.toContain("lg:min-h-[20rem]")
    expect(markup).not.toContain("xl:min-h-[22rem]")
    expect(markup).toContain("Reset defaults")
  })
})
