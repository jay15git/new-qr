import { describe, expect, it } from "vitest";

import {
  clampBackgroundShapeOffset,
  clampBackgroundShapeOpacity,
  clampBackgroundShapePaddingPx,
  clampDotMatrixAnimationOpacity,
  clampDotMatrixAnimationOverlayScale,
  clampDotMatrixAnimationSpeed,
  clampRasterExportQualityPercent,
  clampQrBackgroundRound,
  clampQrSize,
  createDefaultQrStudioState,
  DEFAULT_DOT_MATRIX_ANIMATION,
  QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS,
  setDotMatrixAnimationOptions,
  setRasterExportQualityPercent,
  setSquareQrSize,
  toQrCodeOptions,
} from "./qr-studio-state";

describe("qr studio state helpers", () => {
  it("starts with shared asset state for logo and background", () => {
    const state = createDefaultQrStudioState();

    expect(state.backgroundShapeId).toBe("none");
    expect(state.backgroundShapeOptions).toEqual({
      edgeBlur: 0,
      paddingPx: 0,
      shadowColor: "#111827",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 72,
      strokeColor: "#f8fafc",
      strokeOpacity: 100,
      strokeWidth: 0,
    });
    expect(state.logo).toEqual({
      source: "none",
      value: undefined,
      presetId: undefined,
      presetColor: undefined,
    });
    expect(state.backgroundImage).toEqual({
      source: "none",
      value: undefined,
      presetId: undefined,
      presetColor: undefined,
    });
  });

  it("builds svg options from the default state", () => {
    const state = createDefaultQrStudioState();
    const options = toQrCodeOptions(state);

    expect(options.type).toBe("svg");
    expect(options.width).toBe(320);
    expect(options.height).toBe(320);
    expect(options.data).toContain("https://");
    expect(options.image).toBeUndefined();
    expect(options.backgroundOptions?.color).toBe("#f8fafc");
    expect(options.backgroundOptions?.round).toBe(0);
  });

  it("keeps upstream qr background transparent when a vector background shape is active", () => {
    const state = createDefaultQrStudioState();
    state.backgroundShapeId = "circle";
    state.backgroundOptions.color = "#d0bcff";

    const options = toQrCodeOptions(state);

    expect(options.backgroundOptions?.color).toBe("transparent");
    expect(options.backgroundOptions?.gradient).toBeUndefined();
  });

  it("maps qr background radius onto upstream background round", () => {
    const state = createDefaultQrStudioState();
    state.backgroundOptions.round = 0.42;

    const options = toQrCodeOptions(state);

    expect(options.backgroundOptions?.round).toBe(0.42);
  });

  it("clamps qr background radius to the upstream round range", () => {
    const lowRadiusState = createDefaultQrStudioState();
    lowRadiusState.backgroundOptions.round = -0.5;

    const highRadiusState = createDefaultQrStudioState();
    highRadiusState.backgroundOptions.round = 2;

    expect(toQrCodeOptions(lowRadiusState).backgroundOptions?.round).toBe(0);
    expect(toQrCodeOptions(highRadiusState).backgroundOptions?.round).toBe(1);
    expect(clampQrBackgroundRound(Number.NaN)).toBe(0);
  });

  it("clamps shared qr size updates to the supported square range", () => {
    const state = createDefaultQrStudioState();
    const undersized = setSquareQrSize(state, 24);
    const oversized = setSquareQrSize(state, 2400);

    expect(undersized.width).toBe(120);
    expect(undersized.height).toBe(120);
    expect(oversized.width).toBe(1200);
    expect(oversized.height).toBe(1200);
    expect(clampQrSize(Number.NaN)).toBe(320);
  });

  it("starts dashboard raster export quality at 100 percent", () => {
    const state = createDefaultQrStudioState();

    expect(state.rasterExportQualityPercent).toBe(100);
  });

  it("starts with dot matrix animation disabled and SVG export static", () => {
    const state = createDefaultQrStudioState();

    expect(QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS).toHaveLength(20);
    expect(QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS.map((option) => option.label)).toEqual([
      "Neon Drift",
      "Pulse Ladder",
      "Core Spiral",
      "Twin Orbit",
      "Prism Sweep",
      "Flux Columns",
      "Block Drop",
      "Strobe Stack",
      "Glyph Pulse",
      "CRT Glide",
      "Echo Ring",
      "Origin Wave",
      "Core Rotor",
      "Prism Bloom",
      "Helix Glow",
      "Helix Core",
      "Half Helix",
      "Sound Bars",
      "Infinity Run",
      "Mobius Run",
    ]);
    expect(state.dotMatrixAnimation).toEqual(DEFAULT_DOT_MATRIX_ANIMATION);
    expect(state.dotMatrixAnimation.enabled).toBe(false);
    expect(state.dotMatrixAnimation.exportAnimatedSvg).toBe(false);
    expect(state.dotMatrixAnimation.loader).toBe("neon-drift");
    expect(state.dotMatrixAnimation.pattern).toBe("full");
    expect(state.dotMatrixAnimation.dotShape).toBe("circle");
    expect(state.dotMatrixAnimation.customColorBase).toBe(state.dotMatrixAnimation.customColor);
    expect(state.dotMatrixAnimation.customColorMid).toBe(state.dotMatrixAnimation.customColor);
    expect(state.dotMatrixAnimation.customColorPeak).toBe(state.dotMatrixAnimation.customColor);
  });

  it("clamps dot matrix animation updates to supported ranges", () => {
    const state = createDefaultQrStudioState();
    const lowAnimation = setDotMatrixAnimationOptions(state, {
      opacityBase: -1,
      opacityMid: -2,
      opacityPeak: -3,
      overlayScale: -20,
      speed: -1,
    });
    const highAnimation = setDotMatrixAnimationOptions(state, {
      customColor: "#f4f4f5",
      enabled: true,
      exportAnimatedSvg: true,
      loader: "honey-gate",
      opacityBase: 2,
      opacityMid: 3,
      opacityPeak: 4,
      overlayScale: 240,
      pattern: "rings",
      dotShape: "diamond",
      speed: 12,
    });

    expect(lowAnimation.dotMatrixAnimation.opacityBase).toBe(0);
    expect(lowAnimation.dotMatrixAnimation.opacityMid).toBe(0);
    expect(lowAnimation.dotMatrixAnimation.opacityPeak).toBe(0);
    expect(lowAnimation.dotMatrixAnimation.overlayScale).toBe(100);
    expect(lowAnimation.dotMatrixAnimation.speed).toBe(1);
    expect(highAnimation.dotMatrixAnimation).toEqual({
      animated: true,
      colorPreset: "theme",
      customColor: "#f4f4f5",
      customColorBase: "#22d3ee",
      customColorMid: "#22d3ee",
      customColorPeak: "#22d3ee",
      dotShape: "diamond",
      enabled: true,
      exportAnimatedSvg: true,
      loader: "neon-drift",
      opacityBase: 1,
      opacityMid: 1,
      opacityPeak: 1,
      overlayScale: 140,
      pattern: "rings",
      speed: 5,
    });
    expect(clampDotMatrixAnimationOpacity(Number.NaN, DEFAULT_DOT_MATRIX_ANIMATION.opacityMid)).toBe(
      DEFAULT_DOT_MATRIX_ANIMATION.opacityMid,
    );
    expect(clampDotMatrixAnimationOverlayScale(Number.NaN)).toBe(
      DEFAULT_DOT_MATRIX_ANIMATION.overlayScale,
    );
    expect(clampDotMatrixAnimationSpeed(Number.NaN)).toBe(
      DEFAULT_DOT_MATRIX_ANIMATION.speed,
    );
  });

  it("drops removed dot matrix animation options from legacy state", () => {
    const state = createDefaultQrStudioState();
    const legacyState = {
      ...state,
      dotMatrixAnimation: {
        ...state.dotMatrixAnimation,
        bloom: true,
        halo: 1,
        hoverAnimated: true,
        muted: true,
      },
    } as unknown as typeof state;

    const cleaned = setDotMatrixAnimationOptions(legacyState, {});
    const animationRecord = cleaned.dotMatrixAnimation as Record<string, unknown>;

    expect(animationRecord.bloom).toBeUndefined();
    expect(animationRecord.halo).toBeUndefined();
    expect(animationRecord.hoverAnimated).toBeUndefined();
    expect(animationRecord.muted).toBeUndefined();
  });

  it("keeps loader color controls independent and persists opacity anchors", () => {
    const state = createDefaultQrStudioState();

    const custom = setDotMatrixAnimationOptions(state, {
      colorPreset: "mint",
      customColor: "#abcdef",
      customColorBase: "#111111",
      customColorMid: "#555555",
      customColorPeak: "#eeeeee",
      opacityBase: 0.14,
      opacityMid: 0.48,
      opacityPeak: 0.92,
    });

    expect(custom.dotMatrixAnimation.colorPreset).toBe("mint");
    expect(custom.dotMatrixAnimation.customColor).toBe("#abcdef");
    expect(custom.dotMatrixAnimation.customColorBase).toBe("#111111");
    expect(custom.dotMatrixAnimation.customColorMid).toBe("#555555");
    expect(custom.dotMatrixAnimation.customColorPeak).toBe("#eeeeee");
    expect(custom.dotMatrixAnimation.opacityBase).toBe(0.14);
    expect(custom.dotMatrixAnimation.opacityMid).toBe(0.48);
    expect(custom.dotMatrixAnimation.opacityPeak).toBe(0.92);

    const styleColorChanged = {
      ...custom,
      dotsOptions: {
        ...custom.dotsOptions,
        color: "#ff0000",
      },
    };

    expect(styleColorChanged.dotMatrixAnimation.colorPreset).toBe("mint");
    expect(styleColorChanged.dotMatrixAnimation.customColor).toBe("#abcdef");
    expect(styleColorChanged.dotMatrixAnimation.customColorBase).toBe("#111111");
    expect(styleColorChanged.dotMatrixAnimation.customColorMid).toBe("#555555");
    expect(styleColorChanged.dotMatrixAnimation.customColorPeak).toBe("#eeeeee");
  });

  it("seeds missing loader anchor colors from the legacy custom color", () => {
    const state = createDefaultQrStudioState();
    const legacyState = {
      ...state,
      dotMatrixAnimation: {
        ...state.dotMatrixAnimation,
        customColor: "#123abc",
        customColorBase: undefined,
        customColorMid: undefined,
        customColorPeak: undefined,
      },
    } as unknown as typeof state;

    const migrated = setDotMatrixAnimationOptions(legacyState, {});

    expect(migrated.dotMatrixAnimation.customColor).toBe("#123abc");
    expect(migrated.dotMatrixAnimation.customColorBase).toBe("#123abc");
    expect(migrated.dotMatrixAnimation.customColorMid).toBe("#123abc");
    expect(migrated.dotMatrixAnimation.customColorPeak).toBe("#123abc");
  });

  it("persists zero opacity anchors as literal zero values", () => {
    const state = createDefaultQrStudioState();

    const zeroOpacity = setDotMatrixAnimationOptions(state, {
      opacityBase: 0,
      opacityMid: 0,
      opacityPeak: 0,
    });

    expect(zeroOpacity.dotMatrixAnimation.opacityBase).toBe(0);
    expect(zeroOpacity.dotMatrixAnimation.opacityMid).toBe(0);
    expect(zeroOpacity.dotMatrixAnimation.opacityPeak).toBe(0);
  });

  it("clamps raster export quality updates to the supported range", () => {
    const state = createDefaultQrStudioState();
    const lowQuality = setRasterExportQualityPercent(state, 10);
    const highQuality = setRasterExportQualityPercent(state, 240);

    expect(lowQuality.rasterExportQualityPercent).toBe(25);
    expect(highQuality.rasterExportQualityPercent).toBe(100);
    expect(clampRasterExportQualityPercent(Number.NaN)).toBe(100);
  });

  it("clamps background shape padding to the supported pixel range", () => {
    expect(clampBackgroundShapePaddingPx(-12)).toBe(0);
    expect(clampBackgroundShapePaddingPx(96)).toBe(96);
    expect(clampBackgroundShapePaddingPx(240)).toBe(192);
    expect(clampBackgroundShapePaddingPx(Number.NaN)).toBe(0);
  });

  it("clamps background shape shadow values to the supported ranges", () => {
    expect(clampBackgroundShapeOpacity(-12)).toBe(0);
    expect(clampBackgroundShapeOpacity(72)).toBe(72);
    expect(clampBackgroundShapeOpacity(240)).toBe(100);
    expect(clampBackgroundShapeOffset(-96)).toBe(-64);
    expect(clampBackgroundShapeOffset(24)).toBe(24);
    expect(clampBackgroundShapeOffset(96)).toBe(64);
    expect(clampBackgroundShapeOffset(Number.NaN)).toBe(0);
  });

  it("uses the reference swatch colors as the default body palette", () => {
    const state = createDefaultQrStudioState();

    expect(state.dotsPalette).toEqual([
      "#04879c",
      "#0c3c78",
      "#090030",
      "#f30a49",
    ]);
  });

  it("keeps solid colors when gradients are disabled", () => {
    const state = createDefaultQrStudioState();
    state.dotsOptions.color = "#112233";
    state.dotsColorMode = "solid";

    const options = toQrCodeOptions(state);

    expect(options.dotsOptions?.color).toBe("#112233");
    expect(options.dotsOptions?.gradient).toBeUndefined();
  });

  it("emits gradient payloads when enabled", () => {
    const state = createDefaultQrStudioState();
    state.dotsColorMode = "gradient";
    state.dotsGradient.enabled = true;
    state.dotsGradient.type = "radial";
    state.dotsGradient.rotation = 1.2;
    state.dotsGradient.colorStops = [
      { offset: 0, color: "#101010" },
      { offset: 1, color: "#fafafa" },
    ];

    const options = toQrCodeOptions(state);

    expect(options.dotsOptions?.color).toBeUndefined();
    expect(options.dotsOptions?.gradient).toEqual({
      type: "radial",
      rotation: 1.2,
      colorStops: [
        { offset: 0, color: "#101010" },
        { offset: 1, color: "#fafafa" },
      ],
    });
  });

  it("omits upstream dot colors when palette mode is enabled", () => {
    const state = createDefaultQrStudioState();
    state.dotsColorMode = "palette";
    state.dotsOptions.color = "#112233";
    state.dotsGradient.enabled = true;
    state.dotsGradient.type = "radial";
    state.dotsGradient.rotation = 1.2;
    state.dotsGradient.colorStops = [
      { offset: 0, color: "#101010" },
      { offset: 1, color: "#fafafa" },
    ];

    const options = toQrCodeOptions(state);

    expect(options.dotsOptions?.color).toBeUndefined();
    expect(options.dotsOptions?.gradient).toBeUndefined();
  });

  it("still emits background gradient payloads when enabled", () => {
    const state = createDefaultQrStudioState();
    state.backgroundGradient.enabled = true;
    state.backgroundGradient.type = "radial";
    state.backgroundGradient.rotation = 1.2;
    state.backgroundGradient.colorStops = [
      { offset: 0, color: "#101010" },
      { offset: 1, color: "#fafafa" },
    ];

    const options = toQrCodeOptions(state);

    expect(options.backgroundOptions?.gradient).toEqual({
      type: "radial",
      rotation: 1.2,
      colorStops: [
        { offset: 0, color: "#101010" },
        { offset: 1, color: "#fafafa" },
      ],
    });
  });

  it("omits empty image values from the QR options", () => {
    const state = createDefaultQrStudioState();
    state.logo = {
      source: "url",
      value: "   ",
    };

    const options = toQrCodeOptions(state);

    expect(options.image).toBeUndefined();
  });

  it("preserves intentionally blank content instead of swapping in a hidden URL", () => {
    const state = createDefaultQrStudioState();
    state.data = "   ";

    const options = toQrCodeOptions(state);

    expect(options.data).toBe("");
  });

  it("maps custom heart dots to square modules for the upstream renderer", () => {
    const state = createDefaultQrStudioState();
    state.dotsOptions.type = "heart" as typeof state.dotsOptions.type;

    const options = toQrCodeOptions(state);

    expect(options.dotsOptions?.type).toBe("square");
  });

  it("maps custom diamond dots to square modules for the upstream renderer", () => {
    const state = createDefaultQrStudioState();
    state.dotsOptions.type = "diamond" as typeof state.dotsOptions.type;

    const options = toQrCodeOptions(state);

    expect(options.dotsOptions?.type).toBe("square");
  });

  it("maps the shared logo asset onto the upstream image field", () => {
    const state = createDefaultQrStudioState();
    state.logo = {
      source: "url",
      value: "https://example.com/logo.png",
    };

    const options = toQrCodeOptions(state);

    expect(options.image).toBe("https://example.com/logo.png");
  });

  it("keeps upstream logo size coefficients within the full 0 to 1 range", () => {
    const zeroSizeState = createDefaultQrStudioState();
    zeroSizeState.imageOptions.imageSize = -0.2;

    const fullSizeState = createDefaultQrStudioState();
    fullSizeState.imageOptions.imageSize = 1.4;

    expect(toQrCodeOptions(zeroSizeState).imageOptions?.imageSize).toBe(0);
    expect(toQrCodeOptions(fullSizeState).imageOptions?.imageSize).toBe(1);
  });

  it("maps preset logo assets onto the upstream image field", () => {
    const state = createDefaultQrStudioState();
    state.logo = {
      source: "preset",
      presetId: "whatsapp" as never,
      presetColor: "#111827",
      value: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20/%3E",
    };

    const options = toQrCodeOptions(state);

    expect(options.image).toBe(
      "data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20/%3E",
    );
  });

  it("suppresses background fill and gradient when a background image is active", () => {
    const state = createDefaultQrStudioState();
    state.backgroundOptions.color = "#112233";
    state.backgroundGradient.enabled = true;
    state.backgroundGradient.type = "radial";
    state.backgroundGradient.colorStops = [
      { offset: 0, color: "#010203" },
      { offset: 1, color: "#f8f9fa" },
    ];
    state.backgroundImage = {
      source: "upload",
      value: "blob:https://new-qr-studio.local/background.png",
    };

    const options = toQrCodeOptions(state);

    expect(options.backgroundOptions?.color).toBeUndefined();
    expect(options.backgroundOptions?.gradient).toBeUndefined();
  });
});
