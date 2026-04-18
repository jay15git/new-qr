import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  AdaptiveOffsetRangeSlider,
  buildAdaptiveTrackGradient,
  moveAdaptiveOffsetHandle,
} from "@/components/ui/adaptive-slider"

describe("Adaptive offset range slider", () => {
  it("builds a track gradient from the current start and end colors", () => {
    expect(buildAdaptiveTrackGradient("#ef4f93", "#3730a3")).toBe(
      "linear-gradient(90deg, #ef4f93 0%, #3730a3 100%)",
    )
  })

  it("renders inline start and end value chips", () => {
    const markup = renderToStaticMarkup(
      <AdaptiveOffsetRangeSlider
        id="dots-offset-range"
        startColor="#ef4f93"
        endColor="#3730a3"
        startValue={0.2}
        endValue={0.8}
        min={0}
        max={1}
        step={0.01}
        onValueChange={vi.fn()}
      />,
    )

    expect(markup).toContain('data-slot="adaptive-offset-range-slider"')
    expect(markup).toContain('data-slot="adaptive-offset-track"')
    expect(markup).toContain("Start")
    expect(markup).toContain("0.20")
    expect(markup).toContain("End")
    expect(markup).toContain("0.80")
    expect(markup).toContain("linear-gradient(90deg, #ef4f93 0%, #3730a3 100%)")
  })

  it("moves the start handle without crossing when it stays before the end handle", () => {
    expect(
      moveAdaptiveOffsetHandle({
        startValue: 0.2,
        endValue: 0.8,
        activeHandle: "start",
        nextValue: 0.35,
      }),
    ).toEqual({
      values: [0.35, 0.8],
      activeHandle: "start",
    })
  })

  it("swaps handle roles when the start handle crosses the end handle", () => {
    expect(
      moveAdaptiveOffsetHandle({
        startValue: 0.2,
        endValue: 0.8,
        activeHandle: "start",
        nextValue: 0.92,
      }),
    ).toEqual({
      values: [0.8, 0.92],
      activeHandle: "end",
    })
  })

  it("swaps handle roles when the end handle crosses the start handle", () => {
    expect(
      moveAdaptiveOffsetHandle({
        startValue: 0.2,
        endValue: 0.8,
        activeHandle: "end",
        nextValue: 0.05,
      }),
    ).toEqual({
      values: [0.05, 0.2],
      activeHandle: "start",
    })
  })
})
