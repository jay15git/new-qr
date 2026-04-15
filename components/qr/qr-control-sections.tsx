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
import type {
  CornerDotType,
  CornerSquareType,
  DrawType,
  GradientType,
  Mode,
  TypeNumber,
} from "qr-code-styling"

import { getActiveCustomDotShape } from "@/components/qr/custom-dot-shapes"
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
}: QrControlSectionsProps) {
  const contentError = state.data.trim() ? null : "Add text or a URL to encode"
  const activeCustomDotShape = getActiveCustomDotShape(state.dotsOptions.type)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>
            Set the encoded value, renderer, and output dimensions.
          </CardDescription>
        </CardHeader>
        <CardContent>
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

      <Card>
        <CardHeader>
          <CardTitle>Dots</CardTitle>
          <CardDescription>
            Shape the main QR modules and optionally apply a gradient.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FieldGroup className="grid gap-4 md:grid-cols-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Corners</CardTitle>
          <CardDescription>
            Style the corner frames and the inner corner dots independently.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FieldGroup className="grid gap-4 md:grid-cols-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Background</CardTitle>
          <CardDescription>
            Choose a fill or layer in a gradient behind the code.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>
            Add a logo from a URL or local file and tune how much QR space it
            occupies.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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

      <Card>
        <CardHeader>
          <CardTitle>QR settings</CardTitle>
          <CardDescription>
            Adjust the encoding mode and error correction level.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
