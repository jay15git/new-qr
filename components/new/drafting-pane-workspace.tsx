"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  CopyPlusIcon,
  Maximize2Icon,
  Minimize2Icon,
  RefreshCcwIcon,
  Trash2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import { QrPane } from "@/components/new/qr-pane"
import { getQrLayout } from "@/components/new/qr-layout-engine"
import type { QrStudioState } from "@/components/qr/qr-studio-state"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type DraftingPane = {
  id: string
  name: string
  state: QrStudioState
}

type DraftingPaneWorkspaceProps = {
  panes: DraftingPane[]
  activePaneId: string
  canAddQrCode?: boolean
  onAddQrCode?: () => void
  onRemoveQrCode?: (paneId: string) => void
  onReset: () => void
  onPaneSelect: (paneId: string) => void
  onPaneQrClick: (paneId: string) => void
  onSwapPanes?: (sourcePaneId: string, targetPaneId: string) => void
}

function getPortraitSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(orientation: portrait)").matches
}

function subscribePortrait(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {}
  const mql = window.matchMedia("(orientation: portrait)")
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function DraftingPaneSurface({
  areaName,
  canSwap,
  draggingPaneId,
  isSelected,
  isSnapTarget,
  onPaneQrClick,
  onPaneSelect,
  onPaneDragEnd,
  onPaneDragStart,
  onPaneDrop,
  onPaneDragOver,
  onPaneDragLeave,
  pane,
  paneZoom,
}: {
  areaName?: string
  canSwap: boolean
  draggingPaneId: string | null
  isSelected: boolean
  isSnapTarget: boolean
  onPaneQrClick: (paneId: string) => void
  onPaneSelect: (paneId: string) => void
  onPaneDragEnd: () => void
  onPaneDragStart: (paneId: string, event: React.DragEvent<HTMLDivElement>) => void
  onPaneDrop: (paneId: string, event: React.DragEvent<HTMLDivElement>) => void
  onPaneDragOver: (paneId: string, event: React.DragEvent<HTMLDivElement>) => void
  onPaneDragLeave: (paneId: string, event: React.DragEvent<HTMLDivElement>) => void
  pane: DraftingPane
  paneZoom: number
}) {
  const onPaneSelectRef = useRef(onPaneSelect)
  const onPaneQrClickRef = useRef(onPaneQrClick)

  useEffect(() => {
    onPaneSelectRef.current = onPaneSelect
  }, [onPaneSelect])

  useEffect(() => {
    onPaneQrClickRef.current = onPaneQrClick
  }, [onPaneQrClick])

  const handleSelect = useCallback(() => {
    onPaneSelectRef.current(pane.id)
  }, [pane.id])

  const handleQrClick = useCallback(() => {
    onPaneQrClickRef.current(pane.id)
  }, [pane.id])

  return (
    <div
      key={pane.id}
      data-slot="dashboard-compose-surface"
      data-surface-appearance="neutral"
      data-dragging={draggingPaneId === pane.id ? "true" : "false"}
      data-snap-target={isSnapTarget ? "true" : "false"}
      draggable={canSwap}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[var(--drafting-canvas-bg)] transition-[box-shadow,opacity] duration-150 ease-out",
        canSwap && "cursor-grab active:cursor-grabbing",
        draggingPaneId === pane.id && "opacity-55",
        isSnapTarget &&
          "shadow-[inset_0_0_0_2px_var(--drafting-ink),inset_0_0_0_6px_var(--drafting-canvas-bg)]",
      )}
      style={{
        gridArea: areaName,
        backgroundImage:
          "radial-gradient(circle, rgb(var(--drafting-canvas-dot-rgb) / var(--drafting-canvas-dot-opacity)) 2.4px, transparent 3px)",
        backgroundPosition: "0 0",
        backgroundSize: "30px 30px",
      }}
      onClick={handleSelect}
      onDragEnd={onPaneDragEnd}
      onDragLeave={(event) => onPaneDragLeave(pane.id, event)}
      onDragOver={(event) => onPaneDragOver(pane.id, event)}
      onDragStart={(event) => onPaneDragStart(pane.id, event)}
      onDrop={(event) => onPaneDrop(pane.id, event)}
    >
      <div
        style={{
          transform: `scale(${paneZoom})`,
          transformOrigin: "center center",
          transition: "transform 150ms ease-out",
        }}
        className="flex h-full w-full items-center justify-center"
      >
        <QrPane
          state={pane.state}
          isSelected={isSelected}
          onQrClick={handleQrClick}
          onSelect={handleSelect}
        />
      </div>
    </div>
  )
}

