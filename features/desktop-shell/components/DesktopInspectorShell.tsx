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
  DesktopInspectorScrubNumberInput,
  useDesktopInspectorNumberScrub,
} from "@/features/desktop-shell/components/InspectorControls"
import { SurfaceProvider } from "@/lib/surface-context"
import { cn } from "@/lib/utils"

export const DESKTOP_ELASTIC_SLIDER_CLASS =
  "desktop-elastic-slider [--elastic-slider-height:--spacing(8)] [--elastic-slider-radius:9999px] [--elastic-slider-bg:rgba(255,255,255,0.095)] [--elastic-slider-fill:rgba(255,255,255,0.13)] [--elastic-slider-fill-active:rgba(255,255,255,0.2)] [--elastic-slider-hash:rgba(255,255,255,0.24)] [--elastic-slider-handle:rgba(255,255,255,0.7)] [--elastic-slider-label:rgba(255,255,255,0.58)] [--elastic-slider-focus:rgba(255,255,255,0.82)]"


export type DesktopInspectorOptionGridColumns = 2 | 3 | 4

export type DesktopInspectorOptionGridRowKind =
  | "square"
  | "labeled"
  | "h-12"
  | "h-10"
  | "h-9"
  | "h-8"
  | "content"

function desktopOptionGridScrollHeightClass({
  columns = 3,
  rowKind,
  variant,
}: {
  columns?: DesktopInspectorOptionGridColumns
  rowKind?: DesktopInspectorOptionGridRowKind
  variant: DesktopInspectorOptionGridVariant
}): string {
  const resolvedRowKind: DesktopInspectorOptionGridRowKind =
    rowKind ??
    (variant === "content"
      ? "content"
      : variant === "preset"
        ? "square"
        : columns === 4
          ? "h-12"
          : "h-10")

  // Fixed three-row viewport heights tuned for the desktop inspector column widths.
  // ScrollArea keeps a definite height so overflow scrolls inside the shelf.
  switch (resolvedRowKind) {
    case "square":
      if (columns === 2) return "h-[24.75rem]"
      if (columns === 4) return "h-[12.75rem]"
      return "h-[16.5rem]"
    case "labeled":
      return columns === 2 ? "h-[20.25rem]" : "h-[16.5rem]"
    case "h-12":
      return "h-[10.5rem]"
    case "h-10":
      return "h-[7.125rem]"
    case "h-9":
      return "h-[6.75rem]"
    case "h-8":
      return "h-[6.375rem]"
    case "content":
      return "h-[11.625rem]"
  }
}

export type DesktopInspectorOptionGridVariant = "preset" | "compact" | "content"

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
  columns = 3,
  dataSlot,
  role = "group",
  rowKind,
  shelfDataSlot,
  shelfId,
  variant,
}: {
  ariaLabel: string
  children: ReactNode
  className?: string
  columns?: DesktopInspectorOptionGridColumns
  dataSlot: string
  role?: "group" | "listbox"
  rowKind?: DesktopInspectorOptionGridRowKind
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
        className={cn(
          "shrink-0 overflow-hidden",
          desktopOptionGridScrollHeightClass({ columns, rowKind, variant }),
          className,
        )}
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
  return <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-2">{children}</div>
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
  const scrub = useDesktopInspectorNumberScrub({
    disabled,
    max,
    min,
    onChange,
    step,
    value,
  })

  return (
    <div className="flex min-w-0 items-center gap-1" role="group">
      <span
        className={cn(
          "w-3.5 shrink-0 text-center",
          DESKTOP_INSPECTOR_LABEL_CLASS,
          scrub.canScrub && "cursor-ew-resize select-none",
        )}
        {...scrub.labelScrubHandlers}
      >
        {label}
      </span>
      <DesktopInspectorScrubNumberInput
        aria-label={label}
        className="h-7 w-[4.75rem]"
        disabled={disabled}
        inputClassName="h-7 w-full rounded-[6px] px-1.5"
        scrub={scrub}
        step={step}
      />
    </div>
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
          className="box-border size-7 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-[var(--desktop-inspector-swatch-ring)] bg-transparent p-0.5"
          data-slot="desktop-color-swatch-ring"
          type="color"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        <DesktopInspectorTextInput
          aria-label={label}
          className="h-7 w-20 rounded-[5px] px-2"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </span>
    </div>
  )
}
