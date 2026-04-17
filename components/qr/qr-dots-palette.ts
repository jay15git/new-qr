import type { ExtensionFunction } from "qr-code-styling"

const SVG_NS = "http://www.w3.org/2000/svg"
const DOTS_CLIP_PATH_PREFIX = "clip-path-dot-color-"
const CORNER_CLIP_PATH_PREFIXES = [
  "clip-path-corners-square-color-",
  "clip-path-corners-dot-color-",
]

type DotsPaletteExtensionOptions = {
  palette: string[]
  seed: string
}

type ShapeBox = {
  x: number
  y: number
  width: number
  height: number
}

type ModuleAnchor = {
  x: number
  y: number
  size?: number
}

type DotGridMetrics = {
  cellSize: number
  originX: number
  originY: number
}

const BALANCED_TILE_SIZE = 4
const BALANCED_TILE_ORDER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const

export function hashPaletteSeed(seed: string) {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function getPaletteIndexForModule(
  seed: string,
  row: number,
  col: number,
  paletteSize: number,
) {
  if (paletteSize <= 0) {
    return 0
  }

  const balancedBand = Math.floor(
    (BALANCED_TILE_ORDER[row % BALANCED_TILE_SIZE][col % BALANCED_TILE_SIZE] *
      paletteSize) /
      (BALANCED_TILE_SIZE * BALANCED_TILE_SIZE),
  )
  const globalShift = hashPaletteSeed(seed) % paletteSize
  const tileShift =
    hashPaletteSeed(
      `${seed}:${Math.floor(row / BALANCED_TILE_SIZE)}:${Math.floor(col / BALANCED_TILE_SIZE)}`,
    ) % paletteSize

  return (balancedBand + globalShift + tileShift) % paletteSize
}

export function createDotsPaletteExtension({
  palette,
  seed,
}: DotsPaletteExtensionOptions): ExtensionFunction {
  return (svg) => {
    if (!(svg instanceof svg.ownerDocument.defaultView!.SVGSVGElement)) {
      return
    }

    if (palette.length === 0) {
      return
    }

    const svgRoot = svg as SVGSVGElement
    const dotsClipPath = Array.from(svgRoot.querySelectorAll("clipPath")).find((element) =>
      element.getAttribute("id")?.startsWith(DOTS_CLIP_PATH_PREFIX),
    )

    if (!dotsClipPath || !dotsClipPath.id) {
      return
    }

    const dotShapes = Array.from(dotsClipPath.children).filter(
      (child): child is SVGElement =>
        child instanceof svgRoot.ownerDocument.defaultView!.SVGElement,
    )

    if (dotShapes.length === 0) {
      return
    }

    const metrics = collectDotGridMetrics(dotShapes)

    if (!metrics) {
      return
    }

    const defs = dotsClipPath.parentElement

    if (!defs) {
      return
    }

    const colorGroups = new Map<number, SVGElement[]>()

    for (const shape of dotShapes) {
      const coordinates = resolveModuleCoordinates(shape, metrics)

      if (!coordinates) {
        continue
      }

      const paletteIndex = getPaletteIndexForModule(
        seed,
        coordinates.row,
        coordinates.col,
        palette.length,
      )
      const group = colorGroups.get(paletteIndex) ?? []
      group.push(shape.cloneNode(true) as SVGElement)
      colorGroups.set(paletteIndex, group)
    }

    if (colorGroups.size === 0) {
      return
    }

    const existingDotLayer = findDotColorLayer(svgRoot, dotsClipPath.id)
    const insertBefore =
      existingDotLayer?.nextSibling instanceof svgRoot.ownerDocument.defaultView!.SVGElement
        ? existingDotLayer.nextSibling
        : findDotsLayerAnchor(svgRoot)

    existingDotLayer?.remove()

    for (const [paletteIndex, shapes] of colorGroups.entries()) {
      const groupClipPath = svgRoot.ownerDocument.createElementNS(SVG_NS, "clipPath")
      const groupClipPathId = `${dotsClipPath.id}-palette-${paletteIndex}`

      groupClipPath.setAttribute("id", groupClipPathId)

      for (const shape of shapes) {
        groupClipPath.appendChild(shape)
      }

      defs.appendChild(groupClipPath)

      const colorLayer = createPaletteColorLayer(
        svgRoot,
        existingDotLayer,
        palette[paletteIndex],
        groupClipPathId,
      )

      if (insertBefore) {
        svgRoot.insertBefore(colorLayer, insertBefore)
      } else {
        svgRoot.appendChild(colorLayer)
      }
    }
  }
}

function collectDotGridMetrics(dotShapes: SVGElement[]) {
  const anchors = dotShapes
    .map((shape) => getModuleAnchor(shape))
    .filter((anchor): anchor is ModuleAnchor => anchor !== null)

  if (anchors.length === 0) {
    return null
  }

  const explicitSizes = anchors
    .map((anchor) => anchor.size)
    .filter((size): size is number => size !== undefined && Number.isFinite(size) && size > 0)
  const cellSize =
    explicitSizes.length > 0
      ? Math.min(...explicitSizes)
      : getSmallestPositiveDelta([
          ...anchors.map((anchor) => anchor.x),
          ...anchors.map((anchor) => anchor.y),
        ])

  if (!Number.isFinite(cellSize) || cellSize <= 0) {
    return null
  }

  return {
    cellSize,
    originX: Math.min(...anchors.map((anchor) => anchor.x)),
    originY: Math.min(...anchors.map((anchor) => anchor.y)),
  } satisfies DotGridMetrics
}

function resolveModuleCoordinates(shape: SVGElement, metrics: DotGridMetrics) {
  const row = getNumericAttribute(shape, "data-module-row")
  const col = getNumericAttribute(shape, "data-module-col")

  if (row !== null && col !== null) {
    return { row, col }
  }

  const anchor = getModuleAnchor(shape)

  if (!anchor) {
    return null
  }

  return {
    row: Math.max(0, Math.round((anchor.y - metrics.originY) / metrics.cellSize)),
    col: Math.max(0, Math.round((anchor.x - metrics.originX) / metrics.cellSize)),
  }
}

function getModuleAnchor(shape: SVGElement) {
  const dataX = getNumericAttribute(shape, "data-module-x")
  const dataY = getNumericAttribute(shape, "data-module-y")
  const dataSize = getNumericAttribute(shape, "data-module-size")

  if (dataX !== null && dataY !== null && dataSize !== null && dataSize > 0) {
    return {
      x: dataX,
      y: dataY,
      size: dataSize,
    } satisfies ModuleAnchor
  }

  if (shape.tagName.toLowerCase() === "rect") {
    const x = getNumericAttribute(shape, "x")
    const y = getNumericAttribute(shape, "y")
    const width = getNumericAttribute(shape, "width")
    const height = getNumericAttribute(shape, "height")

    if (x !== null && y !== null && width !== null && height !== null) {
      return {
        x,
        y,
        size: Math.min(width, height),
      } satisfies ModuleAnchor
    }
  }

  if (shape.tagName.toLowerCase() === "circle") {
    const cx = getNumericAttribute(shape, "cx")
    const cy = getNumericAttribute(shape, "cy")
    const r = getNumericAttribute(shape, "r")

    if (cx !== null && cy !== null && r !== null) {
      return {
        x: cx - r,
        y: cy - r,
        size: r * 2,
      } satisfies ModuleAnchor
    }
  }

  if (shape.tagName.toLowerCase() === "path") {
    const anchor = getPathAnchor(shape.getAttribute("d"))

    if (anchor) {
      return anchor
    }
  }

  const box = getShapeBox(shape)

  if (box) {
    return {
      x: box.x,
      y: box.y,
      size: Math.min(box.width, box.height),
    } satisfies ModuleAnchor
  }

  return null
}

function getShapeBox(shape: SVGElement) {
  if (typeof (shape as SVGGraphicsElement).getBBox === "function") {
    try {
      const box = (shape as SVGGraphicsElement).getBBox()

      if (box.width > 0 && box.height > 0) {
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        } satisfies ShapeBox
      }
    } catch {
      // Ignore and fall back to no box.
    }
  }

  return null
}

