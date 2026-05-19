"use client"

import type { ComponentType } from "react"
import {
  ColorPanels,
  Dithering,
  DotGrid,
  DotOrbit,
  FlutedGlass,
  GemSmoke,
  GodRays,
  GrainGradient,
  HalftoneCmyk,
  HalftoneDots,
  Heatmap,
  ImageDithering,
  LiquidMetal,
  MeshGradient,
  Metaballs,
  NeuroNoise,
  PaperTexture,
  PerlinNoise,
  PulsingBorder,
  SimplexNoise,
  SmokeRing,
  Spiral,
  StaticMeshGradient,
  StaticRadialGradient,
  Swirl,
  Voronoi,
  Warp,
  Water,
  Waves,
  colorPanelsPresets,
  ditheringPresets,
  dotGridPresets,
  dotOrbitPresets,
  flutedGlassPresets,
  gemSmokePresets,
  godRaysPresets,
  grainGradientPresets,
  halftoneCmykPresets,
  halftoneDotsPresets,
  heatmapPresets,
  imageDitheringPresets,
  liquidMetalPresets,
  meshGradientPresets,
  metaballsPresets,
  neuroNoisePresets,
  paperTexturePresets,
  perlinNoisePresets,
  pulsingBorderPresets,
  simplexNoisePresets,
  smokeRingPresets,
  spiralPresets,
  staticMeshGradientPresets,
  staticRadialGradientPresets,
  swirlPresets,
  voronoiPresets,
  warpPresets,
  waterPresets,
  wavesPresets,
} from "@paper-design/shaders-react"

export type PaperShaderParamValue =
  | boolean
  | number
  | number[]
  | number[][]
  | string
  | string[]
  | undefined

export type PaperShaderParams = Record<string, PaperShaderParamValue>

export type PaperShaderPreset = {
  name: string
  params: PaperShaderParams
}

type PaperShaderComponent = ComponentType<Record<string, unknown>>

export type PaperShaderGroup = "background" | "texture" | "border" | "image-filter"

export type PaperShaderDefinition = {
  id: string
  label: string
  group: PaperShaderGroup
  disabled?: boolean
  component: PaperShaderComponent
  presets: PaperShaderPreset[]
}

function asPaperShaderComponent(component: unknown) {
  return component as unknown as PaperShaderComponent
}

function coercePresets<TParams extends PaperShaderParams>(
  presets: Array<{ name: string; params: TParams }>,
): PaperShaderPreset[] {
  return presets.map((preset) => ({
    name: preset.name,
    params: structuredClone(preset.params),
  }))
}

