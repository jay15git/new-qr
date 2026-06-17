import { describe, expect, it } from "vitest"

import {
  appendTiltSkewToSvgTransform,
  getBackgroundShapeTiltContainerStyle,
  getBackgroundShapeTiltInnerStyle,
  getBackgroundShapeTiltPerspectiveStyle,
  getLayerCssTransform,
  getLayerSvgTransform,
} from "@/features/workspace/rendering/layer-transform"

describe("layer transform helpers", () => {
  it("builds split css tilt styles for nested preview containers", () => {
    expect(getBackgroundShapeTiltPerspectiveStyle({ tiltX: 0, tiltY: 0 })).toEqual({})
    expect(getBackgroundShapeTiltInnerStyle({ tiltX: 0, tiltY: 0 })).toEqual({})
    expect(getBackgroundShapeTiltPerspectiveStyle({ tiltX: 12, tiltY: -8 })).toEqual({
      perspective: "600px",
    })
    expect(getBackgroundShapeTiltInnerStyle({ tiltX: 12, tiltY: -8 })).toEqual({
      transform: "rotateX(-8deg) rotateY(12deg)",
      transformOrigin: "center center",
      transformStyle: "preserve-3d",
    })
  })

  it("builds shared css tilt container styles for background shapes", () => {
    expect(getBackgroundShapeTiltContainerStyle({ tiltX: 0, tiltY: 0 })).toEqual({})
    expect(getBackgroundShapeTiltContainerStyle({ tiltX: 12, tiltY: -8 })).toEqual({
      perspective: "600px",
      transform: "rotateX(-8deg) rotateY(12deg)",
      transformOrigin: "center center",
      transformStyle: "preserve-3d",
    })
  })

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
