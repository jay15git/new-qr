"use client"

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CopyIcon,
  ItalicIcon,
  LockIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  RotateCwIcon,
  Trash2Icon,
  TypeIcon,
  UnderlineIcon,
  UnlockIcon,
} from "lucide-react"

import {
  DEFAULT_DRAFTING_CARD_STATE,
  type DraftingCardState,
} from "@/features/workspace/model/card-state"
import { DraftingCardPaperShaderLayer } from "@/features/workspace/components/CardPaperShaderLayer"
import { getDraftingCardPatternStyle } from "@/features/workspace/model/card-patterns"
import {
  createDefaultDraftingLayers,
  getDraftingMarqueeSelection,
  type DraftingLayerAlignAction,
  type DraftingLayerDistributeAction,
  type DraftingLayerReorderAction,
  type DraftingCanvasLayer,
  type DraftingTextRun,
} from "@/features/workspace/model/layers"
import {
  DRAFTING_FONT_REGISTRY,
  ensureDraftingFontsForLayers,
  getDraftingFontCssFamily,
  loadDraftingFont,
} from "@/features/workspace/model/fonts"
import {
  getDraftingTextFontFamily,
  layoutDraftingText,
} from "@/features/workspace/rendering/text-layout"
import {
  createDraftingQrArtworkState,
  sanitizeDraftingQrArtworkMarkup,
} from "@/features/workspace/rendering/qr-artwork"
import { DraftingQrBackground } from "@/features/workspace/components/QrBackground"
import { applyDraftingQrForegroundShadow } from "@/features/workspace/rendering/qr-layer-shadow"
import { buildDashboardQrNodePayload } from "@/features/qr-code/rendering/qr-svg"
import type { QrStudioState } from "@/features/qr-code/model/state"
import { cn } from "@/lib/utils"

type PaneProps = {
  cardState?: DraftingCardState
  interactionScale?: number
  isSelected: boolean
  layers?: DraftingCanvasLayer[]
  onLayerAction?: (layerIds: string[], action: DraftingLayerMenuAction) => void
  onLayerChange?: (layerId: string, patch: Partial<DraftingCanvasLayer>) => void
  onLayerCopy?: (layerIds: string[]) => void
  onLayerPaste?: (point: { x: number; y: number }) => void
  onLayerSelect?: (layerId: string | null, options?: { additive?: boolean }) => void
  onLayerSelectionChange?: (layerIds: string[], options?: { additive?: boolean }) => void
  onSelect: () => void
  onQrClick: () => void
  selectedLayerId?: string | null
  selectedLayerIds?: string[]
  snapEnabled?: boolean
  state: QrStudioState
}

export type ResizeDirection = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"
type SnapAxis = "x" | "y"
export type DraftingLayerMenuAction =
  | DraftingLayerAlignAction
  | DraftingLayerDistributeAction
  | DraftingLayerReorderAction
  | "delete"
  | "group"
  | "hide"
  | "lock"
  | "reset-rotation"
  | "show"
  | "ungroup"
  | "unlock"
type SnapGuides = {
  horizontal: number[]
  vertical: number[]
}
type LayerBounds = Pick<DraftingCanvasLayer, "height" | "id" | "width" | "x" | "y">
type TextRunStylePatch = Pick<
  DraftingTextRun,
  "fill" | "fontFamily" | "fontId" | "fontSize" | "fontStyle" | "fontWeight" | "underline"
>

const RESIZE_CONTROL_PADDING_PX = 12
const ROTATE_HANDLE_OFFSET_PX = 34
const ROTATE_HANDLE_RADIUS_PX = 10
const ROTATE_LABEL_GAP_PX = 8
const SIZE_LABEL_GAP_PX = 10
const FLOATING_TOOLBAR_GAP_PX = 14
const FLOATING_TOOLBAR_HEIGHT_PX = 38
const TEXT_FORMAT_TOOLBAR_HEIGHT_PX = 44
const ROTATION_LABEL_HIDE_DELAY_MS = 2000
const SNAP_THRESHOLD_PX = 6
const RESIZE_SNAP_THRESHOLD_PX = 3
const INTERACTION_START_THRESHOLD_PX = 3
const CONTEXT_MENU_POINTER_OFFSET_PX = 8
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

export function resizeDraftingLayer(
  layer: DraftingCanvasLayer,
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
  lockedResizeAxis?: "horizontal" | "vertical",
): Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y"> {
  if (layer.kind === "qr") {
    return resizeSquareLayer(layer, direction, deltaX, deltaY, lockedResizeAxis)
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

export function resizeSquareLayer(
  layer: DraftingCanvasLayer,
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
  lockedResizeAxis?: "horizontal" | "vertical",
): Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y"> {
  const affectsWest = direction.includes("w")
  const affectsEast = direction.includes("e")
  const affectsNorth = direction.includes("n")
  const affectsSouth = direction.includes("s")
  const horizontalDelta = affectsEast ? deltaX : affectsWest ? -deltaX : 0
  const verticalDelta = affectsSouth ? deltaY : affectsNorth ? -deltaY : 0
  const sizeDelta =
    horizontalDelta !== 0 && verticalDelta !== 0
      ? lockedResizeAxis === "horizontal"
        ? horizontalDelta
        : lockedResizeAxis === "vertical"
          ? verticalDelta
          : Math.abs(horizontalDelta) > Math.abs(verticalDelta)
            ? horizontalDelta
            : verticalDelta
      : horizontalDelta || verticalDelta
  const size = Math.max(24, layer.width + sizeDelta)

  return anchorSquareLayerResize(layer, direction, {
    height: size,
    width: size,
    x: layer.x,
    y: layer.y,
  })
}

export function anchorSquareLayerResize(
  layer: DraftingCanvasLayer,
  direction: ResizeDirection,
  geometry: Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y">,
): Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y"> {
  const affectsWest = direction.includes("w")
  const affectsEast = direction.includes("e")
  const affectsNorth = direction.includes("n")
  const affectsSouth = direction.includes("s")
  const size = Math.max(24, Math.max(geometry.width, geometry.height))
  const right = layer.x + layer.width
  const bottom = layer.y + layer.height

  return {
    height: size,
    width: size,
    x: affectsWest
      ? right - size
      : affectsEast
        ? geometry.x
        : layer.x + (layer.width - size) / 2,
    y: affectsNorth
      ? bottom - size
      : affectsSouth
        ? geometry.y
        : layer.y + (layer.height - size) / 2,
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

  const layerCorners = layers.flatMap(getLayerRotatedCorners)
  const commonRotation = getCommonLayerRotation(layers)

  if (commonRotation !== null) {
    const localCorners = layerCorners.map((point) =>
      rotatePoint(point, { x: 0, y: 0 }, -commonRotation),
    )
    const localBounds = getPointBounds(localCorners)
    const localCenter = {
      x: localBounds.x + localBounds.width / 2,
      y: localBounds.y + localBounds.height / 2,
    }
    const center = rotatePoint(localCenter, { x: 0, y: 0 }, commonRotation)

    return {
      height: roundLayerNumber(localBounds.height),
      rotation: commonRotation,
      width: roundLayerNumber(localBounds.width),
      x: roundLayerNumber(center.x - localBounds.width / 2),
      y: roundLayerNumber(center.y - localBounds.height / 2),
    }
  }

  const bounds = getPointBounds(layerCorners)

  return {
    height: roundLayerNumber(bounds.height),
    rotation: 0,
    width: roundLayerNumber(bounds.width),
    x: roundLayerNumber(bounds.x),
    y: roundLayerNumber(bounds.y),
  }
}

