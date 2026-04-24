import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { StylePreview } from "@/components/qr/qr-style-preview-renderer"

describe("StylePreview", () => {
  it("renders the extracted qr fragment preview for native dot styles", () => {
    const markup = renderToStaticMarkup(
      <StylePreview previewKind="dots" value="classy-rounded" />,
    )

    expect(markup).toContain('data-slot="style-preview-fragment"')
    expect(markup).toContain('data-preview-kind="dots"')
    expect(markup).toContain('data-preview-style="classy-rounded"')
    expect(markup).toContain('data-preview-fragment-size="9"')
    expect(markup).toContain('data-preview-module-pitch="4"')
    expect(markup).toContain('data-preview-module-size="4"')
    expect(markup).toContain('data-slot="style-preview-native-module"')
  })

  it("renders custom dot previews for diamond and heart through the shared renderer", () => {
    const diamondMarkup = renderToStaticMarkup(
      <StylePreview previewKind="dots" value="diamond" />,
    )
    const heartMarkup = renderToStaticMarkup(
      <StylePreview previewKind="dots" value="heart" />,
    )

    expect(diamondMarkup).toContain('data-preview-style="diamond"')
    expect(diamondMarkup).toContain('data-slot="style-preview-custom-module"')
    expect(heartMarkup).toContain('data-preview-style="heart"')
    expect(heartMarkup).toContain('data-slot="style-preview-custom-module"')
  })

  it("renders dedicated corner-dot previews without the generic icon path", () => {
    const filledMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-dot" value="dot" />,
    )
    const gridMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-dot" value="classy-rounded" />,
    )

    expect(filledMarkup).toContain('data-slot="style-preview-corner-dot"')
    expect(filledMarkup).toContain('data-corner-dot-renderer="filled"')
    expect(filledMarkup).toContain('data-slot="style-preview-corner-dot-shape"')
    expect(filledMarkup).not.toContain('data-slot="style-preview-icon"')
    expect(gridMarkup).toContain('data-corner-dot-renderer="grid"')
    expect(gridMarkup).toContain('data-slot="style-preview-native-module"')
    expect(gridMarkup).not.toContain('data-slot="style-preview-icon"')
  })

  it("renders dedicated ring and fallback-grid corner-square previews without cutout masks", () => {
    const ringMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-square" value="extra-rounded" />,
    )
    const gridMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-square" value="classy-rounded" />,
    )

    expect(ringMarkup).toContain('data-slot="style-preview-corner-square"')
    expect(ringMarkup).toContain('data-corner-square-renderer="ring"')
    expect(ringMarkup).toContain('data-slot="style-preview-corner-square-frame"')
    expect(ringMarkup).not.toContain('style-preview-corner-square-cutout')
    expect(gridMarkup).toContain('data-corner-square-renderer="grid"')
    expect(gridMarkup).toContain('data-slot="style-preview-corner-square-grid"')
    expect(gridMarkup).toContain('data-slot="style-preview-native-module"')
    expect(gridMarkup).not.toContain('style-preview-corner-square-cutout')
  })
})
