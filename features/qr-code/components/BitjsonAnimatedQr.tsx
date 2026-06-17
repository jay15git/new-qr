"use client";

import { defineCustomElements } from "@bitjson/qr-code/dist/esm";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";

import {
  toBitjsonElementConfig,
  type BitjsonQrElementConfig,
} from "@/features/qr-code/motion/bitjson-bridge";
import type { QrStudioState } from "@/features/qr-code/model/state";
import { cn } from "@/lib/utils";

let bitjsonElementsDefined = false;

function ensureBitjsonElements() {
  if (bitjsonElementsDefined || typeof window === "undefined") {
    return;
  }

  defineCustomElements(window);
  bitjsonElementsDefined = true;
}

type BitjsonQrCodeElement = HTMLElement & {
  animateQRCode: (animation?: string) => void;
  animationSpeed: number;
  autoAnimate: string;
  autoAnimateInterval: number;
  componentOnReady?: () => Promise<HTMLElement | null>;
  contents: string;
  dotMatrixColorBase: string;
  dotMatrixColorMid: string;
  dotMatrixColorPeak: string;
  dotMatrixOpacityBase: number;
  dotMatrixOpacityMid: number;
  dotMatrixOpacityPeak: number;
  externalSvg: string;
  hoverColorMode: BitjsonQrElementConfig["hoverColorMode"];
  hoverEffect: string;
  moduleColor: string;
  motionIntensity: BitjsonQrElementConfig["motionIntensity"];
  positionCenterColor: string;
  positionRingColor: string;
  respectReducedMotion: boolean;
};

function applyBitjsonConfig(element: BitjsonQrCodeElement, config: BitjsonQrElementConfig) {
  element.contents = config.contents;
  element.moduleColor = config.moduleColor;
  element.positionRingColor = config.positionRingColor;
  element.positionCenterColor = config.positionCenterColor;
  element.animationSpeed = config.animationSpeed;
  element.autoAnimate = config.autoAnimate;
  element.autoAnimateInterval = config.autoAnimateInterval;
  element.dotMatrixOpacityBase = config.dotMatrixOpacityBase;
  element.dotMatrixOpacityMid = config.dotMatrixOpacityMid;
  element.dotMatrixOpacityPeak = config.dotMatrixOpacityPeak;
  element.dotMatrixColorBase = config.dotMatrixColorBase;
  element.dotMatrixColorMid = config.dotMatrixColorMid;
  element.dotMatrixColorPeak = config.dotMatrixColorPeak;
  element.hoverEffect = config.hoverEffect;
  element.hoverColorMode = config.hoverColorMode;
  element.motionIntensity = config.motionIntensity;
  element.respectReducedMotion = config.respectReducedMotion;

  if (config.useExternalSvg) {
    element.externalSvg = config.externalSvg;
    element.setAttribute("external-svg", config.externalSvg);
  } else {
    element.externalSvg = "";
    element.removeAttribute("external-svg");
  }
}

export function BitjsonAnimatedQr({
  className,
  height,
  state,
  style,
  width,
}: {
  className?: string;
  height: number;
  state: QrStudioState;
  style?: CSSProperties;
  width: number;
}) {
  const elementRef = useRef<BitjsonQrCodeElement | null>(null);
  const config = useMemo(() => toBitjsonElementConfig(state), [state]);
  const motionEnabled = state.dotMatrixAnimation.enabled && state.dotMatrixAnimation.animated;

  useEffect(() => {
    ensureBitjsonElements();
  }, []);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    applyBitjsonConfig(element, config);
  }, [config]);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !motionEnabled) {
      return;
    }

    const handleRendered = () => {
      element.animateQRCode(config.animationPreset);
    };

    element.addEventListener("codeRendered", handleRendered);

    return () => {
      element.removeEventListener("codeRendered", handleRendered);
    };
  }, [config.animationPreset, motionEnabled]);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !motionEnabled) {
      return;
    }

    let cancelled = false;

    void element.componentOnReady?.().then(() => {
      if (!cancelled) {
        element.animateQRCode(config.animationPreset);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [config, motionEnabled]);

  return (
    <div
      className={cn("relative max-h-none max-w-none [&_qr-code]:block [&_qr-code]:h-full [&_qr-code]:w-full", className)}
      style={style}
    >
      <qr-code
        ref={elementRef}
        contents={config.contents}
        style={{
          display: "block",
          height,
          width,
        }}
      >
        {config.logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" slot="icon" src={config.logoSrc} />
        ) : null}
      </qr-code>
    </div>
  );
}
