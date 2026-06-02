import type {
  DraftingCardShadowState,
  DraftingCardState,
} from "@/components/new/drafting-card-state"
import {
  DEFAULT_DRAFTING_FONT_ID,
  getDraftingFontByFamily,
  getDraftingFontById,
  resolveDraftingFont,
} from "@/components/new/drafting-font-registry"
import { getQrRenderedDimensions } from "@/components/qr/qr-rendering"
import type { QrStudioState } from "@/components/qr/qr-studio-state"

export type DraftingCanvasLayerKind = "card" | "group" | "qr" | "text"
export type DraftingTextAlign = "center" | "left" | "right"
export type DraftingTextFontStyle = "italic" | "normal"
export type DraftingTextFontWeight = "bold" | "normal" | number
export type DraftingTextRun = {
  fill?: string
  fontFamily?: string
  fontId?: string
  fontSize?: number
  fontStyle?: DraftingTextFontStyle
  fontWeight?: DraftingTextFontWeight
  text: string
  underline?: boolean
}

export type DraftingCanvasLayer = {
  blur: number
  height: number
  id: string
  isLocked: boolean
  isVisible: boolean
  kind: DraftingCanvasLayerKind
  fill?: string
  fontFamily?: string
  fontId?: string
  fontSize?: number
  fontStyle?: DraftingTextFontStyle
  fontWeight?: DraftingTextFontWeight
  letterSpacing?: number
  lineHeight?: number
  name: string
  nodeId: string
  opacity: number
  rotation: number
  shadow: DraftingCardShadowState
  text?: string
  textAlign?: DraftingTextAlign
  textRuns?: DraftingTextRun[]
  underline?: boolean
  width: number
  x: number
  y: number
  zIndex: number
  children?: DraftingCanvasLayer[]
}

export type DraftingLayerStateByNodeId = Record<string, DraftingCanvasLayer[]>
export type DraftingLayerReorderAction = "back" | "backward" | "forward" | "front"
export type DraftingLayerAlignAction =
  | "bottom"
  | "center-x"
  | "center-y"
  | "left"
  | "right"
  | "top"
export type DraftingLayerDistributeAction = "horizontal" | "vertical"

export const DRAFTING_CARD_LAYER_SUFFIX = ":card"
export const DRAFTING_QR_LAYER_SUFFIX = ":qr"

const DEFAULT_LAYER_SHADOW: DraftingCardShadowState = {
  blur: 0,
  color: "#111827",
  offsetX: 0,
  offsetY: 0,
  opacity: 0,
}
export const DEFAULT_DRAFTING_TEXT_LAYER = {
  fill: "#171717",
  fontFamily: "Satoshi",
  fontId: DEFAULT_DRAFTING_FONT_ID,
  fontSize: 32,
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 1.22,
  text: "Add text",
  textAlign: "left",
  underline: false,
} as const

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

export function createDraftingTextLayer(
  nodeId: string,
  options: Partial<DraftingCanvasLayer> = {},
): DraftingCanvasLayer {
  const layer = createFallbackLayer(nodeId, "text")
  const fontOptions =
    typeof options.fontFamily === "string" && !("fontId" in options)
      ? { fontId: undefined }
      : null

  return patchDraftingCanvasLayer(
    {
      ...layer,
      ...options,
      ...fontOptions,
      kind: "text",
    },
    {},
  )
}

