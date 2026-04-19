import { describe, expect, it } from "vitest"

import {
  applyAssetNoneSelection,
  applyAssetUrlValue,
  applyBackgroundGradient,
  applyBackgroundSolidColor,
  applyBackgroundTransparentSelection,
  applyCornerGradient,
  applyCornerSolidColor,
  applyDotsGradient,
  applyDotsPaletteSelection,
  applyDotsSolidColor,
  applyLogoPresetColor,
  applyLogoPresetSelection,
  createDashboardAccordionOpenItemIds,
  ensureDashboardAccordionItemExpanded,
} from "@/components/qr/qr-control-sections"
import { getBrandIconById } from "@/components/qr/brand-icon-catalog"
import { createBrandIconDataUrl } from "@/components/qr/brand-icon-svg"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

describe("dashboard settings state helpers", () => {
  it("initializes dashboard accordions with the selected item expanded", () => {
    expect(createDashboardAccordionOpenItemIds("solid")).toEqual(["solid"])
  })

  it("ensures newly selected items are expanded without closing siblings", () => {
    expect(
      ensureDashboardAccordionItemExpanded(["solid"], "gradient"),
    ).toEqual(["solid", "gradient"])
  })

  it("applies solid dots editing without changing other fields", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "gradient"

    const nextState = applyDotsSolidColor(state, "#ff0000")

    expect(nextState.dotsColorMode).toBe("solid")
    expect(nextState.dotsOptions.color).toBe("#ff0000")
    expect(nextState.dotsGradient).toEqual(state.dotsGradient)
  })

  it("applies gradient dots editing without selecting on panel open alone", () => {
    const state = createDefaultQrStudioState()

    const nextState = applyDotsGradient(state, {
      ...state.dotsGradient,
      colorStops: [
        { offset: 0, color: "#111111" },
        { offset: 1, color: "#eeeeee" },
      ],
    })

    expect(state.dotsColorMode).toBe("solid")
    expect(nextState.dotsColorMode).toBe("gradient")
    expect(nextState.dotsGradient.colorStops[0].color).toBe("#111111")
  })

  it("applies explicit palette selection without mutating the palette", () => {
    const state = createDefaultQrStudioState()

    const nextState = applyDotsPaletteSelection(state)

    expect(nextState.dotsColorMode).toBe("palette")
    expect(nextState.dotsPalette).toEqual(state.dotsPalette)
  })

  it("applies solid corner edits by disabling the matching gradient", () => {
    const state = createDefaultQrStudioState()
    state.cornersSquareGradient.enabled = true

    const nextState = applyCornerSolidColor(state, "cornersSquare", "#00ff00")

    expect(nextState.cornersSquareOptions.color).toBe("#00ff00")
    expect(nextState.cornersSquareGradient.enabled).toBe(false)
  })

  it("applies gradient corner edits by enabling the matching gradient", () => {
    const state = createDefaultQrStudioState()

    const nextState = applyCornerGradient(state, "cornersDot", {
      ...state.cornersDotGradient,
      enabled: false,
      colorStops: [
        { offset: 0, color: "#222222" },
        { offset: 1, color: "#dddddd" },
      ],
    })

    expect(nextState.cornersDotGradient.enabled).toBe(true)
    expect(nextState.cornersDotGradient.colorStops[1].color).toBe("#dddddd")
  })

  it("applies solid background edits by clearing transparency and gradient mode", () => {
    const state = createDefaultQrStudioState()
    state.backgroundOptions.transparent = true
    state.backgroundGradient.enabled = true

    const nextState = applyBackgroundSolidColor(state, "#fafafa")

    expect(nextState.backgroundOptions.color).toBe("#fafafa")
    expect(nextState.backgroundOptions.transparent).toBe(false)
    expect(nextState.backgroundGradient.enabled).toBe(false)
  })

  it("applies background gradient edits by clearing transparency", () => {
    const state = createDefaultQrStudioState()
    state.backgroundOptions.transparent = true

    const nextState = applyBackgroundGradient(state, {
      ...state.backgroundGradient,
      enabled: false,
    })

    expect(nextState.backgroundGradient.enabled).toBe(true)
    expect(nextState.backgroundOptions.transparent).toBe(false)
  })

  it("applies transparent background selection immediately", () => {
    const state = createDefaultQrStudioState()
    state.backgroundGradient.enabled = true

    const nextState = applyBackgroundTransparentSelection(state)

    expect(nextState.backgroundOptions.transparent).toBe(true)
    expect(nextState.backgroundGradient.enabled).toBe(false)
  })

  it("applies remote asset URL editing as the selected source", () => {
    const state = createDefaultQrStudioState()

    const nextState = applyAssetUrlValue(
      state,
      "backgroundImage",
      "https://example.com/background.png",
    )

    expect(nextState.backgroundImage.source).toBe("url")
    expect(nextState.backgroundImage.value).toBe(
      "https://example.com/background.png",
    )
  })

  it("applies none selection immediately for empty asset items", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "url",
      value: "https://example.com/logo.png",
    }

    const nextState = applyAssetNoneSelection(state, "logo")

    expect(nextState.logo).toEqual({
      source: "none",
      value: undefined,
      presetId: undefined,
      presetColor: undefined,
    })
  })

  it("applies preset logo selection with serialized svg data", () => {
    const state = createDefaultQrStudioState()
    const brandIcon = getBrandIconById("whatsapp")

    const nextState = applyLogoPresetSelection(
      state,
      brandIcon,
      createBrandIconDataUrl(brandIcon, "#111827"),
      "#111827",
    )

    expect(nextState.logo.source).toBe("preset")
    expect(nextState.logo.presetId).toBe("whatsapp")
    expect(nextState.logo.presetColor).toBe("#111827")
    expect(nextState.logo.value).toContain("data:image/svg+xml")
  })

  it("updates preset logo color while preserving the selected brand", () => {
    const state = createDefaultQrStudioState()
    const brandIcon = getBrandIconById("github")
    const selectedState = applyLogoPresetSelection(
      state,
      brandIcon,
      createBrandIconDataUrl(brandIcon, "#111827"),
      "#111827",
    )

    const nextState = applyLogoPresetColor(
      selectedState,
      createBrandIconDataUrl(brandIcon, "#ff4f00"),
      "#ff4f00",
    )

    expect(nextState.logo.source).toBe("preset")
    expect(nextState.logo.presetId).toBe("github")
    expect(nextState.logo.presetColor).toBe("#ff4f00")
    expect(nextState.logo.value).toContain("ff4f00")
  })
})
