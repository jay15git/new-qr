import { describe, expect, it } from "vitest"

import { buildQrExtension, getQrExtensionKey } from "./qr-rendering"
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

describe("qr rendering helpers", () => {
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
})
