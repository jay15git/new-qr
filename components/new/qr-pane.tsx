"use client"

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react"
import { RotateCwIcon } from "lucide-react"

import {
  DEFAULT_DRAFTING_CARD_STATE,
  type DraftingCardState,
} from "@/components/new/drafting-card-state"
import { DraftingCardPaperShaderLayer } from "@/components/new/drafting-card-paper-shader-layer"
import { getDraftingCardPatternStyle } from "@/components/new/drafting-card-patterns"
import {
  createDefaultDraftingLayers,
  type DraftingCanvasLayer,
} from "@/components/new/drafting-layer-state"
import {
  createDraftingQrArtworkState,
  sanitizeDraftingQrArtworkMarkup,
} from "@/components/new/drafting-qr-artwork"
import { DraftingQrBackground } from "@/components/new/drafting-qr-background"
import { applyDraftingQrForegroundShadow } from "@/components/new/drafting-qr-layer-shadow"
import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import type { QrStudioState } from "@/components/qr/qr-studio-state"
import { cn } from "@/lib/utils"

type QrPaneProps = {
  cardState?: DraftingCardState
  interactionScale?: number
  isSelected: boolean
  layers?: DraftingCanvasLayer[]
  onLayerChange?: (layerId: string, patch: Partial<DraftingCanvasLayer>) => void
  onLayerSelect?: (layerId: string | null, options?: { additive?: boolean }) => void
  onSelect: () => void
  onQrClick: () => void
  selectedLayerId?: string | null
  selectedLayerIds?: string[]
  snapEnabled?: boolean
  state: QrStudioState
}

type ResizeDirection = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"
type SnapAxis = "x" | "y"
type SnapGuides = {
  horizontal: number[]
  vertical: number[]
}
type LayerBounds = Pick<DraftingCanvasLayer, "height" | "id" | "width" | "x" | "y">

const RESIZE_CONTROL_PADDING_PX = 12
const ROTATE_HANDLE_OFFSET_PX = 34
const ROTATE_HANDLE_RADIUS_PX = 10
const ROTATE_LABEL_GAP_PX = 8
const ROTATION_LABEL_HIDE_DELAY_MS = 2000
const SNAP_THRESHOLD_PX = 6
const ROTATION_SNAP_THRESHOLD_DEGREES = 4
const ROTATION_SNAP_TARGETS = [0, 90, 180, 270] as const

const RESIZE_HANDLES: Array<{
  className: string
  cursorClassName: string
  direction: ResizeDirection
  label: string
}> = [
  {
    className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
    cursorClassName: "cursor-ns-resize",
    direction: "n",
    label: "top",
  },
  {
    className: "right-0 top-0 translate-x-1/2 -translate-y-1/2",
    cursorClassName: "cursor-nesw-resize",
    direction: "ne",
    label: "top right",
  },
  {
    className: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
    cursorClassName: "cursor-ew-resize",
    direction: "e",
    label: "right",
  },
  {
    className: "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    cursorClassName: "cursor-nwse-resize",
    direction: "se",
    label: "bottom right",
  },
  {
    className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    cursorClassName: "cursor-ns-resize",
    direction: "s",
    label: "bottom",
  },
  {
    className: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    cursorClassName: "cursor-nesw-resize",
    direction: "sw",
    label: "bottom left",
  },
  {
    className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    cursorClassName: "cursor-ew-resize",
    direction: "w",
    label: "left",
  },
  {
    className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
    cursorClassName: "cursor-nwse-resize",
    direction: "nw",
    label: "top left",
  },
]

function getDraftingCardShadow(cardState: DraftingCardState) {
  if (
    cardState.shadow.opacity <= 0 ||
    (cardState.shadow.blur <= 0 && cardState.shadow.offsetX === 0 && cardState.shadow.offsetY === 0)
  ) {
    return "none"
  }

  return `${cardState.shadow.offsetX}px ${cardState.shadow.offsetY}px ${cardState.shadow.blur}px ${toRgba(
    cardState.shadow.color,
    cardState.shadow.opacity / 100,
  )}`
}

function getDraftingCardBorder(cardState: DraftingCardState) {
  const borderWidth = Math.max(0, cardState.border.width)

  if (borderWidth <= 0) {
    return undefined
  }

  const borderColor = toRgba(cardState.border.color, cardState.border.opacity / 100)
  return `${borderWidth}px solid ${borderColor}`
}

function toRgba(color: string, opacity: number) {
  const normalizedOpacity = Math.min(1, Math.max(0, Number.isFinite(opacity) ? opacity : 1))
  const hex = color.trim().replace(/^#/, "")

  if (/^[\da-f]{3}$/i.test(hex)) {
    const [r, g, b] = hex.split("").map((channel) => Number.parseInt(channel + channel, 16))
    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`
  }

  if (/^[\da-f]{6}$/i.test(hex)) {
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`
  }

  return color
}

function resizeDraftingLayer(
  layer: DraftingCanvasLayer,
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
): Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y"> {
  if (layer.kind === "qr") {
    return resizeSquareLayer(layer, direction, deltaX, deltaY)
  }

  const affectsWest = direction.includes("w")
  const affectsEast = direction.includes("e")
  const affectsNorth = direction.includes("n")
  const affectsSouth = direction.includes("s")
  const widthDelta = affectsEast ? deltaX : affectsWest ? -deltaX : 0
  const heightDelta = affectsSouth ? deltaY : affectsNorth ? -deltaY : 0
  const width = Math.max(24, layer.width + widthDelta)
  const height = Math.max(24, layer.height + heightDelta)

  return {
    height,
    width,
    x: affectsWest ? layer.x + (layer.width - width) : layer.x,
    y: affectsNorth ? layer.y + (layer.height - height) : layer.y,
  }
}

