"use client"

import { cn } from "@/lib/utils"

export function InspectorNumberInput({
  disabled,
  label,
  max,
  min,
  onChange,
  step = 1,
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
    <label className="min-w-0">
      <span className="drafting-type-meta mb-1 block font-semibold text-[var(--drafting-ink-muted)]">
        {label}
      </span>
      <input
        className="drafting-type-input h-9 w-full min-w-0 rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-2 text-[var(--drafting-ink)] shadow-none disabled:opacity-45"
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

export function InspectorToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "h-9 rounded-[6px] border border-[var(--drafting-line)] px-2 text-xs font-semibold text-[var(--drafting-ink-muted)]",
        active &&
          "border-[var(--drafting-ink)] bg-[var(--drafting-control-bg-active)] text-[var(--drafting-ink)]",
      )}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function InspectorToggleCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="drafting-type-meta flex min-w-0 items-center gap-2 font-semibold text-[var(--drafting-ink)]">
      <input
        checked={checked}
        className="size-4 accent-[var(--drafting-ink)]"
        type="checkbox"
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      {label}
    </label>
  )
}
