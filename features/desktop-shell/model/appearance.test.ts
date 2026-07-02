import { describe, expect, it } from "vitest"

import {
  buildDesktopAppearancePatch,
  getDesktopAppearanceSnapshot,
} from "@/features/desktop-shell/model/appearance"
import { DEFAULT_BACKGROUND_SHAPE_OPTIONS } from "@/features/qr-code/model/state"
import { DEFAULT_DRAFTING_CARD_STATE } from "@/features/workspace/model/card-state"
import {
  createDraftingShapeLayer,
  createDraftingTextLayer,
} from "@/features/workspace/model/layers"

const NODE_ID = "node-1"

describe("desktop appearance model", () => {
  it("maps card border state into a shared appearance snapshot", () => {
    const layer = createDraftingShapeLayer(NODE_ID)
    const snapshot = getDesktopAppearanceSnapshot(
      { ...layer, kind: "card" },
      {
        cardBorder: DEFAULT_DRAFTING_CARD_STATE.border,
        cardCornerRadius: DEFAULT_DRAFTING_CARD_STATE.cornerRadius,
      },
    )

    expect(snapshot.stroke).toBe(DEFAULT_DRAFTING_CARD_STATE.border.color)
    expect(snapshot.strokeWidth).toBe(DEFAULT_DRAFTING_CARD_STATE.border.width)
    expect(snapshot.supportsStroke).toBe(true)
    expect(snapshot.supportsCornerRadius).toBe(true)
    expect(snapshot.usesBorderSemantics).toBe(true)
  })

  it("reads qr layer shadow from the layer model", () => {
    const layer = {
      ...createDraftingTextLayer(NODE_ID),
      kind: "qr" as const,
      shadow: {
        blur: 18,
        color: "#000000",
        inset: false,
        kind: "drop" as const,
        offsetX: 4,
        offsetY: 6,
        opacity: 40,
        spread: 0,
        visible: true,
      },
    }
    const snapshot = getDesktopAppearanceSnapshot(layer, {
      qrBackgroundShapeOptions: DEFAULT_BACKGROUND_SHAPE_OPTIONS,
    })

    expect(snapshot.shadow.blur).toBe(18)
    expect(snapshot.shadow.offsetX).toBe(4)
  })

  it("maps qr frame options into a shared appearance snapshot", () => {
    const layer = createDraftingTextLayer(NODE_ID)
    const snapshot = getDesktopAppearanceSnapshot(
      { ...layer, kind: "qr" },
      { qrBackgroundShapeOptions: DEFAULT_BACKGROUND_SHAPE_OPTIONS },
    )

    expect(snapshot.stroke).toBe(DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeColor)
    expect(snapshot.shadow.color).toBe(layer.shadow.color)
    expect(snapshot.supportsStroke).toBe(true)
  })

  it("builds qr and card appearance patches into their domain stores", () => {
    const qrLayer = { ...createDraftingTextLayer(NODE_ID), kind: "qr" as const }
    const qrPatch = buildDesktopAppearancePatch(
      qrLayer,
      {
        shadow: {
          blur: 12,
          color: "#000000",
          inset: false,
          kind: "drop",
          offsetX: 4,
          offsetY: 6,
          opacity: 40,
          spread: 0,
          visible: true,
        },
        strokeWidth: 3,
      },
      { qrBackgroundShapeOptions: DEFAULT_BACKGROUND_SHAPE_OPTIONS },
    )

    expect(qrPatch.qrBackgroundShapeOptions?.shadowOffsetX).toBeUndefined()
    expect(qrPatch.qrBackgroundShapeOptions?.edgeBlur).toBeUndefined()
    expect(qrPatch.layerPatch.shadow?.blur).toBe(12)
    expect(qrPatch.qrBackgroundShapeOptions?.strokeWidth).toBe(3)

    const cardLayer = { ...createDraftingShapeLayer(NODE_ID), kind: "card" as const }
    const cardPatch = buildDesktopAppearancePatch(
      cardLayer,
      { stroke: "#ff00ff", strokeWidth: 8, cornerRadius: 24 },
      { cardBorder: DEFAULT_DRAFTING_CARD_STATE.border },
    )

    expect(cardPatch.cardBorder?.color).toBe("#ff00ff")
    expect(cardPatch.cardBorder?.width).toBe(8)
    expect(cardPatch.cardCornerRadius).toBe(24)

    const cardShadowPatch = buildDesktopAppearancePatch(
      cardLayer,
      { shadow: {
          blur: 22,
          color: "#000000",
          inset: false,
          kind: "drop",
          offsetX: 4,
          offsetY: 6,
          opacity: 35,
          spread: 0,
          visible: true,
        } },
      { cardBorder: DEFAULT_DRAFTING_CARD_STATE.border },
    )

    expect(cardShadowPatch.cardShadow?.blur).toBe(22)
    expect(cardShadowPatch.layerPatch.shadow?.blur).toBe(22)
  })
})