function getPathAnchor(pathDefinition: string | null) {
  if (!pathDefinition) {
    return null
  }

  const match =
    /M\s*([+-]?(?:\d+\.?\d*|\.\d+))[\s,]+([+-]?(?:\d+\.?\d*|\.\d+))/.exec(pathDefinition)

  if (!match) {
    return null
  }

  const x = Number(match[1])
  const y = Number(match[2])

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }

  return { x, y } satisfies ModuleAnchor
}

function getSmallestPositiveDelta(values: number[]) {
  const uniqueValues = Array.from(new Set(values.filter(Number.isFinite))).sort((a, b) => a - b)
  let smallestDelta = Number.POSITIVE_INFINITY

  for (let index = 1; index < uniqueValues.length; index += 1) {
    const delta = uniqueValues[index] - uniqueValues[index - 1]

    if (delta > 0 && delta < smallestDelta) {
      smallestDelta = delta
    }
  }

  return smallestDelta
}

function getNumericAttribute(shape: SVGElement, attributeName: string) {
  const value = shape.getAttribute(attributeName)

  if (value === null) {
    return null
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function findDotColorLayer(svg: SVGSVGElement, dotsClipPathId: string) {
  return Array.from(svg.querySelectorAll("rect")).find((element) => {
    const clipPath = element.getAttribute("clip-path")

    return (
      clipPath === `url('#${dotsClipPathId}')` ||
      clipPath === `url("#${dotsClipPathId}")`
    )
  })
}

function findDotsLayerAnchor(svg: SVGSVGElement) {
  return Array.from(svg.children).find((child) => {
    if (!(child instanceof svg.ownerDocument.defaultView!.SVGElement)) {
      return false
    }

    if (child.tagName.toLowerCase() === "image") {
      return true
    }

    if (child.tagName.toLowerCase() !== "rect") {
      return false
    }

    const clipPath = child.getAttribute("clip-path") ?? ""

    return CORNER_CLIP_PATH_PREFIXES.some(
      (prefix) =>
        clipPath.includes(`url('#${prefix}`) || clipPath.includes(`url("#${prefix}`),
    )
  })
}

function createPaletteColorLayer(
  svg: SVGSVGElement,
  existingDotLayer: SVGRectElement | undefined,
  color: string,
  clipPathId: string,
) {
  const layer = svg.ownerDocument.createElementNS(SVG_NS, "rect")

  layer.setAttribute("x", existingDotLayer?.getAttribute("x") ?? "0")
  layer.setAttribute("y", existingDotLayer?.getAttribute("y") ?? "0")
  layer.setAttribute("width", existingDotLayer?.getAttribute("width") ?? svg.getAttribute("width") ?? "0")
  layer.setAttribute("height", existingDotLayer?.getAttribute("height") ?? svg.getAttribute("height") ?? "0")
  layer.setAttribute("fill", color)
  layer.setAttribute("clip-path", `url('#${clipPathId}')`)

  return layer
}
