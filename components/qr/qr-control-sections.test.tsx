import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { QrControlSections } from "@/components/qr/qr-control-sections"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

const baseProps = {
  backgroundSourceMode: "none" as const,
  logoSourceMode: "none" as const,
  onBackgroundModeChange: vi.fn(),
  onBackgroundUploadError: vi.fn(),
  onBackgroundUploadSuccess: vi.fn(),
  onLogoModeChange: vi.fn(),
  onLogoUploadError: vi.fn(),
  onLogoUploadSuccess: vi.fn(),
  setState: vi.fn(),
  state: createDefaultQrStudioState(),
}

describe("QrControlSections", () => {
  it("renders only the selected section in dashboard mode without a duplicate section header", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="style" />,
    )

    expect(markup).toContain('data-slot="section-fields"')
    expect(markup).toContain('data-slot="direction-aware-tabs"')
    expect(markup).toContain(">Style<")
    expect(markup).toContain(">Color<")
    expect(markup).not.toContain('data-slot="card-title"')
    expect(markup).not.toContain('data-slot="card-description"')
    expect(markup).not.toContain('data-slot="field-description"')
    expect(markup).not.toContain("Content")
    expect(markup).not.toContain("Corners")
    expect(markup).not.toContain("QR settings")
    expect(markup).not.toContain("md:grid-cols-2")
    expect(markup).not.toContain("md:grid-cols-3")
  })

  it("shows the style sub-tab by default in dashboard mode", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="style" />,
    )

    expect(markup).toContain('data-slot="style-picker"')
    expect(markup).not.toContain('data-slot="select-trigger"')
    expect(markup).toContain("Round dot sizes")
    expect(markup).not.toContain("Color mode")
    expect(markup).not.toContain("Solid color")
    expect(markup).not.toContain("Dot gradient")
    expect(markup).not.toContain("Palette preview")
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('type="radio"')
    expect(markup).toContain("Rounded")
    expect(markup).toContain("Square")
    expect(markup).toContain("Dots")
    expect(markup).toContain("Classy")
    expect(markup).toContain("Classy rounded")
    expect(markup).toContain("Extra rounded")
    expect(markup).toContain("Diamond")
    expect(markup).toContain("Heart")
    expect(markup).not.toContain('grid-cols-3 gap-2')
  })

  it("renders the dashboard color tab as a mutually exclusive accordion", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "palette"

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="style"
        initialStyleTab="color"
        state={state}
      />,
    )

    expect(markup).toContain('data-slot="motion-accordion"')
    expect(markup).toContain(">Solid<")
    expect(markup).toContain(">Gradient<")
    expect(markup).toContain(">Palette<")
    expect(markup).not.toContain("Color mode")
    expect(markup.match(/data-slot="motion-accordion-toggle"/g)?.length).toBe(3)
    expect(markup).toMatch(/data-item-id="palette"[^>]*data-state="open"/)
    expect(markup).toMatch(/data-item-id="solid"[^>]*data-state="closed"/)
    expect(markup).toMatch(/data-item-id="gradient"[^>]*data-state="closed"/)
    expect(markup).toContain("Palette preview")
    expect(markup).toContain('data-slot="color-palette-card"')
  })

  it("opens the matching dashboard color accordion item for gradient mode", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "gradient"

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="style"
        initialStyleTab="color"
        state={state}
      />,
    )

    expect(markup).toMatch(/data-item-id="gradient"[^>]*data-state="open"/)
    expect(markup).toMatch(/data-item-id="palette"[^>]*data-state="closed"/)
    expect(markup).toContain("Dot gradient")
    expect(markup).toContain("Palette preview")
    expect(markup).toContain("Solid color")
  })

  it("renders the embedded color picker for dashboard solid mode", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "solid"

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="style"
        initialStyleTab="color"
        state={state}
      />,
    )

    expect(markup).toMatch(/data-item-id="solid"[^>]*data-state="open"/)
    expect(markup).toContain("Solid color")
    expect(markup).not.toContain("Contrast Ratio")
    expect(markup).not.toContain('aria-label="Set color to')
    expect(markup).not.toContain('id="dots-color"')
  })

  it("shows the corner square style tab by default in its own dashboard section", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="corner-square" />,
    )

    expect(markup).toContain(">Style<")
    expect(markup).toContain(">Color<")
    expect(markup).toContain('data-slot="style-picker"')
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('type="radio"')
    expect(markup).not.toContain('data-slot="select-trigger"')
    expect(markup).not.toContain('data-slot="field-description"')
    expect(markup).toContain("Corner square style")
    expect(markup).not.toContain("Corner square color")
    expect(markup).not.toContain("Corner square gradient")
    expect(markup).not.toContain("Corner dot style")
    expect(markup).toContain("Extra rounded")
    expect(markup).toContain("Square")
    expect(markup).toContain("Rounded")
    expect(markup).toContain("Dots")
    expect(markup).toContain("Classy")
    expect(markup).toContain("Classy rounded")
    expect(markup).toContain("Dot")
  })

  it("shows the corner dot style tab by default in its own dashboard section", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="corner-dot" />,
    )

    expect(markup).toContain(">Style<")
    expect(markup).toContain(">Color<")
    expect(markup).toContain('data-slot="style-picker"')
    expect(markup).not.toContain('data-slot="select-trigger"')
    expect(markup).toContain("Corner dot style")
    expect(markup).not.toContain("Corner dot color")
    expect(markup).not.toContain("Corner dot gradient")
    expect(markup).not.toContain("Corner square style")
    expect(markup).toContain("Dot")
    expect(markup).toContain("Square")
    expect(markup).toContain("Rounded")
    expect(markup).toContain("Dots")
    expect(markup).toContain("Classy")
    expect(markup).toContain("Classy rounded")
    expect(markup).toContain("Extra rounded")
  })

  it("renders the full stacked editor in settings mode", () => {
    const markup = renderToStaticMarkup(<QrControlSections {...baseProps} />)

    expect(markup).toContain("Content")
    expect(markup).toContain("Dots")
    expect(markup).toContain("QR settings")
    expect(markup).toContain('data-slot="select-trigger"')
    expect(markup).not.toContain('data-slot="direction-aware-tabs"')
  })

  it("keeps the compact solid color control outside dashboard mode", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "solid"

    const markup = renderToStaticMarkup(<QrControlSections {...baseProps} state={state} />)

    expect(markup).toContain("Solid color")
    expect(markup).not.toContain("Contrast Ratio")
    expect(markup).toContain('id="dots-color"')
  })

  it("shows the new dots color mode selector", () => {
    const markup = renderToStaticMarkup(<QrControlSections {...baseProps} />)

    expect(markup).toContain("Color mode")
    expect(markup).toContain("Solid")
    expect(markup).toContain("Gradient")
    expect(markup).toContain("Palette")
  })

  it("renders a palette preview card when palette mode is active", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "palette"

    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} state={state} />,
    )

    expect(markup).toContain("Palette preview")
    expect(markup).toContain('data-slot="dots-palette-card"')
    expect(markup).toContain('data-slot="color-palette-card"')
    expect(markup).toContain("4 swatches")
    expect(markup).not.toContain("Dot gradient")
  })

  it("renders the dot gradient editor only in gradient mode", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "gradient"

    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} state={state} />,
    )

    expect(markup).toContain("Dot gradient")
    expect(markup).not.toContain("Palette preview")
  })

  it("uses the adaptive shared-track offset control for dot gradients", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "gradient"

    const markup = renderToStaticMarkup(<QrControlSections {...baseProps} state={state} />)

    expect(markup).toContain("Color stop range")
    expect(markup).toContain('data-slot="adaptive-offset-range-slider"')
    expect(markup).toContain('data-slot="adaptive-offset-track"')
    expect(markup).toContain("Start")
    expect(markup).toContain("End")
    expect(markup).toContain("0.00")
    expect(markup).toContain("1.00")
  })

  it("keeps functional validation copy in dashboard mode", () => {
    const state = createDefaultQrStudioState()
    state.data = ""

    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="content" state={state} />,
    )

    expect(markup).toContain("Add text or a URL to encode")
    expect(markup).not.toContain(
      "The value you enter here is encoded directly into the QR code.",
    )
  })

  it("keeps disabled-state guidance in dashboard mode when a control is unavailable", () => {
    const state = createDefaultQrStudioState()
    state.backgroundOptions.transparent = true

    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="background" state={state} />,
    )

    expect(markup).toContain("Disable transparency to apply a background gradient.")
  })

  it("uses the shared file upload component for logo uploads", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="logo" logoSourceMode="upload" />,
    )

    expect(markup).toContain('aria-label="File upload"')
    expect(markup).toContain("Upload File Illustration")
    expect(markup).not.toContain("Choose file")
  })

  it("adds background asset source controls alongside the existing fill controls", () => {
    const markup = renderToStaticMarkup(
      createElement(QrControlSections as never, {
        ...baseProps,
        backgroundSourceMode: "none",
        onBackgroundModeChange: vi.fn(),
      }),
    )

    expect(markup).toContain("Background source")
    expect(markup).toContain("No background image")
    expect(markup).toContain("Background color")
    expect(markup).toContain("Background gradient")
  })

  it("subordinates background fill controls when a background image is active", () => {
    const state = createDefaultQrStudioState()
    state.backgroundImage = {
      source: "upload",
      value: "blob:https://new-qr-studio.local/background.png",
    }

    const markup = renderToStaticMarkup(
      createElement(QrControlSections as never, {
        ...baseProps,
        activeSection: "background",
        state,
        backgroundSourceMode: "upload",
        onBackgroundModeChange: vi.fn(),
      }),
    )

    expect(markup).toContain("Background image replaces the background fill and gradient.")
  })
})