function getLayerRotatedCorners(layer: DraftingCanvasLayer) {
  const center = {
    x: layer.x + layer.width / 2,
    y: layer.y + layer.height / 2,
  }
  const corners = [
    { x: layer.x, y: layer.y },
    { x: layer.x + layer.width, y: layer.y },
    { x: layer.x + layer.width, y: layer.y + layer.height },
    { x: layer.x, y: layer.y + layer.height },
  ]

  return corners.map((point) => rotatePoint(point, center, layer.rotation))
}

function getCommonLayerRotation(layers: DraftingCanvasLayer[]) {
  const [firstLayer] = layers
  const firstRotation = normalizeLayerRotation(firstLayer?.rotation ?? 0)

  return layers.every((layer) => Math.abs(normalizeLayerRotation(layer.rotation) - firstRotation) < 0.001)
    ? firstRotation
    : null
}

function getPointBounds(points: { x: number; y: number }[]) {
  const left = Math.min(...points.map((point) => point.x))
  const top = Math.min(...points.map((point) => point.y))
  const right = Math.max(...points.map((point) => point.x))
  const bottom = Math.max(...points.map((point) => point.y))

  return {
    height: bottom - top,
    width: right - left,
    x: left,
    y: top,
  }
}

function getMarqueeBounds(
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  const x = Math.min(start.x, end.x)
  const y = Math.min(start.y, end.y)

  return {
    height: Math.abs(end.y - start.y),
    width: Math.abs(end.x - start.x),
    x,
    y,
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

function getLayerSizeLabel({
  height,
  width,
}: Pick<DraftingCanvasLayer, "height" | "width">) {
  return `${Math.round(width)} x ${Math.round(height)}`
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
    Object.assign(nextGeometry, anchorSquareLayerResize(layer, direction, nextGeometry))
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

function LayerContextMenu({
  layerCount,
  layers,
  onAction,
  style,
}: {
  layerCount: number
  layers: DraftingCanvasLayer[]
  onAction: (action: DraftingLayerMenuAction) => void
  style: CSSProperties
}) {
  const isMultiLayer = layerCount > 1
  const hasSelection = layerCount > 0
  const hasHiddenLayer = layers.some((layer) => !layer.isVisible)
  const hasGroupLayer = layers.some((layer) => layer.kind === "group")

  return (
    <div
      className="fixed z-[20000] min-w-52 rounded-[18px] border border-[var(--drafting-dropdown-border)] bg-[var(--drafting-dropdown-menu-surface-open)] p-1.5 text-[var(--drafting-dropdown-text)] shadow-[var(--drafting-dropdown-menu-shadow-open)]"
      data-drafting-dropdown-content="true"
      data-slot="drafting-layer-context-menu"
      data-toolbar-appearance="desktop-glass"
      role="menu"
      style={style}
      tabIndex={-1}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {hasSelection ? (
        <>
          <LayerContextMenuButton label="Bring to front" onClick={() => onAction("front")} />
          <LayerContextMenuButton label="Bring forward" onClick={() => onAction("forward")} />
          <LayerContextMenuButton label="Send backward" onClick={() => onAction("backward")} />
          <LayerContextMenuButton label="Send to back" onClick={() => onAction("back")} />
          <LayerContextMenuSeparator />
          <LayerContextMenuButton
            label={hasHiddenLayer ? "Show" : "Hide"}
            onClick={() => onAction(hasHiddenLayer ? "show" : "hide")}
          />
          <LayerContextMenuButton label="Reset rotation" onClick={() => onAction("reset-rotation")} />
          {isMultiLayer ? (
            <>
              <LayerContextMenuSeparator />
              <LayerContextMenuButton label="Group" onClick={() => onAction("group")} />
              <LayerContextMenuButton label="Distribute selection horizontally" onClick={() => onAction("horizontal")} />
              <LayerContextMenuButton label="Distribute selection vertically" onClick={() => onAction("vertical")} />
            </>
          ) : null}
          {hasGroupLayer ? (
            <>
              <LayerContextMenuSeparator />
              <LayerContextMenuButton label="Ungroup" onClick={() => onAction("ungroup")} />
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function LayerContextMenuButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      className="block h-8 w-full rounded-full px-3 text-left text-[12px] font-semibold text-current transition-[background-color,color] duration-150 hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
      role="menuitem"
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function LayerContextMenuSeparator() {
  return (
    <div
      aria-hidden="true"
      className="my-1 h-px bg-white/[0.12]"
      data-slot="drafting-layer-context-menu-separator"
    />
  )
}

function LayerFloatingToolbar({
  layers,
  onAction,
  onCopy,
  onMore,
  style,
}: {
  layers: DraftingCanvasLayer[]
  onAction?: (action: DraftingLayerMenuAction) => void
  onCopy?: () => void
  onMore: (event: MouseEvent<HTMLButtonElement>) => void
  style: CSSProperties
}) {
  const hasUnlockedLayer = layers.some((layer) => !layer.isLocked)
  const hasRemovableLayer = layers.some((layer) => layer.kind !== "qr")
  const lockAction = hasUnlockedLayer ? "lock" : "unlock"
  const lockLabel = hasUnlockedLayer ? "Lock selection" : "Unlock selection"
  const LockActionIcon = hasUnlockedLayer ? LockIcon : UnlockIcon

  return (
    <div
      className="absolute left-1/2 top-1/2 z-[10001] inline-flex h-11 items-center gap-1 rounded-full border border-white/[0.12] bg-[#171717] px-2 text-white/78 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)]"
      data-slot="drafting-layer-floating-toolbar"
      data-toolbar-appearance="desktop-glass"
      role="toolbar"
      style={style}
      tabIndex={-1}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <LayerFloatingToolbarButton
        label="Copy selection"
        disabled={!onCopy}
        onClick={() => onCopy?.()}
      >
        <CopyIcon aria-hidden="true" className="size-4" strokeWidth={2} />
      </LayerFloatingToolbarButton>
      <LayerFloatingToolbarButton
        label={lockLabel}
        disabled={!onAction}
        onClick={() => onAction?.(lockAction)}
      >
        <LockActionIcon aria-hidden="true" className="size-4" strokeWidth={2} />
      </LayerFloatingToolbarButton>
      <LayerFloatingToolbarButton
        label="Delete selection"
        disabled={!onAction || !hasRemovableLayer}
        onClick={() => onAction?.("delete")}
      >
        <Trash2Icon aria-hidden="true" className="size-4" strokeWidth={2} />
      </LayerFloatingToolbarButton>
      <div className="mx-0.5 h-4 w-px bg-white/[0.12]" data-slot="drafting-layer-toolbar-separator" />
      <LayerFloatingToolbarButton label="More layer actions" onClick={onMore}>
        <MoreHorizontalIcon aria-hidden="true" className="size-4" strokeWidth={2} />
      </LayerFloatingToolbarButton>
    </div>
  )
}

function LayerFloatingToolbarButton({
  children,
  disabled = false,
  label,
  onClick,
}: {
  children: ReactNode
  disabled?: boolean
  label: string
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full text-current transition-[background-color,color] duration-150 hover:bg-[var(--drafting-layer-toolbar-button-hover-bg,rgba(255,255,255,0.11))] hover:text-[var(--drafting-layer-toolbar-button-hover-text,white)] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
      data-slot="drafting-layer-floating-toolbar-button"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function TextFormatFloatingToolbar({
  layer,
  onFormatSelection,
  onPatch,
  style,
}: {
  layer: DraftingCanvasLayer
  onFormatSelection: (patch: TextRunStylePatch) => void
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
  style: CSSProperties
}) {
  const selectedStyle = getTextLayerFormat(layer)
  const selectedFontWeight =
    selectedStyle.fontWeight === "bold"
      ? 700
      : typeof selectedStyle.fontWeight === "number"
        ? selectedStyle.fontWeight
        : 400
  const selectedFontId = selectedStyle.fontId ?? "local:satoshi"
  const selectedTextAlign = layer.textAlign ?? "left"
  const selectedTextColor = selectedStyle.fill ?? "#171717"
  const selectedTextSize = selectedStyle.fontSize ?? 32
  const fontOptions = DRAFTING_FONT_REGISTRY.slice(0, 8)
  const visibleFontOptions = fontOptions.some((font) => font.id === selectedFontId)
    ? fontOptions
    : [
        ...fontOptions,
        DRAFTING_FONT_REGISTRY.find((font) => font.id === selectedFontId) ??
          DRAFTING_FONT_REGISTRY[0],
      ]
  const fontInputId = `desktop-text-font-${layer.id}`
  const sizeInputId = `desktop-text-size-${layer.id}`
  const colorInputId = `desktop-text-color-${layer.id}`

  function handleFontChange(fontId: string) {
    const font = DRAFTING_FONT_REGISTRY.find((entry) => entry.id === fontId)
    if (!font) return

    void loadDraftingFont(font.id)
    onFormatSelection({ fontFamily: font.family, fontId: font.id })
  }

  return (
    <div
      className="absolute left-1/2 top-1/2 z-[10002] inline-flex h-11 max-w-[min(560px,calc(100vw-2rem))] items-center gap-1 overflow-x-auto rounded-full border border-white/[0.12] bg-black/55 px-2 text-white/78 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
      data-slot="desktop-text-format-toolbar"
      data-toolbar-appearance="desktop-glass"
      role="toolbar"
      style={style}
      tabIndex={-1}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <label className="sr-only" htmlFor={fontInputId}>
        Text font
      </label>
      <div className="flex h-8 items-center gap-1.5 rounded-full bg-white/[0.08] pl-2.5 pr-1.5">
        <TypeIcon aria-hidden="true" className="size-3.5 shrink-0" />
        <select
          aria-label="Text font"
          className="h-7 min-w-28 max-w-36 bg-transparent text-xs font-semibold text-current outline-none"
          id={fontInputId}
          value={selectedFontId}
          onChange={(event) => handleFontChange(event.currentTarget.value)}
        >
          {visibleFontOptions.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <label className="sr-only" htmlFor={sizeInputId}>
        Text size
      </label>
      <input
        aria-label="Text size"
        className="h-8 w-14 rounded-full border-0 bg-white/[0.08] px-2 text-center text-xs font-semibold text-current outline-none"
        id={sizeInputId}
        max={180}
        min={8}
        type="number"
        value={selectedTextSize}
        onChange={(event) => {
          const fontSize = Number(event.currentTarget.value)
          if (Number.isFinite(fontSize)) {
            onFormatSelection({ fontSize })
          }
        }}
      />

      <TextFormatButton
        active={selectedFontWeight >= 700}
        label="Bold text"
        onClick={() => onFormatSelection({ fontWeight: selectedFontWeight >= 700 ? "normal" : 700 })}
      >
        <BoldIcon aria-hidden="true" className="size-4" />
      </TextFormatButton>
      <TextFormatButton
        active={selectedStyle.fontStyle === "italic"}
        label="Italic text"
        onClick={() => onFormatSelection({ fontStyle: selectedStyle.fontStyle === "italic" ? "normal" : "italic" })}
      >
        <ItalicIcon aria-hidden="true" className="size-4" />
      </TextFormatButton>
      <TextFormatButton
        active={Boolean(selectedStyle.underline)}
        label="Underline text"
        onClick={() => onFormatSelection({ underline: !selectedStyle.underline })}
      >
        <UnderlineIcon aria-hidden="true" className="size-4" />
      </TextFormatButton>

      <div className="mx-1 h-5 w-px shrink-0 bg-white/[0.14]" />

      {[
        ["left", AlignLeftIcon, "Align text left"],
        ["center", AlignCenterIcon, "Align text center"],
        ["right", AlignRightIcon, "Align text right"],
      ].map(([align, Icon, label]) => (
        <TextFormatButton
          active={selectedTextAlign === align}
          key={align as string}
          label={label as string}
          onClick={() => onPatch({ textAlign: align as DraftingCanvasLayer["textAlign"] })}
        >
          <Icon aria-hidden="true" className="size-4" />
        </TextFormatButton>
      ))}

      <label
        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full transition hover:bg-white/[0.11] hover:text-white"
        htmlFor={colorInputId}
      >
        <span className="sr-only">Text color</span>
        <PaletteIcon aria-hidden="true" className="size-4" />
      </label>
      <input
        aria-label="Text color"
        className="h-8 w-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-1"
        id={colorInputId}
        type="color"
        value={selectedTextColor}
        onChange={(event) => onFormatSelection({ fill: event.currentTarget.value })}
      />
    </div>
  )
}

function TextFormatButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full transition hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45",
        active && "bg-white/[0.16] text-white",
      )}
      type="button"
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (event.detail === 0) {
          onClick()
        }
      }}
    >
      {children}
    </button>
  )
}

function LayerSizeValue({ height, width }: Pick<DraftingCanvasLayer, "height" | "width">) {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 w-max min-w-[4.75rem] whitespace-nowrap rounded-full border border-white/[0.12] bg-black/55 px-2.5 py-1 text-center text-[0.68rem] font-semibold leading-none text-white/82 shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
      data-slot="drafting-layer-size-value"
      data-toolbar-appearance="desktop-glass"
      style={{
        transform: `translate(-50%, calc(100% + ${SIZE_LABEL_GAP_PX}px))`,
      }}
    >
      {getLayerSizeLabel({ height, width })}
    </div>
  )
}

function getTextLayerStyle(layer: DraftingCanvasLayer): CSSProperties {
  return {
    color: layer.fill ?? "#171717",
    fontFamily: getDraftingTextFontFamily(layer),
    fontSize: layer.fontSize ?? 32,
    fontStyle: layer.fontStyle ?? "normal",
    fontWeight: layer.fontWeight ?? "normal",
    letterSpacing: layer.letterSpacing ?? 0,
    lineHeight: layer.lineHeight ?? 1.22,
    textAlign: layer.textAlign ?? "left",
    textDecorationLine: layer.underline ? "underline" : "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  }
}

function getTextRunStyle(layer: DraftingCanvasLayer, run: DraftingTextRun): CSSProperties {
  return {
    color: run.fill ?? layer.fill ?? "#171717",
    fontFamily: getDraftingFontCssFamily({
      fontFamily: run.fontFamily ?? layer.fontFamily,
      fontId: run.fontId ?? layer.fontId,
    }),
    fontSize: run.fontSize ?? layer.fontSize ?? 32,
    fontStyle: run.fontStyle ?? layer.fontStyle ?? "normal",
    fontWeight: run.fontWeight ?? layer.fontWeight ?? "normal",
    textDecorationLine: (run.underline ?? layer.underline) ? "underline" : "none",
  }
}

function getTextLayerRuns(layer: DraftingCanvasLayer): DraftingTextRun[] {
  const text = layer.text ?? ""
  const runs = layer.textRuns

  if (!runs?.length || runs.map((run) => run.text).join("") !== text) {
    return text ? [{ text }] : []
  }

  return runs
}

function hasValidTextRuns(layer: DraftingCanvasLayer) {
  return Boolean(layer.textRuns?.length) && layer.textRuns?.map((run) => run.text).join("") === (layer.text ?? "")
}

function renderTextLayerContent(layer: DraftingCanvasLayer) {
  if (hasValidTextRuns(layer)) {
    return getTextLayerRuns(layer).map((run, index) => (
      <span
        data-slot="drafting-text-run"
        key={getTextRunKey(layer.id, run, index)}
        style={getTextRunStyle(layer, run)}
      >
        {run.text}
      </span>
    ))
  }

  const layout = layoutDraftingText(layer)

  return layout.lines.map((line, index) => (
    <div
      data-slot="drafting-text-line"
      key={`${layer.id}:line:${index}`}
      style={{ minHeight: layout.lineHeight }}
    >
      {line || "\u00a0"}
      {line && index < layout.lines.length - 1 ? " " : null}
    </div>
  ))
}

function getTextLayerFormat(layer: DraftingCanvasLayer): TextRunStylePatch {
  return {
    fill: layer.fill,
    fontFamily: layer.fontFamily,
    fontId: layer.fontId,
    fontSize: layer.fontSize,
    fontStyle: layer.fontStyle,
    fontWeight: layer.fontWeight,
    underline: layer.underline,
  }
}

function getTextRunKey(layerId: string, run: DraftingTextRun, index: number) {
  return `${layerId}:run:${index}:${run.text.length}`
}

export const Pane = memo(function Pane({
  cardState = DEFAULT_DRAFTING_CARD_STATE,
  interactionScale = 1,
  snapEnabled = true,
  state,
  isSelected,
  layers,
  onLayerAction,
  onLayerChange,
  onLayerCopy,
  onLayerSelect,
  onLayerSelectionChange,
  onSelect,
  onQrClick,
  selectedLayerId,
  selectedLayerIds,
}: PaneProps) {
  const [markup, setMarkup] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [rotatingLayerId, setRotatingLayerId] = useState<string | null>(null)
  const [isLayerInteracting, setIsLayerInteracting] = useState(false)
  const [canvasHeight, setCanvasHeight] = useState(0)
  const [rotationPreviewDegrees, setRotationPreviewDegrees] = useState<number | null>(null)
  const [multiSelectionPreview, setMultiSelectionPreview] = useState<{
    bounds: Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y"> & { rotation?: number }
    rotation: number
  } | null>(null)
  const [snapGuides, setSnapGuides] = useState<SnapGuides>({
    horizontal: [],
    vertical: [],
  })
  const [contextMenu, setContextMenu] = useState<{
    layerIds: string[]
    scenePoint?: { x: number; y: number }
    x: number
    y: number
  } | null>(null)
  const [marquee, setMarquee] = useState<{
    additive: boolean
    end: { x: number; y: number }
    pointerId: number
    start: { x: number; y: number }
  } | null>(null)
  const [editingTextLayerId, setEditingTextLayerId] = useState<string | null>(null)
  const [editingTextDraft, setEditingTextDraft] = useState("")
  const interactionRef = useRef<{
    centerClientX?: number
    centerClientY?: number
    groupBounds?: Pick<DraftingCanvasLayer, "height" | "width" | "x" | "y"> & { rotation?: number }
    groupCenter?: { x: number; y: number }
    layers?: DraftingCanvasLayer[]
    layer: DraftingCanvasLayer
    lockedResizeAxis?: "horizontal" | "vertical"
    mode: "move" | "resize" | "rotate"
    pointerId: number
    resizeDirection?: ResizeDirection
    startAngle?: number
    startRotation?: number
    startX: number
    startY: number
  } | null>(null)
  const rotationLabelTimeoutRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const textEditorRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const marqueeRef = useRef<typeof marquee>(null)
  const suppressCanvasClickRef = useRef(false)
  const suppressLayerClickRef = useRef(false)
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

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const updateCanvasHeight = () => {
      setCanvasHeight(canvas.getBoundingClientRect().height)
    }

    updateCanvasHeight()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateCanvasHeight)
      return () => window.removeEventListener("resize", updateCanvasHeight)
    }

    const observer = new ResizeObserver(updateCanvasHeight)
    observer.observe(canvas)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!contextMenu) {
      return
    }

    function closeContextMenuOnOutsidePointer(event: Event) {
      const target = event.target

      if (
        target instanceof Element &&
        target.closest('[data-slot="drafting-layer-context-menu"]')
      ) {
        return
      }

      setContextMenu(null)
    }

    document.addEventListener("pointerdown", closeContextMenuOnOutsidePointer, true)

    return () => {
      document.removeEventListener("pointerdown", closeContextMenuOnOutsidePointer, true)
    }
  }, [contextMenu])

  const isLoading = markup === null && !hasError
  const resolvedLayers = useMemo(
    () =>
      layers && layers.length > 0
        ? layers
        : createDefaultDraftingLayers("preview", state, cardState),
    [cardState, layers, state],
  )

  useEffect(() => {
    void ensureDraftingFontsForLayers(resolvedLayers)
  }, [resolvedLayers])

  useEffect(() => {
    if (!editingTextLayerId) {
      return
    }

    const editor = textEditorRefs.current[editingTextLayerId]
    editor?.focus()
    editor?.setSelectionRange(editor.value.length, editor.value.length)
  }, [editingTextLayerId])

  const visibleLayers = resolvedLayers
    .filter((layer) => layer.isVisible)
    .sort((a, b) => a.zIndex - b.zIndex)
  const activeSelectedLayerIds = selectedLayerIds ?? (selectedLayerId ? [selectedLayerId] : [])
  const activeSelectedLayerIdSet = new Set(activeSelectedLayerIds)
  const selectedVisibleLayers = visibleLayers.filter((layer) => activeSelectedLayerIdSet.has(layer.id))
  const selectedVisibleLayerIds = selectedVisibleLayers.map((layer) => layer.id)
  const contextMenuLayers = contextMenu
    ? resolvedLayers.filter((layer) => contextMenu.layerIds.includes(layer.id))
    : []
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
    if (editingTextLayerId && editingTextLayerId !== layer.id) {
      commitEditingTextDraft()
    }

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
    setIsLayerInteracting(true)
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

  function openLayerContextMenu(
    event: MouseEvent<HTMLElement>,
    layerIds: string[],
  ) {
    if (layerIds.length === 0) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      layerIds,
      scenePoint: getScenePointFromClientPoint(event.clientX, event.clientY),
      x: event.clientX,
      y: event.clientY + CONTEXT_MENU_POINTER_OFFSET_PX,
    })
    onLayerSelect?.(layerIds.at(-1) ?? null)
  }

  function openFloatingLayerContextMenu(
    event: MouseEvent<HTMLButtonElement>,
    layerIds: string[],
  ) {
    if (layerIds.length === 0) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left
    const y = rect.bottom + CONTEXT_MENU_POINTER_OFFSET_PX

    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      layerIds,
      scenePoint: getScenePointFromClientPoint(rect.left + rect.width / 2, rect.bottom),
      x,
      y,
    })
    onLayerSelect?.(layerIds.at(-1) ?? null)
  }

  function openCanvasContextMenu(event: MouseEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      layerIds: activeSelectedLayerIds,
      scenePoint: getScenePointFromClientPoint(event.clientX, event.clientY),
      x: event.clientX,
      y: event.clientY + CONTEXT_MENU_POINTER_OFFSET_PX,
    })
  }

  function runLayerAction(action: DraftingLayerMenuAction) {
    if (!contextMenu || contextMenu.layerIds.length === 0) {
      return
    }

    onLayerAction?.(contextMenu.layerIds, action)
    setContextMenu(null)
  }

  function runSelectedLayerAction(action: DraftingLayerMenuAction) {
    if (selectedVisibleLayerIds.length === 0) {
      return
    }

    onLayerAction?.(selectedVisibleLayerIds, action)
  }

  function runSelectedLayerCopy() {
    if (selectedVisibleLayerIds.length === 0) {
      return
    }

    onLayerCopy?.(selectedVisibleLayerIds)
  }

  function getScenePointFromClientPoint(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect()
    const scale = interactionScale > 0 ? interactionScale : 1

    if (!rect) {
      return { x: 0, y: 0 }
    }

    return {
      x: (clientX - (rect.left + rect.width / 2)) / scale,
      y: (clientY - (rect.top + rect.height / 2)) / scale,
    }
  }

  function startMarqueeSelection(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || event.target !== event.currentTarget) {
      return
    }

    if (editingTextLayerId) {
      commitEditingTextDraft()
    }

    const point = getScenePointFromClientPoint(event.clientX, event.clientY)

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setContextMenu(null)
    const nextMarquee = {
      additive: event.shiftKey || event.metaKey || event.ctrlKey,
      end: point,
      pointerId: event.pointerId,
      start: point,
    }
    marqueeRef.current = nextMarquee
    setMarquee(nextMarquee)
  }

  function updateMarqueeSelection(event: PointerEvent<HTMLElement>) {
    const current = marqueeRef.current

    if (!current || current.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const nextMarquee = {
      ...current,
      end: getScenePointFromClientPoint(event.clientX, event.clientY),
    }
    marqueeRef.current = nextMarquee
    setMarquee(nextMarquee)
  }

  function endMarqueeSelection(event: PointerEvent<HTMLElement>) {
    const current = marqueeRef.current

    if (!current || current.pointerId !== event.pointerId) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    marqueeRef.current = null
    setMarquee(null)

    const moved =
      Math.abs(current.end.x - current.start.x) > 1 ||
      Math.abs(current.end.y - current.start.y) > 1
    suppressCanvasClickRef.current = moved

    const selectedIds = getDraftingMarqueeSelection(
      visibleLayers,
      getMarqueeBounds(current.start, current.end),
    )

    onLayerSelectionChange?.(selectedIds, { additive: current.additive })
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
    setIsLayerInteracting(true)
    if (mode === "rotate") {
      if (rotationLabelTimeoutRef.current !== null) {
        window.clearTimeout(rotationLabelTimeoutRef.current)
        rotationLabelTimeoutRef.current = null
      }
      setRotatingLayerId("selection")
      setRotationPreviewDegrees(0)
      setMultiSelectionPreview({
        bounds: combinedLayerBounds,
        rotation: combinedLayerBounds.rotation ?? 0,
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
    const resizeSnapThreshold = RESIZE_SNAP_THRESHOLD_PX / scale
    const deltaX = (event.clientX - interaction.startX) / scale
    const deltaY = (event.clientY - interaction.startY) / scale
    const layer = interaction.layer
    const hasStartedInteraction =
      Math.hypot(event.clientX - interaction.startX, event.clientY - interaction.startY) >=
      INTERACTION_START_THRESHOLD_PX

    if (!hasStartedInteraction && interaction.mode !== "rotate") {
      setSnapGuides({ horizontal: [], vertical: [] })
      return
    }

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
          current
            ? {
                ...current,
                rotation: getLayerRotationLabel((interaction.groupBounds?.rotation ?? 0) + rotation),
              }
            : current,
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

    const resizeDirection = interaction.resizeDirection ?? "se"
    const isCornerResize = resizeDirection.length === 2

    if (
      interaction.mode === "resize" &&
      isCornerResize &&
      layer.kind === "qr" &&
      interaction.lockedResizeAxis === undefined &&
      hasStartedInteraction
    ) {
      interaction.lockedResizeAxis =
        Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical"
    }

    const nextGeometry = resizeDraftingLayer(
      layer,
      interaction.resizeDirection ?? "se",
      deltaX,
      deltaY,
      interaction.lockedResizeAxis,
    )
    const snappedResize = snapEnabled
      ? snapLayerResize({
          direction: interaction.resizeDirection ?? "se",
          layer,
          layers: visibleLayers,
          geometry: nextGeometry,
          threshold: resizeSnapThreshold,
        })
      : { geometry: nextGeometry, guides: { horizontal: [], vertical: [] } }

    setSnapGuides(snappedResize.guides)
    onLayerChange?.(layer.id, snappedResize.geometry)
  }

  function endLayerInteraction(event: PointerEvent<HTMLElement>) {
    const interaction = interactionRef.current

    if (interaction?.pointerId === event.pointerId) {
      setSnapGuides({ horizontal: [], vertical: [] })
      suppressLayerClickRef.current =
        Math.abs(event.clientX - interaction.startX) > 1 ||
        Math.abs(event.clientY - interaction.startY) > 1

      if (interaction.mode === "rotate") {
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
      setIsLayerInteracting(false)
      interactionRef.current = null
    }
  }

  function selectLayerFromClick(
    event: MouseEvent<HTMLElement>,
    layer: DraftingCanvasLayer,
    options?: { qr?: boolean },
  ) {
    event.stopPropagation()

    if (suppressLayerClickRef.current) {
      event.preventDefault()
      suppressLayerClickRef.current = false
      return
    }

    if (editingTextLayerId && editingTextLayerId !== layer.id) {
      commitEditingTextDraft()
    }

    onLayerSelect?.(layer.id, { additive: event.metaKey || event.ctrlKey })
    if (options?.qr) {
      onQrClick()
    }
  }

  function startTextEditing(event: MouseEvent<HTMLElement>, layer: DraftingCanvasLayer) {
    if (layer.kind !== "text" || layer.isLocked) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onLayerSelect?.(layer.id)
    setEditingTextLayerId(layer.id)
    setEditingTextDraft(layer.text ?? "")
  }

  function handleTextEditorInput(event: FormEvent<HTMLTextAreaElement>) {
    setEditingTextDraft(event.currentTarget.value)
  }

  function commitEditingTextDraft() {
    if (!editingTextLayerId) {
      return
    }

    const layer = resolvedLayers.find((candidate) => candidate.id === editingTextLayerId)
    const text = textEditorRefs.current[editingTextLayerId]?.value ?? editingTextDraft

    if (layer?.kind === "text" && ((layer.text ?? "") !== text || layer.textRuns)) {
      onLayerChange?.(layer.id, { text, textRuns: undefined })
    }

    setEditingTextDraft(text)
    setEditingTextLayerId(null)
  }

  function patchSelectedTextLayer(layer: DraftingCanvasLayer, patch: TextRunStylePatch) {
    onLayerChange?.(layer.id, { ...patch, textRuns: undefined })
  }

  function patchTextLayer(layer: DraftingCanvasLayer, patch: Partial<DraftingCanvasLayer>) {
    onLayerChange?.(layer.id, { ...patch, textRuns: undefined })
  }

  function getLayerPlacementStyle(layer: DraftingCanvasLayer, nested = false): CSSProperties {
    return {
      height: layer.height,
      left: nested ? 0 : "50%",
      opacity: layer.opacity,
      top: nested ? 0 : "50%",
      transform: `translate3d(${layer.x}px, ${layer.y}px, 0) rotate(${layer.rotation}deg)`,
      transformOrigin: "center center",
      width: layer.width,
      zIndex: layer.zIndex,
    }
  }

  function renderMarquee() {
    if (!marquee) {
      return null
    }

    const bounds = getMarqueeBounds(marquee.start, marquee.end)

    return (
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[9998] border border-[var(--drafting-ink)] bg-[var(--drafting-ink)]/10"
        data-slot="drafting-layer-marquee"
        style={{
          height: bounds.height,
          transform: `translate3d(${bounds.x}px, ${bounds.y}px, 0)`,
          width: bounds.width,
        }}
      />
    )
  }

  function renderFloatingToolbar() {
    const bounds = combinedLayerBounds
    const selectedTextLayer =
      selectedVisibleLayers.length === 1 && selectedVisibleLayers[0]?.kind === "text"
        ? selectedVisibleLayers[0]
        : null

    if (
      !bounds ||
      selectedVisibleLayers.length === 0 ||
      isLayerInteracting ||
      marquee ||
      rotatingLayerId !== null
    ) {
      return null
    }

    const x = bounds.x + bounds.width / 2
    const showTextFormatToolbar = Boolean(selectedTextLayer && !selectedTextLayer.isLocked)
    const toolbarStackHeight = showTextFormatToolbar
      ? TEXT_FORMAT_TOOLBAR_HEIGHT_PX + FLOATING_TOOLBAR_GAP_PX + FLOATING_TOOLBAR_HEIGHT_PX
      : FLOATING_TOOLBAR_HEIGHT_PX
    const rawY =
      bounds.y -
      RESIZE_CONTROL_PADDING_PX -
      ROTATE_HANDLE_OFFSET_PX -
      ROTATE_HANDLE_RADIUS_PX -
      FLOATING_TOOLBAR_GAP_PX -
      toolbarStackHeight
    const minY = canvasHeight > 0 ? -canvasHeight / 2 + FLOATING_TOOLBAR_GAP_PX : rawY
    const y = Math.max(rawY, minY)
    const textToolbarStyle = {
      transform: `translate3d(${x}px, ${y}px, 0) translateX(-50%)`,
    }
    const layerToolbarStyle = {
      transform: `translate3d(${x}px, ${
        showTextFormatToolbar ? y + TEXT_FORMAT_TOOLBAR_HEIGHT_PX + FLOATING_TOOLBAR_GAP_PX : y
      }px, 0) translateX(-50%)`,
    }

    if (showTextFormatToolbar && selectedTextLayer) {
      return (
        <>
          <TextFormatFloatingToolbar
            layer={selectedTextLayer}
            onFormatSelection={(patch) => patchSelectedTextLayer(selectedTextLayer, patch)}
            onPatch={(patch) => patchTextLayer(selectedTextLayer, patch)}
            style={textToolbarStyle}
          />
          <LayerFloatingToolbar
            layers={selectedVisibleLayers}
            onAction={onLayerAction ? runSelectedLayerAction : undefined}
            onCopy={onLayerCopy ? runSelectedLayerCopy : undefined}
            onMore={(event) => openFloatingLayerContextMenu(event, selectedVisibleLayerIds)}
            style={layerToolbarStyle}
          />
        </>
      )
    }

    return (
      <LayerFloatingToolbar
        layers={selectedVisibleLayers}
        onAction={onLayerAction ? runSelectedLayerAction : undefined}
        onCopy={onLayerCopy ? runSelectedLayerCopy : undefined}
        onMore={(event) => openFloatingLayerContextMenu(event, selectedVisibleLayerIds)}
        style={layerToolbarStyle}
      />
    )
  }

  function renderLayerControls(layer: DraftingCanvasLayer) {
    if (activeSelectedLayerIds.length !== 1 || layer.isLocked || !activeSelectedLayerIdSet.has(layer.id)) {
      return null
    }

    if (layer.kind === "text" && editingTextLayerId === layer.id) {
      return null
    }

    const controlHeight = layer.height + RESIZE_CONTROL_PADDING_PX * 2
    const controlWidth = layer.width + RESIZE_CONTROL_PADDING_PX * 2
    const isRotating = rotatingLayerId === layer.id
    const rotationDegrees = rotationPreviewDegrees ?? getLayerRotationLabel(layer.rotation)

    return (
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 touch-none overflow-visible border border-[var(--drafting-resize-frame)]"
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
        onContextMenu={(event) => openLayerContextMenu(event, [layer.id])}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 w-px -translate-x-1/2 -translate-y-full bg-[var(--drafting-ink)]"
          style={{ height: ROTATE_HANDLE_OFFSET_PX }}
        />
        {isRotating ? (
          <div
            className="pointer-events-none absolute left-1/2 top-0 rounded-full border border-white/[0.12] bg-black/55 px-2.5 py-1 text-[0.68rem] font-semibold text-white/82 shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
            data-slot="drafting-layer-rotation-value"
            data-toolbar-appearance="desktop-glass"
            style={{
              transform: `translate(-50%, calc(-${ROTATE_HANDLE_OFFSET_PX}px - ${ROTATE_HANDLE_RADIUS_PX}px - ${ROTATE_LABEL_GAP_PX}px - 100%))`,
            }}
          >
            {rotationDegrees}°
          </div>
        ) : null}
        <LayerSizeValue height={layer.height} width={layer.width} />
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
    const rotationDegrees = multiSelectionPreview?.rotation ?? bounds.rotation ?? rotationPreviewDegrees ?? 0
    const rotationTransform = rotationDegrees ? ` rotate(${rotationDegrees}deg)` : ""

    return (
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 touch-none overflow-visible border border-[var(--drafting-resize-frame)]"
        data-layer-ids={activeSelectedLayerIds.join(" ")}
        data-slot="drafting-layer-multi-select-frame"
        style={{
          height: controlHeight,
          transform: `translate3d(${bounds.x - RESIZE_CONTROL_PADDING_PX}px, ${bounds.y - RESIZE_CONTROL_PADDING_PX}px, 0)${rotationTransform}`,
          transformOrigin: "center center",
          width: controlWidth,
          zIndex: 50,
        }}
        onContextMenu={(event) => openLayerContextMenu(event, activeSelectedLayerIds)}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 w-px -translate-x-1/2 -translate-y-full bg-[var(--drafting-ink)]"
          style={{ height: ROTATE_HANDLE_OFFSET_PX }}
        />
        {isRotating ? (
          <div
            className="pointer-events-none absolute left-1/2 top-0 rounded-full border border-white/[0.12] bg-black/55 px-2.5 py-1 text-[0.68rem] font-semibold text-white/82 shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
            data-slot="drafting-layer-rotation-value"
            data-toolbar-appearance="desktop-glass"
            style={{
              transform: `translate(-50%, calc(-${ROTATE_HANDLE_OFFSET_PX}px - ${ROTATE_HANDLE_RADIUS_PX}px - ${ROTATE_LABEL_GAP_PX}px - 100%))`,
            }}
          >
            {rotationDegrees}°
          </div>
        ) : null}
        <LayerSizeValue height={bounds.height} width={bounds.width} />
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

    if (layer.kind === "group") {
      return (
        <div
          key={layer.id}
          data-slot="drafting-layer-group"
          data-layer-id={layer.id}
          data-selected={isLayerSelected ? "true" : "false"}
          className={cn(
            "absolute max-h-none max-w-none cursor-move touch-none",
            layer.isLocked && "cursor-default",
          )}
          style={{
            ...getLayerPlacementStyle(layer),
            filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
          }}
          onClick={(event) => selectLayerFromClick(event, layer)}
          onPointerDown={(event) => startLayerInteraction(event, layer, "move")}
          onPointerMove={updateLayerInteraction}
          onPointerUp={endLayerInteraction}
          onPointerCancel={endLayerInteraction}
          onContextMenu={(event) => openLayerContextMenu(event, [layer.id])}
        >
          {(layer.children ?? [])
            .filter((child) => child.isVisible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((child) => renderNestedLayer(child))}
        </div>
      )
    }

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
          onClick={(event) => selectLayerFromClick(event, layer, { qr: true })}
          onPointerDown={(event) => startLayerInteraction(event, layer, "move")}
          onPointerMove={updateLayerInteraction}
          onPointerUp={endLayerInteraction}
          onPointerCancel={endLayerInteraction}
          onContextMenu={(event) => openLayerContextMenu(event, [layer.id])}
        >
          <DraftingQrBackground layer={layer} state={state} />
          <div
            className="relative z-10 h-full w-full max-h-full max-w-full [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrMarkup }}
          />
        </div>
      )
    }

    if (layer.kind === "text") {
      const isEditing = editingTextLayerId === layer.id

      return (
        <div
          key={layer.id}
          data-slot="drafting-text-layer"
          data-layer-id={layer.id}
          data-selected={isLayerSelected ? "true" : "false"}
          className={cn(
            "absolute max-h-none max-w-none touch-none overflow-hidden",
            isEditing ? "cursor-text" : "cursor-move",
            layer.isLocked && !isEditing && "cursor-default",
          )}
          style={{
            ...getLayerPlacementStyle(layer),
            filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
          }}
          onClick={(event) => selectLayerFromClick(event, layer)}
          onDoubleClick={(event) => startTextEditing(event, layer)}
          onPointerDown={(event) => startLayerInteraction(event, layer, "move")}
          onPointerMove={updateLayerInteraction}
          onPointerUp={endLayerInteraction}
          onPointerCancel={endLayerInteraction}
          onContextMenu={(event) => openLayerContextMenu(event, [layer.id])}
        >
          {isEditing ? (
            <textarea
              aria-label="Edit text layer"
              className="h-full w-full resize-none cursor-text overflow-hidden border-0 bg-transparent p-0 outline-none"
              data-slot="drafting-text-editor"
              ref={(element) => {
                textEditorRefs.current[layer.id] = element
              }}
              spellCheck={false}
              style={getTextLayerStyle(layer)}
              value={editingTextDraft}
              onBlur={commitEditingTextDraft}
              onClick={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              onInput={handleTextEditorInput}
              onKeyDown={(event) => {
                event.stopPropagation()
                if (event.key === "Escape") {
                  event.preventDefault()
                  commitEditingTextDraft()
                }
              }}
              onPointerDown={(event) => event.stopPropagation()}
            />
          ) : (
            <div className="h-full w-full" data-slot="drafting-text-content" style={getTextLayerStyle(layer)}>
              {renderTextLayerContent(layer)}
            </div>
          )}
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
        onClick={(event) => selectLayerFromClick(event, layer)}
        onPointerDown={(event) => startLayerInteraction(event, layer, "move")}
        onPointerMove={updateLayerInteraction}
        onPointerUp={endLayerInteraction}
        onPointerCancel={endLayerInteraction}
        onContextMenu={(event) => openLayerContextMenu(event, [layer.id])}
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

  function renderNestedLayer(layer: DraftingCanvasLayer) {
    const isLayerSelected = activeSelectedLayerIdSet.has(layer.id)

    if (layer.kind === "group") {
      return (
        <div
          key={layer.id}
          data-slot="drafting-layer-group"
          data-layer-id={layer.id}
          data-selected={isLayerSelected ? "true" : "false"}
          className="absolute max-h-none max-w-none"
          style={{
            ...getLayerPlacementStyle(layer, true),
            filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
          }}
        >
          {(layer.children ?? [])
            .filter((child) => child.isVisible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((child) => renderNestedLayer(child))}
        </div>
      )
    }

    if (layer.kind === "qr") {
      const qrMarkup = markup ? applyDraftingQrForegroundShadow(markup, layer) : ""

      return (
        <div
          key={layer.id}
          data-slot="dashboard-compose-node"
          data-layer-id={layer.id}
          data-selected={isLayerSelected ? "true" : "false"}
          className="absolute max-h-none max-w-none"
          style={{
            ...getLayerPlacementStyle(layer, true),
            filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
          }}
        >
          <DraftingQrBackground layer={layer} state={state} />
          <div
            className="relative z-10 h-full w-full max-h-full max-w-full [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrMarkup }}
          />
        </div>
      )
    }

    if (layer.kind === "text") {
      return (
        <div
          key={layer.id}
          data-slot="drafting-text-layer"
          data-layer-id={layer.id}
          data-selected={isLayerSelected ? "true" : "false"}
          className="absolute max-h-none max-w-none overflow-hidden"
          style={{
            ...getLayerPlacementStyle(layer, true),
            filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
          }}
        >
          <div className="h-full w-full" data-slot="drafting-text-content" style={getTextLayerStyle(layer)}>
            {renderTextLayerContent(layer)}
          </div>
        </div>
      )
    }

    return (
      <div
        key={layer.id}
        data-slot="dashboard-compose-card"
        data-layer-id={layer.id}
        data-selected={isLayerSelected ? "true" : "false"}
        className="absolute max-h-none max-w-none overflow-visible"
        style={{
          ...cardStyle,
          ...getLayerPlacementStyle(layer, true),
          boxShadow: getDraftingCardShadow({ ...cardState, shadow: layer.shadow }),
          filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
        }}
      >
        {isPaperShaderMode ? <DraftingCardPaperShaderLayer paperShader={cardState.paperShader} /> : null}
      </div>
    )
  }

  return (
    <div
      data-slot="qr-pane"
      data-selected={isSelected ? "true" : "false"}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-visible"
      onClick={(e) => {
        // Only select if clicking the pane background, not the QR itself
        if (e.target === e.currentTarget) {
          onSelect()
        }
      }}
    >
      <div
        ref={canvasRef}
        data-slot="dashboard-compose-canvas"
        data-compose-mode="compose"
        className="relative h-full w-full overflow-visible"
        onClick={(event) => {
          if (suppressCanvasClickRef.current) {
            event.preventDefault()
            event.stopPropagation()
            suppressCanvasClickRef.current = false
            return
          }

          onLayerSelect?.(null)
          onSelect()
        }}
        onContextMenu={openCanvasContextMenu}
        onPointerCancel={endMarqueeSelection}
        onPointerDown={startMarqueeSelection}
        onPointerMove={updateMarqueeSelection}
        onPointerUp={endMarqueeSelection}
      >
        {isLoading ? (
          <div className="grid h-full place-items-center text-sm font-medium text-[var(--drafting-ink-muted)]">
            Loading QR…
          </div>
        ) : markup ? (
          <>
            <SnapGuideOverlay guides={snapGuides} />
            {renderMarquee()}
            {visibleLayers.map(renderLayer)}
            {activeSelectedLayerIds.length > 0
              ? visibleLayers.map((layer) => renderLayerControls(layer))
              : null}
            {createMultiLayerControls()}
            {renderFloatingToolbar()}
            {contextMenu && typeof document !== "undefined"
              ? createPortal(
                  <LayerContextMenu
                    layerCount={contextMenu.layerIds.length}
                    layers={contextMenuLayers}
                    onAction={runLayerAction}
                    style={{
                      left: contextMenu.x,
                      top: contextMenu.y,
                    }}
                  />,
                  document.body,
                )
              : null}
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
  previousProps.onLayerAction === nextProps.onLayerAction &&
  previousProps.selectedLayerId === nextProps.selectedLayerId &&
  previousProps.selectedLayerIds === nextProps.selectedLayerIds &&
  previousProps.snapEnabled === nextProps.snapEnabled,
)
