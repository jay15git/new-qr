import {
  cloneDraftingCardState,
  createDefaultDraftingCardState,
  type DraftingCardState,
} from "@/components/new/drafting-card-state"
import {
  cloneDraftingLayerStateByNodeId,
  createDefaultDraftingLayers,
  normalizeDraftingCanvasLayers,
  type DraftingLayerStateByNodeId,
} from "@/components/new/drafting-layer-state"
import { DASHBOARD_QR_NODE_ID } from "@/components/qr/dashboard-compose-scene"
import {
  clampBackgroundShapeEdgeBlur,
  clampBackgroundShapeOffset,
  clampBackgroundShapeOpacity,
  clampBackgroundShapePaddingPx,
  clampBackgroundShapeStrokeWidth,
  createDefaultQrStudioState,
  DEFAULT_BACKGROUND_SHAPE_OPTIONS,
  setDotMatrixAnimationOptions,
  type BackgroundShapeOptions,
  type QrStudioState,
} from "@/components/qr/qr-studio-state"
import {
  DEFAULT_QR_INPUT_TYPE,
  type QrInputType,
} from "@/components/ui/qr-input-config"
import {
  getDefaultStaticQrValues,
  type StaticQrContentValues,
} from "@/components/qr/qr-static-content"

export type DraftingQrStateByNodeId = Record<string, QrStudioState>
export type DraftingCardStateByNodeId = Record<string, DraftingCardState>
export type DraftingContentValuesByType = Partial<Record<QrInputType, StaticQrContentValues>>

export type DraftingWorkspaceDocumentV1 = {
  activeQrNodeId: string
  cardStateByNodeId: DraftingCardStateByNodeId
  contentValuesByType: DraftingContentValuesByType
  layerStateByNodeId: DraftingLayerStateByNodeId
  qrOrder: string[]
  qrStateByNodeId: DraftingQrStateByNodeId
  selectedContentType: QrInputType
  version: 1
}

const DEFAULT_DRAFTING_PANE_QR_SIZE = 240

export function cloneDraftingWorkspaceDocument(
  document: DraftingWorkspaceDocumentV1,
): DraftingWorkspaceDocumentV1 {
  return {
    activeQrNodeId: document.activeQrNodeId,
    cardStateByNodeId: Object.fromEntries(
      Object.entries(document.cardStateByNodeId).map(([nodeId, state]) => [
        nodeId,
        cloneDraftingCardState(state),
      ]),
    ),
    contentValuesByType: structuredClone(document.contentValuesByType),
    layerStateByNodeId: cloneDraftingLayerStateByNodeId(document.layerStateByNodeId),
    qrOrder: [...document.qrOrder],
    qrStateByNodeId: Object.fromEntries(
      Object.entries(document.qrStateByNodeId).map(([nodeId, state]) => [
        nodeId,
        cloneDraftingQrState(state),
      ]),
    ),
    selectedContentType: document.selectedContentType,
    version: 1,
  }
}

export function createDefaultDraftingWorkspaceDocument(): DraftingWorkspaceDocumentV1 {
  const qrState = createDefaultDraftingWorkspaceQrState()
  const cardState = createDefaultDraftingCardState()

  return {
    activeQrNodeId: DASHBOARD_QR_NODE_ID,
    cardStateByNodeId: {
      [DASHBOARD_QR_NODE_ID]: cardState,
    },
    contentValuesByType: {
      [DEFAULT_QR_INPUT_TYPE]: {
        ...getDefaultStaticQrValues(DEFAULT_QR_INPUT_TYPE),
        text: qrState.data,
      },
    },
    layerStateByNodeId: {
      [DASHBOARD_QR_NODE_ID]: createDefaultDraftingLayers(
        DASHBOARD_QR_NODE_ID,
        qrState,
        cardState,
      ),
    },
    qrOrder: [DASHBOARD_QR_NODE_ID],
    qrStateByNodeId: {
      [DASHBOARD_QR_NODE_ID]: qrState,
    },
    selectedContentType: DEFAULT_QR_INPUT_TYPE,
    version: 1,
  }
}

