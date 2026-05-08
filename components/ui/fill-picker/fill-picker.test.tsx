// @vitest-environment jsdom

import { act, useState } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  ColorPicker,
  parseColor,
  useColorPicker,
  type OklchColor,
} from "@/components/ui/fill-picker/fill-picker"

function setInputValue(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set

  valueSetter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

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
      const [color, setColor] = useState<OklchColor>(() => parseColor("#C19B1D") as OklchColor)
      const [hex, setHex] = useState("#C19B1D")

      return (
        <>
          <ColorPicker.Root
            defaultFormat="hex"
            onValueChange={(nextColor, _formatted, formats) => {
              setColor(nextColor)
              setHex(formats.hex)
              onHexChange(formats.hex)
            }}
            value={color}
          >
            <ColorPicker.Area mode="hsv-sv" />
            <ColorPicker.Hue />
            <ColorPicker.Alpha />
            <ColorPicker.CssInput />
          </ColorPicker.Root>
          <output data-testid="selected-hex">{hex}</output>
        </>
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
    expect(container.querySelector('[data-testid="selected-hex"]')?.textContent).toMatch(/^#[0-9A-F]{6}$/)

    act(() => {
      root.unmount()
    })
  })

  it("keeps in-progress CssInput edits across external color changes", () => {
    const onValueChange = vi.fn()
    const container = document.createElement("div")
    const root = createRoot(container)
    const externalColor = parseColor("#112233") as OklchColor

    function EditableFillPicker() {
      const [color, setColor] = useState<OklchColor>(() => parseColor("#C19B1D") as OklchColor)

      return (
        <ColorPicker.Root
          defaultFormat="hex"
          onValueChange={(next, _formatted, formats) => {
            setColor(next)
            onValueChange(formats.hex)
          }}
          value={color}
        >
          <button type="button" onClick={() => setColor(externalColor)}>
            External color
          </button>
          <ColorPicker.CssInput />
        </ColorPicker.Root>
      )
    }

    act(() => {
      root.render(<EditableFillPicker />)
    })

    const input = container.querySelector<HTMLInputElement>('[data-slot="color-picker-input"]')
    const button = container.querySelector("button")
    expect(input).not.toBeNull()
    expect(button).not.toBeNull()
    expect(input?.value).toBe("#C19B1D")

    act(() => {
      input?.focus()
      setInputValue(input as HTMLInputElement, "#abcdef")
    })

    expect(input?.value).toBe("#abcdef")

    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(input?.value).toBe("#abcdef")

    act(() => {
      input?.dispatchEvent(new FocusEvent("focusout", { bubbles: true }))
    })

    expect(onValueChange).toHaveBeenLastCalledWith("#ABCDEF")
    expect(input?.value).toBe("#ABCDEF")

    act(() => {
      root.unmount()
    })
  })

  it("reports invalid CssInput commits and lets Escape revert to the formatted value", () => {
    const container = document.createElement("div")
    const root = createRoot(container)

    function EditableFillPicker() {
      const [color, setColor] = useState<OklchColor>(() => parseColor("#C19B1D") as OklchColor)

      return (
        <ColorPicker.Root
          defaultFormat="hex"
          onValueChange={(next) => setColor(next)}
          value={color}
        >
          <ColorPicker.CssInput />
        </ColorPicker.Root>
      )
    }

    act(() => {
      root.render(<EditableFillPicker />)
    })

    const input = container.querySelector<HTMLInputElement>('[data-slot="color-picker-input"]')
    expect(input).not.toBeNull()

    act(() => {
      input?.focus()
      setInputValue(input as HTMLInputElement, "definitely-not-a-color")
      input?.dispatchEvent(new FocusEvent("focusout", { bubbles: true }))
    })

    expect(input?.getAttribute("aria-invalid")).toBe("true")
    expect(input?.value).toBe("definitely-not-a-color")

    act(() => {
      input?.focus()
      input?.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Escape",
        }),
      )
    })

    expect(input?.getAttribute("aria-invalid")).toBeNull()
    expect(input?.value).toBe("#C19B1D")

    act(() => {
      root.unmount()
    })
  })
})
