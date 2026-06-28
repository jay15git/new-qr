"use client"

import { ColorPicker } from "@/components/ui/color-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DESKTOP_INSPECTOR_LABEL_CLASS,
  DESKTOP_INSPECTOR_ROW_CLASS,
  DesktopInspectorTextInput,
} from "@/features/desktop-shell/components/InspectorControls"
import { cn } from "@/lib/utils"

export function DesktopColorInputRow({
  ariaLabel,
  label,
  onChange,
  value,
}: {
  ariaLabel?: string
  label: string
  onChange: (value: string) => void
  value: string
}) {
  const inputLabel = ariaLabel ?? label

  return (
    <div className={DESKTOP_INSPECTOR_ROW_CLASS}>
      <span className={DESKTOP_INSPECTOR_LABEL_CLASS}>{label}</span>
      <span className="flex items-center gap-2">
        <DesktopColorSwatchPicker
          ariaLabel={`${inputLabel} swatch`}
          value={value}
          onChange={onChange}
        />
        <DesktopInspectorTextInput
          aria-label={inputLabel}
          className="h-7 w-20 rounded-[5px] px-2"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </span>
    </div>
  )
}

export function DesktopColorSwatchPicker({
  ariaLabel,
  onChange,
  value,
}: {
  ariaLabel: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <DesktopColorPickerPopover
      aria-label={ariaLabel}
      triggerClassName="size-7 shrink-0 border-2 border-[var(--desktop-inspector-swatch-ring)] p-0.5"
      value={value}
      onChange={onChange}
    />
  )
}

export function DesktopColorPickerPopover({
  ariaLabel,
  "aria-label": ariaLabelProp,
  onChange,
  triggerClassName,
  value,
}: {
  ariaLabel?: string
  "aria-label"?: string
  onChange: (value: string) => void
  triggerClassName?: string
  value: string
}) {
  const triggerLabel = ariaLabel ?? ariaLabelProp ?? "Color swatch"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={triggerLabel}
          className={cn(
            "box-border grid cursor-pointer overflow-hidden rounded-full bg-transparent p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
            triggerClassName,
          )}
          data-slot="desktop-color-picker"
          type="button"
        >
          <span
            aria-hidden="true"
            className="block size-full min-h-0 min-w-0 rounded-full"
            style={{ backgroundColor: value }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        data-slot="desktop-color-picker-popover"
        className="w-auto border-0 bg-transparent p-0 shadow-none"
        side="right"
        sideOffset={8}
      >
        <ColorPicker
          className={cn(
            "max-w-none !bg-[var(--desktop-color-picker-popover-bg)] !text-[var(--desktop-color-picker-popover-fg)] border-[var(--desktop-color-picker-popover-border)] shadow-2xl shadow-black/30 backdrop-blur-xl",
          )}
          defaultFormat="hex"
          onValueChange={(nextValue) => onChange(nextValue)}
          value={value}
        />
      </PopoverContent>
    </Popover>
  )
}
