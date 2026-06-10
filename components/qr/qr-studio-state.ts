import type { BrandIconId } from "@/components/qr/brand-icon-catalog";
import type { QrBackgroundShapeId } from "@/components/qr/qr-background-shapes";
import type {
  QrDataModulesStyle,
  QrDrawType,
  QrErrorCorrectionLevel,
  QrFinderPatternInnerStyle,
  QrFinderPatternOuterStyle,
  QrGradientSettings,
  QrGradientType,
  QrMode,
  QrTypeNumber,
  ReactQRCodeProps,
} from "@/components/qr/qr-types";

export type GradientStop = {
  offset: number;
  color: string;
};

export type StudioGradient = {
  enabled: boolean;
  type: QrGradientType;
  rotation: number;
  colorStops: [GradientStop, GradientStop];
};

export type StudioDataModulesStyle = QrDataModulesStyle;
export type DotsColorMode = "solid" | "gradient" | "palette";
export type AssetSourceMode = "none" | "preset" | "url" | "upload";
export type QrDotMatrixSquareLoader =
  | "neon-drift"
  | "pulse-ladder"
  | "core-spiral"
  | "twin-orbit"
  | "prism-sweep"
  | "flux-columns"
  | "block-drop"
  | "strobe-stack"
  | "glyph-pulse"
  | "crt-glide"
  | "echo-ring"
  | "origin-wave"
  | "core-rotor"
  | "prism-bloom"
  | "helix-glow"
  | "helix-core"
  | "half-helix"
  | "sound-bars"
  | "infinity-run"
  | "mobius-run";
export type QrDotMatrixColorPreset =
  | "theme"
  | "mint"
  | "sunset"
  | "ocean"
  | "neon"
  | "aurora"
  | "fire"
  | "prism";
export type QrDotMatrixPattern = "cross" | "diamond" | "full" | "outline" | "rings" | "rose";
export type QrDotMatrixDotShape = "circle" | "diamond" | "hearts" | "square";

export type QrDotMatrixAnimationOptions = {
  animated: boolean;
  colorPreset: QrDotMatrixColorPreset;
  customColor: string;
  customColorBase: string;
  customColorMid: string;
  customColorPeak: string;
  dotShape: QrDotMatrixDotShape;
  enabled: boolean;
  exportAnimatedSvg: boolean;
  loader: QrDotMatrixSquareLoader;
  matrixSize: number;
  opacityBase: number;
  opacityMid: number;
  opacityPeak: number;
  overlayScale: number;
  pattern: QrDotMatrixPattern;
  speed: number;
};

export type QrDotMatrixAnimationPatch =
  Partial<Omit<QrDotMatrixAnimationOptions, "loader">> & {
    loader?: QrDotMatrixSquareLoader | string;
  };

export type StudioAsset = {
  presetColor?: string;
  presetId?: BrandIconId;
  source: AssetSourceMode;
  value?: string;
};

export type BackgroundShapeOptions = {
  edgeBlur: number;
  paddingPx: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
};

export type QrStudioState = {
  data: string;
  type: QrDrawType;
  width: number;
  height: number;
  margin: number;
  rasterExportQualityPercent: number;
  logo: StudioAsset;
  backgroundImage: StudioAsset;
  backgroundShapeId: QrBackgroundShapeId;
  backgroundShapeOptions: BackgroundShapeOptions;
  qrOptions: {
    typeNumber: QrTypeNumber;
    mode: QrMode;
    errorCorrectionLevel: QrErrorCorrectionLevel;
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
    saveAsBlob: boolean;
    crossOrigin: "anonymous";
  };
  dataModulesSettings: {
    type: StudioDataModulesStyle;
    color: string;
    roundSize: boolean;
  };
  dotMatrixAnimation: QrDotMatrixAnimationOptions;
  dotsColorMode: DotsColorMode;
  dotsPalette: string[];
  finderPatternOuterSettings: {
    type: QrFinderPatternOuterStyle;
    color: string;
  };
  finderPatternInnerSettings: {
    type: QrFinderPatternInnerStyle;
    color: string;
  };
  backgroundOptions: {
    color: string;
    round: number;
    transparent: boolean;
  };
  logoGradient: StudioGradient;
  dataModulesGradient: StudioGradient;
  finderPatternOuterGradient: StudioGradient;
  finderPatternInnerGradient: StudioGradient;
  backgroundGradient: StudioGradient;
};const QR_SIZE_MIN = 120;
const QR_SIZE_MAX = 1200;
const DEFAULT_QR_SIZE = 320;
const RASTER_EXPORT_QUALITY_MIN = 25;
const RASTER_EXPORT_QUALITY_MAX = 100;
const DEFAULT_RASTER_EXPORT_QUALITY = 100;
export const QR_DOT_MATRIX_ANIMATION_SPEED_MIN = 1;
export const QR_DOT_MATRIX_ANIMATION_SPEED_MAX = 10;
export const QR_DOT_MATRIX_MATRIX_SIZE_MIN = 5;
export const QR_DOT_MATRIX_MATRIX_SIZE_MAX = 25;
export const QR_DOT_MATRIX_MATRIX_SIZE_STEP = 5;
export const QR_DOT_MATRIX_OVERLAY_SCALE_MIN = 100;
export const QR_DOT_MATRIX_OVERLAY_SCALE_MAX = 140;
export const QR_DOT_MATRIX_OPACITY_MIN = 0;
export const QR_DOT_MATRIX_OPACITY_MAX = 1;
const BACKGROUND_SHAPE_PADDING_PX_MAX = 192;
const BACKGROUND_SHAPE_STROKE_WIDTH_MAX = 24;
const BACKGROUND_SHAPE_EDGE_BLUR_MAX = 32;
const BACKGROUND_SHAPE_OPACITY_MAX = 100;
const BACKGROUND_SHAPE_SHADOW_OFFSET_MIN = -64;
const BACKGROUND_SHAPE_SHADOW_OFFSET_MAX = 64;

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

