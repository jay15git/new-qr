"use client"

import { EyeIcon, EyeOffIcon, MinusIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import {
  DESKTOP_INSPECTOR_SECTION_GAP_CLASS,
  DesktopInspectorLabel,
  DesktopInspectorNativeSelect,
  DesktopInspectorSection,
  DesktopInspectorSegmentedControl,
} from "@/features/desktop-shell/components/InspectorControls"
import {
  DesktopInspectorColorRow,
  DesktopInspectorElasticSliderRow,
} from "@/features/desktop-shell/components/DesktopInspectorShell"
import type { DesktopAppearanceSnapshot } from "@/features/desktop-shell/model/appearance"
import {
  createDefaultDraftingFilterEffect,
  DRAFTING_FILTER_RANGES,
  DRAFTING_LAYER_FILTER_TYPES,
  type DraftingFilterEffect,
  type DraftingFilterType,
} from "@/features/workspace/model/filters"
import {
  createDefaultDraftingShadowLayer,
  DRAFTING_BORDER_SIDE_KEYS,
  DRAFTING_BORDER_STYLES,
  type DraftingBorderSideKey,
  type DraftingBorderStyle,
  type DraftingShadowLayerState,
} from "@/features/workspace/model/effects"
import {
  DEFAULT_DRAFTING_IMAGE_LAYER,
  DEFAULT_DRAFTING_SHAPE_LAYER,
  type DraftingCanvasLayer,
} from "@/features/workspace/model/layers"
import { cn } from "@/lib/utils"

const DEFAULT_SHADOW_COLOR = "#111827"

function ShadowLayerRow({
  shadow,
  onChange,
  onRemove,
}: {
  shadow: DraftingShadowLayerState
  onChange: (patch: Partial<DraftingShadowLayerState>) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-[10px] border border-[var(--desktop-inspector-control-border-hover)] p-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <DesktopInspectorSegmentedControl
          ariaLabelPrefix="Shadow type"
          items={[
            { label: "Box", value: "box" },
            { label: "Drop", value: "drop" },
          ]}
          onValueChange={(kind: DraftingShadowLayerState["kind"]) => onChange({ kind })}
          value={shadow.kind}
        />
        <div className="flex items-center gap-1">
          <button
            aria-label={shadow.visible ? "Hide shadow" : "Show shadow"}
            className="grid size-7 place-items-center rounded-md text-[var(--desktop-inspector-fg-secondary)] hover:bg-[var(--desktop-inspector-control-hover-bg)]"
            type="button"
            onClick={() => onChange({ visible: !shadow.visible })}
          >
            {shadow.visible ? <EyeIcon className="size-3.5" /> : <EyeOffIcon className="size-3.5" />}
          </button>
          <button
            aria-label="Remove shadow"
            className="grid size-7 place-items-center rounded-md text-[var(--desktop-inspector-fg-secondary)] hover:bg-[var(--desktop-inspector-control-hover-bg)]"
            type="button"
            onClick={onRemove}
          >
            <MinusIcon className="size-3.5" />
          </button>
        </div>
      </div>
      <DesktopInspectorColorRow
        label="Shadow color"
        value={shadow.color}
        onChange={(color) => onChange({ color: color || DEFAULT_SHADOW_COLOR })}
      />
      <div className="mt-2 grid gap-2">
        <DesktopInspectorElasticSliderRow
          label="Blur"
          max={128}
          min={0}
          value={shadow.blur}
          valueLabel={`${Math.round(shadow.blur)}`}
          onChange={(blur) => onChange({ blur })}
        />
        <DesktopInspectorElasticSliderRow
          label="Spread"
          max={128}
          min={-128}
          value={shadow.spread}
          valueLabel={`${Math.round(shadow.spread)}`}
          onChange={(spread) => onChange({ spread })}
        />
        <DesktopInspectorElasticSliderRow
          label="Opacity"
          max={100}
          min={0}
          value={shadow.opacity}
          valueLabel={`${Math.round(shadow.opacity)}%`}
          onChange={(opacity) => onChange({ opacity })}
        />
        <DesktopInspectorElasticSliderRow
          label="Offset X"
          max={128}
          min={-128}
          value={shadow.offsetX}
          valueLabel={`${Math.round(shadow.offsetX)}`}
          onChange={(offsetX) => onChange({ offsetX })}
        />
        <DesktopInspectorElasticSliderRow
          label="Offset Y"
          max={128}
          min={-128}
          value={shadow.offsetY}
          valueLabel={`${Math.round(shadow.offsetY)}`}
          onChange={(offsetY) => onChange({ offsetY })}
        />
        <label className="flex items-center justify-between gap-2 text-[11px] text-[var(--desktop-inspector-fg-secondary)]">
          <span>Inner shadow</span>
          <input
            checked={shadow.inset}
            className="size-4 accent-[var(--desktop-inspector-option-selected-border)]"
            type="checkbox"
            onChange={(event) => onChange({ inset: event.currentTarget.checked })}
          />
        </label>
      </div>
    </div>
  )
}

export function AppearanceShadowControls({
  appearance,
  className,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  className?: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  const shadows = appearance.shadows

  const updateShadows = (nextShadows: DraftingShadowLayerState[]) => {
    onPatch({
      shadow: {
        ...appearance.shadow,
        ...nextShadows[0],
      },
      shadows: nextShadows,
    })
  }

  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-shadow-controls"
    >
      <div className="flex items-center justify-between gap-2">
        <DesktopInspectorLabel>Shadow</DesktopInspectorLabel>
        <button
          aria-label="Add shadow"
          className="grid size-7 place-items-center rounded-md text-[var(--desktop-inspector-fg-secondary)] hover:bg-[var(--desktop-inspector-control-hover-bg)]"
          type="button"
          onClick={() =>
            updateShadows([
              ...shadows,
              createDefaultDraftingShadowLayer({
                blur: 24,
                opacity: 40,
                offsetY: 12,
                visible: true,
              }),
            ])
          }
        >
          <PlusIcon className="size-3.5" />
        </button>
      </div>
      <div className="grid gap-2">
        {shadows.map((shadow, index) => (
          <ShadowLayerRow
            key={shadow.id}
            shadow={shadow}
            onChange={(patch) =>
              updateShadows(
                shadows.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, ...patch } : entry,
                ),
              )
            }
            onRemove={() => updateShadows(shadows.filter((_, entryIndex) => entryIndex !== index))}
          />
        ))}
      </div>
    </DesktopInspectorSection>
  )
}

