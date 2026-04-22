// @vitest-environment jsdom

import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DraftingSurface } from "@/components/new/drafting-surface"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

const cleanupCallbacks: Array<() => void> = []

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  )
})

afterEach(() => {
  for (const cleanup of cleanupCallbacks.splice(0)) {
    cleanup()
  }

  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})

describe("DraftingSurface", () => {
  it("renders the framed layout with dashboard-style tool buttons and middle tabs", () => {
    const surface = renderSurface()
    const header = getRequiredElement(surface.container, '[data-slot="drafting-header"]')
    const headerContent = getRequiredElement(header, "div")

    expect(surface.container.querySelector('[data-slot="drafting-surface"]')).not.toBeNull()
    expect(header).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-nav"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-scroll-area"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-workspace"]')).not.toBeNull()
    expect(surface.container.querySelectorAll('[data-slot="drafting-plus-marker"]')).toHaveLength(10)
    expect(surface.container.querySelectorAll('[data-drafting-tool-button="true"]')).toHaveLength(7)
    expect(surface.container.querySelectorAll('[data-slot="button"]')).toHaveLength(7)
    expect(surface.container.querySelector('[data-slot="tabs"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="tabs-list"]')).not.toBeNull()
    expect(getTabLabels(surface.container)).toEqual(["Content"])
    expect(surface.container.textContent).toContain("Content")
    expect(surface.container.textContent).toContain("Style")
    expect(surface.container.textContent).toContain("Corner Frame")
    expect(surface.container.textContent).toContain("Corner Dot")
    expect(surface.container.textContent).toContain("Background")
    expect(surface.container.textContent).toContain("Logo")
    expect(surface.container.textContent).toContain("Encoding")
    expect(headerContent.className).toContain("justify-end")
    expect(header.innerHTML).toContain('data-slot="mode-toggle"')
    expect(surface.container.textContent).toContain("Appearance")
    expect(surface.container.innerHTML).toContain('aria-label="Toggle dark mode"')
  })

  it("switches tool button state and updates the tab tray for each dashboard section", () => {
    const surface = renderSurface()
    const contentButton = getRequiredElement(surface.container, 'button[aria-label="Open Content"]')
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')
    const cornerSquareButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner Frame"]',
    )

    expect(contentButton.getAttribute("aria-pressed")).toBe("true")
    expect(styleButton.getAttribute("aria-pressed")).toBe("false")
    expect(cornerSquareButton.getAttribute("aria-pressed")).toBe("false")
    expect(getTabLabels(surface.container)).toEqual(["Content"])

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(contentButton.getAttribute("aria-pressed")).toBe("false")
    expect(styleButton.getAttribute("aria-pressed")).toBe("true")
    expect(getTabLabels(surface.container)).toEqual(["Style", "Color"])

    act(() => {
      cornerSquareButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(cornerSquareButton.getAttribute("aria-pressed")).toBe("true")
    expect(getTabLabels(surface.container)).toEqual(["Style", "Color"])

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(getTabLabels(surface.container)).toEqual([
      "Brands",
      "Colors",
      "Upload",
      "Size",
    ])
  })

  it("renders a selectable option-card grid for the style tab", () => {
    const surface = renderSurface()
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const styleGrid = getRequiredElement(
      surface.container,
      '[data-slot="drafting-style-option-grid"]',
    )
    const roundedInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Rounded"]',
    ) as HTMLInputElement
    const squareInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Square"]',
    ) as HTMLInputElement

    expect(styleGrid.getAttribute("role")).toBe("radiogroup")
    expect(
      surface.container.querySelectorAll('[data-slot="option-card"]').length,
    ).toBe(8)
    expect(roundedInput.checked).toBe(true)
    expect(squareInput.checked).toBe(false)

    act(() => {
      squareInput.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(roundedInput.checked).toBe(false)
    expect(squareInput.checked).toBe(true)
  })

  it("renders a drafting color accordion for the style color tab with solid, gradient, and palette", () => {
    const surface = renderSurface()
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const colorTab = getTabTriggerByText(surface.container, "Color")

    act(() => {
      activateElement(colorTab)
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-dots-color-accordion"]',
    )

    expect(accordion.getAttribute("data-slot")).toBe("drafting-dots-color-accordion")
    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(3)
    expect(surface.container.textContent).toContain("Solid")
    expect(surface.container.textContent).toContain("Gradient")
    expect(surface.container.textContent).toContain("Palette")
  })

  it("selects solid by default and keeps newly selected color modes expanded", () => {
    const surface = renderSurface()
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const colorTab = getTabTriggerByText(surface.container, "Color")

    act(() => {
      activateElement(colorTab)
    })

    const solidItem = getRequiredElement(
      surface.container,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientTrigger = getAccordionTriggerByText(surface.container, "Gradient")
    const gradientItem = getRequiredElement(
      surface.container,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )
    const paletteTrigger = getAccordionTriggerByText(surface.container, "Palette")
    const paletteItem = getRequiredElement(
      surface.container,
      '[data-slot="accordion-item"][data-item-id="palette"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")
    expect(gradientItem.getAttribute("data-selected")).toBe("false")
    expect(paletteItem.getAttribute("data-selected")).toBe("false")

    act(() => {
      activateElement(gradientTrigger)
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("true")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(paletteTrigger)
    })

    expect(paletteItem.getAttribute("data-selected")).toBe("true")
    expect(paletteItem.getAttribute("data-state")).toBe("open")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
  })

  it("renders a drafting color accordion for the corner frame color tab with solid and gradient", () => {
    const surface = renderSurface()
    const cornerFrameButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner Frame"]',
    )

    act(() => {
      cornerFrameButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const colorTab = getTabTriggerByText(surface.container, "Color")

    act(() => {
      activateElement(colorTab)
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-square-color-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Solid")
    expect(accordion.textContent).toContain("Gradient")
  })

  it("selects and expands the corner frame gradient color mode", () => {
    const surface = renderSurface()
    const cornerFrameButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner Frame"]',
    )

    act(() => {
      cornerFrameButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Color"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-square-color-accordion"]',
    )
    const solidItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Gradient"))
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("true")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
  })

  it("renders a selectable option-card grid for the corner frame style tab", () => {
    const surface = renderSurface()
    const cornerFrameButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner Frame"]',
    )

    act(() => {
      cornerFrameButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const cornerFrameGrid = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-square-option-grid"]',
    )
    const extraRoundedInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Extra rounded"]',
    ) as HTMLInputElement
    const squareInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Square"]',
    ) as HTMLInputElement

    expect(cornerFrameGrid.getAttribute("role")).toBe("radiogroup")
    expect(
      cornerFrameGrid.querySelectorAll('[data-slot="option-card"]').length,
    ).toBe(7)
    expect(extraRoundedInput.checked).toBe(true)
    expect(squareInput.checked).toBe(false)

    act(() => {
      squareInput.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(extraRoundedInput.checked).toBe(false)
    expect(squareInput.checked).toBe(true)
  })

  it("renders a selectable option-card grid for the corner dot style tab", () => {
    const surface = renderSurface()
    const cornerDotButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner Dot"]',
    )

    act(() => {
      cornerDotButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const cornerDotGrid = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-dot-option-grid"]',
    )
    const dotInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Dot"]',
    ) as HTMLInputElement
    const roundedInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Rounded"]',
    ) as HTMLInputElement

    expect(cornerDotGrid.getAttribute("role")).toBe("radiogroup")
    expect(cornerDotGrid.querySelectorAll('[data-slot="option-card"]').length).toBe(7)
    expect(dotInput.checked).toBe(true)
    expect(roundedInput.checked).toBe(false)

    act(() => {
      roundedInput.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(dotInput.checked).toBe(false)
    expect(roundedInput.checked).toBe(true)
  })

  it("renders a drafting color accordion for the corner dot color tab with solid and gradient", () => {
    const surface = renderSurface()
    const cornerDotButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner Dot"]',
    )

    act(() => {
      cornerDotButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Color"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-dot-color-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Solid")
    expect(accordion.textContent).toContain("Gradient")
  })

  it("selects and expands the corner dot gradient color mode", () => {
    const surface = renderSurface()
    const cornerDotButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner Dot"]',
    )

    act(() => {
      cornerDotButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Color"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-dot-color-accordion"]',
    )
    const solidItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Gradient"))
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("true")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
  })

  it("renders a drafting color accordion for the background colors tab with solid and gradient", () => {
    const surface = renderSurface()
    const backgroundButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Background"]',
    )

    act(() => {
      backgroundButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-background-color-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Solid")
    expect(accordion.textContent).toContain("Gradient")
  })

  it("selects and expands the background gradient color mode", () => {
    const surface = renderSurface()
    const backgroundButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Background"]',
    )

    act(() => {
      backgroundButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-background-color-accordion"]',
    )
    const solidItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Gradient"))
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("true")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
  })

  it("renders a drafting color accordion for the logo colors tab with solid and gradient", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Colors"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Solid")
    expect(accordion.textContent).toContain("Gradient")
  })

  it("selects and expands the logo gradient color mode", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Colors"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"]',
    )
    const solidItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Gradient"))
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("true")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
  })

  it("renders the drafting brand icon tab with category filters and search", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const brandTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-brand-icon-tab"]',
    )

    expect(brandTab.querySelector('[data-slot="drafting-brand-icon-picker"]')).not.toBeNull()
    expect(brandTab.querySelector('[aria-label="Search brand icons"]')).not.toBeNull()
    expect(
      brandTab.querySelectorAll('[data-slot="drafting-brand-icon-option"]').length,
    ).toBeGreaterThan(0)
  })

  it("selects a drafting brand icon and marks preset mode active", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const instagramOption = getRequiredElement(
      surface.container,
      'input[data-slot="option-card-input"][aria-label="Instagram"]',
    ) as HTMLInputElement

    expect(surface.container.querySelector('[data-logo-source-mode="preset"]')).toBeNull()

    act(() => {
      activateElement(instagramOption)
    })

    expect(instagramOption.checked).toBe(true)
    expect(
      surface.container.querySelector('[data-logo-source-mode="preset"]'),
    ).not.toBeNull()
    expect(
      surface.container.querySelector('[data-logo-preset-id="instagram"]'),
    ).not.toBeNull()
  })

  it("updates preset-driven logo output when the drafting solid color changes", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(
        getRequiredElement(
          surface.container,
          'input[data-slot="option-card-input"][aria-label="Instagram"]',
        ),
      )
      activateElement(getTabTriggerByText(surface.container, "Colors"))
    })

    const previousPresetValue =
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-logo-preset-value",
      ) ?? ""
    const solidColorInput = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"] [data-item-id="solid"] [data-slot="color-picker"] input',
    ) as HTMLInputElement

    act(() => {
      changeInputValue(solidColorInput, "15")
    })

    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')

    expect(surfaceRoot.getAttribute("data-logo-source-mode")).toBe("preset")
    expect(surfaceRoot.getAttribute("data-logo-preset-id")).toBe("instagram")
    expect(surfaceRoot.getAttribute("data-logo-preset-value")).not.toBe(previousPresetValue)
  })

  it("updates preset-driven logo output when the drafting gradient changes", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(
        getRequiredElement(
          surface.container,
          'input[data-slot="option-card-input"][aria-label="Instagram"]',
        ),
      )
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Colors"))
    })

    const logoColorAccordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"]',
    )

    act(() => {
      activateElement(getAccordionTriggerByText(logoColorAccordion, "Gradient"))
    })

    const previousPresetValue =
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-logo-preset-value",
      ) ?? ""
    const gradientColorInput = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"] [data-item-id="gradient"] [data-slot="color-picker"] input',
    ) as HTMLInputElement

    act(() => {
      changeInputValue(gradientColorInput, "15")
    })

    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')

    expect(surfaceRoot.getAttribute("data-logo-source-mode")).toBe("preset")
    expect(surfaceRoot.getAttribute("data-logo-preset-id")).toBe("instagram")
    expect(surfaceRoot.getAttribute("data-logo-color-mode")).toBe("gradient")
    expect(surfaceRoot.getAttribute("data-logo-preset-value")).not.toBe(previousPresetValue)
  })

  it("renders a drafting source accordion for the background upload tab with upload file and remote url", () => {
    const surface = renderSurface()
    const backgroundButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Background"]',
    )

    act(() => {
      backgroundButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Upload"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-background-upload-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Upload file")
    expect(accordion.textContent).toContain("Remote URL")
    expect(surface.container.querySelector('[aria-label="File upload"]')).not.toBeNull()

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Remote URL"))
    })

    expect(
      surface.container.querySelector('input[aria-label="Background image URL"]'),
    ).not.toBeNull()
  })

  it("selects and expands the logo remote url source mode", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Upload"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-upload-accordion"]',
    )
    const uploadItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="upload"]',
    )
    const urlItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="url"]',
    )

    expect(uploadItem.getAttribute("data-selected")).toBe("true")
    expect(uploadItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Remote URL"))
    })

    expect(urlItem.getAttribute("data-selected")).toBe("true")
    expect(urlItem.getAttribute("data-state")).toBe("open")
    expect(uploadItem.getAttribute("data-state")).toBe("open")
  })

  it("clears the drafting preset selection when switching the logo source to remote url", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(
        getRequiredElement(
          surface.container,
          'input[data-slot="option-card-input"][aria-label="Instagram"]',
        ),
      )
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Upload"))
    })

    const remoteUrlTrigger = getAccordionTriggerByText(
      getRequiredElement(surface.container, '[data-slot="drafting-logo-upload-accordion"]'),
      "Remote URL",
    )

    act(() => {
      activateElement(remoteUrlTrigger)
    })

    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')

    expect(surfaceRoot.getAttribute("data-logo-source-mode")).toBe("url")
    expect(surfaceRoot.getAttribute("data-logo-preset-id")).toBe("")
    expect(surfaceRoot.getAttribute("data-logo-preset-value")).toBe("")
  })

  it("clears the drafting preset selection when switching the logo source to upload", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(
        getRequiredElement(
          surface.container,
          'input[data-slot="option-card-input"][aria-label="Instagram"]',
        ),
      )
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Upload"))
    })

    const uploadTrigger = getAccordionTriggerByText(
      getRequiredElement(surface.container, '[data-slot="drafting-logo-upload-accordion"]'),
      "Upload file",
    )

    act(() => {
      activateElement(uploadTrigger)
    })

    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')

    expect(surfaceRoot.getAttribute("data-logo-source-mode")).toBe("upload")
    expect(surfaceRoot.getAttribute("data-logo-preset-id")).toBe("")
    expect(surfaceRoot.getAttribute("data-logo-preset-value")).toBe("")
  })

  it("renders the logo size tab with both sliders and both toggles", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Size"))
    })

    const sizeTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-size-tab"]',
    )

    expect(sizeTab.querySelector('[data-slot="drafting-logo-size-slider"]')).not.toBeNull()
    expect(sizeTab.querySelector('[data-slot="drafting-logo-margin-slider"]')).not.toBeNull()
    expect(sizeTab.querySelector('[data-slot="drafting-logo-hide-background-dots"]')).not.toBeNull()
    expect(sizeTab.querySelector('[data-slot="drafting-logo-save-as-blob"]')).not.toBeNull()
    expect(surface.container.textContent).toContain("Logo size")
    expect(surface.container.textContent).toContain("Logo margin")
    expect(surface.container.textContent).toContain("Hide background dots")
    expect(surface.container.textContent).toContain("Save embedded image as blob")
  })

  it("seeds the logo size tab defaults from the shared qr studio defaults", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')
    const defaultState = createDefaultQrStudioState()

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Size"))
    })

    const sizeTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-size-tab"]',
    )
    const hideBackgroundDotsSwitch = getRequiredElement(
      sizeTab,
      '#drafting-hide-background-dots',
    )
    const saveAsBlobSwitch = getRequiredElement(sizeTab, '#drafting-save-as-blob')

    expect(sizeTab.textContent).toContain(`Logo size: ${Math.round(defaultState.imageOptions.imageSize * 100)}%`)
    expect(sizeTab.textContent).toContain(`Logo margin: ${Math.round(defaultState.imageOptions.margin)} px`)
    expect(hideBackgroundDotsSwitch.getAttribute("aria-checked")).toBe(
      String(defaultState.imageOptions.hideBackgroundDots),
    )
    expect(saveAsBlobSwitch.getAttribute("aria-checked")).toBe(
      String(defaultState.imageOptions.saveAsBlob),
    )
  })

  it("updates the logo size tab toggle states when toggled", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')
    const defaultState = createDefaultQrStudioState()

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Size"))
    })

    const hideBackgroundDotsSwitch = getRequiredElement(
      surface.container,
      '#drafting-hide-background-dots',
    )
    const saveAsBlobSwitch = getRequiredElement(surface.container, '#drafting-save-as-blob')

    expect(hideBackgroundDotsSwitch.getAttribute("aria-checked")).toBe(
      String(defaultState.imageOptions.hideBackgroundDots),
    )
    expect(saveAsBlobSwitch.getAttribute("aria-checked")).toBe(
      String(defaultState.imageOptions.saveAsBlob),
    )

    act(() => {
      activateElement(hideBackgroundDotsSwitch)
      activateElement(saveAsBlobSwitch)
    })

    expect(hideBackgroundDotsSwitch.getAttribute("aria-checked")).toBe(
      String(!defaultState.imageOptions.hideBackgroundDots),
    )
    expect(saveAsBlobSwitch.getAttribute("aria-checked")).toBe(
      String(!defaultState.imageOptions.saveAsBlob),
    )
  })

  it("renders the encoding tab with a type number slider and four error correction cards", () => {
    const surface = renderSurface()
    const encodingButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Encoding"]',
    )
    const defaultState = createDefaultQrStudioState()

    act(() => {
      encodingButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const encodingTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-encoding-tab"]',
    )
    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')
    const quartileInput = getRequiredElement(
      encodingTab,
      'input[type="radio"][aria-label="Quartile (Q)"]',
    ) as HTMLInputElement

    expect(
      encodingTab.querySelector('[data-slot="drafting-type-number-slider"]'),
    ).not.toBeNull()
    expect(
      encodingTab.querySelectorAll('input[name="drafting-error-correction"]'),
    ).toHaveLength(4)
    expect(encodingTab.textContent).toContain("Type number: Auto")
    expect(encodingTab.textContent).toContain("Error correction")
    expect(quartileInput.checked).toBe(true)
    expect(surfaceRoot.getAttribute("data-qr-type-number")).toBe(
      String(defaultState.qrOptions.typeNumber),
    )
    expect(surfaceRoot.getAttribute("data-qr-error-correction-level")).toBe(
      defaultState.qrOptions.errorCorrectionLevel,
    )
  })

  it("updates the selected error correction level from the encoding option cards", () => {
    const surface = renderSurface()
    const encodingButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Encoding"]',
    )

    act(() => {
      encodingButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const highInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="High (H)"]',
    ) as HTMLInputElement

    act(() => {
      activateElement(highInput)
    })

    expect(highInput.checked).toBe(true)
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-qr-error-correction-level",
      ),
    ).toBe("H")
  })

  it("keeps the tab tray sticky and the active middle panel as the dedicated scroll area", () => {
    const surface = renderSurface()
    const stickyTabs = getRequiredElement(surface.container, '[data-slot="drafting-tabs-sticky"]')
    const navFrame = getRequiredElement(surface.container, '[data-slot="drafting-nav"]')
    const navScrollArea = getRequiredElement(
      surface.container,
      '[data-slot="drafting-nav-scroll-area"]',
    )
    const navScroll = getRequiredElement(
      surface.container,
      '[data-slot="drafting-nav-scroll"]',
    )
    const scrollFrame = getRequiredElement(surface.container, '[data-slot="drafting-scroll-area"]')
    const panelScrollArea = getRequiredElement(
      surface.container,
      '[data-slot="drafting-tab-panel-scroll-area"]',
    )
    const panelScroll = getRequiredElement(
      surface.container,
      '[data-slot="drafting-tab-panel-scroll"]',
    )

    expect(stickyTabs.className).toContain("sticky")
    expect(navFrame.className).not.toContain("overflow-y-auto")
    expect(navScrollArea.className).toContain("overflow-hidden")
    expect(navScroll.className).toContain("overflow-x-hidden")
    expect(navScroll.getAttribute("data-radix-scroll-area-viewport")).toBe("")
    expect(scrollFrame.className).not.toContain("overflow-y-auto")
    expect(panelScrollArea.getAttribute("data-slot")).toBe("drafting-tab-panel-scroll-area")
    expect(panelScrollArea.className).toContain("overflow-hidden")
    expect(panelScroll.className).toContain("overflow-x-hidden")
    expect(panelScroll.className).not.toContain("overflow-y-auto")
    expect(panelScroll.getAttribute("data-radix-scroll-area-viewport")).toBe("")
    expect(panelScroll.getAttribute("data-active-tool")).toBe("content")
    expect(panelScroll.getAttribute("data-active-tab")).toBe("content")
  })
})

