// @vitest-environment jsdom

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { act, type ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"

import {
  DESKTOP_TOOLBAR_TOOLS,
  DesktopToolbarPrototype,
} from "@/components/desktop/desktop-toolbar-prototype"
import { renderWithAsyncJsdomRoot } from "../../test-utils/jsdom-react-root"

describe("DesktopToolbarPrototype", () => {
  it("renders every drafting left rail tool as an accessible icon button", async () => {
    const surface = await renderPrototype()
    const buttons = getToolButtons(surface.container)

    expect(buttons).toHaveLength(13)
    expect(buttons).toHaveLength(DESKTOP_TOOLBAR_TOOLS.length)

    for (const tool of DESKTOP_TOOLBAR_TOOLS) {
      const button = surface.container.querySelector(
        `[data-tool-id="${tool.id}"]`,
      )

      expect(button).not.toBeNull()
      expect(button?.getAttribute("aria-label")).toBe(`Open ${tool.title}`)
    }

    expect(surface.container.querySelector('[data-slot="desktop-prototype-canvas"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="desktop-floating-inspector"]')).toBeNull()
  })

  it("updates the locally active tool when a toolbar button is clicked", async () => {
    const surface = await renderPrototype()
    const contentButton = getRequiredToolButton(surface.container, "content")
    const imageButton = getRequiredToolButton(surface.container, "image")

    expect(contentButton.getAttribute("aria-pressed")).toBe("false")
    expect(imageButton.getAttribute("aria-pressed")).toBe("false")

    await clickButton(imageButton)

    expect(contentButton.getAttribute("aria-pressed")).toBe("false")
    expect(imageButton.getAttribute("aria-pressed")).toBe("true")
  })

  it("renders the icon rail inside the inspector shell as one left toolbar", async () => {
    const surface = await renderPrototype({ controller: { activeTool: "content" } })
    const shell = surface.container.querySelector('[data-slot="desktop-left-toolbar-shell"]')
    const rail = surface.container.querySelector('[data-slot="desktop-floating-toolbar"]')
    const inspector = surface.container.querySelector('[data-slot="desktop-floating-inspector"]')
    const source = readFileSync(
      resolve(process.cwd(), "components/desktop/desktop-toolbar-prototype.tsx"),
      "utf8",
    )

    expect(shell).not.toBeNull()
    expect(shell?.querySelector('[data-slot="desktop-floating-toolbar"]')).toBe(rail)
    expect(shell?.querySelector('[data-slot="desktop-floating-inspector"]')).toBe(inspector)
    expect(shell?.className).toContain("grid-cols-[4.5rem_minmax(0,1fr)]")
    expect(rail?.className).not.toContain("fixed")
    expect(rail?.className).not.toContain("rounded-full")
    expect(rail?.className).not.toContain("bg-black/55")
    expect(inspector?.className).not.toContain("fixed")
    expect(inspector?.className).not.toContain("rounded-[20px]")
    expect(inspector?.className).not.toContain("bg-black/55")
    expect(source).toContain('[data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"] {')
    expect(source).toContain("color: rgba(15, 23, 42, 0.58) !important;")
  })

  it("keeps settings panel headings transparent", () => {
    const source = readFileSync(
      resolve(process.cwd(), "components/desktop/desktop-inspector-controls.tsx"),
      "utf8",
    )

    expect(source).toContain("DESKTOP_INSPECTOR_HEADER_CLASS")
    expect(source).not.toContain("bg-[var(--desktop-inspector-header-bg)]")
  })

  it("toggles the desktop prototype between dark and light mode", async () => {
    const surface = await renderPrototype()
    const prototype = surface.container.querySelector('[data-slot="desktop-toolbar-prototype"]')
    const actionToolbar = surface.container.querySelector('[data-slot="desktop-action-toolbar"]')
    const themeToggle = getRequiredButton(surface.container, "Switch to light mode")

    expect(prototype?.getAttribute("data-desktop-theme")).toBe("dark")
    expect(actionToolbar).not.toBeNull()
    expect(actionToolbar?.querySelector('button[aria-label="Switch to light mode"]')).toBeNull()
    expect(Array.from(actionToolbar?.querySelectorAll("button") ?? []).map((button) => button.getAttribute("aria-label"))).toEqual([
      "Reset defaults",
      "Undo",
      "Redo",
    ])
    expect(getRequiredButton(surface.container, "Switch to light mode").getAttribute("data-slot")).toBe("desktop-theme-toggle")

    await clickButton(themeToggle)

    expect(prototype?.getAttribute("data-desktop-theme")).toBe("light")
    expect(getRequiredButton(surface.container, "Switch to dark mode")).not.toBeNull()
  })

  it("wires undo and redo through the top-right desktop action toolbar", async () => {
    const onUndo = vi.fn()
    const onRedo = vi.fn()
    const onResetDefaults = vi.fn()
    const surface = await renderPrototype({
      controller: {
        canRedo: true,
        canUndo: true,
        onRedo,
        onResetDefaults,
        onUndo,
      },
    })
    const actionToolbar = surface.container.querySelector('[data-slot="desktop-action-toolbar"]')

    expect(actionToolbar?.className).toContain("min-h-14")
    expect(getRequiredButton(surface.container, "Switch to light mode").className).toContain("size-14")
    expect(getRequiredButton(actionToolbar as HTMLElement, "Reset defaults").className).toContain("size-8")
    expect(getRequiredButton(actionToolbar as HTMLElement, "Undo").className).toContain("size-8")
    expect(getRequiredButton(actionToolbar as HTMLElement, "Redo").className).toContain("size-8")

    await act(async () => {
      getRequiredButton(actionToolbar as HTMLElement, "Reset defaults").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(actionToolbar as HTMLElement, "Undo").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(actionToolbar as HTMLElement, "Redo").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onResetDefaults).toHaveBeenCalledTimes(1)
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onRedo).toHaveBeenCalledTimes(1)
  })

  it("keeps the desktop workspace chrome contract for tool states and light tooltips", () => {
    const source = readFileSync(
      resolve(process.cwd(), "components/desktop/desktop-workspace.tsx"),
      "utf8",
    )

    expect(source).toContain('[data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button')
    expect(source).toContain('[data-toolbar-appearance="desktop-glass"] button svg')
    expect(source).toContain('[data-toolbar-appearance="desktop-glass"] button:active svg')
    expect(source).toContain('button[data-toolbar-appearance="desktop-glass"]:active svg')
    expect(source).toContain('[data-slot="drafting-layer-context-menu"][data-toolbar-appearance="desktop-glass"] button:active svg')
    expect(source).toContain('[data-slot="drafting-layer-floating-toolbar"][data-toolbar-appearance="desktop-glass"] button:active svg')
    expect(source).toContain('body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-context-menu"]')
    expect(source).toContain("z-index: 60")
    expect(source).toContain("--drafting-canvas-dot-rgb: 246 248 251")
    expect(source).toContain("--drafting-canvas-dot-opacity: 0.035")
    expect(source).toContain("--drafting-canvas-dot-rgb: 15 23 42")
    expect(source).toContain("--drafting-canvas-dot-opacity: 0.08")
    expect(source).toContain("background-color: transparent !important")
    expect(source).toContain('[data-slot="dashboard-compose-surface"][data-grid-visible="false"]')
    expect(source).toContain("background-image: none !important")
    expect(source).toContain('[data-slot="desktop-resize-toolbar"] button:hover')
    expect(source).toContain('[data-slot="desktop-action-toolbar"] button:hover')
    expect(source).toContain('body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-floating-toolbar"] button:hover')
    expect(source).toContain("background: rgba(15, 23, 42, 0.08) !important")
    expect(source).toContain("background: rgb(255, 255, 255) !important")
    expect(source).toContain('body:has([data-slot="desktop-workspace"][data-desktop-theme="dark"]) [data-slot="drafting-layer-context-menu"]')
    expect(source).toContain("background: rgb(23, 23, 23) !important")
    expect(source).toContain("border-radius: 9999px !important")
    expect(source).toContain("transform: none !important")
    expect(source).toContain("translate: none !important")
    expect(source).toContain("scale: none !important")
    expect(source).toContain("rotate: none !important")
    expect(source).toContain("button::before")
    expect(source).toContain("transform: scale(1)")
    expect(source).toContain("transition: none")
    expect(source).toContain("transition:")
    expect(source).toContain('button[aria-pressed="true"]')
    expect(source).toContain('button[aria-pressed="true"]::before')
    expect(source).toContain('[data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:active')
    expect(source).toContain('[data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:active svg')
    expect(source).toContain("transform: scale(0.84) !important")
    expect(source).toContain('button[aria-pressed="true"]::before')
    expect(source).toContain("background: rgba(255, 255, 255, 0.16)")
    expect(source).not.toContain("box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)")
    expect(source).not.toContain("box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08)")
    expect(source).toContain('[data-slot="tooltip-content"]')
    expect(source).toContain("background: rgba(15, 15, 15, 0.94) !important")
    expect(source).toContain('[data-slot="elastic-slider"]')
    expect(source).toContain("--elastic-slider-bg: rgba(15, 23, 42, 0.035)")
  })

  it("renders every remaining drafting settings tool in the desktop inspector format", async () => {
    const surface = await renderPrototype()
    const expectedSlots = [
      ["logo", "desktop-logo-inspector"],
      ["encoding", "desktop-encoding-inspector"],
      ["image", "desktop-image-inspector"],
      ["decorations", "desktop-decorations-inspector"],
      ["effects", "desktop-effects-inspector"],
      ["layers", "desktop-layers-inspector"],
      ["export", "desktop-export-inspector"],
    ] as const

    for (const [toolId, slot] of expectedSlots) {
      await openTool(surface.container, toolId)

      const inspector = surface.container.querySelector(
        '[data-slot="desktop-floating-inspector"]',
      )

      expect(inspector?.querySelector(`[data-slot="${slot}"]`)).not.toBeNull()
      expect(inspector?.textContent).not.toContain("Reset ")
      expect(inspector?.textContent).not.toContain("Coming soon")
    }
  })

  it("keeps duplicated layer appearance settings out of floating inspectors", async () => {
    const surface = await renderPrototype()

    await openTool(surface.container, "layers")

    const layersInspector = surface.container.querySelector('[data-slot="desktop-layers-inspector"]')

    expect(layersInspector?.textContent).toContain("Layer Stack")
    expect(layersInspector?.textContent).toContain("Geometry")
    expect(layersInspector?.querySelector('input[aria-label="Layer name"]')).not.toBeNull()
    expect(layersInspector?.querySelector('input[aria-label="Layer opacity"]')).toBeNull()
    expect(layersInspector?.querySelector('input[aria-label="Layer blur"]')).toBeNull()
    expect(layersInspector?.querySelector('input[aria-label="Layer shadow color"]')).toBeNull()

    await openTool(surface.container, "shape")

    const shapeInspector = surface.container.querySelector('[data-slot="desktop-shape-inspector"]')

    expect(shapeInspector?.querySelector('input[aria-label="Shape shadow color"]')).toBeNull()
    expect(shapeInspector?.querySelector('input[aria-label="Shape backing shadow color"]')).not.toBeNull()
  })

  it("renders the drafting content tab inside the floating inspector", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "content")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )
    const shell = surface.container.querySelector('[data-slot="desktop-left-toolbar-shell"]')

    expect(inspector).not.toBeNull()
    expect(inspector?.getAttribute("aria-label")).toBe("Content settings")
    expect(shell?.className).toContain("z-[25]")
    expect(shell?.querySelector('[data-slot="desktop-floating-inspector"]')).toBe(inspector)
    expect(inspector?.querySelector('[data-slot="desktop-content-inspector"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-content-type-collection"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-content-type-filters"]')).toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-content-type-filter-trigger"]')).not.toBeNull()
    const filterSearchRow = inspector?.querySelector('[data-slot="desktop-content-filter-search-row"]')
    expect(filterSearchRow?.className).toContain("w-full")
    expect(filterSearchRow?.className).not.toContain("bg-white/[0.08]")
    const filterTrigger = filterSearchRow?.querySelector('[data-slot="desktop-content-type-filter-trigger"]')
    expect(filterTrigger?.className).toContain("desktop-inspector-input-bg")
    expect(filterTrigger?.className).toContain("min-w-[84px]")
    expect(filterTrigger?.className).toContain("max-w-24")
    expect(filterTrigger?.querySelector("svg[data-slot='filter-icon']")).toBeNull()
    const searchInput = filterSearchRow?.querySelector('input[aria-label="Search QR types"]')
    expect(searchInput).not.toBeNull()
    expect(searchInput?.className).toContain("desktop-inspector-input-bg")
    expect(searchInput?.className).toContain("rounded-full")
    expect(searchInput?.parentElement?.className).toContain("h-full")
    expect(inspector?.querySelector('[data-slot="desktop-content-fields"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Content")
    expect(inspector?.textContent).toContain("Popular")
    expect(inspector?.textContent).toContain("Encoded value")
    expect(inspector?.textContent).not.toContain("Reset Content")
  })

  it("updates the content inspector when a Pixelmator-style preset is clicked", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "content")

    const linkPreset = getRequiredButton(surface.container, "Use Link content")

    await clickButton(linkPreset)

    expect(linkPreset.getAttribute("aria-pressed")).toBe("true")
    expect(linkPreset.getAttribute("data-desktop-content-type-option")).toBe("true")
    expect(linkPreset.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(linkPreset.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(linkPreset.className).not.toContain("border-white/55")
    expect(linkPreset.className).not.toContain("desktop-inspector-selected-bg")
    expect(linkPreset.className).not.toContain("desktop-inspector-selected-fg")
    expect(linkPreset.className).not.toContain("ff3b68")

    const textPreset = getRequiredButton(surface.container, "Use Text content")
    expect(textPreset.getAttribute("aria-pressed")).toBe("false")
    expect(textPreset.className).not.toContain("bg-white/[0.055]")
    expect(surface.container.textContent).toContain("Link")
    expect(surface.container.textContent).not.toContain("Needs input")
    expect(surface.container.querySelector('input[placeholder="https://example.com"]')).not.toBeNull()
  })

  it("keeps the desktop inspector free of pink accent tokens", () => {
    const source = readFileSync(
      resolve(process.cwd(), "components/desktop/desktop-toolbar-prototype.tsx"),
      "utf8",
    )

    expect(source).not.toContain("ff3b68")
    expect(source).not.toContain("ff4f78")
    expect(source).not.toContain("ff9ab1")
    expect(source).not.toContain('[class*="bg-[#ff3b68]"]')
    expect(source).toContain("DESKTOP_INSPECTOR_SELECTED_CLASS")
    expect(source).toContain("DESKTOP_INSPECTOR_HEADER_CLASS")
    expect(source).toContain("DESKTOP_INSPECTOR_FOOTER_CLASS")
    expect(source).toContain("DESKTOP_INSPECTOR_RESET_CLASS")
    expect(source).toContain(".desktop-corner-dot-preview-glyph")
    expect(source).toContain("transform: scale(1.7) !important")
    expect(source).not.toContain('className="border-t border-white/[0.09] bg-black/20 p-3"')
    expect(source).not.toContain('className="mt-3 rounded-[10px] border border-white/[0.08] bg-white/[0.045] p-3"')
    expect(source).not.toContain("[data-slot=\"desktop-floating-inspector\"] [class*=\"bg-white/\"]")
  })

  it("renders a Pixelmator-style pattern inspector without a duplicate pattern card", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "pattern")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )
    expect(inspector?.getAttribute("aria-label")).toBe("Pattern settings")
    expect(inspector?.querySelector('[data-slot="desktop-pattern-inspector"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-pattern-preset-shelf"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-pattern-chooser"]')).toBeNull()
    expect(inspector?.textContent).toContain("Module Pattern")
    expect(inspector?.textContent).toContain("Module Color")
    expect(inspector?.textContent).toContain("Patterns")
    expect(inspector?.textContent).toContain("Scan Safety")
    expect(inspector?.textContent).not.toContain("Reset Pattern")
    expect(surface.container.querySelector('input[placeholder="Search patterns"]')).toBeNull()
  })

  it("keeps module color mode controls flat until selected", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "pattern")

    const colorMode = surface.container.querySelector('[data-slot="desktop-pattern-color-mode"]')
    const solidMode = colorMode?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
    const gradientMode = getRequiredButton(surface.container, "Use Gradient module color")
    const patternsMode = getRequiredButton(surface.container, "Use Patterns module color")

    expect(solidMode?.className).toContain("desktop-inspector-option-selected-bg")
    expect(solidMode?.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(gradientMode.className).not.toContain("bg-black/22")
    expect(gradientMode.className).not.toContain("desktop-inspector-control-bg")
    expect(patternsMode.className).not.toContain("bg-black/22")
    expect(patternsMode.className).not.toContain("desktop-inspector-control-bg")
  })

  it("updates the pattern inspector when a visual pattern is selected", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "pattern")

    const dotsPattern = getRequiredButton(surface.container, "Use Circle pattern")

    await clickButton(dotsPattern)

    expect(dotsPattern.getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.textContent).toContain("Module Color")
  })

  it("uses an outer black selected ring with selected fill for module pattern options in light mode", async () => {
    const surface = await renderPrototype()
    const themeToggle = getRequiredButton(surface.container, "Switch to light mode")

    await clickButton(themeToggle)
    await openTool(surface.container, "pattern")

    const dotsPattern = getRequiredButton(surface.container, "Use Circle pattern")

    await clickButton(dotsPattern)

    const selectedSurface = dotsPattern.querySelector<HTMLElement>('[data-desktop-adaptive-option-preview="true"]')
    expect(dotsPattern.getAttribute("aria-pressed")).toBe("true")
    expect(dotsPattern.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(dotsPattern.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(selectedSurface?.className).toContain("border-2")
    expect(selectedSurface?.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(selectedSurface?.style.backgroundColor).toBe("transparent")
  })

  it("uses an outer white selected ring with selected fill for module pattern options in dark mode", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "pattern")

    const dotsPattern = getRequiredButton(surface.container, "Use Circle pattern")

    await clickButton(dotsPattern)

    const selectedSurface = dotsPattern.querySelector<HTMLElement>('[data-desktop-adaptive-option-preview="true"]')
    expect(dotsPattern.getAttribute("aria-pressed")).toBe("true")
    expect(dotsPattern.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(dotsPattern.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(selectedSurface?.className).toContain("border-2")
    expect(selectedSurface?.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(selectedSurface?.style.backgroundColor).toBe("transparent")
    expect(selectedSurface?.style.color).toBe("rgb(248, 250, 252)")
  })

  it("renders larger module pattern previews inside square options", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "pattern")

    const dotsPattern = getRequiredButton(surface.container, "Use Circle pattern")
    const previewGlyph = dotsPattern.querySelector<HTMLElement>(
      '[data-desktop-adaptive-option-preview="true"] > span',
    )
    expect(previewGlyph?.className).toContain("size-[78%]")
  })

  it("renders a Pixelmator-style corners inspector with separate frame and dot shelves", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "corners")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.getAttribute("aria-label")).toBe("Corners settings")
    expect(inspector?.querySelector('[data-slot="desktop-corners-inspector"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-corner-frame-preset-shelf"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-corner-dot-preset-shelf"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Corner Frame")
    expect(inspector?.textContent).toContain("Corner Dot")
    expect(inspector?.textContent).toContain("Frame Color")
    expect(inspector?.textContent).toContain("Dot Color")
    expect(inspector?.querySelector('[data-slot="desktop-corner-frame-color"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-corner-dot-color"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Valid")
    expect(inspector?.textContent).not.toContain("Reset Corners")
    expect(inspector?.textContent).not.toContain("Coming soon")
  })

  it("updates only the corner frame shelf when a frame preset is selected", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "corners")

    const squareFrame = getRequiredButton(surface.container, "Use Square corner frame")
    const defaultCornerDot = getRequiredButton(surface.container, "Use Circle corner dot")

    await clickButton(squareFrame)

    expect(squareFrame.getAttribute("aria-pressed")).toBe("true")
    expect(defaultCornerDot.getAttribute("aria-pressed")).toBe("true")
  })

  it("updates only the corner dot shelf when a dot preset is selected", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "corners")

    const defaultCornerFrame = getRequiredButton(surface.container, "Use Large rounded corner frame")
    const squareDot = getRequiredButton(surface.container, "Use Square corner dot")

    await clickButton(squareDot)

    expect(defaultCornerFrame.getAttribute("aria-pressed")).toBe("true")
    expect(squareDot.getAttribute("aria-pressed")).toBe("true")
  })

  it("uses an outer black selected ring with selected fill for corner frame and dot options in light mode", async () => {
    const surface = await renderPrototype()
    const themeToggle = getRequiredButton(surface.container, "Switch to light mode")

    await clickButton(themeToggle)
    await openTool(surface.container, "corners")

    const squareFrame = getRequiredButton(surface.container, "Use Square corner frame")
    const squareDot = getRequiredButton(surface.container, "Use Square corner dot")

    await act(async () => {
      squareFrame.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      squareDot.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const frameSurface = squareFrame.querySelector<HTMLElement>('[data-desktop-adaptive-option-preview="true"]')
    const dotSurface = squareDot.querySelector<HTMLElement>('[data-desktop-adaptive-option-preview="true"]')
    expect(squareFrame.getAttribute("aria-pressed")).toBe("true")
    expect(squareDot.getAttribute("aria-pressed")).toBe("true")
    expect(squareFrame.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(squareDot.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(squareFrame.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(squareDot.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(frameSurface?.className).toContain("border-2")
    expect(dotSurface?.className).toContain("border-2")
    expect(frameSurface?.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(dotSurface?.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(frameSurface?.style.backgroundColor).toBe("transparent")
    expect(dotSurface?.style.backgroundColor).toBe("transparent")
  })

  it("uses an outer white selected ring with selected fill for corner frame and dot options in dark mode", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "corners")

    const squareFrame = getRequiredButton(surface.container, "Use Square corner frame")
    const squareDot = getRequiredButton(surface.container, "Use Square corner dot")

    await act(async () => {
      squareFrame.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      squareDot.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const frameSurface = squareFrame.querySelector<HTMLElement>('[data-desktop-adaptive-option-preview="true"]')
    const dotSurface = squareDot.querySelector<HTMLElement>('[data-desktop-adaptive-option-preview="true"]')
    expect(squareFrame.getAttribute("aria-pressed")).toBe("true")
    expect(squareDot.getAttribute("aria-pressed")).toBe("true")
    expect(squareFrame.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(squareDot.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(squareFrame.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(squareDot.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(frameSurface?.className).toContain("border-2")
    expect(dotSurface?.className).toContain("border-2")
    expect(frameSurface?.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(dotSurface?.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(frameSurface?.style.backgroundColor).toBe("transparent")
    expect(frameSurface?.style.color).toBe("rgb(248, 250, 252)")
    expect(dotSurface?.style.backgroundColor).toBe("transparent")
    expect(dotSurface?.style.color).toBe("rgb(248, 250, 252)")
  })

  it("renders larger corner previews inside square options", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "corners")

    const squareFrame = getRequiredButton(surface.container, "Use Square corner frame")
    const squareDot = getRequiredButton(surface.container, "Use Square corner dot")
    const frameGlyph = squareFrame.querySelector<HTMLElement>(
      '[data-desktop-adaptive-option-preview="true"] > span',
    )
    const dotGlyph = squareDot.querySelector<HTMLElement>(
      '[data-desktop-adaptive-option-preview="true"] > span',
    )
    expect(frameGlyph?.className).toContain("size-[92%]")
    expect(dotGlyph?.className).toContain("size-[92%]")
    expect(frameGlyph?.className).not.toContain("desktop-corner-dot-preview-glyph")
    expect(dotGlyph?.className).toContain("desktop-corner-dot-preview-glyph")
  })

  it("keeps corner frame and dot option cards on compact three-column shelves", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "corners")

    const frameShelf = surface.container.querySelector<HTMLElement>(
      '[data-slot="desktop-corner-frame-preset-shelf"]',
    )
    const dotShelf = surface.container.querySelector<HTMLElement>(
      '[data-slot="desktop-corner-dot-preset-shelf"]',
    )
    expect(frameShelf?.className).toContain("grid-cols-3")
    expect(frameShelf?.className).not.toContain("grid-cols-2")
    expect(dotShelf?.className).toContain("grid-cols-3")
    expect(dotShelf?.className).not.toContain("grid-cols-2")
  })

  it("keeps corner frame and dot color controls independent", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "corners")

    const frameGradient = getRequiredButton(surface.container, "Use gradient corner frame color")
    const dotSolid = getRequiredButton(surface.container, "Use solid corner dot color")

    await clickButton(frameGradient)

    expect(frameGradient.getAttribute("aria-pressed")).toBe("true")
    expect(dotSolid.getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.querySelector('input[aria-label="Frame start color"]')).not.toBeNull()
    expect(surface.container.querySelector('input[aria-label="Dot solid color"]')).not.toBeNull()
  })

  it("renders color picker triggers as circular swatches with a dark mode border", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "pattern")

    const swatch = getRequiredInput(surface.container, "Solid color swatch")
    const hexInput = getRequiredInput(surface.container, "Solid color")
    const swatchRing = swatch.parentElement

    expect(swatch.type).toBe("color")
    expect(swatch.className).toContain("rounded-full")
    expect(swatch.className).toContain("size-5")
    expect(swatch.className).not.toContain("w-12")
    expect(swatch.className).not.toContain("rounded-[6px]")
    expect(swatch.getAttribute("data-slot")).toBe("desktop-color-picker")
    expect(swatch.closest("label")).toBeNull()
    expect(swatchRing?.className).toContain("size-7")
    expect(swatchRing?.className).toContain("border-2")
    expect(hexInput.className).toContain("w-20")

    await clickButton(getRequiredButton(surface.container, "Use Patterns module color"))

    const patternSwatch = getRequiredInput(surface.container, "Pattern color 1")
    expect(patternSwatch.type).toBe("color")
    expect(patternSwatch.className).toContain("rounded-full")
    expect(patternSwatch.className).toContain("size-7")
    expect(patternSwatch.className).not.toContain("border-white")
    expect(patternSwatch.getAttribute("data-slot")).toBe("desktop-color-picker")
  })

  it("renders a Pixelmator-style shape inspector without placeholder copy", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "shape")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.getAttribute("aria-label")).toBe("Shape settings")
    expect(inspector?.querySelector('[data-slot="desktop-shape-inspector"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Shape")
    expect(inspector?.textContent).not.toContain("Coming soon")
  })

  it("renders shape options, color controls, and preset shelf", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "shape")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.querySelector('[data-slot="desktop-shape-preset-shelf"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-shape-color-mode"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Shape Options")
    expect(inspector?.textContent).toContain("Shape Color")
    expect(inspector?.textContent).not.toContain("Reset Shape")
  })

  it("selects a shape preset without changing shape color mode", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "shape")

    const circleShape = getRequiredButton(surface.container, "Use Circle shape")
    const solidMode = getRequiredButton(surface.container, "Use solid shape color")

    await clickButton(circleShape)

    expect(circleShape.getAttribute("aria-pressed")).toBe("true")
    expect(circleShape.getAttribute("data-desktop-option-tile")).toBe("true")
    expect(circleShape.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(circleShape.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(solidMode.getAttribute("aria-pressed")).toBe("true")
    expect(solidMode.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(solidMode.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(surface.container.querySelector('input[aria-label="Shape solid color"]')).not.toBeNull()
  })

  it("switches shape solid and gradient color controls", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "shape")

    const gradientMode = getRequiredButton(surface.container, "Use gradient shape color")

    await clickButton(gradientMode)

    expect(gradientMode.getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.querySelector('input[aria-label="Shape start color"]')).not.toBeNull()
    expect(surface.container.querySelector('input[aria-label="Shape end color"]')).not.toBeNull()
    expect(surface.container.querySelector('input[aria-label="Shape solid color"]')).toBeNull()
  })

  it("updates the shape solid color input", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "shape")

    const solidInput = getRequiredInput(surface.container, "Shape solid color")

    await act(async () => {
      setInputValue(solidInput, "#ff0000")
    })

    expect(getRequiredInput(surface.container, "Shape solid color").value).toBe("#ff0000")
  })

  it("updates the shape gradient color inputs", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "shape")

    await clickButton(getRequiredButton(surface.container, "Use gradient shape color"))

    await act(async () => {
      setInputValue(getRequiredInput(surface.container, "Shape start color"), "#00ff00")
      setInputValue(getRequiredInput(surface.container, "Shape end color"), "#0000ff")
    })

    expect(getRequiredInput(surface.container, "Shape start color").value).toBe("#00ff00")
    expect(getRequiredInput(surface.container, "Shape end color").value).toBe("#0000ff")
  })

  it("renders shape numeric controls as desktop elastic sliders", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "shape")

    const elasticLabels = [
      "Corner radius",
      "Padding",
      "Bottom space",
      "Border width",
      "Border opacity",
      "Shape padding",
      "Shape stroke width",
      "Shape stroke opacity",
      "Shape shadow blur",
      "Shape shadow opacity",
      "Shape shadow X",
      "Shape shadow Y",
    ]

    for (const label of elasticLabels) {
      expect(getRequiredSlider(surface.container, label)).not.toBeNull()
      expect(surface.container.querySelector(`input[type="number"][aria-label="${label}"]`)).toBeNull()
    }

    expect(getRequiredSliderRow(surface.container, "Corner radius").textContent).toBe("Corner radius28")
    expect(getRequiredSliderRow(surface.container, "Padding").textContent).toBe("Padding24")
    expect(getRequiredSliderRow(surface.container, "Bottom space").textContent).toBe("Bottom space128")
    expect(getRequiredSliderRow(surface.container, "Border width").textContent).toBe("Border width0")
    expect(getRequiredSliderRow(surface.container, "Border opacity").textContent).toBe("Border opacity100")
    expect(getRequiredSliderRow(surface.container, "Shape padding").textContent).toBe("Shape padding0")
    expect(getRequiredSliderRow(surface.container, "Shape stroke opacity").textContent).toBe("Shape stroke opacity100")

    await act(async () => {
      getRequiredSlider(surface.container, "Border width").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
      )
      getRequiredSlider(surface.container, "Border opacity").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Home" }),
      )
      getRequiredSlider(surface.container, "Shape shadow X").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
      )
      getRequiredSlider(surface.container, "Corner radius").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
      )
    })

    expect(getRequiredSlider(surface.container, "Border width").getAttribute("aria-valuenow")).toBe("24")
    expect(getRequiredSlider(surface.container, "Border opacity").getAttribute("aria-valuenow")).toBe("0")
    expect(getRequiredSlider(surface.container, "Shape shadow X").getAttribute("aria-valuenow")).toBe("64")
    expect(getRequiredSlider(surface.container, "Corner radius").getAttribute("aria-valuenow")).toBe("64")
  })

  it("renders a compact Pixelmator-style motion inspector without placeholder copy", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.getAttribute("aria-label")).toBe("Motion settings")
    expect(inspector?.querySelector('[data-slot="desktop-motion-inspector"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Motion")
    expect(inspector?.textContent).not.toContain("Coming soon")
  })

  it("renders compact motion sections and loader shelf", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.querySelector('[data-slot="desktop-motion-loader-shelf"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Motion")
    expect(inspector?.textContent).toContain("Loader")
    expect(inspector?.textContent).toContain("Timing")
    expect(inspector?.textContent).toContain("Loader Color")
    expect(inspector?.textContent).toContain("Output")
    expect(inspector?.textContent).not.toContain("Reset Motion")
    expect(inspector?.textContent).not.toContain("Pause")
    expect(inspector?.textContent).not.toContain("Frame")
    expect(inspector?.textContent).not.toContain("Opacity")

    const motionToggle = getRequiredButton(surface.container, "Dot matrix motion")
    const defaultLoader = getRequiredButton(surface.container, "Use Neon Drift motion loader")

    expect(motionToggle.getAttribute("aria-pressed")).toBe("false")
    expect(motionToggle.className).not.toContain("desktop-inspector-control-bg")
    expect(defaultLoader.getAttribute("aria-pressed")).toBe("true")
    expect(defaultLoader.className).toContain("desktop-inspector-option-selected-bg")
    expect(defaultLoader.className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(defaultLoader.className).not.toContain("ring-black")
  })

  it("toggles dot matrix motion without changing the default loader", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    const motionToggle = getRequiredButton(surface.container, "Dot matrix motion")
    const defaultLoader = getRequiredButton(surface.container, "Use Neon Drift motion loader")

    expect(motionToggle.getAttribute("aria-pressed")).toBe("false")
    expect(defaultLoader.getAttribute("aria-pressed")).toBe("true")

    await clickButton(motionToggle)

    expect(motionToggle.getAttribute("aria-pressed")).toBe("true")
    expect(defaultLoader.getAttribute("aria-pressed")).toBe("true")
  })

  it("selects a motion loader preset", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    const prismSweep = getRequiredButton(surface.container, "Use Prism Sweep motion loader")

    await clickButton(prismSweep)

    expect(prismSweep.getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Use Neon Drift motion loader").getAttribute("aria-pressed")).toBe("false")
  })

  it("updates motion speed, matrix density, and overlay scale sliders", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    await act(async () => {
      getRequiredSlider(surface.container, "Motion speed").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
      )
      getRequiredSlider(surface.container, "Motion matrix density").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
      )
      getRequiredSlider(surface.container, "Motion overlay scale").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
      )
    })

    expect(getRequiredSlider(surface.container, "Motion speed").getAttribute("aria-valuenow")).toBe("10")
    expect(getRequiredSlider(surface.container, "Motion matrix density").getAttribute("aria-valuenow")).toBe("25")
    expect(surface.container.textContent).toContain("25x25")
    expect(getRequiredSlider(surface.container, "Motion overlay scale").getAttribute("aria-valuenow")).toBe("140")
  })

  it("renders compact motion sliders with the desktop elastic slider component", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    expect(surface.container.querySelectorAll('[data-slot="desktop-elastic-slider"]')).toHaveLength(3)
    expect(surface.container.querySelector('input[type="range"][aria-label^="Motion "]')).toBeNull()
    expect(getRequiredSlider(surface.container, "Motion speed")).not.toBeNull()
    expect(getRequiredSlider(surface.container, "Motion matrix density")).not.toBeNull()
    expect(getRequiredSlider(surface.container, "Motion overlay scale")).not.toBeNull()
    expect(getRequiredSliderRow(surface.container, "Motion speed").textContent).toBe("Speed3x")
    expect(getRequiredSliderRow(surface.container, "Motion matrix density").textContent).toBe("Matrix density5x5")
    expect(getRequiredSliderRow(surface.container, "Motion overlay scale").textContent).toBe("Overlay scale100%")
    expect(
      getRequiredSlider(surface.container, "Motion speed")
        .closest('[data-slot="elastic-slider"]')
        ?.className,
    ).toContain("[--elastic-slider-label:rgba(255,255,255,0.58)]")
    expect(surface.container.innerHTML).toContain('[data-slot="elastic-slider-label"]')
    expect(surface.container.innerHTML).toContain("color: rgba(255, 255, 255, 0.86) !important")
    expect(surface.container.innerHTML).toContain('data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-slot="elastic-slider-label"]')
    expect(getRequiredSliderRow(surface.container, "Motion speed").className).not.toContain("desktop-inspector-control-bg")
    expect(getRequiredSliderRow(surface.container, "Motion matrix density").className).not.toContain("desktop-inspector-control-bg")
    expect(getRequiredSliderRow(surface.container, "Motion overlay scale").className).not.toContain("desktop-inspector-control-bg")
  })

  it("hides custom motion color inputs for non-theme color presets", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    await clickButton(getRequiredButton(surface.container, "Use Mint motion colors"))

    expect(getRequiredButton(surface.container, "Use Mint motion colors").getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.querySelector('input[aria-label="Motion base color"]')).toBeNull()
    expect(surface.container.querySelector('input[aria-label="Motion mid color"]')).toBeNull()
    expect(surface.container.querySelector('input[aria-label="Motion peak color"]')).toBeNull()
  })

  it("shows and updates custom motion theme colors", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    await act(async () => {
      getRequiredButton(surface.container, "Use Mint motion colors").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(surface.container, "Use Theme motion colors").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      setInputValue(getRequiredInput(surface.container, "Motion base color"), "#111111")
      setInputValue(getRequiredInput(surface.container, "Motion mid color"), "#555555")
      setInputValue(getRequiredInput(surface.container, "Motion peak color"), "#eeeeee")
    })

    expect(getRequiredInput(surface.container, "Motion base color").value).toBe("#111111")
    expect(getRequiredInput(surface.container, "Motion mid color").value).toBe("#555555")
    expect(getRequiredInput(surface.container, "Motion peak color").value).toBe("#eeeeee")
  })

  it("updates motion preview and animated SVG export toggles independently", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "motion")

    const previewToggle = getRequiredButton(surface.container, "Animated preview")
    const exportToggle = getRequiredButton(surface.container, "Animated SVG export")

    expect(previewToggle.getAttribute("aria-pressed")).toBe("true")
    expect(exportToggle.getAttribute("aria-pressed")).toBe("false")

    await act(async () => {
      previewToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      exportToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(previewToggle.getAttribute("aria-pressed")).toBe("false")
    expect(exportToggle.getAttribute("aria-pressed")).toBe("true")
  })

  it("renders a compact Pixelmator-style text inspector without placeholder copy", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.getAttribute("aria-label")).toBe("Text settings")
    expect(inspector?.querySelector('[data-slot="desktop-text-inspector"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Text")
    expect(inspector?.textContent).not.toContain("Coming soon")
  })

  it("renders compact text sections", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.querySelector('[data-slot="desktop-text-font-selector"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-text-font-listbox"]')).toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-text-alignment"]')).not.toBeNull()
    expect(inspector?.querySelector('select[aria-label="Text preset"]')).toBeNull()
    expect(inspector?.querySelector('select[aria-label="Text font"]')).toBeNull()
    expect(inspector?.textContent).toContain("Text")
    expect(inspector?.textContent).toContain("Preset")
    expect(inspector?.textContent).toContain("Font")
    expect(getRequiredButton(surface.container, "Use Body text preset").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Use Title text preset").getAttribute("aria-pressed")).toBe("false")
    expect(inspector?.querySelector('[data-slot="desktop-text-emphasis"]')).not.toBeNull()
    expect(inspector?.textContent).not.toContain("Type")
    expect(inspector?.textContent).toContain("Color")
    expect(inspector?.textContent).toContain("Alignment")
    expect(inspector?.textContent).toContain("Spacing")
    expect(getRequiredSlider(surface.container, "Text font letter spacing")).not.toBeNull()
    expect(getRequiredSlider(surface.container, "Text font line height")).not.toBeNull()
    expect(inspector?.querySelector('input[type="range"][aria-label^="Text font"]')).toBeNull()
    expect(getRequiredButton(surface.container, "Text font").className).not.toContain("desktop-inspector-control-bg")
    expect(getRequiredTextarea(surface.container, "Text layer content").className).toContain("desktop-inspector-field-bg")
    expect(getRequiredTextarea(surface.container, "Text layer content").className).not.toContain("border-white")
    expect(getRequiredButton(surface.container, "Bold text").className).not.toContain("desktop-inspector-control-bg")
    expect(getRequiredButton(surface.container, "Align text left").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Align text left").className).toContain("desktop-inspector-option-selected-bg")
    expect(getRequiredButton(surface.container, "Align text left").className).not.toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(inspector?.textContent).not.toContain("Reset Text")
  })

  it("keeps desktop content picker defaults flat with ring and fill selection", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "content")

    const filterTrigger = getRequiredButton(surface.container, "Filter QR types")
    const textOption = getRequiredButton(surface.container, "Use Text content")
    const selectedOption = surface.container.querySelector<HTMLButtonElement>(
      '[data-desktop-content-type-option="true"][aria-pressed="true"]',
    )

    expect(filterTrigger.className).not.toContain("bg-black/10")
    expect(textOption.className).not.toContain("bg-white/[0.055]")
    expect(textOption.className).not.toContain("desktop-inspector-control-bg")
    expect(textOption.className).toContain("border-transparent")
    expect(selectedOption?.className).not.toContain("desktop-inspector-selected-bg")
    expect(selectedOption?.className).not.toContain("bg-[var(--desktop-inspector-selected-bg)]")
    expect(selectedOption?.className).toContain("bg-[var(--desktop-inspector-option-selected-bg)]")
    expect(selectedOption?.className).toContain("border-[var(--desktop-inspector-option-selected-border)]")
    expect(filterTrigger.className).toContain("rounded-full")

    const source = readFileSync(
      resolve(process.cwd(), "components/desktop/desktop-toolbar-prototype.tsx"),
      "utf8",
    )
    expect(source).toContain('data-slot="desktop-content-type-filter-menu"')
    expect(source).toContain('{ id: "all", label: "All" }')
    expect(source).toContain("w-32")
    expect(source).toContain("bg-white")
    expect(source).toContain("bg-[#111116]")
    expect(source).toContain("[&_[data-slot=dropdown-menu-radio-item-indicator]]:hidden")
    expect(source).not.toContain("[&_[data-slot=dropdown-menu-radio-item-indicator]]:left-3")
    expect(source).not.toContain("data-[state=checked]:ring-2")
    expect(source).not.toContain("data-[state=checked]:focus:bg-transparent")
    expect(source).toContain("data-[state=checked]:focus:bg-slate-950/[0.08]")
    expect(source).toContain("data-[state=checked]:focus:bg-white/[0.1]")
    expect(source).not.toContain("[&_[data-slot=dropdown-menu-radio-item-indicator]]:text-current")
    expect(source).not.toContain("data-[state=checked]:focus:[&_[data-slot=dropdown-menu-radio-item-indicator]]")
    expect(source).not.toContain("[data-slot=dropdown-menu-radio-item-indicator]_svg")
    expect(source).toContain(':not([data-desktop-preview-option="true"]):not([data-desktop-content-type-option="true"]):not([data-desktop-option-tile="true"]):hover')
  })

  it("keeps logo size rows flat instead of stacking grey controls", async () => {
    const surface = await renderPrototype()

    await openTool(surface.container, "logo")

    const logoMargin = getRequiredInput(surface.container, "Logo margin")
    const logoMarginRow = logoMargin.closest("label")
    const hideDots = getRequiredButton(surface.container, "Hide background dots")
    const saveBlob = getRequiredButton(surface.container, "Save embedded image as blob")

    expect(logoMarginRow?.className).not.toContain("desktop-inspector-control-bg")
    expect(hideDots.className).not.toContain("desktop-inspector-control-bg")
    expect(saveBlob.className).not.toContain("desktop-inspector-control-bg")
  })

  it("removes header preview tiles from desktop color selection sections", async () => {
    const surface = await renderPrototype()

    await openTool(surface.container, "pattern")

    const moduleColor = surface.container.querySelector('[data-slot="desktop-module-color"]')
    expect(moduleColor?.textContent).toContain("Module Color")
    expect(moduleColor?.querySelector('[data-slot="desktop-style-preview-surface"]')).toBeNull()

    await openTool(surface.container, "corners")

    const frameColor = surface.container.querySelector('[data-slot="desktop-corner-frame-color"]')
    const dotColor = surface.container.querySelector('[data-slot="desktop-corner-dot-color"]')
    expect(frameColor?.textContent).toContain("Frame Color")
    expect(dotColor?.textContent).toContain("Dot Color")
    expect(frameColor?.querySelector('[data-slot="desktop-style-preview-surface"]')).toBeNull()
    expect(dotColor?.querySelector('[data-slot="desktop-style-preview-surface"]')).toBeNull()

    await openTool(surface.container, "shape")

    const shapeColor = surface.container.querySelector('[data-slot="desktop-shape-color"]')
    expect(shapeColor?.textContent).toContain("Shape Color")
    expect(shapeColor?.querySelector('[data-slot="desktop-style-preview-surface"]')).toBeNull()

    await openTool(surface.container, "logo")

    const logoColor = surface.container.querySelector('[data-slot="desktop-logo-color"]')
    expect(logoColor?.textContent).toContain("Icon Color")
    expect(logoColor?.querySelector('[data-slot="desktop-style-preview-surface"]')).toBeNull()
  })

  it("updates text preset from neutral segmented buttons", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    const titlePreset = getRequiredButton(surface.container, "Use Title text preset")

    await clickButton(titlePreset)

    expect(getRequiredButton(surface.container, "Use Body text preset").getAttribute("aria-pressed")).toBe("false")
    expect(getRequiredButton(surface.container, "Use Title text preset").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredInput(surface.container, "Text font size").value).toBe("52")
    expect(getRequiredSlider(surface.container, "Text font line height").getAttribute("aria-valuenow")).toBe("1.05")
  })

  it("updates text content locally", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    const textArea = getRequiredTextarea(surface.container, "Text layer content")

    await act(async () => {
      setTextareaValue(textArea, "Launch label")
    })

    expect(getRequiredTextarea(surface.container, "Text layer content").value).toBe("Launch label")
  })

  it("selects a text font from a compact selector without changing the text content", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    await act(async () => {
      setTextareaValue(getRequiredTextarea(surface.container, "Text layer content"), "Keep this copy")
    })

    const fontTrigger = getRequiredButton(surface.container, "Text font")

    await clickButton(fontTrigger)

    const fontListbox = surface.container.querySelector('[data-slot="desktop-text-font-listbox"]')
    const generalSansOption = getRequiredButton(surface.container, "Use General Sans text font")

    expect(fontListbox?.getAttribute("role")).toBe("listbox")
    expect(generalSansOption.getAttribute("role")).toBe("option")

    await clickButton(generalSansOption)

    expect(getRequiredButton(surface.container, "Text font").textContent).toContain("General Sans")
    expect(surface.container.querySelector('[data-slot="desktop-text-font-listbox"]')).toBeNull()
    expect(getRequiredTextarea(surface.container, "Text layer content").value).toBe("Keep this copy")
  })

  it("updates text size and weight controls", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    await act(async () => {
      setInputValue(getRequiredInput(surface.container, "Text font size"), "64")
      getRequiredSlider(surface.container, "Text font weight").dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "End" }),
      )
    })

    expect(getRequiredInput(surface.container, "Text font size").value).toBe("64")
    expect(getRequiredSlider(surface.container, "Text font weight").getAttribute("aria-valuenow")).toBe("900")
  })

  it("toggles text emphasis controls independently", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    const bold = getRequiredButton(surface.container, "Bold text")
    const italic = getRequiredButton(surface.container, "Italic text")
    const underline = getRequiredButton(surface.container, "Underline text")

    expect(bold.getAttribute("aria-pressed")).toBe("false")
    expect(italic.getAttribute("aria-pressed")).toBe("false")
    expect(underline.getAttribute("aria-pressed")).toBe("false")

    await act(async () => {
      bold.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      underline.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(bold.getAttribute("aria-pressed")).toBe("true")
    expect(italic.getAttribute("aria-pressed")).toBe("false")
    expect(underline.getAttribute("aria-pressed")).toBe("true")
  })

  it("updates the text fill color input", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    await act(async () => {
      setInputValue(getRequiredInput(surface.container, "Text fill color"), "#ff0000")
    })

    expect(getRequiredInput(surface.container, "Text fill color").value).toBe("#ff0000")
  })

  it("updates text alignment selection", async () => {
    const surface = await renderPrototype()
    await openTool(surface.container, "text")

    const left = getRequiredButton(surface.container, "Align text left")
    const center = getRequiredButton(surface.container, "Align text center")
    const right = getRequiredButton(surface.container, "Align text right")

    expect(left.getAttribute("aria-pressed")).toBe("true")

    await clickButton(center)

    expect(left.getAttribute("aria-pressed")).toBe("false")
    expect(center.getAttribute("aria-pressed")).toBe("true")
    expect(right.getAttribute("aria-pressed")).toBe("false")
  })

})

