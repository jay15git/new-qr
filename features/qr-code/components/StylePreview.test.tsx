import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { StylePreview } from "@/features/qr-code/components/StylePreview"

describe("StylePreview", () => {
  it("renders the extracted qr fragment preview for native dot styles", () => {
    const markup = renderToStaticMarkup(
      <StylePreview previewKind="dots" value="circuit-board" />,
    )

    expect(markup).toContain('data-slot="style-preview-fragment"')
    expect(markup).toContain('data-preview-kind="dots"')
    expect(markup).toContain('data-preview-style="circuit-board"')
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

  it("renders corner-dot previews from a real qr code, cropped to the top-left finder", () => {
    const circleMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-dot" value="circle" />,
    )
    const leafMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-dot" value="leaf" />,
    )
    const squareMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-dot" value="square" />,
    )

    for (const markup of [circleMarkup, leafMarkup, squareMarkup]) {
      expect(markup).toContain('data-slot="style-preview-corner-dot"')
      expect(markup).toContain('data-corner-dot-renderer="real-qr"')
      expect(markup).toContain('viewBox="0 0 7 7"')
      expect(markup).not.toContain('data-slot="style-preview-icon"')
      expect(markup).toContain('data-testid="finder-patterns-inner"')
    }

    // circle renders a rounded rect (the lib maps style="circle" to a square rect
    // with rx=3 inside the 3x3 finder block).
    expect(circleMarkup).toContain("<rect")
    // leaf renders a real <path> from the library's leaf helper.
    expect(leafMarkup).toContain("<path")
    expect(circleMarkup).not.toBe(leafMarkup)
    expect(leafMarkup).not.toBe(squareMarkup)
  })

  it("renders dedicated ring and fallback-grid corner-square previews without cutout masks", () => {
    const ringMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-square" value="rounded-lg" />,
    )
    const gridMarkup = renderToStaticMarkup(
      <StylePreview previewKind="corner-square" value="leaf" />,
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
