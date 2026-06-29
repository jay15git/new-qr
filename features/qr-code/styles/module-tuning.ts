import type { StudioDataModulesStyle } from "@/features/qr-code/model/state"

const MODULE_SIZE_STYLES = new Set<StudioDataModulesStyle>([
  "square",
  "pinched-square",
  "circle",
  "diamond",
  "heart",
  "star",
  "hashtag",
])

const MODULE_LINE_WIDTH_STYLES = new Set<StudioDataModulesStyle>([
  "vertical-line",
  "horizontal-line",
  "rounded",
  "circuit-board",
])

export function supportsModuleSize(style: StudioDataModulesStyle) {
  return MODULE_SIZE_STYLES.has(style)
}

export function supportsModuleLineWidth(style: StudioDataModulesStyle) {
  return MODULE_LINE_WIDTH_STYLES.has(style)
}

export function supportsModuleRoundSize(style: StudioDataModulesStyle) {
  return style === "circle"
}
