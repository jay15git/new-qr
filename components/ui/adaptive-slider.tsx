"use client"

import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

type OffsetHandle = "start" | "end"

type AdaptiveSliderProps = {
  className?: string
  compact?: boolean
  defaultValue?: number
  id?: string
  max?: number
  min?: number
  onChange?: (value: number) => void
  step?: number
  thumbColor?: string
  trackGradient?: string
  value?: number
}

type AdaptiveOffsetRangeSliderProps = {
  className?: string
  endColor: string
  endLabel?: string
  endValue: number
  id?: string
  label?: string
  max: number
  min: number
  onValueChange: (value: [number, number]) => void
  startColor: string
  startLabel?: string
  startValue: number
  step: number
  valueFormatter?: (value: number) => string
}

type MoveAdaptiveOffsetHandleArgs = {
  activeHandle: OffsetHandle
  endValue: number
  nextValue: number
  startValue: number
}

const DEFAULT_MIN = 0
const DEFAULT_MAX = 100
const DEFAULT_STEP = 1
const DEFAULT_SINGLE_VALUE = 50
const DEFAULT_TRACK_GRADIENT = "linear-gradient(90deg, #ef4f93 0%, #3730a3 100%)"
const DEFAULT_START_LABEL = "Start"
const DEFAULT_END_LABEL = "End"
const DECORATIVE_DOT_COUNT = 7

function clampAdaptiveValue(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

function getStepPrecision(step: number) {
  const normalizedStep = Math.abs(step)
  const stepString = normalizedStep.toString()

  if (stepString.includes("e-")) {
    return Number(stepString.split("e-")[1] ?? 0)
  }

  return stepString.split(".")[1]?.length ?? 0
}

function snapAdaptiveValue(value: number, min: number, max: number, step: number) {
  const safeStep = step > 0 ? step : 1
  const precision = getStepPrecision(safeStep)
  const clampedValue = clampAdaptiveValue(value, min, max)
  const steppedValue = min + Math.round((clampedValue - min) / safeStep) * safeStep

  return Number(clampAdaptiveValue(steppedValue, min, max).toFixed(precision))
}

function toAdaptivePercent(value: number, min: number, max: number) {
  if (max <= min) {
    return 0
  }

  return ((value - min) / (max - min)) * 100
}

function formatAdaptiveValue(value: number) {
  return value.toFixed(2)
}

function getAdaptiveValueFromPointer(
  clientX: number,
  rect: DOMRect,
  min: number,
  max: number,
  step: number,
) {
  if (rect.width <= 0) {
    return min
  }

  const offset = Math.min(rect.width, Math.max(0, clientX - rect.left))
  const rawValue = min + (offset / rect.width) * (max - min)

  return snapAdaptiveValue(rawValue, min, max, step)
}

function pickClosestAdaptiveHandle(
  startValue: number,
  endValue: number,
  nextValue: number,
): OffsetHandle {
  return Math.abs(nextValue - startValue) <= Math.abs(nextValue - endValue) ? "start" : "end"
}

export function buildAdaptiveTrackGradient(startColor: string, endColor: string) {
  return `linear-gradient(90deg, ${startColor} 0%, ${endColor} 100%)`
}

export function moveAdaptiveOffsetHandle({
  activeHandle,
  endValue,
  nextValue,
  startValue,
}: MoveAdaptiveOffsetHandleArgs) {
  if (activeHandle === "start") {
    if (nextValue <= endValue) {
      return {
        values: [nextValue, endValue] as [number, number],
        activeHandle,
      }
    }

    return {
      values: [endValue, nextValue] as [number, number],
      activeHandle: "end" as const,
    }
  }

  if (nextValue >= startValue) {
    return {
      values: [startValue, nextValue] as [number, number],
      activeHandle,
    }
  }

  return {
    values: [nextValue, startValue] as [number, number],
    activeHandle: "start" as const,
  }
}

export function AdaptiveSlider({
  className,
  compact = true,
  defaultValue = DEFAULT_SINGLE_VALUE,
  id,
  max = DEFAULT_MAX,
  min = DEFAULT_MIN,
  onChange,
  step = DEFAULT_STEP,
  thumbColor = "#ef4f93",
  trackGradient = DEFAULT_TRACK_GRADIENT,
  value,
}: AdaptiveSliderProps) {
  const fallbackId = useId()
  const sliderId = id ?? fallbackId
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = clampAdaptiveValue(value ?? internalValue, min, max)
  const currentPercent = toAdaptivePercent(currentValue, min, max)

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = snapAdaptiveValue(Number(event.target.value), min, max, step)

    setInternalValue(nextValue)
    onChange?.(nextValue)
  }

  return (
    <div
      data-slot="adaptive-slider"
      className={cn("relative w-full select-none", compact ? "py-2" : "py-3", className)}
    >
      <div className="relative flex h-14 w-full items-center overflow-visible">
        <SliderDecorativeTrack gradient={trackGradient} />
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleSliderChange}
          className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        />
        <motion.div
          data-slot="adaptive-slider-thumb"
          className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          animate={{ left: `${currentPercent}%` }}
          transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
        >
          <SliderThumb accentColor={thumbColor} />
        </motion.div>
      </div>
    </div>
  )
}

