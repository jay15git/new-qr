"use client"

import type { CornerDotType, CornerSquareType } from "qr-code-styling"

import {
  CORNER_DOT_STYLE_OPTIONS,
  CORNER_SQUARE_STYLE_OPTIONS,
  DOT_STYLE_OPTIONS,
} from "@/components/qr/qr-style-options"
import {
  StylePreview,
  type StylePreviewKind,
} from "@/components/qr/qr-style-preview-renderer"
import type { StudioDotType } from "@/components/qr/qr-studio-state"
import { OptionCard } from "@/components/ui/option-card"

export function DraftingStyleTab({
  onValueChange,
  value,
}: {
  onValueChange: (value: StudioDotType) => void
  value: StudioDotType
}) {
  return (
    <DraftingOptionCardGrid
      ariaLabel="Dot style options"
      dataSlot="drafting-style-option-grid"
      name="drafting-dot-style"
      options={DOT_STYLE_OPTIONS}
      previewKind="dots"
      value={value}
      onValueChange={onValueChange}
    />
  )
}

export function DraftingCornerSquareStyleTab({
  onValueChange,
  value,
}: {
  onValueChange: (value: CornerSquareType) => void
  value: CornerSquareType
}) {
  return (
    <DraftingOptionCardGrid
      ariaLabel="Corner frame style options"
      dataSlot="drafting-corner-square-option-grid"
      name="drafting-corner-square-style"
      options={CORNER_SQUARE_STYLE_OPTIONS}
      previewKind="corner-square"
      value={value}
      onValueChange={onValueChange}
    />
  )
}

export function DraftingCornerDotStyleTab({
  onValueChange,
  value,
}: {
  onValueChange: (value: CornerDotType) => void
  value: CornerDotType
}) {
  return (
    <DraftingOptionCardGrid
      ariaLabel="Corner dot style options"
      dataSlot="drafting-corner-dot-option-grid"
      name="drafting-corner-dot-style"
      options={CORNER_DOT_STYLE_OPTIONS}
      previewKind="corner-dot"
      value={value}
      onValueChange={onValueChange}
    />
  )
}

function DraftingOptionCardGrid<TValue extends string>({
  ariaLabel,
  dataSlot,
  name,
  onValueChange,
  options,
  previewKind,
  value,
}: {
  ariaLabel: string
  dataSlot: string
  name: string
  onValueChange: (value: TValue) => void
  options: Array<{ label: string; value: TValue }>
  previewKind: StylePreviewKind
  value: TValue
}) {
  return (
    <div className="space-y-4" data-slot="drafting-style-tab">
      <div
        aria-label={ariaLabel}
        className="-mx-3 grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 px-1"
        data-slot={dataSlot}
        role="radiogroup"
      >
        {options.map((option) => (
          <OptionCard
            key={option.value}
            checked={option.value === value}
            label={option.label}
            name={name}
            onSelect={() => onValueChange(option.value)}
            value={option.value}
          >
            <StylePreview previewKind={previewKind} value={option.value} />
          </OptionCard>
        ))}
      </div>
    </div>
  )
}
