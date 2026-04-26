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

  it("uses drafting tokens for drafting chrome controls", () => {
    const markup = renderToStaticMarkup(
      <ColorPicker chrome="drafting" onColorChange={vi.fn()} value="#111827" />,
    )

    expect(markup).toContain("text-[var(--drafting-ink)]")
    expect(markup).toContain("bg-[var(--drafting-control-bg)]")
    expect(markup).toContain("focus-visible:border-[var(--drafting-line-strong)]")
    expect(markup).toContain("border-[var(--drafting-line)]")
    expect(markup).not.toContain("text-[#111111]")
    expect(markup).not.toContain("bg-black/[0.04]")
    expect(markup).not.toContain("focus-visible:border-black/15")
  })
})
