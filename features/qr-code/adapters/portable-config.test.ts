import { describe, expect, it } from "vitest"

import { toPortableQrConfig } from "@/features/qr-code/adapters/portable-config"
import { createDefaultQrStudioState } from "@/features/qr-code/model/state"

describe("toPortableQrConfig", () => {
  it("maps default studio state to readable portable props", () => {
    const state = createDefaultQrStudioState()

    expect(toPortableQrConfig(state)).toEqual({
      background: "#f8fafc",
      colorMode: "solid",
      finderInner: "circle",
      finderOuter: "rounded-lg",
      foreground: "#111827",
      gradient: "none",
      margin: 12,
      module: "rounded",
      motion: "none",
      palette: ["#04879c", "#0c3c78", "#090030", "#f30a49"],
      size: 320,
      value: "https://new-qr-studio.local/launch",
    })
  })

  it("uses a transparent qr background when a decorative shape is active", () => {
    const state = createDefaultQrStudioState()
    state.backgroundShapeId = "flower"

    expect(toPortableQrConfig(state).background).toBe("transparent")
  })

  it("maps diamond module and rounded finder styles", () => {
    const state = createDefaultQrStudioState()
    state.dataModulesSettings.type = "diamond"
    state.finderPatternInnerSettings.type = "rounded"
    state.finderPatternOuterSettings.type = "rounded-lg"

    const config = toPortableQrConfig(state)

    expect(config.module).toBe("diamond")
    expect(config.finderInner).toBe("rounded")
    expect(config.finderOuter).toBe("rounded-lg")
  })

  it("maps gradient and motion presets", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "gradient"
    state.dataModulesGradient.enabled = true
    state.dataModulesGradient.type = "linear"
    state.dataModulesGradient.rotation = 45
    state.dataModulesGradient.colorStops = [
      { offset: 0, color: "#111111" },
      { offset: 1, color: "#999999" },
    ]
    state.dotMatrixAnimation.enabled = true
    state.dotMatrixAnimation.animated = true
    state.dotMatrixAnimation.presetCategory = "standard"
    state.dotMatrixAnimation.preset = "FadeInTopDown"

    const config = toPortableQrConfig(state)

    expect(config.colorMode).toBe("gradient")
    expect(config.gradient).toEqual({
      rotation: 45,
      stops: [
        { color: "#111111", offset: 0 },
        { color: "#999999", offset: 1 },
      ],
      type: "linear",
    })
    expect(config.motion).toBe("bitjson")
    expect(config.motionPreset).toBe("FadeInTopDown")
  })
})
