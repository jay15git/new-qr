import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { QrControlSections } from "@/components/qr/qr-control-sections"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

const baseProps = {
  fileInputRef: { current: null },
  logoSourceMode: "none" as const,
  onLogoFileChange: vi.fn(),
  onLogoModeChange: vi.fn(),
  onPickLogoFile: vi.fn(),
  setState: vi.fn(),
  state: createDefaultQrStudioState(),
}

describe("QrControlSections", () => {
  it("renders only the selected section in dashboard mode", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="style" />,
    )

    expect(markup).toContain("Style")
    expect(markup).not.toContain("Content")
    expect(markup).not.toContain("Corners")
    expect(markup).not.toContain("QR settings")
  })

  it("shows all main dot style options in dashboard mode", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="style" />,
    )

    expect(markup).toContain('data-slot="style-picker"')
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('type="radio"')
    expect(markup).not.toContain('data-slot="select-trigger"')
    expect(markup).toContain("Rounded")
    expect(markup).toContain("Square")
    expect(markup).toContain("Dots")
    expect(markup).toContain("Classy")
    expect(markup).toContain("Classy rounded")
    expect(markup).toContain("Extra rounded")
    expect(markup).toContain("Diamond")
    expect(markup).toContain("Heart")
  })

  it("shows all corner style options in dashboard mode", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="corners" />,
    )

    expect(markup).toContain('data-slot="style-picker"')
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('type="radio"')
    expect(markup).not.toContain('data-slot="select-trigger"')
    expect(markup).toContain("Extra rounded")
    expect(markup).toContain("Square")
    expect(markup).toContain("Rounded")
    expect(markup).toContain("Dots")
    expect(markup).toContain("Classy")
    expect(markup).toContain("Classy rounded")
    expect(markup).toContain("Dot")
  })

  it("renders the full stacked editor in settings mode", () => {
    const markup = renderToStaticMarkup(<QrControlSections {...baseProps} />)

    expect(markup).toContain("Content")
    expect(markup).toContain("Dots")
    expect(markup).toContain("QR settings")
    expect(markup).toContain('data-slot="select-trigger"')
  })
})
