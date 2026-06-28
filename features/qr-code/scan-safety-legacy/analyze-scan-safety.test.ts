import { describe, expect, it } from "vitest"

import { createDefaultQrStudioState } from "@/features/qr-code/model/state"
import {
  analyzeQrScanSafety,
  finalizeScanSafetyResult,
  mergeScanSafetyIssues,
} from "@/features/qr-code/scan-safety-legacy/analyze-scan-safety"
import { getWcagContrast, ERROR_CONTRAST_MIN } from "@/features/qr-code/scan-safety-legacy/contrast"

const DEFAULT_CONTEXT = { effectiveBackgroundColor: "#ffffff" }

describe("analyzeQrScanSafety", () => {
  it("returns valid for the default studio state", () => {
    const state = createDefaultQrStudioState()
    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(result.status).toBe("valid")
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.summary).toBe("Valid")
    expect(result.issues).toHaveLength(0)
  })

  it("flags quiet zone below 4 modules", () => {
    const state = createDefaultQrStudioState()
    state.margin = 2

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(result.status).toBe("invalid")
    expect(result.issues.some((issue) => issue.code === "QUIET_ZONE_TOO_SMALL")).toBe(true)
  })

  it("flags low finder frame contrast", () => {
    const state = createDefaultQrStudioState()
    state.finderPatternOuterSettings.color = "#cbd5e1"
    state.backgroundOptions.color = "#e2e8f0"
    state.backgroundOptions.transparent = false

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)
    const contrast = getWcagContrast(
      state.finderPatternOuterSettings.color,
      state.backgroundOptions.color,
    )

    expect(contrast).not.toBeNull()
    expect(contrast!).toBeLessThan(ERROR_CONTRAST_MIN)
    expect(
      result.issues.some((issue) => issue.code === "FINDER_FRAME_CONTRAST_LOW"),
    ).toBe(true)
  })

  it("flags large logo with non-H error correction", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "url",
      value: "https://example.com/logo.png",
      presetId: undefined,
      presetColor: undefined,
    }
    state.imageOptions.imageSize = 0.5
    state.qrOptions.errorCorrectionLevel = "M"

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(result.issues.some((issue) => issue.code === "LOGO_TOO_LARGE")).toBe(true)
    expect(result.issues.some((issue) => issue.code === "ECC_TOO_LOW_FOR_LOGO")).toBe(true)
  })

  it("warns for custom corner dot shapes", () => {
    const state = createDefaultQrStudioState()
    state.finderPatternInnerSettings.type = "orbit-weave"

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(result.status).toBe("warning")
    expect(result.issues.some((issue) => issue.code === "CUSTOM_CORNER_DOT_RISK")).toBe(true)
  })

  it("warns for transparent backgrounds", () => {
    const state = createDefaultQrStudioState()
    state.backgroundOptions.transparent = true

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(result.issues.some((issue) => issue.code === "TRANSPARENT_BACKGROUND")).toBe(
      true,
    )
  })

  it("does not flag solid finder dots that match the frame color", () => {
    const state = createDefaultQrStudioState()
    state.finderPatternOuterSettings.color = "#111827"
    state.finderPatternInnerSettings.color = "#111827"

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(
      result.issues.some((issue) => issue.code === "FINDER_DOT_CONTRAST_LOW"),
    ).toBe(false)
  })

  it("flags inverted finder dots with weak frame contrast", () => {
    const state = createDefaultQrStudioState()
    state.finderPatternOuterSettings.color = "#111827"
    state.finderPatternInnerSettings.color = "#475569"
    state.backgroundOptions.color = "#ffffff"
    state.backgroundOptions.transparent = false

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(
      result.issues.some((issue) => issue.code === "FINDER_DOT_CONTRAST_LOW"),
    ).toBe(true)
  })

  it("skips ECC warning for tiny logos", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "url",
      value: "https://example.com/logo.png",
      presetId: undefined,
      presetColor: undefined,
    }
    state.imageOptions.imageSize = 0.2
    state.qrOptions.errorCorrectionLevel = "M"

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(result.issues.some((issue) => issue.code === "ECC_TOO_LOW_FOR_LOGO")).toBe(false)
  })

  it("flags empty QR data", () => {
    const state = createDefaultQrStudioState()
    state.data = "   "

    const result = analyzeQrScanSafety(state, DEFAULT_CONTEXT)

    expect(result.status).toBe("invalid")
    expect(result.issues.some((issue) => issue.code === "EMPTY_QR_DATA")).toBe(true)
  })
})

describe("scan safety helpers", () => {
  it("merges decode issues without duplicating codes", () => {
    const base = analyzeQrScanSafety(createDefaultQrStudioState(), DEFAULT_CONTEXT).issues
    const merged = mergeScanSafetyIssues(base, [
      {
        code: "DECODE_PROOF_FAILED",
        severity: "warning",
        title: "Browser decode inconclusive",
        message: "Could not decode.",
        control: "pattern",
      },
    ])

    expect(merged.some((issue) => issue.code === "DECODE_PROOF_FAILED")).toBe(true)
  })

  it("computes warning status when decode proof issue is merged", () => {
    const result = finalizeScanSafetyResult([
      {
        code: "DECODE_PROOF_FAILED",
        severity: "warning",
        title: "Browser decode inconclusive",
        message: "Could not decode.",
        control: "pattern",
      },
    ])

    expect(result.status).toBe("warning")
    expect(result.summary).toBe("Needs attention")
  })
})
