import { describe, expect, it } from "vitest";

import {
  createDefaultQrStudioState,
  toQrCodeOptions,
} from "./qr-studio-state";

describe("qr studio state helpers", () => {
  it("starts with shared asset state for logo and background", () => {
    const state = createDefaultQrStudioState();

    expect(state.logo).toEqual({ source: "none", value: undefined });
    expect(state.backgroundImage).toEqual({
      source: "none",
      value: undefined,
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