function FilterEffectRow({
  effect,
  onChange,
  onRemove,
}: {
  effect: DraftingFilterEffect
  onChange: (patch: Partial<DraftingFilterEffect>) => void
  onRemove: () => void
}) {
  const range = DRAFTING_FILTER_RANGES[effect.type]

  return (
    <div className="rounded-[10px] border border-[var(--desktop-inspector-control-border-hover)] p-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold capitalize text-[var(--desktop-inspector-fg-secondary)]">
          {effect.type.replace("-", " ")}
        </span>
        <div className="flex items-center gap-1">
          <button
            aria-label={effect.enabled ? "Disable filter" : "Enable filter"}
            className="grid size-7 place-items-center rounded-md text-[var(--desktop-inspector-fg-secondary)] hover:bg-[var(--desktop-inspector-control-hover-bg)]"
            type="button"
            onClick={() => onChange({ enabled: !effect.enabled })}
          >
            {effect.enabled ? <EyeIcon className="size-3.5" /> : <EyeOffIcon className="size-3.5" />}
          </button>
          <button
            aria-label="Remove filter"
            className="grid size-7 place-items-center rounded-md text-[var(--desktop-inspector-fg-secondary)] hover:bg-[var(--desktop-inspector-control-hover-bg)]"
            type="button"
            onClick={onRemove}
          >
            <MinusIcon className="size-3.5" />
          </button>
        </div>
      </div>
      <DesktopInspectorElasticSliderRow
        label="Amount"
        max={range.max}
        min={range.min}
        value={effect.amount}
        valueLabel={`${Math.round(effect.amount)}${range.unit ?? ""}`}
        onChange={(amount) => onChange({ amount })}
      />
    </div>
  )
}

