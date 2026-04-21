import qrcode from "qrcode-generator"
import type {
  CornerDotType,
  CornerSquareType,
  ErrorCorrectionLevel,
} from "qr-code-styling"

import {
  DASHBOARD_QR_NODE_ID,
  getDashboardComposeNode,
  resetDashboardQrNodeTransform,
  type DashboardComposeNode,
  type DashboardComposeScene,
  updateDashboardComposeBackground,
  updateDashboardComposeNode,
} from "@/components/qr/dashboard-compose-scene"
import type { StudioDotType } from "@/components/qr/qr-studio-state"
import {
  clampQrSize,
  coerceNumber,
  hasBackgroundImage,
  hasLogoImage,
  type QrStudioState,
} from "@/components/qr/qr-studio-state"

const HIGH_CONTRAST_TARGET = 4.5
const BLOCKING_CONTRAST_FLOOR = 3
const MATERIAL_CONTRAST_IMPROVEMENT = 0.5
const MIN_QUIET_ZONE_MODULES = 4
const MIN_DECORATIVE_MODULE_SIZE = 6
const FALLBACK_DARK_COLOR = "#111827"
const FALLBACK_LIGHT_COLOR = "#f8fafc"
const QR_SCENE_FALLBACK_BACKGROUND = "#ffffff"

const LOGO_AREA_LIMITS: Record<ErrorCorrectionLevel, number> = {
  L: 0.12,
  M: 0.16,
  Q: 0.2,
  H: 0.24,
}

type QrQualityColorTarget = "dots" | "cornersDot" | "cornersSquare"
type QrQualityGradientTarget =
  | "background"
  | "cornersDot"
  | "cornersSquare"
  | "dots"
  | "logo"
type QrQualityCornerTarget = "cornersDot" | "cornersSquare"
export type QrQualitySuggestionImpact =
  | "target-only"
  | "qr-background"
  | "scene-background"
  | "asset-removal"

export type QrQualityStatus = "readable" | "risky" | "unreadable" | "unverified"
export type QrQualitySeverity = "error" | "warning"
export type QrQualityDecodeState = "failure" | "pending" | "success" | "unverified"

export type QrModuleMatrix = {
  moduleCount: number
  modules: boolean[][]
}

export type QrQualityFixDescriptor =
  | {
      type: "disable-gradient"
      target: QrQualityGradientTarget
    }
  | {
      type: "hide-compose-layer"
      nodeId: string
    }
  | {
      type: "reset-qr-transform"
    }
  | {
      type: "set-background-color"
      value: string
    }
  | {
      type: "set-scene-background-color"
      value: string
    }
  | {
      type: "set-corner-shape"
      target: QrQualityCornerTarget
      value: CornerDotType | CornerSquareType
    }
  | {
      type: "set-dot-shape"
      value: StudioDotType
    }
  | {
      type: "set-error-correction"
      value: ErrorCorrectionLevel
    }
  | {
      type: "set-logo-size"
      value: number
    }
  | {
      type: "set-quiet-zone"
      value: number
    }
  | {
      type: "set-solid-color"
      target: QrQualityColorTarget
      value: string
    }

export type QrQualitySuggestionPath = {
  actions: QrQualityFixDescriptor[]
  detail: string
  id: string
  impact: QrQualitySuggestionImpact
  recommended: boolean
  title: string
}

export type QrQualityIssue = {
  detail: string
  id: string
  paths: QrQualitySuggestionPath[]
  scope: string
  severity: QrQualitySeverity
  title: string
}

export type QrQualityDecodeResult =
  | {
      kind: "failure"
      scaleTried: 1 | 2 | null
    }
  | {
      kind: "pending"
    }
  | {
      data: string
      kind: "success"
      scale: 1 | 2
    }
  | {
      kind: "unverified"
      reason: string
    }

export type QrQualityReport = {
  blockingIssueCount: number
  decode: QrQualityDecodeResult
  issues: QrQualityIssue[]
  status: QrQualityStatus
  summary: string
  warningIssueCount: number
}

export type QrQualityFixResult = {
  scene: DashboardComposeScene
  state: QrStudioState
}

type ContrastSuggestionPathCandidate = Omit<QrQualitySuggestionPath, "recommended"> & {
  predictedContrast: number
}

export function buildQrModuleMatrix(state: QrStudioState): QrModuleMatrix | null {
  const data = state.data.trim()

  if (!data) {
    return null
  }

  try {
    const qr = qrcode(state.qrOptions.typeNumber, state.qrOptions.errorCorrectionLevel)
    qr.addData(data, state.qrOptions.mode)
    qr.make()

    const moduleCount = qr.getModuleCount()
    const modules = Array.from({ length: moduleCount }, (_, rowIndex) =>
      Array.from({ length: moduleCount }, (_, columnIndex) =>
        qr.isDark(rowIndex, columnIndex),
      ),
    )

    return {
      moduleCount,
      modules,
    }
  } catch {
    return null
  }
}

