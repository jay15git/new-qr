"use client"

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react"
import { motion, useAnimationFrame } from "motion/react"

import { cn } from "@/lib/utils"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"

interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void
  unregisterElement: (id: string) => void
  registerWrapper: (id: string, element: HTMLDivElement) => void
  unregisterWrapper: (id: string) => void
  constraintsRef: React.RefObject<HTMLDivElement | null>
  bringToFront: (id: string) => void
  setDraggingElement: (id: string | null) => void
  dragElastic: number
}

const FloatingContext = createContext<FloatingContextType | null>(null)

interface FloatingProps {
  children: ReactNode
  className?: string
  sensitivity?: number
  easingFactor?: number
  dragElastic?: number
  selectedOnTop?: boolean
}

const Floating = ({
  children,
  className,
  sensitivity = 1,
  easingFactor = 0.05,
  dragElastic = 0.5,
  selectedOnTop = true,
  ...props
}: FloatingProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementsMap = useRef(
    new Map<
      string,
      {
        element: HTMLDivElement
        depth: number
        currentPosition: { x: number; y: number }
      }
    >()
  )
  const wrapperMap = useRef(new Map<string, HTMLDivElement>())
  const draggingIdRef = useRef<string | null>(null)
  const maxZIndexRef = useRef(10)
  const mousePositionRef = useMousePositionRef(containerRef)

  const registerElement = useCallback(
    (id: string, element: HTMLDivElement, depth: number) => {
      elementsMap.current.set(id, {
        element,
        depth,
        currentPosition: { x: 0, y: 0 },
      })
    },
    []
  )

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id)
  }, [])

  const registerWrapper = useCallback((id: string, element: HTMLDivElement) => {
    wrapperMap.current.set(id, element)
  }, [])

  const unregisterWrapper = useCallback((id: string) => {
    wrapperMap.current.delete(id)
  }, [])

  const bringToFront = useCallback(
    (id: string) => {
      if (!selectedOnTop) return

      maxZIndexRef.current += 1
      const wrapper = wrapperMap.current.get(id)
      if (wrapper) {
        wrapper.style.zIndex = String(maxZIndexRef.current)
      }
    },
    [selectedOnTop]
  )

  const setDraggingElement = useCallback((id: string | null) => {
    draggingIdRef.current = id
  }, [])

  useAnimationFrame(() => {
    if (!containerRef.current) return

    elementsMap.current.forEach((data, id) => {
      if (draggingIdRef.current === id) return

      const strength = (data.depth * sensitivity) / 20

      const newTargetX = mousePositionRef.current.x * strength
      const newTargetY = mousePositionRef.current.y * strength

      const dx = newTargetX - data.currentPosition.x
      const dy = newTargetY - data.currentPosition.y

      data.currentPosition.x += dx * easingFactor
      data.currentPosition.y += dy * easingFactor

      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`
    })
  })

  return (
    <FloatingContext.Provider
      value={{
        registerElement,
        unregisterElement,
        registerWrapper,
        unregisterWrapper,
        constraintsRef: containerRef,
        bringToFront,
        setDraggingElement,
        dragElastic,
      }}
    >
      <div
        ref={containerRef}
        className={cn("absolute top-0 left-0 size-full", className)}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export default Floating

interface FloatingElementProps {
  children: ReactNode
  className?: string
  depth?: number
  draggable?: boolean
  dragElastic?: number
}

export const FloatingElement = ({
  children,
  className,
  depth = 1,
  draggable = true,
  dragElastic,
}: FloatingElementProps) => {
  const innerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(Math.random().toString(36).substring(7))
  const context = useContext(FloatingContext)

  useEffect(() => {
    if (!innerRef.current || !context) return

    const nonNullDepth = depth ?? 0.01

    context.registerElement(idRef.current, innerRef.current, nonNullDepth)
    return () => context.unregisterElement(idRef.current)
  }, [context, depth])

  useEffect(() => {
    if (!dragRef.current || !context) return

    context.registerWrapper(idRef.current, dragRef.current)
    return () => context.unregisterWrapper(idRef.current)
  }, [context])

  if (!context) {
    return (
      <div className={cn("absolute", className)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={dragRef}
      drag={draggable}
      dragConstraints={context.constraintsRef}
      dragMomentum={false}
      dragElastic={dragElastic ?? context.dragElastic}
      dragPropagation={false}
      onDragStart={() => {
        context.bringToFront(idRef.current)
        context.setDraggingElement(idRef.current)
      }}
      onDragEnd={() => {
        context.setDraggingElement(null)
      }}
      whileDrag={{ cursor: "grabbing" }}
      className={cn(
        "absolute will-change-transform",
        draggable && "cursor-grab",
        className
      )}
    >
      <div ref={innerRef} className="will-change-transform">
        {children}
      </div>
    </motion.div>
  )
}
