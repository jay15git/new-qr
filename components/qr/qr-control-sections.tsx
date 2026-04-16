"use client"

import { ImagePlusIcon, UploadIcon, XIcon } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { QrEditorSectionId } from "@/components/qr/qr-sections"
import type {
  QrStudioState,
  StudioDotType,
  StudioGradient,
} from "@/components/qr/qr-studio-state"

export type LogoSourceMode = "none" | "url" | "upload"

type QrControlSectionsProps = {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  logoSourceMode: LogoSourceMode
  onLogoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onLogoModeChange: (mode: LogoSourceMode) => void
  onPickLogoFile: () => void
  setState: React.Dispatch<React.SetStateAction<QrStudioState>>
  state: QrStudioState
  activeSection?: QrEditorSectionId
}

type StyleOption = {
  label: string
  value: string
}

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

const LOGO_MODES: Array<{ label: string; value: LogoSourceMode }> = [
  { label: "No logo", value: "none" },
  { label: "Remote URL", value: "url" },
  { label: "Upload file", value: "upload" },
]

export function QrControlSections({
  fileInputRef,
  logoSourceMode,
  onLogoFileChange,
  onLogoModeChange,
  onPickLogoFile,
  setState,
  state,
  activeSection,
}: QrControlSectionsProps) {
  const contentError = state.data.trim() ? null : "Add text or a URL to encode"
  const activeCustomDotShape = getActiveCustomDotShape(state.dotsOptions.type)
  const isDashboardMode = activeSection !== undefined
  const sectionCardClassName = isDashboardMode
    ? "gap-3 bg-transparent py-0 ring-0 shadow-none"
    : undefined
  const sectionHeaderClassName = isDashboardMode ? "gap-1 px-0" : undefined
  const sectionContentClassName = isDashboardMode ? "px-0" : undefined
  const sectionDescriptionClassName = isDashboardMode ? "text-xs leading-5" : undefined

  const showsSection = (section: QrEditorSectionId) =>
    activeSection === undefined || activeSection === section

  return (
    <div className={cn("flex flex-col", isDashboardMode ? "gap-3" : "gap-4")}>
      {showsSection("content") ? (
        <Card className={sectionCardClassName} size={isDashboardMode ? "sm" : "default"}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle>Content</CardTitle>
          <CardDescription className={sectionDescriptionClassName}>
            Set the encoded value, renderer, and output dimensions.
          </CardDescription>
        </CardHeader>
        <CardContent className={sectionContentClassName}>
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
              <FieldDescription>
                The value you enter here is encoded directly into the QR code.
              </FieldDescription>
              {contentError ? <FieldError>{contentError}</FieldError> : null}
            </Field>

            <FieldGroup className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>
      ) : null}

      {showsSection("style") ? (
        <Card className={sectionCardClassName} size={isDashboardMode ? "sm" : "default"}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle>{isDashboardMode ? "Style" : "Dots"}</CardTitle>
          <CardDescription className={sectionDescriptionClassName}>
            Shape the main QR modules and optionally apply a gradient.
          </CardDescription>
        </CardHeader>
          <CardContent className={cn(sectionContentClassName, "flex flex-col gap-4")}>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
            {isDashboardMode ? (
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
            )}
            <ColorField
              id="dots-color"
              label="Solid color"
              onValueChange={(value) =>
                setState((current) => ({
                  ...current,
                  dotsOptions: { ...current.dotsOptions, color: value },
                }))
              }
              value={state.dotsOptions.color}
            />
          </FieldGroup>

          {activeCustomDotShape && state.type !== "svg" ? (
            <p className="text-sm text-muted-foreground">
              Custom dot shapes currently render only in SVG mode.
            </p>
          ) : null}

          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="dots-round-size">Round dot sizes</FieldLabel>
              <FieldDescription>
                Keeps SVG output visually softer by rounding dot sizing.
              </FieldDescription>
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

          <GradientEditor
            gradient={state.dotsGradient}
            idPrefix="dots-gradient"
            onGradientChange={(gradient) =>
              setState((current) => ({ ...current, dotsGradient: gradient }))
            }
            title="Dot gradient"
          />
        </CardContent>
      </Card>
      ) : null}

      {showsSection("corners") ? (
        <Card className={sectionCardClassName} size={isDashboardMode ? "sm" : "default"}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle>Corners</CardTitle>
          <CardDescription className={sectionDescriptionClassName}>
            Style the corner frames and the inner corner dots independently.
          </CardDescription>
        </CardHeader>
          <CardContent className={cn(sectionContentClassName, "flex flex-col gap-5")}>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
            {isDashboardMode ? (
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
            )}
            <ColorField
              id="corner-square-color"
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
            onGradientChange={(gradient) =>
              setState((current) => ({
                ...current,
                cornersSquareGradient: gradient,
              }))
            }
            title="Corner square gradient"
          />

            <FieldGroup className="grid gap-4 md:grid-cols-2">
            {isDashboardMode ? (
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
            )}
            <ColorField
              id="corner-dot-color"
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
            onGradientChange={(gradient) =>
              setState((current) => ({ ...current, cornersDotGradient: gradient }))
            }
            title="Corner dot gradient"
          />
        </CardContent>
      </Card>
      ) : null}

      {showsSection("background") ? (
        <Card className={sectionCardClassName} size={isDashboardMode ? "sm" : "default"}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle>Background</CardTitle>
          <CardDescription className={sectionDescriptionClassName}>
            Choose a fill or layer in a gradient behind the code.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(sectionContentClassName, "flex flex-col gap-4")}>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="background-transparent">Transparent background</FieldLabel>
              <FieldDescription>
                Use this when the QR should sit on top of another surface.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="background-transparent"
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
            disabled={state.backgroundOptions.transparent}
            disabledText="Disable transparency to apply a background gradient."
            gradient={state.backgroundGradient}
            idPrefix="background-gradient"
            onGradientChange={(gradient) =>
              setState((current) => ({ ...current, backgroundGradient: gradient }))
            }
            title="Background gradient"
          />
        </CardContent>
      </Card>
      ) : null}

      {showsSection("logo") ? (
        <Card className={sectionCardClassName} size={isDashboardMode ? "sm" : "default"}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle>Logo</CardTitle>
          <CardDescription className={sectionDescriptionClassName}>
            Add a logo from a URL or local file and tune how much QR space it
            occupies.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(sectionContentClassName, "flex flex-col gap-4")}>
          <SelectField
            id="logo-source-mode"
            label="Logo source"
            onValueChange={(value) => onLogoModeChange(value as LogoSourceMode)}
            options={LOGO_MODES}
            value={logoSourceMode}
          />

          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={onLogoFileChange}
            type="file"
          />

          {logoSourceMode === "url" ? (
            <Field>
              <FieldLabel htmlFor="logo-url">Remote logo URL</FieldLabel>
              <Input
                id="logo-url"
                placeholder="https://example.com/logo.png"
                value={state.image ?? ""}
                onChange={(event) =>
                  setState((current) => ({ ...current, image: event.target.value }))
                }
              />
              <FieldDescription>
                Use a public image URL if you want exportable SVG output with a
                hosted asset.
              </FieldDescription>
            </Field>
          ) : null}

          {logoSourceMode === "upload" ? (
            <div className="rounded-[var(--radius-xl)] border border-dashed border-border/70 bg-muted/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <ImagePlusIcon className="mt-0.5 size-4 text-foreground/70" />
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Local image upload</p>
                    <p>
                      Choose a PNG, SVG, or JPG file from this machine. The file
                      stays local and is referenced through a temporary object URL.
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={onPickLogoFile}>
                  <UploadIcon data-icon="inline-start" />
                  Choose file
                </Button>
              </div>
              {state.image ? (
                <p className="mt-3 text-sm text-muted-foreground break-all">
                  Current upload: {state.image}
                </p>
              ) : null}
            </div>
          ) : null}

          {logoSourceMode !== "none" ? (
            <Button
              variant="ghost"
              className="self-start"
              onClick={() => {
                onLogoModeChange("none")
                setState((current) => ({ ...current, image: undefined }))
              }}
            >
              <XIcon data-icon="inline-start" />
              Remove logo
            </Button>
          ) : null}

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
            <FieldDescription>
              {(state.imageOptions.imageSize * 100).toFixed(0)}% of the QR width
            </FieldDescription>
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
              <FieldDescription>
                Clears the modules directly under the logo so the image reads
                cleanly.
              </FieldDescription>
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
              <FieldDescription>
                Larger SVG files, but better compatibility when the QR is opened
                elsewhere.
              </FieldDescription>
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
        </CardContent>
      </Card>
      ) : null}

      {showsSection("encoding") ? (
        <Card className={sectionCardClassName} size={isDashboardMode ? "sm" : "default"}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle>{isDashboardMode ? "Encoding" : "QR settings"}</CardTitle>
          <CardDescription className={sectionDescriptionClassName}>
            Adjust the encoding mode and error correction level.
          </CardDescription>
        </CardHeader>
        <CardContent className={sectionContentClassName}>
          <FieldGroup className="grid gap-4 md:grid-cols-3">
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
        </CardContent>
      </Card>
      ) : null}
    </div>
  )
}

