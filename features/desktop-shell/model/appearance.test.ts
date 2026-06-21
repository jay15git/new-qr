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

  it("maps qr frame shadow blur from edge blur", () => {
    const layer = createDraftingTextLayer(NODE_ID)
    const snapshot = getDesktopAppearanceSnapshot(
      { ...layer, kind: "qr" },
      {
        qrBackgroundShapeOptions: {
          ...DEFAULT_BACKGROUND_SHAPE_OPTIONS,
          edgeBlur: 18,
        },
      },
    )

    expect(snapshot.shadow.blur).toBe(18)
  })

  it("maps qr frame options into a shared appearance snapshot", () => {
    const layer = createDraftingTextLayer(NODE_ID)
    const snapshot = getDesktopAppearanceSnapshot(
      { ...layer, kind: "qr" },
      { qrBackgroundShapeOptions: DEFAULT_BACKGROUND_SHAPE_OPTIONS },
    )

    expect(snapshot.stroke).toBe(DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeColor)
    expect(snapshot.shadow.color).toBe(DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowColor)
    expect(snapshot.supportsStroke).toBe(true)
  })

  it("builds qr and card appearance patches into their domain stores", () => {
    const qrLayer = { ...createDraftingTextLayer(NODE_ID), kind: "qr" as const }
    const qrPatch = buildDesktopAppearancePatch(
      qrLayer,
      {
        shadow: { blur: 12, color: "#000000", offsetX: 4, offsetY: 6, opacity: 40 },
        strokeWidth: 3,
      },
      { qrBackgroundShapeOptions: DEFAULT_BACKGROUND_SHAPE_OPTIONS },
    )

    expect(qrPatch.qrBackgroundShapeOptions?.shadowOffsetX).toBe(4)
    expect(qrPatch.qrBackgroundShapeOptions?.strokeWidth).toBe(3)
    expect(qrPatch.qrBackgroundShapeOptions?.edgeBlur).toBe(12)

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
      { shadow: { blur: 22, color: "#000000", offsetX: 4, offsetY: 6, opacity: 35 } },
      { cardBorder: DEFAULT_DRAFTING_CARD_STATE.border },
    )

    expect(cardShadowPatch.cardShadow?.blur).toBe(22)
    expect(cardShadowPatch.layerPatch.shadow?.blur).toBe(22)
  })
})
