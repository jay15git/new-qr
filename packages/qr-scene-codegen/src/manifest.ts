import type { FrameworkTarget, SceneIr } from "./types"
import { isLiveReactTarget } from "./types"

export function buildCodegenManifest(
  ir: SceneIr,
  target: FrameworkTarget,
) {
  const dependencies: Record<string, string> = {}

  if (isLiveReactTarget(target)) {
    if (ir.shaders.length > 0) {
      dependencies["@paper-design/shaders-react"] = "0.0.76"
      dependencies["@paper-design/shaders"] = "0.0.76"
    }
    if (ir.animatedQr) {
      dependencies["@new-qr/qr-scene-bitjson"] = "workspace:*"
    }
  }

  if (target.framework === "react" && target.dialect === "tsx") {
    dependencies.react = "^19.2.4"
  }

  const installCommand =
    Object.keys(dependencies).length > 0
      ? `pnpm add ${Object.keys(dependencies).join(" ")}`
      : ""

  const fontBlocks = ir.fonts
    .map((font) => {
      if (font.cssUrl) {
        return `<link rel="stylesheet" href="${font.cssUrl}" />`
      }
      if (font.cssText) {
        return `<style>${font.cssText}</style>`
      }
      return ""
    })
    .filter(Boolean)
    .join("\n")

  return {
    dependencies,
    installCommand,
    fontBlocks,
  }
}
