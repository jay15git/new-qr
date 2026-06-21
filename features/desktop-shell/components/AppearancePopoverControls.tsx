"use client"

import {
  DESKTOP_INSPECTOR_SECTION_GAP_CLASS,
  DesktopInspectorLabel,
  DesktopInspectorSection,
} from "@/features/desktop-shell/components/InspectorControls"
import {
  DesktopInspectorColorRow,
  DesktopInspectorElasticSliderRow,
} from "@/features/desktop-shell/components/DesktopInspectorShell"
import type { DesktopAppearanceSnapshot } from "@/features/desktop-shell/model/appearance"
import {
  DEFAULT_DRAFTING_IMAGE_LAYER,
  DEFAULT_DRAFTING_SHAPE_LAYER,
  type DraftingCanvasLayer,
} from "@/features/workspace/model/layers"
import { cn } from "@/lib/utils"

const DEFAULT_SHADOW_COLOR = "#111827"

export function AppearanceShadowControls({
  appearance,
  className,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  className?: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  const shadow = appearance.shadow

  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-shadow-controls"
    >
      <DesktopInspectorLabel>Shadow</DesktopInspectorLabel>
      <DesktopInspectorColorRow
        label="Shadow color"
        value={shadow.color}
        onChange={(color) =>
          onPatch({ shadow: { ...shadow, color: color || DEFAULT_SHADOW_COLOR } })
        }
      />
      <div className="mt-2 grid gap-2">
        <DesktopInspectorElasticSliderRow
          label="Shadow blur"
          max={128}
          min={0}
          value={shadow.blur}
          valueLabel={`${Math.round(shadow.blur)}`}
          onChange={(blur) => onPatch({ shadow: { ...shadow, blur } })}
        />
        <DesktopInspectorElasticSliderRow
          label="Shadow opacity"
          max={100}
          min={0}
          value={shadow.opacity}
          valueLabel={`${Math.round(shadow.opacity)}%`}
          onChange={(opacity) => onPatch({ shadow: { ...shadow, opacity } })}
        />
        <DesktopInspectorElasticSliderRow
          label="Offset X"
          max={128}
          min={-128}
          value={shadow.offsetX}
          valueLabel={`${Math.round(shadow.offsetX)}`}
          onChange={(offsetX) => onPatch({ shadow: { ...shadow, offsetX } })}
        />
        <DesktopInspectorElasticSliderRow
          label="Offset Y"
          max={128}
          min={-128}
          value={shadow.offsetY}
          valueLabel={`${Math.round(shadow.offsetY)}`}
          onChange={(offsetY) => onPatch({ shadow: { ...shadow, offsetY } })}
        />
      </div>
    </DesktopInspectorSection>
  )
}

export function AppearanceBlurControls({
  appearance,
  className,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  className?: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-blur-controls"
    >
      <DesktopInspectorLabel>Blur</DesktopInspectorLabel>
      <DesktopInspectorElasticSliderRow
        label="Blur"
        max={96}
        min={0}
        value={appearance.blur}
        valueLabel={`${Math.round(appearance.blur)}`}
        onChange={(blur) => onPatch({ blur })}
      />
    </DesktopInspectorSection>
  )
}

export function AppearanceOpacityControls({
  appearance,
  className,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  className?: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-opacity-controls"
    >
      <DesktopInspectorLabel>Opacity</DesktopInspectorLabel>
      <DesktopInspectorElasticSliderRow
        label="Opacity"
        max={100}
        min={0}
        value={Math.round(appearance.opacity * 100)}
        valueLabel={`${Math.round(appearance.opacity * 100)}%`}
        onChange={(opacity) => onPatch({ opacity: opacity / 100 })}
      />
    </DesktopInspectorSection>
  )
}

export function AppearanceStrokeControls({
  appearance,
  className,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  className?: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  if (!appearance.supportsStroke) {
    return null
  }

  const sectionLabel = appearance.usesBorderSemantics ? "Border" : "Stroke"
  const colorLabel = appearance.usesBorderSemantics ? "Border color" : "Stroke color"
  const widthLabel = appearance.usesBorderSemantics ? "Border width" : "Stroke width"
  const opacityLabel = appearance.usesBorderSemantics ? "Border opacity" : "Stroke opacity"

  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-stroke-controls"
    >
      <DesktopInspectorLabel>{sectionLabel}</DesktopInspectorLabel>
      <DesktopInspectorColorRow
        label={colorLabel}
        value={appearance.stroke ?? DEFAULT_DRAFTING_SHAPE_LAYER.stroke}
        onChange={(stroke) => onPatch({ stroke })}
      />
      <div className="mt-2 grid gap-2">
        <DesktopInspectorElasticSliderRow
          label={widthLabel}
          max={64}
          min={0}
          value={appearance.strokeWidth ?? DEFAULT_DRAFTING_SHAPE_LAYER.strokeWidth}
          valueLabel={`${Math.round(appearance.strokeWidth ?? DEFAULT_DRAFTING_SHAPE_LAYER.strokeWidth)}`}
          onChange={(strokeWidth) => onPatch({ strokeWidth })}
        />
        <DesktopInspectorElasticSliderRow
          label={opacityLabel}
          max={100}
          min={0}
          value={appearance.strokeOpacity ?? DEFAULT_DRAFTING_SHAPE_LAYER.strokeOpacity}
          valueLabel={`${Math.round(appearance.strokeOpacity ?? DEFAULT_DRAFTING_SHAPE_LAYER.strokeOpacity)}%`}
          onChange={(strokeOpacity) => onPatch({ strokeOpacity })}
        />
      </div>
    </DesktopInspectorSection>
  )
}

export function AppearanceRadiusControls({
  appearance,
  className,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  className?: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  if (!appearance.supportsCornerRadius) {
    return null
  }

  const defaultRadius =
    appearance.cornerRadius ??
    DEFAULT_DRAFTING_IMAGE_LAYER.cornerRadius ??
    DEFAULT_DRAFTING_SHAPE_LAYER.cornerRadius

  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-radius-controls"
    >
      <DesktopInspectorLabel>Corner radius</DesktopInspectorLabel>
      <DesktopInspectorElasticSliderRow
        label="Corner radius"
        max={512}
        min={0}
        value={defaultRadius}
        valueLabel={`${Math.round(defaultRadius)}`}
        onChange={(cornerRadius) => onPatch({ cornerRadius })}
      />
    </DesktopInspectorSection>
  )
}
