export interface QRExternalSVGAdapterOptions {
    moduleColor: string;
    positionRingColor: string;
    positionCenterColor: string;
    squares: boolean;
}
export interface QRExternalSVGAdapterResult {
    svg: string;
    moduleCount: number;
    margin: number;
    hasFinderPatterns: boolean;
}
interface QRPathRun {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare function adaptExternalQRCodeSVG(externalSvg: string, options: QRExternalSVGAdapterOptions): QRExternalSVGAdapterResult | undefined;
export declare function parseHorizontalPathRuns(pathData: string): QRPathRun[];
export {};
