import {
  DRAFTING_CARD_PATTERN_NONE_ID,
  type DraftingCardPatternColorOverrides,
  type DraftingCardPatternId,
  type DraftingCardPatternSelectionId,
} from "@/components/new/drafting-card-patterns"
import {
  createDefaultPaperShaderParams,
  DEFAULT_PAPER_SHADER_ID,
  getPaperShaderDefinition,
  getPaperShaderPreset,
  type PaperShaderId,
  type PaperShaderParams,
} from "@/components/new/drafting-paper-shaders"

export type DraftingCardShadow = "none" | "soft" | "medium" | "strong"
export type DraftingCardStyleMode = "pattern" | "mesh-gradient" | "paper-shader"
export type DraftingCardMeshPaletteId = "mist" | "ember" | "lagoon" | "candy"

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

export type DraftingCardMeshGradientState = {
  adjustColorPosition: boolean
  blur: number
  brightness: number
  colors: string[]
  contrast: number
  grain: number
  hue: number
  paletteId: DraftingCardMeshPaletteId
}

export const DRAFTING_CARD_MESH_PALETTES: Array<{
  id: DraftingCardMeshPaletteId
  label: string
  colors: string[]
}> = [
  {
    id: "mist",
    label: "Mist",
    colors: ["#7288a0", "#8da0a4", "#2d7188", "#d7bfc0"],
  },
  {
    id: "ember",
    label: "Ember",
    colors: ["#7e372b", "#df7655", "#f1bd73", "#493949"],
  },
  {
    id: "lagoon",
    label: "Lagoon",
    colors: ["#0d3b66", "#1b998b", "#e8f1f2", "#f46036"],
  },
  {
    id: "candy",
    label: "Candy",
    colors: ["#6c63ff", "#f72585", "#4cc9f0", "#ffd166"],
  },
]

export const DEFAULT_DRAFTING_CARD_MESH_FILTERS = {
  blur: 0,
  brightness: 100,
  contrast: 105,
  grain: 34,
  hue: 0,
} satisfies Pick<
  DraftingCardMeshGradientState,
  "blur" | "brightness" | "contrast" | "grain" | "hue"
>

export const DEFAULT_DRAFTING_CARD_MESH_PALETTE_ID: DraftingCardMeshPaletteId = "mist"

export type DraftingCardState = {
  bottomSpace: number
  cornerRadius: number
  enabled: boolean
  fill: string
  meshGradient: DraftingCardMeshGradientState
  padding: number
  patternColors: Partial<Record<DraftingCardPatternId, DraftingCardPatternColorOverrides>>
  patternId: DraftingCardPatternSelectionId
  paperShader: DraftingCardPaperShaderState
  shadow: DraftingCardShadow
  styleMode: DraftingCardStyleMode
}

export const DEFAULT_DRAFTING_CARD_STATE: DraftingCardState = {
  bottomSpace: 128,
  cornerRadius: 28,
  enabled: true,
  fill: "#ffd80a",
  meshGradient: createDefaultDraftingCardMeshGradient(),
  padding: 24,
  patternColors: {},
  patternId: DRAFTING_CARD_PATTERN_NONE_ID,
  paperShader: createDefaultDraftingCardPaperShader(),
  shadow: "medium",
  styleMode: "pattern",
}