export function cloneDraftingCanvasLayer(layer: DraftingCanvasLayer): DraftingCanvasLayer {
  return {
    ...layer,
    children: layer.children?.map(cloneDraftingCanvasLayer),
    shadow: { ...layer.shadow },
    textRuns: layer.textRuns?.map((run) => ({ ...run })),
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

export function reorderDraftingCanvasLayer(
  layers: DraftingCanvasLayer[],
  layerId: string,
  action: DraftingLayerReorderAction,
) {
  const ordered = [...layers].sort((a, b) => a.zIndex - b.zIndex)
  const currentIndex = ordered.findIndex((layer) => layer.id === layerId)

  if (currentIndex === -1) {
    return layers.map(cloneDraftingCanvasLayer)
  }

  const [layer] = ordered.splice(currentIndex, 1)
  const nextIndex =
    action === "back"
      ? 0
      : action === "backward"
        ? Math.max(0, currentIndex - 1)
        : action === "forward"
          ? Math.min(ordered.length, currentIndex + 1)
          : ordered.length

  ordered.splice(nextIndex, 0, layer!)
  return normalizeLayerZIndexes(ordered)
}

export function alignDraftingCanvasLayers(
  layers: DraftingCanvasLayer[],
  selectedLayerIds: string[],
  action: DraftingLayerAlignAction,
) {
  const selectedIdSet = new Set(selectedLayerIds)
  const selectedLayers = layers.filter((layer) => selectedIdSet.has(layer.id))
  const bounds = getLayerBounds(selectedLayers)

  if (!bounds) {
    return layers.map(cloneDraftingCanvasLayer)
  }

  return layers.map((layer) => {
    if (!selectedIdSet.has(layer.id)) {
      return cloneDraftingCanvasLayer(layer)
    }

    const patch =
      action === "left"
        ? { x: bounds.left }
        : action === "center-x"
          ? { x: bounds.centerX - layer.width / 2 }
          : action === "right"
            ? { x: bounds.right - layer.width }
            : action === "top"
              ? { y: bounds.top }
              : action === "center-y"
                ? { y: bounds.centerY - layer.height / 2 }
                : { y: bounds.bottom - layer.height }

    return patchDraftingCanvasLayer(layer, roundLayerPatch(patch))
  })
}

export function distributeDraftingCanvasLayers(
  layers: DraftingCanvasLayer[],
  selectedLayerIds: string[],
  action: DraftingLayerDistributeAction,
) {
  const selectedIdSet = new Set(selectedLayerIds)
  const selectedLayers = selectedLayerIds
    .map((id) => layers.find((layer) => layer.id === id))
    .filter((layer): layer is DraftingCanvasLayer => Boolean(layer))
  const bounds = getLayerBounds(selectedLayers)

  if (!bounds || selectedLayers.length < 3) {
    return layers.map(cloneDraftingCanvasLayer)
  }

  const step =
    action === "horizontal"
      ? (bounds.right - bounds.left) / (selectedLayers.length - 1)
      : (bounds.bottom - bounds.top) / (selectedLayers.length - 1)
  const patchById = new Map<string, Partial<DraftingCanvasLayer>>()

  selectedLayers.forEach((layer, index) => {
    patchById.set(
      layer.id,
      action === "horizontal"
        ? { x: bounds.left + step * index }
        : { y: bounds.top + step * index },
    )
  })

  return layers.map((layer) =>
    selectedIdSet.has(layer.id)
      ? patchDraftingCanvasLayer(layer, roundLayerPatch(patchById.get(layer.id) ?? {}))
      : cloneDraftingCanvasLayer(layer),
  )
}

export function cloneDraftingCanvasLayersForPaste({
  layers,
  nodeId,
  offset,
  startingZIndex,
}: {
  layers: DraftingCanvasLayer[]
  nodeId: string
  offset: { x: number; y: number }
  startingZIndex: number
}) {
  return layers.map((layer, index) =>
    remapDraftingCanvasLayerForPaste(layer, {
      nodeId,
      offset,
      zIndex: startingZIndex + index,
    }),
  )
}

export function groupDraftingCanvasLayers(
  layers: DraftingCanvasLayer[],
  selectedLayerIds: string[],
  options: { groupId: string; name: string },
) {
  const selectedIdSet = new Set(selectedLayerIds)
  const selectedLayers = layers.filter((layer) => selectedIdSet.has(layer.id))
  const bounds = getLayerBounds(selectedLayers)

  if (!bounds || selectedLayers.length < 2) {
    return layers.map(cloneDraftingCanvasLayer)
  }

  const lowestZIndex = Math.min(...selectedLayers.map((layer) => layer.zIndex))
  const groupLayer = patchDraftingCanvasLayer(
    {
      blur: 0,
      children: selectedLayers
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((layer, index) =>
          patchDraftingCanvasLayer(cloneDraftingCanvasLayer(layer), {
            x: layer.x - bounds.left,
            y: layer.y - bounds.top,
            zIndex: index,
          }),
        ),
      height: bounds.bottom - bounds.top,
      id: options.groupId,
      isLocked: false,
      isVisible: true,
      kind: "group",
      name: options.name,
      nodeId: selectedLayers[0]?.nodeId ?? layers[0]?.nodeId ?? "preview",
      opacity: 1,
      rotation: 0,
      shadow: { ...DEFAULT_LAYER_SHADOW },
      width: bounds.right - bounds.left,
      x: bounds.left,
      y: bounds.top,
      zIndex: lowestZIndex,
    },
    {},
  )

  return normalizeLayerZIndexes([
    ...layers.filter((layer) => !selectedIdSet.has(layer.id)).map(cloneDraftingCanvasLayer),
    groupLayer,
  ].sort((a, b) => a.zIndex - b.zIndex))
}

export function ungroupDraftingCanvasLayer(
  layers: DraftingCanvasLayer[],
  groupLayerId: string,
) {
  const groupLayer = layers.find((layer) => layer.id === groupLayerId && layer.kind === "group")

  if (!groupLayer?.children?.length) {
    return layers.map(cloneDraftingCanvasLayer)
  }

  const restoredChildren = groupLayer.children.map((child) =>
    patchDraftingCanvasLayer(cloneDraftingCanvasLayer(child), {
      nodeId: groupLayer.nodeId,
      x: groupLayer.x + child.x,
      y: groupLayer.y + child.y,
      zIndex: groupLayer.zIndex + child.zIndex,
    }),
  )

  return normalizeLayerZIndexes([
    ...layers.filter((layer) => layer.id !== groupLayerId).map(cloneDraftingCanvasLayer),
    ...restoredChildren,
  ].sort((a, b) => a.zIndex - b.zIndex))
}

export function getDraftingMarqueeSelection(
  layers: DraftingCanvasLayer[],
  marquee: Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y">,
) {
  const marqueeBounds = {
    bottom: marquee.y + marquee.height,
    left: marquee.x,
    right: marquee.x + marquee.width,
    top: marquee.y,
  }

  return layers
    .filter((layer) => layer.isVisible && !layer.isLocked)
    .filter((layer) =>
      rectanglesIntersect(marqueeBounds, {
        bottom: layer.y + layer.height,
        left: layer.x,
        right: layer.x + layer.width,
        top: layer.y,
      }),
    )
    .map((layer) => layer.id)
}

function normalizeLayerZIndexes(layers: DraftingCanvasLayer[]) {
  return layers.map((layer, index) => patchDraftingCanvasLayer(layer, { zIndex: index }))
}

function getLayerBounds(layers: DraftingCanvasLayer[]) {
  if (layers.length === 0) {
    return null
  }

  const left = Math.min(...layers.map((layer) => layer.x))
  const top = Math.min(...layers.map((layer) => layer.y))
  const right = Math.max(...layers.map((layer) => layer.x + layer.width))
  const bottom = Math.max(...layers.map((layer) => layer.y + layer.height))

  return {
    bottom,
    centerX: left + (right - left) / 2,
    centerY: top + (bottom - top) / 2,
    left,
    right,
    top,
  }
}

function roundLayerPatch(patch: Partial<DraftingCanvasLayer>) {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value]) => [
      key,
      typeof value === "number" ? Math.round(value * 100) / 100 : value,
    ]),
  ) as Partial<DraftingCanvasLayer>
}

