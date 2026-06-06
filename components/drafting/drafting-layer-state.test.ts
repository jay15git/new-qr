import { describe, expect, it } from "vitest"

import {
  alignDraftingCanvasLayers,
  cloneDraftingCanvasLayersForPaste,
  createDraftingTextLayer,
  DEFAULT_DRAFTING_TEXT_LAYER,
  distributeDraftingCanvasLayers,
  getDraftingMarqueeSelection,
  groupDraftingCanvasLayers,
  normalizeDraftingCanvasLayers,
  reorderDraftingCanvasLayer,
  ungroupDraftingCanvasLayer,
  type DraftingCanvasLayer,
} from "@/components/drafting/drafting-layer-state"
import { createDefaultDraftingCardState } from "@/components/drafting/drafting-card-state"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

describe("drafting layer state actions", () => {
  it("moves a layer through the z-index stack", () => {
    const layers = [
      createLayer("card", 0),
      createLayer("qr", 1),
      createLayer("badge", 2),
    ]

    expect(reorderDraftingCanvasLayer(layers, "card", "front").map((layer) => layer.id)).toEqual([
      "qr",
      "badge",
      "card",
    ])
    expect(reorderDraftingCanvasLayer(layers, "badge", "backward").map((layer) => layer.id)).toEqual([
      "card",
      "badge",
      "qr",
    ])
  })

  it("aligns selected layers to their combined bounds", () => {
    const layers = [
      createLayer("card", 0, { height: 100, width: 100, x: 10, y: 20 }),
      createLayer("qr", 1, { height: 30, width: 30, x: 70, y: 80 }),
    ]

    expect(alignDraftingCanvasLayers(layers, ["card", "qr"], "center-x")).toMatchObject([
      { id: "card", x: 10 },
      { id: "qr", x: 45 },
    ])
    expect(alignDraftingCanvasLayers(layers, ["card", "qr"], "bottom")).toMatchObject([
      { id: "card", y: 20 },
      { id: "qr", y: 90 },
    ])
  })

  it("distributes selected layers across the first and last layer centers", () => {
    const layers = [
      createLayer("a", 0, { width: 10, x: 0 }),
      createLayer("b", 1, { width: 10, x: 70 }),
      createLayer("c", 2, { width: 10, x: 40 }),
    ]

    expect(distributeDraftingCanvasLayers(layers, ["a", "b", "c"], "horizontal")).toMatchObject([
      { id: "a", x: 0 },
      { id: "b", x: 40 },
      { id: "c", x: 80 },
    ])
  })

  it("clones pasted layers with fresh ids and places them above the current stack", () => {
    const layers = [
      createLayer("card", 0),
      createLayer("qr", 1, { x: 20, y: 30 }),
    ]

    const pasted = cloneDraftingCanvasLayersForPaste({
      layers,
      nodeId: "preview",
      offset: { x: 24, y: 24 },
      startingZIndex: 2,
    })

    expect(pasted).toHaveLength(2)
    expect(pasted.map((layer) => layer.id)).not.toEqual(["card", "qr"])
    expect(pasted).toMatchObject([
      { nodeId: "preview", x: 24, y: 24, zIndex: 2 },
      { nodeId: "preview", x: 44, y: 54, zIndex: 3 },
    ])
  })

  it("groups and ungroups layers without losing their visual geometry", () => {
    const layers = [
      createLayer("card", 0, { height: 100, width: 100, x: 10, y: 20 }),
      createLayer("qr", 1, { height: 40, width: 40, x: 40, y: 50 }),
    ]

    const grouped = groupDraftingCanvasLayers(layers, ["card", "qr"], {
      groupId: "group-1",
      name: "Group 1",
    })

    expect(grouped).toHaveLength(1)
    expect(grouped[0]).toMatchObject({
      height: 100,
      id: "group-1",
      kind: "group",
      width: 100,
      x: 10,
      y: 20,
    })
    expect(grouped[0]?.children).toMatchObject([
      { id: "card", x: 0, y: 0 },
      { id: "qr", x: 30, y: 30 },
    ])

    expect(ungroupDraftingCanvasLayer(grouped, "group-1")).toMatchObject([
      { id: "card", x: 10, y: 20 },
      { id: "qr", x: 40, y: 50 },
    ])
  })

  it("selects visible unlocked layers intersecting a marquee box", () => {
    const layers = [
      createLayer("card", 0, { height: 100, width: 100, x: 0, y: 0 }),
      createLayer("qr", 1, { height: 50, isLocked: true, width: 50, x: 120, y: 120 }),
      createLayer("hidden", 2, { height: 50, isVisible: false, width: 50, x: 20, y: 20 }),
      createLayer("badge", 3, { height: 40, width: 40, x: 180, y: 20 }),
    ]

    expect(
      getDraftingMarqueeSelection(layers, {
        height: 130,
        width: 130,
        x: -10,
        y: -10,
      }),
    ).toEqual(["card"])
  })

  it("creates and normalizes Avnac-style text layers", () => {
    const textLayer = createDraftingTextLayer("preview", {
      fill: "#ff00aa",
      fontFamily: "General Sans",
      fontId: "fontshare:general-sans",
      fontSize: 44,
      fontStyle: "italic",
      fontWeight: "bold",
      letterSpacing: 3,
      lineHeight: 1.4,
      text: "Scan me",
      textAlign: "center",
      underline: true,
      x: 12,
      y: 18,
    })

    expect(textLayer).toMatchObject({
      fill: "#ff00aa",
      fontFamily: "General Sans",
      fontId: "fontshare:general-sans",
      fontSize: 44,
      fontStyle: "italic",
      fontWeight: "bold",
      height: 48,
      kind: "text",
      letterSpacing: 3,
      lineHeight: 1.4,
      name: "Text",
      text: "Scan me",
      textAlign: "center",
      underline: true,
      width: 240,
      x: 12,
      y: 18,
    })
  })

  it("falls invalid text layer values back to simple defaults", () => {
    const normalized = normalizeDraftingCanvasLayers(
      "preview",
      [
        createLayer("card", 0),
        createLayer("qr", 1),
        {
          fill: "red",
          fontFamily: "",
          fontSize: 999,
          fontStyle: "oblique",
          fontWeight: "heavy",
          height: 30,
          id: "text-1",
          isLocked: false,
          isVisible: true,
          kind: "text",
          letterSpacing: 500,
          lineHeight: 99,
          name: "",
          nodeId: "other",
          opacity: 2,
          rotation: 0,
          shadow: {},
          textAlign: "justify",
          underline: "yes",
          width: 120,
          x: 0,
          y: 0,
          zIndex: 2,
        },
      ],
      createDefaultQrStudioState(),
      createDefaultDraftingCardState(),
    )

    expect(normalized.at(-1)).toMatchObject({
      fill: DEFAULT_DRAFTING_TEXT_LAYER.fill,
      fontFamily: DEFAULT_DRAFTING_TEXT_LAYER.fontFamily,
      fontId: DEFAULT_DRAFTING_TEXT_LAYER.fontId,
      fontSize: 300,
      fontStyle: "normal",
      fontWeight: DEFAULT_DRAFTING_TEXT_LAYER.fontWeight,
      kind: "text",
      letterSpacing: 200,
      lineHeight: 4,
      name: "Text",
      opacity: 1,
      text: DEFAULT_DRAFTING_TEXT_LAYER.text,
      textAlign: DEFAULT_DRAFTING_TEXT_LAYER.textAlign,
      underline: false,
    })
  })

  it("preserves legacy text font families without a registry font id", () => {
    const normalized = normalizeDraftingCanvasLayers(
      "preview",
      [
        createLayer("card", 0),
        createLayer("qr", 1),
        {
          ...createDraftingTextLayer("preview", {
            fontFamily: "Legacy Brand Font",
            fontId: undefined,
            id: "text-legacy",
            zIndex: 2,
          }),
          fontId: undefined,
        },
      ],
      createDefaultQrStudioState(),
      createDefaultDraftingCardState(),
    )

    expect(normalized.at(-1)).toMatchObject({
      fontFamily: "Legacy Brand Font",
      kind: "text",
    })
    expect(normalized.at(-1)?.fontId).toBeUndefined()
  })

  it("preserves valid legacy text runs during normalization", () => {
    const normalized = normalizeDraftingCanvasLayers(
      "preview",
      [
        createLayer("card", 0),
        createLayer("qr", 1),
        {
          ...createDraftingTextLayer("preview", {
            id: "text-legacy-runs",
            text: "Scan here",
            textRuns: [
              { fontWeight: 700, text: "Scan" },
              { fontStyle: "italic", text: " here" },
            ],
            zIndex: 2,
          }),
        },
      ],
      createDefaultQrStudioState(),
      createDefaultDraftingCardState(),
    )

    expect(normalized.at(-1)?.textRuns).toEqual([
      { fontWeight: 700, text: "Scan" },
      { fontStyle: "italic", text: " here" },
    ])
  })

  it("preserves text fields through copy, paste, group, and ungroup", () => {
    const textLayer = createDraftingTextLayer("preview", {
      fill: "#123456",
      id: "text-1",
      text: "Table 7",
      zIndex: 2,
    })
    const pasted = cloneDraftingCanvasLayersForPaste({
      layers: [textLayer],
      nodeId: "preview-2",
      offset: { x: 10, y: 12 },
      startingZIndex: 3,
    })

    expect(pasted[0]).toMatchObject({
      fill: "#123456",
      kind: "text",
      nodeId: "preview-2",
      text: "Table 7",
      x: textLayer.x + 10,
      y: textLayer.y + 12,
      zIndex: 3,
    })

    const grouped = groupDraftingCanvasLayers([createLayer("card", 0), textLayer], ["card", "text-1"], {
      groupId: "group-1",
      name: "Group",
    })
    const restored = ungroupDraftingCanvasLayer(grouped, "group-1")

    expect(restored.find((layer) => layer.kind === "text")).toMatchObject({
      fill: "#123456",
      text: "Table 7",
    })
  })
})

function createLayer(
  id: string,
  zIndex: number,
  overrides: Partial<DraftingCanvasLayer> = {},
): DraftingCanvasLayer {
  return {
    blur: 0,
    height: 40,
    id,
    isLocked: false,
    isVisible: true,
    kind: id === "card" ? "card" : "qr",
    name: id,
    nodeId: "preview",
    opacity: 1,
    rotation: 0,
    shadow: {
      blur: 0,
      color: "#111827",
      offsetX: 0,
      offsetY: 0,
      opacity: 0,
    },
    width: 40,
    x: 0,
    y: 0,
    zIndex,
    ...overrides,
  }
}
