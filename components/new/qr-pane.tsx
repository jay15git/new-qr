"use client"

import { useEffect, useRef, useState } from "react"

import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import type { QrStudioState } from "@/components/qr/qr-studio-state"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type QrPaneProps = {
  state: QrStudioState
  isSelected: boolean
  isResizeActive: boolean
  onSelect: () => void
  onQrClick: () => void
  onSizeChange: (size: number) => void
}

export function QrPane({
  state,
  isSelected,
  isResizeActive,
  onSelect,
  onQrClick,
  onSizeChange,
}: QrPaneProps) {
  const [markup, setMarkup] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const requestRef = useRef(0)

  useEffect(() => {
    const requestId = ++requestRef.current

    void buildDashboardQrNodePayload(state)
      .then((payload) => {
        if (requestRef.current !== requestId) return
        setMarkup(payload.markup)
        setHasError(false)
      })
      .catch(() => {
        if (requestRef.current !== requestId) return
        setMarkup(null)
        setHasError(true)
      })
  }, [state])

  const isLoading = markup === null && !hasError

  return (
    <div
      data-slot="qr-pane"
      data-selected={isSelected ? "true" : "false"}
      data-resize-active={isResizeActive ? "true" : "false"}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      onClick={(e) => {
        // Only select if clicking the pane background, not the QR itself
        if (e.target === e.currentTarget) {
          onSelect()
        }
      }}
    >
      <div
        data-slot="dashboard-compose-canvas"
        data-compose-mode="compose"
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
      >
        {isLoading ? (
          <div className="text-sm font-medium text-[var(--drafting-ink-muted)]">
            Loading QR…
          </div>
        ) : markup ? (
          <div
            data-slot="dashboard-compose-node"
            data-node-id={state.data}
            data-selected={isSelected ? "true" : "false"}
            className="h-full w-full cursor-pointer [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: markup }}
            onClick={(e) => {
              e.stopPropagation()
              onQrClick()
            }}
          />
        ) : (
          <div className="text-sm font-medium text-[var(--drafting-ink-muted)]">
            Could not generate QR
          </div>
        )}
      </div>

      {isResizeActive && (
        <div
          className={cn(
            "absolute bottom-4 left-1/2 z-30 flex w-48 -translate-x-1/2 flex-col gap-1.5 rounded-[8px] border px-3 py-2 shadow-[var(--drafting-shadow-rest)]",
            "border-[var(--drafting-line-hover)] bg-[var(--drafting-panel-bg-hover)]",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <span className="drafting-type-caption text-[var(--drafting-ink-muted)]">
              Size
            </span>
            <span className="drafting-type-data font-semibold text-[var(--drafting-ink)]">
              {state.width}px
            </span>
          </div>
          <Slider
            min={100}
            max={2000}
            step={10}
            value={[state.width]}
            onValueChange={(values) => {
              const [size] = values
              if (typeof size === "number") {
                onSizeChange(size)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