export function analyzeQrQuality(
  state: QrStudioState,
  scene: DashboardComposeScene,
): QrQualityReport {
  const matrix = buildQrModuleMatrix(state)

  if (!matrix) {
    return createQrQualityReport([], {
      kind: "pending",
    })
  }

  const issues: QrQualityIssue[] = []
  const backgroundColors = getEffectiveQrBackgroundColors(state, scene)
  const modulePixelSize = getQrModulePixelSize(state, matrix.moduleCount)
  const quietZoneModules = getQuietZoneModules(state, matrix.moduleCount)

  const dotsContrastIssue = createContrastIssue({
    backgroundColors,
    colors: getDotsForegroundColors(state),
    currentColor: state.dotsOptions.color,
    disableGradientTarget: state.dotsColorMode === "gradient" ? "dots" : null,
    id: "dots-contrast",
    scope: "Dots",
    scene,
    state,
    target: "dots",
    title: "Body dots do not contrast enough against the QR background.",
  })

  if (dotsContrastIssue) {
    issues.push(dotsContrastIssue)
  }

  const cornerSquareIssue = createContrastIssue({
    backgroundColors,
    colors: getCornerSquareColors(state),
    currentColor: state.cornersSquareOptions.color,
    disableGradientTarget: state.cornersSquareGradient.enabled
      ? "cornersSquare"
      : null,
    id: "corner-square-contrast",
    scope: "Corner square",
    scene,
    state,
    target: "cornersSquare",
    title: "Corner squares are too close to the QR background.",
  })

  if (cornerSquareIssue) {
    issues.push(cornerSquareIssue)
  }

  const cornerDotIssue = createContrastIssue({
    backgroundColors,
    colors: getCornerDotColors(state),
    currentColor: state.cornersDotOptions.color,
    disableGradientTarget: state.cornersDotGradient.enabled ? "cornersDot" : null,
    id: "corner-dot-contrast",
    scope: "Corner dot",
    scene,
    state,
    target: "cornersDot",
    title: "Finder dots are too close to the QR background.",
  })

  if (cornerDotIssue) {
    issues.push(cornerDotIssue)
  }

  if (quietZoneModules < MIN_QUIET_ZONE_MODULES) {
    const nextMargin = Math.max(
      state.margin + 1,
      Math.ceil(MIN_QUIET_ZONE_MODULES * modulePixelSize),
    )

    issues.push({
      detail: `The quiet zone is ${quietZoneModules.toFixed(1)} modules wide. Scanners expect at least ${MIN_QUIET_ZONE_MODULES}.`,
      paths: [
        createSuggestionPath({
          actions: [
            {
              type: "set-quiet-zone",
              value: nextMargin,
            },
          ],
          detail: `Set the margin to ${nextMargin}px so scanners keep at least ${MIN_QUIET_ZONE_MODULES} modules of clear space.`,
          id: "quiet-zone-margin",
          impact: "target-only",
          title: `Set margin to ${nextMargin}px`,
        }),
      ],
      id: "quiet-zone",
      scope: "Quiet zone",
      severity: quietZoneModules < 2 ? "error" : "warning",
      title: "The outer margin is too small for consistent scanning.",
    })
  }

  if (hasLogoImage(state)) {
    const logoCoverage = getLogoCoverageRatio(state)
    const maxLogoCoverage = LOGO_AREA_LIMITS[state.qrOptions.errorCorrectionLevel]

    if (logoCoverage > maxLogoCoverage * 0.92) {
      const recommendedCoverage = maxLogoCoverage * 0.82
      const recommendedSize = clampLogoSize(Math.sqrt(recommendedCoverage))
      const paths = [
        createSuggestionPath({
          actions: [
            {
              type: "set-logo-size",
              value: recommendedSize,
            },
          ],
          detail: `Shrink the logo to ${(recommendedSize * 100).toFixed(0)}% so it clears more QR modules.`,
          id: "logo-size",
          impact: "target-only",
          title: `Reduce logo to ${(recommendedSize * 100).toFixed(0)}%`,
        }),
      ]

      if (state.qrOptions.errorCorrectionLevel !== "H") {
        paths.push(
          createSuggestionPath({
            actions: [
              {
                type: "set-error-correction",
                value: "H",
              },
            ],
            detail: "Raise error correction to preserve more scanning tolerance around the logo cutout.",
            id: "logo-error-correction",
            impact: "target-only",
            title: "Raise error correction to H",
          }),
        )
      }

      issues.push({
        detail: `The logo covers ${(logoCoverage * 100).toFixed(1)}% of the QR area. ${state.qrOptions.errorCorrectionLevel} correction is safest below ${(maxLogoCoverage * 100).toFixed(0)}%.`,
        paths,
        id: "logo-coverage",
        scope: "Logo",
        severity: logoCoverage > maxLogoCoverage ? "error" : "warning",
        title: "The logo occupies too much of the QR surface.",
      })
    }
  }

  if (isDecorativeDotShape(state.dotsOptions.type)) {
    const severity = modulePixelSize < MIN_DECORATIVE_MODULE_SIZE ? "warning" : "warning"
    const recommendedShape =
      state.dotsOptions.type === "dots" ? ("square" as const) : ("rounded" as const)

    issues.push({
      detail:
        modulePixelSize < MIN_DECORATIVE_MODULE_SIZE
          ? `Each module is only ${modulePixelSize.toFixed(1)}px wide. Decorative dot shapes blur together below ${MIN_DECORATIVE_MODULE_SIZE}px.`
          : `Decorative dot shapes look good, but they leave less room for scanning tolerance than square or rounded modules.`,
      paths: [
        createSuggestionPath({
          actions: [
            {
              type: "set-dot-shape",
              value: recommendedShape,
            },
          ],
          detail: `Use ${recommendedShape} modules for a sturdier scan pattern at this size.`,
          id: "decorative-dot-shape",
          impact: "target-only",
          title: `Switch to ${recommendedShape}`,
        }),
      ],
      id: "decorative-dot-shape",
      scope: "Dot shape",
      severity,
      title: "Decorative body modules reduce scan resilience.",
    })
  }

  const overlappingLayerIssues = getOverlappingComposeLayerIssues(scene)
  issues.push(...overlappingLayerIssues)

  return createQrQualityReport(issues, {
    kind: "pending",
  })
}

