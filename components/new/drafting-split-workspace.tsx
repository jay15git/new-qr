"use client"

import { useCallback, useMemo, useState } from "react"
import {
  CopyPlusIcon,
  MaximizeIcon,
  RefreshCcwIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import { DashboardComposeSurface } from "@/components/qr/dashboard-compose-surface"
import {
  clampDashboardZoom,
  type DashboardComposeCamera,
  type DashboardComposeScene,
  getDashboardQrNodes,
  resetDashboardQrNodeTransform,
  updateDashboardComposeNode,
} from "@/components/qr/dashboard-compose-scene"
import type { QrQualityReport, QrQualitySuggestionPath } from "@/components/qr/qr-quality"
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

type DraftingSplitWorkspaceProps = {
  errorMessage?: string | null
  onAddQrCode?: () => void
  onApplyQualitySuggestionPath?: (path: QrQualitySuggestionPath) => void
  onQrSizeChange: (nextSize: number) => void
  onReset: () => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  qrSize: number
  qualityReport?: QrQualityReport | null
  scene: DashboardComposeScene
  selectedNodeId: string | null
  surfaceAppearance?: "dashboard" | "neutral"
}

const DEFAULT_CAMERA: DashboardComposeCamera = {
  zoom: 1,
  panX: 0,
  panY: 0,
}

const NO_OP_SCENE_CHANGE: React.Dispatch<React.SetStateAction<DashboardComposeScene>> =
  () => undefined

export function DraftingSplitWorkspace({
  errorMessage,
  onAddQrCode,
  onApplyQualitySuggestionPath,
  onQrSizeChange,
  onReset,
  onSceneChange,
  onSelectedNodeChange,
  qrSize,
  qualityReport,
  scene,
  selectedNodeId,
  surfaceAppearance = "neutral",
}: DraftingSplitWorkspaceProps) {
  const [paneCameras, setPaneCameras] = useState<Record<string, DashboardComposeCamera>>({})
  const [localSelectedPaneId, setLocalSelectedPaneId] = useState<string | null>(null)

  const qrNodes = useMemo(() => getDashboardQrNodes(scene), [scene])
  const isNeutralSurface = surfaceAppearance === "neutral"

  const effectiveSelectedPaneId = useMemo(() => {
    const derived =
      selectedNodeId && qrNodes.some((n) => n.id === selectedNodeId)
        ? selectedNodeId
        : localSelectedPaneId
    return qrNodes.some((n) => n.id === derived) ? derived : qrNodes[0]?.id ?? null
  }, [selectedNodeId, localSelectedPaneId, qrNodes])

  const selectedCamera = effectiveSelectedPaneId
    ? paneCameras[effectiveSelectedPaneId] ?? DEFAULT_CAMERA
    : DEFAULT_CAMERA

  const zoomPercent = `${Math.round(selectedCamera.zoom * 100)}%`

  const handlePaneSceneChange = useCallback(
    (nodeId: string) =>
      (nextPaneScene: React.SetStateAction<DashboardComposeScene>) => {
        if (typeof nextPaneScene === "function") return

        setPaneCameras((current) => ({
          ...current,
          [nodeId]: nextPaneScene.camera,
        }))

        const updatedNode = nextPaneScene.nodes.find((n) => n.id === nodeId)
        if (updatedNode) {
          onSceneChange((currentScene) =>
            updateDashboardComposeNode(currentScene, nodeId, updatedNode),
          )
        }
      },
    [onSceneChange],
  )

  const handlePaneSelection = useCallback(
    (nodeId: string | null) => {
      setLocalSelectedPaneId(nodeId)
      onSelectedNodeChange(nodeId)
    },
    [onSelectedNodeChange],
  )

  const updateSelectedCamera = useCallback(
    (patch: Partial<DashboardComposeCamera>) => {
      if (!effectiveSelectedPaneId) return
      setPaneCameras((current) => {
        const prev = current[effectiveSelectedPaneId] ?? DEFAULT_CAMERA
        const next = {
          ...prev,
          ...patch,
          zoom: clampDashboardZoom(patch.zoom ?? prev.zoom),
        }
        if (
          next.zoom === prev.zoom &&
          next.panX === prev.panX &&
          next.panY === prev.panY
        ) {
          return current
        }
        return { ...current, [effectiveSelectedPaneId]: next }
      })
    },
    [effectiveSelectedPaneId],
  )

  const handleZoomOut = useCallback(() => {
    updateSelectedCamera({ zoom: selectedCamera.zoom - 0.1 })
  }, [selectedCamera.zoom, updateSelectedCamera])

  const handleZoomIn = useCallback(() => {
    updateSelectedCamera({ zoom: selectedCamera.zoom + 0.1 })
  }, [selectedCamera.zoom, updateSelectedCamera])

  const handleResetView = useCallback(() => {
    updateSelectedCamera({ ...DEFAULT_CAMERA })
  }, [updateSelectedCamera])

  const handleResetTransform = useCallback(() => {
    if (!effectiveSelectedPaneId) return
    onSceneChange((current) =>
      resetDashboardQrNodeTransform(current, effectiveSelectedPaneId),
    )
  }, [effectiveSelectedPaneId, onSceneChange])

  const defaultPanelSize = qrNodes.length > 0 ? 100 / qrNodes.length : 100

  return (
    <TooltipProvider>
      <div className="relative flex h-full w-full flex-col">
        <div className="relative min-h-0 flex-1">
          {qrNodes.length === 0 ? (
            <DashboardComposeSurface
              errorMessage={errorMessage}
              fixedCanvasSize={true}
              onApplyQualitySuggestionPath={onApplyQualitySuggestionPath}
              onQrSizeChange={onQrSizeChange}
              onReset={onReset}
              onSceneChange={onSceneChange}
              onSelectedNodeChange={onSelectedNodeChange}
              qrSize={qrSize}
              qualityReport={qualityReport}
              scene={scene}
              selectedNodeId={selectedNodeId}
              showToolbar={true}
              surfaceAppearance={surfaceAppearance}
              surfaceMode="compose"
            />
          ) : (
            <ResizablePanelGroup
              orientation="horizontal"
              className="h-full w-full"
            >
              {qrNodes.flatMap((node, index) => {
                const isSelected = node.id === effectiveSelectedPaneId
                const paneScene: DashboardComposeScene = {
                  ...scene,
                  nodes: [node],
                  camera: paneCameras[node.id] ?? DEFAULT_CAMERA,
                }

                const panel = (
                  <ResizablePanel
                    key={node.id}
                    defaultSize={defaultPanelSize}
                    minSize={15}
                  >
                    <div
                      className={cn(
                        "relative h-full w-full overflow-hidden",
                        isSelected &&
                          "ring-2 ring-inset ring-[var(--drafting-ink)]",
                      )}
                      onClick={() => handlePaneSelection(node.id)}
                    >
                      <DashboardComposeSurface
                        interactive={isSelected}
                        errorMessage={isSelected ? errorMessage : null}
                        fixedCanvasSize={true}
                        onApplyQualitySuggestionPath={
                          isSelected ? onApplyQualitySuggestionPath : undefined
                        }
                        onQrSizeChange={onQrSizeChange}
                        onReset={onReset}
                        onSceneChange={isSelected ? handlePaneSceneChange(node.id) : NO_OP_SCENE_CHANGE}
                        onSelectedNodeChange={handlePaneSelection}
                        qrSize={qrSize}
                        qualityReport={isSelected ? qualityReport : undefined}
                        scene={paneScene}
                        selectedNodeId={isSelected ? node.id : null}
                        showToolbar={false}
                        surfaceAppearance={surfaceAppearance}
                        surfaceMode="compose"
                      />
                    </div>
                  </ResizablePanel>
                )

                const handle =
                  index < qrNodes.length - 1 ? (
                    <ResizableHandle
                      key={`handle-${index}`}
                      withHandle
                      className={cn(
                        "z-10 w-1.5 cursor-ew-resize bg-[var(--drafting-line-strong)]/30 transition-colors duration-150 hover:bg-[var(--drafting-line-strong)]/60 active:bg-[var(--drafting-line-strong)]/80",
                        isNeutralSurface &&
                          "bg-[var(--drafting-line-strong)]/30 hover:bg-[var(--drafting-line-strong)]/60 active:bg-[var(--drafting-line-strong)]/80",
                      )}
                    />
                  ) : null

                return handle ? [panel, handle] : [panel]
              })}
            </ResizablePanelGroup>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-4 z-20 flex justify-center px-2 sm:inset-x-6 lg:inset-x-8">
          <div
            className={cn(
              "pointer-events-auto inline-flex max-w-full flex-wrap items-center justify-center gap-1 backdrop-blur",
              isNeutralSurface
                ? "rounded-[10px] bg-[var(--drafting-panel-bg)]/60 px-2 py-1.5"
                : "rounded-[1.25rem] bg-white/50 px-2 py-1.5",
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Zoom out preview"
                  className={cn(
                    "h-8 w-8 rounded-md border-0 bg-transparent p-0 shadow-none transition-colors duration-150",
                    isNeutralSurface
                      ? "text-[var(--drafting-ink-muted)] hover:bg-transparent hover:text-[var(--drafting-ink)]"
                      : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                  )}
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

            <div
              className={cn(
                "min-w-12 px-1 text-center font-semibold",
                isNeutralSurface
                  ? "drafting-type-data text-[var(--drafting-ink)]"
                  : "text-[0.72rem] text-foreground/65",
              )}
            >
              {zoomPercent}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Zoom in preview"
                  className={cn(
                    "h-8 w-8 rounded-md border-0 bg-transparent p-0 shadow-none transition-colors duration-150",
                    isNeutralSurface
                      ? "text-[var(--drafting-ink-muted)] hover:bg-transparent hover:text-[var(--drafting-ink)]"
                      : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                  )}
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

            <div
              className={cn(
                "mx-1 h-4 w-px",
                isNeutralSurface
                  ? "bg-[var(--drafting-line)]"
                  : "bg-slate-300/80",
              )}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Reset preview position"
                  className={cn(
                    "h-8 w-8 rounded-md border-0 bg-transparent p-0 shadow-none transition-colors duration-150",
                    isNeutralSurface
                      ? "text-[var(--drafting-ink-muted)] hover:bg-transparent hover:text-[var(--drafting-ink)]"
                      : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                  )}
                  onClick={handleResetView}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <SearchIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Reset QR transform"
                  className={cn(
                    "h-8 w-8 rounded-md border-0 bg-transparent p-0 shadow-none transition-colors duration-150",
                    isNeutralSurface
                      ? "text-[var(--drafting-ink-muted)] hover:bg-transparent hover:text-[var(--drafting-ink)]"
                      : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                  )}
                  onClick={handleResetTransform}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <MaximizeIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset transform</TooltipContent>
            </Tooltip>

            {onAddQrCode ? (
              <>
                <div
                  className={cn(
                    "mx-1 h-4 w-px",
                    isNeutralSurface
                      ? "bg-[var(--drafting-line)]"
                      : "bg-slate-300/80",
                  )}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label="Add QR code"
                      className={cn(
                        "h-8 w-8 rounded-md border-0 bg-transparent p-0 shadow-none transition-colors duration-150",
                        isNeutralSurface
                          ? "text-[var(--drafting-ink-muted)] hover:bg-transparent hover:text-[var(--drafting-ink)]"
                          : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                      )}
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
              </>
            ) : null}

            <div
              className={cn(
                "mx-1 h-4 w-px",
                isNeutralSurface
                  ? "bg-[var(--drafting-line)]"
                  : "bg-slate-300/80",
              )}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Reset defaults"
                  className={cn(
                    "h-8 w-8 rounded-md border-0 bg-transparent p-0 shadow-none transition-colors duration-150",
                    isNeutralSurface
                      ? "text-[var(--drafting-ink-muted)] hover:bg-transparent hover:text-[var(--drafting-ink)]"
                      : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                  )}
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
