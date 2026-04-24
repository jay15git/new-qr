import type { CornerDotType, CornerSquareType } from "qr-code-styling"

import {
  DOT_STYLE_PREVIEW_ROWS,
  isDotStylePreviewDark,
} from "@/components/qr/qr-style-preview"

export type StylePreviewKind = "corner-dot" | "corner-square" | "dots"

const PREVIEW_ICON_CLASS_NAME = "size-[5.5rem] text-foreground/80"
const CORNER_DOT_PREVIEW_ROWS = Object.freeze(["111", "111", "111"])
const CORNER_SQUARE_PREVIEW_ROWS = Object.freeze([
  "1111111",
  "1000001",
  "1000001",
  "1000001",
  "1000001",
  "1000001",
  "1111111",
])

export function StylePreview({
  previewKind,
  value,
}: {
  previewKind: StylePreviewKind
  value: string
}) {
  if (previewKind === "corner-dot") {
    return <CornerDotStylePreview value={value as CornerDotType} />
  }

  if (previewKind === "corner-square") {
    return <CornerSquareStylePreview value={value as CornerSquareType} />
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

function CornerDotStylePreview({
  value,
}: {
  value: CornerDotType
}) {
  const filledSize = 15
  const filledStart = (48 - filledSize) / 2
  const usesFilledShape =
    value === "dot" || value === "square" || value === "extra-rounded"

  return (
    <svg
      aria-hidden="true"
      className={PREVIEW_ICON_CLASS_NAME}
      data-preview-kind="corner-dot"
      data-preview-style={value}
      data-corner-dot-renderer={usesFilledShape ? "filled" : "grid"}
      data-slot="style-preview-corner-dot"
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      {usesFilledShape ? (
        <PreviewShape
          size={filledSize}
          slotName="style-preview-corner-dot-shape"
          value={value}
          x={filledStart}
          y={filledStart}
        />
      ) : (
        renderPreviewMatrix({
          rows: CORNER_DOT_PREVIEW_ROWS,
          size: 5,
          startX: 16.5,
          startY: 16.5,
          value,
        })
      )}
    </svg>
  )
}

function CornerSquareStylePreview({
  value,
}: {
  value: CornerSquareType
}) {
  const usesRingRenderer =
    value === "dot" || value === "square" || value === "extra-rounded"

  return (
    <svg
      aria-hidden="true"
      className={PREVIEW_ICON_CLASS_NAME}
      data-preview-kind="corner-square"
      data-preview-style={value}
      data-corner-square-renderer={usesRingRenderer ? "ring" : "grid"}
      data-slot="style-preview-corner-square"
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      {usesRingRenderer ? (
        <CornerSquareRing value={value} x={13.5} y={13.5} size={21} />
      ) : (
        <g data-slot="style-preview-corner-square-grid">
          {renderPreviewMatrix({
            rows: CORNER_SQUARE_PREVIEW_ROWS,
            size: 3,
            startX: 13.5,
            startY: 13.5,
            value,
          })}
        </g>
      )}
    </svg>
  )
}

function CornerSquareRing({
  value,
  x,
  y,
  size,
}: {
  value: CornerSquareType
  x: number
  y: number
  size: number
}) {
  const unit = size / 7

  switch (value) {
    case "dot":
      return (
        <path
          clipRule="evenodd"
          d={`M ${x + size / 2} ${y}a ${size / 2} ${size / 2} 0 1 0 0.1 0zm 0 ${unit}a ${size / 2 - unit} ${size / 2 - unit} 0 1 1 -0.1 0Z`}
          data-corner-frame-variant={value}
          data-slot="style-preview-corner-square-frame"
          fill="currentColor"
          fillRule="evenodd"
        />
      )
    case "extra-rounded":
      return (
        <path
          clipRule="evenodd"
          d={[
            `M ${x} ${y + 2.5 * unit}v ${2 * unit}a ${2.5 * unit} ${2.5 * unit}, 0, 0, 0, ${2.5 * unit} ${2.5 * unit}h ${2 * unit}a ${2.5 * unit} ${2.5 * unit}, 0, 0, 0, ${2.5 * unit} ${-2.5 * unit}v ${-2 * unit}a ${2.5 * unit} ${2.5 * unit}, 0, 0, 0, ${-2.5 * unit} ${-2.5 * unit}h ${-2 * unit}a ${2.5 * unit} ${2.5 * unit}, 0, 0, 0, ${-2.5 * unit} ${2.5 * unit}`,
            `M ${x + 2.5 * unit} ${y + unit}h ${2 * unit}a ${1.5 * unit} ${1.5 * unit}, 0, 0, 1, ${1.5 * unit} ${1.5 * unit}v ${2 * unit}a ${1.5 * unit} ${1.5 * unit}, 0, 0, 1, ${-1.5 * unit} ${1.5 * unit}h ${-2 * unit}a ${1.5 * unit} ${1.5 * unit}, 0, 0, 1, ${-1.5 * unit} ${-1.5 * unit}v ${-2 * unit}a ${1.5 * unit} ${1.5 * unit}, 0, 0, 1, ${1.5 * unit} ${-1.5 * unit}`,
          ].join("")}
          data-corner-frame-variant={value}
          data-slot="style-preview-corner-square-frame"
          fill="currentColor"
          fillRule="evenodd"
        />
      )
    case "square":
    default:
      return (
        <path
          clipRule="evenodd"
          d={`M ${x} ${y}v ${size}h ${size}v ${-size}zM ${x + unit} ${y + unit}h ${size - 2 * unit}v ${size - 2 * unit}h ${2 * unit - size}z`}
          data-corner-frame-variant={value}
          data-slot="style-preview-corner-square-frame"
          fill="currentColor"
          fillRule="evenodd"
        />
      )
  }
}

function renderPreviewMatrix({
  rows,
  size,
  startX,
  startY,
  value,
}: {
  rows: ReadonlyArray<string>
  size: number
  startX: number
  startY: number
  value: string
}) {
  return rows.flatMap((row, rowIndex) =>
    [...row].map((cell, columnIndex) => {
      if (cell !== "1") {
        return null
      }

      return (
        <MatrixPreviewShape
          key={`${value}-${rowIndex}-${columnIndex}`}
          columnIndex={columnIndex}
          isDark={(targetRow, targetColumn) =>
            rows[targetRow]?.[targetColumn] === "1"
          }
          rowIndex={rowIndex}
          size={size}
          value={value}
          x={startX + columnIndex * size}
          y={startY + rowIndex * size}
        />
      )
    }),
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
  if (value === "diamond" || value === "heart") {
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
    case "dots":
      return renderPreviewDotShape("dot", { size, x, y })
    case "rounded":
      return renderRoundedPreviewShape({ getNeighbor, size, x, y })
    case "extra-rounded":
      return renderExtraRoundedPreviewShape({ getNeighbor, size, x, y })
    case "classy":
      return renderClassyPreviewShape({ getNeighbor, size, x, y })
    case "classy-rounded":
      return renderClassyRoundedPreviewShape({ getNeighbor, size, x, y })
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
    case "dots":
    case "dot":
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
    case "extra-rounded":
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
    case "classy":
      return (
        <path
          data-slot={slotName}
          d={`M ${x + size * 0.16} ${y} H ${x + size} V ${y + size * 0.82} Q ${x + size * 0.92} ${y + size * 0.08} ${x + size * 0.16} ${y + size * 0.82} Z`}
          fill="currentColor"
        />
      )
    case "classy-rounded":
      return (
        <path
          data-slot={slotName}
          d={`M ${x + size * 0.22} ${y + size * 0.02} H ${x + size * 0.84} Q ${x + size} ${y + size * 0.02} ${x + size} ${y + size * 0.18} V ${y + size * 0.78} Q ${x + size * 0.86} ${y + size} ${x + size * 0.7} ${y + size} H ${x + size * 0.34} Q ${x + size * 0.04} ${y + size} ${x + size * 0.04} ${y + size * 0.7} V ${y + size * 0.28} Q ${x + size * 0.04} ${y + size * 0.08} ${x + size * 0.22} ${y + size * 0.02} Z`}
          fill="currentColor"
        />
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
  | "dot"
  | "side-rounded"
  | "square"

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
    return renderPreviewDotShape("dot", { size, x, y })
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

function renderExtraRoundedPreviewShape({
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
    return renderPreviewDotShape("dot", { size, x, y })
  }

  if (neighborCount > 2 || (left && right) || (up && down)) {
    return renderPreviewDotShape("square", { size, x, y })
  }

  if (neighborCount === 2) {
    const rotation =
      left && up ? Math.PI / 2 : up && right ? Math.PI : right && down ? -Math.PI / 2 : 0

    return renderPreviewDotShape("corner-extra-rounded", {
      rotation,
      size,
      x,
      y,
    })
  }

  const rotation = up ? Math.PI / 2 : right ? Math.PI : down ? -Math.PI / 2 : 0

  return renderPreviewDotShape("side-rounded", { rotation, size, x, y })
}

function renderClassyPreviewShape({
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

    return renderPreviewDotShape("corner-rounded", {
      rotation: Math.PI / 2,
      size,
      x,
      y,
    })
  }

  return renderPreviewDotShape("corner-rounded", {
    rotation: -Math.PI / 2,
    size,
    x,
    y,
  })
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
    case "dot":
      return (
        <circle
          cx={x + size / 2}
          cy={y + size / 2}
          data-slot="style-preview-native-module"
          fill="currentColor"
          r={size / 2}
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