export const QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS: Array<{
  label: string;
  value: QrDotMatrixSquareLoader;
}> = [
  { label: "Neon Drift", value: "neon-drift" },
  { label: "Pulse Ladder", value: "pulse-ladder" },
  { label: "Core Spiral", value: "core-spiral" },
  { label: "Twin Orbit", value: "twin-orbit" },
  { label: "Prism Sweep", value: "prism-sweep" },
  { label: "Flux Columns", value: "flux-columns" },
  { label: "Block Drop", value: "block-drop" },
  { label: "Strobe Stack", value: "strobe-stack" },
  { label: "Glyph Pulse", value: "glyph-pulse" },
  { label: "CRT Glide", value: "crt-glide" },
  { label: "Echo Ring", value: "echo-ring" },
  { label: "Origin Wave", value: "origin-wave" },
  { label: "Core Rotor", value: "core-rotor" },
  { label: "Prism Bloom", value: "prism-bloom" },
  { label: "Helix Glow", value: "helix-glow" },
  { label: "Helix Core", value: "helix-core" },
  { label: "Half Helix", value: "half-helix" },
  { label: "Sound Bars", value: "sound-bars" },
  { label: "Infinity Run", value: "infinity-run" },
  { label: "Mobius Run", value: "mobius-run" },
];

const QR_DOT_MATRIX_SQUARE_LOADER_VALUES = new Set<string>(
  QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS.map((option) => option.value),
);

export const QR_DOT_MATRIX_COLOR_PRESET_OPTIONS: Array<{
  label: string;
  value: QrDotMatrixColorPreset;
}> = [
  { label: "Theme", value: "theme" },
  { label: "Mint", value: "mint" },
  { label: "Sunset", value: "sunset" },
  { label: "Ocean", value: "ocean" },
  { label: "Neon", value: "neon" },
  { label: "Aurora", value: "aurora" },
  { label: "Fire", value: "fire" },
  { label: "Prism", value: "prism" },
];

export const QR_DOT_MATRIX_PATTERN_OPTIONS: Array<{
  label: string;
  value: QrDotMatrixPattern;
}> = [
  { label: "Full", value: "full" },
  { label: "Diamond", value: "diamond" },
  { label: "Outline", value: "outline" },
  { label: "Rose", value: "rose" },
  { label: "Cross", value: "cross" },
  { label: "Rings", value: "rings" },
];export const DEFAULT_DOT_MATRIX_ANIMATION: QrDotMatrixAnimationOptions = {
  animated: true,
  colorPreset: "theme",
  customColor: "#22d3ee",
  customColorBase: "#22d3ee",
  customColorMid: "#22d3ee",
  customColorPeak: "#22d3ee",
  dotShape: "circle",
  enabled: false,
  exportAnimatedSvg: false,
  loader: "neon-drift",
  matrixSize: QR_DOT_MATRIX_MATRIX_SIZE_MIN,
  opacityBase: 0.2,
  opacityMid: 0.55,
  opacityPeak: 1,
  overlayScale: 100,
  pattern: "full",
  speed: 3,
};

