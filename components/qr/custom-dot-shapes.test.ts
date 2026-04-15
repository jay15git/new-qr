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
    expect(geometry.translateX).toBeCloseTo(10.8)
    expect(geometry.translateY).toBeCloseTo(20.8)
    expect(geometry.scaleX).toBeCloseTo(0.1044, 3)
    expect(geometry.scaleY).toBeCloseTo(0.075, 3)
    expect(geometry.originX).toBeCloseTo(-72.115)
    expect(geometry.originY).toBeCloseTo(0)
  })

  it("normalizes the heart shape to fill most of the module height", () => {
    const geometry = getCustomDotShapeGeometry("heart", 0, 0, 16)

    expect(geometry.d).toContain("M1.24264 8.24264")
    expect(geometry.translateX).toBeCloseTo(0.64)
    expect(geometry.translateY).toBeCloseTo(0.64)
    expect(geometry.scaleX).toBeCloseTo(0.92)
    expect(geometry.scaleY).toBeCloseTo(1.0514, 3)
    expect(geometry.originX).toBeCloseTo(0)
    expect(geometry.originY).toBeCloseTo(-1)
  })
})
