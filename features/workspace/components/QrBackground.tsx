"use client"

import { useMemo, type CSSProperties } from "react"

import { buildDraftingQrBackgroundDomModules } from "@/features/qr-code/rendering/background-shape-dom"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import {
  getQrBackgroundShapeDefinition,
  type QrBackgroundShapeDefinition,
} from "@/features/qr-code/styles/background-shapes"
import type { QrStudioState, StudioGradient } from "@/features/qr-code/model/state"
import {
  getDraftingQrBackgroundPathTransform,
  getDraftingQrLayerLayout,
} from "@/features/qr-code/rendering/svg-extension"
import {
  getBackgroundShapeSkewTransform,
} from "@/features/workspace/rendering/layer-transform"
import { ScalableDomLayerTree } from "@/features/workspace/rendering/dom-layer-tree"

type DraftingQrBackgroundFrame = {
  height: number
  width: number
  x: number
  y: number
}

type DraftingQrBackgroundOverflow = {
  bottom: number
  left: number
  right: number
  top: number
}

export function DraftingQrBackground({
  layer,
  state,
}: {
  layer: DraftingCanvasLayer
  state: QrStudioState
}) {
  const frame = getDraftingQrBackgroundFrame(layer)
  const modules = useMemo(
    () => buildDraftingQrBackgroundDomModules(layer, state),
    [layer, state],
  )

  if (!modules) {
    return null
  }

  const style: CSSProperties = {
    height: frame.height,
    left: frame.x,
    top: frame.y,
    width: frame.width,
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-0 overflow-visible"
      data-background-shape={modules.shapeId}
      data-slot="drafting-qr-background"
      style={style}
    >
      <ScalableDomLayerTree
        layoutHeight={modules.layoutHeight}
        layoutWidth={modules.layoutWidth}
        nodes={modules.nodes}
        overflow="visible"
        targetHeight={frame.height}
        targetWidth={frame.width}
      />
    </div>
  )
}

export function buildDraftingQrBackgroundPreviewSvgMarkup(
  layer: DraftingCanvasLayer,
  state: QrStudioState,
) {
  const shape = getQrBackgroundShapeDefinition(state.backgroundShapeId)
  const layout = getDraftingQrLayerLayout(layer.width, state, layer.height)
  const { metrics, shapeOptions } = layout
  const ids = getDraftingQrBackgroundIds(layer.id)
  const defs = getDraftingQrBackgroundDefsMarkup(ids, state)
  const fill = getDraftingQrBackgroundFill(state, ids)
  const filterId = getDraftingQrBackgroundFilterId(state, ids, shapeOptions)
  const filter = filterId ? ` filter="url(#${filterId})"` : ""
  const stroke = getDraftingQrBackgroundStroke(shapeOptions)
  const strokeMarkup =
    stroke.width > 0
      ? ` stroke="${escapeXml(stroke.color)}" stroke-opacity="${stroke.opacity}" stroke-width="${stroke.width}" stroke-linejoin="round"`
      : ""
  const pathShapeOptions = {
    ...shapeOptions,
    tiltX: 0,
    tiltY: 0,
  }
  const innerMarkup = shape
    ? `<path data-shape-view-box="${shape.viewBox.width} ${shape.viewBox.height}" d="${escapeXml(shape.path)}" fill="${escapeXml(fill)}"${strokeMarkup}${filter} transform="${getDraftingQrBackgroundPathTransform(shape, metrics.backingRegion, pathShapeOptions)}"/>`
    : (() => {
        const radius =
          (Math.min(metrics.backingRegion.width, metrics.backingRegion.height) / 2) *
          state.backgroundOptions.round

        return `<rect x="${metrics.backingRegion.x}" y="${metrics.backingRegion.y}" width="${metrics.backingRegion.width}" height="${metrics.backingRegion.height}" rx="${radius}" fill="${escapeXml(fill)}"${strokeMarkup}${filter}/>`
      })()

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${metrics.outerWidth}" height="${metrics.outerHeight}" viewBox="0 0 ${metrics.outerWidth} ${metrics.outerHeight}"><defs>${defs}</defs>${innerMarkup}</svg>`
}