export function mergeQrQualityReportWithDecode(
  report: QrQualityReport,
  decode: QrQualityDecodeResult,
): QrQualityReport {
  const blockingIssueCount = report.issues.filter(
    (issue) => issue.severity === "error",
  ).length
  const warningIssueCount = report.issues.filter(
    (issue) => issue.severity === "warning",
  ).length

  if (decode.kind === "unverified" || decode.kind === "pending") {
    return {
      ...report,
      blockingIssueCount,
      decode,
      status: "unverified",
      summary:
        decode.kind === "pending"
          ? "Checking the composed dashboard scene for scan reliability."
          : `${decode.reason} Heuristic checks found ${getIssueCountSummary(blockingIssueCount, warningIssueCount)}.`,
      warningIssueCount,
    }
  }

  if (decode.kind === "success") {
    return {
      ...report,
      blockingIssueCount,
      decode,
      status:
        blockingIssueCount === 0 && warningIssueCount === 0 ? "readable" : "risky",
      summary:
        blockingIssueCount === 0 && warningIssueCount === 0
          ? `The composed dashboard scene decoded successfully at ${decode.scale}x.`
          : `The scene decoded at ${decode.scale}x, but ${getIssueCountSummary(blockingIssueCount, warningIssueCount)} still deserve attention.`,
      warningIssueCount,
    }
  }

  return {
    ...report,
    blockingIssueCount,
    decode,
    status: "unreadable",
    summary:
      blockingIssueCount > 0
        ? `The composed dashboard scene failed to decode, and ${getIssueCountSummary(blockingIssueCount, warningIssueCount)} were detected.`
        : "The composed dashboard scene failed to decode at 1x and 2x.",
    warningIssueCount,
  }
}

