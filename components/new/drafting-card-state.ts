export type DraftingCardShadow = "none" | "soft" | "medium" | "strong"

export type DraftingCardState = {
  bottomSpace: number
  cornerRadius: number
  enabled: boolean
  fill: string
  padding: number
  shadow: DraftingCardShadow
}

export const DEFAULT_DRAFTING_CARD_STATE: DraftingCardState = {
  bottomSpace: 128,
  cornerRadius: 28,
  enabled: true,
  fill: "#ffd80a",
  padding: 24,
  shadow: "medium",
}

export function cloneDraftingCardState(state: DraftingCardState): DraftingCardState {
  return { ...state }
}

export function createDefaultDraftingCardState() {
  return cloneDraftingCardState(DEFAULT_DRAFTING_CARD_STATE)
}
