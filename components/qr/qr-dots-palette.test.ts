import { describe, expect, it } from "vitest"

import {
  createDotsPaletteExtension,
  getPaletteIndexForModule,
  hashPaletteSeed,
} from "@/components/qr/qr-dots-palette"

class FakeSvgElement {
  tagName: string
  attributes = new Map<string, string>()
  children: FakeSvgElement[] = []
  parentElement: FakeSvgElement | null = null
  ownerDocument: FakeDocument

  constructor(tagName: string, ownerDocument: FakeDocument) {
    this.tagName = tagName
    this.ownerDocument = ownerDocument
  }

  get id() {
    return this.getAttribute("id") ?? ""
  }

  set id(value: string) {
    this.setAttribute("id", value)
  }

  get nextSibling(): FakeSvgElement | null {
    if (!this.parentElement) {
      return null
    }

    const index = this.parentElement.children.indexOf(this)

    if (index === -1) {
      return null
    }

    return this.parentElement.children[index + 1] ?? null
  }

  appendChild(child: FakeSvgElement) {
    child.parentElement = this
    this.children.push(child)
    return child
  }

  insertBefore(child: FakeSvgElement, referenceChild: FakeSvgElement | null) {
    if (!referenceChild) {
      return this.appendChild(child)
    }

    const index = this.children.indexOf(referenceChild)

    if (index === -1) {
      throw new Error("Reference child is not a child of this node.")
    }

    child.parentElement = this
    this.children.splice(index, 0, child)
    return child
  }

  remove() {
    if (!this.parentElement) {
      return
    }

    const index = this.parentElement.children.indexOf(this)

    if (index >= 0) {
      this.parentElement.children.splice(index, 1)
    }

    this.parentElement = null
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value)
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null
  }

  cloneNode() {
    const clone = this.ownerDocument.createElementNS("", this.tagName)

    for (const [name, value] of this.attributes.entries()) {
      clone.setAttribute(name, value)
    }

    return clone
  }

  querySelectorAll(tagName: string) {
    const matches: FakeSvgElement[] = []
    const normalizedTagName = tagName.toLowerCase()

    for (const child of this.children) {
      if (child.tagName.toLowerCase() === normalizedTagName) {
        matches.push(child)
      }

      matches.push(...child.querySelectorAll(tagName))
    }

    return matches
  }
}

class FakeSvgRoot extends FakeSvgElement {}

class FakeDocument {
  defaultView!: {
    SVGElement: typeof FakeSvgElement
    SVGSVGElement: typeof FakeSvgRoot
  }

  createElementNS(_namespace: string, tagName: string) {
    return new FakeSvgElement(tagName, this)
  }
}

function createFakeSvgTree() {
  const document = new FakeDocument()
  document.defaultView = {
    SVGElement: FakeSvgElement,
    SVGSVGElement: FakeSvgRoot,
  }

  const svg = new FakeSvgRoot("svg", document)
  svg.setAttribute("width", "320")
  svg.setAttribute("height", "320")

  const defs = document.createElementNS("", "defs")
  const dotsClipPath = document.createElementNS("", "clipPath")
  dotsClipPath.setAttribute("id", "clip-path-dot-color-0")

  const firstModule = document.createElementNS("", "rect")
  firstModule.setAttribute("data-module-row", "0")
  firstModule.setAttribute("data-module-col", "0")
  firstModule.setAttribute("x", "0")
  firstModule.setAttribute("y", "0")
  firstModule.setAttribute("width", "10")
  firstModule.setAttribute("height", "10")

  const secondModule = document.createElementNS("", "rect")
  secondModule.setAttribute("data-module-row", "0")
  secondModule.setAttribute("data-module-col", "1")
  secondModule.setAttribute("x", "10")
  secondModule.setAttribute("y", "0")
  secondModule.setAttribute("width", "10")
  secondModule.setAttribute("height", "10")

  dotsClipPath.appendChild(firstModule)
  dotsClipPath.appendChild(secondModule)
  defs.appendChild(dotsClipPath)
  svg.appendChild(defs)

  const existingDotLayer = document.createElementNS("", "rect")
  existingDotLayer.setAttribute("x", "0")
  existingDotLayer.setAttribute("y", "0")
  existingDotLayer.setAttribute("width", "320")
  existingDotLayer.setAttribute("height", "320")
  existingDotLayer.setAttribute("fill", "#111827")
  existingDotLayer.setAttribute("clip-path", "url('#clip-path-dot-color-0')")
  svg.appendChild(existingDotLayer)

  const cornerLayer = document.createElementNS("", "rect")
  cornerLayer.setAttribute("x", "0")
  cornerLayer.setAttribute("y", "0")
  cornerLayer.setAttribute("width", "70")
  cornerLayer.setAttribute("height", "70")
  cornerLayer.setAttribute("fill", "#d32f2f")
  cornerLayer.setAttribute("clip-path", "url('#clip-path-corners-square-color-0-0-0')")
  svg.appendChild(cornerLayer)

  const anchor = document.createElementNS("", "image")
  svg.appendChild(anchor)

  return { svg, existingDotLayer, cornerLayer, anchor }
}