export function parseDraftingWorkspaceDocument(
  value: unknown,
): DraftingWorkspaceDocumentV1 {
  if (typeof value === "string") {
    try {
      return parseDraftingWorkspaceDocument(JSON.parse(value))
    } catch {
      return createDefaultDraftingWorkspaceDocument()
    }
  }

  if (!isRecord(value) || value.version !== 1) {
    return createDefaultDraftingWorkspaceDocument()
  }

  const rawQrStateByNodeId = isRecord(value.qrStateByNodeId)
    ? value.qrStateByNodeId
    : {}
  const rawCardStateByNodeId = isRecord(value.cardStateByNodeId)
    ? value.cardStateByNodeId
    : {}
  const rawLayerStateByNodeId = isRecord(value.layerStateByNodeId)
    ? value.layerStateByNodeId
    : {}
  const qrOrder = Array.isArray(value.qrOrder)
    ? value.qrOrder.filter((nodeId): nodeId is string => typeof nodeId === "string")
    : []
  const fallback = createDefaultDraftingWorkspaceDocument()
  const orderedNodeIds = qrOrder.filter((nodeId) => isRecord(rawQrStateByNodeId[nodeId]))

  for (const nodeId of Object.keys(rawQrStateByNodeId)) {
    if (!orderedNodeIds.includes(nodeId) && isRecord(rawQrStateByNodeId[nodeId])) {
      orderedNodeIds.push(nodeId)
    }
  }

  if (orderedNodeIds.length === 0) {
    return fallback
  }

  const qrStateByNodeId: DraftingQrStateByNodeId = {}
  const cardStateByNodeId: DraftingCardStateByNodeId = {}
  const layerStateByNodeId: DraftingLayerStateByNodeId = {}

  for (const nodeId of orderedNodeIds) {
    qrStateByNodeId[nodeId] = parseQrState(rawQrStateByNodeId[nodeId])
    cardStateByNodeId[nodeId] = parseCardState(rawCardStateByNodeId[nodeId])
    layerStateByNodeId[nodeId] = normalizeDraftingCanvasLayers(
      nodeId,
      rawLayerStateByNodeId[nodeId],
      qrStateByNodeId[nodeId],
      cardStateByNodeId[nodeId],
    )
  }

  const selectedContentType = parseQrInputType(value.selectedContentType)
  const contentValuesByType = parseContentValuesByType(value.contentValuesByType)
  const activeQrNodeId =
    typeof value.activeQrNodeId === "string" && qrStateByNodeId[value.activeQrNodeId]
      ? value.activeQrNodeId
      : orderedNodeIds[0]!

  if (!contentValuesByType[selectedContentType]) {
    contentValuesByType[selectedContentType] =
      selectedContentType === DEFAULT_QR_INPUT_TYPE
        ? {
            ...getDefaultStaticQrValues(DEFAULT_QR_INPUT_TYPE),
            text: qrStateByNodeId[activeQrNodeId]?.data ?? fallback.qrStateByNodeId[DASHBOARD_QR_NODE_ID]!.data,
          }
        : getDefaultStaticQrValues(selectedContentType)
  }

  return {
    activeQrNodeId,
    cardStateByNodeId,
    contentValuesByType,
    layerStateByNodeId,
    qrOrder: orderedNodeIds,
    qrStateByNodeId,
    selectedContentType,
    version: 1,
  }
}

export function serializeDraftingWorkspaceDocument(
  document: DraftingWorkspaceDocumentV1,
): string {
  return JSON.stringify(cloneDraftingWorkspaceDocument(document))
}

export function createDefaultDraftingWorkspaceQrState(): QrStudioState {
  const state = createDefaultQrStudioState()

  state.width = DEFAULT_DRAFTING_PANE_QR_SIZE
  state.height = DEFAULT_DRAFTING_PANE_QR_SIZE

  return state
}

