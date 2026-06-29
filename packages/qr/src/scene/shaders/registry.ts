export const SHADER_COMPONENT_EXPORT_NAMES = {
  "mesh-gradient": "MeshGradient",
  "static-mesh-gradient": "StaticMeshGradient",
  "grain-gradient": "GrainGradient",
  warp: "Warp",
  waves: "Waves",
  "dot-orbit": "DotOrbit",
  voronoi: "Voronoi",
  "smoke-ring": "SmokeRing",
  "neuro-noise": "NeuroNoise",
  "dot-grid": "DotGrid",
  "simplex-noise": "SimplexNoise",
  metaballs: "Metaballs",
  "perlin-noise": "PerlinNoise",
  "god-rays": "GodRays",
  spiral: "Spiral",
  swirl: "Swirl",
  dithering: "Dithering",
  "pulsing-border": "PulsingBorder",
  "color-panels": "ColorPanels",
  "static-radial-gradient": "StaticRadialGradient",
  "paper-texture": "PaperTexture",
  water: "Water",
  "fluted-glass": "FlutedGlass",
  "image-dithering": "ImageDithering",
  heatmap: "Heatmap",
  "liquid-metal": "LiquidMetal",
  "halftone-dots": "HalftoneDots",
  "halftone-cmyk": "HalftoneCmyk",
  "gem-smoke": "GemSmoke",
} as const

export type PaperShaderId = keyof typeof SHADER_COMPONENT_EXPORT_NAMES

export const DEFAULT_PAPER_SHADER_ID: PaperShaderId = "mesh-gradient"

export const IMAGE_FILTER_SHADER_IDS = [
  "paper-texture",
  "fluted-glass",
  "water",
  "image-dithering",
  "halftone-dots",
  "halftone-cmyk",
  "fluted-glass",
  "heatmap",
  "liquid-metal",
  "gem-smoke",
] as const

const REQUIRES_IMAGE_SHADER_IDS = new Set<string>([
  "fluted-glass",
  "image-dithering",
  "heatmap",
  "liquid-metal",
  "halftone-dots",
  "halftone-cmyk",
  "gem-smoke",
])

export function getShaderComponentExportName(shaderId: string) {
  return (
    SHADER_COMPONENT_EXPORT_NAMES[shaderId as PaperShaderId] ??
    SHADER_COMPONENT_EXPORT_NAMES[DEFAULT_PAPER_SHADER_ID]
  )
}

export function shaderRequiresImage(shaderId: string) {
  return REQUIRES_IMAGE_SHADER_IDS.has(shaderId)
}
