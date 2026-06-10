import {
  DOT_STYLE_PREVIEW_ROWS,
  isDotStylePreviewDark,
} from "@/components/qr/qr-style-preview"

export type StylePreviewKind = "corner-dot" | "corner-square" | "dots"

const PREVIEW_ICON_CLASS_NAME = "size-[5.5rem] text-foreground/80 dark:text-white"
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
    return <CornerDotStylePreview value={value} />
  }

  if (previewKind === "corner-square") {
    return <CornerSquareStylePreview value={value} />
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
  value: string
}) {
  const filledSize = 15
  const filledStart = (48 - filledSize) / 2
  const usesFilledShape =
    value === "circle" ||
    value === "diamond" ||
    value === "hashtag" ||
    value === "heart" ||
    value === "microchip" ||
    value === "square" ||
    value === "star"

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
  value: string
}) {
  const usesRingRenderer =
    value === "circle" ||
    value === "rounded" ||
    value === "rounded-lg" ||
    value === "rounded-sm" ||
    value === "square"

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
  value: string
  x: number
  y: number
  size: number
}) {
  const unit = size / 7

  switch (value) {
    case "circle":
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
    case "rounded-lg":
    case "rounded":
    case "rounded-sm":
      {
        const radiusFactor = value === "rounded-lg" ? 2.5 : value === "rounded" ? 1.5 : 0.75
        return (
          <path
            clipRule="evenodd"
            d={[
              `M ${x} ${y + radiusFactor * unit}v ${size - 2 * radiusFactor * unit}a ${radiusFactor * unit} ${radiusFactor * unit}, 0, 0, 0, ${radiusFactor * unit} ${radiusFactor * unit}h ${size - 2 * radiusFactor * unit}a ${radiusFactor * unit} ${radiusFactor * unit}, 0, 0, 0, ${radiusFactor * unit} ${-radiusFactor * unit}v ${2 * radiusFactor * unit - size}a ${radiusFactor * unit} ${radiusFactor * unit}, 0, 0, 0, ${-radiusFactor * unit} ${-radiusFactor * unit}h ${2 * radiusFactor * unit - size}a ${radiusFactor * unit} ${radiusFactor * unit}, 0, 0, 0, ${-radiusFactor * unit} ${radiusFactor * unit}`,
              `M ${x + 2 * unit} ${y + 2 * unit}h ${3 * unit}v ${3 * unit}h ${-3 * unit}z`,
            ].join("")}
            data-corner-frame-variant={value}
            data-slot="style-preview-corner-square-frame"
            fill="currentColor"
            fillRule="evenodd"
          />
        )
      }
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
