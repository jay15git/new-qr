import {
  getAssetValue,
  type QrStudioState,
  type StudioGradient,
} from "@/features/qr-code/model/state"
import { isCustomCornerDotShape } from "@/features/qr-code/styles/custom-corner-dot-shapes"
import {
  contrastSeverity,
  ERROR_CONTRAST_MIN,
  getWorstContrast,
  getWorstPairContrast,
  getWcagContrast,
  WARNING_CONTRAST_MIN,
} from "@/features/qr-code/scan-safety-legacy/contrast"
import { isModuleSizeTooSmall } from "@/features/qr-code/scan-safety-legacy/matrix"
import type {
  ScanSafetyContext,
  ScanSafetyIssue,
  ScanSafetyResult,
} from "@/features/qr-code/scan-safety-legacy/legacy-types"

const RISKY_MODULE_STYLES = new Set([
  "heart",
  "star",
  "hashtag",
  "vertical-line",
  "horizontal-line",
])

const LOGO_AREA_ERROR_THRESHOLD = 0.2
const LOGO_AREA_WARNING_THRESHOLD = 0.15
const LOGO_ECC_WARNING_MIN_AREA = 0.08
/** Inverted finder dots must contrast with frame, not background. */
const INVERTED_FINDER_DOT_MIN = 2

function collectBackgroundColors(
  state: QrStudioState,
  context: ScanSafetyContext,
): string[] {
  if (state.backgroundOptions.transparent) {
    return [context.effectiveBackgroundColor]
  }

  if (state.backgroundGradient.enabled) {
    return collectGradientColors(state.backgroundGradient)
  }

  return [state.backgroundOptions.color]
}

function collectGradientColors(gradient: StudioGradient): string[] {
  if (!gradient.enabled) {
    return []
  }

  return gradient.colorStops.map((stop) => stop.color)
}

function collectDataModuleColors(state: QrStudioState): string[] {
  if (state.dotsColorMode === "gradient") {
    return collectGradientColors(state.dataModulesGradient)
  }

  if (state.dotsColorMode === "palette") {
    return state.dotsPalette.filter(Boolean)
  }

  return [state.dataModulesSettings.color]
}

function collectFinderFrameColors(state: QrStudioState): string[] {
  if (state.finderPatternOuterGradient.enabled) {
    return collectGradientColors(state.finderPatternOuterGradient)
  }

  return [state.finderPatternOuterSettings.color]
}

function collectFinderDotColors(state: QrStudioState): string[] {
  if (state.finderPatternInnerGradient.enabled) {
    return collectGradientColors(state.finderPatternInnerGradient)
  }

  return [state.finderPatternInnerSettings.color]
}

function hasLogo(state: QrStudioState): boolean {
  return Boolean(getAssetValue(state.logo))
}

function getLogoAreaFraction(state: QrStudioState): number {
  const size = state.imageOptions.imageSize
  return size * size
}

function buildContrastIssue(
  code: ScanSafetyIssue["code"],
  severity: "error" | "warning",
  title: string,
  message: string,
  control: ScanSafetyIssue["control"],
): ScanSafetyIssue {
  return { code, severity, title, message, control }
}