export function DraftingPaneWorkspace({
  panes,
  activePaneId,
  canAddQrCode = true,
  onAddQrCode,
  onRemoveQrCode,
  onReset,
  onPaneSelect,
  onPaneQrClick,
  onSwapPanes,
}: DraftingPaneWorkspaceProps) {
  const [zoomLevels, setZoomLevels] = useState<Record<string, number>>({})
  const [maximizedPaneId, setMaximizedPaneId] = useState<string | null>(null)
  const [draggingPaneId, setDraggingPaneId] = useState<string | null>(null)
  const [snapTargetPaneId, setSnapTargetPaneId] = useState<string | null>(null)
  const draggingPaneIdRef = useRef<string | null>(null)
  const isPortrait = useSyncExternalStore(
    subscribePortrait,
    getPortraitSnapshot,
    () => false,
  )

  const activeZoom = zoomLevels[activePaneId] ?? 1

  const handleZoomOut = useCallback(() => {
    setZoomLevels((current) => ({
      ...current,
      [activePaneId]: Math.max(0.5, (current[activePaneId] ?? 1) - 0.1),
    }))
  }, [activePaneId])

  const handleZoomIn = useCallback(() => {
    setZoomLevels((current) => ({
      ...current,
      [activePaneId]: Math.min(2, (current[activePaneId] ?? 1) + 0.1),
    }))
  }, [activePaneId])

  const zoomPercent = `${Math.round(activeZoom * 100)}%`

  const isMaximized = maximizedPaneId !== null

  const handleToggleMaximize = useCallback(() => {
    setMaximizedPaneId((current) => (current === null ? activePaneId : null))
  }, [activePaneId])

  const canRemove = panes.length > 1 && onRemoveQrCode

  const visiblePanes = isMaximized
    ? panes.filter((p) => p.id === activePaneId)
    : panes

  const canSwapPanes = panes.length > 1 && Boolean(onSwapPanes)

  const layout = panes.length > 0
    ? getQrLayout(isMaximized ? 1 : panes.length, isPortrait)
    : null

  const handlePaneDragStart = useCallback(
    (paneId: string, event: React.DragEvent<HTMLDivElement>) => {
      if (!canSwapPanes) {
        event.preventDefault()
        return
      }

      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData("text/plain", paneId)
      draggingPaneIdRef.current = paneId
      setDraggingPaneId(paneId)
      setSnapTargetPaneId(null)
    },
    [canSwapPanes],
  )

  const handlePaneDragOver = useCallback(
    (paneId: string, event: React.DragEvent<HTMLDivElement>) => {
      const sourcePaneId =
        draggingPaneIdRef.current || draggingPaneId || event.dataTransfer.getData("text/plain")

      if (!sourcePaneId || sourcePaneId === paneId) {
        return
      }

      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
      setSnapTargetPaneId(paneId)
    },
    [draggingPaneId],
  )

  const handlePaneDragLeave = useCallback(
    (paneId: string, event: React.DragEvent<HTMLDivElement>) => {
      if (
        snapTargetPaneId === paneId &&
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return
      }

      setSnapTargetPaneId((current) => (current === paneId ? null : current))
    },
    [snapTargetPaneId],
  )

  const handlePaneDrop = useCallback(
    (targetPaneId: string, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const sourcePaneId =
        draggingPaneIdRef.current || draggingPaneId || event.dataTransfer.getData("text/plain")

      draggingPaneIdRef.current = null
      setDraggingPaneId(null)
      setSnapTargetPaneId(null)

      if (!sourcePaneId || sourcePaneId === targetPaneId) {
        return
      }

      onSwapPanes?.(sourcePaneId, targetPaneId)
    },
    [draggingPaneId, onSwapPanes],
  )

  const handlePaneDragEnd = useCallback(() => {
    draggingPaneIdRef.current = null
    setDraggingPaneId(null)
    setSnapTargetPaneId(null)
  }, [])

  return (
    <TooltipProvider>
      <div className="relative flex h-full w-full flex-col">
        <div
          className="relative min-h-0 flex-1"
          onDrop={handlePaneDragEnd}
          onDragOver={(event) => {
            if (draggingPaneId) {
              event.preventDefault()
            }
          }}
        >
          {panes.length === 0 ? (
            <div className="grid h-full place-items-center text-sm font-medium text-[var(--drafting-ink-muted)]">
              No QR codes
            </div>
          ) : (
            <div
              className="h-full w-full"
              style={{
                display: "grid",
                gridTemplateColumns: layout ? `repeat(${layout.cols}, 1fr)` : undefined,
                gridTemplateRows: layout ? `repeat(${layout.rows}, 1fr)` : undefined,
                gap: "0.5rem",
                ...(layout?.areas ? { gridTemplateAreas: layout.areas } : {}),
              }}
            >
              {visiblePanes.map((pane, index) => {
                const isSelected = pane.id === activePaneId
                const paneZoom = zoomLevels[pane.id] ?? 1
                const areaName = layout?.areas
                  ? String.fromCharCode(97 + index)
                  : undefined

                return (
                  <DraftingPaneSurface
                    areaName={areaName}
                    canSwap={canSwapPanes}
                    draggingPaneId={draggingPaneId}
                    isSelected={isSelected}
                    isSnapTarget={snapTargetPaneId === pane.id}
                    key={pane.id}
                    onPaneDragEnd={handlePaneDragEnd}
                    onPaneDragLeave={handlePaneDragLeave}
                    onPaneDragOver={handlePaneDragOver}
                    onPaneDragStart={handlePaneDragStart}
                    onPaneDrop={handlePaneDrop}
                    onPaneQrClick={onPaneQrClick}
                    onPaneSelect={onPaneSelect}
                    pane={pane}
                    paneZoom={paneZoom}
                  />
                )
              })}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-4 z-20 flex justify-center px-2 sm:inset-x-6 lg:inset-x-8">
          <div
            data-slot="dashboard-compose-toolbar"
            data-toolbar-appearance="neutral"
            className={cn(
              "pointer-events-auto inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-[10px] bg-[var(--drafting-panel-bg-active)] px-2 py-1.5",
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Zoom out preview"
                  className="h-8 w-8 rounded-md border-0 bg-transparent p-0 text-[var(--drafting-ink-muted)] shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[var(--drafting-ink)]"
                  onClick={handleZoomOut}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ZoomOutIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>

            <div className="min-w-12 px-1 text-center font-semibold drafting-type-data text-[var(--drafting-ink)]">
              {zoomPercent}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Zoom in preview"
                  className="h-8 w-8 rounded-md border-0 bg-transparent p-0 text-[var(--drafting-ink-muted)] shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[var(--drafting-ink)]"
                  onClick={handleZoomIn}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ZoomInIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>

            {panes.length > 1 && (
              <>
                <div className="mx-1 h-4 w-px bg-[var(--drafting-line)]" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={isMaximized ? "Restore layout" : "Maximize pane"}
                      className="h-8 w-8 rounded-md border-0 bg-transparent p-0 text-[var(--drafting-ink-muted)] shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[var(--drafting-ink)]"
                      onClick={handleToggleMaximize}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {isMaximized ? (
                        <Minimize2Icon />
                      ) : (
                        <Maximize2Icon />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMaximized ? "Restore layout" : "Maximize pane"}
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            <div className="mx-1 h-4 w-px bg-[var(--drafting-line)]" />

            {onAddQrCode ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label="Add QR code"
                      className="h-8 w-8 rounded-md border-0 bg-transparent p-0 text-[var(--drafting-ink-muted)] shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[var(--drafting-ink)] disabled:opacity-40"
                      onClick={onAddQrCode}
                      disabled={!canAddQrCode}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <CopyPlusIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {canAddQrCode ? "Add QR code" : "Maximum 10 QR codes reached"}
                  </TooltipContent>
                </Tooltip>

                {canRemove ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label="Remove QR code"
                        className="h-8 w-8 rounded-md border-0 bg-transparent p-0 text-[var(--drafting-ink-muted)] shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[var(--drafting-ink)]"
                        onClick={() => onRemoveQrCode?.(activePaneId)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2Icon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove QR code</TooltipContent>
                  </Tooltip>
                ) : null}

                <div className="mx-1 h-4 w-px bg-[var(--drafting-line)]" />
              </>
            ) : null}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Reset defaults"
                  className="h-8 w-8 rounded-md border-0 bg-transparent p-0 text-[var(--drafting-ink-muted)] shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[var(--drafting-ink)]"
                  onClick={onReset}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <RefreshCcwIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset defaults</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