export function applyQrQualityFix(
  state: QrStudioState,
  scene: DashboardComposeScene,
  action: QrQualityFixDescriptor,
): QrQualityFixResult {
  const nextState = structuredClone(state) as QrStudioState
  let nextScene = structuredClone(scene) as DashboardComposeScene

  switch (action.type) {
    case "set-solid-color":
      if (action.target === "dots") {
        nextState.dotsColorMode = "solid"
        nextState.dotsOptions.color = action.value
        nextState.dotsGradient.enabled = false
      }

      if (action.target === "cornersSquare") {
        nextState.cornersSquareOptions.color = action.value
        nextState.cornersSquareGradient.enabled = false
      }

      if (action.target === "cornersDot") {
        nextState.cornersDotOptions.color = action.value
        nextState.cornersDotGradient.enabled = false
      }

      break
    case "disable-gradient":
      if (action.target === "dots") {
        nextState.dotsGradient.enabled = false
        nextState.dotsColorMode = "solid"
      }

      if (action.target === "cornersSquare") {
        nextState.cornersSquareGradient.enabled = false
      }

      if (action.target === "cornersDot") {
        nextState.cornersDotGradient.enabled = false
      }

      if (action.target === "background") {
        nextState.backgroundGradient.enabled = false
      }

      if (action.target === "logo") {
        nextState.logoGradient.enabled = false
      }

      break
    case "set-error-correction":
      nextState.qrOptions.errorCorrectionLevel = action.value
      break
    case "set-logo-size":
      nextState.imageOptions.imageSize = clampLogoSize(action.value)
      break
    case "set-quiet-zone":
      nextState.margin = Math.max(0, Math.round(action.value))
      break
    case "set-dot-shape":
      nextState.dotsOptions.type = action.value
      break
    case "set-corner-shape":
      if (action.target === "cornersSquare") {
        nextState.cornersSquareOptions.type = action.value as CornerSquareType
      } else {
        nextState.cornersDotOptions.type = action.value as CornerDotType
      }

      break
    case "set-background-color":
      nextState.backgroundOptions.color = action.value
      nextState.backgroundOptions.transparent = false
      nextState.backgroundGradient.enabled = false
      nextState.backgroundImage = {
        presetColor: undefined,
        presetId: undefined,
        source: "none",
        value: undefined,
      }
      break
    case "set-scene-background-color":
      nextScene = updateDashboardComposeBackground(nextScene, {
        color: action.value,
        mode: "solid",
      })
      break
    case "hide-compose-layer":
      nextScene = updateDashboardComposeNode(nextScene, action.nodeId, {
        isVisible: false,
      })
      break
    case "reset-qr-transform":
      nextScene = resetDashboardQrNodeTransform(nextScene)
      break
  }

  return {
    scene: nextScene,
    state: nextState,
  }
}

export function applyQrQualitySuggestionPath(
  state: QrStudioState,
  scene: DashboardComposeScene,
  path: Pick<QrQualitySuggestionPath, "actions">,
): QrQualityFixResult {
  return path.actions.reduce(
    (result, action) => applyQrQualityFix(result.state, result.scene, action),
    {
      scene,
      state,
    },
  )
}

function createQrQualityReport(
  issues: QrQualityIssue[],
  decode: QrQualityDecodeResult,
): QrQualityReport {
  const blockingIssueCount = issues.filter((issue) => issue.severity === "error").length
  const warningIssueCount = issues.filter((issue) => issue.severity === "warning").length

  return {
    blockingIssueCount,
    decode,
    issues,
    status:
      blockingIssueCount > 0 ? "unreadable" : warningIssueCount > 0 ? "risky" : "readable",
    summary:
      issues.length === 0
        ? "No readability risks detected in the current QR styling."
        : `Heuristic checks found ${getIssueCountSummary(blockingIssueCount, warningIssueCount)}.`,
    warningIssueCount,
  }
}

function createContrastIssue({
  backgroundColors,
  colors,
  currentColor,
  disableGradientTarget,
  id,
  scope,
  scene,
  state,
  target,
  title,
}: {
  backgroundColors: string[]
  colors: string[]
  currentColor: string
  disableGradientTarget: QrQualityGradientTarget | null
  id: string
  scope: string
  scene: DashboardComposeScene
  state: QrStudioState
  target: QrQualityColorTarget
  title: string
}) {
  const contrast = getWeakestContrastRatio(colors, backgroundColors)

  if (!Number.isFinite(contrast) || contrast >= HIGH_CONTRAST_TARGET) {
    return null
  }

  const suggestedColor = suggestReadableColor(
    currentColor,
    backgroundColors,
    HIGH_CONTRAST_TARGET,
  )
  const paths = buildRankedContrastSuggestionPaths({
    backgroundColors,
    colors,
    contrast,
    disableGradientTarget,
    id,
    scope,
    scene,
    state,
    suggestedColor,
    target,
  })

  return {
    detail: `The weakest sampled contrast is ${contrast.toFixed(2)}:1. Aim for at least ${HIGH_CONTRAST_TARGET}:1.`,
    id,
    paths,
    scope,
    severity: contrast < BLOCKING_CONTRAST_FLOOR ? "error" : "warning",
    title,
  } satisfies QrQualityIssue
}

function getEffectiveQrBackgroundColors(
  state: QrStudioState,
  scene: DashboardComposeScene,
) {
  if (state.backgroundGradient.enabled) {
    return getGradientColors(state.backgroundGradient)
  }

  if (state.backgroundOptions.transparent) {
    return getSceneBackgroundColors(scene)
  }

  return [normalizeHexColor(state.backgroundOptions.color) ?? QR_SCENE_FALLBACK_BACKGROUND]
}

function getSceneBackgroundColors(scene: DashboardComposeScene) {
  if (scene.background.mode === "gradient") {
    return getGradientColors(scene.background.gradient)
  }

  if (scene.background.mode === "solid") {
    return [normalizeHexColor(scene.background.color) ?? QR_SCENE_FALLBACK_BACKGROUND]
  }

  return [QR_SCENE_FALLBACK_BACKGROUND]
}