function createFakePathPaletteTree() {
  const document = new FakeDocument()
  document.defaultView = {
    SVGElement: FakeSvgElement,
    SVGSVGElement: FakeSvgRoot,
  }

  const svg = new FakeSvgRoot("svg", document)
  svg.setAttribute("width", "320")
  svg.setAttribute("height", "320")

  const defs = document.createElementNS("", "defs")
  const dotsClipPath = document.createElementNS("", "clipPath")
  dotsClipPath.setAttribute("id", "clip-path-dot-color-1")

  const firstModule = document.createElementNS("", "path")
  firstModule.setAttribute("d", "M 0 0 v 10 h 10 v -10 z")

  const secondModule = document.createElementNS("", "path")
  secondModule.setAttribute("d", "M 10 0 v 10 h 10 v -10 z")

  const thirdModule = document.createElementNS("", "path")
  thirdModule.setAttribute("d", "M 0 10 v 10 h 10 v -10 z")

  dotsClipPath.appendChild(firstModule)
  dotsClipPath.appendChild(secondModule)
  dotsClipPath.appendChild(thirdModule)
  defs.appendChild(dotsClipPath)
  svg.appendChild(defs)

  const existingDotLayer = document.createElementNS("", "rect")
  existingDotLayer.setAttribute("x", "0")
  existingDotLayer.setAttribute("y", "0")
  existingDotLayer.setAttribute("width", "320")
  existingDotLayer.setAttribute("height", "320")
  existingDotLayer.setAttribute("fill", "#111827")
  existingDotLayer.setAttribute("clip-path", "url('#clip-path-dot-color-1')")
  svg.appendChild(existingDotLayer)

  const cornerLayer = document.createElementNS("", "rect")
  cornerLayer.setAttribute("x", "0")
  cornerLayer.setAttribute("y", "0")
  cornerLayer.setAttribute("width", "70")
  cornerLayer.setAttribute("height", "70")
  cornerLayer.setAttribute("fill", "#d32f2f")
  cornerLayer.setAttribute("clip-path", "url('#clip-path-corners-square-color-0-0-0')")
  svg.appendChild(cornerLayer)

  const anchor = document.createElementNS("", "image")
  svg.appendChild(anchor)

  return { svg, existingDotLayer, cornerLayer, anchor }
}

