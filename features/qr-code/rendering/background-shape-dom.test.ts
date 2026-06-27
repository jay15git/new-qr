// @vitest-environment jsdom

import { describe, expect, it } from "vitest"

import { createDefaultQrStudioState, setSquareQrSize } from "@/features/qr-code/model/state"
import { buildDraftingQrBackgroundDomModules } from "@/features/qr-code/rendering/background-shape-dom"
import { createDefaultDraftingLayers } from "@/features/workspace/model/layers"
import { createDefaultDraftingCardState } from "@/features/workspace/model/card-state"

describe("background shape dom conversion", () => {
  it("renders decorative shapes as inline svg modules", () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    state.backgroundShapeId = "flower"
    const [layer] = createDefaultDraftingLayers(
      "preview",
      state,
      createDefaultDraftingCardState(),
    ).filter((entry) => entry.kind === "qr")

    const modules = buildDraftingQrBackgroundDomModules(layer, state)

    expect(modules?.shapeId).toBe("flower")
    expect(modules?.nodes).toHaveLength(1)
    expect(modules?.nodes[0]?.kind).toBe("module")
    expect(modules?.nodes[0]?.svgInner).toContain("<svg")
    expect(modules?.nodes[0]?.svgInner).toContain("<path")
    expect(modules?.nodes[0]?.style.clipPath).toBeUndefined()
    expect(modules?.nodes[0]?.style.width).toBeGreaterThan(0)
    expect(modules?.nodes[0]?.style.height).toBeGreaterThan(0)
  })

  it("keeps gradient and stroke attributes in inline svg markup", () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    state.backgroundShapeId = "circle"
    state.backgroundShapeOptions = {
      ...state.backgroundShapeOptions,
      strokeWidth: 6,
      strokeColor: "#ff00aa",
    }
    state.backgroundGradient = {
      ...state.backgroundGradient,
      enabled: true,
    }
    const [layer] = createDefaultDraftingLayers(
      "preview",
      state,
      createDefaultDraftingCardState(),
    ).filter((entry) => entry.kind === "qr")

    const modules = buildDraftingQrBackgroundDomModules(layer, state)
    const svgInner = modules?.nodes[0]?.svgInner ?? ""

    expect(svgInner).toContain("linearGradient")
    expect(svgInner).toContain('stroke-width="6"')
    expect(svgInner).toContain('stroke="#ff00aa"')
  })

  it("keeps decorative shape layout proportional when the qr layer is resized", () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    state.backgroundShapeId = "flower"
    state.backgroundShapeOptions = {
      ...state.backgroundShapeOptions,
      paddingPx: 24,
    }
    const [layer] = createDefaultDraftingLayers(
      "preview",
      state,
      createDefaultDraftingCardState(),
    ).filter((entry) => entry.kind === "qr")

    const fullSize = buildDraftingQrBackgroundDomModules(layer, state)
    const resizeScale = 0.6
    const resizedLayer = {
      ...layer,
      width: Math.round(layer.width * resizeScale),
      height: Math.round(layer.height * resizeScale),
    }
    const resized = buildDraftingQrBackgroundDomModules(resizedLayer, state)

    expect(resized?.layoutWidth).toBeCloseTo((fullSize?.layoutWidth ?? 0) * resizeScale, 0)
    expect(resized?.layoutHeight).toBeCloseTo((fullSize?.layoutHeight ?? 0) * resizeScale, 0)
    expect(resized?.nodes[0]?.svgInner).toContain("<path")
    expect(resized?.nodes[0]?.style.width).toBeLessThan(fullSize?.nodes[0]?.style.width ?? 0)
  })

  it("fits background outer metrics to the layer box at small resize sizes", () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    state.backgroundShapeId = "flower"
    state.backgroundShapeOptions = {
      ...state.backgroundShapeOptions,
      edgeBlur: 10,
      paddingPx: 20,
      shadowOffsetX: -14,
      shadowOffsetY: 18,
      strokeWidth: 8,
    }
    const [layer] = createDefaultDraftingLayers(
      "preview",
      state,
      createDefaultDraftingCardState(),
    ).filter((entry) => entry.kind === "qr")

    for (const size of [100, 50, 30, 24]) {
      const resizedLayer = { ...layer, width: size, height: size }
      const modules = buildDraftingQrBackgroundDomModules(resizedLayer, state)

      expect(modules?.layoutWidth).toBe(size)
      expect(modules?.layoutHeight).toBe(size)
    }
  })

  it("uses rounded rect markup for the default rect backing shape", () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    state.backgroundOptions.round = 0.2
    const [layer] = createDefaultDraftingLayers(
      "preview",
      state,
      createDefaultDraftingCardState(),
    ).filter((entry) => entry.kind === "qr")

    const modules = buildDraftingQrBackgroundDomModules(layer, state)

    expect(modules?.shapeId).toBe("rect")
    expect(modules?.nodes[0]?.svgInner).toContain("<rect")
    expect(modules?.nodes[0]?.svgInner).toMatch(/rx="[^"]+"/)
  })
})
