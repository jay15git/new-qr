"use client"

import React, { ElementType, forwardRef, useMemo, useRef } from "react"
import { motion, useAnimationFrame } from "motion/react"

import { cn } from "@/lib/utils"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: ElementType
  fromFontVariationSettings: string
  toFontVariationSettings: string
  containerRef: React.RefObject<HTMLElement | null>
  radius?: number
  falloff?: "linear" | "exponential" | "gaussian"
}

const VariableFontCursorProximity = forwardRef<HTMLElement, TextProps>(
  (
    {
      children,
      as = "span",
      fromFontVariationSettings,
      toFontVariationSettings,
      containerRef,
      radius = 50,
      falloff = "linear",
      className,
      ...props
    },
    ref
  ) => {
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
    const interpolatedSettingsRef = useRef<string[]>([])
    const mousePositionRef = useMousePositionRef(containerRef)

    const parsedSettings = useMemo(() => {
      const fromSettings = new Map(
        fromFontVariationSettings
          .split(",")
          .map((s) => s.trim())
          .map((s) => {
            const [name, value] = s.split(" ")
            return [name.replace(/['"]/g, ""), parseFloat(value)]
          })
      )

      const toSettings = new Map(
        toFontVariationSettings
          .split(",")
          .map((s) => s.trim())
          .map((s) => {
            const [name, value] = s.split(" ")
            return [name.replace(/['"]/g, ""), parseFloat(value)]
          })
      )

      return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
        axis,
        fromValue,
        toValue: toSettings.get(axis) ?? fromValue,
      }))
    }, [fromFontVariationSettings, toFontVariationSettings])

    const calculateDistance = (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): number => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    }

    const calculateFalloff = (distance: number): number => {
      const normalizedDistance = Math.min(Math.max(1 - distance / radius, 0), 1)

      switch (falloff) {
        case "exponential":
          return Math.pow(normalizedDistance, 2)
        case "gaussian":
          return Math.exp(-Math.pow(distance / (radius / 2), 2) / 2)
        case "linear":
        default:
          return normalizedDistance
      }
    }

    const applyLetterSettings = (
      letterRef: HTMLSpanElement,
      settings: { axis: string; value: number }[]
    ) => {
      letterRef.style.fontVariationSettings = settings
        .map(({ axis, value }) => `'${axis}' ${value}`)
        .join(", ")

      const weight = settings.find(({ axis }) => axis === "wght")
      if (weight) {
        letterRef.style.fontWeight = String(Math.round(weight.value))
      }
    }

    const defaultSettings = parsedSettings.map(({ axis, fromValue }) => ({
      axis,
      value: fromValue,
    }))

    useAnimationFrame(() => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()

      letterRefs.current.forEach((letterRef, index) => {
        if (!letterRef) return

        const rect = letterRef.getBoundingClientRect()
        const letterCenterX = rect.left + rect.width / 2 - containerRect.left
        const letterCenterY = rect.top + rect.height / 2 - containerRect.top

        const distance = calculateDistance(
          mousePositionRef.current.x,
          mousePositionRef.current.y,
          letterCenterX,
          letterCenterY
        )

        if (distance >= radius) {
          applyLetterSettings(letterRef, defaultSettings)
          return
        }

        const falloffValue = calculateFalloff(distance)

        const interpolatedSettings = parsedSettings.map(
          ({ axis, fromValue, toValue }) => ({
            axis,
            value: fromValue + (toValue - fromValue) * falloffValue,
          })
        )

        interpolatedSettingsRef.current[index] = interpolatedSettings
          .map(({ axis, value }) => `'${axis}' ${value}`)
          .join(", ")
        applyLetterSettings(letterRef, interpolatedSettings)
      })
    })

    const words = String(children).split(" ")
    let letterIndex = 0

    const content = (
      <>
        {words.map((word, wordIndex) => (
          <span
            key={wordIndex}
            className="inline-block whitespace-nowrap"
            aria-hidden
          >
            {word.split("").map((letter) => {
              const currentLetterIndex = letterIndex++
              return (
                <motion.span
                  key={currentLetterIndex}
                  ref={(el: HTMLSpanElement | null) => {
                    letterRefs.current[currentLetterIndex] = el
                  }}
                  className="inline-block"
                  aria-hidden="true"
                  style={{
                    fontVariationSettings:
                      interpolatedSettingsRef.current[currentLetterIndex],
                  }}
                >
                  {letter}
                </motion.span>
              )
            })}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
        <span className="sr-only">{children}</span>
      </>
    )

    return React.createElement(
      as,
      {
        ref,
        className: cn(className),
        ...props,
        "data-text": children,
      },
      content
    )
  }
)

VariableFontCursorProximity.displayName = "VariableFontCursorProximity"
export default VariableFontCursorProximity
