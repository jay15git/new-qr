"use client"

import {
  DraftingInspectorSection,
  DraftingInspectorValueGrid,
} from "@/features/workspace/components/InspectorPanel"
import { InspectorNumberInput } from "@/features/workspace/components/inspector/InspectorFields"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"

const DEFAULT_SHADOW_COLOR = "#111827"

export function EffectsSection({
  layer,
  onPatch,
}: {
  layer: DraftingCanvasLayer
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  const shadow = layer.shadow

  return (
    <DraftingInspectorSection dataSlot="drafting-effects-section" title="Effects">
      <InspectorNumberInput
        label="Blur"
        max={96}
        min={0}
        value={layer.blur}
        onChange={(blur) => onPatch({ blur })}
      />

      <label className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2">
        <input
          aria-label="Shadow color swatch"
          className="size-8 rounded-[6px] border border-[var(--drafting-line)] bg-transparent p-1"
          type="color"
          value={shadow.color}
          onChange={(event) =>
            onPatch({
              shadow: { ...shadow, color: event.currentTarget.value },
            })
          }
        />
        <input
          aria-label="Shadow color"
          className="drafting-type-input h-8 min-w-0 rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-2 text-[var(--drafting-ink)] shadow-none"
          value={shadow.color}
          onChange={(event) =>
            onPatch({
              shadow: { ...shadow, color: event.currentTarget.value || DEFAULT_SHADOW_COLOR },
            })
          }
        />
      </label>

      <DraftingInspectorValueGrid>
        <InspectorNumberInput
          label="Shadow blur"
          max={128}
          min={0}
          value={shadow.blur}
          onChange={(blur) => onPatch({ shadow: { ...shadow, blur } })}
        />
        <InspectorNumberInput
          label="Shadow %"
          max={100}
          min={0}
          value={shadow.opacity}
          onChange={(opacity) => onPatch({ shadow: { ...shadow, opacity } })}
        />
        <InspectorNumberInput
          label="Offset X"
          max={256}
          min={-256}
          value={shadow.offsetX}
          onChange={(offsetX) => onPatch({ shadow: { ...shadow, offsetX } })}
        />
        <InspectorNumberInput
          label="Offset Y"
          max={256}
          min={-256}
          value={shadow.offsetY}
          onChange={(offsetY) => onPatch({ shadow: { ...shadow, offsetY } })}
        />
      </DraftingInspectorValueGrid>
    </DraftingInspectorSection>
  )
}
