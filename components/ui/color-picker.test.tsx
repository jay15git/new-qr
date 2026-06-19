import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { ColorPicker } from "@/components/ui/color-picker"

describe("ColorPicker", () => {
  it("renders the saturation area and format controls", () => {
    const markup = renderToStaticMarkup(
      <ColorPicker defaultFormat="hex" onValueChange={vi.fn()} value="#5a289e" />,
    )

    expect(markup).toContain('data-slot="color-picker"')
    expect(markup).toContain('data-slot="color-picker-area"')
    expect(markup).toContain("Saturation and brightness")
    expect(markup).toContain("HEX")
  })
})
