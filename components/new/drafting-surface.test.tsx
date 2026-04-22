// @vitest-environment jsdom

import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DraftingSurface } from "@/components/new/drafting-surface"

const cleanupCallbacks: Array<() => void> = []

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
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

    expect(surface.container.querySelector('[data-slot="drafting-surface"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-header"]')).not.toBeNull()
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

  it("keeps the tab tray sticky and the active middle panel as the dedicated scroll area", () => {
    const surface = renderSurface()
    const stickyTabs = getRequiredElement(surface.container, '[data-slot="drafting-tabs-sticky"]')
    const navFrame = getRequiredElement(surface.container, '[data-slot="drafting-nav"]')
    const scrollFrame = getRequiredElement(surface.container, '[data-slot="drafting-scroll-area"]')
    const panelScroll = getRequiredElement(
      surface.container,
      '[data-slot="drafting-tab-panel-scroll"]',
    )

    expect(stickyTabs.className).toContain("sticky")
    expect(navFrame.className).toContain("overflow-y-auto")
    expect(scrollFrame.className).not.toContain("overflow-y-auto")
    expect(panelScroll.className).toContain("overflow-y-auto")
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

function getTabLabels(parent: ParentNode) {
  return Array.from(parent.querySelectorAll('[data-slot="tabs-trigger"]')).map(
    (element) => element.textContent?.trim() ?? "",
  )
}
