"use client"

import { useMemo, type ReactNode } from "react"
import { Trash2Icon, Layers3Icon } from "lucide-react"

import {
  DASHBOARD_QR_NODE_ID,
  isDashboardQrNodeId,
} from "@/components/qr/dashboard-compose-scene"
import type { DraftingCanvasLayer } from "@/components/new/drafting-layer-state"
import {
  DraggableList,
  DraggableListHandle,
  DraggableListItem,
} from "@/components/ui/draggable-list"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DraftingLayerPane = {
  blur?: number
  height?: number
  id: string
  isLocked?: boolean
  isVisible?: boolean
  kind?: DraftingCanvasLayer["kind"]
  name: string
  opacity?: number
  shadow?: DraftingCanvasLayer["shadow"]
  width?: number
  x?: number
  y?: number
}

type DraftingLayersTabProps = {
  onLayerPatch?: (layerId: string, patch: Partial<DraftingCanvasLayer>) => void
  onReorder: (orderedIds: string[]) => void
  onRemoveNode?: (nodeId: string) => void
  onSelectedNodeChange: (nodeId: string | null) => void
  panes: DraftingLayerPane[]
  selectedNodeId: string | null
}

export function DraftingLayersTab({
  onLayerPatch,
  onReorder,
  onRemoveNode,
  onSelectedNodeChange,
  panes,
  selectedNodeId,
}: DraftingLayersTabProps) {
  const layerNodes = useMemo(() => [...panes], [panes])
  const isSingleLayer = layerNodes.length <= 1
  const qrNodeCount = layerNodes.filter(
    (p) => p.kind !== "card" && isDashboardQrNodeId(p.id),
  ).length
  const selectedLayer = layerNodes.find((node) => node.id === selectedNodeId)

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
            const isQrPaneRow = node.kind === undefined
            const isRemovable =
              isQrPaneRow && (!isDashboardQrNodeId(node.id) || qrNodeCount > 1)

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

      {selectedLayer && onLayerPatch ? (
        <LayerInspector layer={selectedLayer} onLayerPatch={onLayerPatch} />
      ) : null}
    </section>
  )
}

function LayerInspector({
  layer,
  onLayerPatch,
}: {
  layer: DraftingLayerPane
  onLayerPatch: (layerId: string, patch: Partial<DraftingCanvasLayer>) => void
}) {
  const shadow = layer.shadow ?? {
    blur: 0,
    color: "#111827",
    offsetX: 0,
    offsetY: 0,
    opacity: 0,
  }

  return (
    <section
      data-slot="drafting-layer-inspector"
      className="min-w-0 space-y-3 rounded-[8px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-4 py-3 shadow-[var(--drafting-shadow-rest)]"
    >
      <div>
        <p className="drafting-type-control-label font-semibold text-[var(--drafting-ink)]">
          Inspector
        </p>
        <p className="drafting-type-body mt-1 text-[var(--drafting-ink-muted)]">
          Position, size, and layer effects.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <LayerNumberInput label="X" value={layer.x ?? 0} onChange={(x) => onLayerPatch(layer.id, { x })} />
        <LayerNumberInput label="Y" value={layer.y ?? 0} onChange={(y) => onLayerPatch(layer.id, { y })} />
        <LayerNumberInput label="W" min={1} value={layer.width ?? 1} onChange={(width) => onLayerPatch(layer.id, { width, ...(layer.kind === "qr" ? { height: width } : {}) })} />
        <LayerNumberInput label="H" min={1} value={layer.height ?? 1} disabled={layer.kind === "qr"} onChange={(height) => onLayerPatch(layer.id, { height })} />
        <LayerNumberInput label="Opacity" max={100} min={0} value={Math.round((layer.opacity ?? 1) * 100)} onChange={(opacity) => onLayerPatch(layer.id, { opacity: opacity / 100 })} />
        <LayerNumberInput label="Blur" max={96} min={0} value={layer.blur ?? 0} onChange={(blur) => onLayerPatch(layer.id, { blur })} />
      </div>

      <div className="space-y-2">
        <p className="drafting-type-control-label font-semibold text-[var(--drafting-ink)]">
          Shadow
        </p>
        <label className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2">
          <input
            aria-label="Layer shadow color swatch"
            className="h-9 w-9 rounded-[6px] border border-[var(--drafting-line)] bg-transparent p-1"
            type="color"
            value={shadow.color}
            onChange={(event) =>
              onLayerPatch(layer.id, {
                shadow: { ...shadow, color: event.currentTarget.value },
              })
            }
          />
          <input
            aria-label="Layer shadow color"
            className="drafting-type-input h-9 min-w-0 rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-2 text-[var(--drafting-ink)] shadow-none"
            value={shadow.color}
            onChange={(event) =>
              onLayerPatch(layer.id, {
                shadow: { ...shadow, color: event.currentTarget.value },
              })
            }
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <LayerNumberInput label="Shadow blur" max={128} min={0} value={shadow.blur} onChange={(blur) => onLayerPatch(layer.id, { shadow: { ...shadow, blur } })} />
          <LayerNumberInput label="Shadow %" max={100} min={0} value={shadow.opacity} onChange={(opacity) => onLayerPatch(layer.id, { shadow: { ...shadow, opacity } })} />
          <LayerNumberInput label="Offset X" max={256} min={-256} value={shadow.offsetX} onChange={(offsetX) => onLayerPatch(layer.id, { shadow: { ...shadow, offsetX } })} />
          <LayerNumberInput label="Offset Y" max={256} min={-256} value={shadow.offsetY} onChange={(offsetY) => onLayerPatch(layer.id, { shadow: { ...shadow, offsetY } })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <LayerToggle
          checked={layer.isVisible ?? true}
          label="Visible"
          onChange={(isVisible) => onLayerPatch(layer.id, { isVisible })}
        />
        <LayerToggle
          checked={layer.isLocked ?? false}
          label="Locked"
          onChange={(isLocked) => onLayerPatch(layer.id, { isLocked })}
        />
      </div>
    </section>
  )
}

function LayerNumberInput({
  disabled,
  label,
  max,
  min,
  onChange,
  value,
}: {
  disabled?: boolean
  label: string
  max?: number
  min?: number
  onChange: (value: number) => void
  value: number
}) {
  return (
    <label className="min-w-0">
      <span className="drafting-type-meta mb-1 block font-semibold text-[var(--drafting-ink-muted)]">
        {label}
      </span>
      <input
        className="drafting-type-input h-9 w-full min-w-0 rounded-[6px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-2 text-[var(--drafting-ink)] shadow-none disabled:opacity-45"
        disabled={disabled}
        max={max}
        min={min}
        type="number"
        value={Math.round(value)}
        onChange={(event) => {
          const nextValue = Number(event.currentTarget.value)

          if (Number.isFinite(nextValue)) {
            onChange(nextValue)
          }
        }}
      />
    </label>
  )
}

function LayerToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="drafting-type-meta flex min-w-0 items-center gap-2 font-semibold text-[var(--drafting-ink)]">
      <input
        checked={checked}
        className="size-4 accent-[var(--drafting-ink)]"
        type="checkbox"
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      {label}
    </label>
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
  const labels = [
    getLayerOrderLabel(index, totalLayers),
    node.kind === "card" ? "Card" : "QR",
  ]

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
