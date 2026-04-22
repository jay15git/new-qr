import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Slider } from "@/components/unlumen-ui/slider"

describe("Unlumen slider", () => {
  it("renders square slider geometry for the shared track, fill, and thumb", () => {
    const markup = renderToStaticMarkup(
      <Slider
        label="Logo size"
        min={0}
        max={100}
        step={10}
        value={40}
        onChange={vi.fn()}
      />,
    )

    expect(markup).toContain("rounded-[4px]")
    expect(markup).toContain("rounded-[2px]")
    expect(markup).toContain("border-black/10")
    expect(markup).toContain("Logo size:")
  })
})
