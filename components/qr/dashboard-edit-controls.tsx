"use client"

import { useMemo } from "react"
import FileUpload from "@/components/kokonutui/file-upload"

import {
  EmbeddedColorPickerField,
  GradientEditor,
} from "@/components/qr/qr-control-sections"
import type { DashboardEditSectionId } from "@/components/qr/dashboard-edit-sections"
import {
  DASHBOARD_QR_NODE_ID,
  removeDashboardComposeNode,
  reorderDashboardComposeNodes,
  updateDashboardComposeBackground,
  updateDashboardComposeNode,
  type DashboardComposeBackground,
  type DashboardComposeNode,
  type DashboardComposeScene,
} from "@/components/qr/dashboard-compose-scene"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MotionAccordion } from "@/components/unlumen-ui/motion-accordion"
import { Button } from "@/components/ui/button"
import {
  DraggableList,
  DraggableListHandle,
  DraggableListItem,
} from "@/components/ui/draggable-list"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider as UnlumenSlider } from "@/components/unlumen-ui/slider"
import { cn } from "@/lib/utils"

const BLEND_MODE_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Multiply", value: "multiply" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Darken", value: "darken" },
  { label: "Lighten", value: "lighten" },
] as const

type DashboardEditControlsProps = {
  activeSection: DashboardEditSectionId
  onComposeImageUploadError: (message: string) => void
  onComposeImageUploadSuccess: (file: File) => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  scene: DashboardComposeScene
  selectedNodeId: string | null
}

export function DashboardEditControls({
  activeSection,
  onComposeImageUploadError,
  onComposeImageUploadSuccess,
  onSceneChange,
  onSelectedNodeChange,
  scene,
  selectedNodeId,
}: DashboardEditControlsProps) {
  const layerNodes = useMemo(() => getDashboardComposeLayerNodes(scene), [scene])
  const selectedNode =
    scene.nodes.find((node) => node.id === selectedNodeId) ?? null

  if (activeSection === "inspector") {
    return (
      <DashboardInspectorPanel
        node={selectedNode}
        onSceneChange={onSceneChange}
        onSelectedNodeChange={onSelectedNodeChange}
      />
    )
  }

  if (activeSection === "background") {
    return (
      <DashboardBackgroundPanel onSceneChange={onSceneChange} scene={scene} />
    )
  }

  return (
    <DashboardLayersPanel
      layerNodes={layerNodes}
      onComposeImageUploadError={onComposeImageUploadError}
      onComposeImageUploadSuccess={onComposeImageUploadSuccess}
      onSceneChange={onSceneChange}
      onSelectedNodeChange={onSelectedNodeChange}
      selectedNodeId={selectedNodeId}
    />
  )
}

export function getDashboardComposeLayerNodes(scene: DashboardComposeScene) {
  return [...scene.nodes].sort((left, right) => right.zIndex - left.zIndex)
}

export function getDashboardBackgroundControlMode(
  background: DashboardComposeBackground,
) {
  return background.mode
}