function getGradientColors(
  gradient: Pick<QrStudioState["backgroundGradient"], "colorStops">,
) {
  return gradient.colorStops
    .map((stop) => normalizeHexColor(stop.color))
    .filter((color): color is string => Boolean(color))
}

function getDotsForegroundColors(state: QrStudioState) {
  if (state.dotsColorMode === "gradient") {
    return getGradientColors(state.dotsGradient)
  }

  if (state.dotsColorMode === "palette") {
    return state.dotsPalette
      .map((color) => normalizeHexColor(color))
      .filter((color): color is string => Boolean(color))
  }

  return [normalizeHexColor(state.dotsOptions.color) ?? FALLBACK_DARK_COLOR]
}

function getCornerSquareColors(state: QrStudioState) {
  if (state.cornersSquareGradient.enabled) {
    return getGradientColors(state.cornersSquareGradient)
  }

  return [
    normalizeHexColor(state.cornersSquareOptions.color) ?? FALLBACK_DARK_COLOR,
  ]
}

function getCornerDotColors(state: QrStudioState) {
  if (state.cornersDotGradient.enabled) {
    return getGradientColors(state.cornersDotGradient)
  }

  return [normalizeHexColor(state.cornersDotOptions.color) ?? FALLBACK_DARK_COLOR]
}

function getQuietZoneModules(state: QrStudioState, moduleCount: number) {
  const modulePixelSize = getQrModulePixelSize(state, moduleCount)

  if (!Number.isFinite(modulePixelSize) || modulePixelSize <= 0) {
    return 0
  }

  return state.margin / modulePixelSize
}

function getQrModulePixelSize(state: QrStudioState, moduleCount: number) {
  const qrSize = clampQrSize(Math.min(state.width, state.height))
  const usableSize = Math.max(1, qrSize - state.margin * 2)

  return usableSize / Math.max(1, moduleCount)
}

function getLogoCoverageRatio(state: QrStudioState) {
  const size = clampLogoSize(state.imageOptions.imageSize)
  return size * size
}

function clampLogoSize(value: number) {
  return coerceNumber(value, 0, 1, 0.4)
}

function isDecorativeDotShape(type: StudioDotType) {
  return (
    type === "classy" ||
    type === "classy-rounded" ||
    type === "diamond" ||
    type === "dots" ||
    type === "extra-rounded" ||
    type === "heart"
  )
}

function getOverlappingComposeLayerIssues(scene: DashboardComposeScene) {
  const qrNode = getDashboardComposeNode(scene, DASHBOARD_QR_NODE_ID)

  if (!qrNode || !qrNode.isVisible) {
    return []
  }

  const qrBounds = getNodeBounds(qrNode)

  return scene.nodes
    .filter(
      (node) =>
        node.kind === "image" &&
        node.isVisible &&
        node.zIndex > qrNode.zIndex &&
        getRectIntersectionArea(qrBounds, getNodeBounds(node)) > 0,
    )
    .map((node) => ({
      detail: `${node.name} overlaps the QR area in the composed scene and can hide modules from scanners.`,
      paths: [
        createSuggestionPath({
          actions: [
            {
              type: "hide-compose-layer",
              nodeId: node.id,
            },
          ],
          detail: `Hide ${node.name} so it no longer obscures the QR area.`,
          id: `compose-overlap-${node.id}-hide-layer`,
          impact: "target-only",
          title: `Hide ${node.name}`,
        }),
        createSuggestionPath({
          actions: [
            {
              type: "reset-qr-transform",
            },
          ],
          detail: "Move the QR back to its default centered position away from overlapping layers.",
          id: `compose-overlap-${node.id}-reset-qr`,
          impact: "target-only",
          title: "Reset QR position",
        }),
      ],
      id: `compose-overlap-${node.id}`,
      scope: node.name,
      severity: "error" as const,
      title: "A composition layer overlaps the QR code.",
    }))
}

