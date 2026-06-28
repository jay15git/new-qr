import type { SVGProps } from "react"

import { ReactQRCode } from "@lglab/react-qr-code"

import {
  buildCustomCornerDotTransform,
  getCustomCornerDotShapeGeometry,
  isCustomCornerDotShape,
  type CustomCornerDotShape,
} from "@/features/qr-code/styles/custom-corner-dot-shapes"
import {
  DOT_STYLE_PREVIEW_ROWS,
  isDotStylePreviewDark,
} from "@/features/qr-code/styles/style-preview"

export type StylePreviewKind = "corner-dot" | "corner-square" | "dots"

const PREVIEW_ICON_CLASS_NAME = "size-[5.5rem] text-foreground/80 dark:text-white"
const FINDER_FRAME_PREVIEW_VIEW_BOX = "0 0 7 7"
// The library draws several inner styles larger than the 3x3 finder cell (star at
// 1.2x, diamond as a rotated inset square). A strict 2 2 3 3 crop clips their
// tips and reads as blunt corners in the option tiles.
const FINDER_DOT_PREVIEW_VIEW_BOX = "1.65 1.65 3.7 3.7"
const FINDER_PREVIEW_SIZE = 64
// Matches @lglab/react-qr-code inner finder placement with marginSize={0}.
const FINDER_DOT_PREVIEW_ORIGIN = 2

export function StylePreview({
  color,
  frameColor,
  frameStyle,
  previewKind,
  value,
}: {
  color?: string
  frameColor?: string
  frameStyle?: string
  previewKind: StylePreviewKind
  value: string
}) {
  if (previewKind === "corner-dot") {
    return <CornerDotStylePreview color={color} value={value} />
  }

  if (previewKind === "corner-square") {
    return <CornerFrameStylePreview color={color} value={value} />
  }

  const modulePitch = 4
  const moduleSize = 4
  const start = 6

  return (
    <svg
      aria-hidden="true"
      className={PREVIEW_ICON_CLASS_NAME}
      fill="none"
      data-preview-kind={previewKind}
      data-preview-style={value}
      data-preview-fragment-size={DOT_STYLE_PREVIEW_ROWS.length}
      data-preview-module-pitch={modulePitch}
      data-preview-module-size={moduleSize}
      data-slot="style-preview-fragment"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      {DOT_STYLE_PREVIEW_ROWS.flatMap((row, rowIndex) =>
        [...row].map((_, columnIndex) => {
          if (!isDotStylePreviewDark(rowIndex, columnIndex)) {
            return null
          }

          return (
            <MatrixPreviewShape
              key={`${rowIndex}-${columnIndex}`}
              columnIndex={columnIndex}
              isDark={isDotStylePreviewDark}
              rowIndex={rowIndex}
              size={moduleSize}
              value={value}
              x={start + columnIndex * modulePitch}
              y={start + rowIndex * modulePitch}
            />
          )
        }),
      )}
    </svg>
  )
}

function FinderPatternPreview({
  finderPatternInnerSettings,
  finderPatternOuterSettings,
  previewKind,
  rendererDataAttribute,
  slotName,
  style,
  viewBox,
}: {
  finderPatternInnerSettings: { color: string; style: never }
  finderPatternOuterSettings: { color: string; style: never }
  previewKind: "corner-dot" | "corner-square"
  rendererDataAttribute: "data-corner-dot-renderer" | "data-corner-frame-renderer"
  slotName: "style-preview-corner-dot" | "style-preview-corner-square"
  style: string
  viewBox: string
}) {
  return (
    <ReactQRCode
      background="transparent"
      boostLevel
      finderPatternInnerSettings={finderPatternInnerSettings}
      finderPatternOuterSettings={finderPatternOuterSettings}
      level="L"
      marginSize={0}
      minVersion={1}
      size={FINDER_PREVIEW_SIZE}
      svgProps={
        {
          "aria-hidden": "true",
          className: PREVIEW_ICON_CLASS_NAME,
          [rendererDataAttribute]: "real-qr",
          "data-preview-kind": previewKind,
          "data-preview-style": style,
          "data-slot": slotName,
          viewBox,
        } as SVGProps<SVGSVGElement>
      }
      value="hi"
    />
  )
}