export function cloneDraftingQrState(state: QrStudioState): QrStudioState {
  return structuredClone(state)
}

function parseQrState(value: unknown): QrStudioState {
  const fallback = createDefaultDraftingWorkspaceQrState()

  if (!isRecord(value)) {
    return fallback
  }
  const clonedValue = structuredClone(value)
  const rawDotMatrixAnimation = isRecord(value.dotMatrixAnimation)
    ? value.dotMatrixAnimation
    : {}
  const dotMatrixAnimation = setDotMatrixAnimationOptions(
    {
      ...fallback,
      dotMatrixAnimation: {
        ...fallback.dotMatrixAnimation,
        ...rawDotMatrixAnimation,
      },
    },
    rawDotMatrixAnimation,
  ).dotMatrixAnimation

  return {
    ...fallback,
    ...clonedValue,
    dotMatrixAnimation,
    backgroundShapeOptions: parseBackgroundShapeOptions(
      isRecord(value.backgroundShapeOptions) ? value.backgroundShapeOptions : undefined,
      fallback,
    ),
  } as QrStudioState
}

function parseBackgroundShapeOptions(
  value: Record<string, unknown> | undefined,
  fallback: QrStudioState,
): BackgroundShapeOptions {
  const legacySizePercent =
    typeof value?.sizePercent === "number" ? value.sizePercent : undefined
  const legacyPaddingPx =
    legacySizePercent !== undefined && legacySizePercent > 100
      ? ((legacySizePercent - 100) / 200) * fallback.width
      : undefined

  return {
    edgeBlur: clampBackgroundShapeEdgeBlur(
      typeof value?.edgeBlur === "number"
        ? value.edgeBlur
        : DEFAULT_BACKGROUND_SHAPE_OPTIONS.edgeBlur,
    ),
    paddingPx: clampBackgroundShapePaddingPx(
      typeof value?.paddingPx === "number"
        ? value.paddingPx
        : legacyPaddingPx ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.paddingPx,
    ),
    shadowColor:
      typeof value?.shadowColor === "string"
        ? value.shadowColor
        : DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowColor,
    shadowOffsetX: clampBackgroundShapeOffset(
      typeof value?.shadowOffsetX === "number"
        ? value.shadowOffsetX
        : DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetX,
    ),
    shadowOffsetY: clampBackgroundShapeOffset(
      typeof value?.shadowOffsetY === "number"
        ? value.shadowOffsetY
        : DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetY,
    ),
    shadowOpacity: clampBackgroundShapeOpacity(
      typeof value?.shadowOpacity === "number"
        ? value.shadowOpacity
        : DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOpacity,
    ),
    strokeColor:
      typeof value?.strokeColor === "string"
        ? value.strokeColor
        : DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeColor,
    strokeOpacity: clampBackgroundShapeOpacity(
      typeof value?.strokeOpacity === "number"
        ? value.strokeOpacity
        : DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeOpacity,
    ),
    strokeWidth: clampBackgroundShapeStrokeWidth(
      typeof value?.strokeWidth === "number"
        ? value.strokeWidth
        : DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeWidth,
    ),
  }
}

function parseCardState(value: unknown): DraftingCardState {
  const fallback = createDefaultDraftingCardState()

  if (!isRecord(value)) {
    return fallback
  }

  return cloneDraftingCardState({
    ...fallback,
    ...structuredClone(value),
  } as DraftingCardState)
}

function parseContentValuesByType(value: unknown): DraftingContentValuesByType {
  if (!isRecord(value)) {
    return {}
  }

  return structuredClone(value) as DraftingContentValuesByType
}

function parseQrInputType(value: unknown): QrInputType {
  return typeof value === "string" ? (value as QrInputType) : DEFAULT_QR_INPUT_TYPE
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
