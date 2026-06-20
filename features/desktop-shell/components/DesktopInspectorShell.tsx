"use client"

import { type ReactNode } from "react"

import { ElasticSlider } from "@/components/ui/elastic-slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DESKTOP_INSPECTOR_HEADER_CLASS,
  DESKTOP_INSPECTOR_LABEL_CLASS,
  DESKTOP_INSPECTOR_PANEL_TITLE_CLASS,
  DESKTOP_INSPECTOR_ROW_CLASS,
  DesktopInspectorTextInput,
  desktopInspectorOptionGridClass,
} from "@/features/desktop-shell/components/InspectorControls"
import { SurfaceProvider } from "@/lib/surface-context"
import { cn } from "@/lib/utils"

export const DESKTOP_ELASTIC_SLIDER_CLASS =
  "desktop-elastic-slider [--elastic-slider-height:--spacing(8)] [--elastic-slider-radius:9999px] [--elastic-slider-bg:rgba(255,255,255,0.095)] [--elastic-slider-fill:rgba(255,255,255,0.13)] [--elastic-slider-fill-active:rgba(255,255,255,0.2)] [--elastic-slider-hash:rgba(255,255,255,0.24)] [--elastic-slider-handle:rgba(255,255,255,0.7)] [--elastic-slider-label:rgba(255,255,255,0.58)] [--elastic-slider-focus:rgba(255,255,255,0.82)]"

const OPTION_GRID_VARIANT_CLASS = {
  preset: "h-80",
  compact: "max-h-40",
  content: "h-[180px]",
} as const

export type DesktopInspectorOptionGridVariant = keyof typeof OPTION_GRID_VARIANT_CLASS

export function DesktopInspectorHeader({ title }: { title: string }) {
  return (
    <div className={DESKTOP_INSPECTOR_HEADER_CLASS}>
      <h2 className={DESKTOP_INSPECTOR_PANEL_TITLE_CLASS}>{title}</h2>
    </div>
  )
}

export function DesktopInspectorScrollArea({ children }: { children: ReactNode }) {
  return (
    <ScrollArea
      chevron
      cueSize="comfortable"
      data-slot="desktop-inspector-scroll-area"
      scrollFade
      className="min-h-0 flex-1"
      viewportClassName="px-3 py-3"
    >
      <div data-slot="desktop-inspector-scroll">{children}</div>
    </ScrollArea>
  )
}

export function DesktopInspectorOptionGridScrollArea({
  ariaLabel,
  children,
  className,
  dataSlot,
  role = "group",
  shelfDataSlot,
  shelfId,
  variant,
}: {
  ariaLabel: string
  children: ReactNode
  className?: string
  dataSlot: string
  role?: "group" | "listbox"
  shelfDataSlot?: string
  shelfId?: string
  variant: DesktopInspectorOptionGridVariant
}) {
  return (
    <SurfaceProvider value={2}>
      <ScrollArea
        chevron
        cueSize="tight"
        data-slot={dataSlot}
        scrollFade
        className={cn("overflow-hidden", OPTION_GRID_VARIANT_CLASS[variant], className)}
        viewportClassName="pr-1"
      >
        <div
          aria-label={ariaLabel}
          data-slot={shelfDataSlot ?? dataSlot.replace(/-scroll-area$/, "")}
          id={shelfId}
          role={role}
        >
          {children}
        </div>
      </ScrollArea>
    </SurfaceProvider>
  )
}

export function DesktopInspectorElasticSliderRow({
  ariaLabel,
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
  valueLabel,
}: {
  ariaLabel?: string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step?: number
  value: number
  valueLabel: string
}) {
  return (
    <div data-slot="desktop-elastic-slider-row" className="grid min-w-0 py-1.5">
      <div data-slot="desktop-elastic-slider">
        <ElasticSlider
          aria-label={ariaLabel ?? label}
          className={DESKTOP_ELASTIC_SLIDER_CLASS}
          formatValue={() => valueLabel}
          label={label}
          max={max}
          min={min}
          scrubSound
          step={step}
          value={value}
          onValueChange={onChange}
        />
      </div>
    </div>
  )
}

export function DesktopInspectorValueGrid({ children }: { children: ReactNode }) {
  return <div className={desktopInspectorOptionGridClass(2)}>{children}</div>
}

export function DesktopInspectorNumberField({
  disabled,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  disabled?: boolean
  label: string
  max?: number
  min?: number
  onChange: (value: number) => void
  step?: number
  value: number
}) {
  return (
    <label className="flex min-w-0 items-center gap-1.5">
      <span className={cn("w-3 shrink-0 text-[11px]", DESKTOP_INSPECTOR_LABEL_CLASS)}>{label}</span>
      <DesktopInspectorTextInput
        aria-label={label}
        className="h-8 min-w-0 flex-1 rounded-[6px] px-2 text-[12px] font-semibold"
        disabled={disabled}
        max={max}
        min={min}
        step={step}
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.currentTarget.value)

          if (Number.isFinite(nextValue)) {
            onChange(nextValue)
          }
        }}
      />
    </label>
  )
}

export function DesktopInspectorColorRow({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <div className={DESKTOP_INSPECTOR_ROW_CLASS}>
      <span className={DESKTOP_INSPECTOR_LABEL_CLASS}>{label}</span>
      <span className="flex items-center gap-2">
        <input
          aria-label={`${label} swatch`}
          className="size-7 shrink-0 cursor-pointer rounded-full border-2 border-white/20 bg-transparent p-0.5"
          style={{ borderColor: value }}
          type="color"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        <DesktopInspectorTextInput
          aria-label={label}
          className="h-7 w-20 rounded-[5px] px-2 text-[11px] font-semibold"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </span>
    </div>
  )
}