function CornerDotStylePreview({
  color,
  value,
}: {
  color?: string
  value: string
}) {
  const previewColor = color ?? "currentColor"

  if (isCustomCornerDotShape(value)) {
    return (
      <CustomCornerDotStylePreview
        color={previewColor}
        shape={value}
        value={value}
      />
    )
  }

  return (
    <FinderPatternPreview
      finderPatternInnerSettings={{ color: previewColor, style: value as never }}
      finderPatternOuterSettings={{ color: "transparent", style: "square" as never }}
      previewKind="corner-dot"
      rendererDataAttribute="data-corner-dot-renderer"
      slotName="style-preview-corner-dot"
      style={value}
      viewBox={FINDER_DOT_PREVIEW_VIEW_BOX}
    />
  )
}

function CustomCornerDotStylePreview({
  color,
  shape,
  value,
}: {
  color: string
  shape: CustomCornerDotShape
  value: string
}) {
  const geometry = getCustomCornerDotShapeGeometry(
    shape,
    FINDER_DOT_PREVIEW_ORIGIN,
    FINDER_DOT_PREVIEW_ORIGIN,
    3,
  )

  return (
    <svg
      aria-hidden="true"
      className={PREVIEW_ICON_CLASS_NAME}
      data-corner-dot-renderer="custom-path"
      data-preview-kind="corner-dot"
      data-preview-style={value}
      data-slot="style-preview-corner-dot"
      fill="none"
      viewBox={FINDER_DOT_PREVIEW_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={geometry.d}
        fill={color}
        fillRule={geometry.fillRule}
        transform={buildCustomCornerDotTransform(geometry)}
      />
    </svg>
  )
}

function CornerFrameStylePreview({
  color,
  value,
}: {
  color?: string
  value: string
}) {
  const previewColor = color ?? "currentColor"

  return (
    <FinderPatternPreview
      finderPatternInnerSettings={{ color: "transparent", style: "square" as never }}
      finderPatternOuterSettings={{ color: previewColor, style: value as never }}
      previewKind="corner-square"
      rendererDataAttribute="data-corner-frame-renderer"
      slotName="style-preview-corner-square"
      style={value}
      viewBox={FINDER_FRAME_PREVIEW_VIEW_BOX}
    />
  )
}

function MatrixPreviewShape({
  columnIndex,
  isDark,
  rowIndex,
  size,
  value,
  x,
  y,
}: {
  columnIndex: number
  isDark: (rowIndex: number, columnIndex: number) => boolean
  rowIndex: number
  size: number
  value: string
  x: number
  y: number
}) {
  if (value === "diamond" || value === "heart" || value === "star" || value === "hashtag") {
    return (
      <PreviewShape
        size={size}
        slotName="style-preview-custom-module"
        value={value}
        x={x}
        y={y}
      />
    )
  }

  const getNeighbor = (offsetX: number, offsetY: number) =>
    isDark(rowIndex + offsetY, columnIndex + offsetX)

  switch (value) {
    case "circle":
      return renderPreviewDotShape("circle", { size, x, y })
    case "rounded":
      return renderRoundedPreviewShape({ getNeighbor, size, x, y })
    case "leaf":
      return renderClassyRoundedPreviewShape({ getNeighbor, size, x, y })
    case "pinched-square":
      return renderPreviewDotShape("corners-rounded", { size, x, y })
    case "square-sm":
      return renderPreviewDotShape("small-square", { size, x, y })
    case "vertical-line":
      return renderPreviewDotShape("vertical-line", { size, x, y })
    case "horizontal-line":
      return renderPreviewDotShape("horizontal-line", { size, x, y })
    case "circuit-board":
      return renderPreviewDotShape("circuit-board", { size, x, y })
    case "square":
    default:
      return renderPreviewDotShape("square", { size, x, y })
  }
}

function PreviewShape({
  size,
  slotName = "style-preview-module",
  value,
  x,
  y,
}: {
  size: number
  slotName?: string
  value: string
  x: number
  y: number
}) {
  switch (value) {
    case "circle":
      return (
        <circle
          cx={x + size / 2}
          cy={y + size / 2}
          data-slot={slotName}
          fill="currentColor"
          r={size / 2}
        />
      )
    case "rounded":
      return (
        <rect
          data-slot={slotName}
          fill="currentColor"
          height={size}
          rx={size * 0.3}
          width={size}
          x={x}
          y={y}
        />
      )
    case "rounded-lg":
      return (
        <rect
          data-slot={slotName}
          fill="currentColor"
          height={size}
          rx={size * 0.48}
          width={size}
          x={x}
          y={y}
        />
      )
    case "diamond":
      return (
        <path
          data-slot={slotName}
          d={`M ${x + size / 2} ${y} L ${x + size} ${y + size / 2} L ${x + size / 2} ${y + size} L ${x} ${y + size / 2} Z`}
          fill="currentColor"
        />
      )
    case "heart":
      return (
        <path
          data-slot={slotName}
          d={buildHeartPath(x, y, size)}
          fill="currentColor"
        />
      )
    case "star":
      return (
        <path
          data-slot={slotName}
          d={`M ${x + size * 0.5} ${y} L ${x + size * 0.62} ${y + size * 0.36} H ${x + size} L ${x + size * 0.69} ${y + size * 0.58} L ${x + size * 0.82} ${y + size} L ${x + size * 0.5} ${y + size * 0.74} L ${x + size * 0.18} ${y + size} L ${x + size * 0.31} ${y + size * 0.58} L ${x} ${y + size * 0.36} H ${x + size * 0.38} Z`}
          fill="currentColor"
        />
      )
    case "hashtag":
      return (
        <g
          data-slot={slotName}
          fill="currentColor"
        >
          <rect height={size} width={size * 0.22} x={x + size * 0.22} y={y} />
          <rect height={size} width={size * 0.22} x={x + size * 0.58} y={y} />
          <rect height={size * 0.22} width={size} x={x} y={y + size * 0.22} />
          <rect height={size * 0.22} width={size} x={x} y={y + size * 0.58} />
        </g>
      )
    case "square":
    default:
      return (
        <rect
          data-slot={slotName}
          fill="currentColor"
          height={size}
          rx={size * 0.12}
          width={size}
          x={x}
          y={y}
        />
      )
  }
}

type PreviewDotShapeKind =
  | "corner-extra-rounded"
  | "corner-rounded"
  | "corners-rounded"
  | "circle"
  | "circuit-board"
  | "horizontal-line"
  | "side-rounded"
  | "small-square"
  | "square"
  | "vertical-line"

function renderRoundedPreviewShape({
  getNeighbor,
  size,
  x,
  y,
}: {
  getNeighbor: (offsetX: number, offsetY: number) => boolean
  size: number
  x: number
  y: number
}) {
  const left = getNeighbor(-1, 0)
  const right = getNeighbor(1, 0)
  const up = getNeighbor(0, -1)
  const down = getNeighbor(0, 1)
  const neighborCount = Number(left) + Number(right) + Number(up) + Number(down)

  if (neighborCount === 0) {
    return renderPreviewDotShape("circle", { size, x, y })
  }

  if (neighborCount > 2 || (left && right) || (up && down)) {
    return renderPreviewDotShape("square", { size, x, y })
  }

  if (neighborCount === 2) {
    const rotation =
      left && up ? Math.PI / 2 : up && right ? Math.PI : right && down ? -Math.PI / 2 : 0

    return renderPreviewDotShape("corner-rounded", { rotation, size, x, y })
  }

  const rotation = up ? Math.PI / 2 : right ? Math.PI : down ? -Math.PI / 2 : 0

  return renderPreviewDotShape("side-rounded", { rotation, size, x, y })
}

function renderClassyRoundedPreviewShape({
  getNeighbor,
  size,
  x,
  y,
}: {
  getNeighbor: (offsetX: number, offsetY: number) => boolean
  size: number
  x: number
  y: number
}) {
  const left = getNeighbor(-1, 0)
  const right = getNeighbor(1, 0)
  const up = getNeighbor(0, -1)
  const down = getNeighbor(0, 1)

  if (!left && !right && !up && !down) {
    return renderPreviewDotShape("corners-rounded", {
      rotation: Math.PI / 2,
      size,
      x,
      y,
    })
  }

  if (left || up) {
    if (right || down) {
      return renderPreviewDotShape("square", { size, x, y })
    }

    return renderPreviewDotShape("corner-extra-rounded", {
      rotation: Math.PI / 2,
      size,
      x,
      y,
    })
  }

  return renderPreviewDotShape("corner-extra-rounded", {
    rotation: -Math.PI / 2,
    size,
    x,
    y,
  })
}

function renderPreviewDotShape(
  kind: PreviewDotShapeKind,
  {
    rotation = 0,
    size,
    x,
    y,
  }: {
    rotation?: number
    size: number
    x: number
    y: number
  },
) {
  switch (kind) {
    case "circle":
      return (
        <circle
          cx={x + size / 2}
          cy={y + size / 2}
          data-slot="style-preview-native-module"
          fill="currentColor"
          r={size / 2}
        />
      )
    case "small-square":
      return (
        <rect
          data-slot="style-preview-native-module"
          fill="currentColor"
          height={size * 0.72}
          width={size * 0.72}
          x={x + size * 0.14}
          y={y + size * 0.14}
        />
      )
    case "vertical-line":
      return (
        <rect
          data-slot="style-preview-native-module"
          fill="currentColor"
          height={size}
          rx={size * 0.2}
          width={size * 0.45}
          x={x + size * 0.275}
          y={y}
        />
      )
    case "horizontal-line":
      return (
        <rect
          data-slot="style-preview-native-module"
          fill="currentColor"
          height={size * 0.45}
          rx={size * 0.2}
          width={size}
          x={x}
          y={y + size * 0.275}
        />
      )
    case "circuit-board":
      return (
        <rect
          data-slot="style-preview-native-module"
          fill="currentColor"
          height={size * 0.62}
          rx={size * 0.18}
          width={size * 0.62}
          x={x + size * 0.19}
          y={y + size * 0.19}
        />
      )
    case "square":
      return (
        <rect
          data-slot="style-preview-native-module"
          fill="currentColor"
          height={size}
          width={size}
          x={x}
          y={y}
        />
      )
    case "side-rounded":
      return renderPreviewPath(
        `M ${x} ${y}v ${size}h ${size / 2}a ${size / 2} ${size / 2}, 0, 0, 0, 0 ${-size}`,
        { rotation, size, x, y },
      )
    case "corner-rounded":
      return renderPreviewPath(
        `M ${x} ${y}v ${size}h ${size}v ${-size / 2}a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}`,
        { rotation, size, x, y },
      )
    case "corner-extra-rounded":
      return renderPreviewPath(
        `M ${x} ${y}v ${size}h ${size}a ${size} ${size}, 0, 0, 0, ${-size} ${-size}`,
        { rotation, size, x, y },
      )
    case "corners-rounded":
      return renderPreviewPath(
        `M ${x} ${y}v ${size / 2}a ${size / 2} ${size / 2}, 0, 0, 0, ${size / 2} ${size / 2}h ${size / 2}v ${-size / 2}a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}`,
        { rotation, size, x, y },
      )
  }
}

function renderPreviewPath(
  d: string,
  {
    rotation = 0,
    size,
    x,
    y,
  }: {
    rotation?: number
    size: number
    x: number
    y: number
  },
) {
  const centerX = x + size / 2
  const centerY = y + size / 2

  return (
    <path
      data-slot="style-preview-native-module"
      d={d}
      fill="currentColor"
      transform={`rotate(${(rotation * 180) / Math.PI}, ${centerX}, ${centerY})`}
    />
  )
}

function buildHeartPath(x: number, y: number, size: number) {
  const top = y + size * 0.25
  const bottom = y + size
  const left = x
  const right = x + size
  const center = x + size / 2

  return [
    `M ${center} ${bottom}`,
    `C ${center - size * 0.55} ${y + size * 0.62}, ${left} ${y + size * 0.35}, ${left} ${top}`,
    `C ${left} ${y - size * 0.02}, ${center - size * 0.18} ${y - size * 0.04}, ${center} ${y + size * 0.2}`,
    `C ${center + size * 0.18} ${y - size * 0.04}, ${right} ${y - size * 0.02}, ${right} ${top}`,
    `C ${right} ${y + size * 0.35}, ${center + size * 0.55} ${y + size * 0.62}, ${center} ${bottom}`,
    "Z",
  ].join(" ")
}