function normalizeDraftingCanvasLayer(
  nodeId: string,
  value: unknown,
  fallbackLayers: DraftingCanvasLayer[],
): DraftingCanvasLayer | null {
  if (!isRecord(value)) {
    return null
  }

  const kind =
    value.kind === "card" ||
    value.kind === "group" ||
    value.kind === "qr" ||
    value.kind === "text"
      ? value.kind
      : null

  if (!kind) {
    return null
  }

  const fallback =
    fallbackLayers.find((layer) => layer.kind === kind) ??
    createFallbackLayer(nodeId, kind)
  const width = readFiniteNumber(value.width, fallback.width)
  const height = readFiniteNumber(value.height, fallback.height)
  const children: DraftingCanvasLayer[] | undefined =
    kind === "group" && Array.isArray(value.children)
      ? value.children
          .map((child): DraftingCanvasLayer | null =>
            normalizeDraftingCanvasLayer(nodeId, child, fallbackLayers),
          )
          .filter((child): child is DraftingCanvasLayer => Boolean(child))
      : undefined
  const text =
    kind === "text" && typeof value.text === "string"
      ? value.text
      : kind === "text"
        ? (fallback.text ?? DEFAULT_DRAFTING_TEXT_LAYER.text)
        : undefined
  const textRuns =
    kind === "text" && text !== undefined
      ? normalizeTextRuns(value.textRuns, fallback.textRuns, text)
      : undefined

  return {
    blur: clamp(readFiniteNumber(value.blur, fallback.blur), 0, 96),
    children,
    height: Math.max(1, kind === "qr" ? width : height),
    id: typeof value.id === "string" ? value.id : fallback.id,
    isLocked:
      typeof value.isLocked === "boolean" ? value.isLocked : fallback.isLocked,
    isVisible:
      typeof value.isVisible === "boolean" ? value.isVisible : fallback.isVisible,
    kind,
    fill: kind === "text" ? normalizeHexColor(value.fill, fallback.fill ?? DEFAULT_DRAFTING_TEXT_LAYER.fill) : undefined,
    fontFamily: kind === "text" ? normalizeTextFontFamily(value, fallback) : undefined,
    fontId: kind === "text" ? normalizeTextFontId(value, fallback) : undefined,
    fontSize:
      kind === "text"
        ? clamp(readFiniteNumber(value.fontSize, fallback.fontSize ?? DEFAULT_DRAFTING_TEXT_LAYER.fontSize), 6, 300)
        : undefined,
    fontStyle:
      kind === "text" && value.fontStyle === "italic"
        ? "italic"
        : kind === "text"
          ? "normal"
          : undefined,
    fontWeight:
      kind === "text"
        ? normalizeTextFontWeight(value.fontWeight, fallback.fontWeight)
        : undefined,
    letterSpacing:
      kind === "text"
        ? clamp(readFiniteNumber(value.letterSpacing, fallback.letterSpacing ?? DEFAULT_DRAFTING_TEXT_LAYER.letterSpacing), -50, 200)
        : undefined,
    lineHeight:
      kind === "text"
        ? clamp(readFiniteNumber(value.lineHeight, fallback.lineHeight ?? DEFAULT_DRAFTING_TEXT_LAYER.lineHeight), 0.6, 4)
        : undefined,
    name: typeof value.name === "string" && value.name.trim() ? value.name : fallback.name,
    nodeId,
    opacity: clamp(readFiniteNumber(value.opacity, fallback.opacity), 0, 1),
    rotation: readFiniteNumber(value.rotation, fallback.rotation),
    shadow: normalizeDraftingLayerShadow(value.shadow, fallback.shadow),
    text,
    textAlign:
      kind === "text"
        ? normalizeTextAlign(value.textAlign, fallback.textAlign)
        : undefined,
    textRuns,
    underline:
      kind === "text"
        ? typeof value.underline === "boolean"
          ? value.underline
          : (fallback.underline ?? DEFAULT_DRAFTING_TEXT_LAYER.underline)
        : undefined,
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
    height: kind === "text" ? 48 : 240,
    id:
      kind === "card"
        ? getDraftingCardLayerId(nodeId)
        : kind === "qr"
          ? getDraftingQrLayerId(nodeId)
          : kind === "text"
            ? createDraftingLayerInstanceId(nodeId, "text")
            : `${nodeId}:group`,
    isLocked: false,
    isVisible: true,
    kind,
    fill: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.fill : undefined,
    fontFamily: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.fontFamily : undefined,
    fontId: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.fontId : undefined,
    fontSize: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.fontSize : undefined,
    fontStyle: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.fontStyle : undefined,
    fontWeight: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.fontWeight : undefined,
    letterSpacing: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.letterSpacing : undefined,
    lineHeight: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.lineHeight : undefined,
    name: kind === "card" ? "Card" : kind === "qr" ? "QR code" : kind === "text" ? "Text" : "Group",
    nodeId,
    opacity: 1,
    rotation: 0,
    shadow: { ...DEFAULT_LAYER_SHADOW },
    text: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.text : undefined,
    textAlign: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.textAlign : undefined,
    underline: kind === "text" ? DEFAULT_DRAFTING_TEXT_LAYER.underline : undefined,
    width: 240,
    x: -120,
    y: kind === "text" ? -24 : -120,
    zIndex: kind === "card" ? 0 : 1,
  }
}

