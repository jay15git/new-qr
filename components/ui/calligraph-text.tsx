"use client"

import { Calligraph } from "calligraph"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type CalligraphTextProps = {
  children: string
  className?: string
}

export function CalligraphText({ children, className }: CalligraphTextProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <>{children}</>
  }

  return (
    <Calligraph
      variant="text"
      animation="smooth"
      autoSize={false}
      className={cn("inline-flex", className)}
    >
      {children}
    </Calligraph>
  )
}
