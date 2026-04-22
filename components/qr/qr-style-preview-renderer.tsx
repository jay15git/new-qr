import type { CornerSquareType } from "qr-code-styling"

import {
  DOT_STYLE_PREVIEW_ROWS,
  getDotStylePreviewNeighbor,
  isDotStylePreviewDark,
} from "@/components/qr/qr-style-preview"

export type StylePreviewKind = "corner-dot" | "corner-square" | "dots"

export function StylePreview({
  previewKind,
  value,
}: {
  previewKind: StylePreviewKind
  value: string
}) {
  if (previewKind === "corner-square") {
    return <CornerSquareStylePreview value={value as CornerSquareType} />
  }

  if (previewKind !== "dots") {
    return <StyleIconPreview previewKind={previewKind} value={value} />
  }

  const modulePitch = 5.25
  const moduleSize = 4.85
  const start = 5.7

  return (
    <svg
      aria-hidden="true"
      className="size-16 text-foreground/80"
      fill="none"
      data-preview-kind={previewKind}
      data-preview-style={value}
      data-slot="style-preview-fragment"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill="currentColor"
        height={40}
        opacity={0.08}
        rx={12}
        width={40}
        x={4}
        y={4}
      />
      {DOT_STYLE_PREVIEW_ROWS.flatMap((row, rowIndex) =>
        [...row].map((_, columnIndex) => {
          if (!isDotStylePreviewDark(rowIndex, columnIndex)) {
            return null
          }

          return (
            <DotPreviewShape
              key={`${rowIndex}-${columnIndex}`}
              columnIndex={columnIndex}
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

function CornerSquareStylePreview({
  value,
}: {
  value: CornerSquareType
}) {
  const maskId = `corner-square-preview-mask-${value}`

  return (
    <svg
      aria-hidden="true"
      className="size-16 text-foreground/80"
      data-preview-kind="corner-square"
      data-preview-style={value}
      data-slot="style-preview-corner-square"
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill="currentColor"
        height={40}
        opacity={0.08}
        rx={12}
        width={40}
        x={4}
        y={4}
      />
      <defs>
        <mask id={maskId}>
          <rect fill="white" height={48} width={48} />
          <CornerSquareCutout value={value} />
        </mask>
      </defs>
      <g
        data-corner-frame-variant={value}
        data-slot="style-preview-corner-square-frame"
        fill="currentColor"
        mask={`url(#${maskId})`}
      >
        <CornerSquareFrame value={value} />
      </g>
    </svg>
  )
}

function CornerSquareFrame({
  value,
}: {
  value: CornerSquareType
}) {
  switch (value) {
    case "dot":
      return (
        <circle
          cx={24}
          cy={24}
          data-slot="style-preview-native-module"
          r={14}
        />
      )
    case "dots":
      return (
        <>
          {[
            [16, 12],
            [24, 10.5],
            [32, 12],
            [36, 16],
            [37.5, 24],
            [36, 32],
            [32, 36],
            [24, 37.5],
            [16, 36],
            [12, 32],
            [10.5, 24],
            [12, 16],
          ].map(([cx, cy], index) => (
            <circle
              key={`${value}-${index}`}
              cx={cx}
              cy={cy}
              data-slot="style-preview-native-module"
              r={3}
            />
          ))}
        </>
      )
    case "classy":
      return (
        <path
          data-slot="style-preview-native-module"
          d="M 12 10 H 31 Q 38 10 38 17 V 30 Q 38 38 30 38 H 17 Q 10 38 10 31 V 10 Z"
          fillRule="nonzero"
        />
      )
    case "classy-rounded":
      return (
        <path
          data-slot="style-preview-native-module"
          d="M 15 10.5 H 30 Q 37.5 10.5 37.5 18 V 30 Q 37.5 37.5 30 37.5 H 18 Q 10.5 37.5 10.5 30 V 15 Q 10.5 10.5 15 10.5 Z"
          fillRule="nonzero"
        />
      )
    case "rounded":
      return (
        <rect
          data-slot="style-preview-native-module"
          height={28}
          rx={7}
          width={28}
          x={10}
          y={10}
        />
      )
    case "extra-rounded":
      return (
        <rect
          data-slot="style-preview-native-module"
          height={28}
          rx={10}
          width={28}
          x={10}
          y={10}
        />
      )
    case "square":
    default:
      return (
        <rect
          data-slot="style-preview-native-module"
          height={28}
          rx={2.5}
          width={28}
          x={10}
          y={10}
        />
      )
  }
}

function CornerSquareCutout({
  value,
}: {
  value: CornerSquareType
}) {
  switch (value) {
    case "dot":
      return (
        <circle
          cx={24}
          cy={24}
          data-slot="style-preview-corner-square-cutout"
          fill="black"
          r={6.75}
        />
      )
    case "dots":
      return (
        <rect
          data-slot="style-preview-corner-square-cutout"
          fill="black"
          height={12}
          rx={3}
          width={12}
          x={18}
          y={18}
        />
      )
    case "classy":
      return (
        <path
          data-slot="style-preview-corner-square-cutout"
          d="M 19 17.5 H 27 Q 31 17.5 31 21.5 V 26 Q 31 30.5 26.5 30.5 H 21.5 Q 17 30.5 17 26 V 17.5 Z"
          fill="black"
        />
      )
    case "classy-rounded":
      return (
        <path
          data-slot="style-preview-corner-square-cutout"
          d="M 20 18 H 26 Q 30 18 30 22 V 26 Q 30 30 26 30 H 22 Q 18 30 18 26 V 20 Q 18 18 20 18 Z"
          fill="black"
        />
      )
    case "rounded":
      return (
        <rect
          data-slot="style-preview-corner-square-cutout"
          fill="black"
          height={12}
          rx={3.5}
          width={12}
          x={18}
          y={18}
        />
      )
    case "extra-rounded":
      return (
        <rect
          data-slot="style-preview-corner-square-cutout"
          fill="black"
          height={12}
          rx={5}
          width={12}
          x={18}
          y={18}
        />
      )
    case "square":
    default:
      return (
        <rect
          data-slot="style-preview-corner-square-cutout"
          fill="black"
          height={12}
          rx={1.5}
          width={12}
          x={18}
          y={18}
        />
      )
  }
}

function DotPreviewShape({
  columnIndex,
  rowIndex,
  size,
  value,
  x,
  y,
}: {
  columnIndex: number
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
    getDotStylePreviewNeighbor(rowIndex, columnIndex, offsetX, offsetY)

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

function StyleIconPreview({
  previewKind,
  value,
}: {
  previewKind: Exclude<StylePreviewKind, "dots">
  value: string
}) {
  return (
    <svg
      aria-hidden="true"
      className="size-16 text-foreground/80"
      data-preview-kind={previewKind}
      data-slot="style-preview-icon"
      data-preview-style={value}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <PreviewShape size={14} value={value} x={7} y={7} />
      <PreviewShape size={14} value={value} x={27} y={7} />
      <PreviewShape size={14} value={value} x={17} y={27} />
    </svg>
  )
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
