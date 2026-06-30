import type { CSSProperties } from "react"

import type { DraftingCardState } from "@/features/workspace/model/card-state"
import { getDraftingCardPatternStyle } from "@/features/workspace/model/card-patterns"
import {
  DEFAULT_DRAFTING_TEXT_LAYER,
  type DraftingCanvasLayer,
  type DraftingTextRun,
} from "@/features/workspace/model/layers"
import { getDraftingFontCssFamily } from "@/features/workspace/model/fonts"
import { getDraftingTextFontFamily } from "@/features/workspace/rendering/text-layout"
import {
  getDraftingLayerBoxShadow,
  toRgba,
} from "@/features/workspace/rendering/layer-appearance"
import { clampBackgroundShapeTilt } from "@/features/qr-code/model/state"
import {
  getBackgroundShapeCssTiltTransform,
  getLayerPlacementTransform,
  getLayerTiltPerspectiveStyle,
} from "@/features/workspace/rendering/layer-transform"

export { toRgba } from "@/features/workspace/rendering/layer-appearance"

export function getDraftingCardShadow(cardState: DraftingCardState) {
  return getDraftingLayerBoxShadow(cardState.shadow)
}

export function getDraftingCardBorder(cardState: DraftingCardState) {
  const borderWidth = Math.max(0, cardState.border.width)

  if (borderWidth <= 0) {
    return undefined
  }

  const borderColor = toRgba(cardState.border.color, cardState.border.opacity / 100)
  return `${borderWidth}px solid ${borderColor}`
}

export function getLayerPlacementStyle(
  layer: DraftingCanvasLayer,
  nested = false,
): CSSProperties {
  const tiltPerspectiveStyle = nested ? {} : getLayerTiltPerspectiveStyle(layer)

  return {
    height: layer.height,
    left: nested ? 0 : "50%",
    opacity: layer.opacity,
    top: nested ? 0 : "50%",
    transform: nested ? undefined : getLayerPlacementTransform(layer),
    transformOrigin: "center center",
    transformStyle: tiltPerspectiveStyle.perspective ? "preserve-3d" : undefined,
    width: layer.width,
    zIndex: layer.zIndex,
    ...tiltPerspectiveStyle,
  }
}

export function getLayerControlShellStyle(
  layer: Pick<DraftingCanvasLayer, "rotation" | "tiltX" | "tiltY" | "x" | "y">,
  paddingPx = 0,
): CSSProperties {
  const rotation = Number.isFinite(layer.rotation) ? layer.rotation : 0
  const tiltPerspectiveStyle = getLayerTiltPerspectiveStyle(layer)
  const rotationPart = rotation !== 0 ? ` rotate(${rotation}deg)` : ""

  return {
    transform: `translate3d(${layer.x - paddingPx}px, ${layer.y - paddingPx}px, 0)${rotationPart}`,
    transformOrigin: "center center",
    transformStyle: tiltPerspectiveStyle.perspective ? "preserve-3d" : undefined,
    ...tiltPerspectiveStyle,
  }
}

export function getExportLayerTransform(layer: DraftingCanvasLayer) {
  const rotation = Number.isFinite(layer.rotation) ? layer.rotation : 0
  const scaleX = layer.scaleX ?? 1
  const scaleY = layer.scaleY ?? 1
  const tiltX = clampBackgroundShapeTilt(layer.tiltX ?? 0)
  const tiltY = clampBackgroundShapeTilt(layer.tiltY ?? 0)
  const parts: string[] = []

  if (rotation !== 0) {
    parts.push(`rotate(${rotation}deg)`)
  }

  if (scaleX !== 1 || scaleY !== 1) {
    parts.push(`scale(${scaleX}, ${scaleY})`)
  }

  if (tiltX !== 0 || tiltY !== 0) {
    const tiltTransform = getBackgroundShapeCssTiltTransform({ tiltX, tiltY })
    if (tiltTransform) {
      parts.push(tiltTransform)
    }
  }

  return parts.length > 0 ? parts.join(" ") : undefined
}

export function getExportLayerPlacementStyle(
  layer: DraftingCanvasLayer,
): Record<string, string | number> {
  const transform = getExportLayerTransform(layer)
  const style: Record<string, string | number> = {
    boxSizing: "border-box",
    height: layer.height,
    left: layer.x,
    opacity: layer.opacity,
    position: "absolute",
    top: layer.y,
    width: layer.width,
    zIndex: layer.zIndex,
  }

  if (transform) {
    style.transform = transform
    style.transformOrigin = "center center"
  }

  return style
}

