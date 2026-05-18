"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"

import {
  DEFAULT_DRAFTING_CARD_STATE,
  type DraftingCardState,
} from "@/components/new/drafting-card-state"
import { getDraftingCardPatternStyle } from "@/components/new/drafting-card-patterns"
import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import type { QrStudioState } from "@/components/qr/qr-studio-state"
import { cn } from "@/lib/utils"

type QrPaneProps = {
  cardState?: DraftingCardState
  state: QrStudioState
  isSelected: boolean
  onSelect: () => void
  onQrClick: () => void
}

function getQrPreviewRenderSize(state: QrStudioState) {
  return Math.max(state.width, state.height)
}

function getDraftingCardShadow(shadow: DraftingCardState["shadow"]) {
  switch (shadow) {
    case "none":
      return "none"
    case "soft":
      return "0 14px 30px -22px rgba(29, 22, 6, 0.45)"
    case "strong":
      return "0 26px 54px -24px rgba(29, 22, 6, 0.55)"
    case "medium":
    default:
      return "0 20px 44px -24px rgba(29, 22, 6, 0.52)"
  }
}

export const QrPane = memo(function QrPane({
  cardState = DEFAULT_DRAFTING_CARD_STATE,
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
  const cardWidth = previewRenderSize + cardState.padding * 2
  const cardHeight = cardWidth + cardState.bottomSpace
  const cardPatternStyle = getDraftingCardPatternStyle(
    cardState.patternId,
    cardState.patternId === "none" ? undefined : cardState.patternColors[cardState.patternId],
  )
  const qrNode = markup ? (
    <div
      data-slot="dashboard-compose-node"
      data-node-id={state.data}
      data-selected={isSelected ? "true" : "false"}
      className={cn(
        "relative z-10 max-h-full max-w-full cursor-pointer transition-shadow duration-150",
        cardState.enabled && "self-start",
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
  ) : null

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
          cardState.enabled ? (
            <div
              data-slot="dashboard-compose-card"
              data-card-pattern={cardState.patternId}
              data-card-shadow={cardState.shadow}
              data-card-enabled="true"
              className="relative flex max-h-full max-w-full justify-center transition-[box-shadow,background-color,border-radius] duration-150"
              style={{
                backgroundColor: cardState.fill,
                ...cardPatternStyle,
                borderRadius: cardState.cornerRadius,
                boxShadow: getDraftingCardShadow(cardState.shadow),
                height: cardHeight,
                padding: cardState.padding,
                width: cardWidth,
              }}
            >
              {qrNode}
            </div>
          ) : (
            qrNode
          )
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
  previousProps.cardState === nextProps.cardState &&
  previousProps.state === nextProps.state &&
  previousProps.isSelected === nextProps.isSelected,
)
