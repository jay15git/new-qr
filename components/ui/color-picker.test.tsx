import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import ColorPicker from "@/components/ui/color-picker"

describe("ColorPicker", () => {
  it("renders softly squared saturation and hue pointers", () => {
    const markup = renderToStaticMarkup(
      <ColorPicker chrome="embedded" onColorChange={vi.fn()} value="#5a289e" />,
    )

    expect(markup).toContain('data-slot="color-picker"')
    expect(markup).toContain("rounded-[4px]")
    expect(markup).toContain("rounded-[2px]")
  })
})