export function getDraftingQrBackgroundSvgMarkup(
  layer: DraftingCanvasLayer,
  state: QrStudioState,
) {
  const frame = getDraftingQrBackgroundFrame(layer)
  const shape = getQrBackgroundShapeDefinition(state.backgroundShapeId)
  const ids = getDraftingQrBackgroundIds(layer.id)
  const defs = getDraftingQrBackgroundDefsMarkup(ids, state)
  const fill = getDraftingQrBackgroundFill(state, ids)
  const filterId = getDraftingQrBackgroundFilterId(state, ids)
  const filter = filterId ? ` filter="url(#${filterId})"` : ""
  const stroke = getDraftingQrBackgroundStroke(state.backgroundShapeOptions)
  const strokeMarkup =
    stroke.width > 0
      ? ` stroke="${escapeXml(stroke.color)}" stroke-opacity="${stroke.opacity}" stroke-width="${stroke.width}" stroke-linejoin="round"`
      : ""
  const shapeName = shape?.id ?? "rect"

  if (shape) {
    const scaleX = frame.width / shape.viewBox.width
    const scaleY = frame.height / shape.viewBox.height
    const transform = getBackgroundShapeSkewTransform(
      `translate(${frame.x} ${frame.y}) scale(${scaleX} ${scaleY})`,
      state.backgroundShapeOptions,
      shape.viewBox.width / 2,
      shape.viewBox.height / 2,
    )

    return `<g data-drafting-qr-background="${escapeXml(shapeName)}"><defs>${defs}</defs><path d="${escapeXml(shape.path)}" fill="${escapeXml(fill)}"${strokeMarkup}${filter} transform="${transform}"/></g>`
  }

  const radius = (Math.min(frame.width, frame.height) / 2) * state.backgroundOptions.round

  return `<g data-drafting-qr-background="${escapeXml(shapeName)}"><defs>${defs}</defs><rect x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" rx="${radius}" fill="${escapeXml(fill)}"${strokeMarkup}${filter}/></g>`
}

export function getDraftingQrBackgroundBounds(
  layer: DraftingCanvasLayer,
  state: QrStudioState,
) {
  const frame = getDraftingQrBackgroundFrame(layer)
  const overflow = getDraftingQrBackgroundOverflow(state)

  return {
    maxX: layer.x + frame.x + frame.width + overflow.right,
    maxY: layer.y + frame.y + frame.height + overflow.bottom,
    minX: layer.x + frame.x - overflow.left,
    minY: layer.y + frame.y - overflow.top,
  }
}

type DraftingQrBackgroundIds = {
  filterId: string
  gradientId: string
  imagePatternId: string
}

function getDraftingQrBackgroundIds(layerId: string): DraftingQrBackgroundIds {
  const id = getSvgId(layerId)

  return {
    filterId: `${id}-qr-background-filter`,
    gradientId: `${id}-qr-background-gradient`,
    imagePatternId: `${id}-qr-background-image`,
  }
}

function getDraftingQrBackgroundFrame(
  layer: DraftingCanvasLayer,
): DraftingQrBackgroundFrame {
  return {
    height: layer.height,
    width: layer.width,
    x: 0,
    y: 0,
  }
}

function getDraftingQrBackgroundOverflow(state: QrStudioState): DraftingQrBackgroundOverflow {
  const blur = Math.max(0, state.backgroundShapeOptions.edgeBlur * 2)
  const hasShadow = hasDraftingQrBackgroundShadow(state)

  return {
    bottom: blur + (hasShadow ? Math.max(0, state.backgroundShapeOptions.shadowOffsetY) : 0),
    left: blur + (hasShadow ? Math.max(0, -state.backgroundShapeOptions.shadowOffsetX) : 0),
    right: blur + (hasShadow ? Math.max(0, state.backgroundShapeOptions.shadowOffsetX) : 0),
    top: blur + (hasShadow ? Math.max(0, -state.backgroundShapeOptions.shadowOffsetY) : 0),
  }
}

