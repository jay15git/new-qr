import { describe, expect, it } from "vitest"

import {
  appendTiltSkewToSvgTransform,
  getLayerCssTransform,
  getLayerSvgTransform,
} from "@/features/workspace/rendering/layer-transform"

describe("layer transform helpers", () => {
  it("builds css transforms with skew tilt and rotation", () => {
    expect(
      getLayerCssTransform({
        height: 100,
        rotation: 45,
        tiltX: 12,
        tiltY: -8,
        width: 100,
        x: 10,
        y: 20,
      }),
    ).toBe(
      "translate3d(10px, 20px, 0) rotate(45deg) skewY(12deg) skewX(-8deg)",
    )
  })

  it("appends skew transforms around a center point for svg export", () => {
    const transform = appendTiltSkewToSvgTransform("translate(0 0)", 20, -15, 50, 50)

    expect(transform).toBe(
      "translate(0 0) translate(50 50) skewX(-15) skewY(20) translate(-50 -50)",
    )
  })

  it("keeps the base svg transform when tilt is zero", () => {
    expect(getLayerSvgTransform({
      height: 80,
      rotation: 0,
      tiltX: 0,
      tiltY: 0,
      width: 120,
      x: 4,
      y: 6,
    })).toBe("translate(4 6) rotate(0 60 40)")
  })
})
