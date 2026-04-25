"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import {
  CopyPlusIcon,
  MaximizeIcon,
  RefreshCcwIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import {
  clampDashboardZoom,
  computeDashboardZoomedCamera,
  DASHBOARD_QR_NODE_ID,
  fitDashboardQrNodeToDocument,
  getDashboardComposeNode,
  isDashboardQrNodeId,
  resetDashboardComposeCamera,
  resetDashboardQrNodeTransform,
  type DashboardComposeDocument,
  type DashboardComposeBackground,
  type DashboardComposeNode,
  type DashboardComposeScene,
  updateDashboardComposeCamera,
  updateDashboardComposeNode,
} from "@/components/qr/dashboard-compose-scene"
import { QrQualityPanel } from "@/components/qr/qr-quality-panel"
import type {
  QrQualityReport,
  QrQualitySuggestionPath,
} from "@/components/qr/qr-quality"
import { clampQrSize } from "@/components/qr/qr-studio-state"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type DashboardComposeSurfaceProps = {
  errorMessage?: string | null
  isEditMode: boolean
  onEditModeChange: (checked: boolean) => void
  onApplyQualitySuggestionPath?: (path: QrQualitySuggestionPath) => void
  onAddQrCode?: () => void
  onReset: () => void
  onQrSizeChange: (nextSize: number) => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  qrSize: number
  qualityReport?: QrQualityReport | null
  scene: DashboardComposeScene
  selectedNodeId: string | null
  allowDirectNodeTransforms?: boolean
  showEditModeToggle?: boolean
  surfaceAppearance?: "dashboard" | "neutral"
  surfaceMode?: "compose" | "document"
}

type InteractionBase = {
  scene: DashboardComposeScene
}

type Interaction =
  | (InteractionBase & {
      kind: "drag-node"
      nodeId: string
      startWorldX: number
      startWorldY: number
      startX: number
      startY: number
    })
  | (InteractionBase & {
      kind: "pan-canvas"
      startClientX: number
      startClientY: number
      startPanX: number
      startPanY: number
    })
  | (InteractionBase & {
      kind: "resize-node"
      centerX: number
      centerY: number
      naturalHeight: number
      naturalWidth: number
      nodeId: string
      nodeKind: DashboardComposeNode["kind"]
      qrSize: number
      scale: number
      startScale: number
      startDistance: number
    })
  | (InteractionBase & {
      kind: "rotate-node"
      centerX: number
      centerY: number
      nodeId: string
      startAngle: number
      startRotation: number
    })

type InteractionResult = {
  scene: DashboardComposeScene
  qrSize?: number
}

