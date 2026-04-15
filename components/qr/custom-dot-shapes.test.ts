import { describe, expect, it } from "vitest"

import { getCustomDotShapeGeometry, isCustomDotShape } from "./custom-dot-shapes"

describe("custom dot shapes", () => {
  it("detects the supported custom shapes", () => {
    expect(isCustomDotShape("heart")).toBe(true)
    expect(isCustomDotShape("diamond")).toBe(true)
    expect(isCustomDotShape("rounded")).toBe(false)
  })

  it("builds a centered diamond placement inside a module cell", () => {
    const geometry = getCustomDotShapeGeometry("diamond", 10, 20, 40)

    expect(geometry.d).toContain("256 0")
    expect(geometry.translateX).toBeCloseTo(12.4)
    expect(geometry.translateY).toBeCloseTo(22.4)
    expect(geometry.scale).toBeCloseTo(0.06875)
  })

  it("builds a more inset placement for heart modules", () => {
    const geometry = getCustomDotShapeGeometry("heart", 0, 0, 16)

    expect(geometry.d).toContain("M1.24264 8.24264")
    expect(geometry.translateX).toBeCloseTo(1.92)
    expect(geometry.translateY).toBeCloseTo(1.92)
    expect(geometry.scale).toBeCloseTo(0.76)
  })
})
