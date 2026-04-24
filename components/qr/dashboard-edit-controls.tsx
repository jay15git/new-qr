"use client"

import { type ChangeEvent, type DragEvent, type ReactNode, useMemo, useRef, useState } from "react"
import FileUpload from "@/components/kokonutui/file-upload"
import { DraftingEditBackgroundColorTab } from "@/components/new/drafting-style-tab"

import {
  EmbeddedColorPickerField,
  GradientEditor,
  createDashboardAccordionOpenItemIds,
  ensureDashboardAccordionItemExpanded,
} from "@/components/qr/qr-control-sections"
import type { DashboardEditSectionId } from "@/components/qr/dashboard-edit-sections"
import {
  applyDashboardDocumentPreset,
  centerDashboardComposeNode,
  DASHBOARD_DOCUMENT_PRESETS,
  DASHBOARD_QR_NODE_ID,
  fitDashboardQrNodeToDocument,
  getDashboardComposeNode,
  isDashboardQrNodeId,
  removeDashboardComposeNode,
  reorderDashboardComposeNodes,
  updateDashboardComposeBackground,
  updateDashboardComposeDocument,
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

type DashboardEditAppearance = "dashboard" | "drafting"

type DashboardEditControlsProps = {
  activeSection: DashboardEditSectionId
  appearance?: DashboardEditAppearance
  onComposeImageUploadError: (message: string) => void
  onComposeImageUploadSuccess: (file: File) => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  scene: DashboardComposeScene
  selectedNodeId: string | null
}

export function DashboardEditControls({
  activeSection,
  appearance = "dashboard",
  onComposeImageUploadError,
  onComposeImageUploadSuccess,
  onSceneChange,
  onSelectedNodeChange,
  scene,
  selectedNodeId,
}: DashboardEditControlsProps) {
  const layerNodes = useMemo(() => getDashboardComposeLayerNodes(scene), [scene])
  const qrNode =
    selectedNodeId && isDashboardQrNodeId(selectedNodeId)
      ? getDashboardComposeNode(scene, selectedNodeId) ?? getDashboardComposeNode(scene) ?? null
      : getDashboardComposeNode(scene) ?? null
  const canonicalSection =
    activeSection === "background"
      ? "page"
      : activeSection === "inspector"
        ? "position"
        : activeSection

  if (canonicalSection === "page") {
    return (
      <DashboardPagePanel
        appearance={appearance}
        onSceneChange={onSceneChange}
        scene={scene}
      />
    )
  }

  if (canonicalSection === "position") {
    return (
      <DashboardPositionPanel
        appearance={appearance}
        node={qrNode}
        onSceneChange={onSceneChange}
      />
    )
  }

  if (canonicalSection === "layers") {
    return (
      <DashboardLayersPanel
        appearance={appearance}
        layerNodes={layerNodes}
        onComposeImageUploadError={onComposeImageUploadError}
        onComposeImageUploadSuccess={onComposeImageUploadSuccess}
        onSceneChange={onSceneChange}
        onSelectedNodeChange={onSelectedNodeChange}
        selectedNodeId={selectedNodeId}
      />
    )
  }

  return (
    <DashboardAssetsPanel
      appearance={appearance}
      assetNodes={layerNodes.filter((node) => !isDashboardQrNodeId(node.id))}
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

function DashboardPagePanel({
  appearance,
  onSceneChange,
  scene,
}: {
  appearance: DashboardEditAppearance
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  scene: DashboardComposeScene
}) {
  const isDraftingAppearance = appearance === "drafting"

  return (
    <section data-slot="dashboard-edit-page" className="flex min-w-0 flex-col gap-4">
      <PanelCard appearance={appearance}>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-foreground/78 uppercase">
            Page
          </h2>
          <p className="text-sm text-foreground/54">
            Set the printable sheet used for full-page export.
          </p>
        </div>
      </PanelCard>

      <PanelCard appearance={appearance}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-foreground/72">
              Preset
            </p>
            <span className="text-[0.72rem] text-foreground/50">
              {scene.canvasSize.width} × {scene.canvasSize.height}
            </span>
          </div>
          <div className="grid gap-2">
            {DASHBOARD_DOCUMENT_PRESETS.map((preset) => {
              const isSelected = scene.document.presetId === preset.id

              return (
                <button
                  key={preset.id}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex items-center justify-between rounded-[10px] border px-3 py-2 text-left transition-colors",
                    isDraftingAppearance
                      ? "border-black/10 bg-white hover:border-black/18"
                      : "border-white/10 bg-white/[0.03] hover:border-white/16",
                    isSelected &&
                      (isDraftingAppearance
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-white/18 bg-white/[0.08] text-foreground"),
                  )}
                  onClick={() =>
                    onSceneChange((current) => applyDashboardDocumentPreset(current, preset.id))
                  }
                  type="button"
                >
                  <span className="text-sm font-medium">{preset.title}</span>
                  <span className={cn("text-xs", isSelected ? "text-current/72" : "text-foreground/50")}>
                    {preset.width} × {preset.height}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </PanelCard>

      <PanelCard appearance={appearance}>
        <FieldGroup className="gap-4">
          <Field>
            <UnlumenSlider
              data-slot="dashboard-document-margin"
              id="dashboard-document-margin"
              label="Safe margin"
              formatValue={(value) => `${Math.round(value)} px`}
              max={Math.min(scene.canvasSize.width, scene.canvasSize.height) / 3}
              min={0}
              onChange={(value) =>
                onSceneChange((current) =>
                  updateDashboardComposeDocument(current, {
                    margin: Array.isArray(value) ? value[0] : value,
                  }),
                )
              }
              showValue
              step={1}
              value={scene.document.margin}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="dashboard-document-background-color">Page color</FieldLabel>
            <Input
              id="dashboard-document-background-color"
              className={cn(
                "rounded-[1rem]",
                isDraftingAppearance ? "border-black/10 bg-white" : "border-white/8 bg-white/[0.03]",
              )}
              type="color"
              value={scene.document.backgroundColor}
              onChange={(event) =>
                onSceneChange((current) =>
                  updateDashboardComposeDocument(current, {
                    backgroundColor: event.target.value,
                  }),
                )
              }
            />
          </Field>

          <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-black/8 bg-black/[0.02] px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Show margin guides</p>
              <p className="text-sm text-foreground/50">Overlay the printable safe area on the page.</p>
            </div>
            <Button
              className={cn(
                "rounded-full px-3 text-xs shadow-none",
                scene.document.showGuides
                  ? "border border-[#111111] bg-[#111111] text-white hover:bg-[#111111]"
                  : "border border-black/10 bg-white text-foreground/72 hover:bg-black/[0.03]",
              )}
              onClick={() =>
                onSceneChange((current) =>
                  updateDashboardComposeDocument(current, {
                    showGuides: !current.document.showGuides,
                  }),
                )
              }
              type="button"
              variant="ghost"
            >
              {scene.document.showGuides ? "Guides on" : "Guides off"}
            </Button>
          </div>
        </FieldGroup>
      </PanelCard>
    </section>
  )
}

function DashboardPositionPanel({
  appearance,
  node,
  onSceneChange,
}: {
  appearance: DashboardEditAppearance
  node: DashboardComposeNode | null
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
}) {
  const isDraftingAppearance = appearance === "drafting"

  if (!node) {
    return (
      <section data-slot="dashboard-edit-position" className="flex min-w-0 flex-col gap-4">
        <PanelCard appearance={appearance}>
          <p className="text-sm text-foreground/54">The QR will appear here once the page is ready.</p>
        </PanelCard>
      </section>
    )
  }

  const renderedSize = Math.round(node.naturalWidth * node.scale)

  return (
    <section data-slot="dashboard-edit-position" className="flex min-w-0 flex-col gap-4">
      <PanelCard appearance={appearance}>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-foreground/78 uppercase">
            Position
          </h2>
          <p className="text-sm text-foreground/54">
            Place the QR on the page and size it for download.
          </p>
        </div>
      </PanelCard>

      <PanelCard appearance={appearance}>
        <div className="grid grid-cols-2 gap-2">
          <Button
            className={panelButtonClassName(isDraftingAppearance)}
            onClick={() => onSceneChange((current) => centerDashboardComposeNode(current, node.id))}
            type="button"
            variant="ghost"
          >
            Center QR
          </Button>
          <Button
            className={panelButtonClassName(isDraftingAppearance)}
            onClick={() => onSceneChange((current) => fitDashboardQrNodeToDocument(current, node.id))}
            type="button"
            variant="ghost"
          >
            Fit to page
          </Button>
        </div>
      </PanelCard>

      <PanelCard appearance={appearance}>
        <div className="space-y-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-foreground/72">
            Align on page
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["left", "center", "right"] as const).map((alignment) => (
              <Button
                key={alignment}
                className={panelButtonClassName(isDraftingAppearance)}
                onClick={() =>
                  onSceneChange((current) =>
                    alignDashboardComposeNode(current, node.id, {
                      horizontal: alignment,
                    }),
                  )
                }
                type="button"
                variant="ghost"
              >
                {alignment}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["top", "middle", "bottom"] as const).map((alignment) => (
              <Button
                key={alignment}
                className={panelButtonClassName(isDraftingAppearance)}
                onClick={() =>
                  onSceneChange((current) =>
                    alignDashboardComposeNode(current, node.id, {
                      vertical: alignment,
                    }),
                  )
                }
                type="button"
                variant="ghost"
              >
                {alignment}
              </Button>
            ))}
          </div>
        </div>
      </PanelCard>

      <PanelCard appearance={appearance}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`qr-position-x-${node.id}`}>X position</FieldLabel>
            <Input
              id={`qr-position-x-${node.id}`}
              className={cn(
                "rounded-[1rem]",
                isDraftingAppearance ? "border-black/10 bg-white" : "border-white/8 bg-white/[0.03]",
              )}
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
            <FieldLabel htmlFor={`qr-position-y-${node.id}`}>Y position</FieldLabel>
            <Input
              id={`qr-position-y-${node.id}`}
              className={cn(
                "rounded-[1rem]",
                isDraftingAppearance ? "border-black/10 bg-white" : "border-white/8 bg-white/[0.03]",
              )}
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

        <div className="mt-4">
          <UnlumenSlider
            data-slot="dashboard-document-qr-size"
            id="dashboard-document-qr-size"
            label="QR size"
            formatValue={(value) => `${Math.round(value)} px`}
            max={Math.min(node.naturalWidth * 2, 1600)}
            min={96}
            onChange={(value) =>
              onSceneChange((current) =>
                updateDashboardComposeNode(current, node.id, {
                  naturalHeight: Array.isArray(value) ? value[0] : value,
                  naturalWidth: Array.isArray(value) ? value[0] : value,
                }),
              )
            }
            showValue
            step={1}
            value={node.naturalWidth}
          />
        </div>

        <p className="mt-3 text-sm text-foreground/50">
          Current render size: {renderedSize} × {renderedSize}
        </p>
      </PanelCard>
    </section>
  )
}

function DashboardAssetsPanel({
  appearance,
  assetNodes,
  onComposeImageUploadError,
  onComposeImageUploadSuccess,
  onSceneChange,
  onSelectedNodeChange,
  selectedNodeId,
}: {
  appearance: DashboardEditAppearance
  assetNodes: DashboardComposeNode[]
  onComposeImageUploadError: (message: string) => void
  onComposeImageUploadSuccess: (file: File) => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  selectedNodeId: string | null
}) {
  const isDraftingAppearance = appearance === "drafting"

  return (
    <section data-slot="dashboard-edit-assets" className="flex min-w-0 flex-col gap-4">
      <PanelCard appearance={appearance}>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-foreground/78 uppercase">
            Assets
          </h2>
          <p className="text-sm text-foreground/54">
            Add optional artwork above the QR without leaving the page view.
          </p>
        </div>
      </PanelCard>

      <div
        data-slot="dashboard-compose-image-upload"
        className={cn(
          "min-w-0 overflow-hidden rounded-[8px] border px-4 py-3 shadow-[0_0_10px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.03)]",
          isDraftingAppearance
            ? "border-[#00000017] bg-[#FFFFFFCC]"
            : "border-white/8 bg-white/[0.03]",
        )}
      >
        <div className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-foreground/72">
              Add image
            </p>
            <p className="mt-1 text-[0.72rem] leading-5 text-foreground/50">
              Upload a logo, stamp, or artwork layer for the exported page.
            </p>
          </div>
          <span className="text-[0.72rem] text-foreground/50">{assetNodes.length} assets</span>
        </div>

        {isDraftingAppearance ? (
          <DraftingDashboardAssetsUpload
            onComposeImageUploadError={onComposeImageUploadError}
            onComposeImageUploadSuccess={onComposeImageUploadSuccess}
          />
        ) : (
          <FileUpload
            acceptedFileTypes={["image/*"]}
            className="mx-0 max-w-none"
            onUploadError={(error) => onComposeImageUploadError(error.message)}
            onUploadSuccess={onComposeImageUploadSuccess}
            uploadDelay={0}
          />
        )}
      </div>

      <div className="space-y-2">
        {assetNodes.length === 0 ? (
          <PanelCard appearance={appearance}>
            <p className="text-sm text-foreground/54">No extra assets yet. The QR remains the only exported object on the page.</p>
          </PanelCard>
        ) : (
          assetNodes.map((node) => {
            const isSelected = node.id === selectedNodeId

            return (
              <PanelCard
                key={node.id}
                appearance={appearance}
                className={cn(isSelected && (isDraftingAppearance ? "border-[#111111]" : "border-white/16"))}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => onSelectedNodeChange(node.id)}
                    type="button"
                  >
                    <p className="truncate text-sm font-medium text-foreground">{node.name}</p>
                    <p className="mt-1 text-sm text-foreground/50">
                      {Math.round(node.naturalWidth * node.scale)} × {Math.round(node.naturalHeight * node.scale)}
                      {" · "}
                      {node.isVisible ? "Visible" : "Hidden"}
                    </p>
                  </button>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      className={panelButtonClassName(isDraftingAppearance)}
                      onClick={() =>
                        onSceneChange((current) =>
                          updateDashboardComposeNode(current, node.id, {
                            isVisible: !node.isVisible,
                          }),
                        )
                      }
                      type="button"
                      variant="ghost"
                    >
                      {node.isVisible ? "Hide" : "Show"}
                    </Button>
                    <Button
                      className={cn(
                        panelButtonClassName(isDraftingAppearance),
                        isDraftingAppearance && "border-red-500/15 bg-red-500/[0.06] text-red-700 hover:bg-red-500/[0.10]",
                      )}
                      onClick={() => {
                        onSceneChange((current) => removeDashboardComposeNode(current, node.id))
                        onSelectedNodeChange(selectedNodeId === node.id ? DASHBOARD_QR_NODE_ID : selectedNodeId)
                      }}
                      type="button"
                      variant="ghost"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </PanelCard>
            )
          })
        )}
      </div>
    </section>
  )
}

function DraftingDashboardAssetsUpload({
  onComposeImageUploadError,
  onComposeImageUploadSuccess,
}: {
  onComposeImageUploadError: (message: string) => void
  onComposeImageUploadSuccess: (file: File) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  function handleSelectedFile(file: File | null) {
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      onComposeImageUploadError("Please upload an image file.")
      return
    }

    setIsDragActive(false)
    onComposeImageUploadSuccess(file)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleSelectedFile(event.target.files?.[0] ?? null)
    event.target.value = ""
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragActive(true)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragActive(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return
    }

    setIsDragActive(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    handleSelectedFile(event.dataTransfer.files?.[0] ?? null)
  }

  return (
    <div
      className={cn(
        "rounded-[8px] border px-4 py-3 transition-[border-color,background-color,box-shadow] duration-150 ease-out",
        isDragActive
          ? "border-[#11111166] bg-white shadow-[0_0_18px_1px_rgba(0,0,0,0.09),0_4px_10px_0_rgba(0,0,0,0.05)]"
          : "border-[#00000017] bg-[#FFFFFFCC]",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        accept="image/*"
        aria-label="Upload document asset"
        className="sr-only"
        onChange={handleInputChange}
        type="file"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.72rem] leading-5 text-[#00000066]">
          Click to add artwork to the page, or drop an image here.
        </p>
        <Button
          data-slot="drafting-layer-upload-button"
          className={panelButtonClassName(true)}
          onClick={() => fileInputRef.current?.click()}
          type="button"
          variant="ghost"
        >
          Choose file
        </Button>
      </div>
    </div>
  )
}

function PanelCard({
  appearance,
  children,
  className,
}: {
  appearance: DashboardEditAppearance
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[1rem] p-4",
        appearance === "drafting"
          ? "border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          : "border border-white/8 bg-white/[0.03]",
        className,
      )}
    >
      {children}
    </div>
  )
}

function panelButtonClassName(isDraftingAppearance: boolean) {
  return cn(
    "rounded-full px-3 text-xs shadow-none",
    isDraftingAppearance
      ? "border border-black/10 bg-black/[0.03] text-foreground/72 hover:bg-black/[0.06]"
      : "border border-white/8 bg-white/[0.03] text-foreground/68 hover:bg-white/[0.06]",
  )
}

function alignDashboardComposeNode(
  scene: DashboardComposeScene,
  nodeId: string,
  alignment: {
    horizontal?: "left" | "center" | "right"
    vertical?: "top" | "middle" | "bottom"
  },
) {
  const node = scene.nodes.find((currentNode) => currentNode.id === nodeId)

  if (!node) {
    return scene
  }

  const width = node.naturalWidth * node.scale
  const height = node.naturalHeight * node.scale
  let nextX = node.x
  let nextY = node.y

  if (alignment.horizontal === "left") {
    nextX = scene.document.margin
  } else if (alignment.horizontal === "center") {
    nextX = (scene.canvasSize.width - width) * 0.5
  } else if (alignment.horizontal === "right") {
    nextX = scene.canvasSize.width - scene.document.margin - width
  }

  if (alignment.vertical === "top") {
    nextY = scene.document.margin
  } else if (alignment.vertical === "middle") {
    nextY = (scene.canvasSize.height - height) * 0.5
  } else if (alignment.vertical === "bottom") {
    nextY = scene.canvasSize.height - scene.document.margin - height
  }

  return updateDashboardComposeNode(scene, node.id, {
    x: nextX,
    y: nextY,
  })
}

export function DashboardLayersPanel({
  appearance,
  layerNodes,
  onComposeImageUploadError,
  onComposeImageUploadSuccess,
  onSceneChange,
  onSelectedNodeChange,
  selectedNodeId,
}: {
  appearance: DashboardEditAppearance
  layerNodes: DashboardComposeNode[]
  onComposeImageUploadError: (message: string) => void
  onComposeImageUploadSuccess: (file: File) => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  selectedNodeId: string | null
}) {
  const isSingleLayer = layerNodes.length <= 1
  const isDraftingAppearance = appearance === "drafting"
  const qrNodeCount = layerNodes.filter((node) => isDashboardQrNodeId(node.id)).length

  if (isDraftingAppearance) {
    return (
      <DraftingDashboardLayersPanel
        layerNodes={layerNodes}
        onComposeImageUploadError={onComposeImageUploadError}
        onComposeImageUploadSuccess={onComposeImageUploadSuccess}
        onSceneChange={onSceneChange}
        onSelectedNodeChange={onSelectedNodeChange}
        selectedNodeId={selectedNodeId}
        isSingleLayer={isSingleLayer}
      />
    )
  }

  return (
    <section data-slot="dashboard-edit-layers" className="flex min-w-0 flex-col gap-5">
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
        className={cn(
          "min-w-0 overflow-hidden rounded-[1.5rem] p-4",
          isDraftingAppearance
            ? "border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            : "border border-white/8 bg-white/[0.03]",
        )}
      >
        <div className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-sm font-semibold tracking-[0.16em] text-foreground/78 uppercase">
              Add image
            </h3>
            <p className="text-sm text-foreground/54">
              Upload artwork as a movable composition layer above the canvas.
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.14em] uppercase",
              isDraftingAppearance
                ? "border border-black/10 bg-black/[0.03] text-foreground/52"
                : "border border-white/10 text-foreground/46",
            )}
          >
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

      <div
        className={cn(
          "min-w-0 overflow-hidden rounded-[1.6rem] p-1.5",
          isDraftingAppearance
            ? "border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            : "border border-white/8 bg-white/[0.03]",
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 px-3.5 pb-3 pt-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Composition stack</h3>
            <p className="text-sm text-foreground/54">
              Reorder layers top to bottom without leaving the canvas.
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.14em] uppercase",
              isDraftingAppearance
                ? "border border-black/10 bg-black/[0.03] text-foreground/52"
                : "border border-white/10 text-foreground/46",
            )}
          >
            {layerNodes.length} {layerNodes.length === 1 ? "Layer" : "Layers"}
          </span>
        </div>

        <DraggableList
          className="min-w-0"
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
                className={cn("min-w-0 rounded-[1.35rem]", isSelected && "z-10")}
                value={node}
              >
                <div
                  data-slot="dashboard-layer-row"
                  data-node-id={node.id}
                  data-selected={isSelected ? "true" : "false"}
                  data-z-index={node.zIndex}
                  className={cn(
                    "min-w-0 overflow-hidden rounded-[1.35rem] p-3.5 transition-colors",
                    isDraftingAppearance
                      ? "border border-black/8 bg-[rgba(255,255,255,0.88)]"
                      : "border border-white/8 bg-[color-mix(in_oklch,var(--color-card)_28%,transparent)]",
                    isSelected &&
                      (isDraftingAppearance
                        ? "border-black/14 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                        : "border-white/16 bg-[color-mix(in_oklch,var(--color-card)_42%,transparent)]"),
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 pt-1">
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
                          <LayerPill appearance={appearance}>
                            {node.kind === "image" ? "Image" : "QR"}
                          </LayerPill>
                          {node.isLocked ? (
                            <LayerPill appearance={appearance}>Locked</LayerPill>
                          ) : null}
                          {!node.isVisible ? (
                            <LayerPill appearance={appearance}>Hidden</LayerPill>
                          ) : null}
                          {isSelected ? (
                            <LayerPill appearance={appearance}>Selected</LayerPill>
                          ) : null}
                        </div>
                        <p className="mt-2 truncate text-sm font-medium text-foreground">
                          {node.name}
                        </p>
                        <p className="mt-1 break-words text-sm leading-5 text-foreground/50">
                          {getLayerMeta(node)}
                        </p>
                      </button>

                      <div className="flex min-w-0 flex-wrap gap-2">
                        <Button
                          className={cn(
                            "shrink-0 rounded-full px-3 text-xs shadow-none",
                            isDraftingAppearance
                              ? "border border-black/10 bg-black/[0.03] text-foreground/72 hover:bg-black/[0.06]"
                              : "border border-white/8 bg-white/[0.03] text-foreground/68 hover:bg-white/[0.06]",
                          )}
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
                          className={cn(
                            "shrink-0 rounded-full px-3 text-xs shadow-none",
                            isDraftingAppearance
                              ? "border border-black/10 bg-black/[0.03] text-foreground/72 hover:bg-black/[0.06]"
                              : "border border-white/8 bg-white/[0.03] text-foreground/68 hover:bg-white/[0.06]",
                          )}
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
                            className={cn(
                              "shrink-0 rounded-full px-3 text-xs shadow-none",
                              isDraftingAppearance
                                ? "border border-red-500/15 bg-red-500/[0.06] text-red-700 hover:bg-red-500/[0.10]"
                                : "border border-red-300/10 bg-red-400/[0.08] text-red-200 hover:bg-red-400/[0.14]",
                            )}
                            onClick={() => {
                              const fallbackNodeId =
                                layerNodes.find(
                                  (currentNode) =>
                                    currentNode.id !== node.id &&
                                    isDashboardQrNodeId(currentNode.id),
                                )?.id ?? DASHBOARD_QR_NODE_ID

                              onSceneChange((current) =>
                                removeDashboardComposeNode(current, node.id),
                              )
                              onSelectedNodeChange(
                                selectedNodeId === node.id
                                  ? fallbackNodeId
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

function DraftingDashboardLayersPanel({
  isSingleLayer,
  layerNodes,
  onComposeImageUploadError,
  onComposeImageUploadSuccess,
  onSceneChange,
  onSelectedNodeChange,
  selectedNodeId,
}: {
  isSingleLayer: boolean
  layerNodes: DashboardComposeNode[]
  onComposeImageUploadError: (message: string) => void
  onComposeImageUploadSuccess: (file: File) => void
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
  selectedNodeId: string | null
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const qrNodeCount = layerNodes.filter((node) => isDashboardQrNodeId(node.id)).length

  function handleSelectedFile(file: File | null) {
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      onComposeImageUploadError("Please upload an image file.")
      return
    }

    setIsDragActive(false)
    onComposeImageUploadSuccess(file)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleSelectedFile(event.target.files?.[0] ?? null)
    event.target.value = ""
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (!isDragActive) {
      setIsDragActive(true)
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()

    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return
    }

    setIsDragActive(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    handleSelectedFile(event.dataTransfer.files?.[0] ?? null)
  }

  return (
    <section data-slot="dashboard-edit-layers" className="flex min-w-0 flex-col gap-3.5">
      <div
        data-slot="dashboard-compose-image-upload"
        className={cn(
          "min-w-0 overflow-hidden rounded-[8px] border px-4 py-3 shadow-[0_0_10px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.03)] transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
          isDragActive
            ? "border-[#11111166] bg-white shadow-[0_0_18px_1px_rgba(0,0,0,0.09),0_4px_10px_0_rgba(0,0,0,0.05)]"
            : "border-[#00000017] bg-[#FFFFFFCC] hover:-translate-y-px hover:border-[#00000026] hover:bg-[#FFFFFFF2] hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.07),0_4px_10px_0_rgba(0,0,0,0.04)]",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          accept="image/*"
          aria-label="Upload composition image"
          className="sr-only"
          onChange={handleInputChange}
          type="file"
        />
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#111111]">
              Add image layer
            </p>
            <p className="mt-1 text-[0.72rem] leading-5 text-[#00000066]">
              Click to place artwork above the QR, or drop an image here.
            </p>
          </div>
          <Button
            data-slot="drafting-layer-upload-button"
            className="shrink-0 rounded-[6px] border border-transparent bg-[#00000008] px-3 py-2 text-[0.72rem] font-medium tracking-[0.04em] text-[#00000073] shadow-none transition-[color,box-shadow,background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[#FFFFFFF2] hover:text-[#000000A6] hover:shadow-[0_0_24px_3px_rgba(0,0,0,0.08),0_4px_10px_1px_rgba(0,0,0,0.025)] active:translate-y-0 active:bg-[#FFFFFFF2] active:text-[#262626] active:shadow-[0_0_14px_1px_rgba(0,0,0,0.07)]"
            onClick={() => fileInputRef.current?.click()}
            type="button"
            variant="ghost"
          >
            Choose file
          </Button>
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex min-w-0 items-center justify-between gap-3 px-1">
          <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#111111]">
            Layers
          </h2>
          <span className="shrink-0 text-[0.72rem] text-[#00000066]">
            {layerNodes.length} total
          </span>
        </div>

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
                  data-slot="dashboard-layer-row"
                  data-node-id={node.id}
                  data-selected={isSelected ? "true" : "false"}
                  data-z-index={node.zIndex}
                  className={cn(
                    "min-w-0 overflow-hidden rounded-[8px] border px-3 py-3 shadow-[0_0_10px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.03)] transition-[border-color,box-shadow,transform,background-color] duration-150 ease-out",
                    "border-[#00000017] bg-[#FFFFFFCC] hover:-translate-y-px hover:border-[#00000026] hover:bg-[#FFFFFFF2] hover:shadow-[0_0_18px_1px_rgba(0,0,0,0.07),0_4px_10px_0_rgba(0,0,0,0.04)]",
                    isSelected &&
                      "border-[#111111] bg-[#FFFFFF] shadow-[0_0_22px_2px_rgba(0,0,0,0.14),0_5px_10px_1px_rgba(0,0,0,0.08)]",
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 pt-0.5">
                      <DraggableListHandle
                        className="rounded-[6px] border-transparent bg-[#00000008] text-[#00000052] hover:bg-[#FFFFFFF2] hover:text-[#111111]"
                        label={`Reorder ${node.name}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <button
                        className="block w-full min-w-0 text-left"
                        onClick={() => onSelectedNodeChange(node.id)}
                        type="button"
                      >
                        <p className="truncate text-[0.64rem] font-medium uppercase tracking-[0.16em] text-[#00000052]">
                          {getLayerOrderLabel(index, layerNodes.length)} · {getDraftingLayerStateLabel(node, isSelected)}
                        </p>
                        <p className="mt-1 truncate text-[0.82rem] font-semibold text-[#111111]">
                          {node.name}
                        </p>
                        <p className="mt-1 break-words text-[0.72rem] leading-5 text-[#00000066]">
                          {getLayerMeta(node)}
                        </p>
                      </button>

                      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                        <Button
                          className="shrink-0 rounded-[6px] border border-transparent bg-[#00000008] px-2.5 py-1.5 text-[0.68rem] font-medium tracking-[0.04em] text-[#00000073] shadow-none transition-[color,box-shadow,background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[#FFFFFFF2] hover:text-[#000000A6] hover:shadow-[0_0_24px_3px_rgba(0,0,0,0.08),0_4px_10px_1px_rgba(0,0,0,0.025)] active:translate-y-0 active:bg-[#FFFFFFF2] active:text-[#262626] active:shadow-[0_0_14px_1px_rgba(0,0,0,0.07)]"
                          onClick={() =>
                            onSceneChange((current) =>
                              updateDashboardComposeNode(current, node.id, {
                                isVisible: !node.isVisible,
                              }),
                            )
                          }
                          type="button"
                          variant="ghost"
                        >
                          {node.isVisible ? "Hide" : "Show"}
                        </Button>
                        <Button
                          className="shrink-0 rounded-[6px] border border-transparent bg-[#00000008] px-2.5 py-1.5 text-[0.68rem] font-medium tracking-[0.04em] text-[#00000073] shadow-none transition-[color,box-shadow,background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[#FFFFFFF2] hover:text-[#000000A6] hover:shadow-[0_0_24px_3px_rgba(0,0,0,0.08),0_4px_10px_1px_rgba(0,0,0,0.025)] active:translate-y-0 active:bg-[#FFFFFFF2] active:text-[#262626] active:shadow-[0_0_14px_1px_rgba(0,0,0,0.07)]"
                          onClick={() =>
                            onSceneChange((current) =>
                              updateDashboardComposeNode(current, node.id, {
                                isLocked: !node.isLocked,
                              }),
                            )
                          }
                          type="button"
                          variant="ghost"
                        >
                          {node.isLocked ? "Unlock" : "Lock"}
                        </Button>
                        {isRemovable ? (
                          <Button
                            className="shrink-0 rounded-[6px] border border-transparent bg-red-500/[0.06] px-2.5 py-1.5 text-[0.68rem] font-medium tracking-[0.04em] text-red-700 shadow-none transition-[color,box-shadow,background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-red-500/[0.10] hover:shadow-[0_0_20px_2px_rgba(220,38,38,0.08),0_4px_10px_0_rgba(220,38,38,0.06)] active:translate-y-0 active:bg-red-500/[0.12]"
                            onClick={() => {
                              const fallbackNodeId =
                                layerNodes.find(
                                  (currentNode) =>
                                    currentNode.id !== node.id &&
                                    isDashboardQrNodeId(currentNode.id),
                                )?.id ?? DASHBOARD_QR_NODE_ID

                              onSceneChange((current) =>
                                removeDashboardComposeNode(current, node.id),
                              )
                              onSelectedNodeChange(
                                selectedNodeId === node.id
                                  ? fallbackNodeId
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

export function DashboardInspectorPanel({
  appearance,
  node,
  onSceneChange,
  onSelectedNodeChange,
}: {
  appearance: DashboardEditAppearance
  node: DashboardComposeNode | null
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
}) {
  const isDraftingAppearance = appearance === "drafting"

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
          appearance={appearance}
          node={node}
          onSceneChange={onSceneChange}
          onSelectedNodeChange={onSelectedNodeChange}
        />
      ) : (
        <div
          className={cn(
            "rounded-[1.5rem] px-5 py-6 text-sm text-foreground/54",
            isDraftingAppearance
              ? "border border-dashed border-black/12 bg-white/60"
              : "border border-dashed border-white/10 bg-white/[0.02]",
          )}
        >
          Select a layer in Layers to edit its name, transform, opacity, and blend mode.
        </div>
      )}
    </section>
  )
}

function LayerInspector({
  appearance,
  node,
  onSceneChange,
  onSelectedNodeChange,
}: {
  appearance: DashboardEditAppearance
  node: DashboardComposeNode
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  onSelectedNodeChange: (nodeId: string | null) => void
}) {
  const isRemovable = node.id !== DASHBOARD_QR_NODE_ID
  const isDraftingAppearance = appearance === "drafting"

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "rounded-[1.5rem] px-4 py-3.5",
          isDraftingAppearance
            ? "border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            : "border border-white/8 bg-white/[0.03]",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <LayerPill appearance={appearance}>{node.kind === "image" ? "Image" : "QR"}</LayerPill>
          {node.isLocked ? <LayerPill appearance={appearance}>Locked</LayerPill> : null}
          {!node.isVisible ? <LayerPill appearance={appearance}>Hidden</LayerPill> : null}
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">{node.name}</p>
        <p className="mt-1 text-sm text-foreground/50">{getLayerMeta(node)}</p>
      </div>

      <div
        data-slot="dashboard-layer-inspector"
        className={cn(
          "rounded-[1.5rem] p-4",
          isDraftingAppearance
            ? "border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            : "border border-white/8 bg-white/[0.03]",
        )}
      >
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor={`layer-inspector-name-${node.id}`}>Name</FieldLabel>
            <Input
              id={`layer-inspector-name-${node.id}`}
              className={cn(
                "rounded-[1rem]",
                isDraftingAppearance
                  ? "border-black/10 bg-white"
                  : "border-white/8 bg-white/[0.03]",
              )}
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
                className={cn(
                  "rounded-[1rem]",
                  isDraftingAppearance
                    ? "border-black/10 bg-white"
                    : "border-white/8 bg-white/[0.03]",
                )}
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
                className={cn(
                  "rounded-[1rem]",
                  isDraftingAppearance
                    ? "border-black/10 bg-white"
                    : "border-white/8 bg-white/[0.03]",
                )}
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
                className={cn(
                  "w-full rounded-[1rem]",
                  isDraftingAppearance
                    ? "border-black/10 bg-white"
                    : "border-white/8 bg-white/[0.03]",
                )}
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
                className={cn(
                  "rounded-full px-4 shadow-none",
                  isDraftingAppearance
                    ? "border border-red-500/15 bg-red-500/[0.06] text-red-700 hover:bg-red-500/[0.10]"
                    : "border border-red-300/10 bg-red-400/[0.08] text-red-200 hover:bg-red-400/[0.14]",
                )}
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

export function DashboardBackgroundPanel({
  appearance,
  onSceneChange,
  scene,
}: {
  appearance: DashboardEditAppearance
  onSceneChange: React.Dispatch<React.SetStateAction<DashboardComposeScene>>
  scene: DashboardComposeScene
}) {
  const selectedItemId = getDashboardBackgroundControlMode(scene.background)
  const isDraftingAppearance = appearance === "drafting"
  const [draftingOpenItemIds, setDraftingOpenItemIds] = useState<string[]>(() =>
    createDashboardAccordionOpenItemIds(selectedItemId),
  )

  if (isDraftingAppearance) {
    return (
      <section data-slot="dashboard-edit-background" className="flex flex-col gap-6">
        <DraftingEditBackgroundColorTab
          gradient={scene.background.gradient}
          mode={selectedItemId}
          openItemIds={draftingOpenItemIds}
          onGradientChange={(gradient) => {
            setDraftingOpenItemIds((current) =>
              ensureDashboardAccordionItemExpanded(current, "gradient"),
            )
            onSceneChange((current) =>
              updateDashboardComposeBackground(current, {
                gradient: {
                  ...gradient,
                  enabled: true,
                },
                mode: "gradient",
              }),
            )
          }}
          onModeChange={(mode) => {
            setDraftingOpenItemIds((current) =>
              ensureDashboardAccordionItemExpanded(current, mode),
            )
            onSceneChange((current) =>
              updateDashboardComposeBackground(current, {
                mode,
              }),
            )
          }}
          onOpenItemIdsChange={setDraftingOpenItemIds}
          onSolidColorChange={(value) => {
            setDraftingOpenItemIds((current) =>
              ensureDashboardAccordionItemExpanded(current, "solid"),
            )
            onSceneChange((current) =>
              updateDashboardComposeBackground(current, {
                color: value,
                mode: "solid",
              }),
            )
          }}
          onTransparentSelect={() => {
            setDraftingOpenItemIds((current) =>
              ensureDashboardAccordionItemExpanded(current, "transparent"),
            )
            onSceneChange((current) =>
              updateDashboardComposeBackground(current, {
                mode: "transparent",
              }),
            )
          }}
          solidColor={scene.background.color}
        />
      </section>
    )
  }

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
        className={cn(
          isDraftingAppearance &&
            "[&_[data-slot=motion-accordion-item]]:border-black/10 [&_[data-slot=motion-accordion-item]]:bg-white/80 [&_[data-slot=motion-accordion-item]]:shadow-[0_10px_30px_rgba(15,23,42,0.06)] [&_[data-slot=motion-accordion-item]]:backdrop-blur-sm [&_[data-slot=motion-accordion-trigger]_[data-slot=motion-accordion-toggle]]:border-black/10 [&_[data-slot=motion-accordion-trigger]_[data-slot=motion-accordion-toggle]]:bg-black/[0.03] [&_[data-slot=motion-accordion-item][data-state=open]_[data-slot=motion-accordion-toggle]]:border-black/12 [&_[data-slot=motion-accordion-item][data-state=open]_[data-slot=motion-accordion-toggle]]:bg-black/[0.08]",
        )}
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

function LayerPill({
  appearance,
  children,
}: {
  appearance: DashboardEditAppearance
  children: string
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[0.62rem] font-medium tracking-[0.14em] text-foreground/52 uppercase",
        appearance === "drafting"
          ? "border border-black/10 bg-black/[0.03]"
          : "border border-white/10",
      )}
    >
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

function getDraftingLayerStateLabel(
  node: DashboardComposeNode,
  isSelected: boolean,
) {
  const labels = [node.kind === "image" ? "Image" : "QR"]

  if (!node.isVisible) {
    labels.push("Hidden")
  }

  if (node.isLocked) {
    labels.push("Locked")
  }

  if (isSelected) {
    labels.push("Selected")
  }

  return labels.join(" · ")
}

function parseFiniteNumber(value: string, fallback: number) {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

function formatFiniteNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(0) : "0"
}
