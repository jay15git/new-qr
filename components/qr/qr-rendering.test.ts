import { describe, expect, it } from "vitest"

import {
  buildQrExtension,
  createAlignedCornerGradientExtension,
  createDotMatrixAnimationExtension,
  getQrExtensionKey,
} from "./qr-rendering"
import {
  createDefaultQrStudioState,
  QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS,
} from "./qr-studio-state"

type StubElement = {
  tagName: string
  attributes: Record<string, string>
  children: StubElement[]
  cloneNode: (deep?: boolean) => StubElement
  ownerDocument: {
    createElementNS: (_namespace: string, tagName: string) => StubElement
  }
  appendChild: (child: StubElement) => StubElement
  getAttribute: (name: string) => string | null
  insertBefore: (child: StubElement, referenceNode: StubElement | null) => StubElement
  querySelector: (selector: string) => StubElement | null
  querySelectorAll: (selector: string) => StubElement[]
  removeAttribute: (name: string) => void
  remove: () => void
  setAttribute: (name: string, value: string) => void
  setAttributeNS: (_namespace: string, name: string, value: string) => void
  textContent?: string | null
}

function createStubElement(tagName: string): StubElement {
  const element: StubElement = {
    tagName,
    attributes: {},
    children: [],
    cloneNode(deep = false) {
      const clone = createStubElement(element.tagName)
      clone.attributes = { ...element.attributes }
      clone.textContent = element.textContent ?? null

      if (deep) {
        for (const child of element.children) {
          clone.appendChild(child.cloneNode(true))
        }
      }

      return clone
    },
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

        if (selector === "clipPath") {
          return node.tagName === "clipPath"
        }

        if (
          [
            "feComposite",
            "feFlood",
            "feGaussianBlur",
            "feOffset",
          ].includes(selector)
        ) {
          return node.tagName === selector
        }

        if (selector === '[data-qr-layer="background-image"]') {
          return node.attributes["data-qr-layer"] === "background-image"
        }

        if (selector === '[data-qr-layer="background-image-clip"]') {
          return node.attributes["data-qr-layer"] === "background-image-clip"
        }

        if (selector === '[data-qr-layer="background-shape"]') {
          return node.attributes["data-qr-layer"] === "background-shape"
        }

        if (selector === '[data-qr-layer="background-shape-gradient"]') {
          return node.attributes["data-qr-layer"] === "background-shape-gradient"
        }

        if (selector === '[data-qr-layer="background-shape-blur"]') {
          return node.attributes["data-qr-layer"] === "background-shape-blur"
        }

        if (selector === '[data-qr-layer="background-shape-blur-filter"]') {
          return node.attributes["data-qr-layer"] === "background-shape-blur-filter"
        }

        if (selector === '[data-qr-layer="qr-content"]') {
          return node.attributes["data-qr-layer"] === "qr-content"
        }

        if (selector === '[data-qr-layer="background-surface-blur"]') {
          return node.attributes["data-qr-layer"] === "background-surface-blur"
        }

        if (selector === '[data-qr-layer="background-surface-blur-filter"]') {
          return node.attributes["data-qr-layer"] === "background-surface-blur-filter"
        }

        if (selector === '[data-qr-layer="dot-matrix-animation"]') {
          return node.attributes["data-qr-layer"] === "dot-matrix-animation"
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
    removeAttribute(name) {
      delete element.attributes[name]
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

  it("changes the extension key when a vector background shape is active", () => {
    const defaultState = createDefaultQrStudioState()
    const stateWithBackgroundShape = createDefaultQrStudioState()
    stateWithBackgroundShape.backgroundShapeId = "circle"

    expect(getQrExtensionKey(stateWithBackgroundShape)).not.toBe(
      getQrExtensionKey(defaultState),
    )
  })

  it("adds dot matrix animation as a visible overlay without changing base or corner layers", () => {
    const state = createDefaultQrStudioState()
    state.dotMatrixAnimation = {
      ...state.dotMatrixAnimation,
      enabled: true,
      exportAnimatedSvg: false,
      loader: "crt-glide",
      overlayScale: 84,
      speed: 4,
    }

    const extension = createDotMatrixAnimationExtension(state, "preview")
    expect(extension).toBeTypeOf("function")

    if (!extension) {
      return
    }

    const svg = createStubElement("svg")
    const defs = createStubElement("defs")
    const dotClipPath = createStubElement("clipPath")
    dotClipPath.setAttribute("id", "clip-path-dot-color-0")
    const firstDot = createStubElement("rect")
    firstDot.setAttribute("x", "10")
    firstDot.setAttribute("y", "10")
    firstDot.setAttribute("width", "5")
    firstDot.setAttribute("height", "5")
    const secondDot = createStubElement("circle")
    secondDot.setAttribute("cx", "17.5")
    secondDot.setAttribute("cy", "12.5")
    secondDot.setAttribute("r", "2.5")
    dotClipPath.appendChild(firstDot)
    dotClipPath.appendChild(secondDot)
    defs.appendChild(dotClipPath)
    svg.appendChild(defs)

    const dotLayer = createStubElement("rect")
    dotLayer.setAttribute("clip-path", "url('#clip-path-dot-color-0')")
    dotLayer.setAttribute("fill", "#111827")
    svg.appendChild(dotLayer)
    const cornerLayer = createStubElement("rect")
    cornerLayer.setAttribute("clip-path", "url('#clip-path-corners-square-color-0-0-0')")
    cornerLayer.setAttribute("fill", "#111827")
    svg.appendChild(cornerLayer)

    extension(svg as unknown as SVGElement, {
      height: 120,
      width: 120,
    })

    const animationLayer = svg.querySelector('[data-qr-layer="dot-matrix-animation"]')
    const animatedModules =
      animationLayer?.children.filter(
        (child) => child.attributes.class === "qr-dot-matrix-module",
      ) ?? []

    expect(svg.children).toContain(dotLayer)
    expect(svg.children).toContain(cornerLayer)
    expect(animationLayer?.children[0]?.tagName).toBe("style")
    expect(animationLayer?.children[0]?.textContent).toContain(
      "@media (prefers-reduced-motion: reduce)",
    )
    expect(animationLayer?.children[0]?.textContent).toContain(
      ".qr-dot-matrix-layer",
    )
    expect(animationLayer?.getAttribute("style")).toContain(
      "--qr-dot-matrix-opacity-base:",
    )
    expect(animatedModules).toHaveLength(2)
    expect(animatedModules[0]?.getAttribute("fill")).toBe("#22d3ee")
    expect(animatedModules[0]?.getAttribute("data-qr-dot-loader")).toBe("crt-glide")
    expect(animatedModules[0]?.getAttribute("x")).toBe("10")
    expect(animatedModules[1]?.getAttribute("style")).toContain(
      "--qr-dot-row:",
    )
  })

  it("creates overlay modules for every square loader preset", () => {
    for (const loader of QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS.map((option) => option.value)) {
      const state = createDefaultQrStudioState()
      state.dotMatrixAnimation = {
        ...state.dotMatrixAnimation,
        enabled: true,
        loader,
      }
      const extension = createDotMatrixAnimationExtension(state, "preview")
      expect(extension, loader).toBeTypeOf("function")

      if (!extension) {
        continue
      }

      const svg = createStubElement("svg")
      const defs = createStubElement("defs")
      const dotClipPath = createStubElement("clipPath")
      dotClipPath.setAttribute("id", "clip-path-dot-color-0")

      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const dot = createStubElement("rect")
          dot.setAttribute("x", String(10 + col * 5))
          dot.setAttribute("y", String(10 + row * 5))
          dot.setAttribute("width", "5")
          dot.setAttribute("height", "5")
          dotClipPath.appendChild(dot)
        }
      }

      defs.appendChild(dotClipPath)
      svg.appendChild(defs)

      const dotLayer = createStubElement("rect")
      dotLayer.setAttribute("clip-path", "url('#clip-path-dot-color-0')")
      dotLayer.setAttribute("fill", "#111827")
      svg.appendChild(dotLayer)

      extension(svg as unknown as SVGElement, {
        height: 120,
        width: 120,
      })

      const animationLayer = svg.querySelector('[data-qr-layer="dot-matrix-animation"]')
      const animatedModules =
        animationLayer?.children.filter(
          (child) => child.attributes.class === "qr-dot-matrix-module",
        ) ?? []

      expect(animatedModules.length, loader).toBeGreaterThan(0)
      expect(animatedModules[0]?.getAttribute("data-qr-dot-loader")).toBe(loader)
      expect(animationLayer?.children[0]?.textContent, loader).toContain(
        `qr-dot-loader-${loader}`,
      )
    }
  })

  it("keeps dot matrix animation out of export mode unless animated SVG export is enabled", () => {
    const state = createDefaultQrStudioState()
    state.dotMatrixAnimation = {
      ...state.dotMatrixAnimation,
      enabled: true,
      exportAnimatedSvg: false,
    }

    expect(createDotMatrixAnimationExtension(state, "export")).toBeNull()

    state.dotMatrixAnimation.exportAnimatedSvg = true

    expect(createDotMatrixAnimationExtension(state, "export")).toBeTypeOf("function")
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
    expect(backgroundImage?.getAttribute("clip-path")).toBeNull()
    expect(svg.children[2]?.getAttribute("data-qr-layer")).toBe("background-image")
  })

  it("clips background images with the configured qr background radius", () => {
    const state = createDefaultQrStudioState()
    state.backgroundOptions.round = 0.5
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
    const defs = createStubElement("defs")
    svg.appendChild(defs)
    svg.appendChild(createStubElement("rect"))
    svg.appendChild(createStubElement("path"))

    extension(svg as unknown as SVGElement, {
      height: 120,
      width: 160,
    })

    const backgroundImage = svg.querySelector('[data-qr-layer="background-image"]')
    const clipPath = svg.querySelector('[data-qr-layer="background-image-clip"]')
    const clipRect = clipPath?.querySelector("rect")

    expect(backgroundImage?.getAttribute("clip-path")).toBe(
      "url('#clip-path-background-image')",
    )
    expect(clipPath?.getAttribute("id")).toBe("clip-path-background-image")
    expect(clipRect?.getAttribute("x")).toBe("20")
    expect(clipRect?.getAttribute("y")).toBe("0")
    expect(clipRect?.getAttribute("width")).toBe("120")
    expect(clipRect?.getAttribute("height")).toBe("120")
    expect(clipRect?.getAttribute("rx")).toBe("30")
  })

  it("adds a solid vector background shape fitted to the svg viewport", () => {
    const state = createDefaultQrStudioState()
    state.backgroundShapeId = "hexagon"
    state.backgroundOptions.color = "#d0bcff"

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
      height: 320,
      width: 320,
    })

    const backgroundShape = svg.querySelector('[data-qr-layer="background-shape"]')

    expect(backgroundShape).not.toBeNull()
    expect(backgroundShape?.getAttribute("fill")).toBe("#d0bcff")
    expect(backgroundShape?.getAttribute("transform")).toBe(
      "translate(0 33) scale(1)",
    )
    expect(svg.children[1]?.getAttribute("data-qr-layer")).toBe("background-shape")
  })

  it("expands vector background shape bounds with padding, stroke, and edge blur", () => {
    const state = createDefaultQrStudioState()
    state.backgroundShapeId = "circle"
    state.backgroundOptions.color = "#d0bcff"
    state.backgroundShapeOptions = {
      edgeBlur: 8,
      paddingPx: 24,
      shadowColor: "#020617",
      shadowOffsetX: 12,
      shadowOffsetY: -10,
      shadowOpacity: 58,
      strokeColor: "#111827",
      strokeOpacity: 42,
      strokeWidth: 6,
    }

    const extension = buildQrExtension(state)
    expect(extension).toBeTypeOf("function")

    if (!extension) {
      return
    }

    const svg = createStubElement("svg")
    svg.appendChild(createStubElement("defs"))
    svg.appendChild(createStubElement("rect"))
    const qrPath = createStubElement("path")
    svg.appendChild(qrPath)

    extension(svg as unknown as SVGElement, {
      height: 320,
      width: 320,
    })

    const backgroundShape = svg.querySelector('[data-qr-layer="background-shape"]')
    const shadowShape = svg.querySelector('[data-qr-layer="background-shape-blur"]')
    const shadowFilter = svg.querySelector('[data-qr-layer="background-shape-blur-filter"]')
    const gaussianBlur = shadowFilter?.querySelectorAll("feGaussianBlur")[0]
    const offset = shadowFilter?.querySelectorAll("feOffset")[0]
    const flood = shadowFilter?.querySelectorAll("feFlood")[0]
    const composite = shadowFilter?.querySelectorAll("feComposite")[0]
    const qrContent = svg.querySelector('[data-qr-layer="qr-content"]')

    expect(svg.getAttribute("width")).toBe("406")
    expect(svg.getAttribute("height")).toBe("406")
    expect(svg.getAttribute("viewBox")).toBe("0 0 406 406")
    expect(qrContent?.getAttribute("transform")).toBe("translate(31 53)")
    expect(qrContent?.children).toContain(qrPath)
    expect(backgroundShape?.getAttribute("transform")).toBe(
      "translate(7 29) scale(1.15)",
    )
    expect(backgroundShape?.getAttribute("stroke")).toBe("#111827")
    expect(backgroundShape?.getAttribute("stroke-width")).toBe("6")
    expect(backgroundShape?.getAttribute("stroke-opacity")).toBe("0.42")
    expect(shadowShape?.getAttribute("filter")).toBe("url('#background-shape-blur-filter')")
    expect(shadowShape?.getAttribute("stroke")).toBe("#020617")
    expect(shadowShape?.getAttribute("stroke-width")).toBe("6")
    expect(gaussianBlur?.getAttribute("stdDeviation")).toBe("8")
    expect(gaussianBlur?.getAttribute("in")).toBe("SourceAlpha")
    expect(offset?.getAttribute("dx")).toBe("12")
    expect(offset?.getAttribute("dy")).toBe("-10")
    expect(flood?.getAttribute("flood-color")).toBe("#020617")
    expect(flood?.getAttribute("flood-opacity")).toBe("0.58")
    expect(composite?.getAttribute("operator")).toBe("in")
    expect(svg.children[1]?.getAttribute("data-qr-layer")).toBe("background-shape-blur")
    expect(svg.children[2]?.getAttribute("data-qr-layer")).toBe("background-shape")
  })

  it("expands the default qr background surface with padding, stroke, and edge blur", () => {
    const state = createDefaultQrStudioState()
    state.backgroundOptions.color = "#f8fafc"
    state.backgroundOptions.round = 0.25
    state.backgroundShapeOptions = {
      edgeBlur: 10,
      paddingPx: 20,
      shadowColor: "#020617",
      shadowOffsetX: -14,
      shadowOffsetY: 18,
      shadowOpacity: 60,
      strokeColor: "#0f172a",
      strokeOpacity: 55,
      strokeWidth: 8,
    }

    const extension = buildQrExtension(state)
    expect(extension).toBeTypeOf("function")

    if (!extension) {
      return
    }

    const svg = createStubElement("svg")
    const defs = createStubElement("defs")
    const backgroundRect = createStubElement("rect")
    backgroundRect.setAttribute("clip-path", "url('#clip-path-background-color-2')")
    backgroundRect.setAttribute("fill", "#f8fafc")
    svg.appendChild(defs)
    svg.appendChild(backgroundRect)
    const qrPath = createStubElement("path")
    svg.appendChild(qrPath)

    extension(svg as unknown as SVGElement, {
      height: 320,
      width: 320,
    })

    const shadowSurface = svg.querySelector('[data-qr-layer="background-surface-blur"]')
    const shadowFilter = svg.querySelector('[data-qr-layer="background-surface-blur-filter"]')
    const gaussianBlur = shadowFilter?.querySelectorAll("feGaussianBlur")[0]
    const offset = shadowFilter?.querySelectorAll("feOffset")[0]
    const qrContent = svg.querySelector('[data-qr-layer="qr-content"]')

    expect(svg.getAttribute("width")).toBe("408")
    expect(svg.getAttribute("height")).toBe("408")
    expect(svg.getAttribute("viewBox")).toBe("0 0 408 408")
    expect(qrContent?.getAttribute("transform")).toBe("translate(58 26)")
    expect(qrContent?.children).toContain(qrPath)
    expect(backgroundRect.getAttribute("x")).toBe("38")
    expect(backgroundRect.getAttribute("y")).toBe("6")
    expect(backgroundRect.getAttribute("width")).toBe("360")
    expect(backgroundRect.getAttribute("height")).toBe("360")
    expect(backgroundRect.getAttribute("rx")).toBe("45")
    expect(backgroundRect.getAttribute("stroke")).toBe("#0f172a")
    expect(backgroundRect.getAttribute("stroke-width")).toBe("8")
    expect(backgroundRect.getAttribute("stroke-opacity")).toBe("0.55")
    expect(backgroundRect.getAttribute("clip-path")).toBeNull()
    expect(shadowSurface?.getAttribute("filter")).toBe("url('#background-surface-blur-filter')")
    expect(shadowSurface?.getAttribute("stroke")).toBe("#020617")
    expect(shadowSurface?.getAttribute("stroke-width")).toBe("8")
    expect(gaussianBlur?.getAttribute("stdDeviation")).toBe("10")
    expect(offset?.getAttribute("dx")).toBe("-14")
    expect(offset?.getAttribute("dy")).toBe("18")
    expect(svg.children[1]?.getAttribute("data-qr-layer")).toBe("background-surface-blur")
    expect(svg.children[2]).toBe(backgroundRect)
  })

  it("keeps shadow geometry bounds when shadow opacity is zero", () => {
    const visibleShadowState = createDefaultQrStudioState()
    visibleShadowState.backgroundOptions.color = "#f8fafc"
    visibleShadowState.backgroundShapeOptions = {
      edgeBlur: 10,
      paddingPx: 20,
      shadowColor: "#020617",
      shadowOffsetX: -14,
      shadowOffsetY: 18,
      shadowOpacity: 60,
      strokeColor: "#0f172a",
      strokeOpacity: 55,
      strokeWidth: 8,
    }
    const hiddenShadowState = {
      ...visibleShadowState,
      backgroundShapeOptions: {
        ...visibleShadowState.backgroundShapeOptions,
        shadowOpacity: 0,
      },
    }

    const visibleSvg = createStubElement("svg")
    visibleSvg.appendChild(createStubElement("defs"))
    visibleSvg.appendChild(createStubElement("rect"))
    visibleSvg.appendChild(createStubElement("path"))
    const hiddenSvg = createStubElement("svg")
    hiddenSvg.appendChild(createStubElement("defs"))
    hiddenSvg.appendChild(createStubElement("rect"))
    hiddenSvg.appendChild(createStubElement("path"))

    buildQrExtension(visibleShadowState)?.(visibleSvg as unknown as SVGElement, {
      height: 320,
      width: 320,
    })
    buildQrExtension(hiddenShadowState)?.(hiddenSvg as unknown as SVGElement, {
      height: 320,
      width: 320,
    })

    expect(hiddenSvg.getAttribute("width")).toBe(visibleSvg.getAttribute("width"))
    expect(hiddenSvg.getAttribute("height")).toBe(visibleSvg.getAttribute("height"))
    expect(hiddenSvg.getAttribute("viewBox")).toBe(visibleSvg.getAttribute("viewBox"))
    expect(hiddenSvg.querySelector('[data-qr-layer="background-surface-blur"]')).toBeNull()
    expect(hiddenSvg.querySelector('[data-qr-layer="background-surface-blur-filter"]')).toBeNull()
  })

  it("fills vector background shapes with the active background gradient", () => {
    const state = createDefaultQrStudioState()
    state.backgroundShapeId = "circle"
    state.backgroundGradient = {
      enabled: true,
      type: "linear",
      rotation: Math.PI / 2,
      colorStops: [
        { offset: 0, color: "#111111" },
        { offset: 1, color: "#eeeeee" },
      ],
    }

    const extension = buildQrExtension(state)
    expect(extension).toBeTypeOf("function")

    if (!extension) {
      return
    }

    const svg = createStubElement("svg")
    const defs = createStubElement("defs")
    svg.appendChild(defs)
    svg.appendChild(createStubElement("rect"))
    svg.appendChild(createStubElement("path"))

    extension(svg as unknown as SVGElement, {
      height: 320,
      width: 320,
    })

    const backgroundShape = svg.querySelector('[data-qr-layer="background-shape"]')
    const gradient = svg.querySelector('[data-qr-layer="background-shape-gradient"]')

    expect(backgroundShape?.getAttribute("fill")).toBe("url('#background-shape-gradient')")
    expect(gradient?.tagName).toBe("linearGradient")
    expect(gradient?.getAttribute("x1")).toBe("160")
    expect(gradient?.getAttribute("y1")).toBe("0")
    expect(gradient?.getAttribute("x2")).toBe("160")
    expect(gradient?.getAttribute("y2")).toBe("320")
  })

  it("lets background images override vector background shapes", () => {
    const state = createDefaultQrStudioState()
    state.backgroundShapeId = "circle"
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
      height: 320,
      width: 320,
    })

    expect(svg.querySelector('[data-qr-layer="background-image"]')).not.toBeNull()
    expect(svg.querySelector('[data-qr-layer="background-shape"]')).toBeNull()
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
