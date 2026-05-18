import {
  DRAFTING_CARD_PATTERN_NONE_ID,
  type DraftingCardPatternColorOverrides,
  type DraftingCardPatternId,
  type DraftingCardPatternSelectionId,
} from "@/components/new/drafting-card-patterns"

export type DraftingCardShadow = "none" | "soft" | "medium" | "strong"

export type DraftingCardState = {
  bottomSpace: number
  cornerRadius: number
  enabled: boolean
  fill: string
  padding: number
  patternColors: Partial<Record<DraftingCardPatternId, DraftingCardPatternColorOverrides>>
  patternId: DraftingCardPatternSelectionId
  shadow: DraftingCardShadow
}

export const DEFAULT_DRAFTING_CARD_STATE: DraftingCardState = {
  bottomSpace: 128,
  cornerRadius: 28,
  enabled: true,
  fill: "#ffd80a",
  padding: 24,
  patternColors: {},
  patternId: DRAFTING_CARD_PATTERN_NONE_ID,
  shadow: "medium",
}

export function cloneDraftingCardState(state: DraftingCardState): DraftingCardState {
  return {
    ...state,
    patternColors: Object.fromEntries(
      Object.entries(state.patternColors).map(([patternId, colors]) => [
        patternId,
        { ...colors },
      ]),
    ),
  }
}

export function createDefaultDraftingCardState() {
  return cloneDraftingCardState(DEFAULT_DRAFTING_CARD_STATE)
}
