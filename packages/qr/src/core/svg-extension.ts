import type { NewQrCodeProps } from "../types"

const SVG_NS = "http://www.w3.org/2000/svg"
const DOTS_CLIP_PATH_PREFIX = "clip-path-dot-color-"

function getActivePalette(props: NewQrCodeProps) {
  return (props.palette ?? []).filter(Boolean)
}

function createLinearGradient(
  document: Document,
  id: string,
  gradient: NonNullable<NewQrCodeProps["gradient"]> & object,
) {
  const element = document.createElementNS(SVG_NS, "linearGradient")
  element.setAttribute("id", id)
  element.setAttribute("gradientUnits", "userSpaceOnUse")

  const rotation = gradient.rotation ?? 0
  const radians = (rotation * Math.PI) / 180
  const x1 = 50 - Math.cos(radians) * 50
  const y1 = 50 - Math.sin(radians) * 50
  const x2 = 50 + Math.cos(radians) * 50
  const y2 = 50 + Math.sin(radians) * 50

  element.setAttribute("x1", String(x1))
  element.setAttribute("y1", String(y1))
  element.setAttribute("x2", String(x2))
  element.setAttribute("y2", String(y2))

  for (const stop of gradient.stops) {
    const stopElement = document.createElementNS(SVG_NS, "stop")
    stopElement.setAttribute("offset", String(stop.offset))
    stopElement.setAttribute("stop-color", stop.color)
    element.appendChild(stopElement)
  }

  return element
}

function createRadialGradient(
  document: Document,
  id: string,
  gradient: NonNullable<NewQrCodeProps["gradient"]> & object,
) {
  const element = document.createElementNS(SVG_NS, "radialGradient")
  element.setAttribute("id", id)
  element.setAttribute("cx", "50%")
  element.setAttribute("cy", "50%")
  element.setAttribute("r", "50%")

  for (const stop of gradient.stops) {
    const stopElement = document.createElementNS(SVG_NS, "stop")
    stopElement.setAttribute("offset", String(stop.offset))
    stopElement.setAttribute("stop-color", stop.color)
    element.appendChild(stopElement)
  }

  return element
}

function applyDotsGradientExtension(svg: SVGElement, props: NewQrCodeProps) {
  if (props.colorMode !== "gradient" || props.gradient === "none" || !props.gradient) {
    return
  }

  const document = svg.ownerDocument
  if (!document) {
    return
  }

  let defs = svg.querySelector("defs")
  if (!defs) {
    defs = document.createElementNS(SVG_NS, "defs")
    svg.insertBefore(defs, svg.firstChild)
  }

  const gradientId = "new-qr-dots-gradient"
  const gradientElement =
    props.gradient.type === "radial"
      ? createRadialGradient(document, gradientId, props.gradient)
      : createLinearGradient(document, gradientId, props.gradient)

  defs.appendChild(gradientElement)

  const dotsGroup = svg.querySelector('[data-testid="data-modules"]')
  if (dotsGroup instanceof SVGElement) {
    dotsGroup.setAttribute("fill", `url(#${gradientId})`)
    dotsGroup.setAttribute("data-qr-layer", "dot-gradient")
  }
}

function applyDotsPaletteExtension(svg: SVGElement, props: NewQrCodeProps) {
  const palette = getActivePalette(props)
  if (props.colorMode !== "palette" || palette.length === 0) {
    return
  }

  const document = svg.ownerDocument
  if (!document) {
    return
  }

  let defs = svg.querySelector("defs")
  if (!defs) {
    defs = document.createElementNS(SVG_NS, "defs")
    svg.insertBefore(defs, svg.firstChild)
  }

  const dotsGroup = svg.querySelector('[data-testid="data-modules"]')
  if (!(dotsGroup instanceof SVGGElement)) {
    return
  }

  const modules = [...dotsGroup.querySelectorAll("rect, path, circle")]
  modules.forEach((module, index) => {
    const clipId = `${DOTS_CLIP_PATH_PREFIX}${index}`
    const clipPath = document.createElementNS(SVG_NS, "clipPath")
    clipPath.setAttribute("id", clipId)

    const clone = module.cloneNode(true)
    clipPath.appendChild(clone)
    defs!.appendChild(clipPath)

    const overlay = document.createElementNS(SVG_NS, "rect")
    const bbox = (module as SVGGraphicsElement).getBBox?.()
    if (bbox) {
      overlay.setAttribute("x", String(bbox.x))
      overlay.setAttribute("y", String(bbox.y))
      overlay.setAttribute("width", String(bbox.width))
      overlay.setAttribute("height", String(bbox.height))
    }

    overlay.setAttribute("fill", palette[index % palette.length])
    overlay.setAttribute("clip-path", `url(#${clipId})`)
    dotsGroup.appendChild(overlay)
    module.setAttribute("opacity", "0")
  })

  dotsGroup.setAttribute("data-qr-layer", "dot-palette")
}

function getAlignedCornerGradientRotation(
  gradient: NewQrCodeProps["finderInnerGradient"],
) {
  if (!gradient || gradient === "none" || gradient.type !== "linear") {
    return null
  }

  return gradient.rotation ?? 0
}

function alignCornerGradientDirection(
  svg: SVGElement,
  {
    gradientIdPrefix,
    rotation,
  }: {
    gradientIdPrefix: string
    rotation: number
  },
) {
  const descendants = Array.from(svg.querySelectorAll("*"))

  for (const gradient of descendants) {
    if (
      gradient.tagName.toLowerCase() !== "lineargradient" ||
      !gradient.getAttribute("id")?.startsWith(gradientIdPrefix)
    ) {
      continue
    }

    const gradientId = gradient.getAttribute("id")
    if (!gradientId) {
      continue
    }

    const fillRect = descendants.find(
      (element) =>
        element.tagName.toLowerCase() === "rect" &&
        element.getAttribute("fill") === `url(#${gradientId})`,
    )

    if (!(fillRect instanceof SVGGraphicsElement)) {
      continue
    }

    const bbox = fillRect.getBBox()
    const radians = ((rotation ?? 0) * Math.PI) / 180
    const centerX = bbox.x + bbox.width / 2
    const centerY = bbox.y + bbox.height / 2
    const halfDiagonal = Math.sqrt(bbox.width ** 2 + bbox.height ** 2) / 2

    gradient.setAttribute("x1", String(centerX - Math.cos(radians) * halfDiagonal))
    gradient.setAttribute("y1", String(centerY - Math.sin(radians) * halfDiagonal))
    gradient.setAttribute("x2", String(centerX + Math.cos(radians) * halfDiagonal))
    gradient.setAttribute("y2", String(centerY + Math.sin(radians) * halfDiagonal))
  }
}

function applyFinderGradientExtensions(svg: SVGElement, props: NewQrCodeProps) {
  const outerRotation = getAlignedCornerGradientRotation(props.finderOuterGradient)
  const innerRotation = getAlignedCornerGradientRotation(props.finderInnerGradient)

  if (outerRotation !== null) {
    alignCornerGradientDirection(svg, {
      gradientIdPrefix: "corners-square-color-",
      rotation: outerRotation,
    })
  }

  if (innerRotation !== null) {
    alignCornerGradientDirection(svg, {
      gradientIdPrefix: "corners-dot-color-",
      rotation: innerRotation,
    })
  }
}

export function applyPortableQrSvgExtensions(svg: SVGElement, props: NewQrCodeProps) {
  applyDotsGradientExtension(svg, props)
  applyDotsPaletteExtension(svg, props)
  applyFinderGradientExtensions(svg, props)
}