function analyzeRules(state: QrStudioState, context: ScanSafetyContext): ScanSafetyIssue[] {
  const issues: ScanSafetyIssue[] = []
  const backgroundColors = collectBackgroundColors(state, context)

  if (!state.data.trim()) {
    issues.push({
      code: "EMPTY_QR_DATA",
      severity: "error",
      title: "No QR content",
      message: "Add a URL or payload before sharing this QR code.",
      control: "content",
    })
  }

  if (state.margin < 4) {
    issues.push({
      code: "QUIET_ZONE_TOO_SMALL",
      severity: "error",
      title: "Quiet zone too small",
      message: "Increase margin to at least 4 modules on all sides.",
      control: "encoding",
    })
  }

  const dataContrast = getWorstPairContrast(
    collectDataModuleColors(state),
    backgroundColors,
  )
  const dataContrastSeverity = contrastSeverity(dataContrast)
  if (dataContrastSeverity) {
    issues.push(
      buildContrastIssue(
        "DATA_CONTRAST_LOW",
        dataContrastSeverity,
        "Module contrast too low",
        dataContrastSeverity === "error"
          ? `Data modules need stronger contrast against the background (${ERROR_CONTRAST_MIN}:1 minimum).`
          : `Data module contrast is borderline (${WARNING_CONTRAST_MIN}:1 recommended for reliable scanning).`,
        "pattern",
      ),
    )
  }

  const frameContrast = getWorstPairContrast(
    collectFinderFrameColors(state),
    backgroundColors,
  )
  const frameContrastSeverity = contrastSeverity(frameContrast)
  if (frameContrastSeverity) {
    issues.push(
      buildContrastIssue(
        "FINDER_FRAME_CONTRAST_LOW",
        frameContrastSeverity,
        "Corner frame contrast too low",
        frameContrastSeverity === "error"
          ? "Finder frames may not be detected. Increase contrast between corner frames and background."
          : "Corner frame contrast is weak. Consider a darker frame or lighter background.",
        "corners",
      ),
    )
  }

  const dotColors = collectFinderDotColors(state)
  const frameColors = collectFinderFrameColors(state)
  const dotVsFrame = getWorstPairContrast(dotColors, frameColors)
  const isInvertedFinderDot =
    dotVsFrame !== null && dotVsFrame >= INVERTED_FINDER_DOT_MIN

  if (isInvertedFinderDot) {
    const dotContrastSeverity = contrastSeverity(dotVsFrame)
    if (dotContrastSeverity) {
      issues.push(
        buildContrastIssue(
          "FINDER_DOT_CONTRAST_LOW",
          dotContrastSeverity,
          "Corner dot contrast too low",
          dotContrastSeverity === "error"
            ? "Inner corner dots must contrast clearly with the corner frame."
            : "Corner dot contrast against the frame is borderline for reliable scanning.",
          "corners",
        ),
      )
    }
  }

  if (isCustomCornerDotShape(state.finderPatternInnerSettings.type)) {
    issues.push({
      code: "CUSTOM_CORNER_DOT_RISK",
      severity: "warning",
      title: "Custom corner dot shape",
      message:
        "Decorative corner dots can break finder detection. Use square or circle shapes for maximum reliability.",
      control: "corners",
    })
  }

  if (RISKY_MODULE_STYLES.has(state.dataModulesSettings.type)) {
    issues.push({
      code: "MODULE_SHAPE_RISK",
      severity: "warning",
      title: "Stylized module pattern",
      message:
        "This module style can weaken timing patterns. Square or rounded modules scan more reliably.",
      control: "pattern",
    })
  }

  if (state.backgroundOptions.transparent) {
    issues.push({
      code: "TRANSPARENT_BACKGROUND",
      severity: "warning",
      title: "Transparent background",
      message:
        "Scan reliability depends on whatever sits behind the QR. Use a solid light background when possible.",
      control: "shape",
    })
  }

  if (isModuleSizeTooSmall(state)) {
    issues.push({
      code: "MODULE_SIZE_TOO_SMALL",
      severity: "warning",
      title: "Modules too small",
      message: "Increase QR size or reduce margin so each module is at least 3 pixels wide.",
      control: "encoding",
    })
  }

  if (hasLogo(state)) {
    const logoArea = getLogoAreaFraction(state)
    const ecc = state.qrOptions.errorCorrectionLevel

    if (logoArea > LOGO_AREA_ERROR_THRESHOLD) {
      issues.push({
        code: "LOGO_TOO_LARGE",
        severity: "error",
        title: "Logo too large",
        message: "Reduce logo size to 20% of the QR area or less.",
        control: "logo",
      })
    } else if (logoArea > LOGO_AREA_WARNING_THRESHOLD) {
      issues.push({
        code: "LOGO_TOO_LARGE",
        severity: "warning",
        title: "Logo size is high",
        message: "Large logos reduce scan margin. Consider shrinking the logo or raising error correction.",
        control: "logo",
      })
    }

    if (ecc !== "H" && logoArea >= LOGO_ECC_WARNING_MIN_AREA) {
      issues.push({
        code: "ECC_TOO_LOW_FOR_LOGO",
        severity: logoArea > LOGO_AREA_WARNING_THRESHOLD ? "error" : "warning",
        title: "Error correction too low for logo",
        message: "Set error correction to High (H) when embedding a logo.",
        control: "encoding",
      })
    }
  }

  return issues
}

