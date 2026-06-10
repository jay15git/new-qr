"use client"

import { useEffect, useMemo, useState } from "react"
import { TypeIcon } from "lucide-react"

import {
  createDraftingTextLayer,
  DEFAULT_DRAFTING_TEXT_LAYER,
  type DraftingCanvasLayer,
} from "@/features/workspace/model/layers"
import {
  DRAFTING_FONT_REGISTRY,
  getDraftingFontCssFamily,
  loadDraftingFont,
  resolveDraftingFont,
  type DraftingFontSource,
} from "@/features/workspace/model/fonts"
import {
  type DraftingSliderVariant,
} from "@/features/workspace/components/StylePanel"
import { ElasticSlider } from "@/components/ui/elastic-slider"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { Slider as UnlumenSlider } from "@/components/vendor/unlumen-ui/slider"
import { cn } from "@/lib/utils"

export function DraftingTextLayerTab({
  layer,
  onAddText,
  onLayerPatch,
  sliderVariant,
}: {
  layer: DraftingCanvasLayer | null
  onAddText: () => void
  onLayerPatch: (patch: Partial<DraftingCanvasLayer>) => void
  sliderVariant: DraftingSliderVariant
}) {
  const textLayer = layer ?? createDraftingTextLayer("preview")
  const selectedFont = resolveDraftingFont({
    fontFamily: textLayer.fontFamily,
    fontId: textLayer.fontId,
  })
  const supportedFontWeights = selectedFont.weights
  const fontWeight = getDraftingTextInspectorFontWeight(textLayer.fontWeight, supportedFontWeights)
  const [fontQuery, setFontQuery] = useState("")
  const filteredFonts = useMemo(() => {
    const query = fontQuery.trim().toLowerCase()

    return DRAFTING_FONT_REGISTRY.filter((font) => {
      if (!query) {
        return true
      }

      return (
        font.label.toLowerCase().includes(query) ||
        font.family.toLowerCase().includes(query) ||
        font.source.toLowerCase().includes(query)
      )
    })
  }, [fontQuery])
  const groupedFonts = useMemo(
    () =>
      (["local", "fontshare", "system"] as const).map((source) => ({
        fonts: filteredFonts.filter((font) => font.source === source),
        source,
      })),
    [filteredFonts],
  )

  useEffect(() => {
    void loadDraftingFont(selectedFont.id)
  }, [selectedFont.id])

  function patchTextLayer(patch: Partial<DraftingCanvasLayer>) {
    onLayerPatch({ ...patch, textRuns: undefined })
  }

  return (
    <section data-slot="drafting-text-tab" className="min-w-0 space-y-4">
      <SecondaryButton
        aria-label="Add Text"
        className="h-9 w-full"
        data-slot="drafting-add-text-layer"
        type="button"
        onClick={onAddText}
      >
        <TypeIcon data-icon="inline-start" />
        Add text
      </SecondaryButton>

      {layer ? (
        <div className="min-w-0 space-y-4 rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] p-4 shadow-[var(--drafting-shadow-rest)]">
          <label className="block min-w-0">
            <span className="drafting-type-control-label mb-1.5 block font-semibold text-[var(--drafting-ink)]">
              Text
            </span>
            <textarea
              aria-label="Text layer content"
              className="drafting-type-input min-h-24 w-full resize-y rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-3 py-2 text-[var(--drafting-ink)] shadow-none"
              value={textLayer.text ?? ""}
              onChange={(event) => patchTextLayer({ text: event.currentTarget.value })}
            />
          </label>

          <div className="block min-w-0" data-slot="drafting-font-picker">
            <span className="drafting-type-meta mb-1 block font-semibold text-[var(--drafting-ink-muted)]">
              Font
            </span>
            <input
              aria-label="Search text fonts"
              className="drafting-type-input h-9 w-full rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-2 text-[var(--drafting-ink)] shadow-none"
              placeholder={selectedFont.label}
              type="search"
              value={fontQuery}
              onChange={(event) => setFontQuery(event.currentTarget.value)}
            />
            <div className="mt-2 max-h-52 min-w-0 space-y-3 overflow-y-auto rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] p-2">
              {groupedFonts.map(({ fonts, source }) =>
                fonts.length > 0 ? (
                  <div key={source} className="min-w-0 space-y-1">
                    <p className="drafting-type-meta px-1 font-semibold text-[var(--drafting-ink-muted)]">
                      {getDraftingFontSourceLabel(source)}
                    </p>
                    {fonts.map((font) => {
                      const isSelected = font.id === selectedFont.id

                      return (
                        <button
                          key={font.id}
                          aria-label={`Choose ${font.label}`}
                          aria-pressed={isSelected}
                          className={cn(
                            "flex h-9 w-full items-center justify-between gap-2 rounded-[5px] px-2 text-left text-xs font-semibold text-[var(--drafting-ink-muted)] hover:bg-[var(--drafting-control-bg-active)] hover:text-[var(--drafting-ink)]",
                            isSelected &&
                              "bg-[var(--drafting-control-bg-active)] text-[var(--drafting-ink)]",
                          )}
                          style={{ fontFamily: getDraftingFontCssFamily({ fontId: font.id }) }}
                          type="button"
                          onClick={() => {
                            void loadDraftingFont(font.id)
                            patchTextLayer({ fontFamily: font.family, fontId: font.id })
                          }}
                          onMouseEnter={() => {
                            void loadDraftingFont(font.id)
                          }}
                        >
                          <span className="truncate">{font.label}</span>
                          <span className="drafting-type-meta shrink-0 text-[var(--drafting-ink-muted)]">
                            {font.source === "fontshare" ? "Fontshare" : font.source}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : null,
              )}
              {filteredFonts.length === 0 ? (
                <p className="drafting-type-meta px-2 py-3 text-center text-[var(--drafting-ink-muted)]">
                  No fonts found
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <TextNumberInput
              label="Size"
              max={300}
              min={6}
              value={textLayer.fontSize ?? DEFAULT_DRAFTING_TEXT_LAYER.fontSize}
              onChange={(fontSize) => patchTextLayer({ fontSize })}
            />
            <TextNumberInput
              label="Spacing"
              max={200}
              min={-50}
              value={textLayer.letterSpacing ?? DEFAULT_DRAFTING_TEXT_LAYER.letterSpacing}
              onChange={(letterSpacing) => patchTextLayer({ letterSpacing })}
            />
            <TextNumberInput
              label="Line"
              max={4}
              min={0.6}
              step={0.05}
              value={textLayer.lineHeight ?? DEFAULT_DRAFTING_TEXT_LAYER.lineHeight}
              onChange={(lineHeight) => patchTextLayer({ lineHeight })}
            />
            <label className="min-w-0">
              <span className="drafting-type-meta mb-1 block font-semibold text-[var(--drafting-ink-muted)]">
                Fill
              </span>
              <input
                aria-label="Text fill color"
                className="h-9 w-full rounded-[6px] border border-[var(--drafting-line)] bg-transparent p-1"
                type="color"
                value={textLayer.fill ?? DEFAULT_DRAFTING_TEXT_LAYER.fill}
                onChange={(event) => patchTextLayer({ fill: event.currentTarget.value })}
              />
            </label>
          </div>

          <TextWeightSlider
            sliderVariant={sliderVariant}
            supportedWeights={supportedFontWeights}
            value={fontWeight}
            onChange={(fontWeight) =>
              patchTextLayer({
                fontWeight: getNearestDraftingFontWeight(fontWeight, supportedFontWeights),
              })
            }
          />

          <div className="grid grid-cols-3 gap-2">
            {(["left", "center", "right"] as const).map((textAlign) => (
              <button
                key={textAlign}
                aria-pressed={(textLayer.textAlign ?? DEFAULT_DRAFTING_TEXT_LAYER.textAlign) === textAlign}
                className={cn(
                  "h-9 rounded-[6px] border border-[var(--drafting-line)] px-2 text-xs font-semibold capitalize text-[var(--drafting-ink-muted)]",
                  (textLayer.textAlign ?? DEFAULT_DRAFTING_TEXT_LAYER.textAlign) === textAlign &&
                    "border-[var(--drafting-ink)] bg-[var(--drafting-control-bg-active)] text-[var(--drafting-ink)]",
                )}
                type="button"
                onClick={() => patchTextLayer({ textAlign })}
              >
                {textAlign}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <TextToggleButton
              active={fontWeight >= 700}
              label="Bold"
              onClick={() =>
                patchTextLayer({
                  fontWeight:
                    fontWeight >= 700
                      ? getNearestDraftingFontWeight(400, supportedFontWeights)
                      : getNearestDraftingFontWeight(700, supportedFontWeights),
                })
              }
            />
            <TextToggleButton
              active={(textLayer.fontStyle ?? DEFAULT_DRAFTING_TEXT_LAYER.fontStyle) === "italic"}
              label="Italic"
              onClick={() =>
                patchTextLayer({
                  fontStyle:
                    (textLayer.fontStyle ?? DEFAULT_DRAFTING_TEXT_LAYER.fontStyle) === "italic"
                      ? "normal"
                      : "italic",
                })
              }
            />
            <TextToggleButton
              active={Boolean(textLayer.underline)}
              label="Underline"
              onClick={() => patchTextLayer({ underline: !textLayer.underline })}
            />
          </div>
        </div>
      ) : (
        <p className="drafting-type-body rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-4 py-3 text-[var(--drafting-ink-muted)] shadow-[var(--drafting-shadow-rest)]">
          Select a text layer to edit its copy and type style.
        </p>
      )}
    </section>
  )
}

function getDraftingFontSourceLabel(source: DraftingFontSource) {
  if (source === "local") {
    return "Brand / App fonts"
  }

  if (source === "fontshare") {
    return "Fontshare"
  }

  return "System"
}

function TextWeightSlider({
  onChange,
  sliderVariant,
  supportedWeights,
  value,
}: {
  onChange: (value: number) => void
  sliderVariant: DraftingSliderVariant
  supportedWeights: readonly number[]
  value: number
}) {
  const min = Math.min(...supportedWeights)
  const max = Math.max(...supportedWeights)
  const step = getDraftingFontWeightSliderStep(supportedWeights)
  const isDesktopElastic = sliderVariant === "desktop-elastic"

  return (
    <div
      className={cn(
        "min-w-0",
        isDesktopElastic
          ? "px-0 py-1"
          : "rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-3 py-2",
      )}
    >
      {isDesktopElastic ? (
        <div data-slot="drafting-text-font-weight" data-appearance="desktop-elastic">
          <ElasticSlider
            aria-label="Text font weight"
            className="desktop-elastic-slider w-full"
            formatValue={(fontWeight) => String(Math.round(fontWeight))}
            label="Weight"
            max={max}
            min={min}
            step={step}
            value={value}
            onValueChange={(nextValue) => {
              onChange(getNearestDraftingFontWeight(nextValue, supportedWeights))
            }}
          />
        </div>
      ) : (
        <UnlumenSlider
          aria-label="Text font weight"
          appearance="drafting"
          className="w-full"
          data-slot="drafting-text-font-weight"
          formatValue={(fontWeight) => String(Math.round(fontWeight))}
          label="Weight"
          max={max}
          min={min}
          showValue
          step={step}
          value={value}
          onChange={(nextValue) => {
            onChange(
              getNearestDraftingFontWeight(
                Array.isArray(nextValue) ? (nextValue[0] ?? value) : nextValue,
                supportedWeights,
              ),
            )
          }}
        />
      )}
    </div>
  )
}

function getDraftingTextInspectorFontWeight(
  fontWeight: DraftingCanvasLayer["fontWeight"],
  supportedWeights: readonly number[],
) {
  if (fontWeight === "bold") {
    return getNearestDraftingFontWeight(700, supportedWeights)
  }

  if (typeof fontWeight === "number" && Number.isFinite(fontWeight)) {
    return getNearestDraftingFontWeight(fontWeight, supportedWeights)
  }

  return getNearestDraftingFontWeight(400, supportedWeights)
}

function getNearestDraftingFontWeight(value: number, supportedWeights: readonly number[]) {
  return supportedWeights.reduce((nearestWeight, candidateWeight) => {
    const nearestDistance = Math.abs(nearestWeight - value)
    const candidateDistance = Math.abs(candidateWeight - value)

    if (candidateDistance === nearestDistance) {
      return candidateWeight > nearestWeight ? candidateWeight : nearestWeight
    }

    return candidateDistance < nearestDistance ? candidateWeight : nearestWeight
  }, supportedWeights[0] ?? 400)
}

function getDraftingFontWeightSliderStep(supportedWeights: readonly number[]) {
  const sortedWeights = [...new Set(supportedWeights)].sort((a, b) => a - b)

  if (sortedWeights.length < 2) {
    return 1
  }

  return Math.min(
    ...sortedWeights.slice(1).map((fontWeight, index) => fontWeight - sortedWeights[index]),
  )
}

function TextNumberInput({
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
}: {
  label: string
  max: number
  min: number
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
        className="drafting-type-input h-9 w-full rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-2 text-[var(--drafting-ink)] shadow-none"
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

function TextToggleButton({
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
