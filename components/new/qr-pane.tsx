"use client"

import { useEffect, useRef, useState } from "react"

import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import type { QrStudioState } from "@/components/qr/qr-studio-state"

type QrPaneProps = {
  state: QrStudioState
  isSelected: boolean
  onSelect: () => void
  onQrClick: () => void
}

export function QrPane({
  state,
  isSelected,
  onSelect,
  onQrClick,
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
}
