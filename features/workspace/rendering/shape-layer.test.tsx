// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { createDraftingShapeLayer, patchDraftingCanvasLayer } from "@/features/workspace/model/layers"
import { DraftingShapeLayerContent } from "@/features/workspace/rendering/shape-layer"

describe("DraftingShapeLayerContent", () => {
  it("renders decorative shapes from shapeId without a solid square backdrop", () => {
    const layer = createDraftingShapeLayer("preview", "flower")
    const markup = renderToStaticMarkup(<DraftingShapeLayerContent layer={layer} />)

    expect(layer.shapeId).toBe("flower")
    expect(markup).toContain('viewBox="0 0 320 280"')
    expect(markup).toContain('fill="#E8E8E8"')
    expect(markup).toContain('style="background-color:transparent"')
  })

  it("preserves shapeId through insert normalization", () => {
    const inserted = patchDraftingCanvasLayer(
      {
        ...createDraftingShapeLayer("preview", "hexagon"),
        id: "preview:shape:123",
        zIndex: 4,
      },
      {},
    )

    expect(inserted.shapeId).toBe("hexagon")
  })

  it("creates visible stroke primitives for line and arrow", () => {
    const line = createDraftingShapeLayer("preview", "line")
    const arrow = createDraftingShapeLayer("preview", "arrow")

    expect(line).toMatchObject({
      fillMode: "none",
      shapeId: "line",
      strokeWidth: 4,
    })
    expect(arrow).toMatchObject({
      fillMode: "none",
      shapeId: "arrow",
      strokeWidth: 4,
    })
  })
})
