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
  STATIC_QR_CONTENT_META,
  type StaticQrContentValue,
  type StaticQrContentValues,
  type StaticQrValidationResult,
} from "@/components/qr/qr-static-content"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { OptionCard } from "@/components/ui/option-card"
import {
  QR_CATEGORIES,
  QR_INPUT_OPTIONS,
  type QrInputType,
} from "@/components/ui/qr-input-config"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { QR_SIZE_MAX, QR_SIZE_MIN } from "@/components/qr/qr-studio-state"
import { CheckIcon, ChevronDown } from "lucide-react"

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
  contentType,
  contentValues,
  encodedValue,
  onContentTypeChange,
  onContentValueChange,
  validation,
}: {
  contentType: QrInputType
  contentValues: StaticQrContentValues
  encodedValue: string
  onContentTypeChange: (value: QrInputType) => void
  onContentValueChange: (field: string, value: StaticQrContentValue) => void
  validation: StaticQrValidationResult
}) {
  const meta = STATIC_QR_CONTENT_META[contentType]

  return (
    <div data-slot="drafting-content-tab" className="min-w-0 space-y-4">
      <div
        data-slot="drafting-content-type-selector"
        className="grid min-w-0 grid-cols-3 gap-2"
      >
        {QR_CATEGORIES.map((category) => (
          <DraftingContentTypeDropdown
            key={category.key}
            activeContentType={contentType}
            category={category}
            onContentTypeChange={onContentTypeChange}
          />
        ))}
      </div>

      <section
        data-slot="drafting-content-fields"
        className={cn(
          "min-w-0 rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-4 py-3",
          "shadow-[var(--drafting-shadow-rest)]",
          "transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
          "focus-within:border-[var(--drafting-line-strong)] focus-within:bg-[var(--drafting-panel-bg-active)]",
        )}
      >
        <div className="min-w-0">
          <h3 className="drafting-type-control-label font-semibold text-[var(--drafting-ink)]">
            {meta.title}
          </h3>
          <p className="drafting-type-caption mt-1 text-[var(--drafting-ink-muted)]">
            {meta.description}
          </p>
        </div>

        <div className="mt-4 min-w-0 space-y-3">
          <DraftingStaticQrFields
            contentType={contentType}
            contentValues={contentValues}
            onContentValueChange={onContentValueChange}
            validation={validation}
          />
        </div>
      </section>

      <details
        data-slot="drafting-content-encoded-preview"
        className="min-w-0 rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-4 py-3 text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)]"
      >
        <summary className="drafting-type-control-label cursor-pointer font-semibold">
          Encoded value
        </summary>
        <pre className="drafting-type-caption mt-3 max-h-44 min-w-0 overflow-auto whitespace-pre-wrap break-words rounded-[4px] bg-[var(--drafting-panel-bg-hover)] p-3 text-[var(--drafting-ink-muted)]">
          {encodedValue}
        </pre>
      </details>

    </div>
  )
}

