"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"

import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import type { QrStudioState } from "@/components/qr/qr-studio-state"

type QrPaneProps = {
  state: QrStudioState
  isSelected: boolean
  onSelect: () => void
  onQrClick: () => void
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
    </div>
  )
},
(previousProps, nextProps) =>
  previousProps.state === nextProps.state &&
  previousProps.isSelected === nextProps.isSelected,
)
