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
})
