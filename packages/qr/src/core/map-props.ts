import type {
  DataModulesStyle,
  FinderPatternInnerStyle,
  FinderPatternOuterStyle,
  ReactQRCodeProps,
} from "@lglab/react-qr-code"

import type { NewQrCodeProps } from "../types"

function coerceNumber(value: number | undefined, min: number, max: number, fallback: number) {
  if (value === undefined || Number.isNaN(value)) {
    return fallback
  }

  return Math.min(max, Math.max(min, value))
}

export function portablePropsToReactQrProps(props: NewQrCodeProps): ReactQRCodeProps {
  const size = coerceNumber(props.size, 120, 1200, 320)
  const margin = coerceNumber(props.margin, 0, 80, 12)
  const logoSize = props.logo?.src
    ? Math.max(1, Math.round(size * coerceNumber(props.logo.size, 0, 1, 0.4)))
    : undefined

  const dotsColor =
    props.colorMode === "solid" || !props.colorMode ? props.foreground : undefined
  const finderInnerGradientActive =
    props.finderInnerGradient !== undefined && props.finderInnerGradient !== "none"
  const finderOuterGradientActive =
    props.finderOuterGradient !== undefined && props.finderOuterGradient !== "none"

  return {
    background:
      props.background === "transparent" || !props.background
        ? "transparent"
        : props.background,
    boostLevel: true,
    dataModulesSettings: {
      color: dotsColor,
      randomSize:
        props.moduleRoundSize === undefined
          ? props.module === "dots"
          : !props.moduleRoundSize,
      style: (props.module ?? "square") as DataModulesStyle,
    },
    finderPatternInnerSettings: {
      color: finderInnerGradientActive
        ? undefined
        : (props.finderInnerColor ?? props.foreground),
      style: (props.finderInner ?? "square") as FinderPatternInnerStyle,
    },
    finderPatternOuterSettings: {
      color: finderOuterGradientActive
        ? undefined
        : (props.finderOuterColor ?? props.foreground),
      style: (props.finderOuter ?? "square") as FinderPatternOuterStyle,
    },
    imageSettings: props.logo?.src
      ? {
          crossOrigin: "anonymous",
          excavate: props.logo.excavate ?? true,
          height: logoSize!,
          src: props.logo.src,
          width: logoSize!,
        }
      : undefined,
    level: "Q",
    marginSize: margin,
    minVersion: 1,
    size,
    svgProps: {
      style: {
        display: "block",
        height: "100%",
        width: "100%",
      },
    },
    value: props.value.trim(),
  }
}
