"use client"

import {
  type ComponentProps,
  type ReactNode,
} from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const DESKTOP_INSPECTOR_SECTION_CLASS =
  "rounded-[10px] bg-[var(--desktop-inspector-section-bg)] p-3"
export const DESKTOP_INSPECTOR_SECTION_GAP_CLASS = "mt-2.5"
export const DESKTOP_INSPECTOR_MAJOR_GAP_CLASS = "mt-4"
export const DESKTOP_INSPECTOR_ROW_GAP_CLASS = "gap-2"
export const DESKTOP_INSPECTOR_ROW_CLASS =
  "flex min-w-0 items-center justify-between gap-3 border-b border-white/[0.07] py-2.5 last:border-b-0"
export const DESKTOP_INSPECTOR_FIELD_ROW_CLASS =
  "min-w-0 border-b border-white/[0.07] py-2.5 last:border-b-0"
export const DESKTOP_INSPECTOR_LABEL_CLASS =
  "truncate text-[12px] font-semibold text-white/74"
export const DESKTOP_INSPECTOR_SCROLL_CLASS =
  "min-h-0 flex-1 overflow-y-auto px-3 py-3 scroll-fade-effect-y"
export const DESKTOP_INSPECTOR_CONTROL_CLASS =
  "rounded-[6px] border border-transparent bg-transparent text-white/58 transition hover:border-[var(--desktop-inspector-control-border-hover)] hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-white active:bg-[var(--desktop-inspector-control-active-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
export const DESKTOP_INSPECTOR_SELECTED_CLASS =
  "border-transparent bg-[var(--desktop-inspector-option-selected-bg)] text-[var(--desktop-inspector-option-selected-fg)] hover:border-transparent hover:bg-[var(--desktop-inspector-option-selected-bg)] hover:text-[var(--desktop-inspector-option-selected-fg)]"
export const DESKTOP_OPTION_CARD_SELECTED_CLASS =
  "border-[var(--desktop-inspector-option-selected-border)] bg-[var(--desktop-inspector-option-selected-bg)] text-[var(--desktop-inspector-option-selected-fg)] hover:bg-[var(--desktop-inspector-option-selected-bg)] hover:text-[var(--desktop-inspector-option-selected-fg)]"
export const DESKTOP_INSPECTOR_INPUT_CLASS =
  "desktop-inspector-input-bg bg-[var(--desktop-inspector-field-bg)] text-white outline-none placeholder:text-white/32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
export const DESKTOP_INSPECTOR_FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
export const DESKTOP_INSPECTOR_HEADER_CLASS =
  "flex min-w-0 items-center justify-center bg-[var(--desktop-inspector-header-bg)] px-4 py-3 text-center"
export const DESKTOP_INSPECTOR_FOOTER_CLASS =
  "bg-[var(--desktop-inspector-footer-bg)] p-2.5"
export const DESKTOP_INSPECTOR_RESET_CLASS =
  "flex h-9 w-full items-center justify-center gap-2 rounded-[6px] border border-transparent bg-transparent px-3 text-[12px] font-semibold text-white/82 transition hover:border-[var(--desktop-inspector-control-border-hover)] hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-white active:bg-[var(--desktop-inspector-control-active-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"

type DesktopInspectorSectionProps = ComponentProps<"section"> & {
  dataSlot?: string
}

export function DesktopInspectorSection({
  children,
  className,
  dataSlot,
  ...props
}: DesktopInspectorSectionProps) {
  return (
    <section
      data-slot={dataSlot}
      className={cn(DESKTOP_INSPECTOR_SECTION_CLASS, className)}
      {...props}
    >
      {children}
    </section>
  )
}

type DesktopInspectorLabelProps = ComponentProps<"p">

export function DesktopInspectorLabel({
  className,
  ...props
}: DesktopInspectorLabelProps) {
  return (
    <p
      className={cn("mb-2", DESKTOP_INSPECTOR_LABEL_CLASS, "text-white", className)}
      {...props}
    />
  )
}

type DesktopInspectorTextInputProps = ComponentProps<"input">

export function DesktopInspectorTextInput({
  className,
  type = "text",
  ...props
}: DesktopInspectorTextInputProps) {
  return (
    <input
      className={cn("h-9 w-full rounded-[7px] px-3 text-[12px]", DESKTOP_INSPECTOR_INPUT_CLASS, className)}
      type={type}
      {...props}
    />
  )
}