function buildRankedContrastSuggestionPaths({
  backgroundColors,
  colors,
  contrast,
  disableGradientTarget,
  id,
  scope,
  scene,
  state,
  suggestedColor,
  target,
}: {
  backgroundColors: string[]
  colors: string[]
  contrast: number
  disableGradientTarget: QrQualityGradientTarget | null
  id: string
  scope: string
  scene: DashboardComposeScene
  state: QrStudioState
  suggestedColor: string
  target: QrQualityColorTarget
}) {
  const candidates = buildContrastSuggestionPathCandidates({
    backgroundColors,
    colors,
    disableGradientTarget,
    id,
    scope,
    scene,
    state,
    suggestedColor,
    target,
  })

  const acceptedCandidates =
    candidates.filter((candidate) => candidate.predictedContrast >= HIGH_CONTRAST_TARGET)
      .length > 0
      ? candidates.filter((candidate) => candidate.predictedContrast >= HIGH_CONTRAST_TARGET)
      : candidates.filter(
          (candidate) =>
            candidate.predictedContrast >= BLOCKING_CONTRAST_FLOOR &&
            candidate.predictedContrast - contrast >= MATERIAL_CONTRAST_IMPROVEMENT,
        )

  const rankedCandidates =
    acceptedCandidates.length > 0
      ? acceptedCandidates
      : candidates.length > 0
        ? [rankContrastSuggestionPathCandidates(candidates)[0] as ContrastSuggestionPathCandidate]
        : []

  return rankContrastSuggestionPathCandidates(rankedCandidates)
    .slice(0, 3)
    .map((candidate, index) => ({
      ...candidate,
      recommended: index === 0,
    }))
}

function buildContrastSuggestionPathCandidates({
  backgroundColors,
  colors,
  disableGradientTarget,
  id,
  scope,
  scene,
  state,
  suggestedColor,
  target,
}: {
  backgroundColors: string[]
  colors: string[]
  disableGradientTarget: QrQualityGradientTarget | null
  id: string
  scope: string
  scene: DashboardComposeScene
  state: QrStudioState
  suggestedColor: string
  target: QrQualityColorTarget
}) {
  const targetActions: QrQualityFixDescriptor[] = []

  if (disableGradientTarget) {
    targetActions.push({
      type: "disable-gradient",
      target: disableGradientTarget,
    })
  }

  targetActions.push({
    type: "set-solid-color",
    target,
    value: suggestedColor,
  })

  const candidates: ContrastSuggestionPathCandidate[] = [
    {
      actions: targetActions,
      detail: `Use ${suggestedColor} on the ${scope.toLowerCase()} to restore clear separation from the background.`,
      id: `${id}-target-only`,
      impact: "target-only",
      predictedContrast: getWeakestContrastRatio([suggestedColor], backgroundColors),
      title: `Change ${scope.toLowerCase()} color`,
    },
  ]

  if (hasBackgroundImage(state)) {
    const backgroundColor = suggestReadableBackgroundColor(
      getQrBackgroundSeedColor(state),
      colors,
      HIGH_CONTRAST_TARGET,
    )
    const backgroundActions: QrQualityFixDescriptor[] = []

    if (state.backgroundGradient.enabled) {
      backgroundActions.push({
        type: "disable-gradient",
        target: "background",
      })
    }

    backgroundActions.push({
      type: "set-background-color",
      value: backgroundColor,
    })

    candidates.push({
      actions: backgroundActions,
      detail: `Remove the background image and replace it with ${backgroundColor} so the QR has a stable backing surface.`,
      id: `${id}-asset-removal`,
      impact: "asset-removal",
      predictedContrast: getWeakestContrastRatio(colors, [backgroundColor]),
      title: "Remove background image",
    })

    return candidates
  }

  if (state.backgroundOptions.transparent) {
    const sceneBackgroundColor = suggestReadableBackgroundColor(
      getSceneBackgroundSeedColor(scene),
      colors,
      HIGH_CONTRAST_TARGET,
    )

    candidates.push({
      actions: [
        {
          type: "set-scene-background-color",
          value: sceneBackgroundColor,
        },
      ],
      detail: `Use ${sceneBackgroundColor} on the canvas because the QR background is currently transparent.`,
      id: `${id}-scene-background`,
      impact: "scene-background",
      predictedContrast: getWeakestContrastRatio(colors, [sceneBackgroundColor]),
      title: "Change canvas background",
    })

    return candidates
  }

  const qrBackgroundColor = suggestReadableBackgroundColor(
    getQrBackgroundSeedColor(state),
    colors,
    HIGH_CONTRAST_TARGET,
  )
  const qrBackgroundActions: QrQualityFixDescriptor[] = []

  if (state.backgroundGradient.enabled) {
    qrBackgroundActions.push({
      type: "disable-gradient",
      target: "background",
    })
  }

  qrBackgroundActions.push({
    type: "set-background-color",
    value: qrBackgroundColor,
  })

  candidates.push({
    actions: qrBackgroundActions,
    detail: `Switch the QR background to ${qrBackgroundColor} so the existing ${scope.toLowerCase()} stay readable.`,
    id: `${id}-qr-background`,
    impact: "qr-background",
    predictedContrast: getWeakestContrastRatio(colors, [qrBackgroundColor]),
    title: "Change QR background",
  })

  return candidates
}

