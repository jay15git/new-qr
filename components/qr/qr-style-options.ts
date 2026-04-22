import type { CornerDotType, CornerSquareType } from "qr-code-styling"

import type { StudioDotType } from "@/components/qr/qr-studio-state"

export const DOT_STYLE_OPTIONS: Array<{ label: string; value: StudioDotType }> = [
  { label: "Rounded", value: "rounded" },
  { label: "Square", value: "square" },
  { label: "Dots", value: "dots" },
  { label: "Classy", value: "classy" },
  { label: "Classy rounded", value: "classy-rounded" },
  { label: "Extra rounded", value: "extra-rounded" },
  { label: "Diamond", value: "diamond" },
  { label: "Heart", value: "heart" },
]

export const CORNER_SQUARE_STYLE_OPTIONS: Array<{
  label: string
  value: CornerSquareType
}> = [
  { label: "Extra rounded", value: "extra-rounded" },
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Dots", value: "dots" },
  { label: "Classy", value: "classy" },
  { label: "Classy rounded", value: "classy-rounded" },
  { label: "Dot", value: "dot" },
]

export const CORNER_DOT_STYLE_OPTIONS: Array<{
  label: string
  value: CornerDotType
}> = [
  { label: "Dot", value: "dot" },
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Dots", value: "dots" },
  { label: "Classy", value: "classy" },
  { label: "Classy rounded", value: "classy-rounded" },
  { label: "Extra rounded", value: "extra-rounded" },
]
