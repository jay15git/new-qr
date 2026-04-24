import { describe, expect, it } from "vitest"

import {
  buildQrExtension,
  createAlignedCornerGradientExtension,
  getQrExtensionKey,
} from "./qr-rendering"
import { createDefaultQrStudioState } from "./qr-studio-state"

type StubElement = {
  tagName: string
  attributes: Record<string, string>
  children: StubElement[]
  ownerDocument: {
    createElementNS: (_namespace: string, tagName: string) => StubElement
  }
  appendChild: (child: StubElement) => StubElement
  getAttribute: (name: string) => string | null
  insertBefore: (child: StubElement, referenceNode: StubElement | null) => StubElement
  querySelector: (selector: string) => StubElement | null
  querySelectorAll: (selector: string) => StubElement[]
  remove: () => void
  setAttribute: (name: string, value: string) => void
  setAttributeNS: (_namespace: string, name: string, value: string) => void
}

function createStubElement(tagName: string): StubElement {
  const element: StubElement = {
    tagName,
    attributes: {},
    children: [],
    ownerDocument: {
      createElementNS: (_namespace, nextTagName) => createStubElement(nextTagName),
    },
    appendChild(child) {
      child.remove()
      ;(child as StubElement & { parentNode?: StubElement }).parentNode = element
      element.children.push(child)
      return child
    },
    getAttribute(name) {
      return element.attributes[name] ?? null
    },
    insertBefore(child, referenceNode) {
      child.remove()
      ;(child as StubElement & { parentNode?: StubElement }).parentNode = element

      if (!referenceNode) {
        element.children.push(child)
        return child
      }

      const referenceIndex = element.children.indexOf(referenceNode)

      if (referenceIndex === -1) {
        element.children.push(child)
        return child
      }

      element.children.splice(referenceIndex, 0, child)
      return child
    },
    querySelector(selector) {
      return element.querySelectorAll(selector)[0] ?? null
    },
    querySelectorAll(selector) {
      const matches = (node: StubElement) => {
        if (selector === "rect") {
          return node.tagName === "rect"
        }

        if (selector === '[data-qr-layer="background-image"]') {
          return node.attributes["data-qr-layer"] === "background-image"
        }

        return false
      }

      const walk = (node: StubElement): StubElement[] => {
        const nestedMatches = node.children.flatMap(walk)
        return matches(node) ? [node, ...nestedMatches] : nestedMatches
      }

      return walk(element)
    },
    remove() {
      const parentNode = (element as StubElement & { parentNode?: StubElement }).parentNode

      if (!parentNode) {
        return
      }

      parentNode.children = parentNode.children.filter((child) => child !== element)
      delete (element as StubElement & { parentNode?: StubElement }).parentNode
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

function appendGradientRectPair({
  defs,
  fillRectX,
  fillRectY,
  gradientId,
  svg,
  tagName = "linearGradient",
}: {
  defs: StubElement
  fillRectX: number
  fillRectY: number
  gradientId: string
  svg: StubElement
  tagName?: "linearGradient" | "radialGradient"
}) {
  const gradient = createStubElement(tagName)
  gradient.setAttribute("gradientUnits", "userSpaceOnUse")
  gradient.setAttribute("id", gradientId)
  gradient.setAttribute("x1", "999")
  gradient.setAttribute("y1", "999")
  gradient.setAttribute("x2", "-999")
  gradient.setAttribute("y2", "-999")
  defs.appendChild(gradient)

  const fillRect = createStubElement("rect")
  fillRect.setAttribute("fill", `url('#${gradientId}')`)
  fillRect.setAttribute("height", "21")
  fillRect.setAttribute("width", "21")
  fillRect.setAttribute("x", String(fillRectX))
  fillRect.setAttribute("y", String(fillRectY))
  svg.appendChild(fillRect)

  return { fillRect, gradient }
}

function getGradientRelativeCoordinates(
  gradient: StubElement,
  fillRect: StubElement,
) {
  const rectX = Number.parseFloat(fillRect.getAttribute("x") ?? "0")
  const rectY = Number.parseFloat(fillRect.getAttribute("y") ?? "0")

  return {
    x1: Number.parseFloat(gradient.getAttribute("x1") ?? "0") - rectX,
    x2: Number.parseFloat(gradient.getAttribute("x2") ?? "0") - rectX,
    y1: Number.parseFloat(gradient.getAttribute("y1") ?? "0") - rectY,
    y2: Number.parseFloat(gradient.getAttribute("y2") ?? "0") - rectY,
  }
}

describe("qr rendering helpers", () => {
  it("keeps logo-only changes on the upstream image path instead of the extension pipeline", () => {
    const defaultState = createDefaultQrStudioState()
    const stateWithLogo = createDefaultQrStudioState()
    stateWithLogo.logo = {
      source: "url",
      value: "https://example.com/logo.png",
    }

    expect(buildQrExtension(stateWithLogo)).toBeNull()
    expect(getQrExtensionKey(stateWithLogo)).toBe(getQrExtensionKey(defaultState))
  })

  it("changes the extension key when a background image is active", () => {
    const defaultState = createDefaultQrStudioState()
    const stateWithBackgroundImage = createDefaultQrStudioState()
    stateWithBackgroundImage.backgroundImage = {
      source: "upload",
      value: "blob:https://new-qr-studio.local/background.png",
    }

    expect(getQrExtensionKey(stateWithBackgroundImage)).not.toBe(
      getQrExtensionKey(defaultState),
    )
  })

  it("changes the extension key when a linear corner gradient changes", () => {
    const defaultState = createDefaultQrStudioState()
    const stateWithCornerGradient = createDefaultQrStudioState()
    stateWithCornerGradient.cornersSquareGradient = {
      ...stateWithCornerGradient.cornersSquareGradient,
      enabled: true,
      rotation: Math.PI / 3,
      type: "linear",
    }

    expect(getQrExtensionKey(stateWithCornerGradient)).not.toBe(
      getQrExtensionKey(defaultState),
    )
  })

  it("adds a background image layer to the svg extension output", () => {
    const state = createDefaultQrStudioState()
    state.backgroundImage = {
      source: "upload",
      value: "blob:https://new-qr-studio.local/background.png",
    }

    const extension = buildQrExtension(state)
    expect(extension).toBeTypeOf("function")

    if (!extension) {
      return
    }

    const svg = createStubElement("svg")
    svg.appendChild(createStubElement("defs"))
    svg.appendChild(createStubElement("rect"))
    svg.appendChild(createStubElement("path"))

    extension(svg as unknown as SVGElement, {
      height: 100,
      width: 100,
    })

    const backgroundImage = svg.querySelector('[data-qr-layer="background-image"]')

    expect(backgroundImage).not.toBeNull()
    expect(backgroundImage?.getAttribute("href")).toBe(
      "blob:https://new-qr-studio.local/background.png",
    )
    expect(svg.children[2]?.getAttribute("data-qr-layer")).toBe("background-image")
  })

  it("normalizes all corner-frame linear gradients to the same relative direction", () => {
    const state = createDefaultQrStudioState()
    state.cornersSquareGradient = {
      ...state.cornersSquareGradient,
      enabled: true,
      rotation: Math.PI / 4,
      type: "linear",
    }

    const extension = createAlignedCornerGradientExtension(state)
    expect(extension).toBeTypeOf("function")

    if (!extension) {
      return
    }

    const svg = createStubElement("svg")
    const defs = createStubElement("defs")
    svg.appendChild(defs)
    const topLeft = appendGradientRectPair({
      defs,
      fillRectX: 24,
      fillRectY: 24,
      gradientId: "corners-square-color-0-0-1",
      svg,
    })
    const topRight = appendGradientRectPair({
      defs,
      fillRectX: 180,
      fillRectY: 24,
      gradientId: "corners-square-color-1-0-1",
      svg,
    })
    const bottomLeft = appendGradientRectPair({
      defs,
      fillRectX: 24,
      fillRectY: 180,
      gradientId: "corners-square-color-0-1-1",
      svg,
    })

    extension(svg as unknown as SVGElement, {
      height: 240,
      width: 240,
    })

    const topLeftCoordinates = getGradientRelativeCoordinates(
      topLeft.gradient,
      topLeft.fillRect,
    )

    expect(
      getGradientRelativeCoordinates(topRight.gradient, topRight.fillRect),
    ).toEqual(topLeftCoordinates)
    expect(
      getGradientRelativeCoordinates(bottomLeft.gradient, bottomLeft.fillRect),
    ).toEqual(topLeftCoordinates)
  })

  it("normalizes all corner-dot linear gradients to the same relative direction", () => {
    const state = createDefaultQrStudioState()
    state.cornersDotGradient = {
      ...state.cornersDotGradient,
      enabled: true,
      rotation: Math.PI / 2,
      type: "linear",
    }

    const extension = createAlignedCornerGradientExtension(state)
    expect(extension).toBeTypeOf("function")

    if (!extension) {
      return
    }

    const svg = createStubElement("svg")
    const defs = createStubElement("defs")
    svg.appendChild(defs)
    const topLeft = appendGradientRectPair({
      defs,
      fillRectX: 40,
      fillRectY: 40,
      gradientId: "corners-dot-color-0-0-1",
      svg,
    })
    const topRight = appendGradientRectPair({
      defs,
      fillRectX: 196,
      fillRectY: 40,
      gradientId: "corners-dot-color-1-0-1",
      svg,
    })
    const bottomLeft = appendGradientRectPair({
      defs,
      fillRectX: 40,
      fillRectY: 196,
      gradientId: "corners-dot-color-0-1-1",
      svg,
    })

    extension(svg as unknown as SVGElement, {
      height: 280,
      width: 280,
    })

    const topLeftCoordinates = getGradientRelativeCoordinates(
      topLeft.gradient,
      topLeft.fillRect,
    )

    expect(
      getGradientRelativeCoordinates(topRight.gradient, topRight.fillRect),
    ).toEqual(topLeftCoordinates)
    expect(
      getGradientRelativeCoordinates(bottomLeft.gradient, bottomLeft.fillRect),
    ).toEqual(topLeftCoordinates)
  })

  it("does not create an alignment extension for radial corner gradients", () => {
    const state = createDefaultQrStudioState()
    state.cornersSquareGradient = {
      ...state.cornersSquareGradient,
      enabled: true,
      type: "radial",
    }

    expect(createAlignedCornerGradientExtension(state)).toBeNull()
  })
})
