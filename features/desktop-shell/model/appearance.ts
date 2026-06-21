import type { BackgroundShapeOptions } from "@/features/qr-code/model/state"
import type { DraftingCardBorderState, DraftingCardShadowState } from "@/features/workspace/model/card-state"
import {
  DEFAULT_DRAFTING_IMAGE_LAYER,
  DEFAULT_DRAFTING_SHAPE_LAYER,
  type DraftingCanvasLayer,
} from "@/features/workspace/model/layers"

export type DesktopAppearanceSnapshot = {
  blur: number
  cornerRadius?: number
  opacity: number
  shadow: DraftingCardShadowState
  stroke?: string
  strokeOpacity?: number
  strokeWidth?: number
  supportsCornerRadius: boolean
  supportsStroke: boolean
  usesBorderSemantics?: boolean
}

export function getDesktopAppearanceSnapshot(
  layer: DraftingCanvasLayer,
  options?: {
    cardBorder?: DraftingCardBorderState
    cardCornerRadius?: number
    qrBackgroundShapeOptions?: BackgroundShapeOptions
  },
): DesktopAppearanceSnapshot {
  if (layer.kind === "card" && options?.cardBorder) {
    return {
      blur: layer.blur,
      cornerRadius: options.cardCornerRadius,
      opacity: layer.opacity,
      shadow: layer.shadow,
      stroke: options.cardBorder.color,
      strokeOpacity: options.cardBorder.opacity,
      strokeWidth: options.cardBorder.width,
      supportsCornerRadius: true,
      supportsStroke: true,
      usesBorderSemantics: true,
    }
  }

  if (layer.kind === "qr" && options?.qrBackgroundShapeOptions) {
    const shapeOptions = options.qrBackgroundShapeOptions

    return {
      blur: layer.blur,
      opacity: layer.opacity,
      shadow: {
        blur: shapeOptions.edgeBlur ?? layer.shadow.blur,
        color: shapeOptions.shadowColor || layer.shadow.color,
        offsetX: shapeOptions.shadowOffsetX ?? layer.shadow.offsetX,
        offsetY: shapeOptions.shadowOffsetY ?? layer.shadow.offsetY,
        opacity: shapeOptions.shadowOpacity ?? layer.shadow.opacity,
      },
      stroke: shapeOptions.strokeColor,
      strokeOpacity: shapeOptions.strokeOpacity,
      strokeWidth: shapeOptions.strokeWidth,
      supportsCornerRadius: false,
      supportsStroke: true,
    }
  }

  return {
    blur: layer.blur,
    cornerRadius:
      layer.kind === "image"
        ? (layer.cornerRadius ?? DEFAULT_DRAFTING_IMAGE_LAYER.cornerRadius)
        : layer.kind === "shape" && (layer.shapeId ?? DEFAULT_DRAFTING_SHAPE_LAYER.shapeId) === "rect"
          ? (layer.cornerRadius ?? DEFAULT_DRAFTING_SHAPE_LAYER.cornerRadius)
          : undefined,
    opacity: layer.opacity,
    shadow: layer.shadow,
    stroke: layer.stroke,
    strokeOpacity: layer.strokeOpacity,
    strokeWidth: layer.strokeWidth,
    supportsCornerRadius: layer.kind === "image" || layer.kind === "shape",
    supportsStroke: layer.kind === "shape",
  }
}

export type DesktopAppearancePatchResult = {
  cardBorder?: Partial<DraftingCardBorderState>
  cardCornerRadius?: number
  cardShadow?: Partial<DraftingCardShadowState>
  layerPatch: Partial<DraftingCanvasLayer>
  qrBackgroundShapeOptions?: Partial<BackgroundShapeOptions>
}

export function buildDesktopAppearancePatch(
  layer: DraftingCanvasLayer,
  patch: Partial<DraftingCanvasLayer>,
  options?: {
    cardBorder?: DraftingCardBorderState
    qrBackgroundShapeOptions?: BackgroundShapeOptions
  },
): DesktopAppearancePatchResult {
  const layerPatch: Partial<DraftingCanvasLayer> = {}

  if (patch.blur !== undefined) {
    layerPatch.blur = patch.blur
  }

  if (patch.opacity !== undefined) {
    layerPatch.opacity = patch.opacity
  }

  if (patch.cornerRadius !== undefined) {
    layerPatch.cornerRadius = patch.cornerRadius
  }

  if (patch.shadow) {
    layerPatch.shadow = {
      ...layer.shadow,
      ...patch.shadow,
    }
  }

  if (layer.kind === "card" && options?.cardBorder) {
    return {
      cardBorder: {
        color: patch.stroke ?? options.cardBorder.color,
        opacity: patch.strokeOpacity ?? options.cardBorder.opacity,
        width: patch.strokeWidth ?? options.cardBorder.width,
      },
      cardCornerRadius: patch.cornerRadius,
      cardShadow: patch.shadow
        ? {
            ...layer.shadow,
            ...patch.shadow,
          }
        : undefined,
      layerPatch,
    }
  }

  if (layer.kind === "qr" && options?.qrBackgroundShapeOptions) {
    const nextShadow = {
      ...layer.shadow,
      ...(patch.shadow ?? {}),
    }
    const qrBackgroundShapeOptions: Partial<BackgroundShapeOptions> = {}

    if (patch.shadow) {
      qrBackgroundShapeOptions.shadowColor = nextShadow.color
      qrBackgroundShapeOptions.shadowOffsetX = nextShadow.offsetX
      qrBackgroundShapeOptions.shadowOffsetY = nextShadow.offsetY
      qrBackgroundShapeOptions.shadowOpacity = nextShadow.opacity

      if (patch.shadow.blur !== undefined) {
        qrBackgroundShapeOptions.edgeBlur = patch.shadow.blur
      }
    }

    if (
      patch.stroke !== undefined ||
      patch.strokeWidth !== undefined ||
      patch.strokeOpacity !== undefined
    ) {
      qrBackgroundShapeOptions.strokeColor =
        patch.stroke ?? options.qrBackgroundShapeOptions.strokeColor
      qrBackgroundShapeOptions.strokeWidth =
        patch.strokeWidth ?? options.qrBackgroundShapeOptions.strokeWidth
      qrBackgroundShapeOptions.strokeOpacity =
        patch.strokeOpacity ?? options.qrBackgroundShapeOptions.strokeOpacity
    }

    layerPatch.shadow = nextShadow

    return {
      layerPatch,
      qrBackgroundShapeOptions,
    }
  }

  if (patch.stroke !== undefined) {
    layerPatch.stroke = patch.stroke
  }

  if (patch.strokeWidth !== undefined) {
    layerPatch.strokeWidth = patch.strokeWidth
  }

  if (patch.strokeOpacity !== undefined) {
    layerPatch.strokeOpacity = patch.strokeOpacity
  }

  return { layerPatch }
}
