"use client"

import { useState } from "react"
import { RadiusIcon, StraightEdgeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { XIcon } from "lucide-react"

import FileUpload from "@/components/kokonutui/file-upload"
import { DotsPaletteCard } from "@/components/qr/dots-palette-card"
import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs"
import { MotionAccordion } from "@/components/unlumen-ui/motion-accordion"
import { Button } from "@/components/ui/button"
import { OptionCard } from "@/components/ui/option-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import ColorPicker from "@/components/ui/color-picker"
import { Input } from "@/components/ui/input"
import { KnobSlider } from "@/components/ui/knob-slider"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { buildAdaptiveTrackGradient } from "@/components/ui/adaptive-slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Slider as UnlumenSlider } from "@/components/unlumen-ui/slider"
import { cn } from "@/lib/utils"
import type {
  CornerDotType,
  CornerSquareType,
  DrawType,
  GradientType,
  Mode,
  TypeNumber,
} from "qr-code-styling"

import { getActiveCustomDotShape } from "@/components/qr/custom-dot-shapes"
import {
  type BrandIconCategory,
  filterBrandIcons,
  findBrandIconById,
  getBrandIconById,
  POPULAR_BRAND_ICON_IDS,
  type BrandIconEntry,
} from "@/components/qr/brand-icon-catalog"
import {
  degreesToRadians,
  normalizeGradientOffsetRange,
  radiansToDegrees,
} from "@/components/qr/qr-gradient-controls"
import type { QrEditorSectionId } from "@/components/qr/qr-sections"
import {
  CORNER_DOT_STYLE_OPTIONS,
  CORNER_SQUARE_STYLE_OPTIONS,
  DOT_STYLE_OPTIONS,
} from "@/components/qr/qr-style-options"
import {
  ERROR_CORRECTION_LEVEL_OPTIONS,
  TYPE_NUMBERS,
} from "@/components/qr/qr-encoding-options"
import {
  StylePreview,
  type StylePreviewKind,
} from "@/components/qr/qr-style-preview-renderer"
import type {
  AssetSourceMode,
  DotsColorMode,
  QrStudioState,
  StudioDotType,
  StudioGradient,
} from "@/components/qr/qr-studio-state"
import {
  createBrandIconDataUrl,
  createBrandIconGradientDataUrl,
  DEFAULT_BRAND_ICON_COLOR,
} from "@/components/qr/brand-icon-svg"
import {
  hasBackgroundImage,
  QR_SIZE_MAX,
  QR_SIZE_MIN,
  setSquareQrSize,
} from "@/components/qr/qr-studio-state"

type QrControlSectionsProps = {
  backgroundSourceMode: AssetSourceMode
  initialBackgroundTab?: BackgroundSettingsTabId
  initialCornerDotTab?: StyleSettingsTabId
  initialCornerSquareTab?: StyleSettingsTabId
  initialStyleTab?: StyleSettingsTabId
  logoSourceMode: AssetSourceMode
  onBackgroundModeChange: (mode: AssetSourceMode) => void
  onBackgroundUploadError: (message: string) => void
  onBackgroundUploadSuccess: (file: File) => void
  onLogoModeChange: (mode: AssetSourceMode) => void
  onLogoUploadError: (message: string) => void
  onLogoUploadSuccess: (file: File) => void
  setState: React.Dispatch<React.SetStateAction<QrStudioState>>
  state: QrStudioState
  activeSection?: QrEditorSectionId
}

type StyleOption = {
  label: string
  value: string
}

type StyleSettingsTabId = "style" | "color"
type BackgroundSettingsTabId = "colors" | "upload"
type LogoSettingsTabId = "brand-icons" | "colors" | "upload" | "size"
type BrandIconCategoryFilter = BrandIconCategory | "all"
type BackgroundColorMode = "solid" | "gradient" | "transparent"
type GradientEditorVariant = "default" | "dot-enhanced"
type GradientEditorLayout = "default" | "drafting"
type DashboardCornerColorKey = "cornersSquare" | "cornersDot"
type DashboardAssetKey = "backgroundImage" | "logo"

const BRAND_ICON_CATEGORY_OPTIONS: Array<{
  label: string
  value: BrandIconCategoryFilter
}> = [
  { label: "All", value: "all" },
  { label: "Social", value: "social" },
  { label: "Business", value: "business" },
  { label: "Payments", value: "payments" },
  { label: "Travel", value: "travel" },
  { label: "Media", value: "media" },
  { label: "Web", value: "web" },
]

const DRAW_TYPES: Array<{ label: string; value: DrawType }> = [
  { label: "SVG", value: "svg" },
  { label: "Canvas", value: "canvas" },
]

const QR_MODES: Array<{ label: string; value: Mode }> = [
  { label: "Byte", value: "Byte" },
  { label: "Alphanumeric", value: "Alphanumeric" },
  { label: "Numeric", value: "Numeric" },
  { label: "Kanji", value: "Kanji" },
]

const GRADIENT_TYPES: Array<{ label: string; value: GradientType }> = [
  { label: "Linear", value: "linear" },
  { label: "Radial", value: "radial" },
]

const DOT_COLOR_MODES: Array<{ label: string; value: DotsColorMode }> = [
  { label: "Solid", value: "solid" },
  { label: "Gradient", value: "gradient" },
  { label: "Palette", value: "palette" },
]

const LOGO_MODES: Array<{ label: string; value: AssetSourceMode }> = [
  { label: "No logo", value: "none" },
  { label: "Built-in brand icon", value: "preset" },
  { label: "Remote URL", value: "url" },
  { label: "Upload file", value: "upload" },
]

const BACKGROUND_MODES: Array<{ label: string; value: AssetSourceMode }> = [
  { label: "No background image", value: "none" },
  { label: "Remote URL", value: "url" },
  { label: "Upload file", value: "upload" },
]

export function QrControlSections({
  backgroundSourceMode,
  initialBackgroundTab,
  initialCornerDotTab = "style",
  initialCornerSquareTab = "style",
  initialStyleTab = "style",
  logoSourceMode,
  onBackgroundModeChange,
  onBackgroundUploadError,
  onBackgroundUploadSuccess,
  onLogoModeChange,
  onLogoUploadError,
  onLogoUploadSuccess,
  setState,
  state,
  activeSection,
}: QrControlSectionsProps) {
  const [activeStyleTab, setActiveStyleTab] =
    useState<StyleSettingsTabId>(initialStyleTab)
  const [activeBackgroundTab, setActiveBackgroundTab] =
    useState<BackgroundSettingsTabId>(
      initialBackgroundTab ??
        (backgroundSourceMode === "none" ? "colors" : "upload"),
    )
  const [activeLogoTab, setActiveLogoTab] = useState<LogoSettingsTabId>(
    logoSourceMode === "preset" ? "brand-icons" : "upload",
  )
  const [activeCornerSquareTab, setActiveCornerSquareTab] =
    useState<StyleSettingsTabId>(initialCornerSquareTab)
  const [activeCornerDotTab, setActiveCornerDotTab] =
    useState<StyleSettingsTabId>(initialCornerDotTab)
  const [brandIconQuery, setBrandIconQuery] = useState("")
  const [brandIconCategory, setBrandIconCategory] =
    useState<BrandIconCategoryFilter>("all")
  const contentError = state.data.trim() ? null : "Add text or a URL to encode"
  const qrSize = state.width === state.height ? state.width : Math.max(state.width, state.height)
  const activeCustomDotShape = getActiveCustomDotShape(state.dotsOptions.type)
  const backgroundImageActive = hasBackgroundImage(state)
  const filteredBrandIcons = filterBrandIcons(brandIconQuery, brandIconCategory)
  const popularBrandIcons = POPULAR_BRAND_ICON_IDS.map((id) => getBrandIconById(id))
  const presetLogoColor = state.logo.presetColor ?? DEFAULT_BRAND_ICON_COLOR
  const selectedLogoColorItemId = state.logoGradient.enabled ? "gradient" : "solid"
  const backgroundColorMode = getBackgroundColorMode(state)
  const selectedCornerSquareColorItemId = state.cornersSquareGradient.enabled
    ? "gradient"
    : "solid"
  const selectedCornerDotColorItemId = state.cornersDotGradient.enabled
    ? "gradient"
    : "solid"
  const isDashboardMode = activeSection !== undefined
  const isDashboardStyleSection = activeSection === "style"
  const isDashboardBackgroundSection = activeSection === "background"
  const isDashboardCornerSquareSection = activeSection === "corner-square"
  const isDashboardCornerDotSection = activeSection === "corner-dot"
  const stackClassName = isDashboardMode ? "gap-3" : "grid gap-4 md:grid-cols-2"
  const encodingStackClassName = isDashboardMode ? "gap-3" : "grid gap-4 md:grid-cols-3"
  const dashboardTopTabListClassName =
    "mx-auto w-full border border-white/6 bg-white/[0.03] p-1 shadow-none"
  const dashboardTopTabContainerClassName = "items-center gap-4"
  const dashboardTopTabClassName =
    "flex-1 justify-center rounded-full px-3.5 py-1.5 text-[0.7rem] font-medium tracking-[0.16em] uppercase text-foreground/40 hover:text-foreground/66 data-[active=true]:text-foreground"
  const dashboardTopTabBubbleClassName =
    "bg-white/[0.07] ring-1 ring-white/[0.08] shadow-none mix-blend-normal"
  const [dotsColorOpenItemIds, setDotsColorOpenItemIds] =
    useExpandedDashboardAccordionIds(state.dotsColorMode)
  const [cornerSquareColorOpenItemIds, setCornerSquareColorOpenItemIds] =
    useExpandedDashboardAccordionIds(selectedCornerSquareColorItemId)
  const [cornerDotColorOpenItemIds, setCornerDotColorOpenItemIds] =
    useExpandedDashboardAccordionIds(selectedCornerDotColorItemId)
  const [backgroundColorOpenItemIds, setBackgroundColorOpenItemIds] =
    useExpandedDashboardAccordionIds(backgroundColorMode)
  const [backgroundSourceOpenItemIds, setBackgroundSourceOpenItemIds] =
    useExpandedDashboardAccordionIds(backgroundSourceMode)
  const [logoSourceOpenItemIds, setLogoSourceOpenItemIds] =
    useExpandedDashboardAccordionIds(logoSourceMode)
  const [logoColorOpenItemIds, setLogoColorOpenItemIds] =
    useExpandedDashboardAccordionIds(selectedLogoColorItemId)
  const expandDotsColorItem = (itemId: DotsColorMode) =>
    setDotsColorOpenItemIds((current) =>
      ensureDashboardAccordionItemExpanded(current, itemId),
    )
  const expandCornerSquareColorItem = (itemId: "solid" | "gradient") =>
    setCornerSquareColorOpenItemIds((current) =>
      ensureDashboardAccordionItemExpanded(current, itemId),
    )
  const expandCornerDotColorItem = (itemId: "solid" | "gradient") =>
    setCornerDotColorOpenItemIds((current) =>
      ensureDashboardAccordionItemExpanded(current, itemId),
    )
  const expandBackgroundColorItem = (itemId: BackgroundColorMode) =>
    setBackgroundColorOpenItemIds((current) =>
      ensureDashboardAccordionItemExpanded(current, itemId),
    )
  const expandLogoColorItem = (itemId: "solid" | "gradient") =>
    setLogoColorOpenItemIds((current) =>
      ensureDashboardAccordionItemExpanded(current, itemId),
    )

  const showsSection = (section: QrEditorSectionId) =>
    activeSection === undefined || activeSection === section

  const renderSection = ({
    children,
    contentClassName,
    description,
    title,
  }: {
    children: React.ReactNode
    contentClassName?: string
    description: string
    title: string
  }) => {
    if (isDashboardMode) {
      return (
        <section
          data-slot="section-fields"
          className={cn(
            "flex flex-col gap-6 [&_[data-slot=field-group]]:gap-4 [&_[data-slot=field-label]]:text-[0.78rem] [&_[data-slot=field-label]]:font-medium [&_[data-slot=field-label]]:tracking-[0.02em] [&_[data-slot=field-description]]:text-foreground/48 [&_[data-slot=input]]:h-10 [&_[data-slot=input]]:rounded-[1rem] [&_[data-slot=input]]:border-white/8 [&_[data-slot=input]]:bg-white/[0.03] [&_[data-slot=input]]:px-3.5 [&_[data-slot=select-trigger]]:h-10 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:rounded-[1rem] [&_[data-slot=select-trigger]]:border-white/8 [&_[data-slot=select-trigger]]:bg-white/[0.03] [&_[data-slot=select-trigger]]:px-3.5 [&_[data-slot=textarea]]:rounded-[1.35rem] [&_[data-slot=textarea]]:border-white/8 [&_[data-slot=textarea]]:bg-white/[0.03] [&_[data-slot=textarea]]:px-4 [&_[data-slot=textarea]]:py-3.5 [&_[data-slot=slider-track]]:bg-white/[0.08] [&_[data-slot=slider-thumb]]:border-white/18 [&_[data-slot=slider-thumb]]:bg-[color:var(--color-card)]",
            contentClassName,
          )}
        >
          {children}
        </section>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    )
  }

  const dotStyleControl = isDashboardMode ? (
    <VisualStylePicker
      id="dots-type"
      label="Dot style"
      onValueChange={(value) =>
        setState((current) => ({
          ...current,
          dotsOptions: { ...current.dotsOptions, type: value as StudioDotType },
        }))
      }
      options={DOT_STYLE_OPTIONS}
      previewKind="dots"
      value={state.dotsOptions.type}
    />
  ) : (
    <SelectField
      id="dots-type"
      label="Dot style"
      onValueChange={(value) =>
        setState((current) => ({
          ...current,
          dotsOptions: { ...current.dotsOptions, type: value as StudioDotType },
        }))
      }
      options={DOT_STYLE_OPTIONS}
      value={state.dotsOptions.type}
    />
  )

  const dotsRoundSizeControl = (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="dots-round-size">Round dot sizes</FieldLabel>
        {!isDashboardMode ? (
          <FieldDescription>
            Keeps SVG output visually softer by rounding dot sizing.
          </FieldDescription>
        ) : null}
      </FieldContent>
      <Switch
        id="dots-round-size"
        checked={state.dotsOptions.roundSize}
        onCheckedChange={(checked) =>
          setState((current) => ({
            ...current,
            dotsOptions: { ...current.dotsOptions, roundSize: checked },
          }))
        }
      />
    </Field>
  )

  const dotsColorModeControl = (
    <SegmentedOptionPicker
      id="dots-color-mode"
      isStacked={isDashboardMode}
      label="Color mode"
      onValueChange={(value) =>
        setState((current) => ({
          ...current,
          dotsColorMode: value as DotsColorMode,
        }))
      }
      options={DOT_COLOR_MODES}
      value={state.dotsColorMode}
    />
  )

  const solidDotColorControl = (
    <EmbeddedColorPickerField
      chrome="minimal"
      label="Solid color"
      onValueChange={(value) => {
        expandDotsColorItem("solid")
        setState((current) => applyDotsSolidColor(current, value))
      }}
      pickerClassName="mx-auto"
      value={state.dotsOptions.color}
    />
  )

  const paletteDotColorControl = (
    <DotsPaletteCard
      isDashboardMode={isDashboardMode}
      onApply={
        isDashboardMode
          ? () => {
              expandDotsColorItem("palette")
              setState((current) => applyDotsPaletteSelection(current))
            }
          : undefined
      }
      palette={state.dotsPalette}
    />
  )

  const gradientDotColorControl = (
    <GradientEditor
      gradient={{ ...state.dotsGradient, enabled: true }}
      hideToggle
      idPrefix="dots-gradient"
      isDashboardMode={isDashboardMode}
      onGradientChange={(gradient) => {
        expandDotsColorItem("gradient")
        setState((current) => applyDotsGradient(current, gradient))
      }}
      title="Dot gradient"
      variant="dot-enhanced"
    />
  )

  const dashboardDotColorAccordion = (
    <MotionAccordion
      allowCollapse
      gap={0}
      openItemIds={dotsColorOpenItemIds}
      onOpenItemIdsChange={setDotsColorOpenItemIds}
      variant="settings"
      items={[
        {
          id: "solid",
          title: "Solid",
          content: solidDotColorControl,
        },
        {
          id: "gradient",
          title: "Gradient",
          content: gradientDotColorControl,
        },
        {
          id: "palette",
          title: "Palette",
          content: paletteDotColorControl,
        },
      ]}
    />
  )

  const cornerSquareStyleControl = isDashboardMode ? (
    <VisualStylePicker
      id="corner-square-type"
      label="Corner square style"
      onValueChange={(value) =>
        setState((current) => ({
          ...current,
          cornersSquareOptions: {
            ...current.cornersSquareOptions,
            type: value as CornerSquareType,
          },
        }))
      }
      options={CORNER_SQUARE_STYLE_OPTIONS}
      previewKind="corner-square"
      value={state.cornersSquareOptions.type}
    />
  ) : (
    <SelectField
      id="corner-square-type"
      label="Corner square style"
      onValueChange={(value) =>
        setState((current) => ({
          ...current,
          cornersSquareOptions: {
            ...current.cornersSquareOptions,
            type: value as CornerSquareType,
          },
        }))
      }
      options={CORNER_SQUARE_STYLE_OPTIONS}
      value={state.cornersSquareOptions.type}
    />
  )

  const dashboardCornerSquareColorAccordion = (
    <MotionAccordion
      allowCollapse
      gap={0}
      openItemIds={cornerSquareColorOpenItemIds}
      onOpenItemIdsChange={setCornerSquareColorOpenItemIds}
      variant="settings"
      items={[
        {
          id: "solid",
          title: "Solid",
          content: (
            <EmbeddedColorPickerField
              chrome="minimal"
              label="Solid color"
              onValueChange={(value) => {
                expandCornerSquareColorItem("solid")
                setState((current) =>
                  applyCornerSolidColor(current, "cornersSquare", value),
                )
              }}
              pickerClassName="mx-auto"
              value={state.cornersSquareOptions.color}
            />
          ),
        },
        {
          id: "gradient",
          title: "Gradient",
          content: (
            <GradientEditor
              gradient={{ ...state.cornersSquareGradient, enabled: true }}
              hideToggle
              idPrefix="corner-square-gradient"
              isDashboardMode={isDashboardMode}
              onGradientChange={(gradient) => {
                expandCornerSquareColorItem("gradient")
                setState((current) =>
                  applyCornerGradient(current, "cornersSquare", gradient),
                )
              }}
              title="Corner square gradient"
              variant="dot-enhanced"
            />
          ),
        },
      ]}
    />
  )

  const cornerDotStyleControl = isDashboardMode ? (
    <VisualStylePicker
      id="corner-dot-type"
      label="Corner dot style"
      onValueChange={(value) =>
        setState((current) => ({
          ...current,
          cornersDotOptions: {
            ...current.cornersDotOptions,
            type: value as CornerDotType,
          },
        }))
      }
      options={CORNER_DOT_STYLE_OPTIONS}
      previewKind="corner-dot"
      value={state.cornersDotOptions.type}
    />
  ) : (
    <SelectField
      id="corner-dot-type"
      label="Corner dot style"
      onValueChange={(value) =>
        setState((current) => ({
          ...current,
          cornersDotOptions: {
            ...current.cornersDotOptions,
            type: value as CornerDotType,
          },
        }))
      }
      options={CORNER_DOT_STYLE_OPTIONS}
      value={state.cornersDotOptions.type}
    />
  )

  const dashboardCornerDotColorAccordion = (
    <MotionAccordion
      allowCollapse
      gap={0}
      openItemIds={cornerDotColorOpenItemIds}
      onOpenItemIdsChange={setCornerDotColorOpenItemIds}
      variant="settings"
      items={[
        {
          id: "solid",
          title: "Solid",
          content: (
            <EmbeddedColorPickerField
              chrome="minimal"
              label="Solid color"
              onValueChange={(value) => {
                expandCornerDotColorItem("solid")
                setState((current) =>
                  applyCornerSolidColor(current, "cornersDot", value),
                )
              }}
              pickerClassName="mx-auto"
              value={state.cornersDotOptions.color}
            />
          ),
        },
        {
          id: "gradient",
          title: "Gradient",
          content: (
            <GradientEditor
              gradient={{ ...state.cornersDotGradient, enabled: true }}
              hideToggle
              idPrefix="corner-dot-gradient"
              isDashboardMode={isDashboardMode}
              onGradientChange={(gradient) => {
                expandCornerDotColorItem("gradient")
                setState((current) =>
                  applyCornerGradient(current, "cornersDot", gradient),
                )
              }}
              title="Corner dot gradient"
              variant="dot-enhanced"
            />
          ),
        },
      ]}
    />
  )

  const dashboardBackgroundColorAccordion = (
    <div className="flex flex-col gap-4">
      <MotionAccordion
        allowCollapse
        gap={0}
        openItemIds={backgroundColorOpenItemIds}
        onOpenItemIdsChange={setBackgroundColorOpenItemIds}
        variant="settings"
        items={[
          {
            id: "solid",
          title: "Solid",
          content: (
            <EmbeddedColorPickerField
              chrome="minimal"
              className={cn(backgroundImageActive && "pointer-events-none opacity-50")}
              label="Solid color"
              onValueChange={(value) => {
                expandBackgroundColorItem("solid")
                setState((current) => applyBackgroundSolidColor(current, value))
              }}
              pickerClassName="mx-auto"
              value={state.backgroundOptions.color}
            />
          ),
          },
          {
            id: "gradient",
            title: "Gradient",
            content: (
              <GradientEditor
                disabled={backgroundImageActive}
                gradient={{ ...state.backgroundGradient, enabled: true }}
                hideToggle
                idPrefix="background-gradient"
                isDashboardMode={isDashboardMode}
                onGradientChange={(gradient) => {
                  expandBackgroundColorItem("gradient")
                  setState((current) =>
                    applyBackgroundGradient(current, gradient),
                  )
                }}
                title="Background gradient"
                variant="dot-enhanced"
              />
            ),
          },
          {
            id: "transparent",
            title: "Transparent",
            content: null,
            onToggle: () =>
              !backgroundImageActive &&
              setState((current) => applyBackgroundTransparentSelection(current)),
          },
        ]}
      />

      {backgroundImageActive ? (
        <p className="text-sm text-muted-foreground">
          Remove the background image to edit the background fill or gradient.
        </p>
      ) : null}
    </div>
  )

  const dashboardBackgroundUploadAccordion = (
    <MotionAccordion
      allowCollapse
      gap={0}
      openItemIds={backgroundSourceOpenItemIds}
      onOpenItemIdsChange={setBackgroundSourceOpenItemIds}
      variant="settings"
      items={[
        {
          id: "none",
          title: "None",
          content: null,
          onToggle: () => onBackgroundModeChange("none"),
        },
        {
          id: "upload",
          title: "Upload file",
          content: (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Upload background image</p>
              <FileUpload
                acceptedFileTypes={["image/*"]}
                className="mx-0 max-w-full"
                onUploadError={(error) => onBackgroundUploadError(error.message)}
                onUploadSuccess={onBackgroundUploadSuccess}
                uploadDelay={0}
              />
            </div>
          ),
        },
        {
          id: "url",
          title: "Remote URL",
          content: (
            <Field>
              <FieldLabel htmlFor="background-url">Remote background URL</FieldLabel>
              <Input
                id="background-url"
                placeholder="https://example.com/background.png"
                value={state.backgroundImage.value ?? ""}
                onChange={(event) =>
                  setState((current) =>
                    applyAssetUrlValue(
                      current,
                      "backgroundImage",
                      event.target.value,
                    ),
                  )
                }
              />
            </Field>
          ),
        },
      ]}
    />
  )

  function handlePresetLogoSelection(brandIcon: BrandIconEntry) {
    setActiveLogoTab("brand-icons")
    onLogoModeChange("preset")
    setState((current) =>
      applyLogoPresetSelection(
        current,
        brandIcon,
        current.logoGradient.enabled
          ? createBrandIconGradientDataUrl(brandIcon, {
              ...current.logoGradient,
              enabled: true,
            })
          : createBrandIconDataUrl(
              brandIcon,
              current.logo.presetColor ?? DEFAULT_BRAND_ICON_COLOR,
            ),
        current.logo.presetColor ?? DEFAULT_BRAND_ICON_COLOR,
      ),
    )
  }

  function handlePresetLogoColorChange(color: string) {
    expandLogoColorItem("solid")
    setState((current) => {
      const selectedIcon = findBrandIconById(current.logo.presetId)

      if (!selectedIcon) {
        return {
          ...current,
          logo: {
            ...current.logo,
            presetColor: color,
            source: "preset",
            value: undefined,
          },
          logoGradient: {
            ...current.logoGradient,
            enabled: false,
          },
        }
      }

      return applyLogoPresetColor(
        current,
        createBrandIconDataUrl(selectedIcon, color),
        color,
      )
    })
  }

  function handlePresetLogoGradientChange(gradient: StudioGradient) {
    expandLogoColorItem("gradient")
    setState((current) => {
      const nextGradient = { ...gradient, enabled: true }
      const selectedIcon = findBrandIconById(current.logo.presetId)

      if (!selectedIcon) {
        return {
          ...current,
          logo: {
            ...current.logo,
            source: "preset",
            value: undefined,
          },
          logoGradient: nextGradient,
        }
      }

      return applyLogoPresetGradient(
        current,
        createBrandIconGradientDataUrl(selectedIcon, nextGradient),
        nextGradient,
      )
    })
  }

  const presetLogoPicker = (
    <BrandIconPicker
      brandIconQuery={brandIconQuery}
      filteredBrandIcons={filteredBrandIcons}
      onBrandIconCategoryChange={setBrandIconCategory}
      onBrandIconQueryChange={setBrandIconQuery}
      onSelect={handlePresetLogoSelection}
      popularBrandIcons={popularBrandIcons}
      selectedBrandIconId={state.logo.presetId}
      selectedCategory={brandIconCategory}
      showCategoryFilter={isDashboardMode}
      showPopular={!isDashboardMode}
    />
  )

  const dashboardLogoUploadAccordion = (
    <MotionAccordion
      allowCollapse
      gap={0}
      openItemIds={logoSourceOpenItemIds}
      onOpenItemIdsChange={setLogoSourceOpenItemIds}
      variant="settings"
      items={[
        {
          id: "none",
          title: "None",
          content: null,
          onToggle: () => onLogoModeChange("none"),
        },
        {
          id: "upload",
          title: "Upload file",
          content: (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Upload logo</p>
              <FileUpload
                acceptedFileTypes={["image/*"]}
                className="mx-0 max-w-full"
                onUploadError={(error) => onLogoUploadError(error.message)}
                onUploadSuccess={onLogoUploadSuccess}
                uploadDelay={0}
              />
            </div>
          ),
        },
        {
          id: "url",
          title: "Remote URL",
          content: (
            <Field>
              <FieldLabel htmlFor="logo-url">Remote logo URL</FieldLabel>
              <Input
                id="logo-url"
                placeholder="https://example.com/logo.png"
                value={state.logo.value ?? ""}
                onChange={(event) =>
                  setState((current) =>
                    applyAssetUrlValue(current, "logo", event.target.value),
                  )
                }
              />
            </Field>
          ),
        },
      ]}
    />
  )

  const dashboardBrandIconsPanel = (
    <div className="flex flex-col gap-4">{presetLogoPicker}</div>
  )

  const dashboardLogoColorsPanel =
    logoSourceMode === "preset" ? (
      <MotionAccordion
        allowCollapse
        gap={0}
        openItemIds={logoColorOpenItemIds}
        onOpenItemIdsChange={setLogoColorOpenItemIds}
        variant="settings"
        items={[
          {
            id: "solid",
            title: "Solid",
            content: (
              <EmbeddedColorPickerField
                chrome="minimal"
                label="Logo icon color"
                onValueChange={handlePresetLogoColorChange}
                pickerClassName="mx-auto"
                value={presetLogoColor}
              />
            ),
          },
          {
            id: "gradient",
            title: "Gradient",
            content: (
              <GradientEditor
                gradient={{ ...state.logoGradient, enabled: true }}
                hideToggle
                idPrefix="logo-gradient"
                isDashboardMode={isDashboardMode}
                onGradientChange={handlePresetLogoGradientChange}
                title="Logo icon gradient"
                variant="dot-enhanced"
              />
            ),
          },
        ]}
      />
    ) : (
      <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-foreground/72">
        <p className="font-medium text-foreground">
          Icon color applies only to built-in brand icons.
        </p>
        <p className="mt-1 text-foreground/58">
          Choose a brand icon in the Brand Icons tab to edit its color.
        </p>
      </div>
    )

  const logoSizeControls = (
    <>
      <Field>
        <UnlumenSlider
          data-slot="logo-size-slider"
          id="logo-size"
          label="Logo size"
          formatValue={(value) => `${Math.round(value)}%`}
          max={100}
          min={0}
          onChange={(value) =>
            setState((current) => ({
              ...current,
              imageOptions: {
                ...current.imageOptions,
                imageSize:
                  (Array.isArray(value) ? value[0] : value) / 100,
              },
            }))
          }
          showSteps
          showValue
          step={10}
          value={state.imageOptions.imageSize * 100}
        />
        {!isDashboardMode ? (
          <FieldDescription>
            Sets the logo width as a percentage of the QR code.
          </FieldDescription>
        ) : null}
      </Field>

      <Field>
        <UnlumenSlider
          data-slot="logo-margin-slider"
          id="logo-margin"
          label="Logo margin"
          formatValue={(value) => `${Math.round(value)} px`}
          max={40}
          min={0}
          onChange={(value) =>
            setState((current) => ({
              ...current,
              imageOptions: {
                ...current.imageOptions,
                margin: Array.isArray(value) ? value[0] : value,
              },
            }))
          }
          showValue
          step={1}
          value={state.imageOptions.margin}
        />
      </Field>

      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="hide-background-dots">Hide background dots</FieldLabel>
          {!isDashboardMode ? (
            <FieldDescription>
              Clears the modules directly under the logo so the image reads
              cleanly.
            </FieldDescription>
          ) : null}
        </FieldContent>
        <Switch
          id="hide-background-dots"
          checked={state.imageOptions.hideBackgroundDots}
          onCheckedChange={(checked) =>
            setState((current) => ({
              ...current,
              imageOptions: {
                ...current.imageOptions,
                hideBackgroundDots: checked,
              },
            }))
          }
        />
      </Field>

      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="save-as-blob">Save embedded image as blob</FieldLabel>
          {!isDashboardMode ? (
            <FieldDescription>
              Larger SVG files, but better compatibility when the QR is opened
              elsewhere.
            </FieldDescription>
          ) : null}
        </FieldContent>
        <Switch
          id="save-as-blob"
          checked={state.imageOptions.saveAsBlob}
          onCheckedChange={(checked) =>
            setState((current) => ({
              ...current,
              imageOptions: { ...current.imageOptions, saveAsBlob: checked },
            }))
          }
        />
      </Field>
    </>
  )

  const dashboardLogoSizePanel = (
    <div className="flex flex-col gap-4">{logoSizeControls}</div>
  )

  return (
    <div className={cn("flex flex-col", isDashboardMode ? "gap-3" : "gap-4")}>
      {showsSection("content") ? (
        renderSection({
          title: "Content",
          description: "Set the encoded value, renderer, and output dimensions.",
          children: (
          <FieldGroup>
            <Field data-invalid={contentError ? true : undefined}>
              <FieldLabel htmlFor="qr-data">Text or URL</FieldLabel>
              <Textarea
                id="qr-data"
                aria-invalid={contentError ? true : undefined}
                value={state.data}
                onChange={(event) =>
                  setState((current) => ({ ...current, data: event.target.value }))
                }
                className="min-h-28"
                placeholder="https://example.com/invite"
              />
              {!isDashboardMode ? (
                <FieldDescription>
                  The value you enter here is encoded directly into the QR code.
                </FieldDescription>
              ) : null}
              {contentError ? <FieldError>{contentError}</FieldError> : null}
            </Field>

            {!isDashboardMode ? (
              <FieldGroup className={stackClassName}>
                <Field>
                  <FieldLabel htmlFor="qr-draw-type">Render type</FieldLabel>
                  <Select
                    value={state.type}
                    onValueChange={(value) =>
                      setState((current) => ({
                        ...current,
                        type: value as DrawType,
                      }))
                    }
                  >
                    <SelectTrigger id="qr-draw-type" className="w-full">
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {DRAW_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Changes the live preview renderer only. Export buttons still
                    choose the downloaded file format.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            ) : null}

            <Field>
              <UnlumenSlider
                data-slot="qr-margin-slider"
                id="qr-margin"
                label="Outer margin"
                formatValue={(value) => `${Math.round(value)} px`}
                max={80}
                min={0}
                onChange={(value) =>
                  setState((current) => ({
                    ...current,
                    margin: Array.isArray(value) ? value[0] : value,
                  }))
                }
                showValue
                step={1}
                value={state.margin}
              />
            </Field>

            <Field>
              <UnlumenSlider
                data-slot="qr-size-slider"
                id="qr-size"
                label="Size"
                formatValue={(value) => `${Math.round(value)} px`}
                max={QR_SIZE_MAX}
                min={QR_SIZE_MIN}
                onChange={(value) => {
                  const nextSize = Array.isArray(value) ? value[0] : value

                  setState((current) => setSquareQrSize(current, nextSize))
                }}
                showValue
                step={1}
                value={qrSize}
              />
            </Field>
          </FieldGroup>
          ),
        })
      ) : null}

      {showsSection("style") ? (
        renderSection({
          title: "Dots",
          description: "Shape the main QR modules and choose solid, gradient, or palette color treatment.",
          contentClassName: "flex flex-col gap-4",
          children: (
            <>
              {isDashboardStyleSection ? (
                <DirectionAwareTabs
                  activeTab={activeStyleTab}
                  bubbleClassName={dashboardTopTabBubbleClassName}
                  className={dashboardTopTabListClassName}
                  containerClassName={dashboardTopTabContainerClassName}
                  contentClassName="min-h-0"
                  onTabChange={(tabId) => setActiveStyleTab(tabId as StyleSettingsTabId)}
                  showContent
                  tabClassName={dashboardTopTabClassName}
                  tabListLabel="Style settings groups"
                  tabs={[
                    {
                      id: "style",
                      label: "Style",
                      content: (
                        <div className="flex flex-col gap-4">
                          {dotStyleControl}
                          {dotsRoundSizeControl}
                        </div>
                      ),
                    },
                    {
                      id: "color",
                      label: "Color",
                      content: (
                        <div className="flex flex-col gap-4">{dashboardDotColorAccordion}</div>
                      ),
                    },
                  ]}
                />
              ) : (
                <>
                  <FieldGroup className={stackClassName}>
                    {dotStyleControl}
                    {dotsColorModeControl}
                  </FieldGroup>

                  {state.dotsColorMode === "solid" ? (
                    <ColorField
                      id="dots-color"
                      isDashboardMode={isDashboardMode}
                      label="Solid color"
                      onValueChange={(value) =>
                        setState((current) => ({
                          ...current,
                          dotsOptions: { ...current.dotsOptions, color: value },
                        }))
                      }
                      value={state.dotsOptions.color}
                    />
                  ) : null}

                  {state.dotsColorMode === "palette" ? (
                    <DotsPaletteCard
                      isDashboardMode={isDashboardMode}
                      palette={state.dotsPalette}
                    />
                  ) : null}
                </>
              )}

              {activeCustomDotShape && state.type !== "svg" ? (
                <p className="text-sm text-muted-foreground">
                  Custom dot shapes currently render only in SVG mode.
                </p>
              ) : null}

              {!isDashboardStyleSection ? dotsRoundSizeControl : null}

              {!isDashboardStyleSection && state.dotsColorMode === "gradient" ? (
                <GradientEditor
                  gradient={{ ...state.dotsGradient, enabled: true }}
                  hideToggle
                  idPrefix="dots-gradient"
                  isDashboardMode={isDashboardMode}
                  onGradientChange={(gradient) =>
                    setState((current) => ({
                      ...current,
                      dotsGradient: { ...gradient, enabled: true },
                    }))
                  }
                  title="Dot gradient"
                  variant="dot-enhanced"
                />
              ) : null}
            </>
          ),
        })
      ) : null}

      {!isDashboardMode ? (
        renderSection({
          title: "Corners",
          description: "Style the corner frames and the inner corner dots independently.",
          contentClassName: "flex flex-col gap-5",
          children: (
            <>
              <FieldGroup className={stackClassName}>
                {cornerSquareStyleControl}
                <ColorField
                  id="corner-square-color"
                  isDashboardMode={isDashboardMode}
                  label="Corner square color"
                  onValueChange={(value) =>
                    setState((current) => ({
                      ...current,
                      cornersSquareOptions: {
                        ...current.cornersSquareOptions,
                        color: value,
                      },
                    }))
                  }
                  value={state.cornersSquareOptions.color}
                />
              </FieldGroup>

              <GradientEditor
                gradient={state.cornersSquareGradient}
                idPrefix="corner-square-gradient"
                isDashboardMode={isDashboardMode}
                onGradientChange={(gradient) =>
                  setState((current) => ({
                    ...current,
                    cornersSquareGradient: gradient,
                  }))
                }
                title="Corner square gradient"
              />

              <FieldGroup className={stackClassName}>
                {cornerDotStyleControl}
                <ColorField
                  id="corner-dot-color"
                  isDashboardMode={isDashboardMode}
                  label="Corner dot color"
                  onValueChange={(value) =>
                    setState((current) => ({
                      ...current,
                      cornersDotOptions: {
                        ...current.cornersDotOptions,
                        color: value,
                      },
                    }))
                  }
                  value={state.cornersDotOptions.color}
                />
              </FieldGroup>

              <GradientEditor
                gradient={state.cornersDotGradient}
                idPrefix="corner-dot-gradient"
                isDashboardMode={isDashboardMode}
                onGradientChange={(gradient) =>
                  setState((current) => ({ ...current, cornersDotGradient: gradient }))
                }
                title="Corner dot gradient"
              />
            </>
          ),
        })
      ) : null}

      {isDashboardCornerSquareSection ? (
        renderSection({
          title: "Corner square",
          description: "Style the corner frame and choose its color treatment.",
          contentClassName: "flex flex-col gap-4",
          children: (
            <DirectionAwareTabs
              activeTab={activeCornerSquareTab}
              bubbleClassName={dashboardTopTabBubbleClassName}
              className={dashboardTopTabListClassName}
              containerClassName={dashboardTopTabContainerClassName}
              contentClassName="min-h-0"
              onTabChange={(tabId) => setActiveCornerSquareTab(tabId as StyleSettingsTabId)}
              showContent
              tabClassName={dashboardTopTabClassName}
              tabListLabel="Corner square settings groups"
              tabs={[
                {
                  id: "style",
                  label: "Style",
                  content: (
                    <div className="flex flex-col gap-4">{cornerSquareStyleControl}</div>
                  ),
                },
                {
                  id: "color",
                  label: "Color",
                  content: (
                    <div className="flex flex-col gap-4">
                      {dashboardCornerSquareColorAccordion}
                    </div>
                  ),
                },
              ]}
            />
          ),
        })
      ) : null}

      {isDashboardCornerDotSection ? (
        renderSection({
          title: "Corner dot",
          description: "Style the inner corner dot and choose its color treatment.",
          contentClassName: "flex flex-col gap-4",
          children: (
            <DirectionAwareTabs
              activeTab={activeCornerDotTab}
              bubbleClassName={dashboardTopTabBubbleClassName}
              className={dashboardTopTabListClassName}
              containerClassName={dashboardTopTabContainerClassName}
              contentClassName="min-h-0"
              onTabChange={(tabId) => setActiveCornerDotTab(tabId as StyleSettingsTabId)}
              showContent
              tabClassName={dashboardTopTabClassName}
              tabListLabel="Corner dot settings groups"
              tabs={[
                {
                  id: "style",
                  label: "Style",
                  content: <div className="flex flex-col gap-4">{cornerDotStyleControl}</div>,
                },
                {
                  id: "color",
                  label: "Color",
                  content: (
                    <div className="flex flex-col gap-4">
                      {dashboardCornerDotColorAccordion}
                    </div>
                  ),
                },
              ]}
            />
          ),
        })
      ) : null}

      {showsSection("background") ? (
        isDashboardBackgroundSection ? (
          renderSection({
            title: "Background",
            description: "Choose a fill or layer in a gradient behind the code.",
            contentClassName: "flex flex-col gap-4",
            children: (
              <DirectionAwareTabs
                activeTab={activeBackgroundTab}
                bubbleClassName={dashboardTopTabBubbleClassName}
                className={dashboardTopTabListClassName}
                containerClassName={dashboardTopTabContainerClassName}
                contentClassName="min-h-0"
                onTabChange={(tabId) =>
                  setActiveBackgroundTab(tabId as BackgroundSettingsTabId)
                }
                showContent
                tabClassName={dashboardTopTabClassName}
                tabListLabel="Background settings groups"
                tabs={[
                  {
                    id: "colors",
                    label: "Colors",
                    content: dashboardBackgroundColorAccordion,
                  },
                  {
                    id: "upload",
                    label: "Upload",
                    content: dashboardBackgroundUploadAccordion,
                  },
                ]}
              />
            ),
          })
        ) : (
          renderSection({
            title: "Background",
            description: "Choose a fill or layer in a gradient behind the code.",
            contentClassName: "flex flex-col gap-4",
            children: (
              <>
                <AssetSourceField
                  idPrefix="background"
                  isDashboardMode={isDashboardMode}
                  mode={backgroundSourceMode}
                  noneLabel="No background image"
                  onModeChange={onBackgroundModeChange}
                  onRemove={() =>
                    setState((current) => ({
                      ...current,
                      backgroundImage: {
                        presetColor: undefined,
                        presetId: undefined,
                        source: "none",
                        value: undefined,
                      },
                    }))
                  }
                  onUploadError={onBackgroundUploadError}
                  onUploadSuccess={onBackgroundUploadSuccess}
                  onValueChange={(value) =>
                    setState((current) => ({
                      ...current,
                      backgroundImage: {
                        source: "url",
                        value,
                      },
                    }))
                  }
                  options={BACKGROUND_MODES}
                  removeLabel="Remove background image"
                  sourceLabel="Background source"
                  uploadLabel="Upload background image"
                  urlLabel="Remote background URL"
                  urlPlaceholder="https://example.com/background.png"
                  value={state.backgroundImage.value ?? ""}
                />

                {backgroundImageActive ? (
                  <p className="text-sm text-muted-foreground">
                    Background image replaces the background fill and gradient.
                  </p>
                ) : null}

                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="background-transparent">Transparent background</FieldLabel>
                    {!isDashboardMode ? (
                      <FieldDescription>
                        Use this when the QR should sit on top of another surface.
                      </FieldDescription>
                    ) : null}
                  </FieldContent>
                  <Switch
                    id="background-transparent"
                    disabled={backgroundImageActive}
                    checked={state.backgroundOptions.transparent}
                    onCheckedChange={(checked) =>
                      setState((current) => ({
                        ...current,
                        backgroundOptions: {
                          ...current.backgroundOptions,
                          transparent: checked,
                        },
                        backgroundGradient: checked
                          ? { ...current.backgroundGradient, enabled: false }
                          : current.backgroundGradient,
                      }))
                    }
                  />
                </Field>

                <ColorField
                  id="background-color"
                  disabled={backgroundImageActive}
                  isDashboardMode={isDashboardMode}
                  label="Background color"
                  onValueChange={(value) =>
                    setState((current) => ({
                      ...current,
                      backgroundOptions: { ...current.backgroundOptions, color: value },
                    }))
                  }
                  value={state.backgroundOptions.color}
                />

                <GradientEditor
                  disabled={backgroundImageActive || state.backgroundOptions.transparent}
                  disabledText={
                    backgroundImageActive
                      ? "Remove the background image to edit the background fill or gradient."
                      : "Disable transparency to apply a background gradient."
                  }
                  gradient={state.backgroundGradient}
                  idPrefix="background-gradient"
                  isDashboardMode={isDashboardMode}
                  onGradientChange={(gradient) =>
                    setState((current) => ({ ...current, backgroundGradient: gradient }))
                  }
                  title="Background gradient"
                />
              </>
            ),
          })
        )
      ) : null}

      {showsSection("logo") ? (
        renderSection({
          title: "Logo",
          description:
            "Add a logo from a URL or local file and tune how much QR space it occupies.",
          contentClassName: "flex flex-col gap-4",
          children: (
            <>
              {isDashboardMode ? (
                <DirectionAwareTabs
                  activeTab={activeLogoTab}
                  bubbleClassName={dashboardTopTabBubbleClassName}
                  className={dashboardTopTabListClassName}
                  containerClassName={dashboardTopTabContainerClassName}
                  contentClassName="min-h-0"
                  onTabChange={(tabId) => setActiveLogoTab(tabId as LogoSettingsTabId)}
                  showContent
                  tabClassName={dashboardTopTabClassName}
                  tabListLabel="Logo settings groups"
                  tabs={[
                    {
                      id: "brand-icons",
                      label: "Brand Icons",
                      content: dashboardBrandIconsPanel,
                    },
                    {
                      id: "colors",
                      label: "COLORS",
                      content: dashboardLogoColorsPanel,
                    },
                    {
                      id: "upload",
                      label: "Upload",
                      content: dashboardLogoUploadAccordion,
                    },
                    {
                      id: "size",
                      label: "Size",
                      content: dashboardLogoSizePanel,
                    },
                  ]}
                />
              ) : (
                <>
                  <SelectField
                    id="logo-source-mode"
                    label="Logo source"
                    onValueChange={(value) => onLogoModeChange(value as AssetSourceMode)}
                    options={LOGO_MODES}
                    value={logoSourceMode}
                  />

                  {logoSourceMode === "preset" ? (
                    <>
                      {presetLogoPicker}

                      <Field>
                        <FieldLabel htmlFor="logo-icon-color">Logo icon color</FieldLabel>
                        <ColorPicker
                          onColorChange={handlePresetLogoColorChange}
                          size={320}
                          value={presetLogoColor}
                        />
                      </Field>
                    </>
                  ) : null}

                  {logoSourceMode === "url" ? (
                    <Field>
                      <FieldLabel htmlFor="logo-url">Remote logo URL</FieldLabel>
                      <Input
                        id="logo-url"
                        placeholder="https://example.com/logo.png"
                        value={state.logo.value ?? ""}
                        onChange={(event) =>
                          setState((current) =>
                            applyAssetUrlValue(current, "logo", event.target.value),
                          )
                        }
                      />
                      {!isDashboardMode ? (
                        <FieldDescription>
                          Use a public image URL if you want exportable SVG output with a
                          hosted asset.
                        </FieldDescription>
                      ) : null}
                    </Field>
                  ) : null}

                  {logoSourceMode === "upload" ? (
                    <FileUpload
                      acceptedFileTypes={["image/*"]}
                      className={cn("mx-0 max-w-none", isDashboardMode ? "max-w-full" : undefined)}
                      onUploadError={(error) => onLogoUploadError(error.message)}
                      onUploadSuccess={onLogoUploadSuccess}
                      uploadDelay={0}
                    />
                  ) : null}

                  {logoSourceMode !== "none" ? (
                    <Button
                      variant="ghost"
                      className="self-start"
                      onClick={() => {
                        onLogoModeChange("none")
                        setState((current) => applyAssetNoneSelection(current, "logo"))
                      }}
                    >
                      <XIcon data-icon="inline-start" />
                      Remove logo
                    </Button>
                  ) : null}
                </>
              )}

              {!isDashboardMode ? logoSizeControls : null}
            </>
          ),
        })
      ) : null}

      {showsSection("encoding") ? (
        renderSection({
          title: "QR settings",
          description: "Adjust the encoding mode and error correction level.",
          children: (
          <FieldGroup className={encodingStackClassName}>
            <SelectField
              id="qr-mode"
              label="Mode"
              onValueChange={(value) =>
                setState((current) => ({
                  ...current,
                  qrOptions: { ...current.qrOptions, mode: value as Mode },
                }))
              }
              options={QR_MODES}
              value={state.qrOptions.mode}
            />
            <SelectField
              id="qr-type-number"
              label="Type number"
              onValueChange={(value) =>
                setState((current) => ({
                  ...current,
                  qrOptions: {
                    ...current.qrOptions,
                    typeNumber: Number(value) as TypeNumber,
                  },
                }))
              }
              options={TYPE_NUMBERS.map((option) => ({
                label: option.label,
                value: String(option.value),
              }))}
              value={String(state.qrOptions.typeNumber)}
            />
            <SelectField
              id="qr-error-correction"
              label="Error correction"
              onValueChange={(value) =>
                setState((current) => ({
                  ...current,
                  qrOptions: {
                    ...current.qrOptions,
                    errorCorrectionLevel: value as QrStudioState["qrOptions"]["errorCorrectionLevel"],
                  },
                }))
              }
              options={ERROR_CORRECTION_LEVEL_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              value={state.qrOptions.errorCorrectionLevel}
            />
          </FieldGroup>
          ),
        })
      ) : null}
    </div>
  )
}

function ColorField({
  chrome = "default",
  disabled,
  id,
  isDashboardMode,
  label,
  onValueChange,
  value,
}: {
  chrome?: "default" | "minimal"
  disabled?: boolean
  id: string
  isDashboardMode?: boolean
  label: string
  onValueChange: (value: string) => void
  value: string
}) {
  const isMinimal = chrome === "minimal"

  return (
    <Field>
      <FieldLabel htmlFor={id} className={cn(isMinimal && "sr-only")}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        disabled={disabled}
        type="color"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          "h-11 p-1",
          isDashboardMode && "rounded-[1rem] border-white/8 bg-white/[0.03]",
        )}
      />
      {!isMinimal
        ? isDashboardMode ? (
            <p className="font-mono text-xs text-muted-foreground">{value}</p>
          ) : (
            <FieldDescription>{value}</FieldDescription>
          )
        : null}
    </Field>
  )
}

function AssetSourceField({
  idPrefix,
  isDashboardMode,
  mode,
  noneLabel,
  onModeChange,
  onRemove,
  onUploadError,
  onUploadSuccess,
  onValueChange,
  options,
  removeLabel,
  sourceLabel,
  uploadLabel,
  urlLabel,
  urlPlaceholder,
  value,
}: {
  idPrefix: string
  isDashboardMode?: boolean
  mode: AssetSourceMode
  noneLabel: string
  onModeChange: (mode: AssetSourceMode) => void
  onRemove: () => void
  onUploadError: (message: string) => void
  onUploadSuccess: (file: File) => void
  onValueChange: (value: string) => void
  options: Array<{ label: string; value: AssetSourceMode }>
  removeLabel: string
  sourceLabel: string
  uploadLabel: string
  urlLabel: string
  urlPlaceholder: string
  value: string
}) {
  return (
    <>
      <SelectField
        id={`${idPrefix}-source-mode`}
        label={sourceLabel}
        onValueChange={(nextValue) => onModeChange(nextValue as AssetSourceMode)}
        options={options}
        value={mode}
      />

      {mode === "url" ? (
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-url`}>{urlLabel}</FieldLabel>
          <Input
            id={`${idPrefix}-url`}
            placeholder={urlPlaceholder}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          />
        </Field>
      ) : null}

      {mode === "upload" ? (
        <div className="space-y-3">
          {isDashboardMode ? (
            <p className="text-sm font-medium text-foreground">{uploadLabel}</p>
          ) : null}
          <FileUpload
            acceptedFileTypes={["image/*"]}
            className={cn("mx-0 max-w-none", isDashboardMode ? "max-w-full" : undefined)}
            onUploadError={(error) => onUploadError(error.message)}
            onUploadSuccess={onUploadSuccess}
            uploadDelay={0}
          />
        </div>
      ) : null}

      {mode !== "none" ? (
        <Button
          variant="ghost"
          className={cn(
            "self-start",
            isDashboardMode &&
              "rounded-full px-0 text-foreground/56 hover:bg-transparent hover:text-foreground",
          )}
          onClick={onRemove}
        >
          <XIcon data-icon="inline-start" />
          {removeLabel}
        </Button>
      ) : null}

      {mode === "none" && !isDashboardMode ? (
        <p className="text-sm text-muted-foreground">{noneLabel}</p>
      ) : null}
    </>
  )
}

export function GradientEditor({
  disabled,
  disabledText,
  gradient,
  hideToggle,
  idPrefix,
  isDashboardMode,
  layout = "default",
  onGradientChange,
  title,
  variant = "default",
}: {
  disabled?: boolean
  disabledText?: string
  gradient: StudioGradient
  hideToggle?: boolean
  idPrefix: string
  isDashboardMode?: boolean
  layout?: GradientEditorLayout
  onGradientChange: (gradient: StudioGradient) => void
  title: string
  variant?: GradientEditorVariant
}) {
  const isDotEnhanced = variant === "dot-enhanced"
  const isDraftingLayout = layout === "drafting"
  const rotationDegrees = Math.min(360, Math.max(0, radiansToDegrees(gradient.rotation)))
  const gradientOffsetRange = normalizeGradientOffsetRange([
    gradient.colorStops[0].offset,
    gradient.colorStops[1].offset,
  ])

  const updateGradientOffsetRange = (values: [number, number]) => {
    const [startOffset, endOffset] = normalizeGradientOffsetRange(values)

    onGradientChange({
      ...gradient,
      colorStops: [
        { ...gradient.colorStops[0], offset: startOffset },
        { ...gradient.colorStops[1], offset: endOffset },
      ],
    })
  }

  return (
    <div
      className={cn(
        isDashboardMode
          ? "border-0 bg-transparent p-0"
          : isDraftingLayout
            ? "border-0 bg-transparent p-0"
            : "rounded-[var(--radius-xl)] border border-border/70 bg-muted/20 p-4",
      )}
    >
      {hideToggle ? (
        !isDashboardMode ? (
          isDraftingLayout ? (
            null
          ) : (
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">
                Adjust the two-stop gradient for this region.
              </p>
            </div>
          )
        ) : null
      ) : (
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor={`${idPrefix}-enabled`}>{title}</FieldLabel>
            {!isDashboardMode ? (
              <FieldDescription>
                Toggle a two-stop gradient for this region.
              </FieldDescription>
            ) : null}
          </FieldContent>
          <Switch
            id={`${idPrefix}-enabled`}
            disabled={disabled}
            checked={disabled ? false : gradient.enabled}
            onCheckedChange={(checked) =>
              onGradientChange({ ...gradient, enabled: disabled ? false : checked })
            }
          />
        </Field>
      )}

      {disabledText && disabled ? (
        <p className="mt-3 text-sm text-muted-foreground">{disabledText}</p>
      ) : null}

      {(hideToggle || gradient.enabled) && !disabled ? (
        <FieldGroup
          className={cn(
            "mt-4",
            isDashboardMode
              ? "gap-3"
              : isDraftingLayout
                ? "gap-4"
                : "grid gap-4 md:grid-cols-2",
          )}
        >
          {isDraftingLayout ? (
            <GradientTypeOptionCardPicker
              id={`${idPrefix}-type`}
              label="Gradient type"
              onValueChange={(value) =>
                onGradientChange({ ...gradient, type: value as GradientType })
              }
              value={gradient.type}
            />
          ) : (
            <SegmentedOptionPicker
              columns={2}
              hideLabel
              id={`${idPrefix}-type`}
              label="Gradient type"
              onValueChange={(value) =>
                onGradientChange({ ...gradient, type: value as GradientType })
              }
              options={GRADIENT_TYPES}
              value={gradient.type}
            />
          )}
          {isDotEnhanced ? (
            isDraftingLayout ? (
              <>
                <div className="space-y-4">
                  <EmbeddedColorPickerField
                    chrome="minimal"
                    label="Start color"
                    onValueChange={(value) =>
                      onGradientChange({
                        ...gradient,
                        colorStops: [
                          { ...gradient.colorStops[0], color: value },
                          gradient.colorStops[1],
                        ],
                      })
                    }
                    pickerChrome="drafting"
                    pickerClassName="mx-auto max-w-full"
                    size={320}
                    value={gradient.colorStops[0].color}
                  />
                  <EmbeddedColorPickerField
                    chrome="minimal"
                    label="End color"
                    onValueChange={(value) =>
                      onGradientChange({
                        ...gradient,
                        colorStops: [
                          gradient.colorStops[0],
                          { ...gradient.colorStops[1], color: value },
                        ],
                      })
                    }
                    pickerChrome="drafting"
                    pickerClassName="mx-auto max-w-full"
                    size={320}
                    value={gradient.colorStops[1].color}
                  />
                </div>
                <GradientOffsetRangeField
                  className="max-w-full"
                  hideHeader
                  id={`${idPrefix}-offset-range`}
                  endColor={gradient.colorStops[1].color}
                  endValue={gradientOffsetRange[1]}
                  label="Color stop range"
                  max={1}
                  min={0}
                  onValueChange={updateGradientOffsetRange}
                  startColor={gradient.colorStops[0].color}
                  startValue={gradientOffsetRange[0]}
                  step={0.01}
                  valueFormatter={(value) => value.toFixed(2)}
                />
                <KnobSliderField
                  className="mx-auto w-full max-w-fit"
                  id={`${idPrefix}-rotation`}
                  hideLabel
                  hideValue
                  label="Rotation"
                  max={360}
                  min={0}
                  onValueChange={(value) =>
                    onGradientChange({ ...gradient, rotation: degreesToRadians(value) })
                  }
                  value={rotationDegrees}
                  valueFormatter={(value) => `${Math.round(value)}°`}
                />
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "grid gap-4 md:grid-cols-2",
                    !isDashboardMode && "md:col-span-2",
                  )}
                >
                  <EmbeddedColorPickerField
                    chrome="minimal"
                    label="Start color"
                    onValueChange={(value) =>
                      onGradientChange({
                        ...gradient,
                        colorStops: [
                          { ...gradient.colorStops[0], color: value },
                          gradient.colorStops[1],
                        ],
                      })
                    }
                    value={gradient.colorStops[0].color}
                  />
                  <EmbeddedColorPickerField
                    chrome="minimal"
                    label="End color"
                    onValueChange={(value) =>
                      onGradientChange({
                        ...gradient,
                        colorStops: [
                          gradient.colorStops[0],
                          { ...gradient.colorStops[1], color: value },
                        ],
                      })
                    }
                    value={gradient.colorStops[1].color}
                  />
                </div>
                <div className={cn(!isDashboardMode && "md:col-span-2")}>
                  <GradientOffsetRangeField
                    className={cn(!isDashboardMode && "max-w-full")}
                    hideHeader
                    id={`${idPrefix}-offset-range`}
                    endColor={gradient.colorStops[1].color}
                    endValue={gradientOffsetRange[1]}
                    label="Color stop range"
                    max={1}
                    min={0}
                    onValueChange={updateGradientOffsetRange}
                    startColor={gradient.colorStops[0].color}
                    startValue={gradientOffsetRange[0]}
                    step={0.01}
                    valueFormatter={(value) => value.toFixed(2)}
                  />
                </div>
                <KnobSliderField
                  id={`${idPrefix}-rotation`}
                  hideLabel
                  hideValue
                  label="Rotation"
                  max={360}
                  min={0}
                  onValueChange={(value) =>
                    onGradientChange({ ...gradient, rotation: degreesToRadians(value) })
                  }
                  value={rotationDegrees}
                  valueFormatter={(value) => `${Math.round(value)}°`}
                />
              </>
            )
          ) : (
            <>
              <NumberField
                hideLabel
                id={`${idPrefix}-rotation`}
                label="Rotation"
                max={6.3}
                min={0}
                step={0.1}
                onValueChange={(value) =>
                  onGradientChange({ ...gradient, rotation: value })
                }
                value={gradient.rotation}
              />
              <ColorField
                chrome="minimal"
                id={`${idPrefix}-start-color`}
                isDashboardMode={isDashboardMode}
                label="Start color"
                onValueChange={(value) =>
                  onGradientChange({
                    ...gradient,
                    colorStops: [
                      { ...gradient.colorStops[0], color: value },
                      gradient.colorStops[1],
                    ],
                  })
                }
                value={gradient.colorStops[0].color}
              />
              <ColorField
                chrome="minimal"
                id={`${idPrefix}-end-color`}
                isDashboardMode={isDashboardMode}
                label="End color"
                onValueChange={(value) =>
                  onGradientChange({
                    ...gradient,
                    colorStops: [
                      gradient.colorStops[0],
                      { ...gradient.colorStops[1], color: value },
                    ],
                  })
                }
                value={gradient.colorStops[1].color}
              />
              <div className={cn(!isDashboardMode && "md:col-span-2")}>
                <GradientOffsetRangeField
                  hideHeader
                  id={`${idPrefix}-offset-range`}
                  endColor={gradient.colorStops[1].color}
                  endLabel="End"
                  endValue={gradientOffsetRange[1]}
                  label="Color stop range"
                  max={1}
                  min={0}
                  onValueChange={updateGradientOffsetRange}
                  startColor={gradient.colorStops[0].color}
                  startLabel="Start"
                  startValue={gradientOffsetRange[0]}
                  step={0.01}
                  valueFormatter={(value) => value.toFixed(2)}
                />
              </div>
            </>
          )}
        </FieldGroup>
      ) : null}
    </div>
  )
}

export function createDashboardAccordionOpenItemIds(selectedItemId: string) {
  return [selectedItemId]
}

export function ensureDashboardAccordionItemExpanded(
  openItemIds: string[],
  selectedItemId: string,
) {
  return openItemIds.includes(selectedItemId)
    ? openItemIds
    : [...openItemIds, selectedItemId]
}

export function applyDotsSolidColor(state: QrStudioState, color: string) {
  return {
    ...state,
    dotsColorMode: "solid" as const,
    dotsOptions: {
      ...state.dotsOptions,
      color,
    },
  }
}

export function applyDotsGradient(state: QrStudioState, gradient: StudioGradient) {
  return {
    ...state,
    dotsColorMode: "gradient" as const,
    dotsGradient: {
      ...gradient,
      enabled: true,
    },
  }
}

export function applyDotsPaletteSelection(state: QrStudioState) {
  return {
    ...state,
    dotsColorMode: "palette" as const,
  }
}

export function applyCornerSolidColor(
  state: QrStudioState,
  cornerKey: DashboardCornerColorKey,
  color: string,
) {
  if (cornerKey === "cornersSquare") {
    return {
      ...state,
      cornersSquareOptions: {
        ...state.cornersSquareOptions,
        color,
      },
      cornersSquareGradient: {
        ...state.cornersSquareGradient,
        enabled: false,
      },
    }
  }

  return {
    ...state,
    cornersDotOptions: {
      ...state.cornersDotOptions,
      color,
    },
    cornersDotGradient: {
      ...state.cornersDotGradient,
      enabled: false,
    },
  }
}

export function applyCornerGradient(
  state: QrStudioState,
  cornerKey: DashboardCornerColorKey,
  gradient: StudioGradient,
) {
  if (cornerKey === "cornersSquare") {
    return {
      ...state,
      cornersSquareGradient: {
        ...gradient,
        enabled: true,
      },
    }
  }

  return {
    ...state,
    cornersDotGradient: {
      ...gradient,
      enabled: true,
    },
  }
}

export function applyBackgroundSolidColor(state: QrStudioState, color: string) {
  return {
    ...state,
    backgroundOptions: {
      ...state.backgroundOptions,
      color,
      transparent: false,
    },
    backgroundGradient: {
      ...state.backgroundGradient,
      enabled: false,
    },
  }
}

export function applyBackgroundGradient(
  state: QrStudioState,
  gradient: StudioGradient,
) {
  return {
    ...state,
    backgroundOptions: {
      ...state.backgroundOptions,
      transparent: false,
    },
    backgroundGradient: {
      ...gradient,
      enabled: true,
    },
  }
}

export function applyBackgroundTransparentSelection(state: QrStudioState) {
  return {
    ...state,
    backgroundOptions: {
      ...state.backgroundOptions,
      transparent: true,
    },
    backgroundGradient: {
      ...state.backgroundGradient,
      enabled: false,
    },
  }
}

export function applyAssetNoneSelection(
  state: QrStudioState,
  assetKey: DashboardAssetKey,
) {
  return {
    ...state,
    [assetKey]: {
      presetColor: undefined,
      presetId: undefined,
      source: "none",
      value: undefined,
    },
  }
}

export function applyAssetUrlValue(
  state: QrStudioState,
  assetKey: DashboardAssetKey,
  value: string,
) {
  return {
    ...state,
    [assetKey]: {
      presetColor: undefined,
      presetId: undefined,
      source: "url",
      value,
    },
  }
}

export function applyLogoPresetSelection(
  state: QrStudioState,
  brandIcon: BrandIconEntry,
  value: string,
  presetColor: string,
) {
  return {
    ...state,
    logo: {
      presetColor,
      presetId: brandIcon.id as QrStudioState["logo"]["presetId"],
      source: "preset" as const,
      value,
    },
  }
}

export function applyLogoPresetColor(
  state: QrStudioState,
  value: string | undefined,
  presetColor: string,
) {
  return {
    ...state,
    logo: {
      ...state.logo,
      presetColor,
      source: "preset" as const,
      value,
    },
    logoGradient: {
      ...state.logoGradient,
      enabled: false,
    },
  }
}

export function applyLogoPresetGradient(
  state: QrStudioState,
  value: string | undefined,
  gradient: StudioGradient,
) {
  return {
    ...state,
    logo: {
      ...state.logo,
      source: "preset" as const,
      value,
    },
    logoGradient: {
      ...gradient,
      enabled: true,
    },
  }
}

function getBackgroundColorMode(state: QrStudioState): BackgroundColorMode {
  if (state.backgroundOptions.transparent) {
    return "transparent"
  }

  if (state.backgroundGradient.enabled) {
    return "gradient"
  }

  return "solid"
}

function useExpandedDashboardAccordionIds(selectedItemId: string) {
  return useState(() => createDashboardAccordionOpenItemIds(selectedItemId))
}

function NumberField({
  hideLabel = false,
  id,
  label,
  max,
  min,
  onValueChange,
  step = 1,
  value,
}: {
  hideLabel?: boolean
  id: string
  label: string
  max: number
  min: number
  onValueChange: (value: number) => void
  step?: number
  value: number
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id} className={cn(hideLabel && "sr-only")}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        type="number"
        max={max}
        min={min}
        step={step}
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
      />
    </Field>
  )
}

function GradientOffsetRangeField({
  className,
  endColor,
  endLabel = "End",
  endValue,
  hideHeader = false,
  id,
  label,
  max,
  min,
  onValueChange,
  startColor,
  startLabel = "Start",
  startValue,
  step,
  valueFormatter,
}: {
  className?: string
  endColor: string
  endLabel?: string
  endValue: number
  hideHeader?: boolean
  id: string
  label: string
  max: number
  min: number
  onValueChange: (value: [number, number]) => void
  startColor: string
  startLabel?: string
  startValue: number
  step: number
  valueFormatter: (value: number) => string
}) {
  const displayValues = normalizeGradientOffsetRange([startValue, endValue])
  const trackGradient = buildAdaptiveTrackGradient(startColor, endColor)

  return (
    <Field data-slot="gradient-offset-range-slider" className={className}>
      {!hideHeader ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <FieldLabel>{label}</FieldLabel>
          <div className="flex flex-wrap items-center gap-2">
            <GradientValueChip
              label={startLabel}
              value={valueFormatter(displayValues[0])}
            />
            <GradientValueChip
              label={endLabel}
              value={valueFormatter(displayValues[1])}
            />
          </div>
        </div>
      ) : (
        <FieldLabel className="sr-only">{label}</FieldLabel>
      )}
      <UnlumenSlider
        className="w-full"
        data-slot="gradient-offset-slider"
        formatValue={valueFormatter}
        id={id}
        label={label}
        max={max}
        min={min}
        onChange={(nextValue) => {
          if (!Array.isArray(nextValue) || nextValue.length < 2) {
            return
          }

          onValueChange(
            normalizeGradientOffsetRange([
              nextValue[0] ?? min,
              nextValue[1] ?? max,
            ]),
          )
        }}
        rangeClassName="bg-transparent"
        rangeStyle={{ backgroundColor: "transparent" }}
        renderThumb={(index, state) => (
          <GradientSliderThumb
            accentColor={index === 0 ? startColor : endColor}
            isActive={state.isActive}
          />
        )}
        showValue={false}
        step={step}
        thumbDataSlot="gradient-offset-thumb"
        trackDataSlot="gradient-offset-track"
        trackStyle={{ background: trackGradient }}
        value={displayValues}
      />
    </Field>
  )
}

function GradientSliderThumb({
  accentColor,
  isActive = false,
}: {
  accentColor: string
  isActive?: boolean
}) {
  return (
    <span
      className={cn(
        "flex size-[18px] items-center justify-center rounded-[4px] border border-black/10 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.06)] transition-transform",
        isActive && "scale-105",
      )}
    >
      <span
        className="size-2.5 rounded-[2px] border border-black/10"
        style={{ backgroundColor: accentColor }}
      />
    </span>
  )
}

function GradientValueChip({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground">{label}</span>
      <span>{value}</span>
    </span>
  )
}

function KnobSliderField({
  className,
  hideLabel = false,
  hideValue = false,
  id,
  label,
  max,
  min,
  onValueChange,
  value,
  valueFormatter,
}: {
  className?: string
  hideLabel?: boolean
  hideValue?: boolean
  id: string
  label: string
  max: number
  min: number
  onValueChange: (value: number) => void
  value: number
  valueFormatter: (value: number) => string
}) {
  return (
    <Field className={className}>
      {!hideLabel || !hideValue ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <FieldLabel htmlFor={id} className={cn(hideLabel && "sr-only")}>
            {label}
          </FieldLabel>
          {!hideValue ? (
            <span className="font-mono text-xs text-muted-foreground">
              {valueFormatter(value)}
            </span>
          ) : null}
        </div>
      ) : (
        <FieldLabel htmlFor={id} className="sr-only">
          {label}
        </FieldLabel>
      )}
      <div className="flex justify-center">
        <KnobSlider
          max={max}
          min={min}
          onChange={onValueChange}
          size={132}
          value={Math.round(value)}
        />
      </div>
    </Field>
  )
}

function GradientTypeOptionCardPicker({
  id,
  label,
  onValueChange,
  value,
}: {
  id: string
  label: string
  onValueChange: (value: string) => void
  value: string
}) {
  const labelId = `${id}-label`

  return (
    <Field>
      <FieldLabel id={labelId} className="sr-only">
        {label}
      </FieldLabel>
      <div
        aria-labelledby={labelId}
        className="grid grid-cols-2 justify-items-center gap-x-2 gap-y-3"
        data-slot="gradient-type-option-grid"
        id={id}
        role="radiogroup"
      >
        {GRADIENT_TYPES.map((option) => (
          <OptionCard
            key={option.value}
            checked={option.value === value}
            label={option.label}
            name={id}
            onSelect={() => onValueChange(option.value)}
            size="compact"
            value={option.value}
          >
            <GradientTypePreview type={option.value} />
          </OptionCard>
        ))}
      </div>
    </Field>
  )
}

function GradientTypePreview({ type }: { type: GradientType }) {
  return (
    <div className="flex size-full items-center justify-center">
      <HugeiconsIcon
        aria-hidden="true"
        color="#111111"
        icon={type === "radial" ? RadiusIcon : StraightEdgeIcon}
        size={24}
        strokeWidth={1.9}
      />
    </div>
  )
}

export function EmbeddedColorPickerField({
  chrome = "default",
  className,
  label,
  onValueChange,
  pickerChrome,
  pickerClassName,
  size,
  value,
}: {
  chrome?: "default" | "minimal"
  className?: string
  label: string
  onValueChange: (value: string) => void
  pickerChrome?: "default" | "embedded" | "drafting"
  pickerClassName?: string
  size?: number
  value: string
}) {
  const isMinimal = chrome === "minimal"

  return (
    <Field className={className}>
      {!isMinimal ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <FieldLabel>{label}</FieldLabel>
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
        </div>
      ) : (
        <FieldLabel className="sr-only">{label}</FieldLabel>
      )}
      <ColorPicker
        className={pickerClassName}
        chrome={pickerChrome ?? "embedded"}
        onColorChange={onValueChange}
        size={size ?? 320}
        value={value}
      />
    </Field>
  )
}

function VisualStylePicker({
  id,
  label,
  onValueChange,
  options,
  previewKind,
  value,
}: {
  id: string
  label: string
  onValueChange: (value: string) => void
  options: StyleOption[]
  previewKind: StylePreviewKind
  value: string
}) {
  const labelId = `${id}-label`

  return (
    <Field>
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <div
        aria-labelledby={labelId}
        className="grid grid-cols-2 gap-2"
        data-slot="style-picker"
        id={id}
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.4rem] px-4 py-4 text-center transition-colors",
                isSelected
                  ? "border border-white/10 bg-white/[0.07] text-foreground"
                  : "border border-transparent bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/78",
              )}
              >
              <input
                aria-label={option.label}
                checked={isSelected}
                className="sr-only"
                name={id}
                onChange={() => onValueChange(option.value)}
                type="radio"
                value={option.value}
              />
              <StylePreview previewKind={previewKind} value={option.value} />
              <span className={cn("text-xs leading-tight", isSelected && "text-foreground")}>
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </Field>
  )
}

function SegmentedOptionPicker({
  columns = 3,
  hideLabel = false,
  id,
  isStacked,
  label,
  onValueChange,
  options,
  value,
}: {
  columns?: 2 | 3
  hideLabel?: boolean
  id: string
  isStacked?: boolean
  label: string
  onValueChange: (value: string) => void
  options: StyleOption[]
  value: string
}) {
  const labelId = `${id}-label`

  return (
    <Field>
      <FieldLabel id={labelId} className={cn(hideLabel && "sr-only")}>
        {label}
      </FieldLabel>
      <div
        aria-labelledby={labelId}
        className={cn(
          "grid gap-2",
          isStacked ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : "grid-cols-3",
        )}
        data-slot="segmented-picker"
        id={id}
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-2.5 text-center text-sm transition-colors",
                isSelected
                  ? "border-white/10 bg-white/[0.07] text-foreground shadow-none"
                  : "border-transparent bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/78",
              )}
            >
              <input
                aria-label={option.label}
                checked={isSelected}
                className="sr-only"
                name={id}
                onChange={() => onValueChange(option.value)}
                type="radio"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </Field>
  )
}

function BrandIconPicker({
  brandIconQuery,
  filteredBrandIcons,
  onBrandIconCategoryChange,
  onBrandIconQueryChange,
  onSelect,
  popularBrandIcons,
  selectedBrandIconId,
  selectedCategory = "all",
  showCategoryFilter = false,
  showPopular = true,
}: {
  brandIconQuery: string
  filteredBrandIcons: readonly BrandIconEntry[]
  onBrandIconCategoryChange?: (value: BrandIconCategoryFilter) => void
  onBrandIconQueryChange: (value: string) => void
  onSelect: (brandIcon: BrandIconEntry) => void
  popularBrandIcons: readonly BrandIconEntry[]
  selectedBrandIconId?: string
  selectedCategory?: BrandIconCategoryFilter
  showCategoryFilter?: boolean
  showPopular?: boolean
}) {
  return (
    <div data-slot="brand-icon-picker" className="space-y-4">
      {showCategoryFilter ? (
        <Field>
          <FieldLabel id="brand-icon-category-label">Icon category</FieldLabel>
          <div
            aria-labelledby="brand-icon-category-label"
            className="flex flex-wrap gap-2"
            data-slot="brand-icon-category-picker"
            role="radiogroup"
          >
            {BRAND_ICON_CATEGORY_OPTIONS.map((option) => {
              const isSelected = option.value === selectedCategory

              return (
                <label
                  key={option.value}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-2 text-sm transition-colors",
                    isSelected
                      ? "border-white/10 bg-white/[0.07] text-foreground shadow-none"
                      : "border-transparent bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/78",
                  )}
                >
                  <input
                    aria-label={option.label}
                    checked={isSelected}
                    className="sr-only"
                    name="brand-icon-category"
                    onChange={() => onBrandIconCategoryChange?.(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span>{option.label}</span>
                </label>
              )
            })}
          </div>
        </Field>
      ) : null}

      <Field>
        <FieldLabel htmlFor="brand-icon-search">Search brand icons</FieldLabel>
        <Input
          id="brand-icon-search"
          placeholder="Search brand icons"
          value={brandIconQuery}
          onChange={(event) => onBrandIconQueryChange(event.target.value)}
        />
      </Field>

      {showPopular ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Popular</p>
          <div
            data-slot="brand-icon-popular-row"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
          >
            {popularBrandIcons.map((brandIcon) => (
              <BrandIconOption
                brandIcon={brandIcon}
                isSelected={brandIcon.id === selectedBrandIconId}
                key={brandIcon.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {showCategoryFilter && selectedCategory !== "all"
            ? `${BRAND_ICON_CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)?.label ?? "Selected"} icons`
            : "All brand icons"}
        </p>
        <div
          data-slot="brand-icon-grid"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
        >
          {filteredBrandIcons.map((brandIcon) => (
            <BrandIconOption
              brandIcon={brandIcon}
              isSelected={brandIcon.id === selectedBrandIconId}
              key={brandIcon.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function BrandIconOption({
  brandIcon,
  isSelected,
  onSelect,
}: {
  brandIcon: BrandIconEntry
  isSelected: boolean
  onSelect: (brandIcon: BrandIconEntry) => void
}) {
  const Icon = brandIcon.icon

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-auto min-h-20 flex-col items-start gap-2 rounded-[1rem] border-border/60 px-3 py-3 text-left",
        isSelected && "border-foreground/40 bg-accent/60",
      )}
      onClick={() => onSelect(brandIcon)}
    >
      <Icon className="size-5" />
      <span className="line-clamp-2 text-xs font-medium leading-snug">{brandIcon.label}</span>
    </Button>
  )
}

function SelectField({
  id,
  label,
  onValueChange,
  options,
  value,
}: {
  id: string
  label: string
  onValueChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
