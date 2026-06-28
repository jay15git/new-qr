import type { ScanSafetyResult } from "@/features/qr-code/scan-safety/types"
import {
  PENDING_SCAN_SAFETY_RESULT,
  SKIPPED_SCAN_SAFETY_RESULT,
} from "@/features/qr-code/scan-safety/types"

export function createSkippedScannabilityResult(expectedText = ""): ScanSafetyResult {
  return {
    ...SKIPPED_SCAN_SAFETY_RESULT,
    expectedText,
  }
}

export function createPendingScannabilityResult(expectedText: string): ScanSafetyResult {
  return {
    ...PENDING_SCAN_SAFETY_RESULT,
    expectedText,
  }
}

export function evaluateScannability(
  expectedText: string,
  decodedText: string | null,
): ScanSafetyResult {
  if (decodedText === expectedText) {
    return {
      status: "valid",
      summary: "Valid",
      expectedText,
      decodedText,
    }
  }

  return {
    status: "invalid",
    summary: "Not scannable",
    expectedText,
    decodedText,
  }
}

export function shouldSkipScannabilityCheck(
  contentIsValid: boolean,
  expectedText: string,
  enabled: boolean,
): boolean {
  return !enabled || !contentIsValid || expectedText.length === 0
}
