import { describe, expect, it } from "vitest"

import { emitCss } from "./emit-css"
import { emitHtml } from "./emit-html"
import { emitLiveReact } from "./emit-live-react"
import { emitSvg } from "./emit-svg"
import { buildCodegenOutput } from "./index"
import { normalizeSvg } from "./normalize-svg"
import { preprocessSvg } from "./preprocess-svg"
import { parseReactSvgContent } from "./svg-transforms/parse-react-svg"
import type { DomLayerNode, SceneIr } from "./types"

const sampleDomLayers: DomLayerNode[] = [
  {
    kind: "card",
    id: "card-1",
    bounds: { x: 0, y: 0, width: 100, height: 100 },
    style: {
      backgroundColor: "#ffffff",
      height: 100,
      left: 0,
      position: "absolute",
      top: 0,
      width: 100,
    },
  },
  {
    kind: "text",
    id: "text-1",
    bounds: { x: 10, y: 10, width: 80, height: 20 },
    style: {
      color: "#111111",
      fontSize: 16,
      height: "fit-content",
      left: 10,
      position: "absolute",
      top: 10,
      width: 80,
    },
    content: "Hello",
  },
]

const sampleIr: SceneIr = {
  bounds: { minX: 0, minY: 0, width: 100, height: 100 },
  defs: "",
  body: '<rect x="10" y="10" width="20" height="20" fill="#111" />',
  domLayers: sampleDomLayers,
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

  it("emits html from dom layers without root svg wrapper", () => {
    const html = emitHtml(sampleIr)
    expect(html).toContain('class="qr-card"')
    expect(html).toContain('class="qr-layer qr-layer--card')
    expect(html).toContain('class="qr-layer qr-layer--text')
    expect(html).toContain("Hello")
    expect(html).not.toMatch(/<svg[\s\S]*viewBox="0 0 100 100"/)
    expect(html).not.toContain("Required:")
  })

  it("emits css from dom layers with layer classes", () => {
    const css = emitCss(sampleIr)
    expect(css).toContain("<style>")
    expect(css).toContain(".qr-card")
    expect(css).toContain(".qr-layer--card-0")
    expect(css).toContain(".qr-layer--text-1")
    expect(css).not.toMatch(/<svg[\s\S]*viewBox="0 0 100 100"/)
  })

  it("emits react from dom layers without monolithic svg blob", () => {
    const react = emitLiveReact(sampleIr, { dialect: "tsx", componentName: "QrCard" })
    expect(react).toContain("<div style={{")
    expect(react).toContain("Hello")
    expect(react).not.toContain("dangerouslySetInnerHTML")
    expect(react).not.toContain("<svg")
  })

  it("emits qr layers as NewQrCode component props", () => {
    const ir: SceneIr = {
      ...sampleIr,
      domLayers: [
        {
          kind: "qr",
          id: "qr-1",
          bounds: { x: 0, y: 0, width: 100, height: 100 },
          style: {
            height: 100,
            left: 0,
            position: "absolute",
            top: 0,
            width: 100,
          },
          qrProps: {
            value: "https://example.com",
            module: "diamond",
            finderInner: "rounded",
            finderOuter: "rounded-lg",
          },
        },
      ],
    }

    const react = emitLiveReact(ir, { dialect: "tsx", componentName: "QrCard" })
    expect(react).toContain('import { NewQrCode } from "@new-qr/qr/react"')
    expect(react).toContain("<NewQrCode")
    expect(react).toContain('module="diamond"')
    expect(react).not.toContain("clipPath:")
  })

  it("emits qr layers as new-qr-code web component in html", () => {
    const ir: SceneIr = {
      ...sampleIr,
      domLayers: [
        {
          kind: "qr",
          id: "qr-1",
          bounds: { x: 0, y: 0, width: 100, height: 100 },
          style: {
            height: 100,
            left: 0,
            position: "absolute",
            top: 0,
            width: 100,
          },
          qrProps: {
            value: "https://example.com",
            module: "diamond",
          },
        },
      ],
    }

    const html = emitHtml(ir)
    expect(html).toContain("<new-qr-code")
    expect(html).toContain('module="diamond"')
    expect(html).toContain('registerNewQrCodeElement')
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

  it("builds react tsx export without deps for simple scenes", async () => {
    const result = await buildCodegenOutput(sampleIr, {
      format: "react",
      dialect: "tsx",
      componentName: "QrCard",
    })

    expect(result.code).toContain("QrCard")
    expect(result.code).not.toContain("Required:")
    expect(result.manifest.installCommand).toBe("")
    expect(result.code).not.toContain("dangerouslySetInnerHTML")
  })

  it("builds react export with shader import when shaders are present", async () => {
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

    const result = await buildCodegenOutput(ir, {
      format: "react",
      dialect: "tsx",
      componentName: "QrCard",
    })

    expect(result.code).toContain("HalftoneCmyk")
    expect(result.code).toContain("@paper-design/shaders-react")
    expect(result.manifest.installCommand).toContain("@paper-design/shaders-react")
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

  it("builds legacy static tsx export", async () => {
    const result = await buildCodegenOutput(sampleIr, {
      framework: "react",
      dialect: "tsx",
      mode: "static",
      componentName: "QrCard",
    })

    expect(result.code).toContain("QrCard")
    expect(result.code).toContain("SVGProps")
  })
})
