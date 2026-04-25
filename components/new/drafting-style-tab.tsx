"use client"

import { type ReactNode } from "react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type {
  CornerDotType,
  CornerSquareType,
  ErrorCorrectionLevel,
  TypeNumber,
} from "qr-code-styling"

import FileUpload from "@/components/kokonutui/file-upload"
import type {
  BrandIconCategory,
  BrandIconEntry,
} from "@/components/qr/brand-icon-catalog"
import {
  EmbeddedColorPickerField,
  GradientEditor,
} from "@/components/qr/qr-control-sections"
import {
  CORNER_DOT_STYLE_OPTIONS,
  CORNER_SQUARE_STYLE_OPTIONS,
  DOT_STYLE_OPTIONS,
} from "@/components/qr/qr-style-options"
import {
  ERROR_CORRECTION_LEVEL_OPTIONS,
  formatTypeNumberLabel,
  TYPE_NUMBER_MAX,
  TYPE_NUMBER_MIN,
} from "@/components/qr/qr-encoding-options"
import {
  StylePreview,
  type StylePreviewKind,
} from "@/components/qr/qr-style-preview-renderer"
import { Slider as UnlumenSlider } from "@/components/unlumen-ui/slider"
import type {
  DotsColorMode,
  StudioDotType,
  StudioGradient,
} from "@/components/qr/qr-studio-state"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OptionCard } from "@/components/ui/option-card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { QR_SIZE_MAX, QR_SIZE_MIN } from "@/components/qr/qr-studio-state"

export type DraftingBinaryColorMode = "solid" | "gradient"
export type DraftingBackgroundColorMode = DraftingBinaryColorMode | "transparent"
type DraftingAssetSourceMode = "upload" | "url"
type DraftingBrandIconCategoryFilter = BrandIconCategory | "all"

const DRAFTING_BRAND_ICON_CATEGORY_OPTIONS: Array<{
  label: string
  value: DraftingBrandIconCategoryFilter
}> = [
  { label: "All", value: "all" },
  { label: "Social", value: "social" },
  { label: "Business", value: "business" },
  { label: "Payments", value: "payments" },
  { label: "Travel", value: "travel" },
  { label: "Media", value: "media" },
  { label: "Web", value: "web" },
]

export function DraftingContentTab({
  contentValue,
  onContentValueChange,
}: {
  contentValue: string
  onContentValueChange: (value: string) => void
}) {
  return (
    <div data-slot="drafting-content-tab" className="min-w-0 space-y-4">
      <div
        data-slot="drafting-content-textarea-field"
        className={cn(
          "min-w-0 rounded-[8px] border border-[#00000017] bg-[#FFFFFFCC] px-4 py-3 dark:border-border dark:bg-card/80",
          "shadow-[0_0_10px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.03)] dark:shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.28)]",
          "transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
          "hover:-translate-y-px hover:border-[#00000026] hover:bg-[#FFFFFFF2] hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.07),0_4px_10px_0_rgba(0,0,0,0.04)] dark:hover:border-border/80 dark:hover:bg-card dark:hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.06),0_4px_10px_0_rgba(0,0,0,0.34)]",
          "active:translate-y-0 active:border-[#00000030] active:shadow-[0_0_8px_0_rgba(0,0,0,0.07),0_1px_3px_0_rgba(0,0,0,0.06)] dark:active:border-border dark:active:shadow-[0_0_8px_0_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.34)]",
          "focus-within:border-[#11111166] focus-within:bg-white focus-within:shadow-[0_0_18px_1px_rgba(0,0,0,0.09),0_4px_10px_0_rgba(0,0,0,0.05)] dark:focus-within:border-ring dark:focus-within:bg-card dark:focus-within:shadow-[0_0_18px_1px_rgba(0,0,0,0.07),0_4px_10px_0_rgba(0,0,0,0.34)]",
        )}
      >
        <label
          htmlFor="drafting-qr-data"
          className="block text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[#111111] dark:text-foreground"
        >
          Text or URL
        </label>
        <Textarea
          id="drafting-qr-data"
          aria-label="Text or URL"
          className="mt-3 min-h-28 border-0 bg-white/70 px-3.5 py-3 text-sm text-[#111111] shadow-none placeholder:text-[#00000052] focus-visible:border-0 focus-visible:ring-0 dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground"
          placeholder="https://example.com/invite"
          value={contentValue}
          onChange={(event) => onContentValueChange(event.target.value)}
        />
      </div>

    </div>
  )
}

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