type DesktopInspectorTextareaProps = ComponentProps<"textarea">

export function DesktopInspectorTextarea({
  className,
  ...props
}: DesktopInspectorTextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-none rounded-[7px] px-3 py-2.5 text-[12px] leading-5",
        DESKTOP_INSPECTOR_INPUT_CLASS,
        className,
      )}
      {...props}
    />
  )
}

type DesktopInspectorNativeSelectProps<TValue extends string> =
  Omit<ComponentProps<"select">, "onChange" | "value"> & {
    options: Array<{ label: string; value: TValue }>
    onValueChange: (value: TValue) => void
    rootClassName?: string
    showIcon?: boolean
    value: TValue
  }

export function DesktopInspectorNativeSelect<TValue extends string>({
  className,
  onValueChange,
  options,
  rootClassName,
  showIcon = true,
  value,
  ...props
}: DesktopInspectorNativeSelectProps<TValue>) {
  return (
    <div className={cn("relative min-w-0", rootClassName)}>
      <select
        className={cn(
          "h-8 w-full appearance-none rounded-[6px] px-2.5 pr-7 text-[12px] font-semibold transition",
          DESKTOP_INSPECTOR_INPUT_CLASS,
          className,
        )}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value as TValue)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showIcon ? (
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-white/55" />
      ) : null}
    </div>
  )
}

type DesktopInspectorSegmentedControlProps<TValue extends string> = {
  ariaLabelPrefix?: string
  className?: string
  columns?: 2 | 3 | 4
  dataSlot?: string
  itemClassName?: string
  items: Array<{ icon?: ReactNode; label: string; value: TValue }>
  itemAriaLabel?: (item: { icon?: ReactNode; label: string; value: TValue }) => string
  onValueChange: (value: TValue) => void
  selectedClassName?: string
  value: TValue
}

export function DesktopInspectorSegmentedControl<TValue extends string>({
  ariaLabelPrefix,
  className,
  columns = 2,
  dataSlot,
  itemClassName,
  itemAriaLabel,
  items,
  onValueChange,
  selectedClassName = DESKTOP_INSPECTOR_SELECTED_CLASS,
  value,
}: DesktopInspectorSegmentedControlProps<TValue>) {
  return (
    <div
      className={cn(
        "grid gap-1.5",
        columns === 4 ? "grid-cols-4" : columns === 3 ? "grid-cols-3" : "grid-cols-2",
        className,
      )}
      data-slot={dataSlot}
    >
      {items.map((item) => (
        <button
          key={item.value}
          aria-label={itemAriaLabel?.(item) ?? (ariaLabelPrefix ? `${ariaLabelPrefix} ${item.label}` : undefined)}
          aria-pressed={value === item.value}
          className={cn(
            "h-8 truncate px-2 text-[11px] font-semibold",
            DESKTOP_INSPECTOR_CONTROL_CLASS,
            value === item.value && selectedClassName,
            itemClassName,
          )}
          type="button"
          onClick={() => onValueChange(item.value)}
        >
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          {item.label}
        </button>
      ))}
    </div>
  )
}

type DesktopInspectorOptionButtonProps = ComponentProps<"button"> & {
  selected?: boolean
  selectedClassName?: string
}

export function DesktopInspectorOptionButton({
  children,
  className,
  selected,
  selectedClassName = DESKTOP_INSPECTOR_SELECTED_CLASS,
  type = "button",
  ...props
}: DesktopInspectorOptionButtonProps) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        DESKTOP_INSPECTOR_CONTROL_CLASS,
        selected && selectedClassName,
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

type DesktopInspectorSearchInputProps =
  Omit<ComponentProps<"input">, "onChange"> & {
    iconClassName?: string
    inputClassName?: string
    onValueChange: (value: string) => void
  }

export function DesktopInspectorSearchInput({
  className,
  iconClassName,
  inputClassName,
  onValueChange,
  type = "search",
  ...props
}: DesktopInspectorSearchInputProps) {
  return (
    <div className={cn("relative h-8 w-24 shrink-0", className)}>
      <SearchIcon
        className={cn(
          "pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-white/45",
          iconClassName,
        )}
      />
      <input
        className={cn(
          "h-full w-full rounded-[6px] pl-7 pr-2 text-[12px]",
          DESKTOP_INSPECTOR_INPUT_CLASS,
          inputClassName,
        )}
        type={type}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        {...props}
      />
    </div>
  )
}