function DashboardLayersPanel({
  layerNodes,
  onComposeImageUploadError,
  onComposeImageUploadSuccess,
  onSceneChange,
  onSelectedNodeChange,
  selectedNodeId,
}: {
  layerNodes: DashboardComposeNode[]
  onComposeImageUploadError: (message: string) => void
  onComposeImageUploadSuccess: (file: File) => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  selectedNodeId: string | null
}) {
  const isSingleLayer = layerNodes.length <= 1

  return (
    <section data-slot="dashboard-edit-layers" className="flex flex-col gap-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-foreground/78 uppercase">
          Layers
        </h2>
        <p className="text-sm text-foreground/54">
          Arrange the dashboard stack and choose the layer you want to refine.
        </p>
      </div>

      <div
        data-slot="dashboard-compose-image-upload"
        className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-[0.16em] text-foreground/78 uppercase">
              Add image
            </h3>
            <p className="text-sm text-foreground/54">
              Upload artwork as a movable composition layer above the canvas.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.14em] text-foreground/46 uppercase">
            New layer
          </span>
        </div>
        <FileUpload
          acceptedFileTypes={["image/*"]}
          className="mx-0 max-w-none"
          onUploadError={(error) => onComposeImageUploadError(error.message)}
          onUploadSuccess={onComposeImageUploadSuccess}
          uploadDelay={0}
        />
      </div>

      <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-1.5">
        <div className="flex items-center justify-between gap-3 px-3.5 pb-3 pt-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Composition stack</h3>
            <p className="text-sm text-foreground/54">
              Reorder layers top to bottom without leaving the canvas.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.14em] text-foreground/46 uppercase">
            {layerNodes.length} {layerNodes.length === 1 ? "Layer" : "Layers"}
          </span>
        </div>

        <DraggableList
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
            const isRemovable = node.id !== DASHBOARD_QR_NODE_ID

            return (
              <DraggableListItem
                key={node.id}
                disabled={isSingleLayer}
                className={cn("rounded-[1.35rem]", isSelected && "z-10")}
                value={node}
              >
                <div
                  data-slot="dashboard-layer-row"
                  data-node-id={node.id}
                  data-selected={isSelected ? "true" : "false"}
                  data-z-index={node.zIndex}
                  className={cn(
                    "rounded-[1.35rem] border border-white/8 bg-[color-mix(in_oklch,var(--color-card)_28%,transparent)] p-3.5 transition-colors",
                    isSelected &&
                      "border-white/16 bg-[color-mix(in_oklch,var(--color-card)_42%,transparent)]",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      <DraggableListHandle
                        className="text-foreground/34"
                        label={`Reorder ${node.name}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <button
                        className="block w-full min-w-0 text-left"
                        onClick={() => onSelectedNodeChange(node.id)}
                        type="button"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[0.64rem] font-medium tracking-[0.18em] text-foreground/42 uppercase">
                            {getLayerOrderLabel(index, layerNodes.length)}
                          </span>
                          <LayerPill>{node.kind === "image" ? "Image" : "QR"}</LayerPill>
                          {node.isLocked ? <LayerPill>Locked</LayerPill> : null}
                          {!node.isVisible ? <LayerPill>Hidden</LayerPill> : null}
                          {isSelected ? <LayerPill>Selected</LayerPill> : null}
                        </div>
                        <p className="mt-2 truncate text-sm font-medium text-foreground">
                          {node.name}
                        </p>
                        <p className="mt-1 text-sm text-foreground/50">
                          {getLayerMeta(node)}
                        </p>
                      </button>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="rounded-full border border-white/8 bg-white/[0.03] px-3 text-xs text-foreground/68 shadow-none hover:bg-white/[0.06]"
                          onClick={() =>
                            onSceneChange((current) =>
                              updateDashboardComposeNode(current, node.id, {
                                isVisible: !node.isVisible,
                              }),
                            )
                          }
                          type="button"
                          variant="outline"
                        >
                          {node.isVisible ? "Hide" : "Show"}
                        </Button>
                        <Button
                          className="rounded-full border border-white/8 bg-white/[0.03] px-3 text-xs text-foreground/68 shadow-none hover:bg-white/[0.06]"
                          onClick={() =>
                            onSceneChange((current) =>
                              updateDashboardComposeNode(current, node.id, {
                                isLocked: !node.isLocked,
                              }),
                            )
                          }
                          type="button"
                          variant="outline"
                        >
                          {node.isLocked ? "Unlock" : "Lock"}
                        </Button>
                        {isRemovable ? (
                          <Button
                            className="rounded-full border border-red-300/10 bg-red-400/[0.08] px-3 text-xs text-red-200 shadow-none hover:bg-red-400/[0.14]"
                            onClick={() => {
                              onSceneChange((current) =>
                                removeDashboardComposeNode(current, node.id),
                              )
                              onSelectedNodeChange(
                                selectedNodeId === node.id
                                  ? DASHBOARD_QR_NODE_ID
                                  : selectedNodeId,
                              )
                            }}
                            type="button"
                            variant="ghost"
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </DraggableListItem>
            )
          })}
        </DraggableList>
      </div>
    </section>
  )
}

function DashboardInspectorPanel({
  node,
  onSceneChange,
  onSelectedNodeChange,
}: {
  node: DashboardComposeNode | null
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
}) {
  return (
    <section data-slot="dashboard-edit-inspector" className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-foreground/78 uppercase">
          Inspector
        </h2>
        <p className="text-sm text-foreground/54">
          Fine-tune the selected layer transform and compositing settings.
        </p>
      </div>

      {node ? (
        <LayerInspector
          node={node}
          onSceneChange={onSceneChange}
          onSelectedNodeChange={onSelectedNodeChange}
        />
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-5 py-6 text-sm text-foreground/54">
          Select a layer in Layers to edit its name, transform, opacity, and blend mode.
        </div>
      )}
    </section>
  )
}

function LayerInspector({
  node,
  onSceneChange,
  onSelectedNodeChange,
}: {
  node: DashboardComposeNode
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
}) {
  const isRemovable = node.id !== DASHBOARD_QR_NODE_ID

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <LayerPill>{node.kind === "image" ? "Image" : "QR"}</LayerPill>
          {node.isLocked ? <LayerPill>Locked</LayerPill> : null}
          {!node.isVisible ? <LayerPill>Hidden</LayerPill> : null}
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">{node.name}</p>
        <p className="mt-1 text-sm text-foreground/50">{getLayerMeta(node)}</p>
      </div>

      <div
        data-slot="dashboard-layer-inspector"
        className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
      >
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor={`layer-inspector-name-${node.id}`}>Name</FieldLabel>
            <Input
              id={`layer-inspector-name-${node.id}`}
              className="rounded-[1rem] border-white/8 bg-white/[0.03]"
              value={node.name}
              onChange={(event) =>
                onSceneChange((current) =>
                  updateDashboardComposeNode(current, node.id, {
                    name: event.target.value,
                  }),
                )
              }
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`layer-inspector-x-${node.id}`}>X position</FieldLabel>
              <Input
                id={`layer-inspector-x-${node.id}`}
                className="rounded-[1rem] border-white/8 bg-white/[0.03]"
                type="number"
                value={formatFiniteNumber(node.x)}
                onChange={(event) =>
                  onSceneChange((current) =>
                    updateDashboardComposeNode(current, node.id, {
                      x: parseFiniteNumber(event.target.value, node.x),
                    }),
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`layer-inspector-y-${node.id}`}>Y position</FieldLabel>
              <Input
                id={`layer-inspector-y-${node.id}`}
                className="rounded-[1rem] border-white/8 bg-white/[0.03]"
                type="number"
                value={formatFiniteNumber(node.y)}
                onChange={(event) =>
                  onSceneChange((current) =>
                    updateDashboardComposeNode(current, node.id, {
                      y: parseFiniteNumber(event.target.value, node.y),
                    }),
                  )
                }
              />
            </Field>
          </div>

          <Field>
            <UnlumenSlider
              data-slot="dashboard-layer-rotation"
              id={`layer-inspector-rotation-${node.id}`}
              label="Rotation"
              formatValue={(value) => `${Math.round(value)}°`}
              max={360}
              min={0}
              onChange={(value) =>
                onSceneChange((current) =>
                  updateDashboardComposeNode(current, node.id, {
                    rotation: Array.isArray(value) ? value[0] : value,
                  }),
                )
              }
              showValue
              step={1}
              value={node.rotation}
            />
          </Field>

          <Field>
            <UnlumenSlider
              data-slot="dashboard-layer-scale"
              id={`layer-inspector-scale-${node.id}`}
              label="Scale"
              formatValue={(value) => `${Math.round(value * 100)}%`}
              max={3}
              min={0.2}
              onChange={(value) =>
                onSceneChange((current) =>
                  updateDashboardComposeNode(current, node.id, {
                    scale: Array.isArray(value) ? value[0] : value,
                  }),
                )
              }
              showValue
              step={0.01}
              value={node.scale}
            />
          </Field>

          <Field>
            <UnlumenSlider
              data-slot="dashboard-layer-opacity"
              id={`layer-inspector-opacity-${node.id}`}
              label="Opacity"
              formatValue={(value) => `${Math.round(value)}%`}
              max={100}
              min={0}
              onChange={(value) =>
                onSceneChange((current) =>
                  updateDashboardComposeNode(current, node.id, {
                    opacity: (Array.isArray(value) ? value[0] : value) / 100,
                  }),
                )
              }
              showValue
              step={1}
              value={node.opacity * 100}
            />
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel htmlFor={`layer-inspector-blend-mode-${node.id}`}>
                Blend mode
              </FieldLabel>
            </FieldContent>
            <Select
              value={node.blendMode}
              onValueChange={(value) =>
                onSceneChange((current) =>
                  updateDashboardComposeNode(current, node.id, {
                    blendMode: value,
                  }),
                )
              }
            >
              <SelectTrigger
                id={`layer-inspector-blend-mode-${node.id}`}
                className="w-full rounded-[1rem] border-white/8 bg-white/[0.03]"
              >
                <SelectValue placeholder="Select blend mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {BLEND_MODE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {isRemovable ? (
            <div className="flex justify-end">
              <Button
                className="rounded-full border border-red-300/10 bg-red-400/[0.08] px-4 text-red-200 shadow-none hover:bg-red-400/[0.14]"
                onClick={() => {
                  onSceneChange((current) => removeDashboardComposeNode(current, node.id))
                  onSelectedNodeChange(DASHBOARD_QR_NODE_ID)
                }}
                type="button"
                variant="ghost"
              >
                Delete layer
              </Button>
            </div>
          ) : null}
        </FieldGroup>
      </div>
    </div>
  )
}

function DashboardBackgroundPanel({
  onSceneChange,
  scene,
}: {
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  scene: DashboardComposeScene
}) {
  const selectedItemId = getDashboardBackgroundControlMode(scene.background)

  return (
    <section data-slot="dashboard-edit-background" className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-foreground/78 uppercase">
          Background
        </h2>
        <p className="text-sm text-foreground/54">
          Style the composition canvas without changing the QR artwork background.
        </p>
      </div>

      <MotionAccordion
        allowCollapse
        gap={0}
        openItemIds={[selectedItemId]}
        variant="settings"
        items={[
          {
            id: "solid",
            title: "Solid",
            content: (
              <EmbeddedColorPickerField
                chrome="minimal"
                label="Canvas fill"
                onValueChange={(value) =>
                  onSceneChange((current) =>
                    updateDashboardComposeBackground(current, {
                      color: value,
                      mode: "solid",
                    }),
                  )
                }
                pickerClassName="mx-auto"
                value={scene.background.color}
              />
            ),
            onToggle: () =>
              onSceneChange((current) =>
                updateDashboardComposeBackground(current, {
                  mode: "solid",
                }),
              ),
          },
          {
            id: "gradient",
            title: "Gradient",
            content: (
              <GradientEditor
                gradient={{ ...scene.background.gradient, enabled: true }}
                hideToggle
                idPrefix="dashboard-compose-background-gradient"
                isDashboardMode
                onGradientChange={(gradient) =>
                  onSceneChange((current) =>
                    updateDashboardComposeBackground(current, {
                      gradient: {
                        ...gradient,
                        enabled: true,
                      },
                      mode: "gradient",
                    }),
                  )
                }
                title="Canvas gradient"
                variant="dot-enhanced"
              />
            ),
            onToggle: () =>
              onSceneChange((current) =>
                updateDashboardComposeBackground(current, {
                  mode: "gradient",
                }),
              ),
          },
          {
            id: "transparent",
            title: "Transparent",
            content: null,
            onToggle: () =>
              onSceneChange((current) =>
                updateDashboardComposeBackground(current, {
                  mode: "transparent",
                }),
              ),
          },
        ]}
      />
    </section>
  )
}

function LayerPill({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] font-medium tracking-[0.14em] text-foreground/52 uppercase">
      {children}
    </span>
  )
}

function getLayerOrderLabel(index: number, totalLayers: number) {
  if (index === 0) {
    return "Top layer"
  }

  if (index === totalLayers - 1) {
    return "Base layer"
  }

  return `Layer ${totalLayers - index}`
}

function getLayerMeta(node: DashboardComposeNode) {
  return [
    `x ${Math.round(node.x)}`,
    `y ${Math.round(node.y)}`,
    `${Math.round(node.scale * 100)}% scale`,
    `${Math.round(node.opacity * 100)}% opacity`,
    node.blendMode,
  ].join(" · ")
}

function parseFiniteNumber(value: string, fallback: number) {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

function formatFiniteNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(0) : "0"
}
