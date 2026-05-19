import { describe, expect, it } from "vitest"

import {
  applyDraftingCardPaperShaderPreset,
  cloneDraftingCardState,
  createDefaultDraftingCardPaperShader,
  createDefaultDraftingCardState,
} from "@/components/new/drafting-card-state"

describe("drafting card state", () => {
  it("starts with a paper shader state beside existing card styles", () => {
    const state = createDefaultDraftingCardState()

    expect(state.styleMode).toBe("pattern")
    expect(state.paperShader.shaderId).toBe("mesh-gradient")
    expect(state.paperShader.presetName).toBe("Default")
    expect(state.paperShader.params.colors).toEqual([
      "#e0eaff",
      "#241d9a",
      "#f75092",
      "#9f50d3",
    ])
    expect(state.paperShader.speed).toBe(1)
    expect(state.paperShader.frame).toBe(0)
    expect(state.paperShader.paused).toBe(false)
  })

  it("deep clones paper shader params with the rest of the card state", () => {
    const state = createDefaultDraftingCardState()
    const clone = cloneDraftingCardState(state)

    expect(clone).toEqual(state)
    expect(clone).not.toBe(state)
    expect(clone.paperShader).not.toBe(state.paperShader)
    expect(clone.paperShader.params).not.toBe(state.paperShader.params)

    const cloneColors = clone.paperShader.params.colors as string[]
    cloneColors[0] = "#000000"

    expect((state.paperShader.params.colors as string[])[0]).toBe("#e0eaff")
  })

  it("creates defaults for another shader and applies presets", () => {
    const paperShader = createDefaultDraftingCardPaperShader("warp")

    expect(paperShader.shaderId).toBe("warp")
    expect(paperShader.presetName).toBe("Default")

    const liveInk = applyDraftingCardPaperShaderPreset(paperShader, "Live Ink")

    expect(liveInk.shaderId).toBe("warp")
    expect(liveInk.presetName).toBe("Live Ink")
    expect(liveInk.params).not.toBe(paperShader.params)
    expect(liveInk.speed).toBe(Number(liveInk.params.speed ?? 0))
  })

  it("starts image-filter shaders with a sample image source", () => {
    const paperShader = createDefaultDraftingCardPaperShader("image-dithering")

    expect(paperShader.shaderId).toBe("image-dithering")
    expect(paperShader.image.source).toBe("sample")
    expect(paperShader.image.value).toContain("data:image/svg+xml")
  })
})
