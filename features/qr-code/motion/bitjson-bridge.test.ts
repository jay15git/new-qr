// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  adaptQrcodeReactSvgForBitjson,
  renderQrcodeReactSvg,
  toBitjsonElementConfig,
  toQrcodeReactProps,
} from "@/features/qr-code/motion/bitjson-bridge";
import { annotateCanvasSvgForBitjson } from "@/features/qr-code/motion/canvas-svg-adapter";
import { renderDashboardQrSvgMarkup } from "@/features/qr-code/rendering/qr-svg";
import {
  createDefaultQrStudioState,
  dotMatrixLoaderToBitjsonPreset,
  resolveBitjsonMotionPreset,
  setDotMatrixAnimationOptions,
} from "@/features/qr-code/model/state";
import { createDraftingQrArtworkState } from "@/features/workspace/rendering/qr-artwork";

describe("bitjson motion bridge", () => {
  it("maps desktop loaders to bitjson preset names", () => {
    expect(dotMatrixLoaderToBitjsonPreset("neon-drift")).toBe("NeonDrift");
    expect(dotMatrixLoaderToBitjsonPreset("mobius-run")).toBe("MobiusRun");
  });

  it("renders qrcode.react svg markup for desktop state", () => {
    const state = createDefaultQrStudioState();

    const markup = renderQrcodeReactSvg(state);

    expect(markup).toContain("<svg");
    expect(markup).toContain('d="M');
  });

  it("adapts qrcode.react svg into animatable modules", () => {
    const state = createDefaultQrStudioState();
    const adapted = adaptQrcodeReactSvgForBitjson(state);

    expect(adapted?.moduleCount).toBeGreaterThan(0);
    expect(adapted?.svg).toContain('class="module"');
    expect(adapted?.svg).toContain("data-column");
  });

  it("maps motion state to bitjson element config", () => {
    const state = setDotMatrixAnimationOptions(createDefaultQrStudioState(), {
      enabled: true,
      animated: true,
      hoverEffect: "DotField",
      motionIntensity: "dramatic",
      preset: "SpiralBloom",
      presetCategory: "standard",
      speed: 6,
    });

    const config = toBitjsonElementConfig(state);

    expect(config.animationPreset).toBe("SpiralBloom");
    expect(config.animationSpeed).toBe(2);
    expect(config.hoverEffect).toBe("DotField");
    expect(config.motionIntensity).toBe("dramatic");
    expect(config.useExternalSvg).toBe(true);
    expect(config.externalSvg).toContain('class="module"');
  });

  it("resolves ported standard motion presets through the bridge", () => {
    const state = setDotMatrixAnimationOptions(createDefaultQrStudioState(), {
      preset: "PrismSweep",
      presetCategory: "standard",
    });

    expect(resolveBitjsonMotionPreset(state.dotMatrixAnimation)).toBe("PrismSweep");
    expect(toBitjsonElementConfig(state).animationPreset).toBe("PrismSweep");
  });

  it("resolves new standard motion presets through the bridge", () => {
    const state = setDotMatrixAnimationOptions(createDefaultQrStudioState(), {
      preset: "QuantumMaterialize",
      presetCategory: "standard",
    });

    expect(resolveBitjsonMotionPreset(state.dotMatrixAnimation)).toBe("QuantumMaterialize");
    expect(toBitjsonElementConfig(state).animationPreset).toBe("QuantumMaterialize");
  });

  it("builds qrcode.react props from studio state", () => {
    const state = createDefaultQrStudioState();
    state.data = "https://example.com";
    state.margin = 8;

    const props = toQrcodeReactProps(state);

    expect(props.value).toBe("https://example.com");
    expect(props.marginSize).toBe(8);
    expect(props.level).toBe(state.qrOptions.errorCorrectionLevel);
  });

  it("adapts canvas lglab svg for bitjson motion while preserving styled markers", () => {
    const state = createDefaultQrStudioState();
    state.data = "https://styled.example";
    state.finderPatternInnerSettings.type = "heart";
    state.finderPatternOuterSettings.type = "rounded-lg";

    const canvasMarkup = renderDashboardQrSvgMarkup(createDraftingQrArtworkState(state));
    const adapted = annotateCanvasSvgForBitjson(canvasMarkup, state);

    expect(adapted?.moduleCount).toBeGreaterThan(0);
    expect(adapted?.svg).toContain('class="module"');
    expect(adapted?.svg).toContain("data-column");
    expect(adapted?.svg).toContain('data-testid="finder-patterns-outer"');
    expect(adapted?.svg).toContain('data-testid="finder-patterns-inner"');
  });

  it("prefers canvas svg markup over qrcode.react when building bitjson config", () => {
    const state = setDotMatrixAnimationOptions(createDefaultQrStudioState(), {
      enabled: true,
      animated: true,
    });
    state.data = "https://canvas.example";

    const canvasMarkup = renderDashboardQrSvgMarkup(createDraftingQrArtworkState(state));
    const config = toBitjsonElementConfig(state, { canvasSvgMarkup: canvasMarkup });

    expect(config.useExternalSvg).toBe(true);
    expect(config.externalSvg).toContain('class="module"');
    expect(config.externalSvg).toContain('data-testid="finder-patterns-outer"');
    expect(config.contents).toBe("https://canvas.example");
  });
});
