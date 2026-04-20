import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  DrawType,
  ErrorCorrectionLevel,
  FileExtension,
  Gradient,
  GradientType,
  Mode,
  Options,
  TypeNumber,
} from "qr-code-styling";

import type { BrandIconId } from "@/components/qr/brand-icon-catalog";

export type GradientStop = {
  offset: number;
  color: string;
};

export type StudioGradient = {
  enabled: boolean;
  type: GradientType;
  rotation: number;
  colorStops: [GradientStop, GradientStop];
};

export type StudioDotType = DotType | "diamond" | "heart";
export type DotsColorMode = "solid" | "gradient" | "palette";
export type AssetSourceMode = "none" | "preset" | "url" | "upload";

export type StudioAsset = {
  presetColor?: string;
  presetId?: BrandIconId;
  source: AssetSourceMode;
  value?: string;
};

export type QrStudioState = {
  data: string;
  type: DrawType;
  width: number;
  height: number;
  margin: number;
  logo: StudioAsset;
  backgroundImage: StudioAsset;
  qrOptions: {
    typeNumber: TypeNumber;
    mode: Mode;
    errorCorrectionLevel: ErrorCorrectionLevel;
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
    saveAsBlob: boolean;
    crossOrigin: "anonymous";
  };
  dotsOptions: {
    type: StudioDotType;
    color: string;
    roundSize: boolean;
  };
  dotsColorMode: DotsColorMode;
  dotsPalette: string[];
  cornersSquareOptions: {
    type: CornerSquareType;
    color: string;
  };
  cornersDotOptions: {
    type: CornerDotType;
    color: string;
  };
  backgroundOptions: {
    color: string;
    transparent: boolean;
  };
  logoGradient: StudioGradient;
  dotsGradient: StudioGradient;
  cornersSquareGradient: StudioGradient;
  cornersDotGradient: StudioGradient;
  backgroundGradient: StudioGradient;
};

export const DOWNLOAD_EXTENSIONS: FileExtension[] = [
  "svg",
  "png",
  "jpeg",
  "webp",
];

export const QR_SIZE_MIN = 120;
export const QR_SIZE_MAX = 1200;
export const DEFAULT_QR_SIZE = 320;

const DEFAULT_GRADIENT: StudioGradient = {
  enabled: false,
  type: "linear",
  rotation: 0,
  colorStops: [
    { offset: 0, color: "#18181b" },
    { offset: 1, color: "#3f3f46" },
  ],
};

const DEFAULT_DOTS_PALETTE = [
  "#04879c",
  "#0c3c78",
  "#090030",
  "#f30a49",
];

export function createDefaultQrStudioState(): QrStudioState {
  return {
    data: "https://new-qr-studio.local/launch",
    type: "svg",
    width: DEFAULT_QR_SIZE,
    height: DEFAULT_QR_SIZE,
    margin: 12,
    logo: {
      presetColor: undefined,
      presetId: undefined,
      source: "none",
      value: undefined,
    },
    backgroundImage: {
      presetColor: undefined,
      presetId: undefined,
      source: "none",
      value: undefined,
    },
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 12,
      saveAsBlob: true,
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      type: "rounded",
      color: "#111827",
      roundSize: true,
    },
    dotsColorMode: "solid",
    dotsPalette: [...DEFAULT_DOTS_PALETTE],
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#111827",
    },
    cornersDotOptions: {
      type: "dot",
      color: "#111827",
    },
    backgroundOptions: {
      color: "#f8fafc",
      transparent: false,
    },
    logoGradient: structuredClone(DEFAULT_GRADIENT),
    dotsGradient: structuredClone(DEFAULT_GRADIENT),
    cornersSquareGradient: structuredClone(DEFAULT_GRADIENT),
    cornersDotGradient: structuredClone(DEFAULT_GRADIENT),
    backgroundGradient: {
      ...structuredClone(DEFAULT_GRADIENT),
      colorStops: [
        { offset: 0, color: "#f8fafc" },
        { offset: 1, color: "#dbeafe" },
      ],
    },
  };
}

export function coerceNumber(
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

export function clampQrSize(value: number) {
  return coerceNumber(value, QR_SIZE_MIN, QR_SIZE_MAX, DEFAULT_QR_SIZE);
}

export function setSquareQrSize(state: QrStudioState, size: number): QrStudioState {
  const nextSize = clampQrSize(size);

  if (state.width === nextSize && state.height === nextSize) {
    return state;
  }

  return {
    ...state,
    width: nextSize,
    height: nextSize,
  };
}

export function toQrCodeOptions(state: QrStudioState): Options {
  const logoImage = getAssetValue(state.logo);
  const backgroundImage = getAssetValue(state.backgroundImage);

  return {
    width: clampQrSize(state.width),
    height: clampQrSize(state.height),
    type: state.type,
    data: state.data.trim(),
    margin: coerceNumber(state.margin, 0, 80, 12),
    image: logoImage,
    qrOptions: {
      ...state.qrOptions,
    },
    imageOptions: {
      ...state.imageOptions,
      imageSize: coerceNumber(state.imageOptions.imageSize, 0, 1, 0.4),
      margin: coerceNumber(state.imageOptions.margin, 0, 40, 12),
    },
    dotsOptions: {
      type: mapStudioDotType(state.dotsOptions.type),
      roundSize: state.dotsOptions.roundSize,
      color: getDotsColor(state),
      gradient: getDotsGradient(state),
    },
    cornersSquareOptions: {
      type: state.cornersSquareOptions.type,
      color: state.cornersSquareGradient.enabled
        ? undefined
        : state.cornersSquareOptions.color,
      gradient: buildGradient(state.cornersSquareGradient),
    },
    cornersDotOptions: {
      type: state.cornersDotOptions.type,
      color: state.cornersDotGradient.enabled
        ? undefined
        : state.cornersDotOptions.color,
      gradient: buildGradient(state.cornersDotGradient),
    },
    backgroundOptions: {
      color:
        backgroundImage ||
        state.backgroundGradient.enabled ||
        state.backgroundOptions.transparent
          ? backgroundImage
            ? undefined
            : state.backgroundOptions.transparent
              ? "transparent"
              : undefined
          : state.backgroundOptions.color,
      gradient: backgroundImage ? undefined : buildGradient(state.backgroundGradient),
    },
  };
}

export function getAssetValue(asset?: StudioAsset) {
  const trimmed = asset?.value?.trim();

  return trimmed ? trimmed : undefined;
}

export function hasBackgroundImage(state: QrStudioState) {
  return Boolean(getAssetValue(state.backgroundImage));
}

export function hasLogoImage(state: QrStudioState) {
  return Boolean(getAssetValue(state.logo));
}

function mapStudioDotType(type: StudioDotType): DotType {
  if (type === "diamond" || type === "heart") {
    return "square";
  }

  return type;
}

function getDotsColor(state: QrStudioState) {
  if (state.dotsColorMode !== "solid") {
    return undefined;
  }

  return state.dotsOptions.color;
}

function getDotsGradient(state: QrStudioState) {
  if (state.dotsColorMode !== "gradient") {
    return undefined;
  }

  return buildGradient({
    ...state.dotsGradient,
    enabled: true,
  });
}

function buildGradient(gradient: StudioGradient): Gradient | undefined {
  if (!gradient.enabled) {
    return undefined;
  }

  return {
    type: gradient.type,
    rotation: gradient.rotation,
    colorStops: gradient.colorStops.map((stop) => ({
      offset: coerceNumber(stop.offset, 0, 1, 0),
      color: stop.color,
    })),
  };
}
