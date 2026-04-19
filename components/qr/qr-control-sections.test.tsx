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
    expect(markup).toMatch(
      /data-slot="direction-aware-tab-panels" class="relative mx-auto h-full w-full min-h-0 overflow-hidden"/,
    )
  })

  it("renders qr-fragment previews for the dashboard dot styles", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="style" />,
    )

    expect(markup).toContain('data-slot="style-preview-fragment"')
    expect(markup).toContain('data-preview-kind="dots"')
    expect(markup).toContain("min-h-28")
    expect(markup).toContain('class="size-16 text-foreground/80"')
    expect(markup).toMatch(
      /data-preview-style="classy"[\s\S]*?data-slot="style-preview-native-module"/,
    )
    expect(markup).toMatch(
      /data-preview-style="classy-rounded"[\s\S]*?data-slot="style-preview-native-module"/,
    )
  })

  it("keeps the corner dot picker on icon previews and renders finder-frame previews for corner squares", () => {
    const cornerSquareMarkup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="corner-square" />,
    )
    const cornerDotMarkup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="corner-dot" />,
    )

    expect(cornerSquareMarkup).toContain('data-preview-kind="corner-square"')
    expect(cornerSquareMarkup).toContain('data-slot="style-preview-corner-square"')
    expect(cornerSquareMarkup).toContain('data-slot="style-preview-corner-square-frame"')
    expect(cornerSquareMarkup).toContain('data-slot="style-preview-corner-square-cutout"')
    expect(cornerSquareMarkup).not.toContain('data-slot="style-preview-icon"')
    expect(cornerSquareMarkup).not.toContain('data-slot="style-preview-fragment"')
    expect(cornerDotMarkup).toContain('data-slot="style-preview-icon"')
    expect(cornerDotMarkup).toContain('data-preview-kind="corner-dot"')
    expect(cornerDotMarkup).not.toContain('data-slot="style-preview-fragment"')
  })

  it("renders distinct corner-square finder-frame variants in the style picker", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="corner-square" />,
    )

    expect(markup).toMatch(
      /data-preview-style="square"[\s\S]*?data-corner-frame-variant="square"/,
    )
    expect(markup).toMatch(
      /data-preview-style="extra-rounded"[\s\S]*?data-corner-frame-variant="extra-rounded"/,
    )
    expect(markup).toMatch(
      /data-preview-style="dot"[\s\S]*?data-corner-frame-variant="dot"/,
    )
    expect(markup).toMatch(
      /data-preview-style="classy-rounded"[\s\S]*?data-corner-frame-variant="classy-rounded"/,
    )
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
    expect(markup).toContain("Palette preview")
    expect(markup).toContain("Use palette")
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
    expect(markup).toMatch(
      /data-slot="direction-aware-tab-panels" class="relative mx-auto h-full w-full min-h-0 overflow-hidden"/,
    )
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
    expect(markup).toMatch(
      /data-slot="direction-aware-tab-panels" class="relative mx-auto h-full w-full min-h-0 overflow-hidden"/,
    )
  })

  it("renders the corner square color tab as a solid or gradient accordion without palette", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="corner-square"
        initialCornerSquareTab="color"
      />,
    )

    expect(markup).toContain('data-slot="motion-accordion"')
    expect(markup).toContain(">Solid<")
    expect(markup).toContain(">Gradient<")
    expect(markup).not.toContain(">Palette<")
    expect(markup.match(/data-slot="motion-accordion-toggle"/g)?.length).toBe(2)
    expect(markup).toMatch(/data-item-id="solid"[^>]*data-state="open"/)
    expect(markup).toMatch(/data-item-id="gradient"[^>]*data-state="closed"/)
    expect(markup).toContain("Solid color")
    expect(markup).not.toContain("Corner square gradient")
  })

  it("uses the enhanced gradient controls for corner square in dashboard mode", () => {
    const state = createDefaultQrStudioState()
    state.cornersSquareGradient.enabled = true

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="corner-square"
        initialCornerSquareTab="color"
        state={state}
      />,
    )

    expect(markup).toContain("Color stop range")
    expect(markup).toContain('data-slot="gradient-offset-range-slider"')
    expect(markup).toContain('data-slot="gradient-offset-track"')
    expect(markup).toContain('data-slot="gradient-offset-thumb"')
    expect(markup).toContain('data-slot="segmented-picker"')
    expect(markup).toContain("linear-gradient(90deg, #18181b 0%, #3f3f46 100%)")
    expect(markup).not.toContain(
      'class="flex justify-center rounded-[var(--radius-xl)] border border-border/70 bg-background/80 p-3"',
    )
    expect(markup).not.toContain('id="corner-square-gradient-rotation"')
    expect(markup).not.toContain('id="corner-square-gradient-start-color"')
    expect(markup).not.toContain('id="corner-square-gradient-end-color"')
  })

  it("opens the corner dot gradient accordion item when its gradient is enabled", () => {
    const state = createDefaultQrStudioState()
    state.cornersDotGradient.enabled = true

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="corner-dot"
        initialCornerDotTab="color"
        state={state}
      />,
    )

    expect(markup).toMatch(/data-item-id="gradient"[^>]*data-state="open"/)
    expect(markup).toMatch(/data-item-id="solid"[^>]*data-state="closed"/)
    expect(markup).not.toContain("Corner dot gradient")
    expect(markup).toContain("Solid color")
    expect(markup).not.toContain(">Palette<")
  })

  it("uses the enhanced gradient controls for corner dot in dashboard mode", () => {
    const state = createDefaultQrStudioState()
    state.cornersDotGradient.enabled = true

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="corner-dot"
        initialCornerDotTab="color"
        state={state}
      />,
    )

    expect(markup).toContain("Color stop range")
    expect(markup).toContain('data-slot="gradient-offset-range-slider"')
    expect(markup).toContain('data-slot="gradient-offset-track"')
    expect(markup).toContain('data-slot="gradient-offset-thumb"')
    expect(markup).toContain('data-slot="segmented-picker"')
    expect(markup).toContain("linear-gradient(90deg, #18181b 0%, #3f3f46 100%)")
    expect(markup).not.toContain('id="corner-dot-gradient-rotation"')
    expect(markup).not.toContain('id="corner-dot-gradient-start-color"')
    expect(markup).not.toContain('id="corner-dot-gradient-end-color"')
  })

  it("renders background dashboard tabs and defaults to colors when no image source is active", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="background" />,
    )

    expect(markup).toContain(">Colors<")
    expect(markup).toContain(">Upload<")
    expect(markup).toContain('data-slot="motion-accordion"')
    expect(markup).toContain(">Solid<")
    expect(markup).toContain(">Gradient<")
    expect(markup).toContain(">Transparent<")
    expect(markup).not.toContain(">Upload file<")
    expect(markup).not.toContain(">Remote URL<")
    expect(markup).not.toContain(">None<")
    expect(markup).toContain("Solid color")
  })

  it("defaults the dashboard background panel to upload when an image source is active", () => {
    const state = createDefaultQrStudioState()
    state.backgroundImage = {
      source: "upload",
      value: "blob:https://new-qr-studio.local/background.png",
    }

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="background"
        backgroundSourceMode="upload"
        state={state}
      />,
    )

    expect(markup).toContain(">Colors<")
    expect(markup).toContain(">Upload<")
    expect(markup).toContain(">None<")
    expect(markup).toContain(">Upload file<")
    expect(markup).toContain(">Remote URL<")
    expect(markup).not.toContain(">Transparent<")
    expect(markup).toContain('aria-label="File upload"')
  })

  it("opens the transparent background color item without rendering a toggle body", () => {
    const state = createDefaultQrStudioState()
    state.backgroundOptions.transparent = true

    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="background" state={state} />,
    )

    expect(markup).toMatch(/data-item-id="transparent"[^>]*data-state="open"/)
    expect(markup).toMatch(/data-item-id="solid"[^>]*data-state="closed"/)
    expect(markup).toMatch(/data-item-id="gradient"[^>]*data-state="closed"/)
    expect(markup).not.toContain("Transparent background")
    expect(markup).not.toContain('id="background-transparent"')
  })

  it("shows disabled guidance in the background colors tab when an image is active", () => {
    const state = createDefaultQrStudioState()
    state.backgroundGradient.enabled = true
    state.backgroundImage = {
      source: "upload",
      value: "blob:https://new-qr-studio.local/background.png",
    }

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="background"
        backgroundSourceMode="upload"
        initialBackgroundTab="colors"
        state={state}
      />,
    )

    expect(markup).toContain("Remove the background image to edit the background fill or gradient.")
  })

  it("uses the enhanced gradient controls for background in dashboard mode", () => {
    const state = createDefaultQrStudioState()
    state.backgroundGradient.enabled = true

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="background"
        initialBackgroundTab="colors"
        state={state}
      />,
    )

    expect(markup).toContain("Color stop range")
    expect(markup).toContain('data-slot="gradient-offset-range-slider"')
    expect(markup).toContain('data-slot="gradient-offset-track"')
    expect(markup).toContain('data-slot="gradient-offset-thumb"')
    expect(markup).toContain('data-slot="segmented-picker"')
    expect(markup).toContain("linear-gradient(90deg, #f8fafc 0%, #dbeafe 100%)")
    expect(markup).not.toContain('id="background-gradient-rotation"')
    expect(markup).not.toContain('id="background-gradient-start-color"')
    expect(markup).not.toContain('id="background-gradient-end-color"')
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

    expect(markup).toContain('data-slot="gradient-offset-range-slider"')
    expect(markup).toContain('data-slot="gradient-offset-track"')
    expect(markup).toContain('data-slot="gradient-offset-thumb"')
    expect(markup).toContain("linear-gradient(90deg, #18181b 0%, #3f3f46 100%)")
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

  it("uses one square size slider instead of separate width and height controls", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="content" />,
    )

    expect(markup).toContain('data-slot="qr-size-slider"')
    expect(markup).toContain("Size")
    expect(markup).not.toContain(">Width<")
    expect(markup).not.toContain(">Height<")
  })

  it("uses a slider for outer margin in the content section", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="content" />,
    )

    expect(markup).toContain('data-slot="qr-margin-slider"')
    expect(markup).toContain("Outer margin")
  })

  it("renders the upload tab with the shared file upload component for dashboard logos", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="logo" logoSourceMode="upload" />,
    )

    expect(markup).toContain('data-slot="direction-aware-tabs"')
    expect(markup).toContain(">Brand Icons<")
    expect(markup).toContain(">Upload<")
    expect(markup).toMatch(/data-tab="upload"[^>]*aria-selected="true"/)
    expect(markup).toContain('data-slot="motion-accordion"')
    expect(markup).toContain(">None<")
    expect(markup).toContain(">Upload file<")
    expect(markup).toContain(">Remote URL<")
    expect(markup).toContain('aria-label="File upload"')
    expect(markup).toContain("Upload File Illustration")
    expect(markup).not.toContain("Choose file")
  })

  it("renders the brand icon tab with category filters for preset logos", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "preset",
      presetId: "whatsapp" as never,
      presetColor: "#111827",
      value: "data:image/svg+xml,%3Csvg%20/%3E",
    }

    const markup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="logo"
        logoSourceMode="preset"
        state={state}
      />,
    )

    expect(markup).toContain(">Brand Icons<")
    expect(markup).toContain(">Upload<")
    expect(markup).toMatch(/data-tab="brand-icons"[^>]*aria-selected="true"/)
    expect(markup).toContain("Search brand icons")
    expect(markup).toContain("Icon category")
    expect(markup).toContain(">All<")
    expect(markup).toContain(">Social<")
    expect(markup).toContain(">Business<")
    expect(markup).toContain(">Payments<")
    expect(markup).toContain(">Travel<")
    expect(markup).toContain(">Media<")
    expect(markup).toContain(">Web<")
    expect(markup).not.toContain("Popular")
    expect(markup).toContain("WhatsApp")
    expect(markup).toContain("Instagram")
    expect(markup).toContain("GitHub")
    expect(markup).toContain("Logo icon color")
  })

  it("keeps logo adjustment controls below the dashboard logo source options", () => {
    const markup = renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="logo" />,
    )

    expect(markup).toContain(">Brand Icons<")
    expect(markup).toContain(">Upload<")
    expect(markup).toContain("Logo size")
    expect(markup).toContain('data-slot="logo-size-slider"')
    expect(markup).toContain("40%")
    expect(markup).toContain("Logo margin")
    expect(markup).toContain('data-slot="logo-margin-slider"')
    expect(markup).toContain("Hide background dots")
    expect(markup).toContain("Save embedded image as blob")
  })

  it("shows the preset logo color control only for preset logos", () => {
    const presetState = createDefaultQrStudioState()
    presetState.logo = {
      source: "preset",
      presetId: "github" as never,
      presetColor: "#111827",
      value: "data:image/svg+xml,%3Csvg%20/%3E",
    }

    const presetMarkup = renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="logo"
        logoSourceMode="preset"
        state={presetState}
      />,
    )
    const defaultMarkup = renderToStaticMarkup(<QrControlSections {...baseProps} />)

    expect(presetMarkup).toContain("Logo icon color")
    expect(presetMarkup).toContain('data-slot="color-picker"')
    expect(defaultMarkup).not.toContain("Logo icon color")
  })

  it("keeps the stacked logo editor unchanged outside dashboard mode", () => {
    const markup = renderToStaticMarkup(<QrControlSections {...baseProps} />)

    expect(markup).toContain("Logo source")
    expect(markup).toContain("Logo size")
    expect(markup).toContain("Logo margin")
    expect(markup).toContain("Hide background dots")
    expect(markup).toContain("Save embedded image as blob")
    expect(markup).toContain('data-slot="select-trigger"')
    expect(markup).not.toContain(">Upload file<")
    expect(markup).not.toContain(">Remote URL<")
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

  it("keeps the stacked background editor unchanged outside dashboard mode", () => {
    const markup = renderToStaticMarkup(<QrControlSections {...baseProps} />)

    expect(markup).toContain("Background source")
    expect(markup).toContain("No background image")
    expect(markup).toContain("Transparent background")
    expect(markup).toContain("Background color")
    expect(markup).toContain("Background gradient")
    expect(markup).not.toContain(">Colors<")
    expect(markup).not.toContain(">Upload<")
  })

  it("prioritizes the upload tab when a background image is active", () => {
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

    expect(markup).toMatch(/data-tab="upload"[^>]*aria-selected="true"/)
    expect(markup).toContain(">Upload file<")
    expect(markup).toContain('aria-label="File upload"')
  })
})
