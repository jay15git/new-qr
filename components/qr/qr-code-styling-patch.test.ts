import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { afterEach, describe, expect, it } from "vitest"
import QRCodeStyling from "qr-code-styling"

type StubElement = {
  tagName: string
  attributes: Record<string, string>
  children: StubElement[]
  ownerDocument: StubDocument
  parentNode?: StubElement
  appendChild: (child: StubElement) => StubElement
  getAttribute: (name: string) => string | null
  remove: () => void
  setAttribute: (name: string, value: string) => void
  setAttributeNS: (_namespace: string, name: string, value: string) => void
}

type StubDocument = {
  createElementNS: (_namespace: string, tagName: string) => StubElement
}

const LOGO_HREF = "https://example.com/logo.png"

const originalWindow = globalThis.window
const originalXMLSerializer = globalThis.XMLSerializer

function createStubElement(tagName: string, ownerDocument: StubDocument): StubElement {
  const element: StubElement = {
    tagName,
    attributes: {},
    children: [],
    ownerDocument,
    appendChild(child) {
      child.remove()
      child.parentNode = element
      element.children.push(child)
      return child
    },
    getAttribute(name) {
      return element.attributes[name] ?? null
    },
    remove() {
      if (!element.parentNode) {
        return
      }

      element.parentNode.children = element.parentNode.children.filter(
        (child) => child !== element,
      )
      delete element.parentNode
    },
    setAttribute(name, value) {
      element.attributes[name] = value
    },
    setAttributeNS(_namespace, name, value) {
      element.attributes[name] = value
    },
  }

  return element
}

function createStubWindow(imageWidth: number, imageHeight: number) {
  const document: StubDocument = {
    createElementNS(_namespace, tagName) {
      return createStubElement(tagName, document)
    },
  }

  class StubXMLSerializer {
    serializeToString() {
      return "<svg />"
    }
  }

  class StubImage {
    crossOrigin?: string
    height = imageHeight
    onload: null | (() => void) = null
    width = imageWidth

    set src(_value: string) {
      queueMicrotask(() => this.onload?.())
    }
  }

  return {
    Image: StubImage,
    XMLSerializer: StubXMLSerializer,
    document,
  }
}

function walk(node: StubElement): StubElement[] {
  return [node, ...node.children.flatMap(walk)]
}

function getLogoImage(svg: StubElement) {
  return walk(svg).find(
    (node) =>
      node.tagName === "image" &&
      (node.getAttribute("href") === LOGO_HREF ||
        node.getAttribute("xlink:href") === LOGO_HREF),
  )
}

function intersects(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  )
}

async function renderSvgForOverlapCheck() {
  const stubWindow = createStubWindow(240, 120)
  globalThis.window = stubWindow as unknown as typeof globalThis.window
  globalThis.XMLSerializer = stubWindow.XMLSerializer as typeof XMLSerializer

  const qrCode = new QRCodeStyling({
    width: 320,
    height: 320,
    type: "svg",
    data: "https://example.com/logo-overlap",
    image: LOGO_HREF,
    margin: 12,
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 8,
      saveAsBlob: false,
    },
    dotsOptions: {
      type: "square",
      color: "#000000",
      roundSize: false,
    },
  })

  await qrCode.getRawData("svg")

  return (qrCode as { _svg?: StubElement })._svg
}

async function renderLogoWidth(imageSize: number) {
  const stubWindow = createStubWindow(240, 120)
  globalThis.window = stubWindow as unknown as typeof globalThis.window
  globalThis.XMLSerializer = stubWindow.XMLSerializer as typeof XMLSerializer

  const qrCode = new QRCodeStyling({
    width: 320,
    height: 320,
    type: "svg",
    data: "https://example.com/logo-scaling",
    image: LOGO_HREF,
    margin: 12,
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,
      imageSize,
      margin: 8,
      saveAsBlob: false,
    },
  })

  await qrCode.getRawData("svg")

  const svg = (qrCode as { _svg?: StubElement })._svg
  const logoImage = svg ? getLogoImage(svg) : null

  expect(logoImage).toBeDefined()

  return Number.parseFloat(logoImage?.getAttribute("width") ?? "0")
}

afterEach(() => {
  globalThis.window = originalWindow
  globalThis.XMLSerializer = originalXMLSerializer
})

describe("qr-code-styling patch integration", () => {
  it("records qr-code-styling as a checked-in patched dependency", () => {
    const workspaceConfig = readFileSync(
      resolve(process.cwd(), "pnpm-workspace.yaml"),
      "utf8",
    )

    expect(workspaceConfig).toContain("patchedDependencies:")
    expect(workspaceConfig).toContain(
      "qr-code-styling@1.9.2: patches/qr-code-styling@1.9.2.patch",
    )
  })

  it("renders different logo widths for nearby imageSize values", async () => {
    const smallerWidth = await renderLogoWidth(0.33)
    const largerWidth = await renderLogoWidth(0.331)

    expect(largerWidth).toBeGreaterThan(smallerWidth)
  })

  it("clears all QR modules from the rendered logo bounds", async () => {
    const svg = await renderSvgForOverlapCheck()
    expect(svg).toBeDefined()

    const nodes = svg ? walk(svg) : []
    const logoImage = svg ? getLogoImage(svg) : null

    expect(logoImage).toBeDefined()

    const logoBounds = {
      x: Number.parseFloat(logoImage?.getAttribute("x") ?? "0"),
      y: Number.parseFloat(logoImage?.getAttribute("y") ?? "0"),
      width: Number.parseFloat(logoImage?.getAttribute("width") ?? "0"),
      height: Number.parseFloat(logoImage?.getAttribute("height") ?? "0"),
    }

    const dotRects = nodes
      .filter(
        (node) =>
          node.tagName === "rect" &&
          node.parentNode?.tagName === "clipPath" &&
          (node.parentNode.getAttribute("id") ?? "").startsWith("clip-path-dot-color-"),
      )
      .map((node) => ({
        x: Number.parseFloat(node.getAttribute("x") ?? "0"),
        y: Number.parseFloat(node.getAttribute("y") ?? "0"),
        width: Number.parseFloat(node.getAttribute("width") ?? "0"),
        height: Number.parseFloat(node.getAttribute("height") ?? "0"),
      }))

    const overlappingDots = dotRects.filter((dotRect) =>
      intersects(dotRect, logoBounds),
    )

    expect(overlappingDots).toHaveLength(0)
  })
})
