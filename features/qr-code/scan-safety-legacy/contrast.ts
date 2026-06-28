import { parse, wcagContrast } from "culori"

/** ISO 18004 / practical scan floor — not WCAG text contrast (4.5:1). */
const ERROR_CONTRAST_MIN = 2
const WARNING_CONTRAST_MIN = 3

export function getWcagContrast(foreground: string, background: string): number | null {
  const fg = parse(foreground)
  const bg = parse(background)

  if (!fg || !bg) {
    return null
  }

  const ratio = wcagContrast(fg, bg)
  return Number.isFinite(ratio) ? ratio : null
}

export function getWorstContrast(colors: string[], background: string): number | null {
  return getWorstPairContrast(colors, [background])
}

export function getWorstPairContrast(
  foregrounds: string[],
  backgrounds: string[],
): number | null {
  let worst: number | null = null

  for (const foreground of foregrounds) {
    for (const background of backgrounds) {
      const ratio = getWcagContrast(foreground, background)
      if (ratio === null) {
        continue
      }

      if (worst === null || ratio < worst) {
        worst = ratio
      }
    }
  }

  return worst
}

export function contrastSeverity(
  ratio: number | null,
): "error" | "warning" | null {
  if (ratio === null) {
    return null
  }

  if (ratio < ERROR_CONTRAST_MIN) {
    return "error"
  }

  if (ratio < WARNING_CONTRAST_MIN) {
    return "warning"
  }

  return null
}

export { ERROR_CONTRAST_MIN, WARNING_CONTRAST_MIN }
