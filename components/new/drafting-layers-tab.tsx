"use client"

import { useMemo, type ReactNode } from "react"
import { Trash2Icon, Layers3Icon } from "lucide-react"

import {
  DASHBOARD_QR_NODE_ID,
  isDashboardQrNodeId,
} from "@/components/qr/dashboard-compose-scene"
import {
  DraggableList,
  DraggableListHandle,
  DraggableListItem,
} from "@/components/ui/draggable-list"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DraftingLayerPane = {
  id: string
  name: string
}

type DraftingLayersTabProps = {
  onReorder: (orderedIds: string[]) => void
  onRemoveNode?: (nodeId: string) => void
  onSelectedNodeChange: (nodeId: string | null) => void
  panes: DraftingLayerPane[]
  selectedNodeId: string | null
}

export function DraftingLayersTab({
  onReorder,
  onRemoveNode,
  onSelectedNodeChange,
  panes,
  selectedNodeId,
}: DraftingLayersTabProps) {
  const layerNodes = useMemo(() => [...panes], [panes])
  const isSingleLayer = layerNodes.length <= 1
  const qrNodeCount = layerNodes.filter((p) => isDashboardQrNodeId(p.id)).length

  return (
    <section data-slot="drafting-layers-tab" className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="drafting-type-section-title font-semibold text-[var(--drafting-ink)]">
            Layers
          </p>
          <p className="drafting-type-body mt-1 text-[var(--drafting-ink-muted)]">
            Reorder and manage the current QR stack.
          </p>
        </div>
        <span className="drafting-type-data shrink-0 text-[var(--drafting-ink-muted)]">
          {layerNodes.length} total
        </span>
      </div>

      {layerNodes.length === 0 ? (
        <div
          data-slot="drafting-layers-empty-state"
          className="drafting-type-body rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-4 py-3 text-[var(--drafting-ink-muted)] shadow-[var(--drafting-shadow-rest)]"
        >
          The layer stack will appear here once there is content.
        </div>
      ) : (
        <DraggableList
          className="min-w-0 gap-2"
          items={layerNodes}
          onReorder={(nextNodes) =>
            onReorder(nextNodes.map((node) => node.id))
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
                    "min-w-0 overflow-hidden rounded-[8px] border px-3 py-3 shadow-[var(--drafting-shadow-rest)] transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
                    "border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] hover:-translate-y-px hover:border-[var(--drafting-line-hover)] hover:bg-[var(--drafting-panel-bg-hover)] hover:shadow-[var(--drafting-shadow-hover)]",
                    isSelected &&
                      "border-[var(--drafting-ink)] bg-[var(--drafting-panel-bg-active)] shadow-[var(--drafting-shadow-rest)]",
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
                      <p className="drafting-type-control-label truncate font-semibold text-[var(--drafting-ink)]">
                        {node.name}
                      </p>
                      <p className="drafting-type-meta mt-1 truncate text-[var(--drafting-ink-muted)]">
                        {getLayerRowMeta(node, index, layerNodes.length, isSelected)}
                      </p>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      {isRemovable && onRemoveNode ? (
                        <IconActionButton
                          ariaLabel={`Delete ${node.name}`}
                          className="border-[var(--drafting-line-strong)] text-[var(--drafting-ink)] hover:bg-[var(--drafting-control-bg-active)] hover:text-[var(--drafting-ink)]"
                          onClick={() => {
                            const fallbackNodeId =
                              panes.find(
                                (currentNode) =>
                                  currentNode.id !== node.id &&
                                  isDashboardQrNodeId(currentNode.id),
                              )?.id ?? DASHBOARD_QR_NODE_ID

                            onRemoveNode(node.id)
                            if (selectedNodeId === node.id) {
                              onSelectedNodeChange(fallbackNodeId)
                            }
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
  node: DraftingLayerPane,
  index: number,
  totalLayers: number,
  isSelected: boolean,
) {
  const labels = [getLayerOrderLabel(index, totalLayers), "QR"]

  if (isSelected) {
    labels.push("Selected")
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