function rankContrastSuggestionPathCandidates(
  candidates: ContrastSuggestionPathCandidate[],
) {
  return [...candidates].sort((left, right) => {
    if (left.predictedContrast !== right.predictedContrast) {
      return right.predictedContrast - left.predictedContrast
    }

    if (left.actions.length !== right.actions.length) {
      return left.actions.length - right.actions.length
    }

    if (getImpactOrder(left.impact) !== getImpactOrder(right.impact)) {
      return getImpactOrder(left.impact) - getImpactOrder(right.impact)
    }

    return left.id.localeCompare(right.id)
  })
}

function getImpactOrder(impact: QrQualitySuggestionImpact) {
  switch (impact) {
    case "target-only":
      return 0
    case "qr-background":
      return 1
    case "scene-background":
      return 2
    case "asset-removal":
      return 3
  }
}

function createSuggestionPath({
  actions,
  detail,
  id,
  impact,
  recommended = false,
  title,
}: {
  actions: QrQualityFixDescriptor[]
  detail: string
  id: string
  impact: QrQualitySuggestionImpact
  recommended?: boolean
  title: string
}) {
  return {
    actions,
    detail,
    id,
    impact,
    recommended,
    title,
  }
}

function getQrBackgroundSeedColor(state: QrStudioState) {
  if (state.backgroundGradient.enabled) {
    return (
      normalizeHexColor(state.backgroundGradient.colorStops[0]?.color) ??
      normalizeHexColor(state.backgroundOptions.color) ??
      QR_SCENE_FALLBACK_BACKGROUND
    )
  }

  return normalizeHexColor(state.backgroundOptions.color) ?? QR_SCENE_FALLBACK_BACKGROUND
}

function getSceneBackgroundSeedColor(scene: DashboardComposeScene) {
  if (scene.background.mode === "gradient") {
    return (
      normalizeHexColor(scene.background.gradient.colorStops[0]?.color) ??
      normalizeHexColor(scene.background.color) ??
      QR_SCENE_FALLBACK_BACKGROUND
    )
  }

  return normalizeHexColor(scene.background.color) ?? QR_SCENE_FALLBACK_BACKGROUND
}

function getNodeBounds(node: DashboardComposeNode) {
  const width = node.naturalWidth * node.scale
  const height = node.naturalHeight * node.scale
  const centerX = node.x + width * 0.5
  const centerY = node.y + height * 0.5
  const radians = (node.rotation * Math.PI) / 180
  const corners = [
    rotatePoint(-width * 0.5, -height * 0.5, radians),
    rotatePoint(width * 0.5, -height * 0.5, radians),
    rotatePoint(width * 0.5, height * 0.5, radians),
    rotatePoint(-width * 0.5, height * 0.5, radians),
  ]

  const xValues = corners.map((corner) => corner.x + centerX)
  const yValues = corners.map((corner) => corner.y + centerY)

  return {
    bottom: Math.max(...yValues),
    left: Math.min(...xValues),
    right: Math.max(...xValues),
    top: Math.min(...yValues),
  }
}

function rotatePoint(x: number, y: number, radians: number) {
  return {
    x: x * Math.cos(radians) - y * Math.sin(radians),
    y: x * Math.sin(radians) + y * Math.cos(radians),
  }
}

function getRectIntersectionArea(
  first: { bottom: number; left: number; right: number; top: number },
  second: { bottom: number; left: number; right: number; top: number },
) {
  const overlapWidth = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left))
  const overlapHeight = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top))

  return overlapWidth * overlapHeight
}

function getWeakestContrastRatio(colors: string[], backgroundColors: string[]) {
  let weakestContrast = Number.POSITIVE_INFINITY

  for (const color of colors) {
    const foreground = hexToRgb(color)

    if (!foreground) {
      continue
    }

    for (const backgroundColor of backgroundColors) {
      const background = hexToRgb(backgroundColor)

      if (!background) {
        continue
      }

      weakestContrast = Math.min(
        weakestContrast,
        getContrastRatio(foreground, background),
      )
    }
  }

  return weakestContrast
}

function suggestReadableColor(
  currentColor: string,
  backgroundColors: string[],
  targetContrast: number,
) {
  return suggestReadableColorAgainstPalette(currentColor, backgroundColors, targetContrast)
}

function suggestReadableBackgroundColor(
  currentColor: string,
  foregroundColors: string[],
  targetContrast: number,
) {
  return suggestReadableColorAgainstPalette(currentColor, foregroundColors, targetContrast)
}

