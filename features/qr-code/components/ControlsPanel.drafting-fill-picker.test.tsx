// @vitest-environment jsdom

import { readFileSync } from "node:fs"
import { act, useState } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { EmbeddedColorPickerField } from "@/features/qr-code/components/ControlsPanel"

describe("Drafting fill picker", () => {
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

  it("updates a hex-controlled parent from marker drags without a render loop", () => {
    const onHexChange = vi.fn()
    const container = document.createElement("div")
    const root = createRoot(container)

    function ControlledDraftingFillPicker() {
      const [hex, setHex] = useState("#C19B1D")

      return (
        <EmbeddedColorPickerField
          chrome="minimal"
          label="Solid color"
          onValueChange={(value) => {
            setHex(value)
            onHexChange(value)
          }}
          pickerChrome="drafting"
          size={320}
          value={hex}
        />
      )
    }

    act(() => {
      root.render(<ControlledDraftingFillPicker />)
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
    expect(container.querySelector('[data-slot="color-picker-input"]')).not.toBeNull()

    act(() => {
      root.unmount()
    })
  })

  it("does not mirror the hex prop into local color state", () => {
    const source = readFileSync("features/qr-code/components/ColorField.tsx", "utf8")
    const draftingFillPickerSource = source.match(
      /function DraftingFillPicker[\s\S]*?\n}\n\nconst DRAFTING_FILL_PICKER_SWATCH_STORAGE_KEY/,
    )?.[0]

    expect(draftingFillPickerSource).toBeDefined()
    expect(draftingFillPickerSource).not.toContain("setColor")
  })
})