function resizeSquareLayer(
  layer: DraftingCanvasLayer,
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
): Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y"> {
  const affectsWest = direction.includes("w")
  const affectsEast = direction.includes("e")
  const affectsNorth = direction.includes("n")
  const affectsSouth = direction.includes("s")
  const horizontalDelta = affectsEast ? deltaX : affectsWest ? -deltaX : 0
  const verticalDelta = affectsSouth ? deltaY : affectsNorth ? -deltaY : 0
  const sizeDelta =
    horizontalDelta !== 0 && verticalDelta !== 0
      ? Math.abs(horizontalDelta) > Math.abs(verticalDelta)
        ? horizontalDelta
        : verticalDelta
      : horizontalDelta || verticalDelta
  const size = Math.max(24, layer.width + sizeDelta)

  return {
    height: size,
    width: size,
    x: affectsWest ? layer.x + (layer.width - size) : layer.x,
    y: affectsNorth ? layer.y + (layer.height - size) : layer.y,
  }
}

function normalizeLayerRotation(rotation: number) {
  if (!Number.isFinite(rotation)) {
    return 0
  }

  const normalized = rotation % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function getLayerRotationLabel(rotation: number) {
  return Math.round(normalizeLayerRotation(rotation)) % 360
}

function getCombinedLayerBounds(layers: DraftingCanvasLayer[]) {
  if (layers.length === 0) {
    return null
  }

  const left = Math.min(...layers.map((layer) => layer.x))
  const top = Math.min(...layers.map((layer) => layer.y))
  const right = Math.max(...layers.map((layer) => layer.x + layer.width))
  const bottom = Math.max(...layers.map((layer) => layer.y + layer.height))

  return {
    height: bottom - top,
    width: right - left,
    x: left,
    y: top,
  }
}

function rotatePoint(
  point: { x: number; y: number },
  center: { x: number; y: number },
  degrees: number,
) {
  const radians = (degrees * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const dx = point.x - center.x
  const dy = point.y - center.y

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}

function roundLayerNumber(value: number) {
  return Math.round(value * 1000) / 1000
}

function snapLayerMove({
  layer,
  layers,
  proposedX,
  proposedY,
  threshold,
}: {
  layer: DraftingCanvasLayer
  layers: DraftingCanvasLayer[]
  proposedX: number
  proposedY: number
  threshold: number
}) {
  const horizontal = snapAxis({
    axis: "y",
    bounds: { ...layer, x: proposedX, y: proposedY },
    layers,
    threshold,
  })
  const vertical = snapAxis({
    axis: "x",
    bounds: { ...layer, x: proposedX, y: proposedY },
    layers,
    threshold,
  })

  return {
    guides: {
      horizontal: horizontal.guide === null ? [] : [horizontal.guide],
      vertical: vertical.guide === null ? [] : [vertical.guide],
    },
    x: proposedX + vertical.offset,
    y: proposedY + horizontal.offset,
  }
}

function snapLayerResize({
  direction,
  layer,
  layers,
  geometry,
  threshold,
}: {
  direction: ResizeDirection
  layer: DraftingCanvasLayer
  layers: DraftingCanvasLayer[]
  geometry: Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y">
  threshold: number
}) {
  const nextGeometry = { ...geometry }
  const vertical = snapResizeAxis({
    affectsEnd: direction.includes("e"),
    affectsStart: direction.includes("w"),
    axis: "x",
    bounds: { ...layer, ...nextGeometry },
    layers,
    threshold,
  })

  if (vertical.guide !== null) {
    if (vertical.edge === "start") {
      nextGeometry.x += vertical.offset
      nextGeometry.width = Math.max(24, nextGeometry.width - vertical.offset)
    } else {
      nextGeometry.width = Math.max(24, nextGeometry.width + vertical.offset)
    }
  }

  const horizontal = snapResizeAxis({
    affectsEnd: direction.includes("s"),
    affectsStart: direction.includes("n"),
    axis: "y",
    bounds: { ...layer, ...nextGeometry },
    layers,
    threshold,
  })

  if (horizontal.guide !== null) {
    if (horizontal.edge === "start") {
      nextGeometry.y += horizontal.offset
      nextGeometry.height = Math.max(24, nextGeometry.height - horizontal.offset)
    } else {
      nextGeometry.height = Math.max(24, nextGeometry.height + horizontal.offset)
    }
  }

  if (layer.kind === "qr" && (vertical.guide !== null || horizontal.guide !== null)) {
    const size = Math.max(nextGeometry.width, nextGeometry.height)
    nextGeometry.width = size
    nextGeometry.height = size
  }

  return {
    guides: {
      horizontal: horizontal.guide === null ? [] : [horizontal.guide],
      vertical: vertical.guide === null ? [] : [vertical.guide],
    },
    geometry: nextGeometry,
  }
}

function snapResizeAxis({
  affectsEnd,
  affectsStart,
  axis,
  bounds,
  layers,
  threshold,
}: {
  affectsEnd: boolean
  affectsStart: boolean
  axis: SnapAxis
  bounds: LayerBounds
  layers: DraftingCanvasLayer[]
  threshold: number
}) {
  if (!affectsStart && !affectsEnd) {
    return { edge: null, guide: null, offset: 0 } as const
  }

  const source = axis === "x"
    ? affectsStart
      ? bounds.x
      : bounds.x + bounds.width
    : affectsStart
      ? bounds.y
      : bounds.y + bounds.height
  const edge = affectsStart ? "start" : "end"
  let best: { distance: number; edge: "start" | "end"; guide: number; offset: number } | null = null

  for (const target of getSnapTargets(layers, bounds.id, axis)) {
    const distance = Math.abs(target - source)

    if (distance <= threshold && (!best || distance < best.distance)) {
      best = {
        distance,
        edge,
        guide: target,
        offset: target - source,
      }
    }
  }

  return best ?? { edge: null, guide: null, offset: 0 }
}

function snapAxis({
  axis,
  bounds,
  layers,
  threshold,
}: {
  axis: SnapAxis
  bounds: LayerBounds
  layers: DraftingCanvasLayer[]
  threshold: number
}) {
  let best: { distance: number; guide: number; offset: number } | null = null

  for (const source of getBoundsSnapPoints(bounds, axis)) {
    for (const target of getSnapTargets(layers, bounds.id, axis)) {
      const distance = Math.abs(target - source)

      if (distance <= threshold && (!best || distance < best.distance)) {
        best = {
          distance,
          guide: target,
          offset: target - source,
        }
      }
    }
  }

  return best ?? { guide: null, offset: 0 }
}

function getSnapTargets(
  layers: DraftingCanvasLayer[],
  activeLayerId: string,
  axis: SnapAxis,
) {
  const targets = [0]

  for (const layer of layers) {
    if (layer.id === activeLayerId || !layer.isVisible) {
      continue
    }

    targets.push(...getBoundsSnapPoints(layer, axis))
  }

  return targets
}

function getBoundsSnapPoints(bounds: LayerBounds, axis: SnapAxis) {
  if (axis === "x") {
    return [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width]
  }

  return [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height]
}

function snapLayerRotation(rotation: number) {
  const normalized = normalizeLayerRotation(rotation)
  let closest: number | null = null
  let closestDistance = Number.POSITIVE_INFINITY

  for (const target of ROTATION_SNAP_TARGETS) {
    const distance = getShortestAngleDistance(normalized, target)

    if (distance < closestDistance) {
      closest = target
      closestDistance = distance
    }
  }

  return closest !== null && closestDistance <= ROTATION_SNAP_THRESHOLD_DEGREES
    ? closest
    : normalized
}

function getShortestAngleDistance(left: number, right: number) {
  const distance = Math.abs(left - right) % 360
  return Math.min(distance, 360 - distance)
}

function SnapGuideOverlay({ guides }: { guides: SnapGuides }) {
  if (guides.horizontal.length === 0 && guides.vertical.length === 0) {
    return null
  }

  return (
    <>
      {guides.vertical.map((x) => (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-[9999] w-px bg-[var(--drafting-ink)] opacity-55"
          data-slot="drafting-layer-snap-guide"
          data-axis="vertical"
          key={`v-${x}`}
          style={{ left: `calc(50% + ${x}px)` }}
        />
      ))}
      {guides.horizontal.map((y) => (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 z-[9999] h-px bg-[var(--drafting-ink)] opacity-55"
          data-slot="drafting-layer-snap-guide"
          data-axis="horizontal"
          key={`h-${y}`}
          style={{ top: `calc(50% + ${y}px)` }}
        />
      ))}
    </>
  )
}

export const QrPane = memo(function QrPane({
  cardState = DEFAULT_DRAFTING_CARD_STATE,
  interactionScale = 1,
  snapEnabled = true,
  state,
  isSelected,
  layers,
  onLayerChange,
  onLayerSelect,
  onSelect,
  onQrClick,
  selectedLayerId,
  selectedLayerIds,
}: QrPaneProps) {
  const [markup, setMarkup] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [rotatingLayerId, setRotatingLayerId] = useState<string | null>(null)
  const [rotationPreviewDegrees, setRotationPreviewDegrees] = useState<number | null>(null)
  const [multiSelectionPreview, setMultiSelectionPreview] = useState<{
    bounds: Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y">
    rotation: number
  } | null>(null)
  const [snapGuides, setSnapGuides] = useState<SnapGuides>({
    horizontal: [],
    vertical: [],
  })
  const interactionRef = useRef<{
    centerClientX?: number
    centerClientY?: number
    groupBounds?: Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y">
    groupCenter?: { x: number; y: number }
    layers?: DraftingCanvasLayer[]
    layer: DraftingCanvasLayer
    mode: "move" | "resize" | "rotate"
    pointerId: number
    resizeDirection?: ResizeDirection
    startAngle?: number
    startRotation?: number
    startX: number
    startY: number
  } | null>(null)
  const rotationLabelTimeoutRef = useRef<number | null>(null)
  const requestRef = useRef(0)
  const markupCacheRef = useRef(new Map<string, string>())
  const qrArtworkState = useMemo(() => createDraftingQrArtworkState(state), [state])
  const stateCacheKey = useMemo(() => JSON.stringify(qrArtworkState), [qrArtworkState])

  useEffect(() => {
    const requestId = ++requestRef.current
    const cachedMarkup = markupCacheRef.current.get(stateCacheKey)

    if (cachedMarkup) {
      setMarkup(cachedMarkup)
      setHasError(false)
      return
    }

    void buildDashboardQrNodePayload(qrArtworkState, { animationMode: "preview" })
      .then((payload) => {
        if (requestRef.current !== requestId) return
        const nextMarkup = sanitizeDraftingQrArtworkMarkup(payload.markup)
        markupCacheRef.current.set(stateCacheKey, nextMarkup)
        setMarkup(nextMarkup)
        setHasError(false)
      })
      .catch(() => {
        if (requestRef.current !== requestId) return
        setMarkup(null)
        setHasError(true)
      })
  }, [qrArtworkState, stateCacheKey])

  useEffect(
    () => () => {
      if (rotationLabelTimeoutRef.current !== null) {
        window.clearTimeout(rotationLabelTimeoutRef.current)
      }
    },
    [],
  )

  const isLoading = markup === null && !hasError
  const resolvedLayers = useMemo(
    () =>
      layers && layers.length > 0
        ? layers
        : createDefaultDraftingLayers("preview", state, cardState),
    [cardState, layers, state],
  )
  const visibleLayers = resolvedLayers
    .filter((layer) => layer.isVisible)
    .sort((a, b) => a.zIndex - b.zIndex)
  const activeSelectedLayerIds = selectedLayerIds ?? (selectedLayerId ? [selectedLayerId] : [])
  const activeSelectedLayerIdSet = new Set(activeSelectedLayerIds)
  const selectedVisibleLayers = visibleLayers.filter((layer) => activeSelectedLayerIdSet.has(layer.id))
  const combinedLayerBounds = getCombinedLayerBounds(selectedVisibleLayers)
  const isPaperShaderMode = cardState.styleMode === "paper-shader"
  const isImageMode = cardState.styleMode === "image"
  const isImageFilterMode = cardState.styleMode === "image-filter"
  const cardPatternStyle = getDraftingCardPatternStyle(
    cardState.patternId,
    cardState.patternId === "none" ? undefined : cardState.patternColors[cardState.patternId],
  )
  const cardImageStyle =
    (isImageMode || isImageFilterMode) && cardState.cardImage.value
      ? {
          backgroundImage: `url("${cardState.cardImage.value}")`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: cardState.cardImage.fit,
        }
      : undefined
  const cardStyle: CSSProperties = {
    backgroundColor: cardState.fill,
    ...(isPaperShaderMode || isImageFilterMode || isImageMode ? undefined : cardPatternStyle),
    ...cardImageStyle,
    border: getDraftingCardBorder(cardState),
    borderRadius: cardState.cornerRadius,
  }
  const imageFilterShader = {
    ...cardState.imageFilter,
    image: {
      ...cardState.imageFilter.image,
      source: cardState.cardImage.source === "none" ? cardState.imageFilter.image.source : cardState.cardImage.source,
      value: cardState.cardImage.value ?? cardState.imageFilter.image.value,
    },
  }
  function startLayerInteraction(
    event: PointerEvent<HTMLElement>,
    layer: DraftingCanvasLayer,
    mode: "move" | "resize" | "rotate",
    resizeDirection?: ResizeDirection,
  ) {
    if (event.metaKey || event.ctrlKey) {
      return
    }

    if (layer.isLocked || !onLayerChange) {
      return
    }

    if (
      mode === "move" &&
      activeSelectedLayerIds.length > 1 &&
      activeSelectedLayerIdSet.has(layer.id)
    ) {
      startMultiLayerInteraction(event, "move")
      return
    }

    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const layerElement = event.currentTarget.closest<HTMLElement>("[data-layer-id]")
    const layerRect = layerElement?.getBoundingClientRect()
    const centerClientX = layerRect ? layerRect.left + layerRect.width / 2 : event.clientX
    const centerClientY = layerRect ? layerRect.top + layerRect.height / 2 : event.clientY

    interactionRef.current = {
      centerClientX,
      centerClientY,
      layer,
      mode,
      pointerId: event.pointerId,
      resizeDirection,
      startAngle:
        (Math.atan2(event.clientY - centerClientY, event.clientX - centerClientX) * 180) /
        Math.PI,
      startRotation: layer.rotation,
      startX: event.clientX,
      startY: event.clientY,
    }
    if (mode === "rotate") {
      if (rotationLabelTimeoutRef.current !== null) {
        window.clearTimeout(rotationLabelTimeoutRef.current)
        rotationLabelTimeoutRef.current = null
      }
      setRotatingLayerId(layer.id)
      setRotationPreviewDegrees(getLayerRotationLabel(layer.rotation))
    }
    onLayerSelect?.(layer.id)
  }

  function startMultiLayerInteraction(
    event: PointerEvent<HTMLElement>,
    mode: "move" | "resize" | "rotate",
    resizeDirection?: ResizeDirection,
  ) {
    if (!combinedLayerBounds || selectedVisibleLayers.length < 2 || !onLayerChange) {
      return
    }

    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const frameElement =
      event.currentTarget.closest<HTMLElement>("[data-slot='drafting-layer-multi-select-frame']") ??
      event.currentTarget
        .closest<HTMLElement>("[data-slot='dashboard-compose-canvas']")
        ?.querySelector<HTMLElement>("[data-slot='drafting-layer-multi-select-frame']")
    const frameRect = frameElement?.getBoundingClientRect()
    const centerClientX = frameRect ? frameRect.left + frameRect.width / 2 : event.clientX
    const centerClientY = frameRect ? frameRect.top + frameRect.height / 2 : event.clientY

    interactionRef.current = {
      centerClientX,
      centerClientY,
      groupBounds: combinedLayerBounds,
      groupCenter: {
        x: combinedLayerBounds.x + combinedLayerBounds.width / 2,
        y: combinedLayerBounds.y + combinedLayerBounds.height / 2,
      },
      layer: selectedVisibleLayers[0],
      layers: selectedVisibleLayers,
      mode,
      pointerId: event.pointerId,
      resizeDirection,
      startAngle:
        (Math.atan2(event.clientY - centerClientY, event.clientX - centerClientX) * 180) /
        Math.PI,
      startRotation: 0,
      startX: event.clientX,
      startY: event.clientY,
    }
    if (mode === "rotate") {
      if (rotationLabelTimeoutRef.current !== null) {
        window.clearTimeout(rotationLabelTimeoutRef.current)
        rotationLabelTimeoutRef.current = null
      }
      setRotatingLayerId("selection")
      setRotationPreviewDegrees(0)
      setMultiSelectionPreview({
        bounds: combinedLayerBounds,
        rotation: 0,
      })
    }
  }

  function updateLayerInteraction(event: PointerEvent<HTMLElement>) {
    const interaction = interactionRef.current

    if (!interaction || interaction.pointerId !== event.pointerId) {
      return
    }

    event.stopPropagation()
    const scale = interactionScale > 0 ? interactionScale : 1
    const snapThreshold = SNAP_THRESHOLD_PX / scale
    const deltaX = (event.clientX - interaction.startX) / scale
    const deltaY = (event.clientY - interaction.startY) / scale
    const layer = interaction.layer

    if (interaction.layers && interaction.groupBounds && interaction.groupCenter) {
      if (interaction.mode === "move") {
        for (const selectedLayer of interaction.layers) {
          onLayerChange?.(selectedLayer.id, {
            x: roundLayerNumber(selectedLayer.x + deltaX),
            y: roundLayerNumber(selectedLayer.y + deltaY),
          })
        }
        return
      }

      if (interaction.mode === "rotate") {
        const centerClientX = interaction.centerClientX ?? event.clientX
        const centerClientY = interaction.centerClientY ?? event.clientY
        const angle =
          (Math.atan2(event.clientY - centerClientY, event.clientX - centerClientX) * 180) /
          Math.PI
        const freeRotation = normalizeLayerRotation(angle - (interaction.startAngle ?? angle))
        const rotation = snapEnabled ? snapLayerRotation(freeRotation) : freeRotation

        setRotationPreviewDegrees(getLayerRotationLabel(rotation))
        setMultiSelectionPreview((current) =>
          current ? { ...current, rotation: getLayerRotationLabel(rotation) } : current,
        )
        setSnapGuides({
          horizontal: [],
          vertical: snapEnabled && rotation !== freeRotation ? [0] : [],
        })

        for (const selectedLayer of interaction.layers) {
          const center = {
            x: selectedLayer.x + selectedLayer.width / 2,
            y: selectedLayer.y + selectedLayer.height / 2,
          }
          const nextCenter = rotatePoint(center, interaction.groupCenter, rotation)
          onLayerChange?.(selectedLayer.id, {
            rotation: normalizeLayerRotation(selectedLayer.rotation + rotation),
            x: roundLayerNumber(nextCenter.x - selectedLayer.width / 2),
            y: roundLayerNumber(nextCenter.y - selectedLayer.height / 2),
          })
        }
        return
      }

      if (interaction.mode === "resize") {
        const nextBounds = resizeDraftingLayer(
          {
            ...interaction.groupBounds,
            blur: 0,
            id: "selection",
            isLocked: false,
            isVisible: true,
            kind: "card",
            name: "Selection",
            nodeId: "selection",
            opacity: 1,
            rotation: 0,
            shadow: { blur: 0, color: "#000000", offsetX: 0, offsetY: 0, opacity: 0 },
            zIndex: 0,
          },
          interaction.resizeDirection ?? "se",
          deltaX,
          deltaY,
        )
        const scaleX = interaction.groupBounds.width > 0 ? nextBounds.width / interaction.groupBounds.width : 1
        const scaleY = interaction.groupBounds.height > 0 ? nextBounds.height / interaction.groupBounds.height : 1

        for (const selectedLayer of interaction.layers) {
          onLayerChange?.(selectedLayer.id, {
            height: roundLayerNumber(selectedLayer.height * scaleY),
            width: roundLayerNumber(selectedLayer.width * scaleX),
            x: roundLayerNumber(nextBounds.x + (selectedLayer.x - interaction.groupBounds.x) * scaleX),
            y: roundLayerNumber(nextBounds.y + (selectedLayer.y - interaction.groupBounds.y) * scaleY),
          })
        }
        return
      }
    }

    if (interaction.mode === "rotate") {
      const centerClientX = interaction.centerClientX ?? event.clientX
      const centerClientY = interaction.centerClientY ?? event.clientY
      const angle =
        (Math.atan2(event.clientY - centerClientY, event.clientX - centerClientX) * 180) /
        Math.PI

      const freeRotation = normalizeLayerRotation(
        angle - (interaction.startAngle ?? angle) + (interaction.startRotation ?? layer.rotation),
      )
      const rotation = snapEnabled ? snapLayerRotation(freeRotation) : freeRotation

      setRotationPreviewDegrees(getLayerRotationLabel(rotation))
      setSnapGuides({
        horizontal: [],
        vertical: snapEnabled && rotation !== freeRotation ? [0] : [],
      })
      onLayerChange?.(layer.id, { rotation })
      return
    }

    if (interaction.mode === "move") {
      const proposedX = layer.x + deltaX
      const proposedY = layer.y + deltaY
      const nextMove = snapEnabled
        ? snapLayerMove({
            layer,
            layers: visibleLayers,
            proposedX,
            proposedY,
            threshold: snapThreshold,
          })
        : { guides: { horizontal: [], vertical: [] }, x: proposedX, y: proposedY }

      setSnapGuides(nextMove.guides)
      onLayerChange?.(layer.id, {
        x: nextMove.x,
        y: nextMove.y,
      })
      return
    }

    const nextGeometry = resizeDraftingLayer(layer, interaction.resizeDirection ?? "se", deltaX, deltaY)
    const snappedResize = snapEnabled
      ? snapLayerResize({
          direction: interaction.resizeDirection ?? "se",
          layer,
          layers: visibleLayers,
          geometry: nextGeometry,
          threshold: snapThreshold,
        })
      : { geometry: nextGeometry, guides: { horizontal: [], vertical: [] } }

    setSnapGuides(snappedResize.guides)
    onLayerChange?.(layer.id, snappedResize.geometry)
  }

  function endLayerInteraction(event: PointerEvent<HTMLElement>) {
    if (interactionRef.current?.pointerId === event.pointerId) {
      setSnapGuides({ horizontal: [], vertical: [] })
      if (interactionRef.current.mode === "rotate") {
        if (rotationLabelTimeoutRef.current !== null) {
          window.clearTimeout(rotationLabelTimeoutRef.current)
        }
        rotationLabelTimeoutRef.current = window.setTimeout(() => {
          setRotatingLayerId(null)
          setRotationPreviewDegrees(null)
          setMultiSelectionPreview(null)
          rotationLabelTimeoutRef.current = null
        }, ROTATION_LABEL_HIDE_DELAY_MS)
      }
      interactionRef.current = null
    }
  }

  function getLayerPlacementStyle(layer: DraftingCanvasLayer): CSSProperties {
    return {
      height: layer.height,
      left: "50%",
      opacity: layer.opacity,
      top: "50%",
      transform: `translate3d(${layer.x}px, ${layer.y}px, 0) rotate(${layer.rotation}deg)`,
      transformOrigin: "center center",
      width: layer.width,
      zIndex: layer.zIndex,
    }
  }

  function renderLayerControls(layer: DraftingCanvasLayer) {
    if (activeSelectedLayerIds.length !== 1 || layer.isLocked || !activeSelectedLayerIdSet.has(layer.id)) {
      return null
    }

    const controlHeight = layer.height + RESIZE_CONTROL_PADDING_PX * 2
    const controlWidth = layer.width + RESIZE_CONTROL_PADDING_PX * 2
    const isRotating = rotatingLayerId === layer.id
    const rotationDegrees = rotationPreviewDegrees ?? getLayerRotationLabel(layer.rotation)

    return (
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 touch-none border border-[var(--drafting-ink)]"
        data-layer-id={layer.id}
        data-slot="drafting-layer-resize-frame"
        key={`${layer.id}:controls`}
        style={{
          height: controlHeight,
          transform: `translate3d(${layer.x - RESIZE_CONTROL_PADDING_PX}px, ${layer.y - RESIZE_CONTROL_PADDING_PX}px, 0) rotate(${layer.rotation}deg)`,
          transformOrigin: "center center",
          width: controlWidth,
          zIndex: 10000,
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 w-px -translate-x-1/2 -translate-y-full bg-[var(--drafting-ink)]"
          style={{ height: ROTATE_HANDLE_OFFSET_PX }}
        />
        {isRotating ? (
          <div
            className="pointer-events-none absolute left-1/2 top-0 rounded-[4px] border border-[var(--drafting-line-hover)] bg-[var(--drafting-panel-bg-active)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)]"
            data-slot="drafting-layer-rotation-value"
            style={{
              transform: `translate(-50%, calc(-${ROTATE_HANDLE_OFFSET_PX}px - ${ROTATE_HANDLE_RADIUS_PX}px - ${ROTATE_LABEL_GAP_PX}px - 100%))`,
            }}
          >
            {rotationDegrees}°
          </div>
        ) : null}
        <button
          aria-label={`Rotate ${layer.name}`}
          className="pointer-events-auto absolute left-1/2 top-0 z-30 flex size-5 items-center justify-center rounded-full border border-[#a8b0bb] bg-white text-[#111827] shadow-[var(--drafting-shadow-rest)]"
          data-slot="drafting-layer-rotate-handle"
          onClick={(event) => event.stopPropagation()}
          onPointerCancel={endLayerInteraction}
          onPointerDown={(event) => startLayerInteraction(event, layer, "rotate")}
          onPointerMove={updateLayerInteraction}
          onPointerUp={endLayerInteraction}
          style={{
            transform: `translate(-50%, calc(-${ROTATE_HANDLE_OFFSET_PX}px - 50%))`,
          }}
          type="button"
        >
          <RotateCwIcon aria-hidden="true" className="size-3" strokeWidth={2.2} />
        </button>
        {RESIZE_HANDLES.map((handle) => (
          <button
            aria-label={`Resize ${layer.name} from ${handle.label}`}
            className={cn(
              "pointer-events-auto absolute z-30 size-3 rounded-full border border-[#a8b0bb] bg-white shadow-[var(--drafting-shadow-rest)]",
              handle.className,
              handle.cursorClassName,
            )}
            data-resize-direction={handle.direction}
            data-slot="drafting-layer-resize-handle"
            key={handle.direction}
            onClick={(event) => event.stopPropagation()}
            onPointerCancel={endLayerInteraction}
            onPointerDown={(event) => startLayerInteraction(event, layer, "resize", handle.direction)}
            onPointerMove={updateLayerInteraction}
            onPointerUp={endLayerInteraction}
            type="button"
          />
        ))}
      </div>
    )
  }

  function createMultiLayerControls() {
    const bounds = multiSelectionPreview?.bounds ?? combinedLayerBounds

    if (activeSelectedLayerIds.length < 2 || !bounds) {
      return null
    }

    const controlHeight = bounds.height + RESIZE_CONTROL_PADDING_PX * 2
    const controlWidth = bounds.width + RESIZE_CONTROL_PADDING_PX * 2
    const isRotating = rotatingLayerId === "selection"
    const rotationDegrees = multiSelectionPreview?.rotation ?? rotationPreviewDegrees ?? 0
    const rotationTransform = isRotating ? ` rotate(${rotationDegrees}deg)` : ""

    return (
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 touch-none border border-[var(--drafting-ink)]"
        data-layer-ids={activeSelectedLayerIds.join(" ")}
        data-slot="drafting-layer-multi-select-frame"
        style={{
          height: controlHeight,
          transform: `translate3d(${bounds.x - RESIZE_CONTROL_PADDING_PX}px, ${bounds.y - RESIZE_CONTROL_PADDING_PX}px, 0)${rotationTransform}`,
          transformOrigin: "center center",
          width: controlWidth,
          zIndex: 50,
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 w-px -translate-x-1/2 -translate-y-full bg-[var(--drafting-ink)]"
          style={{ height: ROTATE_HANDLE_OFFSET_PX }}
        />
        {isRotating ? (
          <div
            className="pointer-events-none absolute left-1/2 top-0 rounded-[4px] border border-[var(--drafting-line-hover)] bg-[var(--drafting-panel-bg-active)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)]"
            data-slot="drafting-layer-rotation-value"
            style={{
              transform: `translate(-50%, calc(-${ROTATE_HANDLE_OFFSET_PX}px - ${ROTATE_HANDLE_RADIUS_PX}px - ${ROTATE_LABEL_GAP_PX}px - 100%))`,
            }}
          >
            {rotationDegrees}°
          </div>
        ) : null}
        <button
          aria-label="Rotate selection"
          className="pointer-events-auto absolute left-1/2 top-0 z-30 flex size-5 items-center justify-center rounded-full border border-[#a8b0bb] bg-white text-[#111827] shadow-[var(--drafting-shadow-rest)]"
          data-slot="drafting-layer-rotate-handle"
          onClick={(event) => event.stopPropagation()}
          onPointerCancel={endLayerInteraction}
          onPointerDown={(event) => startMultiLayerInteraction(event, "rotate")}
          onPointerMove={updateLayerInteraction}
          onPointerUp={endLayerInteraction}
          style={{
            transform: `translate(-50%, calc(-${ROTATE_HANDLE_OFFSET_PX}px - 50%))`,
          }}
          type="button"
        >
          <RotateCwIcon aria-hidden="true" className="size-3" strokeWidth={2.2} />
        </button>
        {RESIZE_HANDLES.map((handle) => (
          <button
            aria-label={`Resize selection from ${handle.label}`}
            className={cn(
              "pointer-events-auto absolute z-30 size-3 rounded-full border border-[#a8b0bb] bg-white shadow-[var(--drafting-shadow-rest)]",
              handle.className,
              handle.cursorClassName,
            )}
            data-resize-direction={handle.direction}
            data-slot="drafting-layer-resize-handle"
            key={handle.direction}
            onClick={(event) => event.stopPropagation()}
            onPointerCancel={endLayerInteraction}
            onPointerDown={(event) => startMultiLayerInteraction(event, "resize", handle.direction)}
            onPointerMove={updateLayerInteraction}
            onPointerUp={endLayerInteraction}
            type="button"
          />
        ))}
      </div>
    )
  }

  function renderLayer(layer: DraftingCanvasLayer) {
    const isLayerSelected = activeSelectedLayerIdSet.has(layer.id)

    if (layer.kind === "qr") {
      const qrMarkup = markup ? applyDraftingQrForegroundShadow(markup, layer) : ""

      return (
        <div
          key={layer.id}
          data-slot="dashboard-compose-node"
          data-layer-id={layer.id}
          data-node-id={state.data}
          data-selected={isLayerSelected ? "true" : "false"}
          className={cn(
            "absolute max-h-none max-w-none cursor-move touch-none",
            layer.isLocked && "cursor-default",
          )}
          style={{
            ...getLayerPlacementStyle(layer),
            filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
          }}
          onClick={(event) => {
            event.stopPropagation()
            onLayerSelect?.(layer.id, { additive: event.metaKey || event.ctrlKey })
            onQrClick()
          }}
          onPointerDown={(event) => startLayerInteraction(event, layer, "move")}
          onPointerMove={updateLayerInteraction}
          onPointerUp={endLayerInteraction}
          onPointerCancel={endLayerInteraction}
        >
          <DraftingQrBackground layer={layer} state={state} />
          <div
            className="relative z-10 h-full w-full max-h-full max-w-full [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrMarkup }}
          />
        </div>
      )
    }

    return (
      <div
        key={layer.id}
        data-slot="dashboard-compose-card"
        data-layer-id={layer.id}
        data-card-pattern={isPaperShaderMode || isImageFilterMode || isImageMode ? "none" : cardState.patternId}
        data-card-paper-shader={
          isPaperShaderMode
            ? cardState.paperShader.shaderId
            : isImageFilterMode
              ? cardState.imageFilter.shaderId
              : "none"
        }
        data-card-shadow-blur={layer.shadow.blur}
        data-card-shadow-offset-x={layer.shadow.offsetX}
        data-card-shadow-offset-y={layer.shadow.offsetY}
        data-card-style-mode={cardState.styleMode}
        data-card-enabled={layer.isVisible ? "true" : "false"}
        data-card-border-width={cardState.border.width}
        data-selected={isLayerSelected ? "true" : "false"}
        className={cn(
          "absolute max-h-none max-w-none cursor-move transition-[box-shadow,background-color,border-radius] duration-150",
          "overflow-visible",
          layer.isLocked && "cursor-default",
        )}
        style={{
          ...cardStyle,
          ...getLayerPlacementStyle(layer),
          boxShadow: getDraftingCardShadow({ ...cardState, shadow: layer.shadow }),
          filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
        }}
        onClick={(event) => {
          event.stopPropagation()
          onLayerSelect?.(layer.id, { additive: event.metaKey || event.ctrlKey })
        }}
        onPointerDown={(event) => startLayerInteraction(event, layer, "move")}
        onPointerMove={updateLayerInteraction}
        onPointerUp={endLayerInteraction}
        onPointerCancel={endLayerInteraction}
      >
        {isImageMode && cardState.cardImage.value ? (
          <div
            aria-hidden="true"
            data-slot="dashboard-compose-card-image"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              ...cardImageStyle,
              borderRadius: "inherit",
              opacity: cardState.cardImage.opacity / 100,
            }}
          />
        ) : null}
        {isPaperShaderMode ? (
          <DraftingCardPaperShaderLayer paperShader={cardState.paperShader} />
        ) : null}
        {isImageFilterMode ? (
          <DraftingCardPaperShaderLayer paperShader={imageFilterShader} />
        ) : null}
      </div>
    )
  }

  return (
    <div
      data-slot="qr-pane"
      data-selected={isSelected ? "true" : "false"}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      onClick={(e) => {
        // Only select if clicking the pane background, not the QR itself
        if (e.target === e.currentTarget) {
          onSelect()
        }
      }}
    >
      <div
        data-slot="dashboard-compose-canvas"
        data-compose-mode="compose"
        className="relative h-full w-full overflow-visible"
        onClick={() => {
          onLayerSelect?.(null)
          onSelect()
        }}
      >
        {isLoading ? (
          <div className="grid h-full place-items-center text-sm font-medium text-[var(--drafting-ink-muted)]">
            Loading QR…
          </div>
        ) : markup ? (
          <>
            <SnapGuideOverlay guides={snapGuides} />
            {visibleLayers.map(renderLayer)}
            {activeSelectedLayerIds.length > 0
              ? visibleLayers.map((layer) => renderLayerControls(layer))
              : null}
            {createMultiLayerControls()}
          </>
        ) : (
          <div className="grid h-full place-items-center text-sm font-medium text-[var(--drafting-ink-muted)]">
            Could not generate QR
          </div>
        )}
      </div>
    </div>
  )
},
(previousProps, nextProps) =>
  previousProps.cardState === nextProps.cardState &&
  previousProps.state === nextProps.state &&
  previousProps.isSelected === nextProps.isSelected &&
  previousProps.interactionScale === nextProps.interactionScale &&
  previousProps.layers === nextProps.layers &&
  previousProps.selectedLayerId === nextProps.selectedLayerId &&
  previousProps.selectedLayerIds === nextProps.selectedLayerIds &&
  previousProps.snapEnabled === nextProps.snapEnabled,
)
