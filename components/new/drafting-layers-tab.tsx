"use client"

import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { EyeIcon, EyeOffIcon, Layers3Icon, LockIcon, LockOpenIcon, Trash2Icon } from "lucide-react"

import {
  DASHBOARD_QR_NODE_ID,
  getDashboardQrNodes,
  isDashboardQrNodeId,
  reorderDashboardComposeNodes,
  removeDashboardComposeNode,
  updateDashboardComposeNode,
  type DashboardComposeNode,
  type DashboardComposeScene,
} from "@/components/qr/dashboard-compose-scene"
import {
  DraggableList,
  DraggableListHandle,
  DraggableListItem,
} from "@/components/ui/draggable-list"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DraftingLayersTabProps = {
  onSceneChange: Dispatch<SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  scene: DashboardComposeScene
  selectedNodeId: string | null
}

export function DraftingLayersTab({
  onSceneChange,
  onSelectedNodeChange,
  scene,
  selectedNodeId,
}: DraftingLayersTabProps) {
  const layerNodes = useMemo(
    () => [...scene.nodes].sort((left, right) => right.zIndex - left.zIndex),
    [scene.nodes],
  )
  const isSingleLayer = layerNodes.length <= 1
  const qrNodeCount = getDashboardQrNodes(scene).length

  return (
    <section data-slot="drafting-layers-tab" className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--drafting-ink)]">
            Layers
          </p>
          <p className="mt-1 text-[0.72rem] leading-5 text-[var(--drafting-ink-muted)]">
            Reorder and manage the current canvas stack.
          </p>
        </div>
        <span className="shrink-0 text-[0.72rem] text-[var(--drafting-ink-muted)]">
          {layerNodes.length} total
        </span>
      </div>

      {layerNodes.length === 0 ? (
        <div
          data-slot="drafting-layers-empty-state"
          className="rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-4 py-3 text-[0.72rem] leading-5 text-[var(--drafting-ink-muted)] shadow-[var(--drafting-shadow-rest)] dark:border-border dark:bg-card/80 dark:text-muted-foreground dark:shadow-[var(--drafting-shadow-rest)]"
        >
          The layer stack will appear here once the canvas has content.
        </div>
      ) : (
        <DraggableList
          className="min-w-0 gap-2"
          items={layerNodes}
          onReorder={(nextNodes) =>
            onSceneChange((current) =>
              reorderDashboardComposeNodes(
                current,
                nextNodes.map((node) => node.id),
              ),
            )
          }
        >
          {layerNodes.map((node, index) => {
            const isSelected = node.id === selectedNodeId
            const isRemovable = !isDashboardQrNodeId(node.id) || qrNodeCount > 1

            return (
              <DraggableListItem
                key={node.id}
                disabled={isSingleLayer}
                className={cn("min-w-0 rounded-[8px]", isSelected && "z-10")}
                value={node}
              >
                <div
                  data-slot="drafting-layer-row"
                  data-node-id={node.id}
                  data-selected={isSelected ? "true" : "false"}
                  className={cn(
                    "min-w-0 overflow-hidden rounded-[8px] border px-3 py-3 shadow-[var(--drafting-shadow-rest)] transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out dark:shadow-[var(--drafting-shadow-rest)]",
                    "border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] hover:-translate-y-px hover:border-[var(--drafting-line-hover)] hover:bg-[var(--drafting-panel-bg-hover)] hover:shadow-[var(--drafting-shadow-hover)] dark:border-border dark:bg-card/80 dark:hover:border-border/80 dark:hover:bg-card dark:hover:shadow-[var(--drafting-shadow-hover)]",
                    isSelected &&
                      "border-[var(--drafting-ink)] bg-[var(--drafting-panel-bg-active)] shadow-[var(--drafting-shadow-rest)] dark:border-ring/70 dark:bg-accent/70 dark:shadow-[var(--drafting-shadow-rest)]",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0">
                      <DraggableListHandle
                        className="rounded-[6px] border-transparent bg-[var(--drafting-control-bg)] text-[var(--drafting-ink-subtle)] hover:bg-[var(--drafting-panel-bg-hover)] hover:text-[var(--drafting-ink)]"
                        label={`Reorder ${node.name}`}
                      />
                    </div>

                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => onSelectedNodeChange(node.id)}
                      type="button"
                    >
                      <p className="truncate text-[0.82rem] font-semibold text-[var(--drafting-ink)]">
                        {node.name}
                      </p>
                      <p className="mt-1 truncate text-[0.68rem] uppercase tracking-[0.12em] text-[var(--drafting-ink-muted)]">
                        {getLayerRowMeta(node, index, layerNodes.length, isSelected)}
                      </p>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <IconActionButton
                        ariaLabel={node.isVisible ? `Hide ${node.name}` : `Show ${node.name}`}
                        onClick={() =>
                          onSceneChange((current) =>
                            updateDashboardComposeNode(current, node.id, {
                              isVisible: !node.isVisible,
                            }),
                          )
                        }
                      >
                        {node.isVisible ? (
                          <EyeIcon className="size-3.5" />
                        ) : (
                          <EyeOffIcon className="size-3.5" />
                        )}
                      </IconActionButton>
                      <IconActionButton
                        ariaLabel={node.isLocked ? `Unlock ${node.name}` : `Lock ${node.name}`}
                        onClick={() =>
                          onSceneChange((current) =>
                            updateDashboardComposeNode(current, node.id, {
                              isLocked: !node.isLocked,
                            }),
                          )
                        }
                      >
                        {node.isLocked ? (
                          <LockOpenIcon className="size-3.5" />
                        ) : (
                          <LockIcon className="size-3.5" />
                        )}
                      </IconActionButton>
                      {isRemovable ? (
                        <IconActionButton
                          ariaLabel={`Delete ${node.name}`}
                          className="border-[var(--drafting-line-strong)] text-[var(--drafting-ink)] hover:bg-[var(--drafting-control-bg-active)] hover:text-[var(--drafting-ink)]"
                        onClick={() => {
                            const fallbackNodeId =
                              scene.nodes.find(
                                (currentNode) =>
                                  currentNode.id !== node.id &&
                                  isDashboardQrNodeId(currentNode.id),
                              )?.id ?? DASHBOARD_QR_NODE_ID

                            onSceneChange((current) => removeDashboardComposeNode(current, node.id))
                            onSelectedNodeChange(selectedNodeId === node.id ? fallbackNodeId : selectedNodeId)
                          }}
                        >
                          <Trash2Icon className="size-3.5" />
                        </IconActionButton>
                      ) : null}
                    </div>
                  </div>
                </div>
              </DraggableListItem>
            )
          })}
        </DraggableList>
      )}
    </section>
  )
}

