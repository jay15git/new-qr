import { emitLiveReact } from "./emit-live-react"
import { emitSvg } from "./emit-svg"
import { buildCodegenManifest } from "./manifest"
import { preprocessSvg } from "./preprocess-svg"
import { svgToFramework } from "./svg-transforms/svg-to-framework"
import type { FrameworkTarget, SceneIr } from "./types"
import { isLiveReactTarget } from "./types"

export type { FrameworkTarget, SceneIr, SceneIrBounds, SceneIrFontRef, SceneIrShaderNode } from "./types"
export { isLiveReactTarget } from "./types"
export { emitSvg } from "./emit-svg"
export { emitLiveReact } from "./emit-live-react"
export { preprocessSvg, flattenNestedSvgs, prefixSvgIds } from "./preprocess-svg"
export { buildCodegenManifest } from "./manifest"
export { normalizeSvg, extractSvgInnerMarkup } from "./normalize-svg"
export { parseReactSvgContent } from "./svg-transforms/parse-react-svg"
export { svgToFramework } from "./svg-transforms/svg-to-framework"

export async function buildCodegenOutput(ir: SceneIr, target: FrameworkTarget) {
  const manifest = buildCodegenManifest(ir, target)

  if (isLiveReactTarget(target)) {
    const code = emitLiveReact(ir, {
      dialect: target.dialect,
      componentName: target.componentName ?? ir.componentName,
    })
    return {
      code: manifest.installCommand
        ? `/** Required:\n * ${manifest.installCommand}\n */\n${code}`
        : code,
      manifest,
      svg: preprocessSvg(emitSvg(ir)),
    }
  }

  const svg = preprocessSvg(emitSvg(ir), { idPrefix: ir.componentName ?? "qr-card" })
  const code = await svgToFramework(svg, target)
  const header = manifest.installCommand ? `/** Required:\n * ${manifest.installCommand}\n */\n` : ""

  return {
    code: `${header}${code}`,
    manifest,
    svg,
  }
}