export function cloneDraftingCardState(state: DraftingCardState): DraftingCardState {
  return {
    ...state,
    meshGradient: {
      ...state.meshGradient,
      colors: [...state.meshGradient.colors],
    },
    paperShader: cloneDraftingCardPaperShaderState(state.paperShader),
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

export function createDefaultDraftingCardMeshGradient(): DraftingCardMeshGradientState {
  const palette = getDraftingCardMeshPaletteById(DEFAULT_DRAFTING_CARD_MESH_PALETTE_ID)

  return {
    ...DEFAULT_DRAFTING_CARD_MESH_FILTERS,
    adjustColorPosition: false,
    colors: [...palette.colors],
    paletteId: palette.id,
  }
}

export function getDraftingCardMeshPaletteById(paletteId: DraftingCardMeshPaletteId) {
  return (
    DRAFTING_CARD_MESH_PALETTES.find((palette) => palette.id === paletteId) ??
    DRAFTING_CARD_MESH_PALETTES[0]
  )
}

export function createRandomDraftingCardMeshColors(random = Math.random) {
  return Array.from({ length: 4 }, () => {
    const hue = Math.round(random() * 360)

    return `hsl(${hue} 62% 54%)`
  })
}

const DRAFTING_CARD_MESH_SVG_SIZE = 500

function escapeSvgAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function getDraftingCardMeshGrainOpacity(grain: number) {
  const normalizedGrain = Math.min(Math.max(grain, 0), 100) / 100

  return normalizedGrain === 0 ? 0 : Number((0.18 + normalizedGrain * 0.34).toFixed(3))
}

function getDraftingCardMeshBlurDeviation(blur: number) {
  const normalizedBlur = Math.min(Math.max(blur, 0), 100) / 100

  return Math.round(24 + normalizedBlur * 40)
}

export function getDraftingCardMeshGradientSvgMarkup(meshGradient: DraftingCardMeshGradientState) {
  const [first = "#7288a0", second = "#8da0a4", third = "#2d7188", fourth = "#d7bfc0"] =
    meshGradient.colors.map(escapeSvgAttribute)
  const blurDeviation = getDraftingCardMeshBlurDeviation(meshGradient.blur)
  const grainOpacity = getDraftingCardMeshGrainOpacity(meshGradient.grain)
  const grainMarkup =
    grainOpacity > 0
      ? `<filter id="mesh-noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="4" seed="11" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`
      : ""
  const grainOverlay =
    grainOpacity > 0
      ? `<rect width="500" height="500" filter="url(#mesh-noise)" opacity="${grainOpacity}" style="mix-blend-mode:overlay"/>`
      : ""

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${DRAFTING_CARD_MESH_SVG_SIZE}" height="${DRAFTING_CARD_MESH_SVG_SIZE}" viewBox="0 0 ${DRAFTING_CARD_MESH_SVG_SIZE} ${DRAFTING_CARD_MESH_SVG_SIZE}">`,
    "<defs>",
    `<filter id="mesh-blur" filterUnits="userSpaceOnUse" x="-120" y="-120" width="740" height="740"><feGaussianBlur stdDeviation="${blurDeviation}"/></filter>`,
    grainMarkup,
    "</defs>",
    `<rect width="500" height="500" fill="${first}"/>`,
    `<g filter="url(#mesh-blur)">`,
    `<rect x="-90" y="-30" width="560" height="610" fill="${first}"/>`,
    `<rect x="-125" y="-80" width="610" height="340" fill="${second}"/>`,
    `<rect x="-175" y="170" width="440" height="500" fill="${third}"/>`,
    `<rect x="220" y="-190" width="520" height="590" fill="${fourth}"/>`,
    `<circle cx="365" cy="385" r="230" fill="${second}"/>`,
    "</g>",
    grainOverlay,
    "</svg>",
  ].join("")
}

function getDraftingCardMeshGradientDataUri(meshGradient: DraftingCardMeshGradientState) {
  return `url("data:image/svg+xml,${encodeURIComponent(getDraftingCardMeshGradientSvgMarkup(meshGradient))}")`
}

export function getDraftingCardMeshGradientStyle(meshGradient: DraftingCardMeshGradientState) {
  const [first = "#7288a0"] = meshGradient.colors

  return {
    backgroundColor: first,
    backgroundBlendMode: "normal",
    backgroundImage: getDraftingCardMeshGradientDataUri(meshGradient),
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    filter: [
      `contrast(${meshGradient.contrast}%)`,
      `brightness(${meshGradient.brightness}%)`,
      `hue-rotate(${meshGradient.hue}deg)`,
    ].join(" "),
  }
}
