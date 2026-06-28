import type { QrGradientSettings, QrFinderPatternInnerStyle, ReactQRCodeProps } from "@/features/qr-code/model/types";
import {
  clampQrBackgroundRound,
  clampQrSize,
  getAssetValue,
  hasActiveBackgroundShapeOptions,
  type QrStudioState,
  type StudioCornerDotStyle,
  type StudioGradient,
} from "@/features/qr-code/model/state";
import { isCustomCornerDotShape } from "@/features/qr-code/styles/custom-corner-dot-shapes";

export function toReactQrCodeProps(state: QrStudioState): ReactQRCodeProps {
  const logoImage = getAssetValue(state.logo);
  const backgroundImage = getAssetValue(state.backgroundImage);
  const customBackgroundSurfaceActive =
    !backgroundImage &&
    (state.backgroundShapeId !== "none" ||
      hasActiveBackgroundShapeOptions(state.backgroundShapeOptions));
  const qrSize = clampQrSize(state.width);
  const logoSize = Math.max(
    1,
    Math.round(qrSize * coerceNumber(state.imageOptions.imageSize, 0, 1, 0.4)),
  );

  return {
    background:
      backgroundImage || customBackgroundSurfaceActive || state.backgroundOptions.transparent
        ? "transparent"
        : buildGradient(state.backgroundGradient) ?? state.backgroundOptions.color,
    boostLevel: true,
    dataModulesSettings: {
      color: getDotsColor(state),
      randomSize: !state.dataModulesSettings.roundSize,
      style: state.dataModulesSettings.type,
    },
    finderPatternInnerSettings: {
      color: state.finderPatternInnerSettings.color,
      style: resolveFinderInnerStyle(state.finderPatternInnerSettings.type),
    },
    finderPatternOuterSettings: {
      color: state.finderPatternOuterSettings.color,
      style: state.finderPatternOuterSettings.type,
    },
    gradient: undefined,
    imageSettings: logoImage
      ? {
          crossOrigin: state.imageOptions.crossOrigin,
          excavate: state.imageOptions.hideBackgroundDots,
          height: logoSize,
          src: logoImage,
          width: logoSize,
        }
      : undefined,
    level: state.qrOptions.errorCorrectionLevel,
    marginSize: Math.max(0, Math.floor(coerceNumber(state.margin, 0, 80, 12))),
    minVersion: Math.max(1, state.qrOptions.typeNumber || 1),
    size: qrSize,
    svgProps: {
      style: {
        borderRadius: `${clampQrBackgroundRound(state.backgroundOptions.round) * 100}%`,
        display: "block",
        height: "100%",
        width: "100%",
      },
    },
    value: state.data.trim(),
  };
}

function resolveFinderInnerStyle(type: StudioCornerDotStyle): QrFinderPatternInnerStyle {
  return isCustomCornerDotShape(type) ? "square" : type;
}

function getDotsColor(state: QrStudioState) {
  if (state.dotsColorMode !== "solid") {
    return undefined;
  }

  return state.dataModulesSettings.color;
}

function buildGradient(gradient: StudioGradient): QrGradientSettings | undefined {
  if (!gradient.enabled) {
    return undefined;
  }

  return {
    type: gradient.type,
    rotation: gradient.rotation,
    stops: gradient.colorStops.map((stop) => ({
      offset: String(coerceNumber(stop.offset, 0, 1, 0)),
      color: stop.color,
    })),
  };
}

function coerceNumber(
  value: number,
  min: number,
  max: number,
  fallback: number,
) {
  if (Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
