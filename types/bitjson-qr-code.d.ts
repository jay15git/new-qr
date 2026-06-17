import type { JSX as ReactJSX } from "react";

declare module "@bitjson/qr-code/dist/esm" {
  export function defineCustomElements(window: Window): void;
}

declare module "@bitjson/qr-code/dist/collection/components/qr-code/qr-svg-adapter.js" {
  export function adaptExternalQRCodeSVG(
    externalSvg: string,
    options: {
      moduleColor: string;
      positionRingColor: string;
      positionCenterColor: string;
      squares: boolean;
    },
  ):
    | {
        svg: string;
        moduleCount: number;
        margin: number;
        hasFinderPatterns: boolean;
      }
    | undefined;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "qr-code": ReactJSX.DetailedHTMLProps<
        ReactJSX.HTMLAttributes<HTMLElement> & {
          contents?: string;
          ref?: React.Ref<HTMLElement>;
        },
        HTMLElement
      >;
    }
  }
}

export {};
