"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"

import FileUpload from "@/components/kokonutui/file-upload"
import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs"
import { MotionAccordion } from "@/components/unlumen-ui/motion-accordion"
import { Button } from "@/components/ui/button"
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
import { ColorPaletteCard } from "@/components/ui/color-palette-card"
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
import { AdaptiveOffsetRangeSlider } from "@/components/ui/adaptive-slider"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
  degreesToRadians,
  normalizeGradientOffsetRange,
  radiansToDegrees,
} from "@/components/qr/qr-gradient-controls"
import type { QrEditorSectionId } from "@/components/qr/qr-sections"
import type {
  AssetSourceMode,
  DotsColorMode,
  QrStudioState,
  StudioDotType,
  StudioGradient,
} from "@/components/qr/qr-studio-state"
import { hasBackgroundImage } from "@/components/qr/qr-studio-state"

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
type BackgroundColorMode = "solid" | "gradient" | "transparent"
type GradientEditorVariant = "default" | "dot-enhanced"

const DRAW_TYPES: Array<{ label: string; value: DrawType }> = [
  { label: "SVG", value: "svg" },
  { label: "Canvas", value: "canvas" },
]

const DOT_TYPES: Array<{ label: string; value: StudioDotType }> = [
  { label: "Rounded", value: "rounded" },
  { label: "Square", value: "square" },
  { label: "Dots", value: "dots" },
  { label: "Classy", value: "classy" },
  { label: "Classy rounded", value: "classy-rounded" },
  { label: "Extra rounded", value: "extra-rounded" },
  { label: "Diamond", value: "diamond" },
  { label: "Heart", value: "heart" },
]

const CORNER_SQUARE_TYPES: Array<{ label: string; value: CornerSquareType }> = [
  { label: "Extra rounded", value: "extra-rounded" },
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Dots", value: "dots" },
  { label: "Classy", value: "classy" },
  { label: "Classy rounded", value: "classy-rounded" },
  { label: "Dot", value: "dot" },
]

const CORNER_DOT_TYPES: Array<{ label: string; value: CornerDotType }> = [
  { label: "Dot", value: "dot" },
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Dots", value: "dots" },
  { label: "Classy", value: "classy" },
  { label: "Classy rounded", value: "classy-rounded" },
  { label: "Extra rounded", value: "extra-rounded" },
]

const QR_MODES: Array<{ label: string; value: Mode }> = [
  { label: "Byte", value: "Byte" },
  { label: "Alphanumeric", value: "Alphanumeric" },
  { label: "Numeric", value: "Numeric" },
  { label: "Kanji", value: "Kanji" },
]

