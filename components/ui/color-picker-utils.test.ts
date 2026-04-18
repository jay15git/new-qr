import { describe, expect, it } from "vitest"

import {
  coerceHexColor,
  getContrastRatios,
  updateHslaChannel,
  updateRgbaChannel,
  toHsvaColor,
} from "./color-picker-utils"

describe("color picker utils", () => {
  it("keeps valid 6-digit hex colors", () => {
    expect(coerceHexColor("#5a289e")).toBe("#5a289e")
  })

  it("falls back for invalid hex colors", () => {
    expect(coerceHexColor("purple")).toBe("#000000")
    expect(coerceHexColor("#123")).toBe("#000000")
  })

  it("converts the coerced hex value into hsva", () => {
    expect(toHsvaColor("#ffffff")).toEqual({ h: 0, s: 0, v: 100, a: 1 })
    expect(toHsvaColor("invalid")).toEqual({ h: 0, s: 0, v: 0, a: 1 })
  })

  it("calculates contrast ratios for light and dark surfaces", () => {
    expect(getContrastRatios("#ffffff")).toEqual({ dark: 1, light: 21 })
    expect(getContrastRatios("#000000")).toEqual({ dark: 21, light: 1 })
  })

  it("updates hsl channels from string input", () => {
    expect(updateHslaChannel({ h: 266, s: 100, l: 69, a: 1 }, "h", "270")).toEqual({
      h: 270,
      s: 100,
      l: 69,
      a: 1,
    })
    expect(updateHslaChannel({ h: 266, s: 100, l: 69, a: 1 }, "s", "bad")).toEqual({
      h: 266,
      s: 100,
      l: 69,
      a: 1,
    })
  })

  it("updates rgb channels from string input", () => {
    expect(updateRgbaChannel({ r: 90, g: 40, b: 158, a: 1 }, "b", "200")).toEqual({
      r: 90,
      g: 40,
      b: 200,
      a: 1,
    })
    expect(updateRgbaChannel({ r: 90, g: 40, b: 158, a: 1 }, "r", "bad")).toEqual({
      r: 90,
      g: 40,
      b: 158,
      a: 1,
    })
  })
})
