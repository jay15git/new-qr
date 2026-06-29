import {
  getAssetValue,
  hasActiveBackgroundShapeOptions,
  resolveBitjsonMotionPreset,
  type QrStudioState,
} from "@/features/qr-code/model/state"
import type {
  NewQrCodeProps,
  QrFinderInnerStyle,
  QrFinderOuterStyle,
  QrModuleStyle,
} from "@new-qr/qr"

function mapBackground(state: QrStudioState): NewQrCodeProps["background"] {
  const backgroundImage = getAssetValue(state.backgroundImage)
  const customBackgroundSurfaceActive =
    !backgroundImage &&
    (state.backgroundShapeId !== "none" ||
      hasActiveBackgroundShapeOptions(state.backgroundShapeOptions))

  if (
    backgroundImage ||
    customBackgroundSurfaceActive ||
    state.backgroundOptions.transparent
  ) {
    return "transparent"
  }

  return state.backgroundOptions.color
}

function mapStudioGradient(
  gradient: QrStudioState["dataModulesGradient"],
  enabled: boolean,
): NewQrCodeProps["gradient"] {
  if (!enabled || !gradient.enabled) {
    return "none"
  }

  return {
    type: gradient.type,
    rotation: gradient.rotation,
    stops: [
      {
        offset: gradient.colorStops[0].offset,
        color: gradient.colorStops[0].color,
      },
      {
        offset: gradient.colorStops[1].offset,
        color: gradient.colorStops[1].color,
      },
    ],
  }
}

function mapBackgroundGradient(state: QrStudioState): NewQrCodeProps["backgroundGradient"] {
  const backgroundImage = getAssetValue(state.backgroundImage)
  const customBackgroundSurfaceActive =
    !backgroundImage &&
    (state.backgroundShapeId !== "none" ||
      hasActiveBackgroundShapeOptions(state.backgroundShapeOptions))

  if (
    backgroundImage ||
    customBackgroundSurfaceActive ||
    state.backgroundOptions.transparent
  ) {
    return "none"
  }

  return mapStudioGradient(state.backgroundGradient, state.backgroundGradient.enabled)
}

function mapGradient(state: QrStudioState): NewQrCodeProps["gradient"] {
  if (state.dotsColorMode !== "gradient") {
    return "none"
  }

  return mapStudioGradient(state.dataModulesGradient, true)
}

function mapLogo(state: QrStudioState): NewQrCodeProps["logo"] | undefined {
  const src = getAssetValue(state.logo)
  if (!src) {
    return undefined
  }

  return {
    crossOrigin: state.imageOptions.crossOrigin,
    excavate: state.imageOptions.hideBackgroundDots,
    size: state.imageOptions.imageSize,
    src,
  }
}

function mapMotion(state: QrStudioState): Pick<NewQrCodeProps, "motion" | "motionPreset"> {
  if (!state.dotMatrixAnimation.enabled || !state.dotMatrixAnimation.animated) {
    return { motion: "none" }
  }

  return {
    motion: "bitjson",
    motionPreset: resolveBitjsonMotionPreset(state.dotMatrixAnimation),
  }
}

export function toPortableQrConfig(state: QrStudioState): NewQrCodeProps {
  const logo = mapLogo(state)
  const motion = mapMotion(state)

  return {
    background: mapBackground(state),
    backgroundGradient: mapBackgroundGradient(state),
    boostLevel: true,
    colorMode: state.dotsColorMode,
    finderInner: state.finderPatternInnerSettings.type as QrFinderInnerStyle,
    finderOuter: state.finderPatternOuterSettings.type as QrFinderOuterStyle,
    finderInnerColor: state.finderPatternInnerSettings.color,
    finderOuterColor: state.finderPatternOuterSettings.color,
    finderInnerGradient: mapStudioGradient(
      state.finderPatternInnerGradient,
      state.finderPatternInnerGradient.enabled,
    ),
    finderOuterGradient: mapStudioGradient(
      state.finderPatternOuterGradient,
      state.finderPatternOuterGradient.enabled,
    ),
    foreground: state.dataModulesSettings.color,
    gradient: mapGradient(state),
    level: state.qrOptions.errorCorrectionLevel,
    margin: state.margin,
    minVersion: Math.max(1, state.qrOptions.typeNumber || 1),
    module: state.dataModulesSettings.type as QrModuleStyle,
    moduleRoundSize: state.dataModulesSettings.roundSize,
    motion: motion.motion,
    motionPreset: motion.motionPreset,
    palette: state.dotsPalette,
    size: state.width,
    value: state.data.trim(),
    ...(logo ? { logo } : {}),
  }
}