function FilterPickerMenu({
  existingTypes,
  label,
  onAdd,
}: {
  existingTypes: DraftingFilterType[]
  label: string
  onAdd: (type: DraftingFilterType) => void
}) {
  const available = DRAFTING_LAYER_FILTER_TYPES.filter((type) => !existingTypes.includes(type))

  if (available.length === 0) {
    return null
  }

  return (
    <button
      className="h-8 w-full rounded-[6px] border border-[var(--desktop-inspector-control-border-hover)] px-2 text-left text-[11px] text-[var(--desktop-inspector-fg-secondary)] hover:bg-[var(--desktop-inspector-control-hover-bg)]"
      type="button"
      onClick={() => onAdd(available[0]!)}
    >
      Add {label} filter
    </button>
  )
}

export function AppearanceFilterControls({
  appearance,
  className,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  className?: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  const updateLayerFilters = (layerFilters: DraftingFilterEffect[]) => {
    onPatch({ layerFilters })
  }

  const updateBackdropFilters = (backdropFilters: DraftingFilterEffect[]) => {
    onPatch({ backdropFilters })
  }

  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-filter-controls"
    >
      <DesktopInspectorLabel>Layer filters</DesktopInspectorLabel>
      <div className="grid gap-2">
        {appearance.layerFilters.map((effect) => (
          <FilterEffectRow
            key={effect.id}
            effect={effect}
            onChange={(patch) =>
              updateLayerFilters(
                appearance.layerFilters.map((entry) =>
                  entry.id === effect.id ? { ...entry, ...patch } : entry,
                ),
              )
            }
            onRemove={() =>
              updateLayerFilters(appearance.layerFilters.filter((entry) => entry.id !== effect.id))
            }
          />
        ))}
      </div>
      <FilterPickerMenu
        existingTypes={appearance.layerFilters.map((effect) => effect.type)}
        label="layer"
        onAdd={(type) =>
          updateLayerFilters([...appearance.layerFilters, createDefaultDraftingFilterEffect(type)])
        }
      />

      <DesktopInspectorLabel className="mt-3">Backdrop filters</DesktopInspectorLabel>
      <div className="grid gap-2">
        {appearance.backdropFilters.map((effect) => (
          <FilterEffectRow
            key={effect.id}
            effect={effect}
            onChange={(patch) =>
              updateBackdropFilters(
                appearance.backdropFilters.map((entry) =>
                  entry.id === effect.id ? { ...entry, ...patch } : entry,
                ),
              )
            }
            onRemove={() =>
              updateBackdropFilters(
                appearance.backdropFilters.filter((entry) => entry.id !== effect.id),
              )
            }
          />
        ))}
      </div>
      <FilterPickerMenu
        existingTypes={appearance.backdropFilters.map((effect) => effect.type)}
        label="backdrop"
        onAdd={(type) =>
          updateBackdropFilters([
            ...appearance.backdropFilters,
            createDefaultDraftingFilterEffect(type),
          ])
        }
      />
    </DesktopInspectorSection>
  )
}

