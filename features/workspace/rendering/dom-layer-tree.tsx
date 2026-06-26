"use client"

import {
  memo,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"

import type { DomLayerNode } from "@new-qr/qr-scene-codegen"

function domLayerStyleToCss(properties: Record<string, string | number>): CSSProperties {
  return properties as CSSProperties
}

function parseModuleImageHtml(htmlContent?: string) {
  if (!htmlContent?.startsWith("<img")) {
    return null
  }

  const srcMatch = htmlContent.match(/\ssrc="([^"]+)"/)
  const styleMatch = htmlContent.match(/\sstyle="([^"]+)"/)
  if (!srcMatch) {
    return null
  }

  const style: Record<string, string | number> = {}
  if (styleMatch) {
    for (const rule of styleMatch[1].split(";")) {
      const [rawKey, rawValue] = rule.split(":")
      const key = rawKey?.trim()
      const value = rawValue?.trim()
      if (!key || !value) {
        continue
      }

      const camelKey = key.replace(/-([a-z])/g, (_match, char: string) => char.toUpperCase())
      const numeric = Number.parseFloat(value)
      style[camelKey] = value.endsWith("px") && Number.isFinite(numeric) ? numeric : value
    }
  }

  return {
    src: srcMatch[1],
    style: domLayerStyleToCss(style),
  }
}

const DomLayerNodeView = memo(function DomLayerNodeView({ node }: { node: DomLayerNode }) {
  const style = domLayerStyleToCss(node.style)

  if (node.children?.length) {
    return (
      <div style={style}>
        {node.children.map((child) => (
          <DomLayerNodeView key={child.id} node={child} />
        ))}
      </div>
    )
  }

  const moduleImage = parseModuleImageHtml(node.htmlContent)
  if (moduleImage) {
    return <img alt="" src={moduleImage.src} style={moduleImage.style} />
  }

  if (node.svgInner || node.htmlContent) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: node.svgInner ?? node.htmlContent ?? "" }}
        style={style}
      />
    )
  }

  if (node.content) {
    return <div style={style}>{node.content}</div>
  }

  return <div style={style} />
})

export const DomLayerTree = memo(function DomLayerTree({ nodes }: { nodes: DomLayerNode[] }) {
  return (
    <>
      {nodes.map((node) => (
        <DomLayerNodeView key={node.id} node={node} />
      ))}
    </>
  )
})

type ScalableDomLayerTreeProps = {
  layoutHeight: number
  layoutWidth: number
  nodes: DomLayerNode[]
}

/** Stretch module coordinates to fill the placement box like preserveAspectRatio="none" SVG. */
export const ScalableDomLayerTree = memo(function ScalableDomLayerTree({
  layoutHeight,
  layoutWidth,
  nodes,
}: ScalableDomLayerTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState({ x: 1, y: 1 })

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element || layoutWidth <= 0 || layoutHeight <= 0) {
      return
    }

    const updateScale = () => {
      const width = element.clientWidth
      const height = element.clientHeight
      if (width <= 0 || height <= 0) {
        return
      }

      const nextScale = {
        x: width / layoutWidth,
        y: height / layoutHeight,
      }

      setScale(nextScale)
    }

    updateScale()

    if (typeof ResizeObserver === "undefined") {
      return
    }

    const observer = new ResizeObserver(updateScale)
    observer.observe(element)

    return () => observer.disconnect()
  }, [layoutHeight, layoutWidth, nodes])

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <div
        style={{
          height: layoutHeight,
          position: "relative",
          transform: `scale(${scale.x}, ${scale.y})`,
          transformOrigin: "0 0",
          width: layoutWidth,
        }}
      >
        <DomLayerTree nodes={nodes} />
      </div>
    </div>
  )
})
