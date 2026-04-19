"use client"

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import {
  MaximizeIcon,
  RefreshCcwIcon,
  RotateCwIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import {
  clampDashboardZoom,
  computeDashboardZoomedCamera,
  DASHBOARD_QR_NODE_ID,
  getDashboardComposeNode,
  resetDashboardComposeCamera,
  resetDashboardQrNodeTransform,
  type DashboardComposeScene,
  updateDashboardComposeCamera,
  updateDashboardComposeNode,
} from "@/components/qr/dashboard-compose-scene"
import { Button } from "@/components/ui/button"

type DashboardComposeSurfaceProps = {
  errorMessage?: string | null
  onReset: () => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  scene: DashboardComposeScene
}

type Interaction =
  | {
      kind: "drag-node"
      nodeId: string
      startWorldX: number
      startWorldY: number
      startX: number
      startY: number
    }
  | {
      kind: "pan-canvas"
      startClientX: number
      startClientY: number
      startPanX: number
      startPanY: number
    }
  | {
      kind: "resize-node"
      centerX: number
      centerY: number
      naturalHeight: number
      naturalWidth: number
      nodeId: string
      startDistance: number
      startScale: number
    }
  | {
      kind: "rotate-node"
      centerX: number
      centerY: number
      nodeId: string
      startAngle: number
      startRotation: number
    }

export function DashboardComposeSurface({
  errorMessage,
  onReset,
  onSceneChange,
  scene,
}: DashboardComposeSurfaceProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(DASHBOARD_QR_NODE_ID)
  const [rotatingNodeId, setRotatingNodeId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<Interaction | null>(null)

  const qrNode = getDashboardComposeNode(scene)
  const zoomPercent = `${Math.round(scene.camera.zoom * 100)}%`

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current

      if (!interaction) {
        return
      }

      event.preventDefault()

      if (interaction.kind === "pan-canvas") {
        const canvasRect = canvasRef.current?.getBoundingClientRect()

        if (!canvasRect) {
          return
        }

        onSceneChange((current) =>
          updateDashboardComposeCamera(current, {
            panX:
              interaction.startPanX +
              ((event.clientX - interaction.startClientX) / canvasRect.width) *
                current.canvasSize.width,
            panY:
              interaction.startPanY +
              ((event.clientY - interaction.startClientY) / canvasRect.height) *
                current.canvasSize.height,
          }),
        )
        return
      }

      const worldPoint = getWorldPoint(event, canvasRef.current, scene)

      if (!worldPoint) {
        return
      }

      if (interaction.kind === "drag-node") {
        onSceneChange((current) =>
          updateDashboardComposeNode(current, interaction.nodeId, {
            x: interaction.startX + (worldPoint.x - interaction.startWorldX),
            y: interaction.startY + (worldPoint.y - interaction.startWorldY),
          }),
        )
        return
      }

      if (interaction.kind === "resize-node") {
        const nextDistance = Math.max(
          1,
          Math.hypot(worldPoint.x - interaction.centerX, worldPoint.y - interaction.centerY),
        )
        const nextScale = Math.max(
          0.1,
          interaction.startScale * (nextDistance / interaction.startDistance),
        )
        const nextWidth = interaction.naturalWidth * nextScale
        const nextHeight = interaction.naturalHeight * nextScale

        onSceneChange((current) =>
          updateDashboardComposeNode(current, interaction.nodeId, {
            scale: nextScale,
            x: interaction.centerX - nextWidth * 0.5,
            y: interaction.centerY - nextHeight * 0.5,
          }),
        )
        return
      }

      const angle =
        (Math.atan2(
          worldPoint.y - interaction.centerY,
          worldPoint.x - interaction.centerX,
        ) *
          180) /
        Math.PI

      onSceneChange((current) =>
        updateDashboardComposeNode(current, interaction.nodeId, {
          rotation: angle - interaction.startAngle + interaction.startRotation,
        }),
      )
    }

    const onPointerUp = () => {
      interactionRef.current = null
      setRotatingNodeId(null)
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, [onSceneChange, scene])

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()

    const anchor = getWorldPoint(event.nativeEvent, canvasRef.current, scene)

    if (!anchor) {
      return
    }

    const multiplier = event.deltaY < 0 ? 1.1 : 0.9

    onSceneChange((current) => ({
      ...current,
      camera: computeDashboardZoomedCamera(current, current.camera.zoom * multiplier, anchor),
    }))
  }

  return (
    <div
      data-slot="dashboard-compose-surface"
      className="relative h-full min-h-[22rem] overflow-hidden bg-slate-100 select-none touch-none"
      style={{
        backgroundColor: "#e8edf4",
        backgroundImage:
          "linear-gradient(45deg, rgba(255,255,255,0.56) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.56) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.56) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.56) 75%)",
        backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0",
        backgroundSize: "36px 36px",
      }}
    >
      <div
        data-slot="dashboard-compose-viewport"
        data-background-mode={scene.background.mode}
        className="absolute inset-0"
        onPointerDown={(event) => {
          setSelectedNodeId(null)
          interactionRef.current = {
            kind: "pan-canvas",
            startClientX: event.clientX,
            startClientY: event.clientY,
            startPanX: scene.camera.panX,
            startPanY: scene.camera.panY,
          }
        }}
        onWheel={handleWheel}
      >
        {errorMessage ? (
          <div className="pointer-events-none absolute inset-x-5 top-4 z-20 flex sm:inset-x-6 lg:inset-x-8">
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
          <div className="pointer-events-auto inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-[1.75rem] border border-slate-300/80 bg-white/84 px-2 py-2 text-foreground/70 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)] backdrop-blur">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-white/84 p-1 text-foreground/70 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]">
              <IconButton
                ariaLabel="Zoom out preview"
                icon={<ZoomOutIcon />}
                onClick={() =>
                  onSceneChange((current) =>
                    updateDashboardComposeCamera(current, {
                      zoom: clampDashboardZoom(current.camera.zoom - 0.1),
                    }),
                  )
                }
              />
              <div className="min-w-12 px-1 text-center text-[0.72rem] font-semibold text-foreground/65">
                {zoomPercent}
              </div>
              <IconButton
                ariaLabel="Zoom in preview"
                icon={<ZoomInIcon />}
                onClick={() =>
                  onSceneChange((current) =>
                    updateDashboardComposeCamera(current, {
                      zoom: clampDashboardZoom(current.camera.zoom + 0.1),
                    }),
                  )
                }
              />
            </div>

            <div className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-white/84 p-1 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]">
              <IconButton
                ariaLabel="Reset preview position"
                icon={<SearchIcon />}
                onClick={() => onSceneChange((current) => resetDashboardComposeCamera(current))}
              />
              <IconButton
                ariaLabel="Reset QR transform"
                icon={<MaximizeIcon />}
                onClick={() => onSceneChange((current) => resetDashboardQrNodeTransform(current))}
              />
            </div>

            <Button
              data-slot="dashboard-compose-reset"
              variant="ghost"
              className="rounded-full border border-slate-300/80 bg-white/88 text-foreground/68 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)] hover:bg-white"
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
            className="absolute left-1/2 top-1/2 aspect-[3/2] w-[min(100%,960px)] max-w-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background: scene.background.mode === "solid" ? scene.background.color : "transparent",
            }}
          >
            <div
              data-slot="dashboard-compose-world"
              className="absolute inset-0"
              style={{
                transform: `translate(${(scene.camera.panX / scene.canvasSize.width) * 100}%, ${(scene.camera.panY / scene.canvasSize.height) * 100}%) scale(${scene.camera.zoom})`,
                transformOrigin: "0 0",
              }}
            >
              <div data-slot="dashboard-compose-stage" className="absolute inset-0 overflow-visible">
                {[...scene.nodes]
                  .sort((left, right) => left.zIndex - right.zIndex)
                  .map((node) => {
                    const isSelected = node.id === selectedNodeId
                    const isRotating = node.id === rotatingNodeId
                    const width = node.naturalWidth * node.scale
                    const height = node.naturalHeight * node.scale

                    return (
                      <div
                        key={node.id}
                        data-slot="dashboard-compose-node"
                        data-selected={isSelected ? "true" : "false"}
                        className="absolute left-0 top-0 cursor-grab active:cursor-grabbing"
                        style={{
                          height: `${(height / scene.canvasSize.height) * 100}%`,
                          transform: `translate(${(node.x / scene.canvasSize.width) * 100}%, ${(node.y / scene.canvasSize.height) * 100}%) rotate(${node.rotation}deg)`,
                          transformOrigin: "center center",
                          width: `${(width / scene.canvasSize.width) * 100}%`,
                        }}
                        onPointerDown={(event) => {
                          event.stopPropagation()
                          const worldPoint = getWorldPoint(event.nativeEvent, canvasRef.current, scene)

                          if (!worldPoint) {
                            return
                          }

                          setSelectedNodeId(node.id)
                          interactionRef.current = {
                            kind: "drag-node",
                            nodeId: node.id,
                            startWorldX: worldPoint.x,
                            startWorldY: worldPoint.y,
                            startX: node.x,
                            startY: node.y,
                          }
                        }}
                      >
                        <div className="relative h-full w-full overflow-visible">
                          <div
                            className="pointer-events-none h-full w-full [&_svg]:h-full [&_svg]:w-full"
                            dangerouslySetInnerHTML={{ __html: node.originalSvgMarkup }}
                          />

                          {isSelected ? (
                            <>
                              <div className="pointer-events-none absolute inset-[-10px] rounded-[2px] border border-sky-600 shadow-[0_0_0_1px_rgba(255,255,255,0.72)]" />
                              <div className="pointer-events-none absolute left-1/2 top-[-2.75rem] -translate-x-1/2 rounded-full border border-slate-300/90 bg-white/92 px-3 py-1 text-[0.72rem] font-semibold text-slate-600 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]">
                                {Math.round(width)} × {Math.round(height)}
                              </div>
                              {isRotating ? (
                                <div className="pointer-events-none absolute left-1/2 top-[-4.7rem] -translate-x-1/2 rounded-full border border-slate-300/90 bg-white/92 px-2 py-1 text-[0.72rem] font-semibold text-slate-600 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)]">
                                  {Math.round(node.rotation)}°
                                </div>
                              ) : null}
                              <div className="pointer-events-none absolute left-1/2 top-[-2.05rem] h-7 w-px -translate-x-1/2 bg-sky-600/70" />
                              <HandleButton
                                ariaLabel="Rotate QR"
                                className="left-1/2 top-[-2.9rem] -translate-x-1/2"
                                icon={<RotateCwIcon className="size-3" />}
                                onPointerDown={(event) => {
                                  event.stopPropagation()
                                  const centerX = node.x + width * 0.5
                                  const centerY = node.y + height * 0.5
                                  const worldPoint = getWorldPoint(
                                    event.nativeEvent,
                                    canvasRef.current,
                                    scene,
                                  )

                                  if (!worldPoint) {
                                    return
                                  }

                                  setSelectedNodeId(node.id)
                                  setRotatingNodeId(node.id)
                                  interactionRef.current = {
                                    kind: "rotate-node",
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
                              <CornerHandle className="left-[-0.9rem] top-[-0.9rem]" />
                              <CornerHandle className="right-[-0.9rem] top-[-0.9rem]" />
                              <CornerHandle className="bottom-[-0.9rem] left-[-0.9rem]" />
                              <HandleButton
                                ariaLabel="Resize QR"
                                className="bottom-[-0.9rem] right-[-0.9rem]"
                                icon={null}
                                onPointerDown={(event) => {
                                  event.stopPropagation()
                                  const centerX = node.x + width * 0.5
                                  const centerY = node.y + height * 0.5
                                  const worldPoint = getWorldPoint(
                                    event.nativeEvent,
                                    canvasRef.current,
                                    scene,
                                  )

                                  if (!worldPoint) {
                                    return
                                  }

                                  setSelectedNodeId(node.id)
                                  interactionRef.current = {
                                    kind: "resize-node",
                                    nodeId: node.id,
                                    centerX,
                                    centerY,
                                    naturalHeight: node.naturalHeight,
                                    naturalWidth: node.naturalWidth,
                                    startDistance: Math.max(
                                      1,
                                      Math.hypot(worldPoint.x - centerX, worldPoint.y - centerY),
                                    ),
                                    startScale: node.scale,
                                  }
                                }}
                              />
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
  icon,
  onClick,
}: {
  ariaLabel: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className="h-8 w-8 rounded-full border border-slate-300/80 bg-white/92 p-0 text-foreground/72 shadow-none hover:bg-white"
      onClick={onClick}
      size="icon"
      type="button"
      variant="ghost"
    >
      {icon}
    </Button>
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
      className={`absolute flex h-7 w-7 items-center justify-center rounded-full border border-sky-600 bg-white text-sky-700 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.9)] ${className}`}
      onPointerDown={onPointerDown}
      type="button"
    >
      {icon}
    </button>
  )
}

function CornerHandle({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute h-5 w-5 rounded-[0.45rem] border border-sky-600 bg-white shadow-[0_8px_20px_-18px_rgba(15,23,42,0.9)] ${className}`}
    />
  )
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