function computeScore(issues: ScanSafetyIssue[]): number {
  let score = 100

  for (const issue of issues) {
    if (issue.severity === "error") {
      score -= 25
    } else if (issue.severity === "warning") {
      score -= 10
    } else {
      score -= 3
    }
  }

  return Math.max(0, Math.min(100, score))
}

function computeStatus(issues: ScanSafetyIssue[]): ScanSafetyResult["status"] {
  if (issues.some((issue) => issue.severity === "error")) {
    return "invalid"
  }

  if (issues.some((issue) => issue.severity === "warning")) {
    return "warning"
  }

  return "valid"
}

function computeSummary(status: ScanSafetyResult["status"]): string {
  switch (status) {
    case "invalid":
      return "Not scannable"
    case "warning":
      return "Needs attention"
    default:
      return "Valid"
  }
}

/** @deprecated Replaced by paulmillr/qr decode path in `features/qr-code/scan-safety/`. */
export function mergeScanSafetyIssues(
  base: ScanSafetyIssue[],
  extra: ScanSafetyIssue[],
): ScanSafetyIssue[] {
  const seen = new Set(base.map((issue) => issue.code))
  const merged = [...base]

  for (const issue of extra) {
    if (seen.has(issue.code)) {
      continue
    }

    merged.push(issue)
    seen.add(issue.code)
  }

  return merged
}

/** @deprecated Replaced by paulmillr/qr decode path in `features/qr-code/scan-safety/`. */
export function finalizeScanSafetyResult(
  issues: ScanSafetyIssue[],
  decodeProof: ScanSafetyResult["decodeProof"] = { status: "skipped" },
): ScanSafetyResult {
  const status = computeStatus(issues)
  return {
    status,
    score: computeScore(issues),
    summary: computeSummary(status),
    issues,
    decodeProof,
  }
}

/** @deprecated Replaced by paulmillr/qr decode path in `features/qr-code/scan-safety/`. */
export function analyzeQrScanSafety(
  state: QrStudioState,
  context: ScanSafetyContext,
): ScanSafetyResult {
  const issues = analyzeRules(state, context)
  return finalizeScanSafetyResult(issues)
}

export const DECODE_VALIDATED_SUPPRESS_CODES = new Set<ScanSafetyIssue["code"]>([
  "CUSTOM_CORNER_DOT_RISK",
  "MODULE_SHAPE_RISK",
])

export function createDecodeProofFailureIssue(): ScanSafetyIssue {
  return {
    code: "DECODE_PROOF_FAILED",
    severity: "warning",
    title: "Browser decode inconclusive",
    message:
      "This preview could not be decoded in-browser. Camera scanners may still read it — review contrast and quiet zone if scans fail.",
    control: "pattern",
  }
}

export function getEffectiveBackgroundForScanSafety(
  state: QrStudioState,
  cardFill: string,
): string {
  if (state.backgroundOptions.transparent) {
    return cardFill || "#ffffff"
  }

  if (state.backgroundGradient.enabled) {
    const colors = collectGradientColors(state.backgroundGradient)
    if (colors.length >= 2) {
      const worst = getWorstContrast(colors, colors[0])
      if (worst !== null && worst < 2) {
        return colors[1]
      }
    }
  }

  return state.backgroundOptions.color
}

export { getWcagContrast }
