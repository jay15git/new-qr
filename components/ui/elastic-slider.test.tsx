// @vitest-environment jsdom

import { act, type ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"

import { ElasticSlider } from "@/components/ui/elastic-slider"
import { renderWithJsdomRoot } from "../../test-utils/jsdom-react-root"

describe("ElasticSlider", () => {
  it("renders accessible slider state and formatted value text", () => {
    const { container } = renderSlider(
      <ElasticSlider
        label="Opacity"
        max={1}
        min={0}
        step={0.1}
        value={0.5}
        formatValue={(value) => `${Math.round(value * 100)}%`}
        onValueChange={vi.fn()}
      />,
    )

    const slider = getRequiredSlider(container, "Opacity")

    expect(slider.getAttribute("aria-valuemin")).toBe("0")
    expect(slider.getAttribute("aria-valuemax")).toBe("1")
    expect(slider.getAttribute("aria-valuenow")).toBe("0.5")
    expect(slider.getAttribute("aria-valuetext")).toBe("50%")
    expect(container.textContent).toContain("Opacity")
    expect(container.textContent).toContain("50%")
  })

  it("nudges controlled values from keyboard input", () => {
    const onValueChange = vi.fn()
    const { container } = renderSlider(
      <ElasticSlider
        label="Size"
        max={100}
        min={0}
        step={5}
        value={40}
        onValueChange={onValueChange}
      />,
    )
    const slider = getRequiredSlider(container, "Size")

    act(() => {
      slider.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }))
      slider.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowLeft" }))
      slider.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Home" }))
      slider.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "End" }))
    })

    expect(onValueChange).toHaveBeenNthCalledWith(1, 45)
    expect(onValueChange).toHaveBeenNthCalledWith(2, 35)
    expect(onValueChange).toHaveBeenNthCalledWith(3, 0)
    expect(onValueChange).toHaveBeenNthCalledWith(4, 100)
  })

  it("renders muted variable hooks for desktop theming", () => {
    const { container } = renderSlider(
      <ElasticSlider
        className="desktop-elastic-slider"
        label="Speed"
        max={10}
        min={1}
        step={1}
        value={4}
        onValueChange={vi.fn()}
      />,
    )

    const root = container.querySelector('[data-slot="elastic-slider"]')

    expect(root?.className).toContain("--elastic-slider-bg")
    expect(root?.className).toContain("--elastic-slider-fill")
    expect(root?.className).toContain("--elastic-slider-handle")
    expect(root?.className).toContain("--elastic-slider-label")
    expect(root?.className).toContain("desktop-elastic-slider")
  })
})

function renderSlider(element: ReactElement) {
  return renderWithJsdomRoot(element)
}

function getRequiredSlider(container: HTMLElement, name: string) {
  const slider = container.querySelector<HTMLElement>(`[role="slider"][aria-label="${name}"]`)

  if (!slider) {
    throw new Error(`Missing slider: ${name}`)
  }

  return slider
}
