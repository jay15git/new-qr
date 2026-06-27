export type {
  NewQrCodeProps,
  NewQrGradientConfig,
  NewQrLogoConfig,
  NewQrShaderConfig,
  PortableQrConfig,
  QrFinderStyle,
  QrModuleStyle,
} from "./types"

export {
  formatPortableQrPropsForCodegen,
  portablePropsToReactQrProps,
  renderNewQrSvg,
} from "./core"

export { emitNewQrCodeAttributes, registerNewQrCodeElement } from "./web-component"

export { QrScene, type QrSceneProps } from "@new-qr/qr-scene-react"
