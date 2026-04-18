import {
  hexToHsva,
  hsvaToRgba,
  type HslaColor,
  type HsvaColor,
  type RgbaColor,
} from "@uiw/color-convert"

export const DEFAULT_HEX_COLOR = "#000000"
export const DEFAULT_SWATCHES = [
  "#F8371A",
  "#F97C1B",
  "#FAC81C",
  "#3FD0B6",
  "#2CADF6",
  "#6462FC",
  "#F1BBD7",
]

export function coerceHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : DEFAULT_HEX_COLOR
}

export function toHsvaColor(value: string): HsvaColor {
  return hexToHsva(coerceHexColor(value))
}

export function getContrastRatios(value: string | HsvaColor) {
  const color = typeof value === "string" ? toHsvaColor(value) : value
  const rgb = hsvaToRgba(color)

  const toSrgb = (channel: number) => {
    const normalized = channel / 255

    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  }

  const luminance = 0.2126 * toSrgb(rgb.r) + 0.7152 * toSrgb(rgb.g) + 0.0722 * toSrgb(rgb.b)
  const dark = Number(((1 + 0.05) / (luminance + 0.05)).toFixed(2))
  const light = Number(((luminance + 0.05) / 0.05).toFixed(2))

  return { dark, light }
}

export function updateHslaChannel(
  value: HslaColor,
  channel: "h" | "s" | "l",
  nextValue: string,
): HslaColor {
  const parsed = Number(nextValue)

  if (Number.isNaN(parsed)) {
    return value
  }

  return {
    ...value,
    [channel]: parsed,
  }
}

export function updateRgbaChannel(
  value: RgbaColor,
  channel: "r" | "g" | "b",
  nextValue: string,
): RgbaColor {
  const parsed = Number(nextValue)

  if (Number.isNaN(parsed)) {
    return value
  }

  return {
    ...value,
    [channel]: parsed,
  }
}