export function DashboardComposeSurface({
  errorMessage,
  isEditMode,
  onEditModeChange,
  onApplyQualitySuggestionPath,
  onAddQrCode,
  onReset,
  onQrSizeChange,
  onSceneChange,
  onSelectedNodeChange,
  qualityReport,
  scene,
  selectedNodeId,
  allowDirectNodeTransforms = false,
  showEditModeToggle = true,
  surfaceAppearance = "dashboard",
  surfaceMode = "compose",
}: DashboardComposeSurfaceProps) {
  const [draftScene, setDraftScene] = useState(scene)
  const [isDraftActive, setIsDraftActive] = useState(false)
  const [rotatingNodeId, setRotatingNodeId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<Interaction | null>(null)
  const draftSceneRef = useRef(scene)
  const isEditModeRef = useRef(isEditMode)
  const onSceneChangeRef = useRef(onSceneChange)
  const onQrSizeChangeRef = useRef(onQrSizeChange)
  const pendingSceneRef = useRef<DashboardComposeScene | null>(null)
  const pendingQrSizeRef = useRef<number | null>(null)
  const rafIdRef = useRef<number | null>(null)

  const renderedScene = isDraftActive ? draftScene : scene
  const qrNode = getDashboardComposeNode(renderedScene)
  const targetQrNodeId = selectedNodeId && isDashboardQrNodeId(selectedNodeId)
    ? selectedNodeId
    : DASHBOARD_QR_NODE_ID
  const zoomPercent = `${Math.round(renderedScene.camera.zoom * 100)}%`
  const isNeutralSurface = surfaceAppearance === "neutral"
  const isDocumentSurface = surfaceMode === "document"
  const canSelectNodes = isEditMode || isDocumentSurface || allowDirectNodeTransforms
  const canTransformNodes = isEditMode || isDocumentSurface || allowDirectNodeTransforms
  const canvasBackgroundStyle = getDashboardCanvasBackgroundStyle(renderedScene.background)
  const surfaceBaseStyle =
    isNeutralSurface
      ? {
          backgroundColor: "#ececec",
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.72) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.72) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.72) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.72) 75%)",
          backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0",
          backgroundSize: "36px 36px",
        }
      : {
          backgroundColor: "#e8edf4",
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.56) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.56) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.56) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.56) 75%)",
          backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0",
          backgroundSize: "36px 36px",
        }
  const documentAspectRatio = `${renderedScene.canvasSize.width} / ${renderedScene.canvasSize.height}`
  const canvasFrameStyle = isDocumentSurface
    ? {
        aspectRatio: documentAspectRatio,
        maxHeight: "100%",
        width: "min(100%, 760px)",
      }
    : undefined

  const applyDraftScene = useCallback((nextScene: DashboardComposeScene) => {
    draftSceneRef.current = nextScene
    setIsDraftActive(true)
    setDraftScene(nextScene)
  }, [])

  const flushScheduledDraftScene = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }

    const pendingScene = pendingSceneRef.current

    if (!pendingScene) {
      return draftSceneRef.current
    }

    pendingSceneRef.current = null
    applyDraftScene(pendingScene)
    return pendingScene
  }, [applyDraftScene])

  const scheduleDraftScene = useCallback(
    (nextScene: DashboardComposeScene, nextQrSize?: number) => {
      pendingSceneRef.current = nextScene

      if (typeof nextQrSize === "number") {
        pendingQrSizeRef.current = nextQrSize
      }

      if (rafIdRef.current !== null) {
        return
      }

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null

        const pendingScene = pendingSceneRef.current

        if (!pendingScene) {
          return
        }

        pendingSceneRef.current = null
        applyDraftScene(pendingScene)
      })
    },
    [applyDraftScene],
  )

  const commitActiveInteraction = useCallback(
    ({
      shouldCommit,
    }: {
      shouldCommit: boolean
    }) => {
      const interaction = interactionRef.current
      const committedScene = flushScheduledDraftScene()
      const nextQrSize = pendingQrSizeRef.current

      interactionRef.current = null
      pendingQrSizeRef.current = null
      setIsDraftActive(false)
      setRotatingNodeId(null)

      if (!interaction || !shouldCommit) {
        return
      }

      onSceneChangeRef.current(committedScene)

      if (
        interaction.kind === "resize-node" &&
        isDashboardQrNodeId(interaction.nodeId) &&
        typeof nextQrSize === "number"
      ) {
        onQrSizeChangeRef.current(nextQrSize)
      }
    },
    [flushScheduledDraftScene],
  )

  useEffect(() => {
    isEditModeRef.current = isEditMode
    onSceneChangeRef.current = onSceneChange
    onQrSizeChangeRef.current = onQrSizeChange
  }, [isEditMode, onQrSizeChange, onSceneChange])

  useEffect(() => {
    if (interactionRef.current) {
      return
    }

    draftSceneRef.current = scene
    pendingSceneRef.current = null
    pendingQrSizeRef.current = null
  }, [scene])

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [commitActiveInteraction, scheduleDraftScene])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current

      if (!interaction) {
        return
      }

      event.preventDefault()

      if (
        !isEditModeRef.current &&
        !isDocumentSurface &&
        !allowDirectNodeTransforms &&
        interaction.kind !== "pan-canvas"
      ) {
        commitActiveInteraction({ shouldCommit: true })
        return
      }

      const nextInteractionResult = getNextInteractionResult({
        canvas: canvasRef.current,
        event,
        interaction,
      })

      if (!nextInteractionResult) {
        return
      }

      scheduleDraftScene(nextInteractionResult.scene, nextInteractionResult.qrSize)
    }

    const onPointerEnd = () => {
      commitActiveInteraction({ shouldCommit: true })
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerEnd)
    window.addEventListener("pointercancel", onPointerEnd)

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerEnd)
      window.removeEventListener("pointercancel", onPointerEnd)
    }
  }, [allowDirectNodeTransforms, commitActiveInteraction, isDocumentSurface, scheduleDraftScene])

  useEffect(() => {
    if (isEditMode || isDocumentSurface || allowDirectNodeTransforms || !interactionRef.current) {
      return
    }

    queueMicrotask(() => {
      if (isEditModeRef.current || !interactionRef.current) {
        return
      }

      commitActiveInteraction({ shouldCommit: true })
    })
  }, [allowDirectNodeTransforms, commitActiveInteraction, isDocumentSurface, isEditMode])

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()

    const anchor = getWorldPoint(event.nativeEvent, canvasRef.current, draftSceneRef.current)

    if (!anchor) {
      return
    }

    const multiplier = event.deltaY < 0 ? 1.1 : 0.9
    const currentScene = draftSceneRef.current
    const nextScene = {
      ...currentScene,
      camera: computeDashboardZoomedCamera(
        currentScene,
        currentScene.camera.zoom * multiplier,
        anchor,
      ),
    }

    draftSceneRef.current = nextScene
    onSceneChangeRef.current(nextScene)
  }

  const startResizeInteraction = (
    event: ReactPointerEvent<HTMLButtonElement>,
    node: DashboardComposeScene["nodes"][number],
    width: number,
    height: number,
  ) => {
    event.stopPropagation()
    const baseScene = draftSceneRef.current
    const centerX = node.x + width * 0.5
    const centerY = node.y + height * 0.5
    const worldPoint = getWorldPoint(event.nativeEvent, canvasRef.current, baseScene)

    if (!worldPoint) {
      return
    }

    onSelectedNodeChange(node.id)
    interactionRef.current = {
      kind: "resize-node",
      scene: baseScene,
      nodeId: node.id,
      naturalHeight: node.naturalHeight,
      naturalWidth: node.naturalWidth,
      nodeKind: node.kind,
      centerX,
      centerY,
      qrSize: node.naturalWidth,
      scale: node.scale,
      startScale: node.scale,
      startDistance: Math.max(1, Math.hypot(worldPoint.x - centerX, worldPoint.y - centerY)),
    }
  }

  const handleEditModeChange = (checked: boolean) => {
    if (!checked) {
      commitActiveInteraction({ shouldCommit: true })
    }

    onEditModeChange(checked)
  }

  return (
    <div
      data-slot="dashboard-compose-surface"
      data-surface-appearance={surfaceAppearance}
      className="relative h-full min-h-[22rem] overflow-hidden bg-slate-100 select-none touch-none"
      style={surfaceBaseStyle}
    >
      <div
        data-slot="dashboard-compose-viewport"
        data-background-mode={renderedScene.background.mode}
        className="absolute inset-0"
        style={canvasBackgroundStyle}
        onPointerDown={(event) => {
          const baseScene = draftSceneRef.current

          onSelectedNodeChange(null)
          interactionRef.current = {
            kind: "pan-canvas",
            scene: baseScene,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startPanX: baseScene.camera.panX,
            startPanY: baseScene.camera.panY,
          }
        }}
        onWheel={handleWheel}
      >
        {qualityReport ? (
          <div className="pointer-events-none absolute inset-x-5 top-4 z-20 flex sm:inset-x-6 lg:inset-x-8">
            <div className="pointer-events-auto">
              <QrQualityPanel
                onApplySuggestionPath={onApplyQualitySuggestionPath}
                report={qualityReport}
              />
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="pointer-events-none absolute inset-x-5 top-4 z-20 flex justify-end sm:inset-x-6 lg:inset-x-8">
            <p
              aria-live="polite"
              role="alert"
              className="pointer-events-auto max-w-xs rounded-2xl border border-red-300/70 bg-white/90 px-3 py-2 text-sm text-destructive shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)] backdrop-blur"
            >
              {errorMessage}
            </p>
          </div>
        ) : null}

        <div
          data-slot="dashboard-compose-controls"
          className="pointer-events-none absolute inset-x-5 bottom-4 z-20 flex justify-center px-2 sm:inset-x-6 lg:inset-x-8"
        >
          <div
            data-slot="dashboard-compose-toolbar"
            data-toolbar-appearance={surfaceAppearance}
            className={cn(
              "pointer-events-auto inline-flex max-w-full flex-wrap items-center justify-center backdrop-blur",
              isNeutralSurface
                ? "gap-1.5 rounded-[10px] border border-[#00000017] bg-[#FFFFFFCC] px-2.5 py-1 text-[#00000073] shadow-[0_0_10px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.03)]"
                : "gap-2 rounded-[1.75rem] border border-slate-300/80 bg-white/84 px-2 py-2 text-foreground/70 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]",
            )}
          >
            {showEditModeToggle ? (
              <div
                data-slot="dashboard-compose-edit-mode"
                className={cn(
                  "inline-flex items-center gap-2",
                  isNeutralSurface
                    ? "rounded-[8px] px-2 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#111111]"
                    : "rounded-full border border-slate-300/80 bg-white/84 px-3 py-1.5 text-sm font-medium text-foreground/70 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]",
                )}
              >
                <span>{isDocumentSurface ? "Document mode" : "Edit mode"}</span>
                <Switch
                  aria-label={isDocumentSurface ? "Toggle document mode" : "Toggle edit mode"}
                  checked={isEditMode}
                  className={cn(
                    isNeutralSurface &&
                      "h-[20px] w-[36px] shrink-0 border border-[#00000014] bg-black/[0.10] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] transition-[background-color,border-color,box-shadow] duration-150 hover:border-[#00000024] hover:bg-black/[0.14] data-[state=checked]:border-[#111111] data-[state=checked]:bg-[#111111] focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-0",
                  )}
                  onCheckedChange={handleEditModeChange}
                />
              </div>
            ) : null}

            <div
              className={cn(
                "inline-flex items-center gap-1",
                isNeutralSurface
                  ? "rounded-[8px] px-1 py-0.5 text-[#00000073]"
                  : "rounded-full border border-slate-300/80 bg-white/84 p-1 text-foreground/70 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]",
              )}
            >
              <IconButton
                ariaLabel="Zoom out preview"
                appearance={surfaceAppearance}
                icon={<ZoomOutIcon />}
                onClick={() => {
                  const currentScene = draftSceneRef.current
                  const nextScene = updateDashboardComposeCamera(currentScene, {
                    zoom: clampDashboardZoom(currentScene.camera.zoom - 0.1),
                  })

                  draftSceneRef.current = nextScene
                  onSceneChangeRef.current(nextScene)
                }}
              />
              <div
                className={cn(
                  "min-w-12 px-1 text-center font-semibold",
                  isNeutralSurface
                    ? "text-[0.68rem] uppercase tracking-[0.08em] text-[#111111]"
                    : "text-[0.72rem] text-foreground/65",
                )}
              >
                {zoomPercent}
              </div>
              <IconButton
                ariaLabel="Zoom in preview"
                appearance={surfaceAppearance}
                icon={<ZoomInIcon />}
                onClick={() => {
                  const currentScene = draftSceneRef.current
                  const nextScene = updateDashboardComposeCamera(currentScene, {
                    zoom: clampDashboardZoom(currentScene.camera.zoom + 0.1),
                  })

                  draftSceneRef.current = nextScene
                  onSceneChangeRef.current(nextScene)
                }}
              />
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-1",
                isNeutralSurface
                  ? "rounded-[8px] px-1 py-0.5"
                  : "rounded-full border border-slate-300/80 bg-white/84 p-1 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]",
              )}
            >
              <IconButton
                ariaLabel="Reset preview position"
                appearance={surfaceAppearance}
                icon={<SearchIcon />}
                onClick={() => {
                  const nextScene = resetDashboardComposeCamera(draftSceneRef.current)

                  draftSceneRef.current = nextScene
                  onSceneChangeRef.current(nextScene)
                }}
              />
              <IconButton
                ariaLabel={isDocumentSurface ? "Fit QR to page" : "Reset QR transform"}
                appearance={surfaceAppearance}
                icon={<MaximizeIcon />}
                onClick={() => {
                  const nextScene = isDocumentSurface
                    ? fitDashboardQrNodeToDocument(
                        resetDashboardQrNodeTransform(draftSceneRef.current, targetQrNodeId),
                        targetQrNodeId,
                      )
                    : resetDashboardQrNodeTransform(draftSceneRef.current, targetQrNodeId)

                  draftSceneRef.current = nextScene
                  onSceneChangeRef.current(nextScene)
                }}
              />
            </div>

            {onAddQrCode ? (
              <div
                className={cn(
                  "inline-flex items-center gap-1",
                  isNeutralSurface
                    ? "rounded-[8px] px-1 py-0.5"
                    : "rounded-full border border-slate-300/80 bg-white/84 p-1 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]",
                )}
              >
                <IconButton
                  ariaLabel="Add QR code"
                  appearance={surfaceAppearance}
                  icon={<CopyPlusIcon />}
                  onClick={onAddQrCode}
                />
              </div>
            ) : null}

            <Button
              data-slot="dashboard-compose-reset"
              variant="ghost"
              className={cn(
                isNeutralSurface
                  ? "rounded-[8px] border-0 bg-transparent px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#111111] shadow-none transition-[background-color,transform,color] duration-150 ease-out hover:-translate-y-px hover:bg-black/[0.04] hover:text-black active:translate-y-0 active:bg-black/[0.06]"
                  : "rounded-full border border-slate-300/80 bg-white/88 text-foreground/68 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)] hover:bg-white",
              )}
              onClick={onReset}
            >
              <RefreshCcwIcon data-icon="inline-start" />
              Reset defaults
            </Button>
          </div>
        </div>

        <div className="absolute inset-0 p-5 sm:p-6 lg:p-8">
          <div
            ref={canvasRef}
            data-slot="dashboard-compose-canvas"
            data-compose-mode={surfaceMode}
            className={cn(
              "absolute left-1/2 top-1/2 max-w-full -translate-x-1/2 -translate-y-1/2",
              isDocumentSurface ? "h-full max-h-full w-auto" : "aspect-[3/2] w-[min(100%,960px)]",
            )}
            style={isDocumentSurface ? canvasFrameStyle : { background: "transparent" }}
          >
            <div
              data-slot="dashboard-compose-world"
              className="absolute inset-0"
              style={{
                transform: `translate(${(renderedScene.camera.panX / renderedScene.canvasSize.width) * 100}%, ${(renderedScene.camera.panY / renderedScene.canvasSize.height) * 100}%) scale(${renderedScene.camera.zoom})`,
                transformOrigin: "0 0",
              }}
            >
              <div
                data-slot="dashboard-compose-stage"
                className={cn(
                  "absolute inset-0 overflow-visible",
                  isDocumentSurface &&
                    "overflow-hidden rounded-[2px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18),0_1px_0_rgba(255,255,255,0.65)_inset]",
                )}
                style={
                  isDocumentSurface
                    ? {
                        background: renderedScene.document.backgroundColor,
                      }
                    : undefined
                }
              >
                {isDocumentSurface && renderedScene.document.showGuides ? (
                  <DocumentGuideOverlay document={renderedScene.document} scene={renderedScene} />
                ) : null}
                {[...renderedScene.nodes]
                  .filter((node) => node.isVisible)
                  .sort((left, right) => {
                    const leftIsSelectedQr =
                      left.id === selectedNodeId && isDashboardQrNodeId(left.id)
                    const rightIsSelectedQr =
                      right.id === selectedNodeId && isDashboardQrNodeId(right.id)

                    if (leftIsSelectedQr !== rightIsSelectedQr) {
                      return leftIsSelectedQr ? 1 : -1
                    }

                    // Lower zIndex values render first so higher ones paint above them.
                    return left.zIndex - right.zIndex
                  })
                  .map((node) => {
                    const isSelected = canSelectNodes && node.id === selectedNodeId
                    const isRotating = node.id === rotatingNodeId
                    const isInteractive = canTransformNodes && !node.isLocked
                    const isQrNode = isDashboardQrNodeId(node.id)
                    const showRotationHandle =
                      !isQrNode || isDocumentSurface || allowDirectNodeTransforms
                    const width = node.naturalWidth * node.scale
                    const height = node.naturalHeight * node.scale

                    return (
                      <div
                        key={node.id}
                        data-node-id={node.id}
                        data-slot="dashboard-compose-node"
                        data-z-index={node.zIndex}
                        data-selected={isSelected ? "true" : "false"}
                        data-locked={node.isLocked ? "true" : "false"}
                        className={
                          isInteractive
                            ? "absolute left-0 top-0 cursor-grab active:cursor-grabbing"
                            : canSelectNodes
                              ? "absolute left-0 top-0 cursor-pointer"
                              : "pointer-events-none absolute left-0 top-0"
                        }
                        style={{
                          height: `${(height / renderedScene.canvasSize.height) * 100}%`,
                          mixBlendMode:
                            node.blendMode as React.CSSProperties["mixBlendMode"],
                          opacity: node.opacity,
                          transform: `translate(${node.x}px, ${node.y}px) rotate(${node.rotation}deg)`,
                          transformOrigin: "center center",
                          width: `${(width / renderedScene.canvasSize.width) * 100}%`,
                          zIndex: isSelected && isQrNode ? 10000 : node.zIndex,
                        }}
                        onPointerDown={(event) => {
                          if (!canSelectNodes) {
                            return
                          }

                          event.stopPropagation()
                          onSelectedNodeChange(node.id)

                          if (!canTransformNodes || node.isLocked) {
                            interactionRef.current = null
                            return
                          }

                          const baseScene = draftSceneRef.current
                          const worldPoint = getWorldPoint(
                            event.nativeEvent,
                            canvasRef.current,
                            baseScene,
                          )

                          if (!worldPoint) {
                            return
                          }

                          interactionRef.current = {
                            kind: "drag-node",
                            scene: baseScene,
                            nodeId: node.id,
                            startWorldX: worldPoint.x,
                            startWorldY: worldPoint.y,
                            startX: node.x,
                            startY: node.y,
                          }
                        }}
                      >
                        <div
                          className={cn(
                            "relative h-full w-full overflow-visible",
                            isSelected &&
                              isQrNode &&
                              "drop-shadow-[0_22px_34px_rgba(15,23,42,0.28)]",
                          )}
                        >
                          {node.kind === "svg" ? (
                            <div
                              className="pointer-events-none h-full w-full [&_svg]:h-full [&_svg]:w-full"
                              dangerouslySetInnerHTML={{ __html: node.originalSvgMarkup }}
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element -- Object URLs back uploaded compose images. */
                            <img
                              alt={node.name}
                              className="pointer-events-none h-full w-full select-none"
                              draggable={false}
                              src={node.imageUrl}
                            />
                          )}

                          {isSelected ? (
                            <>
                              <div
                                className={cn(
                                  "pointer-events-none absolute inset-[-10px] rounded-[4px] border border-black shadow-[0_0_0_1px_rgba(255,255,255,0.72)]",
                                )}
                              />
                              {isQrNode ? (
                                <div className="pointer-events-none absolute bottom-[-2.75rem] left-1/2 -translate-x-1/2 rounded-[4px] border border-black/24 bg-white/92 px-3 py-1 text-[0.72rem] font-semibold text-black/72 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]">
                                  {Math.round(node.naturalWidth)} × {Math.round(node.naturalHeight)}
                                </div>
                              ) : null}
                              {showRotationHandle && isRotating ? (
                                <div className="pointer-events-none absolute left-1/2 top-[-4.7rem] -translate-x-1/2 rounded-[4px] border border-black/24 bg-white/92 px-2 py-1 text-[0.72rem] font-semibold text-black/72 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]">
                                  {Math.round(node.rotation)}°
                                </div>
                              ) : null}
                              {showRotationHandle ? (
                                <div className="pointer-events-none absolute left-1/2 top-[-2.05rem] h-7 w-px -translate-x-1/2 bg-black/72" />
                              ) : null}
                              {canTransformNodes && !node.isLocked ? (
                                <>
                                  {showRotationHandle ? (
                                    <HandleButton
                                      ariaLabel={isQrNode ? "Rotate QR" : `Rotate ${node.name}`}
                                      className="left-1/2 top-[-2.9rem] -translate-x-1/2"
                                      icon={null}
                                      onPointerDown={(event) => {
                                        event.stopPropagation()
                                        const baseScene = draftSceneRef.current
                                        const centerX = node.x + width * 0.5
                                        const centerY = node.y + height * 0.5
                                        const worldPoint = getWorldPoint(
                                          event.nativeEvent,
                                          canvasRef.current,
                                          baseScene,
                                        )

                                        if (!worldPoint) {
                                          return
                                        }

                                        onSelectedNodeChange(node.id)
                                        setRotatingNodeId(node.id)
                                        interactionRef.current = {
                                          kind: "rotate-node",
                                          scene: baseScene,
                                          nodeId: node.id,
                                          centerX,
                                          centerY,
                                          startAngle:
                                            (Math.atan2(
                                              worldPoint.y - centerY,
                                              worldPoint.x - centerX,
                                            ) *
                                              180) /
                                            Math.PI,
                                          startRotation: node.rotation,
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <HandleButton
                                    ariaLabel={
                                      isQrNode
                                        ? "Resize QR from top left"
                                        : `Resize ${node.name} from top left`
                                    }
                                    className="left-[-0.9rem] top-[-0.9rem]"
                                    icon={null}
                                    onPointerDown={(event) =>
                                      startResizeInteraction(event, node, width, height)
                                    }
                                  />
                                  <HandleButton
                                    ariaLabel={
                                      isQrNode
                                        ? "Resize QR from top right"
                                        : `Resize ${node.name} from top right`
                                    }
                                    className="right-[-0.9rem] top-[-0.9rem]"
                                    icon={null}
                                    onPointerDown={(event) =>
                                      startResizeInteraction(event, node, width, height)
                                    }
                                  />
                                  <HandleButton
                                    ariaLabel={
                                      isQrNode
                                        ? "Resize QR from bottom left"
                                        : `Resize ${node.name} from bottom left`
                                    }
                                    className="bottom-[-0.9rem] left-[-0.9rem]"
                                    icon={null}
                                    onPointerDown={(event) =>
                                      startResizeInteraction(event, node, width, height)
                                    }
                                  />
                                  <HandleButton
                                    ariaLabel={
                                      isQrNode
                                        ? "Resize QR from bottom right"
                                        : `Resize ${node.name} from bottom right`
                                    }
                                    className="bottom-[-0.9rem] right-[-0.9rem]"
                                    icon={null}
                                    onPointerDown={(event) =>
                                      startResizeInteraction(event, node, width, height)
                                    }
                                  />
                                </>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>

        {!qrNode ? (
          <div className="absolute inset-0 grid place-items-center text-center text-sm font-medium text-foreground/48">
            Preparing QR surface
          </div>
        ) : null}
      </div>
    </div>
  )
}

function IconButton({
  ariaLabel,
  appearance = "dashboard",
  icon,
  onClick,
}: {
  ariaLabel: string
  appearance?: "dashboard" | "neutral"
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className={cn(
        "p-0",
        appearance === "neutral"
          ? "h-9 w-9 rounded-[8px] border-0 bg-black/[0.03] text-[#111111] shadow-[0_0_18px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.03)] transition-[background-color,box-shadow,transform,color] duration-150 ease-out hover:-translate-y-px hover:bg-black/[0.06] hover:shadow-[0_0_24px_rgba(0,0,0,0.10),0_4px_10px_rgba(0,0,0,0.06)] active:translate-y-0 active:bg-black/[0.07] active:shadow-[0_0_14px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]"
          : "h-8 w-8 rounded-full border border-slate-300/80 bg-white/92 text-foreground/72 shadow-none hover:bg-white",
      )}
      onClick={onClick}
      size="icon"
      type="button"
      variant="ghost"
    >
      {icon}
    </Button>
  )
}

function DocumentGuideOverlay({
  document,
  scene,
}: {
  document: DashboardComposeDocument
  scene: DashboardComposeScene
}) {
  const insetX = `${(document.margin / scene.canvasSize.width) * 100}%`
  const insetY = `${(document.margin / scene.canvasSize.height) * 100}%`

  return (
    <div
      aria-hidden="true"
      data-slot="dashboard-compose-document-guides"
      className="pointer-events-none absolute inset-0"
    >
      <div
        className="absolute border border-dashed border-black/18"
        style={{
          bottom: insetY,
          left: insetX,
          right: insetX,
          top: insetY,
        }}
      />
    </div>
  )
}

function HandleButton({
  ariaLabel,
  className,
  icon,
  onPointerDown,
}: {
  ariaLabel: string
  className: string
  icon: React.ReactNode
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`absolute flex h-6 w-6 items-center justify-center rounded-[4px] border border-black bg-white text-black shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)] ${className}`}
      onPointerDown={onPointerDown}
      type="button"
    >
      {icon}
    </button>
  )
}

function getNextInteractionResult({
  canvas,
  event,
  interaction,
}: {
  canvas: HTMLDivElement | null
  event: PointerEvent
  interaction: Interaction
}): InteractionResult | null {
  if (interaction.kind === "pan-canvas") {
    const canvasRect = canvas?.getBoundingClientRect()

    if (!canvasRect) {
      return null
    }

    return {
      scene: updateDashboardComposeCamera(interaction.scene, {
        panX:
          interaction.startPanX +
          ((event.clientX - interaction.startClientX) / canvasRect.width) *
            interaction.scene.canvasSize.width,
        panY:
          interaction.startPanY +
          ((event.clientY - interaction.startClientY) / canvasRect.height) *
            interaction.scene.canvasSize.height,
      }),
    }
  }

  const worldPoint = getWorldPoint(event, canvas, interaction.scene)

  if (!worldPoint) {
    return null
  }

  if (interaction.kind === "drag-node") {
    return {
      scene: updateDashboardComposeNode(interaction.scene, interaction.nodeId, {
        x: interaction.startX + (worldPoint.x - interaction.startWorldX),
        y: interaction.startY + (worldPoint.y - interaction.startWorldY),
      }),
    }
  }

  if (interaction.kind === "resize-node") {
    const nextDistance = Math.max(
      1,
      Math.hypot(worldPoint.x - interaction.centerX, worldPoint.y - interaction.centerY),
    )
    const resizeRatio = nextDistance / interaction.startDistance

    if (interaction.nodeKind === "svg" && isDashboardQrNodeId(interaction.nodeId)) {
      const nextSize = getNextDashboardQrSize({
        nextDistance,
        startDistance: interaction.startDistance,
        startSize: interaction.qrSize,
      })
      const nextWidth = nextSize * interaction.scale
      const nextHeight = nextSize * interaction.scale

      return {
        scene: updateDashboardComposeNode(interaction.scene, interaction.nodeId, {
          naturalHeight: nextSize,
          naturalWidth: nextSize,
          x: interaction.centerX - nextWidth * 0.5,
          y: interaction.centerY - nextHeight * 0.5,
        }),
        qrSize: nextSize,
      }
    }

    const nextScale = clampDashboardLayerScale(interaction.startScale * resizeRatio)
    const nextWidth = interaction.naturalWidth * nextScale
    const nextHeight = interaction.naturalHeight * nextScale

    return {
      scene: updateDashboardComposeNode(interaction.scene, interaction.nodeId, {
        scale: nextScale,
        x: interaction.centerX - nextWidth * 0.5,
        y: interaction.centerY - nextHeight * 0.5,
      }),
    }
  }

  const angle =
    (Math.atan2(
      worldPoint.y - interaction.centerY,
      worldPoint.x - interaction.centerX,
    ) *
      180) /
    Math.PI

  return {
    scene: updateDashboardComposeNode(interaction.scene, interaction.nodeId, {
      rotation: angle - interaction.startAngle + interaction.startRotation,
    }),
  }
}

function getWorldPoint(
  event: Pick<PointerEvent, "clientX" | "clientY">,
  canvas: HTMLDivElement | null,
  scene: DashboardComposeScene,
) {
  const rect = canvas?.getBoundingClientRect()

  if (!rect) {
    return null
  }

  const localX = ((event.clientX - rect.left) / rect.width) * scene.canvasSize.width
  const localY = ((event.clientY - rect.top) / rect.height) * scene.canvasSize.height

  return {
    x: (localX - scene.camera.panX) / scene.camera.zoom,
    y: (localY - scene.camera.panY) / scene.camera.zoom,
  }
}

export function getDashboardCanvasBackgroundStyle(
  background: DashboardComposeBackground,
) {
  if (background.mode === "solid") {
    return {
      background: background.color,
    }
  }

  if (background.mode === "gradient") {
    const start = background.gradient.colorStops[0]
    const end = background.gradient.colorStops[1]
    const rotation = (background.gradient.rotation * 180) / Math.PI

    return {
      background:
        background.gradient.type === "radial"
          ? `radial-gradient(circle, ${start.color} ${start.offset * 100}%, ${end.color} ${end.offset * 100}%)`
          : `linear-gradient(${rotation}deg, ${start.color} ${start.offset * 100}%, ${end.color} ${end.offset * 100}%)`,
    }
  }

  return {
    background: "transparent",
  }
}

export function getNextDashboardQrSize({
  nextDistance,
  startDistance,
  startSize,
}: {
  nextDistance: number
  startDistance: number
  startSize: number
}) {
  if (!Number.isFinite(nextDistance) || !Number.isFinite(startDistance) || startDistance <= 0) {
    return clampQrSize(startSize)
  }

  return clampQrSize(startSize * (nextDistance / startDistance))
}

function clampDashboardLayerScale(scale: number) {
  if (!Number.isFinite(scale)) {
    return 1
  }

  return Math.min(6, Math.max(0.1, scale))
}