export function DraftingSizeTab({
  margin,
  size,
  onMarginChange,
  onSizeChange,
}: {
  margin: number
  size: number
  onMarginChange: (value: number) => void
  onSizeChange: (value: number) => void
}) {
  return (
    <div data-slot="drafting-style-size-tab" className="min-w-0 space-y-3">
      <DraftingSliderField
        dataSlot="drafting-style-margin-slider"
        description="Controls the quiet zone around the QR so scanners have room to detect the code."
        formatValue={(value) => `${Math.round(value)} px`}
        id="drafting-qr-margin"
        label="Outer margin"
        max={80}
        min={0}
        step={1}
        value={margin}
        onChange={onMarginChange}
      />

      <DraftingSliderField
        dataSlot="drafting-style-size-slider"
        description="Scales the QR canvas before export while keeping the code square."
        formatValue={(value) => `${Math.round(value)} px`}
        id="drafting-qr-size"
        label="Size"
        max={QR_SIZE_MAX}
        min={QR_SIZE_MIN}
        step={1}
        value={size}
        onChange={onSizeChange}
      />
    </div>
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

export function DraftingDotsColorTab({
  mode,
  openItemIds,
  palette,
  solidColor,
  gradient,
  onGradientChange,
  onModeChange,
  onOpenItemIdsChange,
  onSolidColorChange,
}: {
  gradient: StudioGradient
  mode: DotsColorMode
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DotsColorMode) => void
  onOpenItemIdsChange: (itemIds: string[]) => void
  onSolidColorChange: (value: string) => void
  openItemIds: string[]
  palette: string[]
  solidColor: string
}) {
  const items: Array<{
    id: DotsColorMode
    title: string
    content: ReactNode
  }> = [
    {
      id: "solid",
      title: "Solid",
      content: (
        <div className="min-w-0 px-4 pb-4">
          <EmbeddedColorPickerField
            chrome="minimal"
            label="Solid color"
            onValueChange={(value) => {
              onModeChange("solid")
              onSolidColorChange(value)
            }}
            pickerChrome="drafting"
            pickerClassName="mx-auto max-w-full"
            size={320}
            value={solidColor}
          />
        </div>
      ),
    },
    {
      id: "gradient",
      title: "Gradient",
      content: (
        <div className="min-w-0 px-4 pb-4">
          <GradientEditor
            gradient={{ ...gradient, enabled: true }}
            hideToggle
            idPrefix="drafting-dots-gradient"
            layout="drafting"
            onGradientChange={(value) => {
              onModeChange("gradient")
              onGradientChange(value)
            }}
            title="Dot gradient"
            variant="dot-enhanced"
          />
        </div>
      ),
    },
    {
      id: "palette",
      title: "Palette",
      content: (
        <div className="min-w-0 px-4 pb-4">
          <div
            data-slot="drafting-dots-palette-panel"
            className="min-w-0 space-y-3"
          >
            <div className="flex min-w-0 flex-wrap gap-2">
              {palette.map((color) => (
                <span
                  key={color}
                  aria-hidden="true"
                  className="size-7 shrink-0 rounded-full border border-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-[8px] border-[#00000017] bg-[#FFFFFFE6] text-[#111111] shadow-[0_0_10px_0_rgba(0,0,0,0.06),0_2px_4px_0_rgba(0,0,0,0.04)] hover:border-[#0000002A] hover:bg-[#FFFFFFF2] dark:border-border dark:bg-card dark:text-foreground dark:shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.28)] dark:hover:border-border/80 dark:hover:bg-muted/50"
              onClick={() => onModeChange("palette")}
            >
              Use palette
            </Button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <DraftingColorAccordion
      dataSlot="drafting-dots-color-accordion"
      items={items}
      mode={mode}
      openItemIds={openItemIds}
      onOpenItemIdsChange={onOpenItemIdsChange}
    />
  )
}

export function DraftingCornerSquareColorTab({
  gradient,
  mode,
  openItemIds,
  solidColor,
  onGradientChange,
  onModeChange,
  onOpenItemIdsChange,
  onSolidColorChange,
}: {
  gradient: StudioGradient
  mode: DraftingBinaryColorMode
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DraftingBinaryColorMode) => void
  onOpenItemIdsChange: (itemIds: string[]) => void
  onSolidColorChange: (value: string) => void
  openItemIds: string[]
  solidColor: string
}) {
  return (
    <DraftingColorAccordion
      dataSlot="drafting-corner-square-color-accordion"
      items={buildDraftingSolidGradientItems({
        gradient,
        gradientIdPrefix: "drafting-corner-square-gradient",
        gradientTitle: "Corner frame gradient",
        onGradientChange,
        onModeChange,
        onSolidColorChange,
        solidColor,
      })}
      mode={mode}
      openItemIds={openItemIds}
      onOpenItemIdsChange={onOpenItemIdsChange}
    />
  )
}

export function DraftingCornerDotColorTab({
  gradient,
  mode,
  openItemIds,
  solidColor,
  onGradientChange,
  onModeChange,
  onOpenItemIdsChange,
  onSolidColorChange,
}: {
  gradient: StudioGradient
  mode: DraftingBinaryColorMode
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DraftingBinaryColorMode) => void
  onOpenItemIdsChange: (itemIds: string[]) => void
  onSolidColorChange: (value: string) => void
  openItemIds: string[]
  solidColor: string
}) {
  return (
    <DraftingColorAccordion
      dataSlot="drafting-corner-dot-color-accordion"
      items={buildDraftingSolidGradientItems({
        gradient,
        gradientIdPrefix: "drafting-corner-dot-gradient",
        gradientTitle: "Corner dot gradient",
        onGradientChange,
        onModeChange,
        onSolidColorChange,
        solidColor,
      })}
      mode={mode}
      openItemIds={openItemIds}
      onOpenItemIdsChange={onOpenItemIdsChange}
    />
  )
}

export function DraftingBackgroundColorTab({
  gradient,
  mode,
  openItemIds,
  solidColor,
  onGradientChange,
  onModeChange,
  onOpenItemIdsChange,
  onSolidColorChange,
}: {
  gradient: StudioGradient
  mode: DraftingBinaryColorMode
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DraftingBinaryColorMode) => void
  onOpenItemIdsChange: (itemIds: string[]) => void
  onSolidColorChange: (value: string) => void
  openItemIds: string[]
  solidColor: string
}) {
  return (
    <DraftingColorAccordion
      dataSlot="drafting-background-color-accordion"
      items={buildDraftingSolidGradientItems({
        gradient,
        gradientIdPrefix: "drafting-background-gradient",
        gradientTitle: "Background gradient",
        onGradientChange,
        onModeChange,
        onSolidColorChange,
        solidColor,
      })}
      mode={mode}
      openItemIds={openItemIds}
      onOpenItemIdsChange={onOpenItemIdsChange}
    />
  )
}

export function DraftingEditBackgroundColorTab({
  gradient,
  mode,
  openItemIds,
  solidColor,
  onGradientChange,
  onModeChange,
  onOpenItemIdsChange,
  onSolidColorChange,
  onTransparentSelect,
}: {
  gradient: StudioGradient
  mode: DraftingBackgroundColorMode
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DraftingBackgroundColorMode) => void
  onOpenItemIdsChange: (itemIds: string[]) => void
  onSolidColorChange: (value: string) => void
  onTransparentSelect: () => void
  openItemIds: string[]
  solidColor: string
}) {
  return (
    <DraftingColorAccordion
      dataSlot="drafting-background-color-accordion"
      items={buildDraftingBackgroundColorItems({
        gradient,
        gradientIdPrefix: "drafting-background-gradient",
        gradientTitle: "Background gradient",
        includeTransparent: true,
        onGradientChange,
        onModeChange,
        onSolidColorChange,
        onTransparentSelect,
        solidColor,
      })}
      mode={mode}
      openItemIds={openItemIds}
      onOpenItemIdsChange={onOpenItemIdsChange}
    />
  )
}

export function DraftingLogoColorTab({
  gradient,
  mode,
  openItemIds,
  solidColor,
  onGradientChange,
  onModeChange,
  onOpenItemIdsChange,
  onSolidColorChange,
}: {
  gradient: StudioGradient
  mode: DraftingBinaryColorMode
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DraftingBinaryColorMode) => void
  onOpenItemIdsChange: (itemIds: string[]) => void
  onSolidColorChange: (value: string) => void
  openItemIds: string[]
  solidColor: string
}) {
  return (
    <DraftingColorAccordion
      dataSlot="drafting-logo-color-accordion"
      items={buildDraftingSolidGradientItems({
        gradient,
        gradientIdPrefix: "drafting-logo-gradient",
        gradientTitle: "Logo icon gradient",
        onGradientChange,
        onModeChange,
        onSolidColorChange,
        solidColor,
        solidLabel: "Logo icon color",
      })}
      mode={mode}
      openItemIds={openItemIds}
      onOpenItemIdsChange={onOpenItemIdsChange}
    />
  )
}

export function DraftingBrandIconTab({
  brandIcons,
  brandIconQuery,
  onBrandIconCategoryChange,
  onBrandIconQueryChange,
  onSelect,
  selectedBrandIconId,
  selectedCategory,
}: {
  brandIcons: readonly BrandIconEntry[]
  brandIconQuery: string
  onBrandIconCategoryChange: (value: DraftingBrandIconCategoryFilter) => void
  onBrandIconQueryChange: (value: string) => void
  onSelect: (brandIcon: BrandIconEntry) => void
  selectedBrandIconId?: string
  selectedCategory: DraftingBrandIconCategoryFilter
}) {
  return (
    <div data-slot="drafting-brand-icon-tab" className="min-w-0 space-y-4">
      <section
        data-slot="drafting-brand-icon-picker"
        className="min-w-0 space-y-4"
      >
        <div className="relative space-y-2">
          <span
            aria-hidden="true"
            data-slot="drafting-brand-icon-search-icon"
            className="pointer-events-none absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-[#00000052] dark:text-muted-foreground"
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.8}
            />
          </span>
          <Input
            id="drafting-brand-icon-search"
            aria-label="Search brand icons"
            className="h-10 border-[#00000017] bg-[#FFFFFFE6] pl-9 pr-3 text-sm text-[#111111] shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.03)] placeholder:text-[#00000052] focus-visible:border-black/35 focus-visible:ring-0 dark:border-border dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground dark:focus-visible:border-ring"
            placeholder="Search Icons"
            value={brandIconQuery}
            onChange={(event) => onBrandIconQueryChange(event.target.value)}
          />
        </div>

        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          data-slot="drafting-brand-icon-category-picker"
          role="radiogroup"
        >
          {DRAFTING_BRAND_ICON_CATEGORY_OPTIONS.map((option) => {
            const isSelected = option.value === selectedCategory

            return (
              <OptionCard
                darkShadowTone="ink"
                key={option.value}
                checked={isSelected}
                className={cn(
                  "w-full gap-0",
                  "[&_[data-slot=option-card]]:h-[42px] [&_[data-slot=option-card]]:w-full",
                  "[&_[data-slot=option-card-motif]]:size-full",
                  "[&_[data-slot=option-card-label]]:sr-only",
                )}
                label={option.label}
                motifClassName="size-full px-3"
                name="drafting-brand-icon-category"
                onSelect={() => onBrandIconCategoryChange(option.value)}
                size="compact"
                value={option.value}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-full items-center justify-center text-[0.68rem] font-medium uppercase tracking-[0.12em]",
                    isSelected
                      ? "text-[#111111] dark:text-foreground"
                      : "text-[#00000066] dark:text-muted-foreground",
                  )}
                >
                  {option.label}
                </span>
              </OptionCard>
            )
          })}
        </div>

        <div
          data-slot="drafting-brand-icon-grid"
          className="-mx-2 grid grid-cols-4 justify-items-center gap-x-2 gap-y-4 px-1"
        >
          {brandIcons.map((brandIcon) => {
            const Icon = brandIcon.icon
            const isSelected = brandIcon.id === selectedBrandIconId

            return (
              <OptionCard
                darkShadowTone="ink"
                key={brandIcon.id}
                checked={isSelected}
                className={cn(
                  "w-[56px]",
                  "[&_[data-slot=option-card]]:h-[56px] [&_[data-slot=option-card]]:w-[56px]",
                  "[&_[data-slot=option-card-motif]]:text-[#111111] dark:[&_[data-slot=option-card-motif]]:text-foreground",
                )}
                label={brandIcon.label}
                labelClassName="text-[0.5rem] uppercase tracking-[0.08em] leading-[1.05] min-h-[1.2rem]"
                motifClassName="size-full px-1.5 py-1.5"
                name="drafting-brand-icon"
                onSelect={() => onSelect(brandIcon)}
                value={brandIcon.id}
              >
                <span
                  aria-hidden="true"
                  data-brand-icon-option={brandIcon.id}
                  data-selected={isSelected ? "true" : "false"}
                  data-slot="drafting-brand-icon-option"
                  className="flex size-full items-center justify-center"
                >
                  <span className="text-[#111111] dark:text-foreground">
                    <Icon className="size-[18px]" />
                  </span>
                </span>
              </OptionCard>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export function DraftingBackgroundUploadTab({
  mode,
  openItemIds,
  remoteUrl,
  onModeChange,
  onOpenItemIdsChange,
  onRemoteUrlChange,
  onUploadError,
  onUploadSuccess,
}: {
  mode: DraftingAssetSourceMode
  onModeChange: (mode: DraftingAssetSourceMode) => void
  onOpenItemIdsChange: (itemIds: string[]) => void
  onRemoteUrlChange: (value: string) => void
  onUploadError: (message: string) => void
  onUploadSuccess: (file: File) => void
  openItemIds: string[]
  remoteUrl: string
}) {
  return (
    <DraftingColorAccordion
      dataSlot="drafting-background-upload-accordion"
      items={buildDraftingAssetSourceItems({
        onModeChange,
        onRemoteUrlChange,
        onUploadError,
        onUploadSuccess,
        remoteUrl,
        remoteUrlAriaLabel: "Background image URL",
        remoteUrlPlaceholder: "https://example.com/background.png",
      })}
      mode={mode}
      openItemIds={openItemIds}
      onOpenItemIdsChange={onOpenItemIdsChange}
    />
  )
}

export function DraftingLogoUploadTab({
  mode,
  openItemIds,
  remoteUrl,
  onModeChange,
  onOpenItemIdsChange,
  onRemoteUrlChange,
  onUploadError,
  onUploadSuccess,
}: {
  mode: DraftingAssetSourceMode
  onModeChange: (mode: DraftingAssetSourceMode) => void
  onOpenItemIdsChange: (itemIds: string[]) => void
  onRemoteUrlChange: (value: string) => void
  onUploadError: (message: string) => void
  onUploadSuccess: (file: File) => void
  openItemIds: string[]
  remoteUrl: string
}) {
  return (
    <DraftingColorAccordion
      dataSlot="drafting-logo-upload-accordion"
      items={buildDraftingAssetSourceItems({
        onModeChange,
        onRemoteUrlChange,
        onUploadError,
        onUploadSuccess,
        remoteUrl,
        remoteUrlAriaLabel: "Remote logo URL",
        remoteUrlPlaceholder: "https://example.com/logo.png",
      })}
      mode={mode}
      openItemIds={openItemIds}
      onOpenItemIdsChange={onOpenItemIdsChange}
    />
  )
}

export function DraftingLogoSizeTab({
  hideBackgroundDots,
  logoMargin,
  logoSize,
  saveAsBlob,
  onHideBackgroundDotsChange,
  onLogoMarginChange,
  onLogoSizeChange,
  onSaveAsBlobChange,
}: {
  hideBackgroundDots: boolean
  logoMargin: number
  logoSize: number
  onHideBackgroundDotsChange: (value: boolean) => void
  onLogoMarginChange: (value: number) => void
  onLogoSizeChange: (value: number) => void
  onSaveAsBlobChange: (value: boolean) => void
  saveAsBlob: boolean
}) {
  return (
    <div
      data-slot="drafting-logo-size-tab"
      className="min-w-0 space-y-3"
    >
      <DraftingSliderField
        dataSlot="drafting-logo-size-slider"
        description="Sets the logo width as a percentage of the QR code."
        formatValue={(value) => `${Math.round(value)}%`}
        id="drafting-logo-size"
        label="Logo size"
        max={100}
        min={0}
        showSteps
        step={10}
        value={logoSize}
        onChange={onLogoSizeChange}
      />

      <DraftingSliderField
        dataSlot="drafting-logo-margin-slider"
        formatValue={(value) => `${Math.round(value)} px`}
        id="drafting-logo-margin"
        label="Logo margin"
        max={40}
        min={0}
        step={1}
        value={logoMargin}
        onChange={onLogoMarginChange}
      />

      <DraftingToggleField
        checked={hideBackgroundDots}
        dataSlot="drafting-logo-hide-background-dots"
        description="Clears the modules directly under the logo so the image reads cleanly."
        id="drafting-hide-background-dots"
        label="Hide background dots"
        onCheckedChange={onHideBackgroundDotsChange}
      />

      <DraftingToggleField
        checked={saveAsBlob}
        dataSlot="drafting-logo-save-as-blob"
        description="Larger SVG files, but better compatibility when the QR is opened elsewhere."
        id="drafting-save-as-blob"
        label="Save embedded image as blob"
        onCheckedChange={onSaveAsBlobChange}
      />
    </div>
  )
}

export function DraftingEncodingTab({
  errorCorrectionLevel,
  typeNumber,
  onErrorCorrectionLevelChange,
  onTypeNumberChange,
}: {
  errorCorrectionLevel: ErrorCorrectionLevel
  typeNumber: TypeNumber
  onErrorCorrectionLevelChange: (value: ErrorCorrectionLevel) => void
  onTypeNumberChange: (value: TypeNumber) => void
}) {
  return (
    <div data-slot="drafting-encoding-tab" className="min-w-0 space-y-4">
      <DraftingSliderField
        dataSlot="drafting-type-number-slider"
        description="Auto picks the QR version for you. Higher values force denser versions with more modules."
        formatValue={(value) => formatTypeNumberLabel(value)}
        id="drafting-type-number"
        label="Type number"
        max={TYPE_NUMBER_MAX}
        min={TYPE_NUMBER_MIN}
        step={1}
        value={typeNumber}
        onChange={(value) => onTypeNumberChange(value as TypeNumber)}
      />

      <section data-slot="drafting-error-correction-section" className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#111111] dark:text-foreground">
            Error correction
          </h3>
          <p className="text-[0.72rem] leading-5 text-[#00000066] dark:text-muted-foreground">
            Higher recovery makes styled codes more tolerant to logos, crops, and wear.
          </p>
        </div>

        <div
          data-slot="drafting-error-correction-grid"
          role="radiogroup"
          aria-label="Error correction levels"
          className="grid grid-cols-2 gap-3"
        >
          {ERROR_CORRECTION_LEVEL_OPTIONS.map((option) => {
            const isSelected = option.value === errorCorrectionLevel

            return (
              <OptionCard
                darkShadowTone="ink"
                key={option.value}
                checked={isSelected}
                className={cn(
                  "w-full gap-2",
                  "[&_[data-slot=option-card]]:h-full [&_[data-slot=option-card]]:min-h-[112px] [&_[data-slot=option-card]]:w-full",
                  "[&_[data-slot=option-card-motif]]:size-full",
                  "[&_[data-slot=option-card-label]]:sr-only",
                )}
                label={`${option.title} (${option.label})`}
                motifClassName="size-full px-3 py-3"
                name="drafting-error-correction"
                onSelect={() => onErrorCorrectionLevelChange(option.value)}
                value={option.value}
              >
                <span className="flex size-full flex-col items-start justify-between gap-2 text-left">
                  <span
                    className={cn(
                      "text-[1.375rem] font-semibold leading-none tracking-[0.08em]",
                      isSelected
                        ? "text-[#111111] dark:text-foreground"
                        : "text-[#00000073] dark:text-muted-foreground",
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="space-y-1">
                    <span
                      className={cn(
                        "block text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
                        isSelected
                          ? "text-[#111111] dark:text-foreground"
                          : "text-[#0000008A] dark:text-foreground/80",
                      )}
                    >
                      {option.title}
                    </span>
                    <span
                      className={cn(
                        "block text-[0.72rem] leading-5",
                        isSelected
                          ? "text-[#111111] dark:text-foreground"
                          : "text-[#00000066] dark:text-muted-foreground",
                      )}
                    >
                      {option.summary}
                    </span>
                  </span>
                </span>
              </OptionCard>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function buildDraftingSolidGradientItems({
  gradient,
  gradientIdPrefix,
  gradientTitle,
  onGradientChange,
  onModeChange,
  onSolidColorChange,
  solidLabel = "Solid color",
  solidColor,
}: {
  gradient: StudioGradient
  gradientIdPrefix: string
  gradientTitle: string
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DraftingBinaryColorMode) => void
  onSolidColorChange: (value: string) => void
  solidLabel?: string
  solidColor: string
}) {
  return [
    {
      id: "solid" as const,
      title: "Solid",
      content: (
        <div className="min-w-0 px-4 pb-4">
          <EmbeddedColorPickerField
            chrome="minimal"
            label={solidLabel}
            onValueChange={(value) => {
              onModeChange("solid")
              onSolidColorChange(value)
            }}
            pickerChrome="drafting"
            pickerClassName="mx-auto max-w-full"
            size={320}
            value={solidColor}
          />
        </div>
      ),
    },
    {
      id: "gradient" as const,
      title: "Gradient",
      content: (
        <div className="min-w-0 px-4 pb-4">
          <GradientEditor
            gradient={{ ...gradient, enabled: true }}
            hideToggle
            idPrefix={gradientIdPrefix}
            layout="drafting"
            onGradientChange={(value) => {
              onModeChange("gradient")
              onGradientChange(value)
            }}
            title={gradientTitle}
            variant="dot-enhanced"
          />
        </div>
      ),
    },
  ]
}

function buildDraftingBackgroundColorItems({
  gradient,
  gradientIdPrefix,
  gradientTitle,
  includeTransparent,
  onGradientChange,
  onModeChange,
  onSolidColorChange,
  onTransparentSelect,
  solidColor,
}: {
  gradient: StudioGradient
  gradientIdPrefix: string
  gradientTitle: string
  includeTransparent: boolean
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DraftingBackgroundColorMode) => void
  onSolidColorChange: (value: string) => void
  onTransparentSelect?: () => void
  solidColor: string
}) {
  const items: Array<{
    id: DraftingBackgroundColorMode
    title: string
    content: ReactNode
  }> = buildDraftingSolidGradientItems({
    gradient,
    gradientIdPrefix,
    gradientTitle,
    onGradientChange,
    onModeChange,
    onSolidColorChange,
    solidColor,
  })

  if (!includeTransparent) {
    return items
  }

  items.push({
    id: "transparent",
    title: "Transparent",
    content: (
      <div className="min-w-0 px-4 pb-4">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-[8px] border-[#00000017] bg-[#FFFFFFE6] text-[#111111] shadow-[0_0_10px_0_rgba(0,0,0,0.06),0_2px_4px_0_rgba(0,0,0,0.04)] hover:border-[#0000002A] hover:bg-[#FFFFFFF2] dark:border-border dark:bg-card dark:text-foreground dark:shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.28)] dark:hover:border-border/80 dark:hover:bg-muted/50"
          onClick={onTransparentSelect}
        >
          Use transparent background
        </Button>
      </div>
    ),
  })

  return items
}

function buildDraftingAssetSourceItems({
  onModeChange,
  onRemoteUrlChange,
  onUploadError,
  onUploadSuccess,
  remoteUrl,
  remoteUrlAriaLabel,
  remoteUrlPlaceholder,
}: {
  onModeChange: (mode: DraftingAssetSourceMode) => void
  onRemoteUrlChange: (value: string) => void
  onUploadError: (message: string) => void
  onUploadSuccess: (file: File) => void
  remoteUrl: string
  remoteUrlAriaLabel: string
  remoteUrlPlaceholder: string
}) {
  return [
    {
      id: "upload" as const,
      title: "Upload file",
      content: (
        <div className="min-w-0 px-4 pb-4">
          <FileUpload
            acceptedFileTypes={["image/*"]}
            className="mx-0 max-w-full"
            onUploadError={(error) => onUploadError(error.message)}
            onUploadSuccess={(file) => {
              onModeChange("upload")
              onUploadSuccess(file)
            }}
            uploadDelay={0}
          />
        </div>
      ),
    },
    {
      id: "url" as const,
      title: "Remote URL",
      content: (
        <div className="min-w-0 px-4 pb-4">
          <Input
            aria-label={remoteUrlAriaLabel}
            className="h-10 rounded-[8px] border-[#00000017] bg-[#FFFFFFE6] px-3 text-sm text-[#111111] shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.03)] placeholder:text-[#00000052] focus-visible:border-black/35 focus-visible:ring-0 dark:border-border dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground dark:focus-visible:border-ring"
            placeholder={remoteUrlPlaceholder}
            value={remoteUrl}
            onChange={(event) => {
              onModeChange("url")
              onRemoteUrlChange(event.target.value)
            }}
          />
        </div>
      ),
    },
  ]
}

function DraftingColorAccordion<TMode extends string>({
  dataSlot,
  items,
  mode,
  openItemIds,
  onOpenItemIdsChange,
}: {
  dataSlot: string
  items: Array<{
    id: TMode
    title: string
    content: ReactNode
  }>
  mode: TMode
  onOpenItemIdsChange: (itemIds: string[]) => void
  openItemIds: string[]
}) {
  return (
    <div data-slot="drafting-style-color-tab" className="min-w-0 space-y-3">
      <Accordion
        data-slot={dataSlot}
        className="min-w-0 w-full max-w-full"
        type="multiple"
        value={openItemIds}
        onValueChange={onOpenItemIdsChange}
      >
        {items.map((item) => {
          const isSelected = item.id === mode

          return (
            <AccordionItem
              key={item.id}
              data-item-id={item.id}
              data-selected={isSelected ? "true" : "false"}
              value={item.id}
              className={cn(
                "mb-3 min-w-0 w-full overflow-hidden rounded-[8px] border last:mb-0 last:border-b",
                "border-[#00000017] bg-[#FFFFFFCC] shadow-[0_0_10px_0_rgba(0,0,0,0.06),0_2px_4px_0_rgba(0,0,0,0.04)] transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out dark:border-border dark:bg-card/80 dark:shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.28)]",
                "hover:-translate-y-px hover:border-[#0000002A] hover:bg-[#FFFFFFF2] hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.08),0_4px_10px_0_rgba(0,0,0,0.05)] dark:hover:border-border/80 dark:hover:bg-card dark:hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.06),0_4px_10px_0_rgba(0,0,0,0.34)]",
                "active:translate-y-0 active:border-[#00000034] active:shadow-[0_0_8px_0_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.08)] dark:active:border-border dark:active:shadow-[0_0_8px_0_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.34)]",
                "data-[state=open]:bg-[#FFFFFFF2] dark:data-[state=open]:bg-card",
                isSelected &&
                  "bg-[#FFFFFF] shadow-[0_0_22px_2px_rgba(0,0,0,0.14),0_5px_10px_1px_rgba(0,0,0,0.08)] dark:bg-accent/70 dark:shadow-[0_0_22px_2px_rgba(0,0,0,0.08),0_5px_10px_1px_rgba(0,0,0,0.34)]",
              )}
            >
              <AccordionTrigger
                data-item-id={item.id}
                data-slot="drafting-color-trigger"
                className={cn(
                  "px-4 py-3 no-underline hover:no-underline focus-visible:ring-0",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-black/55 dark:focus-visible:outline-ring",
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "text-[0.72rem] font-medium tracking-[0.12em] uppercase text-[#00000073] transition-colors dark:text-muted-foreground",
                      isSelected && "font-semibold text-[#111111] dark:text-foreground",
                    )}
                  >
                    {item.title}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent
                data-slot="drafting-color-content"
                className="min-w-0 pb-0"
              >
                {item.content}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

function DraftingSliderField({
  dataSlot,
  description,
  formatValue,
  id,
  label,
  max,
  min,
  onChange,
  showSteps = false,
  step,
  value,
}: {
  dataSlot: string
  description?: string
  formatValue: (value: number) => string
  id: string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  showSteps?: boolean
  step: number
  value: number
}) {
  return (
    <div
      data-slot={`${dataSlot}-field`}
      className={cn(
        "min-w-0 rounded-[8px] border border-[#00000017] bg-[#FFFFFFCC] px-4 py-3 dark:border-border dark:bg-card/80",
        "shadow-[0_0_10px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.03)] dark:shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.28)]",
        "transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
        "hover:-translate-y-px hover:border-[#00000026] hover:bg-[#FFFFFFF2] hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.07),0_4px_10px_0_rgba(0,0,0,0.04)] dark:hover:border-border/80 dark:hover:bg-card dark:hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.06),0_4px_10px_0_rgba(0,0,0,0.34)]",
        "active:translate-y-0 active:border-[#00000030] active:shadow-[0_0_8px_0_rgba(0,0,0,0.07),0_1px_3px_0_rgba(0,0,0,0.06)] dark:active:border-border dark:active:shadow-[0_0_8px_0_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.34)]",
        "focus-within:border-[#11111166] focus-within:bg-white focus-within:shadow-[0_0_18px_1px_rgba(0,0,0,0.09),0_4px_10px_0_rgba(0,0,0,0.05)] dark:focus-within:border-ring dark:focus-within:bg-card dark:focus-within:shadow-[0_0_18px_1px_rgba(0,0,0,0.07),0_4px_10px_0_rgba(0,0,0,0.34)]",
      )}
    >
      <UnlumenSlider
        className="w-full"
        data-slot={dataSlot}
        formatValue={formatValue}
        id={id}
        label={label}
        max={max}
        min={min}
        showSteps={showSteps}
        showValue
        step={step}
        thumbDataSlot={`${dataSlot}-thumb`}
        trackClassName="bg-black/[0.08] dark:bg-muted"
        trackDataSlot={`${dataSlot}-track`}
        value={value}
        onChange={(nextValue) => onChange(Array.isArray(nextValue) ? nextValue[0] ?? value : nextValue)}
      />
      {description ? (
        <p className="mt-2 text-[0.72rem] leading-5 text-[#00000066] dark:text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

function DraftingToggleField({
  checked,
  dataSlot,
  description,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean
  dataSlot: string
  description: string
  id: string
  label: string
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <label
      data-slot={dataSlot}
      htmlFor={id}
      className={cn(
        "flex min-w-0 cursor-pointer items-start justify-between gap-4 rounded-[8px] border px-4 py-3",
        "border-[#00000017] bg-[#FFFFFFCC] shadow-[0_0_10px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.03)] dark:border-border dark:bg-card/80 dark:shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.28)]",
        "transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
        "hover:-translate-y-px hover:border-[#00000026] hover:bg-[#FFFFFFF2] hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.07),0_4px_10px_0_rgba(0,0,0,0.04)] dark:hover:border-border/80 dark:hover:bg-card dark:hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.06),0_4px_10px_0_rgba(0,0,0,0.34)]",
        "active:translate-y-0 active:border-[#00000030] active:shadow-[0_0_8px_0_rgba(0,0,0,0.07),0_1px_3px_0_rgba(0,0,0,0.06)] dark:active:border-border dark:active:shadow-[0_0_8px_0_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.34)]",
        "focus-within:border-[#11111166] focus-within:bg-white focus-within:shadow-[0_0_18px_1px_rgba(0,0,0,0.09),0_4px_10px_0_rgba(0,0,0,0.05)] dark:focus-within:border-ring dark:focus-within:bg-card dark:focus-within:shadow-[0_0_18px_1px_rgba(0,0,0,0.07),0_4px_10px_0_rgba(0,0,0,0.34)]",
        checked && "border-[#11111133] bg-white dark:border-ring/60 dark:bg-accent/70",
      )}
    >
      <span className="min-w-0 space-y-1">
        <span className="block text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[#111111] dark:text-foreground">
          {label}
        </span>
        <span className="block text-[0.72rem] leading-5 text-[#00000066] dark:text-muted-foreground">{description}</span>
      </span>
      <Switch
        checked={checked}
        className={cn(
          "mt-0.5 h-[20px] w-[36px] shrink-0 border border-[#00000014] bg-black/[0.10] dark:border-border dark:bg-muted",
          "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] transition-[background-color,border-color,box-shadow] duration-150",
          "hover:border-[#00000024] hover:bg-black/[0.14] dark:hover:border-border/80 dark:hover:bg-muted/80",
          "data-[state=checked]:border-[#111111] data-[state=checked]:bg-[#111111] dark:data-[state=checked]:border-foreground dark:data-[state=checked]:bg-foreground",
          "focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-0 dark:focus-visible:ring-ring/50",
        )}
        data-slot={`${dataSlot}-switch`}
        id={id}
        onCheckedChange={onCheckedChange}
      />
    </label>
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
            darkShadowTone="ink"
            key={option.value}
            checked={option.value === value}
            label={option.label}
            name={name}
            onSelect={() => onValueChange(option.value)}
            value={option.value}
          >
            <span className="flex items-center justify-center [&_svg]:size-[6.5rem]">
              <StylePreview previewKind={previewKind} value={option.value} />
            </span>
          </OptionCard>
        ))}
      </div>
    </div>
  )
}