function IconActionButton({
  ariaLabel,
  children,
  className,
  onClick,
}: {
  ariaLabel: string
  children: ReactNode
  className?: string
  onClick: () => void
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className={cn(
        "rounded-[6px] border border-transparent bg-[var(--drafting-control-bg)] text-[var(--drafting-ink-muted)] shadow-none transition-[color,box-shadow,background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[var(--drafting-panel-bg-hover)] hover:text-[var(--drafting-ink)] hover:shadow-[var(--drafting-shadow-hover)] active:translate-y-0 active:bg-[var(--drafting-panel-bg-hover)]",
        className,
      )}
      onClick={onClick}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      {children}
    </Button>
  )
}

function getLayerRowMeta(
  node: DashboardComposeNode,
  index: number,
  totalLayers: number,
  isSelected: boolean,
) {
  const labels = [getLayerOrderLabel(index, totalLayers), node.kind === "image" ? "Image" : "QR"]

  if (isSelected) {
    labels.push("Selected")
  }

  if (!node.isVisible) {
    labels.push("Hidden")
  }

  if (node.isLocked) {
    labels.push("Locked")
  }

  return labels.join(" · ")
}

function getLayerOrderLabel(index: number, totalLayers: number) {
  if (index === 0) {
    return "Top"
  }

  if (index === totalLayers - 1) {
    return "Bottom"
  }

  return `Layer ${totalLayers - index}`
}

export const DRAFTING_LAYERS_TAB_ICON = Layers3Icon
