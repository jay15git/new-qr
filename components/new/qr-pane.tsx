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
  onLayerSelect?: (layerId: string) => void
  onSelect: () => void
  onQrClick: () => void
  selectedLayerId?: string | null
  state: QrStudioState
}

type ResizeDirection = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"

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

export const QrPane = memo(function QrPane({
  cardState = DEFAULT_DRAFTING_CARD_STATE,
  interactionScale = 1,
  state,
  isSelected,
  layers,
  onLayerChange,
  onLayerSelect,
  onSelect,
  onQrClick,
  selectedLayerId,
}: QrPaneProps) {
  const [markup, setMarkup] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const interactionRef = useRef<{
    layer: DraftingCanvasLayer
    mode: "move" | "resize"
    pointerId: number
    resizeDirection?: ResizeDirection
    startX: number
    startY: number
  } | null>(null)
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

    void buildDashboardQrNodePayload(qrArtworkState)
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
    mode: "move" | "resize",
    resizeDirection?: ResizeDirection,
  ) {
    if (layer.isLocked || !onLayerChange) {
      return
    }

    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    interactionRef.current = {
      layer,
      mode,
      pointerId: event.pointerId,
      resizeDirection,
      startX: event.clientX,
      startY: event.clientY,
    }
    onLayerSelect?.(layer.id)
  }

  function updateLayerInteraction(event: PointerEvent<HTMLElement>) {
    const interaction = interactionRef.current

    if (!interaction || interaction.pointerId !== event.pointerId) {
      return
    }

    event.stopPropagation()
    const scale = interactionScale > 0 ? interactionScale : 1
    const deltaX = (event.clientX - interaction.startX) / scale
    const deltaY = (event.clientY - interaction.startY) / scale
    const layer = interaction.layer

    if (interaction.mode === "move") {
      onLayerChange?.(layer.id, {
        x: layer.x + deltaX,
        y: layer.y + deltaY,
      })
      return
    }

    const nextGeometry = resizeDraftingLayer(layer, interaction.resizeDirection ?? "se", deltaX, deltaY)

    onLayerChange?.(layer.id, nextGeometry)
  }

  function endLayerInteraction(event: PointerEvent<HTMLElement>) {
    if (interactionRef.current?.pointerId === event.pointerId) {
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

  function renderResizeHandles(layer: DraftingCanvasLayer) {
    if (layer.isLocked || selectedLayerId !== layer.id) {
      return null
    }

    return (
      <>
        {RESIZE_HANDLES.map((handle) => (
          <button
            aria-label={`Resize ${layer.name} from ${handle.label}`}
            className={cn(
              "absolute z-30 size-3 rounded-[3px] border border-[var(--drafting-ink)] bg-[var(--drafting-panel-bg-active)] shadow-[var(--drafting-shadow-rest)]",
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
      </>
    )
  }

  function renderLayer(layer: DraftingCanvasLayer) {
    const isLayerSelected = selectedLayerId === layer.id

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
            "outline outline-0 outline-offset-2 transition-[outline-color] duration-150",
            isLayerSelected && "outline-1 outline-[var(--drafting-ink)]",
            layer.isLocked && "cursor-default",
          )}
          style={{
            ...getLayerPlacementStyle(layer),
            filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
          }}
          onClick={(event) => {
            event.stopPropagation()
            onLayerSelect?.(layer.id)
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
          {renderResizeHandles(layer)}
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
          "absolute max-h-none max-w-none cursor-move transition-[box-shadow,background-color,border-radius,outline-color] duration-150",
          "outline outline-0 outline-offset-2",
          "overflow-hidden",
          isLayerSelected && "outline-1 outline-[var(--drafting-ink)]",
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
          onLayerSelect?.(layer.id)
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
        {renderResizeHandles(layer)}
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
        className="relative h-full w-full overflow-hidden p-4 sm:p-6 lg:p-8"
      >
        {isLoading ? (
          <div className="grid h-full place-items-center text-sm font-medium text-[var(--drafting-ink-muted)]">
            Loading QR…
          </div>
        ) : markup ? (
          visibleLayers.map(renderLayer)
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
  previousProps.layers === nextProps.layers &&
  previousProps.selectedLayerId === nextProps.selectedLayerId,
)