function getDraftingQrBackgroundViewBox(
  frame: DraftingQrBackgroundFrame,
  shape: QrBackgroundShapeDefinition | null,
) {
  if (shape) {
    return `0 0 ${shape.viewBox.width} ${shape.viewBox.height}`
  }

  return `0 0 ${frame.width} ${frame.height}`
}

function getDraftingQrBackgroundFill(state: QrStudioState, ids: DraftingQrBackgroundIds) {
  if (getDraftingQrBackgroundImageHref(state)) {
    return `url(#${ids.imagePatternId})`
  }

  if (state.backgroundGradient.enabled) {
    return `url(#${ids.gradientId})`
  }

  if (state.backgroundOptions.transparent) {
    return "none"
  }

  return state.backgroundOptions.color
}

function getDraftingQrBackgroundStroke(shapeOptions: QrStudioState["backgroundShapeOptions"]) {
  const width = Math.max(0, shapeOptions.strokeWidth)

  return {
    color: shapeOptions.strokeColor,
    opacity: Math.max(0, Math.min(100, shapeOptions.strokeOpacity)) / 100,
    width,
  }
}

function getDraftingQrBackgroundFilterId(
  state: QrStudioState,
  ids: DraftingQrBackgroundIds,
  shapeOptions: QrStudioState["backgroundShapeOptions"] = state.backgroundShapeOptions,
) {
  return hasDraftingQrBackgroundShadow(state, shapeOptions) ? ids.filterId : null
}

function hasDraftingQrBackgroundShadow(
  state: QrStudioState,
  shapeOptions: QrStudioState["backgroundShapeOptions"] = state.backgroundShapeOptions,
) {
  return (
    shapeOptions.shadowOpacity > 0 &&
    (shapeOptions.edgeBlur > 0 ||
      shapeOptions.shadowOffsetX !== 0 ||
      shapeOptions.shadowOffsetY !== 0)
  )
}

function getDraftingQrBackgroundDefsMarkup(
  ids: DraftingQrBackgroundIds,
  state: QrStudioState,
) {
  const parts: string[] = []
  const filterId = getDraftingQrBackgroundFilterId(state, ids)
  const imageHref = getDraftingQrBackgroundImageHref(state)

  if (state.backgroundGradient.enabled) {
    parts.push(getDraftingQrBackgroundGradientMarkup(ids.gradientId, state.backgroundGradient))
  }

  if (imageHref) {
    parts.push(
      `<pattern id="${ids.imagePatternId}" width="1" height="1" patternContentUnits="objectBoundingBox"><image href="${escapeXml(imageHref)}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>`,
    )
  }

  if (filterId) {
    parts.push(
      `<filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="${state.backgroundShapeOptions.shadowOffsetX}" dy="${state.backgroundShapeOptions.shadowOffsetY}" stdDeviation="${state.backgroundShapeOptions.edgeBlur / 2}" flood-color="${escapeXml(state.backgroundShapeOptions.shadowColor)}" flood-opacity="${state.backgroundShapeOptions.shadowOpacity / 100}"/></filter>`,
    )
  }

  return parts.join("")
}

function getDraftingQrBackgroundGradientMarkup(id: string, gradient: StudioGradient) {
  const stops = gradient.colorStops
    .map((stop) => `<stop offset="${stop.offset}" stop-color="${escapeXml(stop.color)}"/>`)
    .join("")

  if (gradient.type === "radial") {
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`
  }

  return `<linearGradient id="${id}" x1="0%" x2="100%" y1="0%" y2="100%" gradientTransform="rotate(${(gradient.rotation * 180) / Math.PI} .5 .5)">${stops}</linearGradient>`
}

function getDraftingQrBackgroundImageHref(state: QrStudioState) {
  return state.backgroundImage.source !== "none" ? state.backgroundImage.value : undefined
}

function getSvgId(value: string) {
  return value.replace(/[^\w-]+/g, "-")
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}
