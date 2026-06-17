// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  adaptQrcodeReactSvgForBitjson,
  renderQrcodeReactSvg,
  toBitjsonElementConfig,
  toQrcodeReactProps,
} from "@/features/qr-code/motion/bitjson-bridge";
import {
  createDefaultQrStudioState,
  dotMatrixLoaderToBitjsonPreset,
  resolveBitjsonMotionPreset,
  setDotMatrixAnimationOptions,
} from "@/features/qr-code/model/state";

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

  it("resolves dot matrix presets from loader state", () => {
    const state = setDotMatrixAnimationOptions(createDefaultQrStudioState(), {
      loader: "prism-sweep",
      preset: "prism-sweep",
      presetCategory: "dotMatrix",
    });

    expect(resolveBitjsonMotionPreset(state.dotMatrixAnimation)).toBe("PrismSweep");
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
});
