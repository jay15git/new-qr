import type { BackgroundShapeOptions } from "@/features/qr-code/model/state"
import type { DraftingCardShadowState } from "@/features/workspace/model/card-state"
import type {
  DraftingOutlineState,
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
  blur: number
  cornerRadius?: number
  layerFilters: DraftingFilterEffect[]
  opacity: number
  outline: DraftingOutlineState
  shadow: DraftingCardShadowState
  shadows: DraftingShadowLayerState[]
  supportsCornerRadius: boolean
  supportsOutline: boolean
}

export function getDesktopAppearanceSnapshot(
  layer: DraftingCanvasLayer,
  options?: {
    cardCornerRadius?: number
    qrBackgroundShapeOptions?: BackgroundShapeOptions
  },
): DesktopAppearanceSnapshot {
  const layerFilters = layer.layerFilters ?? []
  const outline = layer.outline ?? DEFAULT_DRAFTING_OUTLINE
  const shadows = layer.shadows ?? [legacyShadowToShadowLayer(layer.shadow)]

  if (layer.kind === "card" && options?.cardCornerRadius !== undefined) {
    return {
      blur: layer.blur,
      cornerRadius: options.cardCornerRadius,
      layerFilters,
      opacity: layer.opacity,
      outline,
      shadow: layer.shadow,
      shadows,
      supportsCornerRadius: true,
      supportsOutline: true,
    }
  }

  if (layer.kind === "qr" && options?.qrBackgroundShapeOptions) {
    return {
      blur: layer.blur,
      layerFilters,
      opacity: layer.opacity,
      outline,
      shadow: layer.shadow,
      shadows,
      supportsCornerRadius: false,
      supportsOutline: false,
    }
  }

  const isRectShape =
    layer.kind === "shape" && (layer.shapeId ?? DEFAULT_DRAFTING_SHAPE_LAYER.shapeId) === "rect"

  return {
    blur: layer.blur,
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
    supportsCornerRadius: layer.kind === "image" || layer.kind === "shape",
    supportsOutline: layer.kind === "card" || layer.kind === "image" || layer.kind === "text" || isRectShape,
  }
}

export type DesktopAppearancePatchResult = {
  cardCornerRadius?: number
  cardShadow?: Partial<DraftingCardShadowState>
  layerPatch: Partial<DraftingCanvasLayer>
  qrBackgroundShapeOptions?: Partial<BackgroundShapeOptions>
}

export function buildDesktopAppearancePatch(
  layer: DraftingCanvasLayer,
  patch: Partial<DraftingCanvasLayer>,
  _options?: {
    cardBorder?: unknown
    qrBackgroundShapeOptions?: BackgroundShapeOptions
  },
): DesktopAppearancePatchResult {
  const layerPatch: Partial<DraftingCanvasLayer> = {}

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

  if (patch.shadows !== undefined) {
    layerPatch.shadows = patch.shadows
  }

  if (patch.shadow) {
    layerPatch.shadow = {
      ...layer.shadow,
      ...patch.shadow,
    }
  }

  if (layer.kind === "card") {
    const primaryShadow = patch.shadows?.[0] ?? (patch.shadow ? { ...layer.shadow, ...patch.shadow } : undefined)

    return {
      cardCornerRadius: patch.cornerRadius,
      cardShadow: primaryShadow,
      layerPatch,
    }
  }

  if (layer.kind === "qr") {
    return { layerPatch }
  }

  return { layerPatch }
}
