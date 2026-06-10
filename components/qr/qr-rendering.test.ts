import { describe, expect, it } from "vitest"

import {
  buildQrExtension,
  createAlignedCornerGradientExtension,
  createDotMatrixAnimationExtension,
  getQrExtensionKey,
} from "./qr-rendering"
import {
  createDefaultQrStudioState,
  type QrDotMatrixAnimationPatch,
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

type DotMatrixSvgFixtureOptions = {
  cols?: number
  height?: number
  rows?: number
  width?: number
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

function createDotMatrixSvgFixture({
  cols = 5,
  height = 120,
  rows = 5,
  width = 120,
}: DotMatrixSvgFixtureOptions = {}) {
  const svg = createStubElement("svg")
  const defs = createStubElement("defs")
  const dotClipPath = createStubElement("clipPath")
  dotClipPath.setAttribute("id", "clip-path-dot-color-0")

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
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

  return { dotLayer, height, svg, width }
}

function renderDotMatrixTracks(
  loader: NonNullable<ReturnType<typeof createDefaultQrStudioState>["dotMatrixAnimation"]["loader"]>,
  pattern: ReturnType<typeof createDefaultQrStudioState>["dotMatrixAnimation"]["pattern"] = "full",
  patch: QrDotMatrixAnimationPatch = {},
) {
  const state = createDefaultQrStudioState()
  state.dotMatrixAnimation = {
    ...state.dotMatrixAnimation,
    ...patch,
    enabled: true,
    loader,
    pattern,
    speed: patch.speed ?? 3,
  }
  const extension = createDotMatrixAnimationExtension(state, "preview")
  expect(extension).toBeTypeOf("function")

  const { height, svg, width } = createDotMatrixSvgFixture()

  extension?.(svg as unknown as SVGElement, {
    height,
    width,
  })

  const animationLayer = svg.querySelector('[data-qr-layer="dot-matrix-animation"]')
  const tracks =
    animationLayer?.children.filter((child) =>
      child.attributes.class?.includes("qr-dot-matrix-track"),
    ) ?? []

  return { animationLayer, tracks }
}

function getTrackDuration(track: StubElement) {
  return Number(track.getAttribute("data-qr-dot-duration-ms") ?? Number.NaN)
}

function getTrackForRegion(tracks: StubElement[], region: string) {
  return tracks.find((track) =>
    track.getAttribute("data-qr-dot-region")?.split(" ").includes(region),
  )
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

  it("adds dot matrix animation as grouped track clip layers while keeping corner markers stable", () => {
    const state = createDefaultQrStudioState()
    state.dotMatrixAnimation = {
      ...state.dotMatrixAnimation,
      enabled: true,
      exportAnimatedSvg: false,
      loader: "crt-glide",
      opacityBase: 0,
      overlayScale: 120,
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
    const cornerSquareClipPath = createStubElement("clipPath")
    cornerSquareClipPath.setAttribute("id", "clip-path-corners-square-color-0-0-0")
    const cornerDotClipPath = createStubElement("clipPath")
    cornerDotClipPath.setAttribute("id", "clip-path-corners-dot-color-0-0-0")
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
    const cornerSquare = createStubElement("rect")
    cornerSquare.setAttribute("x", "30")
    cornerSquare.setAttribute("y", "10")
    cornerSquare.setAttribute("width", "15")
    cornerSquare.setAttribute("height", "15")
    cornerSquareClipPath.appendChild(cornerSquare)
    const cornerDot = createStubElement("path")
    cornerDot.setAttribute("d", "M 35 15 h 5 v 5 h -5 z")
    cornerDotClipPath.appendChild(cornerDot)
    defs.appendChild(dotClipPath)
    defs.appendChild(cornerSquareClipPath)
    defs.appendChild(cornerDotClipPath)
    svg.appendChild(defs)

    const dotLayer = createStubElement("rect")
    dotLayer.setAttribute("clip-path", "url('#clip-path-dot-color-0')")
    dotLayer.setAttribute("fill", "#111827")
    svg.appendChild(dotLayer)
    const cornerLayer = createStubElement("rect")
    cornerLayer.setAttribute("clip-path", "url('#clip-path-corners-square-color-0-0-0')")
    cornerLayer.setAttribute("fill", "#111827")
    svg.appendChild(cornerLayer)
    const cornerDotLayer = createStubElement("rect")
    cornerDotLayer.setAttribute("clip-path", "url('#clip-path-corners-dot-color-0-0-0')")
    cornerDotLayer.setAttribute("fill", "#111827")
    svg.appendChild(cornerDotLayer)
    const logoLayer = createStubElement("image")
    svg.appendChild(logoLayer)

    extension(svg as unknown as SVGElement, {
      height: 120,
      width: 120,
    })

    const animationLayer = svg.querySelector('[data-qr-layer="dot-matrix-animation"]')
    const animationClipPaths =
      animationLayer?.querySelectorAll("clipPath").filter((child) =>
        child.attributes["data-qr-layer"] === "dot-matrix-animation-clip",
      ) ?? []
    const animatedTracks =
      animationLayer?.children.filter(
        (child) => child.attributes.class === "qr-dot-matrix-track",
      ) ?? []
    const animatedModules = animationClipPaths.flatMap((clipPath) => clipPath.children)

    expect(svg.children).toContain(dotLayer)
    expect(svg.children).toContain(cornerLayer)
    expect(svg.children).toContain(cornerDotLayer)
    expect(dotLayer.getAttribute("opacity")).toBe("0")
    expect(cornerLayer.getAttribute("opacity")).toBeNull()
    expect(cornerDotLayer.getAttribute("opacity")).toBeNull()
    expect(svg.children.indexOf(dotLayer)).toBeLessThan(svg.children.indexOf(animationLayer!))
    expect(svg.children.indexOf(cornerLayer)).toBeLessThan(svg.children.indexOf(animationLayer!))
    expect(svg.children.indexOf(cornerDotLayer)).toBeLessThan(svg.children.indexOf(animationLayer!))
    expect(svg.children.indexOf(animationLayer!)).toBeLessThan(svg.children.indexOf(logoLayer))
    expect(animationLayer?.children[0]?.tagName).toBe("style")
    expect(animationLayer?.children[0]?.textContent).toContain(
      "@media (prefers-reduced-motion: reduce)",
    )
    expect(animationLayer?.children[0]?.textContent).toContain(
      ".qr-dot-matrix-layer",
    )
    expect(animationLayer?.getAttribute("style")).toContain(
      "--qr-dot-matrix-opacity-base:0",
    )
    expect(animatedTracks.length).toBeGreaterThan(0)
    expect(animatedTracks.length).toBeLessThanOrEqual(40)
    expect(animatedModules).toHaveLength(2)
    expect(animatedTracks[0]?.getAttribute("fill")).toBe("#22d3ee")
    expect(animatedTracks[0]?.getAttribute("data-qr-dot-loader")).toBe("crt-glide")
    expect(animatedTracks[0]?.getAttribute("data-qr-dot-grid")).toBe("5x5")
    expect(animatedTracks[0]?.getAttribute("data-qr-dot-topology")).toBe("scan-line")
    expect(animatedModules[0]?.getAttribute("x")).toBe("10")
    expect(animatedModules[0]?.getAttribute("transform")).toContain("scale(1.2)")
    expect(animatedModules.some((module) => module.getAttribute("width") === "15")).toBe(false)
    expect(animatedModules.some((module) => module.getAttribute("d") === "M 35 15 h 5 v 5 h -5 z")).toBe(false)
    expect(animatedTracks[0]?.getAttribute("style")).toContain(
      "--qr-dot-track:",
    )
  })

  it("uses selected dot matrix density for track assignment", () => {
    const { tracks } = renderDotMatrixTracks("crt-glide", "full", {
      matrixSize: 25,
    })

    expect(tracks.length).toBeGreaterThan(0)
    expect(tracks.every((track) => track.getAttribute("data-qr-dot-grid") === "25x25")).toBe(true)
    expect(new Set(tracks.map((track) => track.getAttribute("data-qr-dot-region"))).has("24,24")).toBe(true)
  })

  it("shortens dot matrix track duration when density and speed increase", () => {
    const defaultTrack = renderDotMatrixTracks("crt-glide", "full", {
      matrixSize: 5,
      speed: 3,
    }).tracks[0]
    const denseFastTrack = renderDotMatrixTracks("crt-glide", "full", {
      matrixSize: 25,
      speed: 10,
    }).tracks[0]

    expect(getTrackDuration(defaultTrack!)).toBeGreaterThan(getTrackDuration(denseFastTrack!))
  })

  it("keeps loader color independent from the QR style color in preview and export", () => {
    for (const mode of ["preview", "export"] as const) {
      const state = createDefaultQrStudioState()
      state.dataModulesSettings.color = "#ff0000"
      state.dotMatrixAnimation = {
        ...state.dotMatrixAnimation,
        colorPreset: "theme",
        customColor: "",
        enabled: true,
        exportAnimatedSvg: true,
      }
      const extension = createDotMatrixAnimationExtension(state, mode)
      expect(extension, mode).toBeTypeOf("function")

      const svg = createStubElement("svg")
      const defs = createStubElement("defs")
      const dotClipPath = createStubElement("clipPath")
      dotClipPath.setAttribute("id", "clip-path-dot-color-0")
      const dot = createStubElement("rect")
      dot.setAttribute("x", "10")
      dot.setAttribute("y", "10")
      dot.setAttribute("width", "5")
      dot.setAttribute("height", "5")
      dotClipPath.appendChild(dot)
      defs.appendChild(dotClipPath)
      svg.appendChild(defs)

      const dotLayer = createStubElement("rect")
      dotLayer.setAttribute("clip-path", "url('#clip-path-dot-color-0')")
      dotLayer.setAttribute("fill", "#ff0000")
      svg.appendChild(dotLayer)

      extension?.(svg as unknown as SVGElement, {
        height: 120,
        width: 120,
      })

      const animationLayer = svg.querySelector('[data-qr-layer="dot-matrix-animation"]')
      const animatedTrack = animationLayer?.children.find((child) =>
        child.attributes.class?.includes("qr-dot-matrix-track"),
      )

      expect(animationLayer?.getAttribute("style"), mode).toContain(
        "--qr-dot-matrix-color:#22d3ee",
      )
      expect(dotLayer.getAttribute("opacity"), mode).toBe("0")
      expect(animatedTrack?.getAttribute("fill"), mode).toBe("#22d3ee")
    }
  })

  it("keeps every module in bounded animation tracks for every pattern", () => {
    const patterns = ["cross", "diamond", "full", "outline", "rings", "rose"] as const

    for (const pattern of patterns) {
      const state = createDefaultQrStudioState()
      state.dotMatrixAnimation = {
        ...state.dotMatrixAnimation,
        enabled: true,
        pattern,
      }
      const extension = createDotMatrixAnimationExtension(state, "preview")
      expect(extension, pattern).toBeTypeOf("function")

      if (!extension) {
        continue
      }

      const svg = createStubElement("svg")
      const defs = createStubElement("defs")
      const dotClipPath = createStubElement("clipPath")
      dotClipPath.setAttribute("id", "clip-path-dot-color-0")

      for (let row = 0; row < 6; row += 1) {
        for (let col = 0; col < 6; col += 1) {
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
      const animationClipPaths =
        animationLayer?.querySelectorAll("clipPath").filter((child) =>
          child.attributes["data-qr-layer"] === "dot-matrix-animation-clip",
        ) ?? []
      const animatedTracks =
        animationLayer?.children.filter(
          (child) => child.attributes.class === "qr-dot-matrix-track",
        ) ?? []
      const animatedModules = animationClipPaths.flatMap((clipPath) => clipPath.children)

      expect(animatedModules, pattern).toHaveLength(36)
      expect(animatedTracks.length, pattern).toBeGreaterThan(1)
      expect(animatedTracks.length, pattern).toBeLessThanOrEqual(40)
      expect(animatedTracks.length, pattern).toBeLessThan(36)
      expect(animationLayer?.getAttribute("class"), pattern).toContain(
        `qr-dot-pattern-${pattern}`,
      )
    }
  })

  it("creates bounded animation tracks for every square loader preset", () => {
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
      const animatedTracks =
        animationLayer?.children.filter(
          (child) => child.attributes.class === "qr-dot-matrix-track",
        ) ?? []

      expect(animatedTracks.length, loader).toBeGreaterThan(0)
      expect(animatedTracks.length, loader).toBeLessThanOrEqual(40)
      expect(animatedTracks[0]?.getAttribute("data-qr-dot-loader")).toBe(loader)
      expect(animationLayer?.children[0]?.textContent, loader).toContain("@keyframes qr-dot-loader-")
    }
  })

  it("keeps loader track counts bounded on dense QR grids", () => {
    for (const loader of QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS.map((option) => option.value)) {
      const state = createDefaultQrStudioState()
      state.dotMatrixAnimation = {
        ...state.dotMatrixAnimation,
        enabled: true,
        loader,
      }
      const extension = createDotMatrixAnimationExtension(state, "preview")

      if (!extension) {
        continue
      }

      const svg = createStubElement("svg")
      const defs = createStubElement("defs")
      const dotClipPath = createStubElement("clipPath")
      dotClipPath.setAttribute("id", "clip-path-dot-color-0")

      for (let row = 0; row < 31; row += 1) {
        for (let col = 0; col < 31; col += 1) {
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
        height: 240,
        width: 240,
      })

      const animationLayer = svg.querySelector('[data-qr-layer="dot-matrix-animation"]')
      const animatedTracks =
        animationLayer?.children.filter(
          (child) => child.attributes.class === "qr-dot-matrix-track",
        ) ?? []

      expect(animatedTracks.length, loader).toBeLessThanOrEqual(40)
      expect(animatedTracks.length, loader).toBeLessThan(961)
    }
  })

  it("maps public loader ids to the exact zzzzshawn square loader ids", () => {
    const expected = new Map([
      ["neon-drift", "dotm-square-1"],
      ["pulse-ladder", "dotm-square-2"],
      ["core-spiral", "dotm-square-3"],
      ["twin-orbit", "dotm-square-4"],
      ["prism-sweep", "dotm-square-5"],
      ["flux-columns", "dotm-square-6"],
      ["block-drop", "dotm-square-7"],
      ["strobe-stack", "dotm-square-8"],
      ["glyph-pulse", "dotm-square-9"],
      ["crt-glide", "dotm-square-10"],
      ["echo-ring", "dotm-square-11"],
      ["origin-wave", "dotm-square-12"],
      ["core-rotor", "dotm-square-13"],
      ["prism-bloom", "dotm-square-14"],
      ["helix-glow", "dotm-square-15"],
      ["helix-core", "dotm-square-16"],
      ["half-helix", "dotm-square-17"],
      ["sound-bars", "dotm-square-18"],
      ["infinity-run", "dotm-square-19"],
      ["mobius-run", "dotm-square-20"],
    ])

    for (const loader of QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS.map((option) => option.value)) {
      const { tracks } = renderDotMatrixTracks(loader)
      expect(tracks[0]?.getAttribute("data-qr-dot-upstream-loader"), loader).toBe(
        expected.get(loader),
      )
    }
  })

  it("matches zzzzshawn square-3 spiral inward path for the global 5x5 regions", () => {
    const { tracks } = renderDotMatrixTracks("core-spiral")
    const topLeft = getTrackForRegion(tracks, "0,0")
    const topRight = getTrackForRegion(tracks, "4,0")
    const center = getTrackForRegion(tracks, "2,2")

    expect(topLeft?.getAttribute("data-qr-dot-upstream-loader")).toBe("dotm-square-3")
    expect(topLeft?.getAttribute("data-qr-dot-upstream-class")).toBe("dmx-spiral-snake")
    expect(topLeft?.getAttribute("style")).toContain("--dmx-spiral-order:0")
    expect(topRight?.getAttribute("style")).toContain("--dmx-spiral-order:4")
    expect(center?.getAttribute("style")).toContain("--dmx-spiral-order:24")
  })

  it("matches zzzzshawn square-4 twin orbit outer and middle ring algorithms", () => {
    const { tracks } = renderDotMatrixTracks("twin-orbit")
    const outerStart = getTrackForRegion(tracks, "0,0")
    const outerRight = getTrackForRegion(tracks, "4,2")
    const middleStart = getTrackForRegion(tracks, "1,1")
    const center = getTrackForRegion(tracks, "2,2")

    expect(outerStart?.getAttribute("data-qr-dot-upstream-class")).toBe("dmx-outer-snake")
    expect(outerStart?.getAttribute("style")).toContain("--dmx-outer-order:0")
    expect(outerRight?.getAttribute("style")).toContain("--dmx-outer-order:6")
    expect(middleStart?.getAttribute("data-qr-dot-upstream-class")).toBe("dmx-middle-snake")
    expect(middleStart?.getAttribute("style")).toContain("--dmx-middle-order:0")
    expect(center?.getAttribute("data-qr-dot-state")).toBe("quiet")
  })

  it("uses zzzzshawn path helpers for diagonal sweep, row cycle, column snake, and diagonal drift", () => {
    const prism = renderDotMatrixTracks("prism-sweep").tracks
    const pulse = renderDotMatrixTracks("pulse-ladder").tracks
    const flux = renderDotMatrixTracks("flux-columns").tracks
    const neon = renderDotMatrixTracks("neon-drift").tracks

    expect(getTrackForRegion(prism, "0,0")?.getAttribute("data-qr-dot-upstream-class")).toBe("dmx-diagonal-snake")
    expect(getTrackForRegion(prism, "0,0")?.getAttribute("style")).toContain("--dmx-diagonal-snake-order:0")
    expect(getTrackForRegion(pulse, "0,4")?.getAttribute("data-qr-dot-topology")).toBe("row-cycle-snake")
    expect(getTrackForRegion(pulse, "0,4")?.getAttribute("data-qr-dot-keyframes")).toContain("dmx-square2")
    expect(getTrackForRegion(flux, "0,4")?.getAttribute("data-qr-dot-upstream-class")).toBe("dmx-square6-col-snake")
    expect(getTrackForRegion(flux, "0,4")?.getAttribute("style")).toContain("--dmx-col-pos:0")
    expect(getTrackForRegion(neon, "4,0")?.getAttribute("data-qr-dot-upstream-class")).toBe("dmx-diagonal-alt-sweep")
    expect(getTrackForRegion(neon, "4,0")?.getAttribute("style")).toContain("--dmx-path:0")
  })

  it("generates zzzzshawn frame and math cycle keyframes for non-CSS resolver loaders", () => {
    const loaders = [
      ["block-drop", "dotm-square-7", "frame-mask"],
      ["strobe-stack", "dotm-square-8", "stack-drain"],
      ["core-rotor", "dotm-square-13", "frame-mask"],
      ["helix-glow", "dotm-square-15", "helix-glow"],
      ["sound-bars", "dotm-square-18", "sound-bars"],
      ["infinity-run", "dotm-square-19", "infinity-run"],
      ["mobius-run", "dotm-square-20", "mobius-run"],
    ] as const

    for (const [loader, upstreamId, topology] of loaders) {
      const { animationLayer, tracks } = renderDotMatrixTracks(loader)
      const activeTrack = tracks.find((track) => track.getAttribute("data-qr-dot-state") === "active")

      expect(activeTrack?.getAttribute("data-qr-dot-upstream-loader"), loader).toBe(upstreamId)
      expect(activeTrack?.getAttribute("data-qr-dot-topology"), loader).toBe(topology)
      expect(activeTrack?.getAttribute("data-qr-dot-keyframes"), loader).toContain(upstreamId)
      expect(animationLayer?.children[0]?.textContent, loader).toContain(
        `@keyframes ${activeTrack?.getAttribute("data-qr-dot-keyframes")}`,
      )
    }
  })

  it("remaps generated loader keyframes through base mid and peak opacity anchors", () => {
    const { animationLayer } = renderDotMatrixTracks("sound-bars", "full", {
      customColorBase: "#111111",
      customColorMid: "#555555",
      customColorPeak: "#eeeeee",
      opacityBase: 0.12,
      opacityMid: 0.46,
      opacityPeak: 0.9,
    })
    const styleText = animationLayer?.children[0]?.textContent ?? ""

    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-opacity-base:0.12")
    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-opacity-mid:0.46")
    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-opacity-peak:0.9")
    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-color-base:#111111")
    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-color-mid:#555555")
    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-color-peak:#eeeeee")
    expect(styleText).toContain("var(--qr-dot-matrix-opacity-base)")
    expect(styleText).toContain("var(--qr-dot-matrix-opacity-mid)")
    expect(styleText).toContain("var(--qr-dot-matrix-opacity-peak)")
    expect(styleText).toContain("fill: var(--qr-dot-matrix-color-base)")
    expect(styleText).toContain("fill: var(--qr-dot-matrix-color-mid)")
    expect(styleText).toContain("fill: var(--qr-dot-matrix-color-peak)")
    expect(styleText).not.toContain("opacity: 0.08")
    expect(styleText).not.toContain("opacity: 1;")
  })

  it("treats base mid and peak as literal opacity anchors with no forced minimum", () => {
    const { animationLayer, tracks } = renderDotMatrixTracks("block-drop", "full", {
      opacityBase: 0,
      opacityMid: 0,
      opacityPeak: 0,
    })
    const styleText = animationLayer?.children[0]?.textContent ?? ""

    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-opacity-base:0")
    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-opacity-mid:0")
    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-opacity-peak:0")
    expect(styleText).toContain("opacity: var(--qr-dot-matrix-opacity-base)")
    expect(styleText).toContain("opacity: var(--qr-dot-matrix-opacity-mid)")
    expect(styleText).toContain("opacity: var(--qr-dot-matrix-opacity-peak)")
    expect(styleText).not.toContain("opacity: calc(")
    expect(styleText).not.toContain("0.08")
    expect(styleText).not.toContain("0.34")
    expect(styleText).not.toContain("0.55")
    expect(styleText).not.toContain("0.94")
    expect(getTrackForRegion(tracks, "2,2")?.getAttribute("data-qr-dot-state")).toBe("active")
  })

  it("uses base opacity exactly for quiet loader overlay tracks", () => {
    const { animationLayer, tracks } = renderDotMatrixTracks("twin-orbit", "full", {
      opacityBase: 0,
    })
    const center = getTrackForRegion(tracks, "2,2")
    const styleText = animationLayer?.children[0]?.textContent ?? ""

    expect(center?.getAttribute("data-qr-dot-state")).toBe("quiet")
    expect(center?.getAttribute("class")).toBe("qr-dot-matrix-track qr-dot-matrix-track-quiet")
    expect(animationLayer?.getAttribute("style")).toContain("--qr-dot-matrix-opacity-base:0")
    expect(styleText).toContain(".qr-dot-matrix-track-quiet")
    expect(styleText).toContain("opacity: var(--qr-dot-matrix-opacity-base)")
  })

  it("keeps full pattern exact while secondary patterns move inactive cells to quiet coverage", () => {
    const full = renderDotMatrixTracks("core-spiral", "full").tracks
    const rings = renderDotMatrixTracks("core-spiral", "rings").tracks
    const fullRegions = new Set(
      full.flatMap((track) => track.getAttribute("data-qr-dot-region")?.split(" ") ?? []),
    )
    const ringsRegions = new Set(
      rings.flatMap((track) => track.getAttribute("data-qr-dot-region")?.split(" ") ?? []),
    )

    expect(fullRegions).toEqual(ringsRegions)
    expect(getTrackForRegion(full, "2,2")?.getAttribute("data-qr-dot-state")).toBe("active")
    expect(getTrackForRegion(rings, "2,2")?.getAttribute("data-qr-dot-state")).toBe("quiet")
    expect(getTrackForRegion(rings, "0,0")?.getAttribute("data-qr-dot-state")).toBe("active")
  })

  it("assigns modules to one global 5x5 QR-area grid", () => {
    const state = createDefaultQrStudioState()
    state.dotMatrixAnimation = {
      ...state.dotMatrixAnimation,
      enabled: true,
      loader: "core-spiral",
      pattern: "full",
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

    for (const [row, col] of [
      [0, 0],
      [1, 1],
      [5, 5],
      [9, 9],
      [10, 10],
    ]) {
      const dot = createStubElement("circle")
      dot.setAttribute("cx", String(12.5 + col * 5))
      dot.setAttribute("cy", String(12.5 + row * 5))
      dot.setAttribute("r", "2.5")
      dotClipPath.appendChild(dot)
    }

    defs.appendChild(dotClipPath)
    svg.appendChild(defs)

    const dotLayer = createStubElement("rect")
    dotLayer.setAttribute("clip-path", "url('#clip-path-dot-color-0')")
    dotLayer.setAttribute("fill", "#111827")
    svg.appendChild(dotLayer)

    extension(svg as unknown as SVGElement, {
      height: 140,
      width: 140,
    })

    const animationLayer = svg.querySelector('[data-qr-layer="dot-matrix-animation"]')
    const animatedTracks =
      animationLayer?.children.filter(
        (child) => child.attributes.class === "qr-dot-matrix-track",
      ) ?? []
    const animatedModules =
      animationLayer
        ?.querySelectorAll("clipPath")
        .filter((child) => child.attributes["data-qr-layer"] === "dot-matrix-animation-clip")
        .flatMap((clipPath) => clipPath.children) ?? []

    expect(animatedModules).toHaveLength(5)
    expect(animatedTracks.every((track) => track.getAttribute("data-qr-dot-grid") === "5x5")).toBe(true)
    expect(new Set(animatedTracks.map((track) => track.getAttribute("data-qr-dot-region")))).toEqual(
      new Set(["0,0", "2,2", "4,4"]),
    )
    expect(animatedTracks.every((track) => track.getAttribute("data-qr-dot-local") === null)).toBe(true)
    expect(animatedTracks.every((track) => track.getAttribute("data-qr-dot-tile") === null)).toBe(true)
  })

  it("keeps inactive upstream 5x5 cells covered by a quiet tint track", () => {
    const state = createDefaultQrStudioState()
    state.dotMatrixAnimation = {
      ...state.dotMatrixAnimation,
      enabled: true,
      loader: "twin-orbit",
      pattern: "full",
    }
    const extension = createDotMatrixAnimationExtension(state, "preview")
    expect(extension).toBeTypeOf("function")

    if (!extension) {
      return
    }

    const { height, svg, width } = createDotMatrixSvgFixture()

    extension(svg as unknown as SVGElement, {
      height,
      width,
    })

    const animationLayer = svg.querySelector('[data-qr-layer="dot-matrix-animation"]')
    const animatedTracks =
      animationLayer?.children.filter(
        (child) => child.attributes.class === "qr-dot-matrix-track" ||
          child.attributes.class === "qr-dot-matrix-track qr-dot-matrix-track-quiet",
      ) ?? []
    const animatedModules =
      animationLayer
        ?.querySelectorAll("clipPath")
        .filter((child) => child.attributes["data-qr-layer"] === "dot-matrix-animation-clip")
        .flatMap((clipPath) => clipPath.children) ?? []

    expect(animatedModules).toHaveLength(25)
    expect(animatedTracks.some((track) => track.getAttribute("data-qr-dot-state") === "quiet")).toBe(true)
    expect(animatedTracks.some((track) => track.getAttribute("data-qr-dot-state") === "active")).toBe(true)
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

  it("keeps the extension key stable when only ReactQRCode-owned corner gradients change", () => {
    const defaultState = createDefaultQrStudioState()
    const stateWithCornerGradient = createDefaultQrStudioState()
    stateWithCornerGradient.finderPatternOuterGradient = {
      ...stateWithCornerGradient.finderPatternOuterGradient,
      enabled: true,
      rotation: Math.PI / 3,
      type: "linear",
    }

    expect(getQrExtensionKey(stateWithCornerGradient)).toBe(
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
    state.finderPatternOuterGradient = {
      ...state.finderPatternOuterGradient,
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
    state.finderPatternInnerGradient = {
      ...state.finderPatternInnerGradient,
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
    state.finderPatternOuterGradient = {
      ...state.finderPatternOuterGradient,
      enabled: true,
      type: "radial",
    }

    expect(createAlignedCornerGradientExtension(state)).toBeNull()
  })
})
