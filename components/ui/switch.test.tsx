import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Switch } from "@/components/ui/switch"

describe("Switch", () => {
  it("renders square-leaning shared switch geometry for the track and thumb", () => {
    const markup = renderToStaticMarkup(<Switch aria-label="Toggle feature" checked />)

    expect(markup).toContain('data-slot="switch"')
    expect(markup).toContain('data-slot="switch-thumb"')
    expect(markup).toContain("rounded-[3px]")
    expect(markup).toContain("p-[2px]")
    expect(markup).toContain("rounded-[2px]")
    expect(markup).toContain("border-black/8")
    expect(markup).toContain("shadow-[0_1px_2px_rgba(15,23,42,0.18)]")
    expect(markup).toContain("translate-x-[14px]")
  })
})
