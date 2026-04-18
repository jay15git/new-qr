const FULL_ROTATION_DEGREES = 360

export function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

export function radiansToDegrees(value: number) {
  return (value * FULL_ROTATION_DEGREES) / (Math.PI * 2)
}

export function clampGradientOffset(value: number) {
  if (Number.isNaN(value)) {
    return 0
  }

  return Math.min(1, Math.max(0, value))
}

export function normalizeGradientOffsetRange(values: [number, number]): [number, number] {
  const [start, end] = values.map((value) => clampGradientOffset(value))

  return start <= end ? [start, end] : [end, start]
}
