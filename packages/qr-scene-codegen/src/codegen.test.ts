import { describe, expect, it } from "vitest"

import { emitLiveReact } from "./emit-live-react"
import { emitSvg } from "./emit-svg"
import { buildCodegenOutput } from "./index"
import { normalizeSvg } from "./normalize-svg"
import { preprocessSvg } from "./preprocess-svg"
import { parseReactSvgContent } from "./svg-transforms/parse-react-svg"
import type { SceneIr } from "./types"

const sampleIr: SceneIr = {
  bounds: { minX: 0, minY: 0, width: 100, height: 100 },
  defs: "",
  body: '<rect x="10" y="10" width="20" height="20" fill="#111" />',
  shaders: [],
  fonts: [],
  componentName: "QrCard",
}

describe("qr-scene-codegen", () => {
  it("emits svg from scene ir", () => {
    const svg = emitSvg(sampleIr)
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('<rect x="10" y="10"')
  })

  it("flattens nested svg elements", () => {
    const nested = `<svg viewBox="0 0 100 100"><g><svg x="10" y="10" width="20" height="20" viewBox="0 0 10 10"><rect width="10" height="10"/></svg></g></svg>`
    const flattened = preprocessSvg(nested)
    expect(flattened).not.toMatch(/<svg[\s\S]*<svg/)
    expect(flattened).toContain("<g")
  })

  it("keeps static react svg semantically aligned with canonical svg", async () => {
    const svg = preprocessSvg(emitSvg(sampleIr))
    const react = await parseReactSvgContent({
      componentName: "QrCard",
      svgCode: svg,
      typescript: true,
    })

    expect(normalizeSvg(svg)).toContain('viewBox="0 0 100 100"')
    expect(react).toContain("SVGProps")
    expect(react).toContain("{...props}")
    expect(react).toContain('fill="#111"')
  })

  it("builds static tsx export", async () => {
    const result = await buildCodegenOutput(sampleIr, {
      framework: "react",
      dialect: "tsx",
      mode: "static",
      componentName: "QrCard",
    })

    expect(result.code).toContain("QrCard")
    expect(result.code).toContain("SVGProps")
  })

  it("builds live react export with shader import", () => {
    const ir: SceneIr = {
      ...sampleIr,
      shaders: [
        {
          kind: "shader",
          shader: {
            shaderId: "halftone-cmyk",
            params: { size: 0.2 },
            frame: 0,
            speed: 1,
            paused: false,
          },
          bounds: { x: 0, y: 0, width: 100, height: 100 },
          fallbackFill: "#fff",
        },
      ],
    }

    const code = emitLiveReact(ir, { dialect: "tsx", componentName: "QrCard" })
    expect(code).toContain("HalftoneCmyk")
    expect(code).toContain("@paper-design/shaders-react")
  })
})