function ColorField({
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
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="h-11 p-1"
      />
      <FieldDescription>{value}</FieldDescription>
    </Field>
  )
}

function GradientEditor({
  disabled,
  disabledText,
  gradient,
  idPrefix,
  onGradientChange,
  title,
}: {
  disabled?: boolean
  disabledText?: string
  gradient: StudioGradient
  idPrefix: string
  onGradientChange: (gradient: StudioGradient) => void
  title: string
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border/70 bg-muted/20 p-4">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor={`${idPrefix}-enabled`}>{title}</FieldLabel>
          <FieldDescription>
            Toggle a two-stop gradient for this region.
          </FieldDescription>
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

      {disabledText && disabled ? (
        <p className="mt-3 text-sm text-muted-foreground">{disabledText}</p>
      ) : null}

      {gradient.enabled && !disabled ? (
        <FieldGroup className="mt-4 grid gap-4 md:grid-cols-2">
          <SelectField
            id={`${idPrefix}-type`}
            label="Gradient type"
            onValueChange={(value) =>
              onGradientChange({ ...gradient, type: value as GradientType })
            }
            options={GRADIENT_TYPES}
            value={gradient.type}
          />
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
          <NumberField
            id={`${idPrefix}-start-offset`}
            label="Start offset"
            max={1}
            min={0}
            step={0.05}
            onValueChange={(value) =>
              onGradientChange({
                ...gradient,
                colorStops: [
                  { ...gradient.colorStops[0], offset: value },
                  gradient.colorStops[1],
                ],
              })
            }
            value={gradient.colorStops[0].offset}
          />
          <ColorField
            id={`${idPrefix}-end-color`}
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
          <NumberField
            id={`${idPrefix}-end-offset`}
            label="End offset"
            max={1}
            min={0}
            step={0.05}
            onValueChange={(value) =>
              onGradientChange({
                ...gradient,
                colorStops: [
                  gradient.colorStops[0],
                  { ...gradient.colorStops[1], offset: value },
                ],
              })
            }
            value={gradient.colorStops[1].offset}
          />
        </FieldGroup>
      ) : null}
    </div>
  )
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
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
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