function remapDraftingCanvasLayerForPaste(
  layer: DraftingCanvasLayer,
  options: {
    nodeId: string
    offset: { x: number; y: number }
    zIndex: number
  },
): DraftingCanvasLayer {
  const nextId = createDraftingLayerInstanceId(options.nodeId, layer.kind)

  return patchDraftingCanvasLayer(
    {
      ...cloneDraftingCanvasLayer(layer),
      children: layer.children?.map((child, index) =>
        remapDraftingCanvasLayerForPaste(child, {
          nodeId: options.nodeId,
          offset: { x: 0, y: 0 },
          zIndex: index,
        }),
      ),
      id: nextId,
      nodeId: options.nodeId,
      x: layer.x + options.offset.x,
      y: layer.y + options.offset.y,
      zIndex: options.zIndex,
    },
    {},
  )
}

function createDraftingLayerInstanceId(nodeId: string, kind: DraftingCanvasLayerKind) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)

  return `${nodeId}:${kind}:${randomId}`
}

function rectanglesIntersect(
  a: { bottom: number; left: number; right: number; top: number },
  b: { bottom: number; left: number; right: number; top: number },
) {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top
}

function readFiniteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizeHexColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

function normalizeTextAlign(value: unknown, fallback: unknown): DraftingTextAlign {
  if (value === "center" || value === "left" || value === "right") {
    return value
  }

  return fallback === "center" || fallback === "left" || fallback === "right"
    ? fallback
    : DEFAULT_DRAFTING_TEXT_LAYER.textAlign
}