function renderSurface() {
  const container = document.createElement("div")
  const root = createRoot(container)

  act(() => {
    root.render(<DraftingSurface />)
  })

  cleanupCallbacks.push(() => {
    act(() => {
      root.unmount()
    })
  })

  document.body.appendChild(container)

  return { container }
}

function getRequiredElement(parent: ParentNode, selector: string) {
  const element = parent.querySelector(selector)

  expect(element).not.toBeNull()

  return element as HTMLElement
}

function activateElement(element: HTMLElement) {
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }))
  element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }))
  element.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }))
}

function changeInputValue(element: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set

  valueSetter?.call(element, value)
  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
}

function getTabLabels(parent: ParentNode) {
  return Array.from(parent.querySelectorAll('[data-slot="tabs-trigger"]')).map(
    (element) => element.textContent?.trim() ?? "",
  )
}

function getTabTriggerByText(parent: ParentNode, text: string) {
  const trigger = Array.from(parent.querySelectorAll('[data-slot="tabs-trigger"]')).find(
    (element) => element.textContent?.trim() === text,
  )

  expect(trigger).not.toBeNull()

  return trigger as HTMLElement
}

function getAccordionTriggerByText(parent: ParentNode, text: string) {
  const trigger = Array.from(
    parent.querySelectorAll('[data-slot="drafting-color-trigger"]'),
  ).find((element) => element.textContent?.includes(text))

  expect(trigger).not.toBeNull()

  return trigger as HTMLElement
}