function suggestReadableColorAgainstPalette(
  currentColor: string,
  comparisonColors: string[],
  targetContrast: number,
) {
  const normalizedCurrent = normalizeHexColor(currentColor)
  const currentRgb = normalizedCurrent ? hexToRgb(normalizedCurrent) : null
  const comparisonRgb = comparisonColors
    .map((color) => hexToRgb(color))
    .filter((color): color is RgbColor => Boolean(color))

  if (!currentRgb || comparisonRgb.length === 0) {
    return getFallbackContrastColor(comparisonColors)
  }

  const hsl = rgbToHsl(currentRgb)
  const averageBackgroundLuminance =
    comparisonRgb.reduce((total, color) => total + getRelativeLuminance(color), 0) /
    comparisonRgb.length
  const candidateLightnesses =
    averageBackgroundLuminance > 0.45
      ? Array.from({ length: 101 }, (_, index) => 100 - index)
      : Array.from({ length: 101 }, (_, index) => index)

  for (const lightness of candidateLightnesses) {
    const candidate = hslToRgb({
      h: hsl.h,
      l: lightness / 100,
      s: hsl.s,
    })

    const hasEnoughContrast = comparisonRgb.every(
      (background) => getContrastRatio(candidate, background) >= targetContrast,
    )

    if (hasEnoughContrast) {
      return rgbToHex(candidate)
    }
  }

  return getFallbackContrastColor(comparisonColors)
}

function getFallbackContrastColor(backgroundColors: string[]) {
  const backgroundRgb = backgroundColors
    .map((color) => hexToRgb(color))
    .filter((color): color is RgbColor => Boolean(color))

  if (backgroundRgb.length === 0) {
    return FALLBACK_DARK_COLOR
  }

  const averageBackgroundLuminance =
    backgroundRgb.reduce((total, color) => total + getRelativeLuminance(color), 0) /
    backgroundRgb.length

  return averageBackgroundLuminance > 0.45 ? FALLBACK_DARK_COLOR : FALLBACK_LIGHT_COLOR
}

type RgbColor = {
  b: number
  g: number
  r: number
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim()

  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  return null
}

function hexToRgb(value: string): RgbColor | null {
  const normalized = normalizeHexColor(value)

  if (!normalized) {
    return null
  }

  return {
    b: Number.parseInt(normalized.slice(5, 7), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    r: Number.parseInt(normalized.slice(1, 3), 16),
  }
}

function rgbToHex(color: RgbColor) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g
    .toString(16)
    .padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`
}

function rgbToHsl(color: RgbColor) {
  const r = color.r / 255
  const g = color.g / 255
  const b = color.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, l, s: 0 }
  }

  const delta = max - min
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let h = 0

  switch (max) {
    case r:
      h = (g - b) / delta + (g < b ? 6 : 0)
      break
    case g:
      h = (b - r) / delta + 2
      break
    default:
      h = (r - g) / delta + 4
      break
  }

  return {
    h: h / 6,
    l,
    s,
  }
}

function hslToRgb(color: { h: number; l: number; s: number }): RgbColor {
  if (color.s === 0) {
    const channel = Math.round(color.l * 255)

    return { b: channel, g: channel, r: channel }
  }

  const hueToChannel = (p: number, q: number, t: number) => {
    let nextT = t

    if (nextT < 0) {
      nextT += 1
    }

    if (nextT > 1) {
      nextT -= 1
    }

    if (nextT < 1 / 6) {
      return p + (q - p) * 6 * nextT
    }

    if (nextT < 1 / 2) {
      return q
    }

    if (nextT < 2 / 3) {
      return p + (q - p) * (2 / 3 - nextT) * 6
    }

    return p
  }

  const q =
    color.l < 0.5 ? color.l * (1 + color.s) : color.l + color.s - color.l * color.s
  const p = 2 * color.l - q

  return {
    b: Math.round(hueToChannel(p, q, color.h - 1 / 3) * 255),
    g: Math.round(hueToChannel(p, q, color.h) * 255),
    r: Math.round(hueToChannel(p, q, color.h + 1 / 3) * 255),
  }
}

function getContrastRatio(foreground: RgbColor, background: RgbColor) {
  const foregroundLuminance = getRelativeLuminance(foreground)
  const backgroundLuminance = getRelativeLuminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

function getRelativeLuminance(color: RgbColor) {
  const normalizeChannel = (channel: number) => {
    const normalized = channel / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  }

  return (
    normalizeChannel(color.r) * 0.2126 +
    normalizeChannel(color.g) * 0.7152 +
    normalizeChannel(color.b) * 0.0722
  )
}

function getIssueCountSummary(blockingIssueCount: number, warningIssueCount: number) {
  const fragments: string[] = []

  if (blockingIssueCount > 0) {
    fragments.push(
      `${blockingIssueCount} blocking ${blockingIssueCount === 1 ? "issue" : "issues"}`,
    )
  }

  if (warningIssueCount > 0) {
    fragments.push(
      `${warningIssueCount} warning ${warningIssueCount === 1 ? "issue" : "issues"}`,
    )
  }

  if (fragments.length === 0) {
    return "no issues"
  }

  return fragments.join(" and ")
}
