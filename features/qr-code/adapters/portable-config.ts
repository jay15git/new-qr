import {
  getAssetValue,
  hasActiveBackgroundShapeOptions,
  resolveBitjsonMotionPreset,
  type QrStudioState,
} from "@/features/qr-code/model/state"
import type { NewQrCodeProps, QrFinderStyle, QrModuleStyle } from "@new-qr/qr"

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

function mapGradient(state: QrStudioState): NewQrCodeProps["gradient"] {
  if (state.dotsColorMode !== "gradient" || !state.dataModulesGradient.enabled) {
    return "none"
  }

  return {
    type: state.dataModulesGradient.type,
    rotation: state.dataModulesGradient.rotation,
    stops: [
      {
        offset: state.dataModulesGradient.colorStops[0].offset,
        color: state.dataModulesGradient.colorStops[0].color,
      },
      {
        offset: state.dataModulesGradient.colorStops[1].offset,
        color: state.dataModulesGradient.colorStops[1].color,
      },
    ],
  }
}

function mapLogo(state: QrStudioState): NewQrCodeProps["logo"] | undefined {
  const src = getAssetValue(state.logo)
  if (!src) {
    return undefined
  }

  return {
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
    colorMode: state.dotsColorMode,
    finderInner: state.finderPatternInnerSettings.type as QrFinderStyle,
    finderOuter: state.finderPatternOuterSettings.type as QrFinderStyle,
    foreground: state.dataModulesSettings.color,
    gradient: mapGradient(state),
    margin: state.margin,
    module: state.dataModulesSettings.type as QrModuleStyle,
    motion: motion.motion,
    motionPreset: motion.motionPreset,
    palette: state.dotsPalette,
    size: state.width,
    value: state.data.trim(),
    ...(logo ? { logo } : {}),
  }
}
