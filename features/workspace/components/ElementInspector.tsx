"use client"

import { InspectorPanel } from "@/features/workspace/components/InspectorPanel"
import { EffectsSection } from "@/features/workspace/components/EffectsSection"
import { ImageInspector } from "@/features/workspace/components/ImageInspector"
import { ShapeInspector } from "@/features/workspace/components/ShapeInspector"
import { TextInspector } from "@/features/workspace/components/TextInspector"
import { TransformSection } from "@/features/workspace/components/TransformSection"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import type { DraftingSliderVariant } from "@/features/workspace/components/StylePanel"

function getElementInspectorTitle(layer: DraftingCanvasLayer) {
  if (layer.kind === "text") {
    return "Text"
  }

  if (layer.kind === "image") {
    return "Image"
  }

  return "Shape"
}

function getElementInspectorDescription(layer: DraftingCanvasLayer) {
  if (layer.kind === "text") {
    return "Edit copy and typography for the selected text layer."
  }

  if (layer.kind === "image") {
    return "Edit source and fit for the selected image layer."
  }

  return "Edit fill, stroke, and silhouette for the selected shape."
}

export function ElementInspector({
  layer,
  onPatch,
  sliderVariant,
}: {
  layer: DraftingCanvasLayer
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
  sliderVariant: DraftingSliderVariant
}) {
  return (
    <InspectorPanel
      dataSlot="drafting-element-inspector"
      description={getElementInspectorDescription(layer)}
      eyebrow="Element"
      title={getElementInspectorTitle(layer)}
    >
      <TransformSection layer={layer} onPatch={onPatch} />
      {layer.kind === "text" ? (
        <TextInspector layer={layer} onPatch={onPatch} sliderVariant={sliderVariant} />
      ) : null}
      {layer.kind === "shape" ? <ShapeInspector layer={layer} onPatch={onPatch} /> : null}
      {layer.kind === "image" ? <ImageInspector layer={layer} onPatch={onPatch} /> : null}
      <EffectsSection layer={layer} onPatch={onPatch} />
    </InspectorPanel>
  )
}
