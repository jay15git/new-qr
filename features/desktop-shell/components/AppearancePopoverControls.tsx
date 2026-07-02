"use client"

import { EyeIcon, EyeOffIcon, MinusIcon, PlusIcon } from "lucide-react"

import {
  DESKTOP_INSPECTOR_SECTION_GAP_CLASS,
  DESKTOP_INSPECTOR_SECTION_HEADING_CLASS,
  DesktopInspectorLabel,
  DesktopInspectorNativeSelect,
  DesktopInspectorSection,
  DesktopInspectorSegmentedControl,
} from "@/features/desktop-shell/components/InspectorControls"
import {
  DesktopInspectorColorRow,
  DesktopInspectorElasticSliderRow,
  DesktopInspectorNumberField,
  DesktopInspectorValueGrid,
} from "@/features/desktop-shell/components/DesktopInspectorShell"
import type { DesktopAppearanceSnapshot } from "@/features/desktop-shell/model/appearance"
import {
  createDefaultDraftingFilterEffect,
  DRAFTING_FILTER_RANGES,
  DRAFTING_FILTER_VISIBLE_DEFAULTS,
  DRAFTING_LAYER_FILTER_TYPES,
  type DraftingFilterEffect,
  type DraftingFilterType,
} from "@/features/workspace/model/filters"
import {
  createDefaultDraftingShadowLayer,
  DRAFTING_BORDER_STYLES,
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
  index,
  shadow,
  onChange,
  onRemove,
}: {
  index: number
  shadow: DraftingShadowLayerState
  onChange: (patch: Partial<DraftingShadowLayerState>) => void
  onRemove: () => void
}) {
  const shadowLabel = `Shadow ${index + 1}`

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "min-w-0 truncate",
            DESKTOP_INSPECTOR_SECTION_HEADING_CLASS,
            "mb-0",
          )}
        >
          {shadowLabel}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label={shadow.visible ? `Hide ${shadowLabel}` : `Show ${shadowLabel}`}
            className="grid size-7 place-items-center rounded-md text-[var(--desktop-inspector-fg-secondary)] hover:bg-[var(--desktop-inspector-control-hover-bg)]"
            type="button"
            onClick={() => onChange({ visible: !shadow.visible })}
          >
            {shadow.visible ? <EyeIcon className="size-3.5" /> : <EyeOffIcon className="size-3.5" />}
          </button>
          <button
            aria-label={`Remove ${shadowLabel}`}
            className="grid size-7 place-items-center rounded-md text-[var(--desktop-inspector-fg-secondary)] hover:bg-[var(--desktop-inspector-control-hover-bg)]"
            type="button"
            onClick={onRemove}
          >
            <MinusIcon className="size-3.5" />
          </button>
        </div>
      </div>
      <DesktopInspectorColorRow
        label="Color"
        value={shadow.color}
        onChange={(color) => onChange({ color: color || DEFAULT_SHADOW_COLOR })}
      />
      <div className="grid gap-2">
        <DesktopInspectorElasticSliderRow
          label="Blur"
          max={128}
          min={0}
          value={shadow.blur}
          valueLabel={`${Math.round(shadow.blur)}`}
          onChange={(blur) => onChange({ blur })}
        />
        <DesktopInspectorElasticSliderRow
          label="Opacity"
          max={100}
          min={0}
          value={shadow.opacity}
          valueLabel={`${Math.round(shadow.opacity)}%`}
          onChange={(opacity) => onChange({ opacity })}
        />
        <DesktopInspectorValueGrid>
          <DesktopInspectorNumberField
            label="X"
            max={128}
            min={-128}
            value={shadow.offsetX}
            onChange={(offsetX) => onChange({ offsetX })}
          />
          <DesktopInspectorNumberField
            label="Y"
            max={128}
            min={-128}
            value={shadow.offsetY}
            onChange={(offsetY) => onChange({ offsetY })}
          />
        </DesktopInspectorValueGrid>
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
            index={index}
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

  return (
    <DesktopInspectorSection
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, className)}
      dataSlot="desktop-appearance-filter-controls"
    >
      <DesktopInspectorLabel>Filters</DesktopInspectorLabel>
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
          updateLayerFilters([
            ...appearance.layerFilters,
            createDefaultDraftingFilterEffect(type, {
              amount: DRAFTING_FILTER_VISIBLE_DEFAULTS[type],
            }),
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
