"use client"

import type { CSSProperties } from "react"

import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import {
  getQrBackgroundShapeDefinition,
  type QrBackgroundShapeDefinition,
} from "@/features/qr-code/styles/background-shapes"
import type { QrStudioState, StudioGradient } from "@/features/qr-code/model/state"
import {
  getBackgroundShapeCssTiltTransform,
  getBackgroundShapeSkewTransform,
} from "@/features/workspace/rendering/layer-transform"

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
  const shape = getQrBackgroundShapeDefinition(state.backgroundShapeId)
  const ids = getDraftingQrBackgroundIds(layer.id)
  const fill = getDraftingQrBackgroundFill(state, ids)
  const filterId = getDraftingQrBackgroundFilterId(state, ids)
  const stroke = getDraftingQrBackgroundStroke(state)
  const tiltTransform = getBackgroundShapeCssTiltTransform(state.backgroundShapeOptions)
  const style: CSSProperties = {
    height: frame.height,
    left: frame.x,
    perspective: tiltTransform ? "600px" : undefined,
    top: frame.y,
    transform: tiltTransform,
    transformOrigin: "center center",
    transformStyle: tiltTransform ? "preserve-3d" : undefined,
    width: frame.width,
  }

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute z-0 overflow-visible"
      data-background-shape={shape?.id ?? "rect"}
      data-slot="drafting-qr-background"
      preserveAspectRatio="none"
      style={style}
      viewBox={getDraftingQrBackgroundViewBox(frame, shape)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <DraftingQrBackgroundDefs ids={ids} state={state} />
      {shape ? (
        <path
          d={shape.path}
          fill={fill}
          filter={filterId ? `url(#${filterId})` : undefined}
          stroke={stroke.width > 0 ? stroke.color : undefined}
          strokeLinejoin="round"
          strokeOpacity={stroke.width > 0 ? stroke.opacity : undefined}
          strokeWidth={stroke.width > 0 ? stroke.width : undefined}
          transform={`scale(${frame.width / shape.viewBox.width} ${frame.height / shape.viewBox.height})`}
        />
      ) : (
        <rect
          fill={fill}
          filter={filterId ? `url(#${filterId})` : undefined}
          height={frame.height}
          rx={(Math.min(frame.width, frame.height) / 2) * state.backgroundOptions.round}
          stroke={stroke.width > 0 ? stroke.color : undefined}
          strokeOpacity={stroke.width > 0 ? stroke.opacity : undefined}
          strokeWidth={stroke.width > 0 ? stroke.width : undefined}
          width={frame.width}
          x="0"
          y="0"
        />
      )}
    </svg>
  )
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
  const stroke = getDraftingQrBackgroundStroke(state)
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

function DraftingQrBackgroundDefs({
  ids,
  state,
}: {
  ids: DraftingQrBackgroundIds
  state: QrStudioState
}) {
  const filterId = getDraftingQrBackgroundFilterId(state, ids)
  const imageHref = getDraftingQrBackgroundImageHref(state)

  if (!state.backgroundGradient.enabled && !filterId && !imageHref) {
    return null
  }

  return (
    <defs>
      {state.backgroundGradient.enabled ? (
        <DraftingQrBackgroundGradient id={ids.gradientId} gradient={state.backgroundGradient} />
      ) : null}
      {imageHref ? (
        <pattern
          id={ids.imagePatternId}
          height="1"
          patternContentUnits="objectBoundingBox"
          width="1"
        >
          <image height="1" href={imageHref} preserveAspectRatio="xMidYMid slice" width="1" />
        </pattern>
      ) : null}
      {filterId ? (
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx={state.backgroundShapeOptions.shadowOffsetX}
            dy={state.backgroundShapeOptions.shadowOffsetY}
            stdDeviation={state.backgroundShapeOptions.edgeBlur / 2}
            floodColor={state.backgroundShapeOptions.shadowColor}
            floodOpacity={state.backgroundShapeOptions.shadowOpacity / 100}
          />
        </filter>
      ) : null}
    </defs>
  )
}

function DraftingQrBackgroundGradient({
  gradient,
  id,
}: {
  gradient: StudioGradient
  id: string
}) {
  if (gradient.type === "radial") {
    return (
      <radialGradient id={id} cx="50%" cy="50%" r="50%">
        {gradient.colorStops.map((stop) => (
          <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
        ))}
      </radialGradient>
    )
  }

  return (
    <linearGradient
      id={id}
      x1="0%"
      x2="100%"
      y1="0%"
      y2="100%"
      gradientTransform={`rotate(${(gradient.rotation * 180) / Math.PI} .5 .5)`}
    >
      {gradient.colorStops.map((stop) => (
        <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
      ))}
    </linearGradient>
  )
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

function getDraftingQrBackgroundStroke(state: QrStudioState) {
  const width = Math.max(0, state.backgroundShapeOptions.strokeWidth)

  return {
    color: state.backgroundShapeOptions.strokeColor,
    opacity: Math.max(0, Math.min(100, state.backgroundShapeOptions.strokeOpacity)) / 100,
    width,
  }
}

function getDraftingQrBackgroundFilterId(
  state: QrStudioState,
  ids: DraftingQrBackgroundIds,
) {
  return hasDraftingQrBackgroundShadow(state) ? ids.filterId : null
}

function hasDraftingQrBackgroundShadow(state: QrStudioState) {
  return (
    state.backgroundShapeOptions.shadowOpacity > 0 &&
    (state.backgroundShapeOptions.edgeBlur > 0 ||
      state.backgroundShapeOptions.shadowOffsetX !== 0 ||
      state.backgroundShapeOptions.shadowOffsetY !== 0)
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
