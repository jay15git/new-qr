import type { BackgroundShapeOptions } from "@/features/qr-code/model/state"
import type { DraftingCardBorderState, DraftingCardShadowState } from "@/features/workspace/model/card-state"
import type {
  DraftingBorderStyle,
  DraftingOutlineState,
  DraftingPerSideBorderState,
  DraftingShadowLayerState,
} from "@/features/workspace/model/effects"
import type { DraftingFilterEffect } from "@/features/workspace/model/filters"
import {
  DEFAULT_DRAFTING_IMAGE_LAYER,
  DEFAULT_DRAFTING_SHAPE_LAYER,
  type DraftingCanvasLayer,
} from "@/features/workspace/model/layers"
import {
  DEFAULT_DRAFTING_OUTLINE,
  legacyShadowToShadowLayer,
} from "@/features/workspace/model/effects"

export type DesktopAppearanceSnapshot = {
  backdropFilters: DraftingFilterEffect[]
  blur: number
  borderSides?: DraftingPerSideBorderState
  borderStyle?: DraftingBorderStyle
  cornerRadius?: number
  layerFilters: DraftingFilterEffect[]
  opacity: number
  outline: DraftingOutlineState
  shadow: DraftingCardShadowState
  shadows: DraftingShadowLayerState[]
  stroke?: string
  strokeOpacity?: number
  strokeStyle?: DraftingBorderStyle
  strokeWidth?: number
  supportsCornerRadius: boolean
  supportsOutline: boolean
  supportsPerSideBorder: boolean
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
  const layerFilters = layer.layerFilters ?? []
  const backdropFilters = layer.backdropFilters ?? []
  const outline = layer.outline ?? DEFAULT_DRAFTING_OUTLINE
  const shadows = layer.shadows ?? [legacyShadowToShadowLayer(layer.shadow)]

  if (layer.kind === "card" && options?.cardBorder) {
    return {
      backdropFilters,
      blur: layer.blur,
      borderSides: options.cardBorder.sides,
      borderStyle: options.cardBorder.style,
      cornerRadius: options.cardCornerRadius,
      layerFilters,
      opacity: layer.opacity,
      outline,
      shadow: layer.shadow,
      shadows,
      stroke: options.cardBorder.color,
      strokeOpacity: options.cardBorder.opacity,
      strokeWidth: options.cardBorder.width,
      supportsCornerRadius: true,
      supportsOutline: true,
      supportsPerSideBorder: true,
      supportsStroke: true,
      usesBorderSemantics: true,
    }
  }

  if (layer.kind === "qr" && options?.qrBackgroundShapeOptions) {
    const shapeOptions = options.qrBackgroundShapeOptions

    return {
      backdropFilters,
      blur: layer.blur,
      layerFilters,
      opacity: layer.opacity,
      outline,
      shadow: {
        blur: shapeOptions.edgeBlur ?? layer.shadow.blur,
        color: shapeOptions.shadowColor || layer.shadow.color,
        inset: layer.shadow.inset,
        kind: layer.shadow.kind,
        offsetX: shapeOptions.shadowOffsetX ?? layer.shadow.offsetX,
        offsetY: shapeOptions.shadowOffsetY ?? layer.shadow.offsetY,
        opacity: shapeOptions.shadowOpacity ?? layer.shadow.opacity,
        spread: layer.shadow.spread,
        visible: layer.shadow.visible,
      },
      shadows,
      stroke: shapeOptions.strokeColor,
      strokeOpacity: shapeOptions.strokeOpacity,
      strokeWidth: shapeOptions.strokeWidth,
      supportsCornerRadius: false,
      supportsOutline: false,
      supportsPerSideBorder: false,
      supportsStroke: true,
    }
  }

  const isRectShape =
    layer.kind === "shape" && (layer.shapeId ?? DEFAULT_DRAFTING_SHAPE_LAYER.shapeId) === "rect"

  return {
    backdropFilters,
    blur: layer.blur,
    borderSides: layer.borderSides,
    cornerRadius:
      layer.kind === "image"
        ? (layer.cornerRadius ?? DEFAULT_DRAFTING_IMAGE_LAYER.cornerRadius)
        : isRectShape
          ? (layer.cornerRadius ?? DEFAULT_DRAFTING_SHAPE_LAYER.cornerRadius)
          : undefined,
    layerFilters,
    opacity: layer.opacity,
    outline,
    shadow: layer.shadow,
    shadows,
    stroke: layer.stroke,
    strokeOpacity: layer.strokeOpacity,
    strokeStyle: layer.strokeStyle,
    strokeWidth: layer.strokeWidth,
    supportsCornerRadius: layer.kind === "image" || layer.kind === "shape",
    supportsOutline: layer.kind === "card" || layer.kind === "image" || layer.kind === "text" || isRectShape,
    supportsPerSideBorder:
      layer.kind === "card" || layer.kind === "image" || layer.kind === "text" || isRectShape,
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

  if (patch.backdropFilters !== undefined) {
    layerPatch.backdropFilters = patch.backdropFilters
  }

  if (patch.blur !== undefined) {
    layerPatch.blur = patch.blur
  }

  if (patch.layerFilters !== undefined) {
    layerPatch.layerFilters = patch.layerFilters
  }

  if (patch.opacity !== undefined) {
    layerPatch.opacity = patch.opacity
  }

  if (patch.cornerRadius !== undefined) {
    layerPatch.cornerRadius = patch.cornerRadius
  }

  if (patch.outline !== undefined) {
    layerPatch.outline = patch.outline
  }

  if (patch.borderSides !== undefined) {
    layerPatch.borderSides = patch.borderSides
  }

  if (patch.shadows !== undefined) {
    layerPatch.shadows = patch.shadows
  }

  if (patch.shadow) {
    layerPatch.shadow = {
      ...layer.shadow,
      ...patch.shadow,
    }
  }

  if (layer.kind === "card" && options?.cardBorder) {
    const primaryShadow = patch.shadows?.[0] ?? (patch.shadow ? { ...layer.shadow, ...patch.shadow } : undefined)

    return {
      cardBorder: {
        color: patch.stroke ?? options.cardBorder.color,
        opacity: patch.strokeOpacity ?? options.cardBorder.opacity,
        sides: patch.borderSides ?? options.cardBorder.sides,
        style: patch.strokeStyle ?? options.cardBorder.style,
        width: patch.strokeWidth ?? options.cardBorder.width,
      },
      cardCornerRadius: patch.cornerRadius,
      cardShadow: primaryShadow,
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

  if (patch.strokeStyle !== undefined) {
    layerPatch.strokeStyle = patch.strokeStyle
  }

  return { layerPatch }
}
