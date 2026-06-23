import { AddAnimationOptions } from 'just-animate/types/lib/core/types';
export { remapOpacityToTriplet, SOURCE_BASE_OPACITY, SOURCE_MID_OPACITY, SOURCE_PEAK_OPACITY, } from './opacity-triplet';
export declare enum QRCodeEntity {
    Module = "module",
    PositionRing = "position-ring",
    PositionCenter = "position-center",
    Icon = "icon"
}
export declare type QRCodeAnimation = (targets: any, modulePositionX: number, modulePositionY: number, count: number, entityType: QRCodeEntity, settings?: QRCodeAnimationSettings) => AddAnimationOptions;
export interface QRCodeAnimationSettings {
    animationSpeed?: number;
    dotMatrixOpacityBase?: number;
    dotMatrixOpacityMid?: number;
    dotMatrixOpacityPeak?: number;
    dotMatrixColorBase?: string;
    dotMatrixColorMid?: string;
    dotMatrixColorPeak?: string;
}
export declare enum AnimationPreset {
    FadeInTopDown = "FadeInTopDown",
    FadeInCenterOut = "FadeInCenterOut",
    RadialRipple = "RadialRipple",
    RadialRippleIn = "RadialRippleIn",
    MaterializeIn = "MaterializeIn",
    SubtlePulse = "SubtlePulse",
    FinderPing = "FinderPing",
    SoftMaterialize = "SoftMaterialize",
    CenterBloom = "CenterBloom",
    CornerSweep = "CornerSweep",
    PrismRipple = "PrismRipple",
    OrbitReveal = "OrbitReveal",
    LumenWave = "LumenWave",
    DiamondGlint = "DiamondGlint",
    NeonTrace = "NeonTrace",
    GlassSweep = "GlassSweep",
    VelvetBreath = "VelvetBreath",
    SignalScan = "SignalScan",
    ConfettiPop = "ConfettiPop",
    SpiralBloom = "SpiralBloom",
    BubbleCascade = "BubbleCascade",
    KaleidoPulse = "KaleidoPulse",
    FireflyTwinkle = "FireflyTwinkle",
    AuroraSweep = "AuroraSweep",
    MagneticRipple = "MagneticRipple",
    ParallaxTiles = "ParallaxTiles",
    ConstellationTrace = "ConstellationTrace",
    ApertureReveal = "ApertureReveal",
    LensFocus = "LensFocus",
    ReceiptPrint = "ReceiptPrint",
    FlipClock = "FlipClock",
    WaveInterference = "WaveInterference",
    QuantumMaterialize = "QuantumMaterialize",
    MagneticSnap = "MagneticSnap",
    HoloFlicker = "HoloFlicker",
    SignalGlitch = "SignalGlitch",
    ShockwaveJolt = "ShockwaveJolt",
    TideRise = "TideRise",
    GravityCollapse = "GravityCollapse",
    NeonDrift = "NeonDrift",
    PulseLadder = "PulseLadder",
    CoreSpiral = "CoreSpiral",
    TwinOrbit = "TwinOrbit",
    PrismSweep = "PrismSweep",
    FluxColumns = "FluxColumns",
    BlockDrop = "BlockDrop",
    StrobeStack = "StrobeStack",
    GlyphPulse = "GlyphPulse",
    CRTGlide = "CRTGlide",
    EchoRing = "EchoRing",
    OriginWave = "OriginWave",
    CoreRotor = "CoreRotor",
    PrismBloom = "PrismBloom",
    HelixGlow = "HelixGlow",
    HelixCore = "HelixCore",
    HalfHelix = "HalfHelix",
    SoundBars = "SoundBars",
    InfinityRun = "InfinityRun",
    MobiusRun = "MobiusRun"
}
export declare const standardAnimationPresets: AnimationPreset[];
export declare const dotMatrixAnimationPresets: AnimationPreset[];
declare type DotMatrixCssBlendKeyframe = {
    offset: number;
    cssBlend: {
        base: number;
        mid: number;
        peak: number;
    };
};
declare type WebKeyframeValue = number | {
    offset: number;
    value: number;
} | DotMatrixCssBlendKeyframe;
declare const SQUARE2_TAIL: number[];
declare const SQUARE2_BASE_OPACITY = 0.08;
declare const SQUARE2_ROUTE: number[];
declare const opacityFromSquare2Tail: (index: number, head: number) => number;
export declare const resolveDotMatrixKeyframeOpacity: (frame: WebKeyframeValue, settings?: QRCodeAnimationSettings) => number;
export declare const getAnimationPreset: (name: string) => QRCodeAnimation;
export { opacityFromSquare2Tail, SQUARE2_ROUTE, SQUARE2_BASE_OPACITY, SQUARE2_TAIL };
