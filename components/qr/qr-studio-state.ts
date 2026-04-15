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

export type QrStudioState = {
  data: string;
  type: DrawType;
  width: number;
  height: number;
  margin: number;
  image?: string;
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

const DEFAULT_GRADIENT: StudioGradient = {
  enabled: false,
  type: "linear",
  rotation: 0,
  colorStops: [
    { offset: 0, color: "#18181b" },
    { offset: 1, color: "#3f3f46" },
  ],
};

export function createDefaultQrStudioState(): QrStudioState {
  return {
    data: "https://new-qr-studio.local/launch",
    type: "svg",
    width: 320,
    height: 320,
    margin: 12,
    image: undefined,
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

export function toQrCodeOptions(state: QrStudioState): Options {
  const image = sanitizeImage(state.image);

  return {
    width: coerceNumber(state.width, 120, 1200, 320),
    height: coerceNumber(state.height, 120, 1200, 320),
    type: state.type,
    data: state.data.trim(),
    margin: coerceNumber(state.margin, 0, 80, 12),
    image,
    qrOptions: {
      ...state.qrOptions,
    },
    imageOptions: {
      ...state.imageOptions,
      imageSize: coerceNumber(state.imageOptions.imageSize, 0.1, 0.5, 0.4),
      margin: coerceNumber(state.imageOptions.margin, 0, 40, 12),
    },
    dotsOptions: {
      type: mapStudioDotType(state.dotsOptions.type),
      roundSize: state.dotsOptions.roundSize,
      color: state.dotsGradient.enabled ? undefined : state.dotsOptions.color,
      gradient: buildGradient(state.dotsGradient),
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
        state.backgroundGradient.enabled || state.backgroundOptions.transparent
          ? state.backgroundOptions.transparent
            ? "transparent"
            : undefined
          : state.backgroundOptions.color,
      gradient: buildGradient(state.backgroundGradient),
    },
  };
}

function mapStudioDotType(type: StudioDotType): DotType {
  if (type === "diamond" || type === "heart") {
    return "square";
  }

  return type;
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

function sanitizeImage(image?: string) {
  const trimmed = image?.trim();

  return trimmed ? trimmed : undefined;
}
