import type {
  DraftingCardShadowState,
  DraftingCardState,
} from "@/components/new/drafting-card-state"
import { getQrRenderedDimensions } from "@/components/qr/qr-rendering"
import type { QrStudioState } from "@/components/qr/qr-studio-state"

export type DraftingCanvasLayerKind = "card" | "qr"

export type DraftingCanvasLayer = {
  blur: number
  height: number
  id: string
  isLocked: boolean
  isVisible: boolean
  kind: DraftingCanvasLayerKind
  name: string
  nodeId: string
  opacity: number
  rotation: number
  shadow: DraftingCardShadowState
  width: number
  x: number
  y: number
  zIndex: number
}

export type DraftingLayerStateByNodeId = Record<string, DraftingCanvasLayer[]>

export const DRAFTING_CARD_LAYER_SUFFIX = ":card"
export const DRAFTING_QR_LAYER_SUFFIX = ":qr"

const DEFAULT_LAYER_SHADOW: DraftingCardShadowState = {
  blur: 0,
  color: "#111827",
  offsetX: 0,
  offsetY: 0,
  opacity: 0,
}

export function getDraftingCardLayerId(nodeId: string) {
  return `${nodeId}${DRAFTING_CARD_LAYER_SUFFIX}`
}

export function getDraftingQrLayerId(nodeId: string) {
  return `${nodeId}${DRAFTING_QR_LAYER_SUFFIX}`
}

export function isDraftingCardLayerId(layerId: string | null | undefined) {
  return Boolean(layerId?.endsWith(DRAFTING_CARD_LAYER_SUFFIX))
}

export function isDraftingQrLayerId(layerId: string | null | undefined) {
  return Boolean(layerId?.endsWith(DRAFTING_QR_LAYER_SUFFIX))
}

export function createDefaultDraftingLayers(
  nodeId: string,
  qrState: QrStudioState,
  cardState: DraftingCardState,
): DraftingCanvasLayer[] {
  const qrDimensions = getQrRenderedDimensions(qrState)
  const cardWidth = qrDimensions.width + cardState.padding * 2
  const cardHeight = qrDimensions.height + cardState.padding * 2 + cardState.bottomSpace
  const cardX = -cardWidth / 2
  const cardY = -cardHeight / 2

  return [
    {
      blur: 0,
      height: cardHeight,
      id: getDraftingCardLayerId(nodeId),
      isLocked: false,
      isVisible: cardState.enabled,
      kind: "card",
      name: "Card",
      nodeId,
      opacity: 1,
      rotation: 0,
      shadow: { ...cardState.shadow },
      width: cardWidth,
      x: cardX,
      y: cardY,
      zIndex: 0,
    },
    {
      blur: 0,
      height: qrDimensions.height,
      id: getDraftingQrLayerId(nodeId),
      isLocked: false,
      isVisible: true,
      kind: "qr",
      name: "QR code",
      nodeId,
      opacity: 1,
      rotation: 0,
      shadow: { ...DEFAULT_LAYER_SHADOW },
      width: qrDimensions.width,
      x: -qrDimensions.width / 2,
      y: cardY + cardState.padding,
      zIndex: 1,
    },
  ]
}

export function cloneDraftingCanvasLayer(layer: DraftingCanvasLayer): DraftingCanvasLayer {
  return {
    ...layer,
    shadow: { ...layer.shadow },
  }
}

export function cloneDraftingLayerStateByNodeId(
  layersByNodeId: DraftingLayerStateByNodeId,
): DraftingLayerStateByNodeId {
  return Object.fromEntries(
    Object.entries(layersByNodeId).map(([nodeId, layers]) => [
      nodeId,
      layers.map(cloneDraftingCanvasLayer),
    ]),
  )
}