export function getExportLayerEffectStyle(layer: DraftingCanvasLayer): Record<string, string> {
  const style: Record<string, string> = {}
  const boxShadow = getDraftingLayerBoxShadow(layer.shadow)

  if (boxShadow !== "none") {
    style.boxShadow = boxShadow
  }

  if (layer.blur > 0) {
    style.filter = `blur(${layer.blur}px)`
  }

  return style
}

export function getTextLayerStyle(layer: DraftingCanvasLayer): CSSProperties {
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

export function getTextRunStyle(
  layer: DraftingCanvasLayer,
  run: DraftingTextRun,
): Record<string, string | number> {
  return {
    color: run.fill ?? layer.fill ?? DEFAULT_DRAFTING_TEXT_LAYER.fill,
    fontFamily: getDraftingFontCssFamily({
      fontFamily: run.fontFamily ?? layer.fontFamily,
      fontId: run.fontId ?? layer.fontId,
    }),
    fontSize: run.fontSize ?? layer.fontSize ?? DEFAULT_DRAFTING_TEXT_LAYER.fontSize,
    fontStyle: run.fontStyle ?? layer.fontStyle ?? DEFAULT_DRAFTING_TEXT_LAYER.fontStyle,
    fontWeight: run.fontWeight ?? layer.fontWeight ?? DEFAULT_DRAFTING_TEXT_LAYER.fontWeight,
    textDecorationLine: (run.underline ?? layer.underline) ? "underline" : "none",
  }
}

export function serializeCssProperties(
  properties: Record<string, string | number | undefined>,
): Record<string, string | number> {
  const result: Record<string, string | number> = {}

  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined && value !== "") {
      result[key] = value
    }
  }

  return result
}

export function cssPropertiesToInlineStyle(
  properties: Record<string, string | number>,
): string {
  return Object.entries(properties)
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
      const unit = typeof value === "number" && !["opacity", "zIndex", "fontWeight"].includes(key)
        ? "px"
        : ""

      return `${cssKey}:${value}${unit}`
    })
    .join(";")
}

export function cssPropertiesToReactStyle(
  properties: Record<string, string | number>,
): string {
  return Object.entries(properties)
    .map(([key, value]) => {
      const serialized =
        typeof value === "string" && value.includes('"')
          ? `{\`${value.replaceAll("`", "\\`")}\`}`
          : JSON.stringify(value)

      return `${key}: ${serialized}`
    })
    .join(", ")
}

export function getDraftingCardDomStyle(
  cardState: DraftingCardState,
  layer: DraftingCanvasLayer,
  options?: {
    includePattern?: boolean
    includeShaderModes?: boolean
  },
): Record<string, string | number> {
  const isImageMode = cardState.styleMode === "image"
  const isPaperShaderMode = cardState.styleMode === "paper-shader"
  const isImageFilterMode = cardState.styleMode === "image-filter"
  const includePattern = options?.includePattern ?? !(isPaperShaderMode || isImageFilterMode || isImageMode)
  const cardPatternStyle = includePattern
    ? getDraftingCardPatternStyle(cardState.patternId, cardState.patternColors)
    : undefined
  const cardImageStyle =
    isImageMode && cardState.cardImage.value
      ? {
          backgroundImage: `url("${cardState.cardImage.value}")`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: cardState.cardImage.fit,
        }
      : undefined
  const border = getDraftingCardBorder(cardState)

  return serializeCssProperties({
    backgroundColor: cardState.fill,
    ...(cardPatternStyle as Record<string, string | number> | undefined),
    ...cardImageStyle,
    border,
    borderRadius: cardState.cornerRadius,
    boxShadow: getDraftingCardShadow({ ...cardState, shadow: layer.shadow }),
  })
}

export function getDraftingImageDomStyle(layer: DraftingCanvasLayer): Record<string, string | number> {
  const imageValue = layer.imageValue ?? ""
  const cornerRadius = layer.cornerRadius ?? 0
  const fit = layer.imageFit ?? "cover"

  if (!imageValue) {
    return {
      backgroundColor: "#f4f4f5",
      border: "1px dashed #d4d4d8",
      borderRadius: cornerRadius,
    }
  }

  return {
    backgroundImage: `url("${imageValue}")`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: fit,
    borderRadius: cornerRadius,
  }
}

export function getDraftingShapeDomStyle(layer: DraftingCanvasLayer): Record<string, string | number> {
  if (layer.fillMode === "none") {
    return { backgroundColor: "transparent" }
  }

  if (layer.fillMode === "image" && layer.imageValue) {
    return {
      backgroundColor: "transparent",
      backgroundImage: `url("${layer.imageValue}")`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: layer.imageFit ?? "cover",
    }
  }

  return {
    backgroundColor: "transparent",
  }
}
