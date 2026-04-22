import type { ErrorCorrectionLevel, TypeNumber } from "qr-code-styling"

export const TYPE_NUMBER_MIN = 0
export const TYPE_NUMBER_MAX = 40

export const TYPE_NUMBERS: Array<{ label: string; value: TypeNumber }> = [
  { label: "Auto", value: 0 },
  ...Array.from({ length: TYPE_NUMBER_MAX }, (_, index) => ({
    label: String(index + 1),
    value: (index + 1) as TypeNumber,
  })),
]

export const ERROR_CORRECTION_LEVEL_OPTIONS: Array<{
  value: ErrorCorrectionLevel
  label: string
  title: string
  summary: string
}> = [
  { value: "L", label: "L", title: "Low", summary: "≈7% recovery, maximizes data density." },
  {
    value: "M",
    label: "M",
    title: "Medium",
    summary: "≈15% recovery, balanced for everyday use.",
  },
  {
    value: "Q",
    label: "Q",
    title: "Quartile",
    summary: "≈25% recovery, safer around logos and styling.",
  },
  {
    value: "H",
    label: "H",
    title: "High",
    summary: "≈30% recovery, strongest damage tolerance.",
  },
]

export function formatTypeNumberLabel(value: number) {
  return value === 0 ? "Auto" : String(value)
}
