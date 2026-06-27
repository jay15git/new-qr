import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { ControlsPanel } from "@/features/qr-code/components/ControlsPanel"
import { createDefaultQrStudioState } from "@/features/qr-code/model/state"

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

function getStylePreviewMarkup(markup: string, style: string) {
  const match = markup.match(
    new RegExp(`<svg[^>]*data-preview-style="${style}"[\\s\\S]*?<\\/svg>`),
  )

  expect(match).not.toBeNull()

  return match![0]
}

describe("ControlsPanel", () => {
  it("renders only the selected section in dashboard mode without a duplicate section header", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="style" />,
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
      <ControlsPanel {...baseProps} activeSection="style" />,
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
    expect(markup).toContain("Small square")
    expect(markup).toContain("Pinched square")
    expect(markup).toContain("Circle")
    expect(markup).toContain("Circuit board")
    expect(markup).toContain("Hashtag")
    expect(markup).toContain("Diamond")
    expect(markup).toContain("Heart")
    expect(markup).not.toContain('grid-cols-3 gap-2')
    expect(markup).toMatch(
      /data-slot="direction-aware-tab-panels" class="relative mx-auto h-full w-full min-h-0 overflow-hidden"/,
    )
  })

  it("renders qr-fragment previews for the dashboard dot styles", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="style" />,
    )

    expect(markup).toContain('data-slot="style-preview-fragment"')
    expect(markup).toContain('data-preview-kind="dots"')
    expect(markup).toContain('data-preview-fragment-size="9"')
    expect(markup).toContain('data-preview-module-pitch="4"')
    expect(markup).toContain('data-preview-module-size="4"')
    expect(markup).toContain("min-h-28")
    expect(markup).toContain('class="size-[5.5rem] text-foreground/80 dark:text-white"')
    expect(markup).toMatch(
      /data-preview-style="circle"[\s\S]*?data-slot="style-preview-native-module"/,
    )
    expect(markup).toMatch(
      /data-preview-style="circuit-board"[\s\S]*?data-slot="style-preview-native-module"/,
    )
    expect(markup).toMatch(
      /data-preview-style="diamond"[\s\S]*?data-slot="style-preview-custom-module"/,
    )
    expect(markup).toMatch(
      /data-preview-style="heart"[\s\S]*?data-slot="style-preview-custom-module"/,
    )
  })

  it("renders dedicated corner-dot finder previews and finder-frame previews for corner squares", () => {
    const cornerSquareMarkup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="corner-square" />,
    )
    const cornerDotMarkup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="corner-dot" />,
    )

    expect(cornerSquareMarkup).toContain('data-preview-kind="corner-square"')
    expect(cornerSquareMarkup).toContain('data-slot="style-preview-corner-square"')
    expect(cornerSquareMarkup).toContain('data-corner-frame-renderer="real-qr"')
    expect(cornerSquareMarkup).not.toContain('data-slot="style-preview-icon"')
    expect(cornerSquareMarkup).not.toContain('data-slot="style-preview-fragment"')
    expect(cornerDotMarkup).toContain('data-slot="style-preview-corner-dot"')
    expect(cornerDotMarkup).toContain('data-preview-kind="corner-dot"')
    expect(cornerDotMarkup).not.toContain('data-slot="style-preview-icon"')
    expect(cornerDotMarkup).not.toContain('data-slot="style-preview-fragment"')
  })

  it("renders distinct corner-dot preview markup sourced from a real qr code", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="corner-dot" />,
    )

    const circleMarkup = getStylePreviewMarkup(markup, "circle")
    const squareMarkup = getStylePreviewMarkup(markup, "square")
    const heartMarkup = getStylePreviewMarkup(markup, "heart")
    const leafMarkup = getStylePreviewMarkup(markup, "leaf")

    for (const preview of [circleMarkup, squareMarkup, heartMarkup, leafMarkup]) {
      expect(preview).toContain('data-slot="style-preview-corner-dot"')
      expect(preview).toContain('data-corner-dot-renderer="real-qr"')
      expect(preview).toContain('viewBox="1.65 1.65 3.7 3.7"')
      expect(preview).toContain('data-testid="finder-patterns-inner"')
    }

    expect(circleMarkup).not.toBe(squareMarkup)
    expect(squareMarkup).not.toBe(heartMarkup)
    expect(heartMarkup).not.toBe(leafMarkup)
  })

  it("renders distinct corner-square preview markup sourced from a real qr code", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="corner-square" />,
    )

    const circleMarkup = getStylePreviewMarkup(markup, "circle")
    const squareMarkup = getStylePreviewMarkup(markup, "square")
    const roundedLargeMarkup = getStylePreviewMarkup(markup, "rounded-lg")
    const leafMarkup = getStylePreviewMarkup(markup, "leaf")

    for (const preview of [circleMarkup, squareMarkup, roundedLargeMarkup, leafMarkup]) {
      expect(preview).toContain('data-slot="style-preview-corner-square"')
      expect(preview).toContain('data-corner-frame-renderer="real-qr"')
      expect(preview).toContain('viewBox="0 0 7 7"')
      expect(preview).toContain('data-testid="finder-patterns-outer"')
      expect(preview).not.toContain('style-preview-corner-square-grid')
    }

    expect(leafMarkup).toContain("<path")
    expect(circleMarkup).not.toBe(squareMarkup)
    expect(squareMarkup).not.toBe(roundedLargeMarkup)
    expect(roundedLargeMarkup).not.toBe(leafMarkup)
  })

  it("renders the dashboard color tab as a mutually exclusive accordion", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "palette"

    const markup = renderToStaticMarkup(
      <ControlsPanel
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
      <ControlsPanel
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
      <ControlsPanel
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
      <ControlsPanel {...baseProps} activeSection="corner-square" />,
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
    expect(markup).toContain("Square")
    expect(markup).toContain("Rounded")
    expect(markup).toContain("Large rounded")
    expect(markup).toContain("Circle")
    expect(markup).toContain("Inpoint")
    expect(markup).toContain("Outpoint")
    expect(markup).toContain("Leaf")
    expect(markup).toMatch(
      /data-slot="direction-aware-tab-panels" class="relative mx-auto h-full w-full min-h-0 overflow-hidden"/,
    )
  })

  it("shows the corner dot style tab by default in its own dashboard section", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="corner-dot" />,
    )

    expect(markup).toContain(">Style<")
    expect(markup).toContain(">Color<")
    expect(markup).toContain('data-slot="style-picker"')
    expect(markup).not.toContain('data-slot="select-trigger"')
    expect(markup).toContain("Corner dot style")
    expect(markup).not.toContain("Corner dot color")
    expect(markup).not.toContain("Corner dot gradient")
    expect(markup).not.toContain("Corner square style")
    expect(markup).toContain("Square")
    expect(markup).toContain("Rounded")
    expect(markup).toContain("Large rounded")
    expect(markup).toContain("Circle")
    expect(markup).toContain("Diamond")
    expect(markup).toContain("Star")
    expect(markup).toContain("Heart")
    expect(markup).toContain("Hashtag")
    expect(markup).toContain("Microchip")
    expect(markup).toMatch(
      /data-slot="direction-aware-tab-panels" class="relative mx-auto h-full w-full min-h-0 overflow-hidden"/,
    )
  })

  it("renders the corner square color tab as a solid or gradient accordion without palette", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel
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
    state.finderPatternOuterGradient.enabled = true

    const markup = renderToStaticMarkup(
      <ControlsPanel
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
    expect(markup).toContain("var(--checker-a, #808080)")
    expect(markup).toContain("linear-gradient(to right")
    expect(markup).not.toContain(
      'class="flex justify-center rounded-[var(--radius-xl)] border border-border/70 bg-background/80 p-3"',
    )
    expect(markup).not.toContain('id="corner-square-gradient-rotation"')
    expect(markup).not.toContain('id="corner-square-gradient-start-color"')
    expect(markup).not.toContain('id="corner-square-gradient-end-color"')
  })

  it("opens the corner dot gradient accordion item when its gradient is enabled", () => {
    const state = createDefaultQrStudioState()
    state.finderPatternInnerGradient.enabled = true

    const markup = renderToStaticMarkup(
      <ControlsPanel
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
    state.finderPatternInnerGradient.enabled = true

    const markup = renderToStaticMarkup(
      <ControlsPanel
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
    expect(markup).toContain("var(--checker-a, #808080)")
    expect(markup).toContain("linear-gradient(to right")
    expect(markup).not.toContain('id="corner-dot-gradient-rotation"')
    expect(markup).not.toContain('id="corner-dot-gradient-start-color"')
    expect(markup).not.toContain('id="corner-dot-gradient-end-color"')
  })

  it("renders background dashboard tabs and defaults to colors when no image source is active", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="background" />,
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
      <ControlsPanel
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
      <ControlsPanel {...baseProps} activeSection="background" state={state} />,
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
      <ControlsPanel
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
      <ControlsPanel
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
    expect(markup).toContain("var(--checker-a, #808080)")
    expect(markup).toContain("linear-gradient(to right")
    expect(markup).not.toContain('id="background-gradient-rotation"')
    expect(markup).not.toContain('id="background-gradient-start-color"')
    expect(markup).not.toContain('id="background-gradient-end-color"')
  })

  it("renders the full stacked editor in settings mode", () => {
    const markup = renderToStaticMarkup(<ControlsPanel {...baseProps} />)

    expect(markup).toContain("Content")
    expect(markup).toContain("Dots")
    expect(markup).toContain("QR settings")
    expect(markup).toContain('data-slot="select-trigger"')
    expect(markup).not.toContain('data-slot="direction-aware-tabs"')
  })

  it("keeps the compact solid color control outside dashboard mode", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "solid"

    const markup = renderToStaticMarkup(<ControlsPanel {...baseProps} state={state} />)

    expect(markup).toContain("Solid color")
    expect(markup).not.toContain("Contrast Ratio")
    expect(markup).toContain('id="dots-color"')
  })

  it("shows the new dots color mode selector", () => {
    const markup = renderToStaticMarkup(<ControlsPanel {...baseProps} />)

    expect(markup).toContain("Color mode")
    expect(markup).toContain("Solid")
    expect(markup).toContain("Gradient")
    expect(markup).toContain("Palette")
  })

  it("renders a palette preview card when palette mode is active", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "palette"

    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} state={state} />,
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
      <ControlsPanel {...baseProps} state={state} />,
    )

    expect(markup).toContain("Dot gradient")
    expect(markup).not.toContain("Palette preview")
  })

  it("uses the adaptive shared-track offset control for dot gradients", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "gradient"

    const markup = renderToStaticMarkup(<ControlsPanel {...baseProps} state={state} />)

    expect(markup).toContain('data-slot="gradient-offset-range-slider"')
    expect(markup).toContain('data-slot="gradient-offset-track"')
    expect(markup).toContain('data-slot="gradient-offset-thumb"')
    expect(markup).toContain("var(--checker-a, #808080)")
    expect(markup).toContain("linear-gradient(to right")
  })

  it("keeps functional validation copy in dashboard mode", () => {
    const state = createDefaultQrStudioState()
    state.data = ""

    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="content" state={state} />,
    )

    expect(markup).toContain("Add text or a URL to encode")
    expect(markup).not.toContain(
      "The value you enter here is encoded directly into the QR code.",
    )
  })

  it("omits the render type selector in dashboard mode", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="content" />,
    )

    expect(markup).not.toContain('id="qr-draw-type"')
    expect(markup).not.toContain("Changes the live preview renderer only.")
  })

  it("keeps render type scoped to the settings preview flow", () => {
    const markup = renderToStaticMarkup(<ControlsPanel {...baseProps} />)

    expect(markup).toContain('id="qr-draw-type"')
    expect(markup).toContain(
      "Changes the live preview renderer only. Export buttons still choose the downloaded file format.",
    )
  })

  it("does not render the size slider below the content preview", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="content" />,
    )

    expect(markup).not.toContain('data-slot="qr-size-slider"')
    expect(markup).not.toContain("Size")
  })

  it("uses a slider for outer margin in the content section", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="content" />,
    )

    expect(markup).toContain('data-slot="qr-margin-slider"')
    expect(markup).toContain("Outer margin")
  })

  it("renders the upload tab with the shared file upload component for dashboard logos", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="logo" logoSourceMode="upload" />,
    )

    expect(markup).toContain('data-slot="direction-aware-tabs"')
    expect(markup).toContain(">Brand Icons<")
    expect(markup).toContain(">COLORS<")
    expect(markup).toContain(">Upload<")
    expect(markup).toContain(">Size<")
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
      <ControlsPanel
        {...baseProps}
        activeSection="logo"
        logoSourceMode="preset"
        state={state}
      />,
    )

    expect(markup).toContain(">Brand Icons<")
    expect(markup).toContain(">COLORS<")
    expect(markup).toContain(">Upload<")
    expect(markup).toContain(">Size<")
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
    expect(markup).not.toContain("Logo icon color")
  })

  it("keeps dashboard logo size controls inside the size tab", () => {
    const markup = renderToStaticMarkup(
      <ControlsPanel {...baseProps} activeSection="logo" />,
    )

    expect(markup).toContain(">Brand Icons<")
    expect(markup).toContain(">COLORS<")
    expect(markup).toContain(">Upload<")
    expect(markup).toContain(">Size<")
    expect(markup).not.toContain("Logo size")
    expect(markup).not.toContain('data-slot="logo-size-slider"')
    expect(markup).not.toContain("Logo margin")
    expect(markup).not.toContain('data-slot="logo-margin-slider"')
    expect(markup).not.toContain("Hide background dots")
    expect(markup).not.toContain("Save embedded image as blob")
  })

  it("keeps the colors tab out of the stacked logo editor", () => {
    const presetState = createDefaultQrStudioState()
    presetState.logo = {
      source: "preset",
      presetId: "github" as never,
      presetColor: "#111827",
      value: "data:image/svg+xml,%3Csvg%20/%3E",
    }

    const presetMarkup = renderToStaticMarkup(
      <ControlsPanel
        {...baseProps}
        state={presetState}
        logoSourceMode="preset"
      />,
    )
    const defaultMarkup = renderToStaticMarkup(<ControlsPanel {...baseProps} />)

    expect(presetMarkup).toContain("Logo icon color")
    expect(presetMarkup).toContain('data-slot="color-picker"')
    expect(presetMarkup).not.toContain(">COLORS<")
    expect(defaultMarkup).not.toContain("Logo icon color")
    expect(defaultMarkup).not.toContain(">COLORS<")
  })

  it("keeps the stacked logo editor unchanged outside dashboard mode", () => {
    const markup = renderToStaticMarkup(<ControlsPanel {...baseProps} />)

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
      createElement(ControlsPanel as never, {
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
    const markup = renderToStaticMarkup(<ControlsPanel {...baseProps} />)

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
      createElement(ControlsPanel as never, {
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