function DraftingContentTypeDropdown({
  activeContentType,
  category,
  onContentTypeChange,
}: {
  activeContentType: QrInputType
  category: (typeof QR_CATEGORIES)[number]
  onContentTypeChange: (value: QrInputType) => void
}) {
  const isSelectedCategory = category.items.some((item) => item.value === activeContentType)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Open ${category.label} content types`}
          data-drafting-dropdown-trigger="true"
          type="button"
          className={cn(
            "group flex h-10 w-full min-w-0 cursor-default select-none items-center justify-between gap-2 rounded-[6px] border px-3 py-0 text-left outline-none",
            "border-[var(--drafting-dropdown-border)] bg-[var(--drafting-dropdown-trigger-surface)] text-[var(--drafting-dropdown-text)] shadow-[var(--drafting-dropdown-trigger-shadow-rest)]",
            "transition-[border-color,box-shadow,transform,background-color,color] duration-150 ease-out",
            "hover:-translate-y-px hover:bg-[var(--drafting-dropdown-trigger-surface-hover)] hover:shadow-[var(--drafting-dropdown-trigger-shadow-hover)]",
            "active:translate-y-0 active:bg-[var(--drafting-dropdown-trigger-surface-pressed)] active:shadow-[var(--drafting-dropdown-trigger-shadow-pressed)]",
            "focus-visible:border-2 focus-visible:border-[var(--drafting-dropdown-border-focus)] focus-visible:ring-0",
            "data-[state=open]:border-[var(--drafting-dropdown-border-focus)] data-[state=open]:bg-[var(--drafting-dropdown-trigger-surface-open)] data-[state=open]:shadow-[var(--drafting-dropdown-trigger-shadow-hover)]",
            isSelectedCategory && "font-semibold",
          )}
        >
          <span className="drafting-type-caption min-w-0 truncate font-medium">
            {category.label}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-[var(--drafting-dropdown-text-muted)] transition-transform duration-150 ease-out group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        data-drafting-dropdown-content="true"
        className="w-[280px] max-w-[calc(100vw-2rem)] rounded-[8px] border border-[var(--drafting-dropdown-border)] bg-[var(--drafting-dropdown-menu-surface-open)] p-2 text-[var(--drafting-dropdown-text)] shadow-[var(--drafting-dropdown-menu-shadow-open)] ring-0"
      >
        <DropdownMenuGroup className="grid gap-1">
          {category.items.map((item) => {
            const ItemIcon = item.icon
            const isSelected = activeContentType === item.value

            return (
              <DropdownMenuItem
                key={item.value}
                data-content-type={item.value}
                onSelect={() => onContentTypeChange(item.value)}
                className={cn(
                  "h-9 min-h-9 gap-2 rounded-[4px] border border-transparent bg-transparent px-2.5 py-0 text-[12px] font-medium text-[var(--drafting-dropdown-text)]",
                  "focus:bg-[var(--drafting-dropdown-trigger-surface-hover)] focus:text-[var(--drafting-dropdown-text)] focus:**:text-[var(--drafting-dropdown-text)]",
                  isSelected &&
                    "bg-[var(--drafting-dropdown-selected-fill)] font-semibold text-[var(--drafting-dropdown-text)] focus:bg-[var(--drafting-dropdown-selected-fill)] focus:text-[var(--drafting-dropdown-text)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-3.5 shrink-0 items-center justify-center"
                >
                  <CheckIcon
                    className={cn(
                      "size-3.5 text-[var(--drafting-dropdown-text)] transition-opacity duration-100",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                </span>
                <ItemIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-[var(--drafting-dropdown-text)]"
                />
                <span className="drafting-type-caption min-w-0 truncate font-medium">
                  {item.label}
                </span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DraftingStaticQrFields({
  contentType,
  contentValues,
  onContentValueChange,
  validation,
}: {
  contentType: QrInputType
  contentValues: StaticQrContentValues
  onContentValueChange: (field: string, value: StaticQrContentValue) => void
  validation: StaticQrValidationResult
}) {
  if (contentType === "auto") {
    return (
      <DraftingContentTextarea
        ariaLabel="Auto content"
        field="text"
        label="Text, URL, or QR payload"
        placeholder="https://example.com/invite"
        value={stringContentValue(contentValues.text)}
        onChange={onContentValueChange}
      />
    )
  }

  if (contentType === "text") {
    return (
      <DraftingContentTextarea
        ariaLabel="Text content"
        field="text"
        label="Text"
        placeholder="Plain text to encode"
        value={stringContentValue(contentValues.text)}
        onChange={onContentValueChange}
      />
    )
  }

  if (isUrlContentType(contentType)) {
    return (
      <DraftingContentInput
        ariaLabel={`${QR_INPUT_OPTIONS[contentType].label} URL`}
        error={validation.fieldErrors.url}
        field="url"
        label="URL"
        placeholder="https://example.com"
        value={stringContentValue(contentValues.url)}
        onChange={onContentValueChange}
      />
    )
  }

  if (contentType === "phone") {
    return (
      <DraftingContentInput
        ariaLabel="Phone number"
        error={validation.fieldErrors.phone}
        field="phone"
        label="Phone number"
        placeholder="+1 555 010 2000"
        value={stringContentValue(contentValues.phone)}
        onChange={onContentValueChange}
      />
    )
  }

  if (contentType === "email") {
    return (
      <>
        <DraftingContentInput
          ariaLabel="Email address"
          error={validation.fieldErrors.email}
          field="email"
          label="Email address"
          placeholder="hello@example.com"
          value={stringContentValue(contentValues.email)}
          onChange={onContentValueChange}
        />
        <DraftingContentInput
          ariaLabel="Email subject"
          field="subject"
          label="Subject"
          placeholder="Launch"
          value={stringContentValue(contentValues.subject)}
          onChange={onContentValueChange}
        />
        <DraftingContentTextarea
          ariaLabel="Email body"
          field="body"
          label="Body"
          placeholder="Message body"
          value={stringContentValue(contentValues.body)}
          onChange={onContentValueChange}
        />
      </>
    )
  }

  if (contentType === "sms") {
    return (
      <>
        <DraftingContentInput
          ariaLabel="SMS phone number"
          error={validation.fieldErrors.phone}
          field="phone"
          label="Phone number"
          placeholder="+1 555 010 2000"
          value={stringContentValue(contentValues.phone)}
          onChange={onContentValueChange}
        />
        <DraftingContentTextarea
          ariaLabel="SMS message"
          field="message"
          label="Message"
          placeholder="Message text"
          value={stringContentValue(contentValues.message)}
          onChange={onContentValueChange}
        />
      </>
    )
  }

  if (contentType === "wifi") {
    return (
      <>
        <DraftingContentInput
          ariaLabel="Network name"
          error={validation.fieldErrors.ssid}
          field="ssid"
          label="Network name"
          placeholder="Cafe Guest"
          value={stringContentValue(contentValues.ssid)}
          onChange={onContentValueChange}
        />
        <div className="grid min-w-0 grid-cols-3 gap-2">
          {["WPA", "WEP", "nopass"].map((security) => (
            <label
              key={security}
              className={cn(
                "flex min-h-9 cursor-pointer items-center justify-center rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-2 text-center",
                "drafting-type-caption font-semibold text-[var(--drafting-ink-muted)]",
                stringContentValue(contentValues.security) === security &&
                  "border-[var(--drafting-ink)] bg-[var(--drafting-ink)] text-[var(--drafting-surface-bg)]",
              )}
            >
              <input
                aria-label={`Wi-Fi security ${security}`}
                checked={stringContentValue(contentValues.security) === security}
                className="sr-only"
                name="drafting-wifi-security"
                type="radio"
                onChange={() => onContentValueChange("security", security)}
              />
              {security === "nopass" ? "None" : security}
            </label>
          ))}
        </div>
        <DraftingContentInput
          ariaLabel="Wi-Fi password"
          field="password"
          label="Password"
          placeholder="Network password"
          value={stringContentValue(contentValues.password)}
          onChange={onContentValueChange}
        />
        <label className="flex min-w-0 items-center justify-between gap-3 rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-3 py-2">
          <span className="drafting-type-control-label font-semibold text-[var(--drafting-ink)]">
            Hidden network
          </span>
          <input
            aria-label="Hidden network"
            checked={Boolean(contentValues.hidden)}
            className="size-4 accent-[var(--drafting-ink)]"
            type="checkbox"
            onChange={(event) => onContentValueChange("hidden", event.currentTarget.checked)}
          />
        </label>
      </>
    )
  }

  if (contentType === "vcard") {
    return (
      <>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <DraftingContentInput
            ariaLabel="First name"
            error={validation.fieldErrors.firstName}
            field="firstName"
            label="First name"
            placeholder="Jay"
            value={stringContentValue(contentValues.firstName)}
            onChange={onContentValueChange}
          />
          <DraftingContentInput
            ariaLabel="Last name"
            field="lastName"
            label="Last name"
            placeholder="Shah"
            value={stringContentValue(contentValues.lastName)}
            onChange={onContentValueChange}
          />
        </div>
        <DraftingContentInput
          ariaLabel="Contact phone number"
          field="phone"
          label="Phone"
          placeholder="+91 98765 43210"
          value={stringContentValue(contentValues.phone)}
          onChange={onContentValueChange}
        />
        <DraftingContentInput
          ariaLabel="Contact email"
          field="email"
          label="Email"
          placeholder="jay@example.com"
          value={stringContentValue(contentValues.email)}
          onChange={onContentValueChange}
        />
        <DraftingContentInput
          ariaLabel="Company"
          field="company"
          label="Company"
          placeholder="New QR"
          value={stringContentValue(contentValues.company)}
          onChange={onContentValueChange}
        />
        <DraftingContentInput
          ariaLabel="Contact website"
          field="url"
          label="Website"
          placeholder="https://example.com"
          value={stringContentValue(contentValues.url)}
          onChange={onContentValueChange}
        />
      </>
    )
  }

  if (contentType === "whatsapp" || contentType === "whatsapp-chat") {
    return (
      <>
        <DraftingContentInput
          ariaLabel="WhatsApp phone number"
          error={validation.fieldErrors.phone}
          field="phone"
          label="Phone number"
          placeholder="+91 98765 43210"
          value={stringContentValue(contentValues.phone)}
          onChange={onContentValueChange}
        />
        <DraftingContentTextarea
          ariaLabel="WhatsApp message"
          field="message"
          label="Message"
          placeholder="I would like to book"
          value={stringContentValue(contentValues.message)}
          onChange={onContentValueChange}
        />
      </>
    )
  }

  if (isUsernameContentType(contentType)) {
    return (
      <DraftingContentInput
        ariaLabel={`${QR_INPUT_OPTIONS[contentType].label} username`}
        error={validation.fieldErrors.username}
        field="username"
        label="Username"
        placeholder="@newqr"
        value={stringContentValue(contentValues.username)}
        onChange={onContentValueChange}
      />
    )
  }

  if (contentType === "map-location") {
    return (
      <>
        <DraftingContentInput
          ariaLabel="Place search"
          error={validation.fieldErrors.query}
          field="query"
          label="Place or label"
          placeholder="Mumbai"
          value={stringContentValue(contentValues.query)}
          onChange={onContentValueChange}
        />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <DraftingContentInput
            ariaLabel="Latitude"
            error={validation.fieldErrors.latitude}
            field="latitude"
            label="Latitude"
            placeholder="19.0760"
            value={stringContentValue(contentValues.latitude)}
            onChange={onContentValueChange}
          />
          <DraftingContentInput
            ariaLabel="Longitude"
            error={validation.fieldErrors.longitude}
            field="longitude"
            label="Longitude"
            placeholder="72.8777"
            value={stringContentValue(contentValues.longitude)}
            onChange={onContentValueChange}
          />
        </div>
      </>
    )
  }

  if (contentType === "event") {
    const eventMode = stringContentValue(contentValues.eventMode) || "url"

    return (
      <>
        <div className="grid min-w-0 grid-cols-2 gap-2">
          {[
            ["url", "Event URL"],
            ["calendar", "Calendar"],
          ].map(([value, label]) => (
            <label
              key={value}
              className={cn(
                "flex min-h-9 cursor-pointer items-center justify-center rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-2 text-center",
                "drafting-type-caption font-semibold text-[var(--drafting-ink-muted)]",
                eventMode === value &&
                  "border-[var(--drafting-ink)] bg-[var(--drafting-ink)] text-[var(--drafting-surface-bg)]",
              )}
            >
              <input
                aria-label={`Use ${label}`}
                checked={eventMode === value}
                className="sr-only"
                name="drafting-event-mode"
                type="radio"
                onChange={() => onContentValueChange("eventMode", value)}
              />
              {label}
            </label>
          ))}
        </div>
        {eventMode === "calendar" ? (
          <>
            <DraftingContentInput
              ariaLabel="Event title"
              error={validation.fieldErrors.title}
              field="title"
              label="Title"
              placeholder="Launch Briefing"
              value={stringContentValue(contentValues.title)}
              onChange={onContentValueChange}
            />
            <DraftingContentInput
              ariaLabel="Event start"
              error={validation.fieldErrors.start}
              field="start"
              label="Start"
              placeholder="2026-06-01T09:00"
              value={stringContentValue(contentValues.start)}
              onChange={onContentValueChange}
            />
            <DraftingContentInput
              ariaLabel="Event end"
              field="end"
              label="End"
              placeholder="2026-06-01T10:30"
              value={stringContentValue(contentValues.end)}
              onChange={onContentValueChange}
            />
            <DraftingContentInput
              ariaLabel="Event location"
              field="location"
              label="Location"
              placeholder="Studio 2"
              value={stringContentValue(contentValues.location)}
              onChange={onContentValueChange}
            />
          </>
        ) : (
          <DraftingContentInput
            ariaLabel="Event URL"
            error={validation.fieldErrors.url}
            field="url"
            label="URL"
            placeholder="https://example.com/rsvp"
            value={stringContentValue(contentValues.url)}
            onChange={onContentValueChange}
          />
        )}
      </>
    )
  }

  if (contentType === "coupon") {
    return (
      <>
        <DraftingContentInput
          ariaLabel="Coupon code"
          error={validation.fieldErrors.code}
          field="code"
          label="Code"
          placeholder="SAVE20"
          value={stringContentValue(contentValues.code)}
          onChange={onContentValueChange}
        />
        <DraftingContentTextarea
          ariaLabel="Coupon description"
          field="description"
          label="Description"
          placeholder="20% off"
          value={stringContentValue(contentValues.description)}
          onChange={onContentValueChange}
        />
        <DraftingContentInput
          ariaLabel="Coupon URL"
          field="url"
          label="URL"
          placeholder="https://example.com/save"
          value={stringContentValue(contentValues.url)}
          onChange={onContentValueChange}
        />
      </>
    )
  }

  return null
}

function DraftingContentInput({
  ariaLabel,
  error,
  field,
  label,
  onChange,
  placeholder,
  value,
}: {
  ariaLabel: string
  error?: string
  field: string
  label: string
  onChange: (field: string, value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="block min-w-0">
      <span className="drafting-type-control-label font-semibold text-[var(--drafting-ink)]">
        {label}
      </span>
      <Input
        aria-invalid={error ? true : undefined}
        aria-label={ariaLabel}
        className="drafting-type-input mt-2 min-w-0 border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] text-[var(--drafting-ink)] shadow-none placeholder:text-[var(--drafting-ink-subtle)] focus-visible:ring-0"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(field, event.currentTarget.value)}
      />
      {error ? (
        <span className="drafting-type-caption mt-1 block text-[var(--destructive)]">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function DraftingContentTextarea({
  ariaLabel,
  error,
  field,
  label,
  onChange,
  placeholder,
  value,
}: {
  ariaLabel: string
  error?: string
  field: string
  label: string
  onChange: (field: string, value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="block min-w-0">
      <span className="drafting-type-control-label font-semibold text-[var(--drafting-ink)]">
        {label}
      </span>
      <Textarea
        aria-invalid={error ? true : undefined}
        aria-label={ariaLabel}
        className="drafting-type-input mt-2 min-h-24 min-w-0 max-w-full resize-none overflow-x-hidden border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-3.5 py-3 text-[var(--drafting-ink)] shadow-none placeholder:text-[var(--drafting-ink-subtle)] [overflow-wrap:anywhere] focus-visible:ring-0"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(field, event.currentTarget.value)}
      />
      {error ? (
        <span className="drafting-type-caption mt-1 block text-[var(--destructive)]">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function isUrlContentType(type: QrInputType) {
  return [
    "link",
    "website",
    "facebook",
    "youtube",
    "linkedin",
    "discord",
    "google-review",
    "booking-link",
    "payment-link",
    "menu",
    "app-download",
    "pdf",
    "image",
    "video",
    "document",
    "form",
  ].includes(type)
}

function isUsernameContentType(type: QrInputType) {
  return [
    "instagram",
    "x",
    "tiktok",
    "telegram",
    "snapchat",
    "threads",
    "pinterest",
    "telegram-username",
  ].includes(type)
}

function stringContentValue(value: StaticQrContentValue | undefined) {
  return typeof value === "string" ? value : ""
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
                  className="size-7 shrink-0 rounded-full border border-black/10 shadow-[var(--drafting-shadow-rest)]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-[8px] border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)] hover:border-[var(--drafting-line-hover)] hover:bg-[var(--drafting-panel-bg-hover)]"
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
            className="pointer-events-none absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-[var(--drafting-ink-subtle)]"
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
            className="drafting-type-input h-10 border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] pl-9 pr-3 text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)] placeholder:text-[var(--drafting-ink-subtle)] focus-visible:border-[var(--drafting-line-strong)] focus-visible:ring-0"
            placeholder="Search icons"
            value={brandIconQuery}
            onChange={(event) => onBrandIconQueryChange(event.target.value)}
          />
        </div>

        <div
          className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3"
          data-slot="drafting-brand-icon-category-picker"
          role="radiogroup"
        >
          {DRAFTING_BRAND_ICON_CATEGORY_OPTIONS.map((option) => {
            const isSelected = option.value === selectedCategory

            return (
              <OptionCard
                appearance="drafting"
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
                    "drafting-type-meta flex size-full items-center justify-center font-medium",
                    isSelected
                      ? "text-[var(--drafting-ink)]"
                      : "text-[var(--drafting-ink-muted)]",
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
          className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(56px,1fr))] justify-items-center gap-x-2 gap-y-4"
        >
          {brandIcons.map((brandIcon) => {
            const Icon = brandIcon.icon
            const isSelected = brandIcon.id === selectedBrandIconId

            return (
              <OptionCard
                appearance="drafting"
                darkShadowTone="ink"
                key={brandIcon.id}
                checked={isSelected}
                className={cn(
                  "w-[56px]",
                  "[&_[data-slot=option-card]]:h-[56px] [&_[data-slot=option-card]]:w-[56px]",
                  "[&_[data-slot=option-card-motif]]:text-[var(--drafting-ink)]",
                )}
                label={brandIcon.label}
                labelClassName="drafting-type-caption min-h-[1.2rem]"
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
                  <span className="text-[var(--drafting-ink)]">
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
          <h3 className="drafting-type-section-title font-semibold text-[var(--drafting-ink)]">
            Error correction
          </h3>
          <p className="drafting-type-body text-[var(--drafting-ink-muted)]">
            Higher recovery makes styled codes more tolerant to logos, crops, and wear.
          </p>
        </div>

        <div
          data-slot="drafting-error-correction-grid"
          role="radiogroup"
          aria-label="Error correction levels"
          className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {ERROR_CORRECTION_LEVEL_OPTIONS.map((option) => {
            const isSelected = option.value === errorCorrectionLevel

            return (
              <OptionCard
                appearance="drafting"
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
                      "drafting-type-display-data font-semibold",
                      isSelected
                        ? "text-[var(--drafting-ink)]"
                        : "text-[var(--drafting-ink-muted)]",
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="space-y-1">
                    <span
                      className={cn(
                        "drafting-type-meta block font-semibold",
                        isSelected
                          ? "text-[var(--drafting-ink)]"
                          : "text-[var(--drafting-ink-strong-muted)]",
                      )}
                    >
                      {option.title}
                    </span>
                    <span
                      className={cn(
                        "drafting-type-body block",
                        isSelected
                          ? "text-[var(--drafting-ink)]"
                          : "text-[var(--drafting-ink-muted)]",
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
          className="w-full rounded-[8px] border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)] hover:border-[var(--drafting-line-hover)] hover:bg-[var(--drafting-panel-bg-hover)]"
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
            className="drafting-type-input h-10 rounded-[8px] border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-3 text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)] placeholder:text-[var(--drafting-ink-subtle)] focus-visible:border-[var(--drafting-line-strong)] focus-visible:ring-0"
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
                "mb-3 min-w-0 w-full overflow-hidden rounded-[8px] last:mb-0 last:border-b",
                "bg-[var(--drafting-panel-bg)] shadow-[var(--drafting-shadow-rest)] transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
                "hover:-translate-y-px hover:bg-[var(--drafting-panel-bg-hover)] hover:shadow-[var(--drafting-shadow-hover)]",
                "active:translate-y-0 active:bg-[var(--drafting-panel-bg-active)] active:shadow-[var(--drafting-shadow-active)]",
                "data-[state=open]:bg-[var(--drafting-panel-bg-hover)]",
                isSelected
                  ? "border-2 border-dashed border-[var(--drafting-line-strong)] hover:border-[var(--drafting-line-strong)] active:border-[var(--drafting-line-strong)] last:border-b-2 bg-[var(--drafting-panel-bg-active)]"
                  : "border border-dashed border-[var(--drafting-line)] hover:border-[var(--drafting-line-hover)] active:border-[var(--drafting-line-hover)]",
              )}
            >
              <AccordionTrigger
                data-item-id={item.id}
                data-slot="drafting-color-trigger"
                className={cn(
                  "px-4 py-3 no-underline hover:no-underline focus-visible:ring-0",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--drafting-line-strong)]",
                  "text-[var(--drafting-ink-muted)] hover:text-[var(--drafting-ink-strong-muted)] data-[state=open]:text-[var(--drafting-ink)]",
                  "[&_[data-slot=accordion-chevron]]:text-[var(--drafting-ink-muted)] hover:[&_[data-slot=accordion-chevron]]:text-[var(--drafting-ink-strong-muted)] data-[state=open]:[&_[data-slot=accordion-chevron]]:text-[var(--drafting-ink)]",
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "drafting-type-control-label font-medium text-[var(--drafting-ink-muted)] transition-colors",
                      isSelected && "font-semibold text-[var(--drafting-ink)]",
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
        "min-w-0 rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-4 py-3",
        "shadow-[var(--drafting-shadow-rest)]",
        "transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
        "hover:-translate-y-px hover:border-[var(--drafting-line-hover)] hover:bg-[var(--drafting-panel-bg-hover)] hover:shadow-[var(--drafting-shadow-hover)]",
        "active:translate-y-0 active:border-[var(--drafting-line-hover)] active:shadow-[var(--drafting-shadow-active)]",
        "focus-within:border-[var(--drafting-line-strong)] focus-within:bg-[var(--drafting-panel-bg-active)] focus-within:shadow-[var(--drafting-shadow-rest)]",
      )}
    >
      <UnlumenSlider
        appearance="drafting"
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
        trackClassName="bg-[var(--drafting-control-bg)]"
        trackDataSlot={`${dataSlot}-track`}
        value={value}
        onChange={(nextValue) => onChange(Array.isArray(nextValue) ? nextValue[0] ?? value : nextValue)}
      />
      {description ? (
        <p className="drafting-type-body mt-2 text-[var(--drafting-ink-muted)]">{description}</p>
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
        "border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] shadow-[var(--drafting-shadow-rest)]",
        "transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
        "hover:-translate-y-px hover:border-[var(--drafting-line-hover)] hover:bg-[var(--drafting-panel-bg-hover)] hover:shadow-[var(--drafting-shadow-hover)]",
        "active:translate-y-0 active:border-[var(--drafting-line-hover)] active:shadow-[var(--drafting-shadow-active)]",
        "focus-within:border-[var(--drafting-line-strong)] focus-within:bg-[var(--drafting-panel-bg-active)] focus-within:shadow-[var(--drafting-shadow-rest)]",
        checked && "border-[var(--drafting-line-strong)] bg-[var(--drafting-panel-bg-active)]",
      )}
    >
      <span className="min-w-0 space-y-1">
        <span className="drafting-type-control-label block font-semibold text-[var(--drafting-ink)]">
          {label}
        </span>
        <span className="drafting-type-body block text-[var(--drafting-ink-muted)]">{description}</span>
      </span>
      <Switch
        checked={checked}
        className={cn(
          "mt-0.5 h-[20px] w-[36px] shrink-0 border border-[var(--drafting-line)] bg-[var(--drafting-control-bg)]",
          "shadow-[var(--drafting-shadow-rest)] transition-[background-color,border-color,box-shadow] duration-150",
          "hover:border-[var(--drafting-line-hover)] hover:bg-[var(--drafting-control-bg-hover)]",
          "data-[state=checked]:border-[var(--drafting-ink)] data-[state=checked]:bg-[var(--drafting-ink)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--drafting-line-hover)] focus-visible:ring-offset-0",
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
    <div className="min-w-0 space-y-4" data-slot="drafting-style-tab">
      <div
        aria-label={ariaLabel}
        className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(108px,1fr))] justify-items-center gap-x-3 gap-y-5"
        data-slot={dataSlot}
        role="radiogroup"
      >
        {options.map((option) => (
          <OptionCard
            appearance="drafting"
            darkShadowTone="ink"
            key={option.value}
            checked={option.value === value}
            labelClassName="drafting-type-option-label"
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
