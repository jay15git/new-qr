import type { ExtensionFunction } from "qr-code-styling"

import {
  getCustomDotShapeGeometry,
  type CustomDotShape,
} from "@/components/qr/custom-dot-shapes"

const SVG_NS = "http://www.w3.org/2000/svg"

export function createCustomDotShapeExtension(shape: CustomDotShape): ExtensionFunction {
  return (svg) => {
    const dotsClipPath = Array.from(svg.querySelectorAll("clipPath")).find((element) =>
      element.getAttribute("id")?.startsWith("clip-path-dot-color-"),
    )

    if (!dotsClipPath) {
      return
    }

    for (const child of Array.from(dotsClipPath.children)) {
      if (child.tagName.toLowerCase() !== "rect") {
        continue
      }

      const x = Number(child.getAttribute("x"))
      const y = Number(child.getAttribute("y"))
      const width = Number(child.getAttribute("width"))
      const height = Number(child.getAttribute("height"))

      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
        continue
      }

      const geometry = getCustomDotShapeGeometry(shape, x, y, Math.min(width, height))
      const path = svg.ownerDocument.createElementNS(SVG_NS, "path")
      path.setAttribute("d", geometry.d)
      path.setAttribute(
        "transform",
        `translate(${geometry.translateX} ${geometry.translateY}) scale(${geometry.scale})`,
      )

      dotsClipPath.replaceChild(path, child)
    }
  }
}
