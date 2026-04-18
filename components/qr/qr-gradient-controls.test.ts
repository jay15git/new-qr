import { describe, expect, it } from "vitest"

import {
  clampGradientOffset,
  normalizeGradientOffsetRange,
  degreesToRadians,
  radiansToDegrees,
} from "./qr-gradient-controls"

describe("qr gradient controls helpers", () => {
  it("converts degrees to radians", () => {
    expect(degreesToRadians(0)).toBe(0)
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI)
    expect(degreesToRadians(360)).toBeCloseTo(Math.PI * 2)
  })

  it("converts radians to degrees", () => {
    expect(radiansToDegrees(0)).toBe(0)
    expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90)
    expect(radiansToDegrees(Math.PI * 2)).toBeCloseTo(360)
  })

  it("clamps gradient offsets into the supported range", () => {
    expect(clampGradientOffset(-0.25)).toBe(0)
    expect(clampGradientOffset(0.42)).toBe(0.42)
    expect(clampGradientOffset(1.4)).toBe(1)
  })

  it("normalizes a gradient offset range into ascending supported values", () => {
    expect(normalizeGradientOffsetRange([-0.25, 1.4])).toEqual([0, 1])
    expect(normalizeGradientOffsetRange([0.8, 0.2])).toEqual([0.2, 0.8])
  })
})
