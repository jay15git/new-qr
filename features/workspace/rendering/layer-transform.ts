import {
  clampBackgroundShapeTilt,
  type BackgroundShapeOptions,
} from "@/features/qr-code/model/state"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"

type LayerTransformInput = Pick<
  DraftingCanvasLayer,
  "height" | "rotation" | "tiltX" | "tiltY" | "width" | "x" | "y"
>

function formatTransformNumber(value: number) {
  if (Math.abs(value) < 0.000001) {
    return "0"
  }

  return Number(value.toFixed(4)).toString()
}

export function getBackgroundShapeCssTiltTransform(
  shapeOptions: Pick<BackgroundShapeOptions, "tiltX" | "tiltY">,
) {
  const tiltX = clampBackgroundShapeTilt(shapeOptions.tiltX ?? 0)
  const tiltY = clampBackgroundShapeTilt(shapeOptions.tiltY ?? 0)

  if (tiltX === 0 && tiltY === 0) {
    return undefined
  }

  return `rotateX(${tiltY}deg) rotateY(${tiltX}deg)`
}

export function getLayerCssTransform(layer: LayerTransformInput) {
  const tiltX = clampBackgroundShapeTilt(layer.tiltX ?? 0)
  const tiltY = clampBackgroundShapeTilt(layer.tiltY ?? 0)
  const rotation = Number.isFinite(layer.rotation) ? layer.rotation : 0
  const translation = `translate3d(${layer.x}px, ${layer.y}px, 0)`

  if (tiltX === 0 && tiltY === 0) {
    return `${translation} rotate(${rotation}deg)`
  }

  return `${translation} rotate(${rotation}deg) skewY(${tiltX}deg) skewX(${tiltY}deg)`
}

export function appendTiltSkewToSvgTransform(
  baseTransform: string,
  tiltX: number,
  tiltY: number,
  centerX: number,
  centerY: number,
) {
  const normalizedTiltX = clampBackgroundShapeTilt(tiltX)
  const normalizedTiltY = clampBackgroundShapeTilt(tiltY)

  if (normalizedTiltX === 0 && normalizedTiltY === 0) {
    return baseTransform
  }

  return `${baseTransform} translate(${formatTransformNumber(centerX)} ${formatTransformNumber(centerY)}) skewX(${formatTransformNumber(normalizedTiltY)}) skewY(${formatTransformNumber(normalizedTiltX)}) translate(${formatTransformNumber(-centerX)} ${formatTransformNumber(-centerY)})`
}

export function getBackgroundShapeSkewTransform(
  baseTransform: string,
  shapeOptions: Pick<BackgroundShapeOptions, "tiltX" | "tiltY">,
  centerX: number,
  centerY: number,
) {
  return appendTiltSkewToSvgTransform(
    baseTransform,
    shapeOptions.tiltX,
    shapeOptions.tiltY,
    centerX,
    centerY,
  )
}

export function getLayerSvgTransform(layer: LayerTransformInput) {
  const centerX = layer.width / 2
  const centerY = layer.height / 2
  const rotation = Number.isFinite(layer.rotation) ? layer.rotation : 0
  const baseTransform = `translate(${formatTransformNumber(layer.x)} ${formatTransformNumber(layer.y)}) rotate(${formatTransformNumber(rotation)} ${formatTransformNumber(centerX)} ${formatTransformNumber(centerY)})`

  return appendTiltSkewToSvgTransform(
    baseTransform,
    layer.tiltX ?? 0,
    layer.tiltY ?? 0,
    centerX,
    centerY,
  )
}