export function AppearanceOutlineControls({
  appearance,
  className,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  className?: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  if (!appearance.supportsOutline) {
    return null
  }

  const outline = appearance.outline

  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-outline-controls"
    >
      <DesktopInspectorLabel>Outline</DesktopInspectorLabel>
      <DesktopInspectorSegmentedControl
        ariaLabelPrefix="Outline style"
        items={DRAFTING_BORDER_STYLES.map((style) => ({ label: style, value: style }))}
        onValueChange={(style: DraftingBorderStyle) =>
          onPatch({ outline: { ...outline, style } })
        }
        value={outline.style}
      />
      <DesktopInspectorColorRow
        label="Outline color"
        value={outline.color}
        onChange={(color) => onPatch({ outline: { ...outline, color: color || "#111827" } })}
      />
      <div className="mt-2 grid gap-2">
        <DesktopInspectorElasticSliderRow
          label="Outline width"
          max={64}
          min={0}
          value={outline.width}
          valueLabel={`${Math.round(outline.width)}`}
          onChange={(width) => onPatch({ outline: { ...outline, width, visible: width > 0 } })}
        />
        <DesktopInspectorElasticSliderRow
          label="Outline offset"
          max={64}
          min={-64}
          value={outline.offset}
          valueLabel={`${Math.round(outline.offset)}`}
          onChange={(offset) => onPatch({ outline: { ...outline, offset } })}
        />
        <DesktopInspectorElasticSliderRow
          label="Outline opacity"
          max={100}
          min={0}
          value={outline.opacity}
          valueLabel={`${Math.round(outline.opacity)}%`}
          onChange={(opacity) => onPatch({ outline: { ...outline, opacity } })}
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
    <AppearanceFilterControls appearance={appearance} className={className} onPatch={onPatch} />
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
  const styleValue = appearance.borderStyle ?? appearance.strokeStyle ?? "solid"

  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-stroke-controls"
    >
      <DesktopInspectorLabel>{sectionLabel}</DesktopInspectorLabel>
      <DesktopInspectorSegmentedControl
        ariaLabelPrefix={`${sectionLabel} style`}
        items={DRAFTING_BORDER_STYLES.map((style) => ({ label: style, value: style }))}
        onValueChange={(style: DraftingBorderStyle) => onPatch({ strokeStyle: style })}
        value={styleValue}
      />
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
      {appearance.supportsPerSideBorder && appearance.borderSides ? (
        <PerSideBorderControls
          borderSides={appearance.borderSides}
          onPatch={onPatch}
          sectionLabel={sectionLabel}
        />
      ) : null}
    </DesktopInspectorSection>
  )
}

function PerSideBorderControls({
  borderSides,
  onPatch,
  sectionLabel,
}: {
  borderSides: NonNullable<DesktopAppearanceSnapshot["borderSides"]>
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
  sectionLabel: string
}) {
  const [activeSide, setActiveSide] = useState<DraftingBorderSideKey>("top")
  const active = borderSides[activeSide]

  return (
    <div className="mt-3 grid gap-2">
      <DesktopInspectorLabel>{sectionLabel} sides</DesktopInspectorLabel>
      <DesktopInspectorSegmentedControl
        ariaLabelPrefix={`${sectionLabel} side`}
        items={DRAFTING_BORDER_SIDE_KEYS.map((side) => ({ label: side, value: side }))}
        onValueChange={(side: DraftingBorderSideKey) => setActiveSide(side)}
        value={activeSide}
      />
      <DesktopInspectorSegmentedControl
        ariaLabelPrefix={`${sectionLabel} side style`}
        items={DRAFTING_BORDER_STYLES.map((style) => ({ label: style, value: style }))}
        onValueChange={(style: DraftingBorderStyle) =>
          onPatch({
            borderSides: {
              ...borderSides,
              [activeSide]: { ...active, style },
            },
          })
        }
        value={active.style}
      />
      <DesktopInspectorColorRow
        label={`${activeSide} color`}
        value={active.color}
        onChange={(color) =>
          onPatch({
            borderSides: {
              ...borderSides,
              [activeSide]: { ...active, color: color || "#111827" },
            },
          })
        }
      />
      <DesktopInspectorElasticSliderRow
        label={`${activeSide} width`}
        max={64}
        min={0}
        value={active.width}
        valueLabel={`${Math.round(active.width)}`}
        onChange={(width) =>
          onPatch({
            borderSides: {
              ...borderSides,
              [activeSide]: { ...active, width },
            },
          })
        }
      />
    </div>
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