function createFakeRotatedPathPaletteTree() {
  const document = new FakeDocument()
  document.defaultView = {
    SVGElement: FakeSvgElement,
    SVGSVGElement: FakeSvgRoot,
  }

  const svg = new FakeSvgRoot("svg", document)
  svg.setAttribute("width", "320")
  svg.setAttribute("height", "320")

  const defs = document.createElementNS("", "defs")
  const dotsClipPath = document.createElementNS("", "clipPath")
  dotsClipPath.setAttribute("id", "clip-path-dot-color-2")

  const firstModule = document.createElementNS("", "path")
  firstModule.setAttribute("d", "M 0 0 v 10 h 10 v -10 z")

  const secondModule = document.createElementNS("", "path")
  secondModule.setAttribute("d", "M 10 0 v 10 h 10 v -10 z")
  secondModule.setAttribute("transform", "rotate(90, 15, 5)")

  const thirdModule = document.createElementNS("", "path")
  thirdModule.setAttribute("d", "M 20 0 v 10 h 10 v -10 z")

  dotsClipPath.appendChild(firstModule)
  dotsClipPath.appendChild(secondModule)
  dotsClipPath.appendChild(thirdModule)
  defs.appendChild(dotsClipPath)
  svg.appendChild(defs)

  const existingDotLayer = document.createElementNS("", "rect")
  existingDotLayer.setAttribute("x", "0")
  existingDotLayer.setAttribute("y", "0")
  existingDotLayer.setAttribute("width", "320")
  existingDotLayer.setAttribute("height", "320")
  existingDotLayer.setAttribute("fill", "#111827")
  existingDotLayer.setAttribute("clip-path", "url('#clip-path-dot-color-2')")
  svg.appendChild(existingDotLayer)

  const anchor = document.createElementNS("", "image")
  svg.appendChild(anchor)

  return { svg, existingDotLayer, anchor }
}