export function normalizeDraftingCanvasLayers(
  nodeId: string,
  value: unknown,
  qrState: QrStudioState,
  cardState: DraftingCardState,
): DraftingCanvasLayer[] {
  const fallback = createDefaultDraftingLayers(nodeId, qrState, cardState)

  if (!Array.isArray(value)) {
    return fallback
  }

  const normalized = value
    .map((layer) => normalizeDraftingCanvasLayer(nodeId, layer, fallback))
    .filter((layer): layer is DraftingCanvasLayer => Boolean(layer))

  const hasCard = normalized.some((layer) => layer.kind === "card")
  const hasQr = normalized.some((layer) => layer.kind === "qr")

  return [
    ...(hasCard ? [] : [fallback[0]!]),
    ...normalized,
    ...(hasQr ? [] : [fallback[1]!]),
  ].sort((a, b) => a.zIndex - b.zIndex)
}

export function patchDraftingCanvasLayer(
  layer: DraftingCanvasLayer,
  patch: Partial<DraftingCanvasLayer>,
): DraftingCanvasLayer {
  return normalizeDraftingCanvasLayer(layer.nodeId, { ...layer, ...patch }, [layer]) ?? layer
}

function normalizeDraftingCanvasLayer(
  nodeId: string,
  value: unknown,
  fallbackLayers: DraftingCanvasLayer[],
) {
  if (!isRecord(value)) {
    return null
  }

  const kind = value.kind === "card" || value.kind === "qr" ? value.kind : null

  if (!kind) {
    return null
  }

  const fallback =
    fallbackLayers.find((layer) => layer.kind === kind) ??
    fallbackLayers[0] ??
    createFallbackLayer(nodeId, kind)
  const width = readFiniteNumber(value.width, fallback.width)
  const height = readFiniteNumber(value.height, fallback.height)

  return {
    blur: clamp(readFiniteNumber(value.blur, fallback.blur), 0, 96),
    height: Math.max(1, kind === "qr" ? width : height),
    id: typeof value.id === "string" ? value.id : fallback.id,
    isLocked:
      typeof value.isLocked === "boolean" ? value.isLocked : fallback.isLocked,
    isVisible:
      typeof value.isVisible === "boolean" ? value.isVisible : fallback.isVisible,
    kind,
    name: typeof value.name === "string" && value.name.trim() ? value.name : fallback.name,
    nodeId,
    opacity: clamp(readFiniteNumber(value.opacity, fallback.opacity), 0, 1),
    rotation: readFiniteNumber(value.rotation, fallback.rotation),
    shadow: normalizeDraftingLayerShadow(value.shadow, fallback.shadow),
    width: Math.max(1, width),
    x: readFiniteNumber(value.x, fallback.x),
    y: readFiniteNumber(value.y, fallback.y),
    zIndex: readFiniteNumber(value.zIndex, fallback.zIndex),
  } satisfies DraftingCanvasLayer
}

function normalizeDraftingLayerShadow(
  value: unknown,
  fallback: DraftingCardShadowState,
): DraftingCardShadowState {
  if (!isRecord(value)) {
    return { ...fallback }
  }

  return {
    blur: clamp(readFiniteNumber(value.blur, fallback.blur), 0, 128),
    color: typeof value.color === "string" ? value.color : fallback.color,
    offsetX: clamp(readFiniteNumber(value.offsetX, fallback.offsetX), -256, 256),
    offsetY: clamp(readFiniteNumber(value.offsetY, fallback.offsetY), -256, 256),
    opacity: clamp(readFiniteNumber(value.opacity, fallback.opacity), 0, 100),
  }
}

function createFallbackLayer(
  nodeId: string,
  kind: DraftingCanvasLayerKind,
): DraftingCanvasLayer {
  return {
    blur: 0,
    height: 240,
    id: kind === "card" ? getDraftingCardLayerId(nodeId) : getDraftingQrLayerId(nodeId),
    isLocked: false,
    isVisible: true,
    kind,
    name: kind === "card" ? "Card" : "QR code",
    nodeId,
    opacity: 1,
    rotation: 0,
    shadow: { ...DEFAULT_LAYER_SHADOW },
    width: 240,
    x: -120,
    y: -120,
    zIndex: kind === "card" ? 0 : 1,
  }
}

function readFiniteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