function normalizeTextFontFamily(
  value: Record<string, unknown>,
  fallback: DraftingCanvasLayer,
) {
  if (typeof value.fontFamily === "string" && value.fontFamily.trim()) {
    return typeof value.fontId === "string"
      ? resolveDraftingFont({ fontFamily: value.fontFamily, fontId: value.fontId }).family
      : value.fontFamily.trim().slice(0, 80)
  }

  if (typeof fallback.fontFamily === "string" && fallback.fontFamily.trim()) {
    return typeof fallback.fontId === "string"
      ? resolveDraftingFont({ fontFamily: fallback.fontFamily, fontId: fallback.fontId }).family
      : fallback.fontFamily.trim().slice(0, 80)
  }

  return DEFAULT_DRAFTING_TEXT_LAYER.fontFamily
}

function normalizeTextFontId(value: Record<string, unknown>, fallback: DraftingCanvasLayer) {
  if (typeof value.fontId === "string" && getDraftingFontById(value.fontId)) {
    return value.fontId
  }

  if (typeof value.fontFamily === "string" && value.fontFamily.trim()) {
    return getDraftingFontByFamily(value.fontFamily)?.id
  }

  if (typeof fallback.fontId === "string" && getDraftingFontById(fallback.fontId)) {
    return fallback.fontId
  }

  if (typeof fallback.fontFamily === "string" && fallback.fontFamily.trim()) {
    return getDraftingFontByFamily(fallback.fontFamily)?.id
  }

  return DEFAULT_DRAFTING_TEXT_LAYER.fontId
}