const TYPE_NUMBERS: Array<{ label: string; value: TypeNumber }> = [
  { label: "Auto", value: 0 },
  ...Array.from({ length: 40 }, (_, index) => ({
    label: String(index + 1),
    value: (index + 1) as TypeNumber,
  })),
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
  const [activeCornerSquareTab, setActiveCornerSquareTab] =
    useState<StyleSettingsTabId>(initialCornerSquareTab)
  const [activeCornerDotTab, setActiveCornerDotTab] =
    useState<StyleSettingsTabId>(initialCornerDotTab)
  const contentError = state.data.trim() ? null : "Add text or a URL to encode"
  const activeCustomDotShape = getActiveCustomDotShape(state.dotsOptions.type)
  const backgroundImageActive = hasBackgroundImage(state)
  const backgroundColorMode = getBackgroundColorMode(state)
  const isDashboardMode = activeSection !== undefined
  const isDashboardStyleSection = activeSection === "style"
  const isDashboardBackgroundSection = activeSection === "background"
  const isDashboardCornerSquareSection = activeSection === "corner-square"
  const isDashboardCornerDotSection = activeSection === "corner-dot"
  const stackClassName = isDashboardMode ? "gap-3" : "grid gap-4 md:grid-cols-2"
  const encodingStackClassName = isDashboardMode ? "gap-3" : "grid gap-4 md:grid-cols-3"
  const dashboardTopTabListClassName =
    "mx-auto w-fit border border-border/60 bg-background/35 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
  const dashboardTopTabContainerClassName = "items-center gap-4"
  const dashboardTopTabClassName =
    "justify-center px-4 py-2 text-sm text-foreground/72 hover:text-foreground data-[active=true]:text-background"

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
          className={cn("flex flex-col", contentClassName)}
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
      options={DOT_TYPES}
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
      options={DOT_TYPES}
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
      label="Solid color"
      onValueChange={(value) =>
        setState((current) => ({
          ...current,
          dotsOptions: { ...current.dotsOptions, color: value },
        }))
      }
      value={state.dotsOptions.color}
    />
  )

  const paletteDotColorControl = (
    <DotsPaletteCard
      isDashboardMode={isDashboardMode}
      palette={state.dotsPalette}
    />
  )

  const gradientDotColorControl = (
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
  )

  const dashboardDotColorAccordion = (
    <MotionAccordion
      allowCollapse={false}
      gap={0}
      openItemId={state.dotsColorMode}
      onOpenItemChange={(value) => {
        if (!value) return

        setState((current) => ({
          ...current,
          dotsColorMode: value as DotsColorMode,
        }))
      }}
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
      options={CORNER_SQUARE_TYPES}
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
      options={CORNER_SQUARE_TYPES}
      value={state.cornersSquareOptions.type}
    />
  )

  const dashboardCornerSquareColorAccordion = (
    <MotionAccordion
      allowCollapse={false}
      gap={0}
      openItemId={state.cornersSquareGradient.enabled ? "gradient" : "solid"}
      onOpenItemChange={(value) => {
        if (!value) return

        setState((current) => ({
          ...current,
          cornersSquareGradient: {
            ...current.cornersSquareGradient,
            enabled: value === "gradient",
          },
        }))
      }}
      variant="settings"
      items={[
        {
          id: "solid",
          title: "Solid",
          content: (
            <EmbeddedColorPickerField
              label="Solid color"
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
              onGradientChange={(gradient) =>
                setState((current) => ({
                  ...current,
                  cornersSquareGradient: { ...gradient, enabled: true },
                }))
              }
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
      options={CORNER_DOT_TYPES}
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
      options={CORNER_DOT_TYPES}
      value={state.cornersDotOptions.type}
    />
  )

  const dashboardCornerDotColorAccordion = (
    <MotionAccordion
      allowCollapse={false}
      gap={0}
      openItemId={state.cornersDotGradient.enabled ? "gradient" : "solid"}
      onOpenItemChange={(value) => {
        if (!value) return

        setState((current) => ({
          ...current,
          cornersDotGradient: {
            ...current.cornersDotGradient,
            enabled: value === "gradient",
          },
        }))
      }}
      variant="settings"
      items={[
        {
          id: "solid",
          title: "Solid",
          content: (
            <EmbeddedColorPickerField
              label="Solid color"
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
              onGradientChange={(gradient) =>
                setState((current) => ({
                  ...current,
                  cornersDotGradient: { ...gradient, enabled: true },
                }))
              }
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
        allowCollapse={false}
        gap={0}
        openItemId={backgroundColorMode}
        onOpenItemChange={(value) => {
          if (!value || backgroundImageActive) return

          setState((current) => ({
            ...current,
            backgroundOptions: {
              ...current.backgroundOptions,
              transparent: value === "transparent",
            },
            backgroundGradient: {
              ...current.backgroundGradient,
              enabled: value === "gradient",
            },
          }))
        }}
        variant="settings"
        items={[
          {
            id: "solid",
            title: "Solid",
            content: (
              <EmbeddedColorPickerField
                className={cn(backgroundImageActive && "pointer-events-none opacity-50")}
                label="Solid color"
                onValueChange={(value) =>
                  setState((current) => ({
                    ...current,
                    backgroundOptions: {
                      ...current.backgroundOptions,
                      color: value,
                    },
                  }))
                }
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
                onGradientChange={(gradient) =>
                  setState((current) => ({
                    ...current,
                    backgroundGradient: { ...gradient, enabled: true },
                  }))
                }
                title="Background gradient"
                variant="dot-enhanced"
              />
            ),
          },
          {
            id: "transparent",
            title: "Transparent",
            content: null,
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
      allowCollapse={false}
      gap={0}
      openItemId={backgroundSourceMode}
      onOpenItemChange={(value) => {
        if (!value) return

        onBackgroundModeChange(value as AssetSourceMode)
      }}
      variant="settings"
      items={[
        {
          id: "none",
          title: "None",
          content: null,
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
                  setState((current) => ({
                    ...current,
                    backgroundImage: {
                      source: "url",
                      value: event.target.value,
                    },
                  }))
                }
              />
            </Field>
          ),
        },
      ]}
    />
  )

  const dashboardLogoSourceAccordion = (
    <MotionAccordion
      allowCollapse={false}
      gap={0}
      openItemId={logoSourceMode}
      onOpenItemChange={(value) => {
        if (!value) return

        onLogoModeChange(value as AssetSourceMode)
      }}
      variant="settings"
      items={[
        {
          id: "none",
          title: "None",
          content: null,
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
                  setState((current) => ({
                    ...current,
                    logo: {
                      source: "url",
                      value: event.target.value,
                    },
                  }))
                }
              />
            </Field>
          ),
        },
      ]}
    />
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

            <FieldGroup className={stackClassName}>
              <SelectField
                id="qr-draw-type"
                label="Render type"
                onValueChange={(value) =>
                  setState((current) => ({ ...current, type: value as DrawType }))
                }
                options={DRAW_TYPES}
                value={state.type}
              />
              <NumberField
                id="qr-margin"
                label="Outer margin"
                max={80}
                min={0}
                onValueChange={(value) =>
                  setState((current) => ({ ...current, margin: value }))
                }
                value={state.margin}
              />
              <NumberField
                id="qr-width"
                label="Width"
                max={1200}
                min={120}
                onValueChange={(value) =>
                  setState((current) => ({ ...current, width: value }))
                }
                value={state.width}
              />
              <NumberField
                id="qr-height"
                label="Height"
                max={1200}
                min={120}
                onValueChange={(value) =>
                  setState((current) => ({ ...current, height: value }))
                }
                value={state.height}
              />
            </FieldGroup>
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
                  bubbleClassName="bg-foreground text-background mix-blend-normal shadow-none"
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
              bubbleClassName="bg-foreground text-background mix-blend-normal shadow-none"
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
              bubbleClassName="bg-foreground text-background mix-blend-normal shadow-none"
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
                bubbleClassName="bg-foreground text-background mix-blend-normal shadow-none"
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
                      backgroundImage: { source: "none", value: undefined },
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
                dashboardLogoSourceAccordion
              ) : (
                <>
                  <SelectField
                    id="logo-source-mode"
                    label="Logo source"
                    onValueChange={(value) => onLogoModeChange(value as AssetSourceMode)}
                    options={LOGO_MODES}
                    value={logoSourceMode}
                  />

                  {logoSourceMode === "url" ? (
                    <Field>
                      <FieldLabel htmlFor="logo-url">Remote logo URL</FieldLabel>
                      <Input
                        id="logo-url"
                        placeholder="https://example.com/logo.png"
                        value={state.logo.value ?? ""}
                        onChange={(event) =>
                          setState((current) => ({
                            ...current,
                            logo: {
                              source: "url",
                              value: event.target.value,
                            },
                          }))
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
                        setState((current) => ({
                          ...current,
                          logo: { source: "none", value: undefined },
                        }))
                      }}
                    >
                      <XIcon data-icon="inline-start" />
                      Remove logo
                    </Button>
                  ) : null}
                </>
              )}

              <Field>
                <FieldLabel htmlFor="logo-size">Logo size</FieldLabel>
                <Slider
                  id="logo-size"
                  max={0.5}
                  min={0.1}
                  step={0.01}
                  value={[state.imageOptions.imageSize]}
                  onValueChange={([value]) =>
                    setState((current) => ({
                      ...current,
                      imageOptions: { ...current.imageOptions, imageSize: value },
                    }))
                  }
                />
                {isDashboardMode ? (
                  <p className="font-mono text-xs text-muted-foreground">
                    {(state.imageOptions.imageSize * 100).toFixed(0)}% of the QR width
                  </p>
                ) : (
                  <FieldDescription>
                    {(state.imageOptions.imageSize * 100).toFixed(0)}% of the QR width
                  </FieldDescription>
                )}
              </Field>

              <NumberField
                id="logo-margin"
                label="Logo margin"
                max={40}
                min={0}
                onValueChange={(value) =>
                  setState((current) => ({
                    ...current,
                    imageOptions: { ...current.imageOptions, margin: value },
                  }))
                }
                value={state.imageOptions.margin}
              />

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
              options={[
                { label: "L", value: "L" },
                { label: "M", value: "M" },
                { label: "Q", value: "Q" },
                { label: "H", value: "H" },
              ]}
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
  disabled,
  id,
  isDashboardMode,
  label,
  onValueChange,
  value,
}: {
  disabled?: boolean
  id: string
  isDashboardMode?: boolean
  label: string
  onValueChange: (value: string) => void
  value: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        disabled={disabled}
        type="color"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="h-11 p-1"
      />
      {isDashboardMode ? (
        <p className="font-mono text-xs text-muted-foreground">{value}</p>
      ) : (
        <FieldDescription>{value}</FieldDescription>
      )}
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
        <Button variant="ghost" className="self-start" onClick={onRemove}>
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

function GradientEditor({
  disabled,
  disabledText,
  gradient,
  hideToggle,
  idPrefix,
  isDashboardMode,
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
  onGradientChange: (gradient: StudioGradient) => void
  title: string
  variant?: GradientEditorVariant
}) {
  const isDotEnhanced = variant === "dot-enhanced"
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
          : "rounded-[var(--radius-xl)] border border-border/70 bg-muted/20 p-4",
      )}
    >
      {hideToggle ? (
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">{title}</p>
          {!isDashboardMode ? (
            <p className="text-sm text-muted-foreground">
              Adjust the two-stop gradient for this region.
            </p>
          ) : null}
        </div>
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
        <FieldGroup className={cn("mt-4", isDashboardMode ? "gap-3" : "grid gap-4 md:grid-cols-2")}>
          <SelectField
            id={`${idPrefix}-type`}
            label="Gradient type"
            onValueChange={(value) =>
              onGradientChange({ ...gradient, type: value as GradientType })
            }
            options={GRADIENT_TYPES}
            value={gradient.type}
          />
          {isDotEnhanced ? (
            <>
              <KnobSliderField
                id={`${idPrefix}-rotation`}
                label="Rotation"
                max={360}
                min={0}
                onValueChange={(value) =>
                  onGradientChange({ ...gradient, rotation: degreesToRadians(value) })
                }
                value={rotationDegrees}
                valueFormatter={(value) => `${Math.round(value)}°`}
              />
              <div className={cn("grid gap-4 md:grid-cols-2", !isDashboardMode && "md:col-span-2")}>
                <EmbeddedColorPickerField
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
                <AdaptiveOffsetRangeSlider
                  className={cn(!isDashboardMode && "max-w-full")}
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
            </>
          ) : (
            <>
              <NumberField
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
                <OffsetRangeSliderField
                  id={`${idPrefix}-offset-range`}
                  endLabel="End"
                  endValue={gradientOffsetRange[1]}
                  label="Color stop range"
                  max={1}
                  min={0}
                  onValueChange={updateGradientOffsetRange}
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

function DotsPaletteCard({
  isDashboardMode,
  palette,
}: {
  isDashboardMode?: boolean
  palette: string[]
}) {
  const paletteLabel = `${palette.length} ${palette.length === 1 ? "swatch" : "swatches"}`
  const cardColors = palette.map((color) => color.replace(/^#/, ""))

  return (
    <div
      data-slot="dots-palette-card"
      className={cn(
        isDashboardMode
          ? "border-0 bg-transparent p-0"
          : "rounded-[var(--radius-xl)] border border-border/70 bg-muted/20 p-4",
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">Palette preview</p>
        <p className="text-sm text-muted-foreground">
          Dot coloring rotates through the active palette in a fixed order.
        </p>
      </div>

      <div className="mt-4 flex min-h-[232px] w-full items-center justify-center">
        <ColorPaletteCard colors={cardColors} statsText={paletteLabel} />
      </div>
    </div>
  )
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

function NumberField({
  id,
  label,
  max,
  min,
  onValueChange,
  step = 1,
  value,
}: {
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
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
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

function OffsetRangeSliderField({
  className,
  endLabel,
  endValue,
  id,
  label,
  max,
  min,
  onValueChange,
  startLabel,
  startValue,
  step,
  valueFormatter,
}: {
  className?: string
  endLabel: string
  endValue: number
  id: string
  label: string
  max: number
  min: number
  onValueChange: (value: [number, number]) => void
  startLabel: string
  startValue: number
  step: number
  valueFormatter: (value: number) => string
}) {
  const displayValues = normalizeGradientOffsetRange([startValue, endValue])

  return (
    <Field className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <span className="font-mono text-xs text-muted-foreground">
          {valueFormatter(displayValues[0])} - {valueFormatter(displayValues[1])}
        </span>
      </div>
      <Slider
        id={id}
        max={max}
        min={min}
        onValueChange={(nextValue) => {
          if (nextValue.length < 2) {
            return
          }

          onValueChange([nextValue[0] ?? min, nextValue[1] ?? max])
        }}
        step={step}
        value={displayValues}
      />
      <div className="mt-2 flex items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
        <span>
          {startLabel}: {valueFormatter(displayValues[0])}
        </span>
        <span>
          {endLabel}: {valueFormatter(displayValues[1])}
        </span>
      </div>
    </Field>
  )
}

function KnobSliderField({
  id,
  label,
  max,
  min,
  onValueChange,
  value,
  valueFormatter,
}: {
  id: string
  label: string
  max: number
  min: number
  onValueChange: (value: number) => void
  value: number
  valueFormatter: (value: number) => string
}) {
  return (
    <Field>
      <div className="mb-2 flex items-center justify-between gap-3">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <span className="font-mono text-xs text-muted-foreground">
          {valueFormatter(value)}
        </span>
      </div>
      <div className="flex justify-center rounded-[var(--radius-xl)] border border-border/70 bg-background/80 p-3">
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

function EmbeddedColorPickerField({
  className,
  label,
  onValueChange,
  value,
}: {
  className?: string
  label: string
  onValueChange: (value: string) => void
  value: string
}) {
  return (
    <Field className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <FieldLabel>{label}</FieldLabel>
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      </div>
      <div className="flex justify-center rounded-[var(--radius-xl)] border border-border/70 bg-background/80 p-3">
        <ColorPicker
          onColorChange={onValueChange}
          size={320}
          value={value}
        />
      </div>
    </Field>
  )
}

function VisualStylePicker({
  id,
  label,
  onValueChange,
  options,
  value,
}: {
  id: string
  label: string
  onValueChange: (value: string) => void
  options: StyleOption[]
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
                "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center transition-colors",
                isSelected
                  ? "border-primary bg-primary/8 text-foreground shadow-sm"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/35",
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
              <StylePreview value={option.value} />
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
  id,
  isStacked,
  label,
  onValueChange,
  options,
  value,
}: {
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
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <div
        aria-labelledby={labelId}
        className={cn("grid gap-2", isStacked ? "grid-cols-1" : "grid-cols-3")}
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
                "cursor-pointer rounded-xl border px-3 py-3 text-center text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary/8 text-foreground shadow-sm"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/35",
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

function StylePreview({ value }: { value: string }) {
  return (
    <svg
      aria-hidden="true"
      className="size-12 text-foreground/80"
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <PreviewShape size={12} value={value} x={8} y={8} />
      <PreviewShape size={12} value={value} x={28} y={8} />
      <PreviewShape size={12} value={value} x={18} y={28} />
    </svg>
  )
}

function PreviewShape({
  size,
  value,
  x,
  y,
}: {
  size: number
  value: string
  x: number
  y: number
}) {
  switch (value) {
    case "dots":
    case "dot":
      return (
        <circle
          cx={x + size / 2}
          cy={y + size / 2}
          fill="currentColor"
          r={size / 2}
        />
      )
    case "rounded":
      return (
        <rect
          fill="currentColor"
          height={size}
          rx={3.5}
          width={size}
          x={x}
          y={y}
        />
      )
    case "extra-rounded":
      return (
        <rect
          fill="currentColor"
          height={size}
          rx={5.5}
          width={size}
          x={x}
          y={y}
        />
      )
    case "diamond":
      return (
        <path
          d={`M ${x + size / 2} ${y} L ${x + size} ${y + size / 2} L ${x + size / 2} ${y + size} L ${x} ${y + size / 2} Z`}
          fill="currentColor"
        />
      )
    case "heart":
      return (
        <path
          d={buildHeartPath(x, y, size)}
          fill="currentColor"
        />
      )
    case "classy":
      return (
        <path
          d={`M ${x + 2} ${y} H ${x + size} V ${y + size - 2} Q ${x + size - 1} ${y + 1} ${x + 2} ${y + size - 2} Z`}
          fill="currentColor"
        />
      )
    case "classy-rounded":
      return (
        <path
          d={`M ${x + 3} ${y} H ${x + size - 2} Q ${x + size} ${y} ${x + size} ${y + 2} V ${y + size - 3} Q ${x + size - 2} ${y + size} ${x + size - 4} ${y + size} H ${x + 5} Q ${x + 1} ${y + size} ${x + 1} ${y + size - 4} V ${y + 3} Q ${x + 1} ${y + 1} ${x + 3} ${y} Z`}
          fill="currentColor"
        />
      )
    case "square":
    default:
      return (
        <rect
          fill="currentColor"
          height={size}
          rx={1.5}
          width={size}
          x={x}
          y={y}
        />
      )
  }
}

function buildHeartPath(x: number, y: number, size: number) {
  const top = y + size * 0.25
  const bottom = y + size
  const left = x
  const right = x + size
  const center = x + size / 2

  return [
    `M ${center} ${bottom}`,
    `C ${center - size * 0.55} ${y + size * 0.62}, ${left} ${y + size * 0.35}, ${left} ${top}`,
    `C ${left} ${y - size * 0.02}, ${center - size * 0.18} ${y - size * 0.04}, ${center} ${y + size * 0.2}`,
    `C ${center + size * 0.18} ${y - size * 0.04}, ${right} ${y - size * 0.02}, ${right} ${top}`,
    `C ${right} ${y + size * 0.35}, ${center + size * 0.55} ${y + size * 0.62}, ${center} ${bottom}`,
    "Z",
  ].join(" ")
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