export function AdaptiveOffsetRangeSlider({
  className,
  endColor,
  endLabel = DEFAULT_END_LABEL,
  endValue,
  id,
  label,
  max,
  min,
  onValueChange,
  startColor,
  startLabel = DEFAULT_START_LABEL,
  startValue,
  step,
  valueFormatter = formatAdaptiveValue,
}: AdaptiveOffsetRangeSliderProps) {
  const fallbackId = useId()
  const sliderId = id ?? fallbackId
  const displayStart = startValue <= endValue ? startValue : endValue
  const displayEnd = startValue <= endValue ? endValue : startValue
  const displayValues = [displayStart, displayEnd] as [number, number]
  const startPercent = toAdaptivePercent(displayStart, min, max)
  const endPercent = toAdaptivePercent(displayEnd, min, max)
  const trackRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const dragHandleRef = useRef<OffsetHandle | null>(null)
  const latestStateRef = useRef({
    displayValues: [displayStart, displayEnd] as [number, number],
    max,
    min,
    onValueChange,
    step,
  })
  const [activeHandle, setActiveHandle] = useState<OffsetHandle>("start")
  const [isDragging, setIsDragging] = useState(false)
  const trackGradient = buildAdaptiveTrackGradient(startColor, endColor)

  useEffect(() => {
    latestStateRef.current = {
      displayValues: [displayStart, displayEnd] as [number, number],
      max,
      min,
      onValueChange,
      step,
    }
  }, [displayEnd, displayStart, max, min, onValueChange, step])

  const applyMove = (handle: OffsetHandle, nextValue: number) => {
    const currentState = latestStateRef.current
    const snappedValue = snapAdaptiveValue(
      nextValue,
      currentState.min,
      currentState.max,
      currentState.step,
    )
    const nextState = moveAdaptiveOffsetHandle({
      startValue: currentState.displayValues[0],
      endValue: currentState.displayValues[1],
      activeHandle: handle,
      nextValue: snappedValue,
    })

    dragHandleRef.current = nextState.activeHandle
    setActiveHandle(nextState.activeHandle)
    currentState.onValueChange(nextState.values)
  }

  const beginDrag = (
    handle: OffsetHandle,
    pointerId: number,
    nextValue?: number,
  ) => {
    pointerIdRef.current = pointerId
    dragHandleRef.current = handle
    setActiveHandle(handle)
    setIsDragging(true)

    if (typeof nextValue === "number") {
      applyMove(handle, nextValue)
    }
  }

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    const track = trackRef.current

    if (!track) {
      return
    }

    event.preventDefault()

    const nextValue = getAdaptiveValueFromPointer(event.clientX, track.getBoundingClientRect(), min, max, step)
    const nextHandle = pickClosestAdaptiveHandle(displayValues[0], displayValues[1], nextValue)

    beginDrag(nextHandle, event.pointerId, nextValue)
  }

  const handleThumbPointerDown =
    (handle: OffsetHandle) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      beginDrag(handle, event.pointerId)
    }

  const handleInputChange =
    (handle: OffsetHandle) => (event: ChangeEvent<HTMLInputElement>) => {
      applyMove(handle, Number(event.target.value))
    }

  useEffect(() => {
    if (!isDragging) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== null && event.pointerId !== pointerIdRef.current) {
        return
      }

      const track = trackRef.current
      const currentHandle = dragHandleRef.current
      const currentState = latestStateRef.current

      if (!track || !currentHandle) {
        return
      }

      event.preventDefault()

      applyMove(
        currentHandle,
        getAdaptiveValueFromPointer(
          event.clientX,
          track.getBoundingClientRect(),
          currentState.min,
          currentState.max,
          currentState.step,
        ),
      )
    }

    const stopDragging = (event: PointerEvent) => {
      if (pointerIdRef.current !== null && event.pointerId !== pointerIdRef.current) {
        return
      }

      pointerIdRef.current = null
      dragHandleRef.current = null
      setIsDragging(false)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", stopDragging)
    window.addEventListener("pointercancel", stopDragging)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", stopDragging)
      window.removeEventListener("pointercancel", stopDragging)
    }
  }, [isDragging])

  return (
    <div
      data-slot="adaptive-offset-range-slider"
      data-active-handle={activeHandle}
      className={cn("w-full select-none", className)}
    >
      {(label || startLabel || endLabel) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {label ? <span className="text-sm font-medium">{label}</span> : <span />}
          <div className="flex flex-wrap items-center gap-2">
            <ValueChip label={startLabel} value={valueFormatter(displayValues[0])} />
            <ValueChip label={endLabel} value={valueFormatter(displayValues[1])} />
          </div>
        </div>
      )}

      <div className="relative flex h-16 w-full items-center overflow-visible">
        <div
          ref={trackRef}
          data-slot="adaptive-offset-track"
          className="relative h-full w-full touch-none"
          onPointerDown={handleTrackPointerDown}
        >
          <SliderDecorativeTrack gradient={trackGradient} />

          <motion.div
            data-slot="adaptive-offset-thumb"
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            animate={{ left: `${startPercent}%` }}
            transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
          >
            <button
              type="button"
              aria-label={`${startLabel} offset`}
              aria-pressed={activeHandle === "start"}
              onPointerDown={handleThumbPointerDown("start")}
              className="cursor-grab touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:cursor-grabbing"
            >
              <SliderThumb accentColor={startColor} isActive={activeHandle === "start"} />
            </button>
          </motion.div>

          <motion.div
            data-slot="adaptive-offset-thumb"
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            animate={{ left: `${endPercent}%` }}
            transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
          >
            <button
              type="button"
              aria-label={`${endLabel} offset`}
              aria-pressed={activeHandle === "end"}
              onPointerDown={handleThumbPointerDown("end")}
              className="cursor-grab touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:cursor-grabbing"
            >
              <SliderThumb accentColor={endColor} isActive={activeHandle === "end"} />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="sr-only">
        <label htmlFor={`${sliderId}-start`}>{`${startLabel} offset`}</label>
        <input
          id={`${sliderId}-start`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValues[0]}
          onChange={handleInputChange("start")}
        />
        <label htmlFor={`${sliderId}-end`}>{`${endLabel} offset`}</label>
        <input
          id={`${sliderId}-end`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValues[1]}
          onChange={handleInputChange("end")}
        />
      </div>
    </div>
  )
}

function SliderDecorativeTrack({ gradient }: { gradient: string }) {
  return (
    <>
      <div className="absolute inset-x-3 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full border border-black/5 bg-[#eceff3] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{ background: gradient }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-7 top-1/2 flex -translate-y-1/2 items-center justify-between">
        {Array.from({ length: DECORATIVE_DOT_COUNT }).map((_, index) => (
          <span
            key={index}
            className="size-1.5 rounded-full bg-white/55 shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
          />
        ))}
      </div>
    </>
  )
}

function SliderThumb({
  accentColor,
  isActive = false,
}: {
  accentColor: string
  isActive?: boolean
}) {
  return (
    <span
      className={cn(
        "flex size-14 items-center justify-center rounded-full border border-black/12 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-transform",
        isActive && "scale-[1.03]",
      )}
    >
      <span
        className="size-7 rounded-full border border-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"
        style={{ backgroundColor: accentColor }}
      />
    </span>
  )
}

function ValueChip({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground">{label}</span>
      <span>{value}</span>
    </span>
  )
}
