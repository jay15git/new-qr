import {
  DRAFTING_CARD_PATTERN_NONE_ID,
  type DraftingCardPatternColorOverrides,
  type DraftingCardPatternId,
  type DraftingCardPatternSelectionId,
} from "@/components/drafting/drafting-card-patterns"
import {
  createDefaultPaperShaderParams,
  DEFAULT_PAPER_SHADER_ID,
  getPaperShaderDefinition,
  getPaperShaderPreset,
  type PaperShaderId,
  type PaperShaderParams,
} from "@/components/drafting/drafting-paper-shaders"

export type DraftingCardShadowPreset = "none" | "soft" | "medium" | "strong"
export type DraftingCardStyleMode = "pattern" | "image" | "image-filter" | "paper-shader"

export type DraftingCardBorderState = {
  color: string
  opacity: number
  width: number
}

export type DraftingCardShadowState = {
  blur: number
  color: string
  offsetX: number
  offsetY: number
  opacity: number
}

export type DraftingCardImageState = {
  fit: "contain" | "cover"
  opacity: number
  source: "none" | "upload" | "url"
  value?: string
}

export type DraftingCardPaperShaderState = {
  frame: number
  image: {
    source: "none" | "sample" | "upload" | "url"
    value?: string
  }
  params: PaperShaderParams
  paused: boolean
  presetName: string
  shaderId: PaperShaderId
  speed: number
}

export const DEFAULT_DRAFTING_PAPER_SHADER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23f8fafc'/%3E%3Cstop offset='.48' stop-color='%2394a3b8'/%3E%3Cstop offset='1' stop-color='%23111827'/%3E%3C/linearGradient%3E%3CradialGradient id='r' cx='.32' cy='.28' r='.55'%3E%3Cstop stop-color='%23f59e0b' stop-opacity='.95'/%3E%3Cstop offset='.58' stop-color='%23ec4899' stop-opacity='.62'/%3E%3Cstop offset='1' stop-color='%230f172a' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='1200' height='900' fill='url(%23g)'/%3E%3Ccircle cx='360' cy='250' r='310' fill='url(%23r)'/%3E%3Crect x='590' y='170' width='390' height='540' rx='48' fill='%23ffffff' fill-opacity='.28'/%3E%3Cpath d='M145 715 C310 575 410 805 590 635 S865 535 1055 680' fill='none' stroke='%23ffffff' stroke-width='46' stroke-linecap='round' opacity='.7'/%3E%3C/svg%3E"

export type DraftingCardState = {
  border: DraftingCardBorderState
  bottomSpace: number
  cardImage: DraftingCardImageState
  cornerRadius: number
  enabled: boolean
  fill: string
  imageFilter: DraftingCardPaperShaderState
  padding: number
  patternColors: Partial<Record<DraftingCardPatternId, DraftingCardPatternColorOverrides>>
  patternId: DraftingCardPatternSelectionId
  paperShader: DraftingCardPaperShaderState
  shadow: DraftingCardShadowState
  styleMode: DraftingCardStyleMode
}

export const DEFAULT_DRAFTING_CARD_STATE: DraftingCardState = {
  border: {
    color: "#111827",
    opacity: 100,
    width: 0,
  },
  bottomSpace: 128,
  cardImage: {
    fit: "cover",
    opacity: 100,
    source: "none",
    value: undefined,
  },
  cornerRadius: 28,
  enabled: true,
  fill: "#ffd80a",
  imageFilter: createDefaultDraftingCardPaperShader("image-dithering"),
  padding: 24,
  patternColors: {},
  patternId: DRAFTING_CARD_PATTERN_NONE_ID,
  paperShader: createDefaultDraftingCardPaperShader(),
  shadow: {
    blur: 44,
    color: "#1d1606",
    offsetX: 0,
    offsetY: 20,
    opacity: 52,
  },
  styleMode: "pattern",
}

export function cloneDraftingCardState(state: DraftingCardState): DraftingCardState {
  return {
    ...state,
    border: {
      ...DEFAULT_DRAFTING_CARD_STATE.border,
      ...state.border,
    },
    cardImage: { ...state.cardImage },
    imageFilter: cloneDraftingCardPaperShaderState(state.imageFilter),
    paperShader: cloneDraftingCardPaperShaderState(state.paperShader),
    patternColors: Object.fromEntries(
      Object.entries(state.patternColors).map(([patternId, colors]) => [
        patternId,
        { ...colors },
      ]),
    ),
    shadow: normalizeDraftingCardShadow(state.shadow),
  }
}

function normalizeDraftingCardShadow(
  shadow: DraftingCardShadowState | DraftingCardShadowPreset,
): DraftingCardShadowState {
  if (typeof shadow === "string") {
    return getLegacyDraftingCardShadow(shadow)
  }

  return {
    ...DEFAULT_DRAFTING_CARD_STATE.shadow,
    ...shadow,
  }
}

function getLegacyDraftingCardShadow(shadow: DraftingCardShadowPreset): DraftingCardShadowState {
  switch (shadow) {
    case "none":
      return {
        blur: 0,
        color: DEFAULT_DRAFTING_CARD_STATE.shadow.color,
        offsetX: 0,
        offsetY: 0,
        opacity: 0,
      }
    case "soft":
      return {
        blur: 30,
        color: "#1d1606",
        offsetX: 0,
        offsetY: 14,
        opacity: 45,
      }
    case "strong":
      return {
        blur: 54,
        color: "#1d1606",
        offsetX: 0,
        offsetY: 26,
        opacity: 55,
      }
    case "medium":
    default:
      return { ...DEFAULT_DRAFTING_CARD_STATE.shadow }
  }
}

export function createDefaultDraftingCardState() {
  return cloneDraftingCardState(DEFAULT_DRAFTING_CARD_STATE)
}

export function cloneDraftingCardPaperShaderState(
  paperShader: DraftingCardPaperShaderState,
): DraftingCardPaperShaderState {
  return {
    ...paperShader,
    image: { ...paperShader.image },
    params: structuredClone(paperShader.params),
  }
}

export function createDefaultDraftingCardPaperShader(
  shaderId: PaperShaderId = DEFAULT_PAPER_SHADER_ID,
): DraftingCardPaperShaderState {
  const definition = getPaperShaderDefinition(shaderId)
  const preset = getPaperShaderPreset(shaderId)

  return {
    frame: Number(preset.params.frame ?? 0),
    image: definition.requiresImage
      ? {
          source: "sample",
          value: DEFAULT_DRAFTING_PAPER_SHADER_IMAGE,
        }
      : {
          source: "none",
          value: undefined,
        },
    params: createDefaultPaperShaderParams(shaderId),
    paused: false,
    presetName: preset.name,
    shaderId,
    speed: Number(preset.params.speed ?? 0),
  }
}

export function applyDraftingCardPaperShaderPreset(
  state: DraftingCardPaperShaderState,
  presetName: string,
): DraftingCardPaperShaderState {
  const preset = getPaperShaderPreset(state.shaderId, presetName)

  return {
    ...state,
    frame: Number(preset.params.frame ?? state.frame),
    params: structuredClone(preset.params),
    presetName: preset.name,
    speed: Number(preset.params.speed ?? state.speed),
  }
}