function normalizeTextFontWeight(value: unknown, fallback: unknown): DraftingTextFontWeight {
  if (value === "bold" || value === "normal") {
    return value
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return clamp(Math.round(value), 100, 900)
  }

  return fallback === "bold" || fallback === "normal" || typeof fallback === "number"
    ? normalizeTextFontWeight(fallback, DEFAULT_DRAFTING_TEXT_LAYER.fontWeight)
    : DEFAULT_DRAFTING_TEXT_LAYER.fontWeight
}

function normalizeTextRuns(
  value: unknown,
  fallback: unknown,
  text: string,
): DraftingTextRun[] | undefined {
  const normalized = normalizeTextRunArray(value, text)
  if (normalized) {
    return normalized
  }

  return normalizeTextRunArray(fallback, text)
}

function normalizeTextRunArray(value: unknown, text: string): DraftingTextRun[] | undefined {
  if (!Array.isArray(value) || text.length === 0) {
    return undefined
  }

  const runs = value
    .map((run): DraftingTextRun | null => {
      if (!isRecord(run) || typeof run.text !== "string" || run.text.length === 0) {
        return null
      }

      const fontFamily =
        typeof run.fontFamily === "string" && run.fontFamily.trim()
          ? run.fontFamily.trim().slice(0, 80)
          : undefined
      const fontId = typeof run.fontId === "string" && getDraftingFontById(run.fontId)
        ? run.fontId
        : fontFamily
          ? getDraftingFontByFamily(fontFamily)?.id
          : undefined

      return {
        fill: typeof run.fill === "string" ? normalizeHexColor(run.fill, DEFAULT_DRAFTING_TEXT_LAYER.fill) : undefined,
        fontFamily,
        fontId,
        fontSize:
          typeof run.fontSize === "number" && Number.isFinite(run.fontSize)
            ? clamp(run.fontSize, 6, 300)
            : undefined,
        fontStyle: run.fontStyle === "italic" ? "italic" : run.fontStyle === "normal" ? "normal" : undefined,
        fontWeight:
          run.fontWeight === undefined
            ? undefined
            : normalizeTextFontWeight(run.fontWeight, undefined),
        text: run.text,
        underline: typeof run.underline === "boolean" ? run.underline : undefined,
      }
    })
    .filter((run): run is DraftingTextRun => Boolean(run))

  if (runs.length === 0 || runs.map((run) => run.text).join("") !== text) {
    return undefined
  }

  return mergeAdjacentTextRuns(runs)
}

function mergeAdjacentTextRuns(runs: DraftingTextRun[]) {
  return runs.reduce<DraftingTextRun[]>((merged, run) => {
    const previous = merged.at(-1)

    if (previous && areTextRunStylesEqual(previous, run)) {
      previous.text += run.text
      return merged
    }

    merged.push({ ...run })
    return merged
  }, [])
}

function areTextRunStylesEqual(a: DraftingTextRun, b: DraftingTextRun) {
  return (
    a.fill === b.fill &&
    a.fontFamily === b.fontFamily &&
    a.fontId === b.fontId &&
    a.fontSize === b.fontSize &&
    a.fontStyle === b.fontStyle &&
    a.fontWeight === b.fontWeight &&
    a.underline === b.underline
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
