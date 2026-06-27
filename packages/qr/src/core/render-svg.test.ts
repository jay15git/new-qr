// @vitest-environment jsdom

import { describe, expect, it } from "vitest"

import { renderNewQrSvg } from "./render-svg"

describe("@new-qr/qr core renderer", () => {
  it("renders svg from portable props", () => {
    const markup = renderNewQrSvg({
      value: "https://example.com",
      module: "diamond",
      finderInner: "rounded",
      finderOuter: "rounded-lg",
      foreground: "#111827",
      background: "#ffffff",
    })

    expect(markup).toContain("<svg")
    expect(markup).toContain('data-testid="data-modules"')
    expect(markup).toContain('data-testid="finder-patterns-outer"')
  })
})
