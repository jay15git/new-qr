import type { DraftingCardShadowState } from "@/features/workspace/model/card-state"

function toRgba(color: string, opacity: number) {
  const normalizedOpacity = Math.min(1, Math.max(0, Number.isFinite(opacity) ? opacity : 1))
  const hex = color.trim().replace(/^#/, "")

  if (/^[\da-f]{3}$/i.test(hex)) {
    const [r, g, b] = hex.split("").map((channel) => Number.parseInt(channel + channel, 16))
    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`
  }

  if (/^[\da-f]{6}$/i.test(hex)) {
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`
  }

  return color
}

export function getDraftingLayerBoxShadow(shadow: DraftingCardShadowState) {
  if (
    shadow.opacity <= 0 ||
    (shadow.blur <= 0 && shadow.offsetX === 0 && shadow.offsetY === 0)
  ) {
    return "none"
  }

  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${toRgba(
    shadow.color,
    shadow.opacity / 100,
  )}`
}