export const PAPER_SHADER_DEFINITIONS: PaperShaderDefinition[] = [
  {
    id: "mesh-gradient",
    label: "Mesh gradient",
    group: "background",
    component: asPaperShaderComponent(MeshGradient),
    presets: coercePresets(meshGradientPresets),
  },
  {
    id: "static-mesh-gradient",
    label: "Static mesh",
    group: "background",
    component: asPaperShaderComponent(StaticMeshGradient),
    presets: coercePresets(staticMeshGradientPresets),
  },
  {
    id: "grain-gradient",
    label: "Grain gradient",
    group: "background",
    component: asPaperShaderComponent(GrainGradient),
    presets: coercePresets(grainGradientPresets),
  },
  {
    id: "warp",
    label: "Warp",
    group: "background",
    component: asPaperShaderComponent(Warp),
    presets: coercePresets(warpPresets),
  },
  {
    id: "waves",
    label: "Waves",
    group: "texture",
    component: asPaperShaderComponent(Waves),
    presets: coercePresets(wavesPresets),
  },
  {
    id: "dot-orbit",
    label: "Dot orbit",
    group: "texture",
    component: asPaperShaderComponent(DotOrbit),
    presets: coercePresets(dotOrbitPresets),
  },
  {
    id: "voronoi",
    label: "Voronoi",
    group: "background",
    component: asPaperShaderComponent(Voronoi),
    presets: coercePresets(voronoiPresets),
  },
  {
    id: "smoke-ring",
    label: "Smoke ring",
    group: "background",
    component: asPaperShaderComponent(SmokeRing),
    presets: coercePresets(smokeRingPresets),
  },
  {
    id: "neuro-noise",
    label: "Neuro noise",
    group: "background",
    component: asPaperShaderComponent(NeuroNoise),
    presets: coercePresets(neuroNoisePresets),
  },
  {
    id: "dot-grid",
    label: "Dot grid",
    group: "texture",
    component: asPaperShaderComponent(DotGrid),
    presets: coercePresets(dotGridPresets),
  },
  {
    id: "simplex-noise",
    label: "Simplex noise",
    group: "background",
    component: asPaperShaderComponent(SimplexNoise),
    presets: coercePresets(simplexNoisePresets),
  },
  {
    id: "metaballs",
    label: "Metaballs",
    group: "background",
    component: asPaperShaderComponent(Metaballs),
    presets: coercePresets(metaballsPresets),
  },
  {
    id: "perlin-noise",
    label: "Perlin noise",
    group: "texture",
    component: asPaperShaderComponent(PerlinNoise),
    presets: coercePresets(perlinNoisePresets),
  },
  {
    id: "god-rays",
    label: "God rays",
    group: "background",
    component: asPaperShaderComponent(GodRays),
    presets: coercePresets(godRaysPresets),
  },
  {
    id: "spiral",
    label: "Spiral",
    group: "texture",
    component: asPaperShaderComponent(Spiral),
    presets: coercePresets(spiralPresets),
  },
  {
    id: "swirl",
    label: "Swirl",
    group: "background",
    component: asPaperShaderComponent(Swirl),
    presets: coercePresets(swirlPresets),
  },
  {
    id: "dithering",
    label: "Dithering",
    group: "texture",
    component: asPaperShaderComponent(Dithering),
    presets: coercePresets(ditheringPresets),
  },
  {
    id: "pulsing-border",
    label: "Pulsing border",
    group: "border",
    component: asPaperShaderComponent(PulsingBorder),
    presets: coercePresets(pulsingBorderPresets),
  },
  {
    id: "color-panels",
    label: "Color panels",
    group: "background",
    component: asPaperShaderComponent(ColorPanels),
    presets: coercePresets(colorPanelsPresets),
  },
  {
    id: "static-radial-gradient",
    label: "Static radial",
    group: "background",
    component: asPaperShaderComponent(StaticRadialGradient),
    presets: coercePresets(staticRadialGradientPresets),
  },
  {
    id: "paper-texture",
    label: "Paper texture",
    group: "texture",
    component: asPaperShaderComponent(PaperTexture),
    presets: coercePresets(paperTexturePresets),
  },
  {
    id: "water",
    label: "Water",
    group: "texture",
    component: asPaperShaderComponent(Water),
    presets: coercePresets(waterPresets),
  },
  {
    id: "fluted-glass",
    label: "Fluted glass",
    group: "image-filter",
    disabled: true,
    component: asPaperShaderComponent(FlutedGlass),
    presets: coercePresets(flutedGlassPresets),
  },
  {
    id: "image-dithering",
    label: "Image dithering",
    group: "image-filter",
    disabled: true,
    component: asPaperShaderComponent(ImageDithering),
    presets: coercePresets(imageDitheringPresets),
  },
  {
    id: "heatmap",
    label: "Heatmap",
    group: "image-filter",
    disabled: true,
    component: asPaperShaderComponent(Heatmap),
    presets: coercePresets(heatmapPresets),
  },
  {
    id: "liquid-metal",
    label: "Liquid metal",
    group: "image-filter",
    disabled: true,
    component: asPaperShaderComponent(LiquidMetal),
    presets: coercePresets(liquidMetalPresets),
  },
  {
    id: "halftone-dots",
    label: "Halftone dots",
    group: "image-filter",
    disabled: true,
    component: asPaperShaderComponent(HalftoneDots),
    presets: coercePresets(halftoneDotsPresets),
  },
  {
    id: "halftone-cmyk",
    label: "Halftone CMYK",
    group: "image-filter",
    disabled: true,
    component: asPaperShaderComponent(HalftoneCmyk),
    presets: coercePresets(halftoneCmykPresets),
  },
  {
    id: "gem-smoke",
    label: "Gem smoke",
    group: "image-filter",
    disabled: true,
    component: asPaperShaderComponent(GemSmoke),
    presets: coercePresets(gemSmokePresets),
  },
] as const

export type PaperShaderId = string

export const DEFAULT_PAPER_SHADER_ID: PaperShaderId = "mesh-gradient"

export function getPaperShaderDefinition(shaderId: PaperShaderId | string) {
  return (
    PAPER_SHADER_DEFINITIONS.find((definition) => definition.id === shaderId) ??
    PAPER_SHADER_DEFINITIONS[0]
  )
}

export function getPaperShaderPreset(
  shaderId: PaperShaderId | string,
  presetName?: string,
) {
  const definition = getPaperShaderDefinition(shaderId)
  return (
    definition.presets.find((preset) => preset.name === presetName) ??
    definition.presets[0]
  )
}

export function createDefaultPaperShaderParams(shaderId: PaperShaderId | string) {
  return structuredClone(getPaperShaderPreset(shaderId).params)
}
