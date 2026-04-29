"use client"

import { useCallback, useState } from "react"
import {
  CopyPlusIcon,
  RefreshCcwIcon,
  Trash2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import { QrPane } from "@/components/new/qr-pane"
import type { QrStudioState } from "@/components/qr/qr-studio-state"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
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
  resizeActivePaneId: string | null
  onAddQrCode?: () => void
  onRemoveQrCode?: (paneId: string) => void
  onReset: () => void
  onPaneSelect: (paneId: string) => void
  onPaneQrClick: (paneId: string) => void
  onPaneSizeChange: (paneId: string, size: number) => void
}

export function DraftingPaneWorkspace({
  panes,
  activePaneId,
  resizeActivePaneId,
  onAddQrCode,
  onRemoveQrCode,
  onReset,
  onPaneSelect,
  onPaneQrClick,
  onPaneSizeChange,
}: DraftingPaneWorkspaceProps) {
  const [zoomLevels, setZoomLevels] = useState<Record<string, number>>({})

  const defaultPanelSize = panes.length > 0 ? 100 / panes.length : 100

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

  const canRemove = panes.length > 1 && onRemoveQrCode

  return (
    <TooltipProvider>
      <div className="relative flex h-full w-full flex-col">
        <div className="relative min-h-0 flex-1">
          {panes.length === 0 ? (
            <div className="grid h-full place-items-center text-sm font-medium text-[var(--drafting-ink-muted)]">
              No QR codes
            </div>
          ) : (
            <ResizablePanelGroup
              orientation="horizontal"
              className="h-full w-full"
            >
              {panes.flatMap((pane, index) => {
                const isSelected = pane.id === activePaneId
                const isResizeActive = pane.id === resizeActivePaneId
                const paneZoom = zoomLevels[pane.id] ?? 1

                const panel = (
                  <ResizablePanel
                    key={pane.id}
                    defaultSize={defaultPanelSize}
                    minSize={15}
                  >
                    <div
                      data-slot="dashboard-compose-surface"
                      data-surface-appearance="neutral"
                      className={cn(
                        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[var(--drafting-canvas-bg)]",
                        isSelected &&
                          "ring-2 ring-inset ring-[var(--drafting-ink)]",
                      )}
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, rgb(var(--drafting-canvas-check-rgb) / var(--drafting-canvas-check-opacity)) 25%, transparent 25%), linear-gradient(-45deg, rgb(var(--drafting-canvas-check-rgb) / var(--drafting-canvas-check-opacity)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(var(--drafting-canvas-check-rgb) / var(--drafting-canvas-check-opacity)) 75%), linear-gradient(-45deg, transparent 75%, rgb(var(--drafting-canvas-check-rgb) / var(--drafting-canvas-check-opacity)) 75%)",
                        backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0",
                        backgroundSize: "36px 36px",
                      }}
                      onClick={() => onPaneSelect(pane.id)}
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
                          isResizeActive={isResizeActive}
                          onSelect={() => onPaneSelect(pane.id)}
                          onQrClick={() => onPaneQrClick(pane.id)}
                          onSizeChange={(size) =>
                            onPaneSizeChange(pane.id, size)
                          }
                        />
                      </div>
                    </div>
                  </ResizablePanel>
                )

                const handle =
                  index < panes.length - 1 ? (
                    <ResizableHandle
                      key={`handle-${index}`}
                      withHandle
                      className="z-10 w-1.5 cursor-ew-resize bg-[var(--drafting-line-strong)]/30 transition-colors duration-150 hover:bg-[var(--drafting-line-strong)]/60 active:bg-[var(--drafting-line-strong)]/80"
                    />
                  ) : null

                return handle ? [panel, handle] : [panel]
              })}
            </ResizablePanelGroup>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-4 z-20 flex justify-center px-2 sm:inset-x-6 lg:inset-x-8">
          <div
            data-slot="dashboard-compose-toolbar"
            data-toolbar-appearance="neutral"
            className={cn(
              "pointer-events-auto inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-[10px] bg-[var(--drafting-panel-bg)]/60 px-2 py-1.5 backdrop-blur",
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

            <div className="mx-1 h-4 w-px bg-[var(--drafting-line)]" />

            {onAddQrCode ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label="Add QR code"
                      className="h-8 w-8 rounded-md border-0 bg-transparent p-0 text-[var(--drafting-ink-muted)] shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[var(--drafting-ink)]"
                      onClick={onAddQrCode}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <CopyPlusIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add QR code</TooltipContent>
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
