"use client"

import { memo, useMemo } from "react"

import { renderNewQrSvg } from "../core/render-svg"
import type { NewQrCodeProps } from "../types"

export type { NewQrCodeProps, PortableQrConfig } from "../types"

export const NewQrCode = memo(function NewQrCode({
  className,
  style,
  ...props
}: NewQrCodeProps) {
  const svgMarkup = useMemo(
    () => renderNewQrSvg(props),
    [
      props.background,
      props.colorMode,
      props.finderInner,
      props.finderOuter,
      props.foreground,
      props.gradient,
      props.logo,
      props.margin,
      props.module,
      props.motion,
      props.motionPreset,
      props.palette,
      props.size,
      props.value,
    ],
  )

  return (
    <div
      className={className}
      data-slot="new-qr-code"
      style={{
        display: "block",
        height: "100%",
        width: "100%",
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  )
})
