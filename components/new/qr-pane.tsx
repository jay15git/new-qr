"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"

import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import type { QrStudioState } from "@/components/qr/qr-studio-state"
import { cn } from "@/lib/utils"

type QrPaneProps = {
  state: QrStudioState
  isSelected: boolean
  onSelect: () => void
  onQrClick: () => void
}

function getQrPreviewRenderSize(state: QrStudioState) {
  const naturalSize = Math.max(state.width, state.height)
  return Math.min(Math.max(naturalSize, 420), 560)
}

export const QrPane = memo(function QrPane({
  state,
  isSelected,
  onSelect,
  onQrClick,
}: QrPaneProps) {
  const [markup, setMarkup] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const requestRef = useRef(0)
  const markupCacheRef = useRef(new Map<string, string>())
  const stateCacheKey = useMemo(() => JSON.stringify(state), [state])

  useEffect(() => {
    const requestId = ++requestRef.current
    const cachedMarkup = markupCacheRef.current.get(stateCacheKey)

    if (cachedMarkup) {
      setMarkup(cachedMarkup)
      setHasError(false)
      return
    }

    void buildDashboardQrNodePayload(state)
      .then((payload) => {
        if (requestRef.current !== requestId) return
        markupCacheRef.current.set(stateCacheKey, payload.markup)
        setMarkup(payload.markup)
        setHasError(false)
      })
      .catch(() => {
        if (requestRef.current !== requestId) return
        setMarkup(null)
        setHasError(true)
      })
  }, [state, stateCacheKey])

  const isLoading = markup === null && !hasError
  const previewRenderSize = getQrPreviewRenderSize(state)

  return (
    <div
      data-slot="qr-pane"
      data-selected={isSelected ? "true" : "false"}
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
        className="relative flex h-full w-full items-center justify-center overflow-visible p-4 sm:p-6 lg:p-8"
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
            className={cn(
              "relative max-h-full max-w-full cursor-pointer transition-shadow duration-150",
              isSelected && "shadow-[0_10px_24px_-12px_rgba(15,23,42,0.26)]",
            )}
            style={{
              height: previewRenderSize,
              width: previewRenderSize,
            }}
            onClick={(e) => {
              e.stopPropagation()
              onQrClick()
            }}
          >
            <div
              className="relative z-10 h-full w-full max-h-full max-w-full [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: markup }}
            />
          </div>
        ) : (
          <div className="text-sm font-medium text-[var(--drafting-ink-muted)]">
            Could not generate QR
          </div>
        )}
      </div>
    </div>
  )
},
(previousProps, nextProps) =>
  previousProps.state === nextProps.state &&
  previousProps.isSelected === nextProps.isSelected,
)