async function renderPrototype({
  controller,
}: {
  controller?: Partial<NonNullable<ComponentProps<typeof DesktopToolbarPrototype>>["controller"]>
} = {}) {
  return renderWithAsyncJsdomRoot(
    <DesktopToolbarPrototype controller={controller as NonNullable<ComponentProps<typeof DesktopToolbarPrototype>>["controller"]} />,
  )
}

function getToolButtons(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>(
      '[data-desktop-tool-button="true"]',
    ),
  )
}

function getRequiredToolButton(container: HTMLElement, toolId: string) {
  const button = container.querySelector<HTMLButtonElement>(
    `[data-tool-id="${toolId}"]`,
  )

  if (!button) {
    throw new Error(`Missing desktop toolbar button: ${toolId}`)
  }

  return button
}

async function clickButton(button: HTMLButtonElement) {
  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

async function openTool(container: HTMLElement, toolId: string) {
  await clickButton(getRequiredToolButton(container, toolId))
}

function getRequiredSlider(container: HTMLElement, label: string) {
  const slider = container.querySelector<HTMLElement>(`[role="slider"][aria-label="${label}"]`)

  if (!slider) {
    throw new Error(`Missing slider: ${label}`)
  }

  return slider
}

function getRequiredSliderRow(container: HTMLElement, label: string) {
  const slider = getRequiredSlider(container, label)
  const row = slider.closest('[data-slot="desktop-elastic-slider-row"]')

  if (!row) {
    throw new Error(`Missing slider row: ${label}`)
  }

  return row
}

function getRequiredButton(container: HTMLElement, label: string) {
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (candidate) => candidate.getAttribute("aria-label") === label,
  )

  if (!button) {
    throw new Error(`Missing button: ${label}`)
  }

  return button
}

function getRequiredInput(container: HTMLElement, label: string) {
  const input = container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)

  if (!input) {
    throw new Error(`Missing input: ${label}`)
  }

  return input
}

function getRequiredTextarea(container: HTMLElement, label: string) {
  const textarea = container.querySelector<HTMLTextAreaElement>(`textarea[aria-label="${label}"]`)

  if (!textarea) {
    throw new Error(`Missing textarea: ${label}`)
  }

  return textarea
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set
  setter?.call(textarea, value)
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
}