describe("qr dots palette helpers", () => {
  it("produces a stable hash for the same seed", () => {
    expect(hashPaletteSeed("https://example.com")).toBe(
      hashPaletteSeed("https://example.com"),
    )
  })

  it("maps the same seed and module coordinates to the same palette index", () => {
    const paletteSize = 4

    expect(
      getPaletteIndexForModule("https://example.com", 12, 4, paletteSize),
    ).toBe(getPaletteIndexForModule("https://example.com", 12, 4, paletteSize))
  })

  it("distributes different module coordinates across a palette", () => {
    const paletteSize = 4
    const assignedIndices = new Set(
      Array.from({ length: 20 }, (_, row) =>
        getPaletteIndexForModule("https://example.com", row, row % 5, paletteSize),
      ),
    )

    expect(assignedIndices.size).toBeGreaterThan(1)
  })

  it("keeps each aligned 4x4 tile evenly balanced across the four swatches", () => {
    const paletteSize = 4

    for (let startRow = 0; startRow < 16; startRow += 4) {
      for (let startCol = 0; startCol < 16; startCol += 4) {
        const counts = new Array(paletteSize).fill(0)

        for (let row = startRow; row < startRow + 4; row += 1) {
          for (let col = startCol; col < startCol + 4; col += 1) {
            counts[getPaletteIndexForModule("b", row, col, paletteSize)] += 1
          }
        }

        expect(counts).toEqual([4, 4, 4, 4])
      }
    }
  })

  it("replaces the base dot color layer with palette layers before the next sibling", () => {
    const { svg, existingDotLayer, cornerLayer, anchor } = createFakeSvgTree()
    const palette = ["#111111", "#22aaee", "#ff8800"]
    const extension = createDotsPaletteExtension({
      palette,
      seed: "https://example.com",
    })

    const usedPaletteIndices = new Set([
      getPaletteIndexForModule("https://example.com", 0, 0, palette.length),
      getPaletteIndexForModule("https://example.com", 0, 1, palette.length),
    ])

    expect(svg instanceof svg.ownerDocument.defaultView.SVGSVGElement).toBe(true)
    expect(svg.querySelectorAll("clipPath")).toHaveLength(1)
    expect(svg.querySelectorAll("rect")).toHaveLength(4)
    expect(() => extension(svg as unknown as SVGElement, {} as never)).not.toThrow()
    expect(svg.children).not.toContain(existingDotLayer)

    const paletteLayers = svg.children.filter((child) =>
      child.getAttribute("clip-path")?.includes("-palette-"),
    )

    expect(paletteLayers).toHaveLength(usedPaletteIndices.size)
    expect(svg.children).toContain(cornerLayer)
    expect(cornerLayer.getAttribute("fill")).toBe("#d32f2f")
    expect(cornerLayer.getAttribute("clip-path")).toBe(
      "url('#clip-path-corners-square-color-0-0-0')",
    )
    expect(svg.children.indexOf(anchor)).toBeGreaterThan(0)

    for (const layer of paletteLayers) {
      expect(layer.tagName).toBe("rect")
      expect(layer.getAttribute("fill")).toBeTruthy()
      expect(layer.getAttribute("clip-path")).toContain("clip-path-dot-color-0-palette-")
      expect(svg.children.indexOf(layer)).toBeLessThan(svg.children.indexOf(anchor))
    }
  })

  it("recolors path-based dot modules without data-module metadata", () => {
    const { svg, existingDotLayer, cornerLayer, anchor } = createFakePathPaletteTree()
    const palette = ["#04879c", "#0c3c78", "#090030", "#f30a49"]
    const extension = createDotsPaletteExtension({
      palette,
      seed: "https://example.com/path",
    })

    const usedPaletteIndices = new Set([
      getPaletteIndexForModule("https://example.com/path", 0, 0, palette.length),
      getPaletteIndexForModule("https://example.com/path", 0, 1, palette.length),
      getPaletteIndexForModule("https://example.com/path", 1, 0, palette.length),
    ])

    expect(() => extension(svg as unknown as SVGElement, {} as never)).not.toThrow()
    expect(svg.children).not.toContain(existingDotLayer)

    const paletteLayers = svg.children.filter((child) =>
      child.getAttribute("clip-path")?.includes("-palette-"),
    )

    expect(paletteLayers).toHaveLength(usedPaletteIndices.size)
    expect(new Set(paletteLayers.map((layer) => layer.getAttribute("fill")))).toEqual(
      new Set(Array.from(usedPaletteIndices, (index) => palette[index])),
    )
    expect(svg.children).toContain(cornerLayer)

    for (const layer of paletteLayers) {
      expect(layer.getAttribute("clip-path")).toContain("clip-path-dot-color-1-palette-")
      expect(svg.children.indexOf(layer)).toBeLessThan(svg.children.indexOf(anchor))
    }
  })

  it("keeps path-module color mapping stable when a module path is rotated", () => {
    const { svg, existingDotLayer, anchor } = createFakeRotatedPathPaletteTree()
    const palette = ["#04879c", "#0c3c78", "#090030", "#f30a49"]
    const extension = createDotsPaletteExtension({
      palette,
      seed: "https://example.com/rotated",
    })

    const usedPaletteIndices = new Set([
      getPaletteIndexForModule("https://example.com/rotated", 0, 0, palette.length),
      getPaletteIndexForModule("https://example.com/rotated", 0, 1, palette.length),
      getPaletteIndexForModule("https://example.com/rotated", 0, 2, palette.length),
    ])

    expect(() => extension(svg as unknown as SVGElement, {} as never)).not.toThrow()
    expect(svg.children).not.toContain(existingDotLayer)

    const paletteLayers = svg.children.filter((child) =>
      child.getAttribute("clip-path")?.includes("-palette-"),
    )

    expect(paletteLayers).toHaveLength(usedPaletteIndices.size)
    expect(new Set(paletteLayers.map((layer) => layer.getAttribute("fill")))).toEqual(
      new Set(Array.from(usedPaletteIndices, (index) => palette[index])),
    )

    for (const layer of paletteLayers) {
      expect(layer.getAttribute("clip-path")).toContain("clip-path-dot-color-2-palette-")
      expect(svg.children.indexOf(layer)).toBeLessThan(svg.children.indexOf(anchor))
    }
  })
})