export const DEFAULT_BACKGROUND_SHAPE_OPTIONS: BackgroundShapeOptions = {
  edgeBlur: 0,
  paddingPx: 0,
  shadowColor: "#111827",
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowOpacity: 72,
  strokeColor: "#f8fafc",
  strokeOpacity: 100,
  strokeWidth: 0,
};

export function createDefaultQrStudioState(): QrStudioState {
  return {
    data: "https://new-qr-studio.local/launch",
    type: "svg",
    width: DEFAULT_QR_SIZE,
    height: DEFAULT_QR_SIZE,
    margin: 12,
    rasterExportQualityPercent: DEFAULT_RASTER_EXPORT_QUALITY,
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
    backgroundShapeId: "none",
    backgroundShapeOptions: { ...DEFAULT_BACKGROUND_SHAPE_OPTIONS },
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
    dataModulesSettings: {
      type: "rounded",
      color: "#111827",
      roundSize: true,
    },
    dotMatrixAnimation: { ...DEFAULT_DOT_MATRIX_ANIMATION },
    dotsColorMode: "solid",
    dotsPalette: [...DEFAULT_DOTS_PALETTE],
    finderPatternOuterSettings: {
      type: "rounded-lg",
      color: "#111827",
    },
    finderPatternInnerSettings: {
      type: "circle",
      color: "#111827",
    },
    backgroundOptions: {
      color: "#f8fafc",
      round: 0,
      transparent: false,
    },
    logoGradient: structuredClone(DEFAULT_GRADIENT),
    dataModulesGradient: structuredClone(DEFAULT_GRADIENT),
    finderPatternOuterGradient: structuredClone(DEFAULT_GRADIENT),
    finderPatternInnerGradient: structuredClone(DEFAULT_GRADIENT),
    backgroundGradient: {
      ...structuredClone(DEFAULT_GRADIENT),
      colorStops: [
        { offset: 0, color: "#f8fafc" },
        { offset: 1, color: "#dbeafe" },
      ],
    },
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

export function clampQrSize(value: number) {
  return coerceNumber(value, QR_SIZE_MIN, QR_SIZE_MAX, DEFAULT_QR_SIZE);
}

export function clampRasterExportQualityPercent(value: number) {
  return coerceNumber(
    value,
    RASTER_EXPORT_QUALITY_MIN,
    RASTER_EXPORT_QUALITY_MAX,
    DEFAULT_RASTER_EXPORT_QUALITY,
  );
}

export function clampDotMatrixAnimationSpeed(value: number) {
  return coerceNumber(
    value,
    QR_DOT_MATRIX_ANIMATION_SPEED_MIN,
    QR_DOT_MATRIX_ANIMATION_SPEED_MAX,
    DEFAULT_DOT_MATRIX_ANIMATION.speed,
  );
}

function clampDotMatrixAnimationMatrixSize(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_DOT_MATRIX_ANIMATION.matrixSize;
  }

  const clamped = coerceNumber(
    value,
    QR_DOT_MATRIX_MATRIX_SIZE_MIN,
    QR_DOT_MATRIX_MATRIX_SIZE_MAX,
    DEFAULT_DOT_MATRIX_ANIMATION.matrixSize,
  );

  return Math.round(clamped / QR_DOT_MATRIX_MATRIX_SIZE_STEP) * QR_DOT_MATRIX_MATRIX_SIZE_STEP;
}

export function clampDotMatrixAnimationOverlayScale(value: number) {
  return coerceNumber(
    value,
    QR_DOT_MATRIX_OVERLAY_SCALE_MIN,
    QR_DOT_MATRIX_OVERLAY_SCALE_MAX,
    DEFAULT_DOT_MATRIX_ANIMATION.overlayScale,
  );
}

export function clampDotMatrixAnimationOpacity(value: number, fallback: number) {
  return coerceNumber(
    value,
    QR_DOT_MATRIX_OPACITY_MIN,
    QR_DOT_MATRIX_OPACITY_MAX,
    fallback,
  );
}

function coerceDotMatrixSquareLoader(value: string | undefined) {
  return value && QR_DOT_MATRIX_SQUARE_LOADER_VALUES.has(value)
    ? (value as QrDotMatrixSquareLoader)
    : DEFAULT_DOT_MATRIX_ANIMATION.loader;
}

function coerceDotMatrixAnimationColor(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function clampBackgroundShapePaddingPx(value: number) {
  return coerceNumber(
    value,
    0,
    BACKGROUND_SHAPE_PADDING_PX_MAX,
    DEFAULT_BACKGROUND_SHAPE_OPTIONS.paddingPx,
  );
}

export function clampBackgroundShapeStrokeWidth(value: number) {
  return coerceNumber(
    value,
    0,
    BACKGROUND_SHAPE_STROKE_WIDTH_MAX,
    DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeWidth,
  );
}

export function clampBackgroundShapeOpacity(value: number) {
  return coerceNumber(
    value,
    0,
    BACKGROUND_SHAPE_OPACITY_MAX,
    DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeOpacity,
  );
}

export function clampBackgroundShapeOffset(value: number) {
  return coerceNumber(
    value,
    BACKGROUND_SHAPE_SHADOW_OFFSET_MIN,
    BACKGROUND_SHAPE_SHADOW_OFFSET_MAX,
    DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetX,
  );
}

export function clampBackgroundShapeEdgeBlur(value: number) {
  return coerceNumber(
    value,
    0,
    BACKGROUND_SHAPE_EDGE_BLUR_MAX,
    DEFAULT_BACKGROUND_SHAPE_OPTIONS.edgeBlur,
  );
}

export function clampQrBackgroundRound(value: number) {
  return coerceNumber(value, 0, 1, 0);
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

export function setRasterExportQualityPercent(
  state: QrStudioState,
  qualityPercent: number,
): QrStudioState {
  const nextQualityPercent = clampRasterExportQualityPercent(qualityPercent);

  if (state.rasterExportQualityPercent === nextQualityPercent) {
    return state;
  }

  return {
    ...state,
    rasterExportQualityPercent: nextQualityPercent,
  };
}

export function setDotMatrixAnimationOptions(
  state: QrStudioState,
  patch: QrDotMatrixAnimationPatch,
): QrStudioState {
  const hasRemovedAnimationOptions =
    Object.prototype.hasOwnProperty.call(state.dotMatrixAnimation, "bloom") ||
    Object.prototype.hasOwnProperty.call(state.dotMatrixAnimation, "halo") ||
    Object.prototype.hasOwnProperty.call(state.dotMatrixAnimation, "hoverAnimated") ||
    Object.prototype.hasOwnProperty.call(state.dotMatrixAnimation, "muted");
  const hasMissingMatrixSize =
    !Object.prototype.hasOwnProperty.call(state.dotMatrixAnimation, "matrixSize");
  const nextCustomColor = coerceDotMatrixAnimationColor(
    patch.customColor ?? state.dotMatrixAnimation.customColor,
    DEFAULT_DOT_MATRIX_ANIMATION.customColor,
  );
  const nextAnimation: QrDotMatrixAnimationOptions = {
    animated: patch.animated ?? state.dotMatrixAnimation.animated,
    colorPreset: patch.colorPreset ?? state.dotMatrixAnimation.colorPreset,
    customColor: nextCustomColor,
    customColorBase: coerceDotMatrixAnimationColor(
      patch.customColorBase ?? state.dotMatrixAnimation.customColorBase,
      nextCustomColor,
    ),
    customColorMid: coerceDotMatrixAnimationColor(
      patch.customColorMid ?? state.dotMatrixAnimation.customColorMid,
      nextCustomColor,
    ),
    customColorPeak: coerceDotMatrixAnimationColor(
      patch.customColorPeak ?? state.dotMatrixAnimation.customColorPeak,
      nextCustomColor,
    ),
    dotShape: patch.dotShape ?? state.dotMatrixAnimation.dotShape,
    enabled: patch.enabled ?? state.dotMatrixAnimation.enabled,
    exportAnimatedSvg:
      patch.exportAnimatedSvg ?? state.dotMatrixAnimation.exportAnimatedSvg,
    loader: coerceDotMatrixSquareLoader(
      patch.loader ?? state.dotMatrixAnimation.loader,
    ),
    matrixSize: clampDotMatrixAnimationMatrixSize(
      patch.matrixSize ?? state.dotMatrixAnimation.matrixSize,
    ),
    opacityBase: clampDotMatrixAnimationOpacity(
      patch.opacityBase ?? state.dotMatrixAnimation.opacityBase,
      DEFAULT_DOT_MATRIX_ANIMATION.opacityBase,
    ),
    opacityMid: clampDotMatrixAnimationOpacity(
      patch.opacityMid ?? state.dotMatrixAnimation.opacityMid,
      DEFAULT_DOT_MATRIX_ANIMATION.opacityMid,
    ),
    opacityPeak: clampDotMatrixAnimationOpacity(
      patch.opacityPeak ?? state.dotMatrixAnimation.opacityPeak,
      DEFAULT_DOT_MATRIX_ANIMATION.opacityPeak,
    ),
    overlayScale: clampDotMatrixAnimationOverlayScale(
      patch.overlayScale ?? state.dotMatrixAnimation.overlayScale,
    ),
    pattern: patch.pattern ?? state.dotMatrixAnimation.pattern,
    speed: clampDotMatrixAnimationSpeed(
      patch.speed ?? state.dotMatrixAnimation.speed,
    ),
  };

  if (
    state.dotMatrixAnimation.enabled === nextAnimation.enabled &&
    state.dotMatrixAnimation.exportAnimatedSvg === nextAnimation.exportAnimatedSvg &&
    state.dotMatrixAnimation.animated === nextAnimation.animated &&
    state.dotMatrixAnimation.colorPreset === nextAnimation.colorPreset &&
    state.dotMatrixAnimation.customColor === nextAnimation.customColor &&
    state.dotMatrixAnimation.customColorBase === nextAnimation.customColorBase &&
    state.dotMatrixAnimation.customColorMid === nextAnimation.customColorMid &&
    state.dotMatrixAnimation.customColorPeak === nextAnimation.customColorPeak &&
    state.dotMatrixAnimation.dotShape === nextAnimation.dotShape &&
    state.dotMatrixAnimation.loader === nextAnimation.loader &&
    state.dotMatrixAnimation.matrixSize === nextAnimation.matrixSize &&
    state.dotMatrixAnimation.opacityBase === nextAnimation.opacityBase &&
    state.dotMatrixAnimation.opacityMid === nextAnimation.opacityMid &&
    state.dotMatrixAnimation.opacityPeak === nextAnimation.opacityPeak &&
    state.dotMatrixAnimation.overlayScale === nextAnimation.overlayScale &&
    state.dotMatrixAnimation.pattern === nextAnimation.pattern &&
    state.dotMatrixAnimation.speed === nextAnimation.speed &&
    !hasRemovedAnimationOptions &&
    !hasMissingMatrixSize
  ) {
    return state;
  }

  return {
    ...state,
    dotMatrixAnimation: nextAnimation,
  };
}

export function toReactQrCodeProps(state: QrStudioState): ReactQRCodeProps {
  const logoImage = getAssetValue(state.logo);
  const backgroundImage = getAssetValue(state.backgroundImage);
  const customBackgroundSurfaceActive =
    !backgroundImage &&
    (hasBackgroundShape(state) || hasActiveBackgroundShapeOptions(state.backgroundShapeOptions));
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
      color: state.finderPatternInnerGradient.enabled ? undefined : state.finderPatternInnerSettings.color,
      style: state.finderPatternInnerSettings.type,
    },
    finderPatternOuterSettings: {
      color: state.finderPatternOuterGradient.enabled ? undefined : state.finderPatternOuterSettings.color,
      style: state.finderPatternOuterSettings.type,
    },
    gradient:
      getDotsGradient(state) ??
      buildGradient(state.finderPatternOuterGradient) ??
      buildGradient(state.finderPatternInnerGradient),
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

export function getAssetValue(asset?: StudioAsset) {
  const trimmed = asset?.value?.trim();

  return trimmed ? trimmed : undefined;
}

export function hasBackgroundImage(state: QrStudioState) {
  return Boolean(getAssetValue(state.backgroundImage));
}

function hasBackgroundShape(state: Pick<QrStudioState, "backgroundShapeId">) {
  return state.backgroundShapeId !== "none";
}

export function hasActiveBackgroundShapeOptions(
  options: Partial<BackgroundShapeOptions> | undefined,
) {
  return Boolean(
    options &&
      ((options.paddingPx ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.paddingPx) >
        DEFAULT_BACKGROUND_SHAPE_OPTIONS.paddingPx ||
        (options.strokeWidth ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeWidth) > 0 ||
        (options.edgeBlur ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.edgeBlur) > 0 ||
        (options.shadowOffsetX ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetX) !==
          DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetX ||
        (options.shadowOffsetY ?? DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetY) !==
          DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetY),
  );
}

function getDotsColor(state: QrStudioState) {
  if (state.dotsColorMode !== "solid") {
    return undefined;
  }

  return state.dataModulesSettings.color;
}

function getDotsGradient(state: QrStudioState) {
  if (state.dotsColorMode !== "gradient") {
    return undefined;
  }

  return buildGradient({
    ...state.dataModulesGradient,
    enabled: true,
  });
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
