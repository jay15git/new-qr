// @vitest-environment jsdom

import { describe, expect, it } from "vitest"

import { getFinderCornerRegions } from "./finder-gradient-overlays"
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

  it("renders localized finder outer gradients from portable props", () => {
    const markup = renderNewQrSvg({
      value: "https://example.com",
      finderOuter: "rounded-lg",
      finderOuterColor: "#111827",
      finderOuterGradient: {
        type: "linear",
        rotation: Math.PI / 4,
        stops: [
          { offset: 0, color: "#ff0000" },
          { offset: 1, color: "#0000ff" },
        ],
      },
      foreground: "#111827",
      background: "#ffffff",
      margin: 12,
    })

    const resultDoc = new DOMParser().parseFromString(markup, "image/svg+xml")
    const frameFillSizes = Array.from(
      resultDoc.querySelectorAll('[data-qr-layer="corner-frame-gradient-fill"]'),
    ).map((element) => Number.parseFloat(element.getAttribute("width") ?? "0"))

    expect(markup).toContain('data-qr-layer="corner-frame-gradient"')
    expect(frameFillSizes).toHaveLength(3)
    expect(frameFillSizes.every((width) => width === 7)).toBe(true)
  })

  it("renders localized finder inner gradients from portable props", () => {
    const markup = renderNewQrSvg({
      value: "https://example.com",
      finderInner: "circle",
      finderInnerColor: "#111827",
      finderInnerGradient: {
        type: "linear",
        rotation: Math.PI / 2,
        stops: [
          { offset: 0, color: "#00ff00" },
          { offset: 1, color: "#ffff00" },
        ],
      },
      foreground: "#111827",
      background: "#ffffff",
      margin: 12,
    })

    const resultDoc = new DOMParser().parseFromString(markup, "image/svg+xml")
    const dotFillSizes = Array.from(
      resultDoc.querySelectorAll('[data-qr-layer="corner-dot-gradient-fill"]'),
    ).map((element) => Number.parseFloat(element.getAttribute("width") ?? "0"))

    expect(markup).toContain('data-qr-layer="corner-dot-gradient"')
    expect(dotFillSizes).toHaveLength(3)
    expect(dotFillSizes.every((width) => width === 4.5)).toBe(true)
  })

  it("renders localized finder regions for portable rendering", () => {
    expect(getFinderCornerRegions(12, 49, "outer")[0]).toEqual({
      height: 7,
      width: 7,
      x: 12,
      y: 12,
    })
  })
})
