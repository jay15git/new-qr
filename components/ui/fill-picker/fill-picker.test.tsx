// @vitest-environment jsdom

import { act, useState } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ColorPicker, useColorPicker } from "@/components/ui/fill-picker/fill-picker"

describe("Fill Picker", () => {
  beforeEach(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
      configurable: true,
      value: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("does not emit a change for the same OKLCH color", () => {
    const onValueChange = vi.fn()
    const container = document.createElement("div")
    const root = createRoot(container)
    const color = { l: 0.5, c: 0.1, h: 30, alpha: 1 }

    function SameColorCommitter() {
      const picker = useColorPicker({
        onValueChange,
        value: color,
      })

      return (
        <button
          type="button"
          onClick={() => picker.setColor({ l: 0.5, c: 0.1, h: 30, alpha: 1 })}
        >
          Commit
        </button>
      )
    }

    act(() => {
      root.render(<SameColorCommitter />)
    })

    const button = container.querySelector("button")
    expect(button).not.toBeNull()

    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onValueChange).not.toHaveBeenCalled()

    act(() => {
      root.unmount()
    })
  })

  it("updates marker-controlled color with CssInput mounted without a render loop", () => {
    const onHexChange = vi.fn()
    const container = document.createElement("div")
    const root = createRoot(container)

    function ControlledFillPicker() {
      const [color, setColor] = useState("#C19B1D")

      return (
        <ColorPicker.Root
          defaultFormat="hex"
          onValueChange={(_color, _formatted, formats) => {
            setColor(formats.hex)
            onHexChange(formats.hex)
          }}
          value={color}
        >
          <ColorPicker.Area mode="hsv-sv" />
          <ColorPicker.Hue />
          <ColorPicker.Alpha />
          <ColorPicker.CssInput />
        </ColorPicker.Root>
      )
    }

    act(() => {
      root.render(<ControlledFillPicker />)
    })

    const colorArea = container.querySelector('[data-slot="color-picker-area"]')
    const cssInput = container.querySelector('[data-slot="color-picker-input"]')
    expect(colorArea).not.toBeNull()
    expect(cssInput).not.toBeNull()

    vi.spyOn(colorArea as HTMLElement, "getBoundingClientRect").mockReturnValue({
      bottom: 160,
      height: 160,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    expect(() => {
      act(() => {
        colorArea?.dispatchEvent(
          new MouseEvent("pointerdown", {
            bubbles: true,
            buttons: 1,
            clientX: 250,
            clientY: 42,
          }),
        )
        colorArea?.dispatchEvent(
          new MouseEvent("pointermove", {
            bubbles: true,
            buttons: 1,
            clientX: 260,
            clientY: 46,
          }),
        )
        colorArea?.dispatchEvent(
          new MouseEvent("pointermove", {
            bubbles: true,
            buttons: 1,
            clientX: 270,
            clientY: 50,
          }),
        )
      })
    }).not.toThrow()

    expect(onHexChange).toHaveBeenCalled()

    act(() => {
      root.unmount()
    })
  })
})
