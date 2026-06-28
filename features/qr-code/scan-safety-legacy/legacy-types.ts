export type ScanSafetyStatus = "valid" | "warning" | "invalid"

export type ScanSafetySeverity = "error" | "warning" | "info"

export type ScanSafetyControl =
  | "corners"
  | "pattern"
  | "logo"
  | "encoding"
  | "shape"
  | "content"

export type ScanSafetyIssueCode =
  | "QUIET_ZONE_TOO_SMALL"
  | "DATA_CONTRAST_LOW"
  | "FINDER_FRAME_CONTRAST_LOW"
  | "FINDER_DOT_CONTRAST_LOW"
  | "CUSTOM_CORNER_DOT_RISK"
  | "MODULE_SHAPE_RISK"
  | "LOGO_TOO_LARGE"
  | "ECC_TOO_LOW_FOR_LOGO"
  | "TRANSPARENT_BACKGROUND"
  | "MODULE_SIZE_TOO_SMALL"
  | "EMPTY_QR_DATA"
  | "DECODE_PROOF_FAILED"

export type ScanSafetyIssue = {
  code: ScanSafetyIssueCode
  severity: ScanSafetySeverity
  title: string
  message: string
  control: ScanSafetyControl
}

export type ScanSafetyContext = {
  effectiveBackgroundColor: string
}

export type ScanSafetyResult = {
  status: ScanSafetyStatus
  score: number
  summary: string
  issues: ScanSafetyIssue[]
  decodeProof: {
    status: "passed" | "failed" | "pending" | "skipped"
  }
}

export const DEFAULT_SCAN_SAFETY_RESULT: ScanSafetyResult = {
  status: "valid",
  score: 100,
  summary: "Valid",
  issues: [],
  decodeProof: { status: "skipped" },
}
