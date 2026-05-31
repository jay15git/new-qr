// @vitest-environment jsdom

import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  DESKTOP_TOOLBAR_TOOLS,
  DesktopToolbarPrototype,
} from "@/components/desktop/desktop-toolbar-prototype"
import { DEFAULT_DOT_MATRIX_ANIMATION } from "@/components/qr/qr-studio-state"

const cleanupCallbacks: Array<() => void> = []

afterEach(() => {
  for (const cleanup of cleanupCallbacks.splice(0)) {
    cleanup()
  }

  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})

describe("DesktopToolbarPrototype", () => {
  it("renders every /new left rail tool as an accessible icon button", async () => {
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

    await act(async () => {
      imageButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(contentButton.getAttribute("aria-pressed")).toBe("false")
    expect(imageButton.getAttribute("aria-pressed")).toBe("true")
  })

  it("toggles the desktop prototype between dark and light mode", async () => {
    const surface = await renderPrototype()
    const prototype = surface.container.querySelector('[data-slot="desktop-toolbar-prototype"]')
    const themeToggle = getRequiredButton(surface.container, "Switch to light mode")

    expect(prototype?.getAttribute("data-desktop-theme")).toBe("dark")

    await act(async () => {
      themeToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(prototype?.getAttribute("data-desktop-theme")).toBe("light")
    expect(getRequiredButton(surface.container, "Switch to dark mode")).not.toBeNull()
  })

  it("renders every remaining /new settings tool in the desktop inspector format", async () => {
    const surface = await renderPrototype()
    const expectedSlots = [
      ["logo", "desktop-logo-inspector", "Reset Logo"],
      ["encoding", "desktop-encoding-inspector", "Reset Encoding"],
      ["image", "desktop-image-inspector", "Reset Image"],
      ["decorations", "desktop-decorations-inspector", "Reset Decorations"],
      ["effects", "desktop-effects-inspector", "Reset Effects"],
      ["layers", "desktop-layers-inspector", "Reset Layers"],
      ["export", "desktop-export-inspector", "Reset Export"],
    ] as const

    for (const [toolId, slot, resetLabel] of expectedSlots) {
      await act(async () => {
        getRequiredToolButton(surface.container, toolId).dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        )
      })

      const inspector = surface.container.querySelector(
        '[data-slot="desktop-floating-inspector"]',
      )

      expect(inspector?.querySelector(`[data-slot="${slot}"]`)).not.toBeNull()
      expect(inspector?.textContent).toContain(resetLabel)
      expect(inspector?.textContent).not.toContain("Coming soon")
    }
  })

  it("renders the /new content tab inside the floating inspector", async () => {
    const surface = await renderPrototype()
    const contentButton = getRequiredToolButton(surface.container, "content")

    await act(async () => {
      contentButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector).not.toBeNull()
    expect(inspector?.getAttribute("aria-label")).toBe("Content settings")
    expect(inspector?.querySelector('[data-slot="desktop-content-inspector"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-content-type-collection"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-content-fields"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Content")
    expect(inspector?.textContent).toContain("Encoded value")
    expect(inspector?.textContent).toContain("Reset Content")
  })

  it("updates the content inspector when a Pixelmator-style preset is clicked", async () => {
    const surface = await renderPrototype()
    const contentButton = getRequiredToolButton(surface.container, "content")

    await act(async () => {
      contentButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const linkPreset = getRequiredButton(surface.container, "Use Link content")

    await act(async () => {
      linkPreset.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(linkPreset.getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.textContent).toContain("Link")
    expect(surface.container.textContent).toContain("Needs input")
    expect(surface.container.querySelector('input[placeholder="https://example.com"]')).not.toBeNull()
  })

  it("renders a Pixelmator-style pattern inspector without a duplicate pattern card", async () => {
    const surface = await renderPrototype()
    const patternButton = getRequiredToolButton(surface.container, "pattern")

    await act(async () => {
      patternButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

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
    expect(inspector?.textContent).toContain("Reset Pattern")
    expect(surface.container.querySelector('input[placeholder="Search patterns"]')).toBeNull()
  })

  it("updates the pattern inspector when a visual pattern is selected", async () => {
    const surface = await renderPrototype()
    const patternButton = getRequiredToolButton(surface.container, "pattern")

    await act(async () => {
      patternButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const dotsPattern = getRequiredButton(surface.container, "Use Dots pattern")

    await act(async () => {
      dotsPattern.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(dotsPattern.getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.textContent).toContain("Module Color")
  })

  it("renders a Pixelmator-style corners inspector with separate frame and dot shelves", async () => {
    const surface = await renderPrototype()
    const cornersButton = getRequiredToolButton(surface.container, "corners")

    await act(async () => {
      cornersButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

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
    expect(inspector?.textContent).toContain("Reset Corners")
    expect(inspector?.textContent).not.toContain("Coming soon")
  })

  it("updates only the corner frame shelf when a frame preset is selected", async () => {
    const surface = await renderPrototype()
    const cornersButton = getRequiredToolButton(surface.container, "corners")

    await act(async () => {
      cornersButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const squareFrame = getRequiredButton(surface.container, "Use Square corner frame")
    const defaultCornerDot = getRequiredButton(surface.container, "Use Dot corner dot")

    await act(async () => {
      squareFrame.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(squareFrame.getAttribute("aria-pressed")).toBe("true")
    expect(defaultCornerDot.getAttribute("aria-pressed")).toBe("true")
  })

  it("updates only the corner dot shelf when a dot preset is selected", async () => {
    const surface = await renderPrototype()
    const cornersButton = getRequiredToolButton(surface.container, "corners")

    await act(async () => {
      cornersButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const defaultCornerFrame = getRequiredButton(surface.container, "Use Extra rounded corner frame")
    const squareDot = getRequiredButton(surface.container, "Use Square corner dot")

    await act(async () => {
      squareDot.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(defaultCornerFrame.getAttribute("aria-pressed")).toBe("true")
    expect(squareDot.getAttribute("aria-pressed")).toBe("true")
  })

  it("resets corner frame and dot presets to their defaults", async () => {
    const surface = await renderPrototype()
    const cornersButton = getRequiredToolButton(surface.container, "corners")

    await act(async () => {
      cornersButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const squareFrame = getRequiredButton(surface.container, "Use Square corner frame")
    const squareDot = getRequiredButton(surface.container, "Use Square corner dot")

    await act(async () => {
      squareFrame.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      squareDot.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(squareFrame.getAttribute("aria-pressed")).toBe("true")
    expect(squareDot.getAttribute("aria-pressed")).toBe("true")

    const resetButton = getRequiredButton(surface.container, "Reset Corners")

    await act(async () => {
      resetButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(getRequiredButton(surface.container, "Use Extra rounded corner frame").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Use Dot corner dot").getAttribute("aria-pressed")).toBe("true")
    expect(squareFrame.getAttribute("aria-pressed")).toBe("false")
    expect(squareDot.getAttribute("aria-pressed")).toBe("false")
  })

  it("keeps corner frame and dot color controls independent", async () => {
    const surface = await renderPrototype()
    const cornersButton = getRequiredToolButton(surface.container, "corners")

    await act(async () => {
      cornersButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const frameGradient = getRequiredButton(surface.container, "Use gradient corner frame color")
    const dotSolid = getRequiredButton(surface.container, "Use solid corner dot color")

    await act(async () => {
      frameGradient.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(frameGradient.getAttribute("aria-pressed")).toBe("true")
    expect(dotSolid.getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.querySelector('input[aria-label="Frame start color"]')).not.toBeNull()
    expect(surface.container.querySelector('input[aria-label="Dot solid color"]')).not.toBeNull()
  })

  it("resets corner frame and dot colors to their defaults", async () => {
    const surface = await renderPrototype()
    const cornersButton = getRequiredToolButton(surface.container, "corners")

    await act(async () => {
      cornersButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      getRequiredButton(surface.container, "Use gradient corner frame color").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(surface.container, "Use gradient corner dot color").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      getRequiredButton(surface.container, "Reset Corners").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(getRequiredButton(surface.container, "Use solid corner frame color").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Use solid corner dot color").getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.querySelector<HTMLInputElement>('input[aria-label="Frame solid color"]')?.value).toBe("#18181b")
    expect(surface.container.querySelector<HTMLInputElement>('input[aria-label="Dot solid color"]')?.value).toBe("#18181b")
  })

  it("renders a Pixelmator-style shape inspector without placeholder copy", async () => {
    const surface = await renderPrototype()
    const shapeButton = getRequiredToolButton(surface.container, "shape")

    await act(async () => {
      shapeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.getAttribute("aria-label")).toBe("Shape settings")
    expect(inspector?.querySelector('[data-slot="desktop-shape-inspector"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Shape")
    expect(inspector?.textContent).not.toContain("Coming soon")
  })

  it("renders shape options, color controls, preset shelf, and reset action", async () => {
    const surface = await renderPrototype()
    const shapeButton = getRequiredToolButton(surface.container, "shape")

    await act(async () => {
      shapeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.querySelector('[data-slot="desktop-shape-preset-shelf"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-shape-color-mode"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Shape Options")
    expect(inspector?.textContent).toContain("Shape Color")
    expect(inspector?.textContent).toContain("Reset Shape")
  })

  it("selects a shape preset without changing shape color mode", async () => {
    const surface = await renderPrototype()
    const shapeButton = getRequiredToolButton(surface.container, "shape")

    await act(async () => {
      shapeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const circleShape = getRequiredButton(surface.container, "Use Circle shape")
    const solidMode = getRequiredButton(surface.container, "Use solid shape color")

    await act(async () => {
      circleShape.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(circleShape.getAttribute("aria-pressed")).toBe("true")
    expect(solidMode.getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.querySelector('input[aria-label="Shape solid color"]')).not.toBeNull()
  })

  it("switches shape solid and gradient color controls", async () => {
    const surface = await renderPrototype()
    const shapeButton = getRequiredToolButton(surface.container, "shape")

    await act(async () => {
      shapeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const gradientMode = getRequiredButton(surface.container, "Use gradient shape color")

    await act(async () => {
      gradientMode.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(gradientMode.getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.querySelector('input[aria-label="Shape start color"]')).not.toBeNull()
    expect(surface.container.querySelector('input[aria-label="Shape end color"]')).not.toBeNull()
    expect(surface.container.querySelector('input[aria-label="Shape solid color"]')).toBeNull()
  })

  it("updates the shape solid color input", async () => {
    const surface = await renderPrototype()
    const shapeButton = getRequiredToolButton(surface.container, "shape")

    await act(async () => {
      shapeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const solidInput = getRequiredInput(surface.container, "Shape solid color")

    await act(async () => {
      setInputValue(solidInput, "#ff0000")
    })

    expect(getRequiredInput(surface.container, "Shape solid color").value).toBe("#ff0000")
  })

  it("updates the shape gradient color inputs", async () => {
    const surface = await renderPrototype()
    const shapeButton = getRequiredToolButton(surface.container, "shape")

    await act(async () => {
      shapeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      getRequiredButton(surface.container, "Use gradient shape color").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      setInputValue(getRequiredInput(surface.container, "Shape start color"), "#00ff00")
      setInputValue(getRequiredInput(surface.container, "Shape end color"), "#0000ff")
    })

    expect(getRequiredInput(surface.container, "Shape start color").value).toBe("#00ff00")
    expect(getRequiredInput(surface.container, "Shape end color").value).toBe("#0000ff")
  })

  it("resets shape settings to the defaults", async () => {
    const surface = await renderPrototype()
    const shapeButton = getRequiredToolButton(surface.container, "shape")

    await act(async () => {
      shapeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      getRequiredButton(surface.container, "Use Circle shape").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(surface.container, "Use gradient shape color").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      getRequiredButton(surface.container, "Reset Shape").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(getRequiredButton(surface.container, "Use None shape").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Use solid shape color").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredInput(surface.container, "Shape solid color").value).toBe("#f8fafc")
  })

  it("renders a compact Pixelmator-style motion inspector without placeholder copy", async () => {
    const surface = await renderPrototype()
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.getAttribute("aria-label")).toBe("Motion settings")
    expect(inspector?.querySelector('[data-slot="desktop-motion-inspector"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Motion")
    expect(inspector?.textContent).not.toContain("Coming soon")
  })

  it("renders compact motion sections, loader shelf, and reset action", async () => {
    const surface = await renderPrototype()
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.querySelector('[data-slot="desktop-motion-loader-shelf"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Motion")
    expect(inspector?.textContent).toContain("Loader")
    expect(inspector?.textContent).toContain("Timing")
    expect(inspector?.textContent).toContain("Loader Color")
    expect(inspector?.textContent).toContain("Output")
    expect(inspector?.textContent).toContain("Reset Motion")
    expect(inspector?.textContent).not.toContain("Pause")
    expect(inspector?.textContent).not.toContain("Frame")
    expect(inspector?.textContent).not.toContain("Opacity")
  })

  it("toggles dot matrix motion without changing the default loader", async () => {
    const surface = await renderPrototype()
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const motionToggle = getRequiredButton(surface.container, "Dot matrix motion")
    const defaultLoader = getRequiredButton(surface.container, "Use Neon Drift motion loader")

    expect(motionToggle.getAttribute("aria-pressed")).toBe("false")
    expect(defaultLoader.getAttribute("aria-pressed")).toBe("true")

    await act(async () => {
      motionToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(motionToggle.getAttribute("aria-pressed")).toBe("true")
    expect(defaultLoader.getAttribute("aria-pressed")).toBe("true")
  })

  it("selects a motion loader preset", async () => {
    const surface = await renderPrototype()
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const prismSweep = getRequiredButton(surface.container, "Use Prism Sweep motion loader")

    await act(async () => {
      prismSweep.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(prismSweep.getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Use Neon Drift motion loader").getAttribute("aria-pressed")).toBe("false")
  })

  it("updates motion speed and overlay scale sliders", async () => {
    const surface = await renderPrototype()
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      setInputValue(getRequiredInput(surface.container, "Motion speed"), "5")
      setInputValue(getRequiredInput(surface.container, "Motion overlay scale"), "120")
    })

    expect(getRequiredInput(surface.container, "Motion speed").value).toBe("5")
    expect(getRequiredInput(surface.container, "Motion overlay scale").value).toBe("120")
  })

  it("hides custom motion color inputs for non-theme color presets", async () => {
    const surface = await renderPrototype()
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      getRequiredButton(surface.container, "Use Mint motion colors").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(getRequiredButton(surface.container, "Use Mint motion colors").getAttribute("aria-pressed")).toBe("true")
    expect(surface.container.querySelector('input[aria-label="Motion base color"]')).toBeNull()
    expect(surface.container.querySelector('input[aria-label="Motion mid color"]')).toBeNull()
    expect(surface.container.querySelector('input[aria-label="Motion peak color"]')).toBeNull()
  })

  it("shows and updates custom motion theme colors", async () => {
    const surface = await renderPrototype()
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

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
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

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

  it("resets compact motion settings to defaults", async () => {
    const surface = await renderPrototype()
    const motionButton = getRequiredToolButton(surface.container, "motion")

    await act(async () => {
      motionButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      getRequiredButton(surface.container, "Dot matrix motion").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(surface.container, "Use Prism Sweep motion loader").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(surface.container, "Use Mint motion colors").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(surface.container, "Animated SVG export").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      setInputValue(getRequiredInput(surface.container, "Motion speed"), "5")
    })

    await act(async () => {
      getRequiredButton(surface.container, "Reset Motion").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(getRequiredButton(surface.container, "Dot matrix motion").getAttribute("aria-pressed")).toBe(String(DEFAULT_DOT_MATRIX_ANIMATION.enabled))
    expect(getRequiredButton(surface.container, "Use Neon Drift motion loader").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Use Theme motion colors").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredButton(surface.container, "Animated preview").getAttribute("aria-pressed")).toBe(String(DEFAULT_DOT_MATRIX_ANIMATION.animated))
    expect(getRequiredButton(surface.container, "Animated SVG export").getAttribute("aria-pressed")).toBe(String(DEFAULT_DOT_MATRIX_ANIMATION.exportAnimatedSvg))
    expect(getRequiredInput(surface.container, "Motion speed").value).toBe(String(DEFAULT_DOT_MATRIX_ANIMATION.speed))
  })

  it("renders a compact Pixelmator-style text inspector without placeholder copy", async () => {
    const surface = await renderPrototype()
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.getAttribute("aria-label")).toBe("Text settings")
    expect(inspector?.querySelector('[data-slot="desktop-text-inspector"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Text")
    expect(inspector?.textContent).not.toContain("Coming soon")
  })

  it("renders compact text sections and reset action", async () => {
    const surface = await renderPrototype()
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const inspector = surface.container.querySelector(
      '[data-slot="desktop-floating-inspector"]',
    )

    expect(inspector?.querySelector('[data-slot="desktop-text-font-selector"]')).not.toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-text-font-list"]')).toBeNull()
    expect(inspector?.querySelector('[data-slot="desktop-text-alignment"]')).not.toBeNull()
    expect(inspector?.textContent).toContain("Text")
    expect(inspector?.textContent).toContain("Preset")
    expect(inspector?.textContent).toContain("Font")
    expect(inspector?.querySelector('[data-slot="desktop-text-emphasis"]')).not.toBeNull()
    expect(inspector?.textContent).not.toContain("Type")
    expect(inspector?.textContent).toContain("Color")
    expect(inspector?.textContent).toContain("Alignment")
    expect(inspector?.textContent).toContain("Spacing")
    expect(inspector?.textContent).toContain("Reset Text")
  })

  it("updates text content locally", async () => {
    const surface = await renderPrototype()
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const textArea = getRequiredTextarea(surface.container, "Text layer content")

    await act(async () => {
      setTextareaValue(textArea, "Launch label")
    })

    expect(getRequiredTextarea(surface.container, "Text layer content").value).toBe("Launch label")
  })

  it("selects a text font from a compact selector without changing the text content", async () => {
    const surface = await renderPrototype()
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      setTextareaValue(getRequiredTextarea(surface.container, "Text layer content"), "Keep this copy")
    })

    const fontSelect = getRequiredSelect(surface.container, "Text font")

    await act(async () => {
      setSelectValue(fontSelect, "fontshare:general-sans")
    })

    expect(getRequiredSelect(surface.container, "Text font").value).toBe("fontshare:general-sans")
    expect(getRequiredTextarea(surface.container, "Text layer content").value).toBe("Keep this copy")
  })

  it("updates text size and weight controls", async () => {
    const surface = await renderPrototype()
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      setInputValue(getRequiredInput(surface.container, "Text font size"), "64")
      setInputValue(getRequiredInput(surface.container, "Text font weight"), "700")
    })

    expect(getRequiredInput(surface.container, "Text font size").value).toBe("64")
    expect(getRequiredInput(surface.container, "Text font weight").value).toBe("700")
  })

  it("toggles text emphasis controls independently", async () => {
    const surface = await renderPrototype()
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

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
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      setInputValue(getRequiredInput(surface.container, "Text fill color"), "#ff0000")
    })

    expect(getRequiredInput(surface.container, "Text fill color").value).toBe("#ff0000")
  })

  it("updates text alignment selection", async () => {
    const surface = await renderPrototype()
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const left = getRequiredButton(surface.container, "Align text left")
    const center = getRequiredButton(surface.container, "Align text center")
    const right = getRequiredButton(surface.container, "Align text right")

    expect(left.getAttribute("aria-pressed")).toBe("true")

    await act(async () => {
      center.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(left.getAttribute("aria-pressed")).toBe("false")
    expect(center.getAttribute("aria-pressed")).toBe("true")
    expect(right.getAttribute("aria-pressed")).toBe("false")
  })

  it("resets text settings to defaults", async () => {
    const surface = await renderPrototype()
    const textButton = getRequiredToolButton(surface.container, "text")

    await act(async () => {
      textButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      setTextareaValue(getRequiredTextarea(surface.container, "Text layer content"), "Changed")
      setSelectValue(getRequiredSelect(surface.container, "Text font"), "fontshare:general-sans")
      getRequiredButton(surface.container, "Bold text").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(surface.container, "Italic text").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      getRequiredButton(surface.container, "Align text center").dispatchEvent(new MouseEvent("click", { bubbles: true }))
      setInputValue(getRequiredInput(surface.container, "Text font size"), "64")
      setInputValue(getRequiredInput(surface.container, "Text fill color"), "#ff0000")
    })

    await act(async () => {
      getRequiredButton(surface.container, "Reset Text").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(getRequiredTextarea(surface.container, "Text layer content").value).toBe("Add text")
    expect(getRequiredSelect(surface.container, "Text font").value).toBe("local:satoshi")
    expect(getRequiredInput(surface.container, "Text font size").value).toBe("32")
    expect(getRequiredButton(surface.container, "Bold text").getAttribute("aria-pressed")).toBe("false")
    expect(getRequiredButton(surface.container, "Italic text").getAttribute("aria-pressed")).toBe("false")
    expect(getRequiredButton(surface.container, "Align text left").getAttribute("aria-pressed")).toBe("true")
    expect(getRequiredInput(surface.container, "Text fill color").value).toBe("#171717")
  })
})

async function renderPrototype() {
  const container = document.createElement("div")
  document.body.append(container)

  let root: Root | null = null

  await act(async () => {
    root = createRoot(container)
    root.render(<DesktopToolbarPrototype />)
  })

  cleanupCallbacks.push(() => {
    root?.unmount()
    container.remove()
  })

  return { container }
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

function getRequiredSelect(container: HTMLElement, label: string) {
  const select = container.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)

  if (!select) {
    throw new Error(`Missing select: ${label}`)
  }

  return select
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

function setSelectValue(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set
  setter?.call(select, value)
  select.dispatchEvent(new Event("change", { bubbles: true }))
}
