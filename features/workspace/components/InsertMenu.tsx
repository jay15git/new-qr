"use client"

import { useState } from "react"
import { FrameIcon, ImageIcon, TypeIcon } from "lucide-react"

import { OptionCard } from "@/components/ui/option-card"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SecondaryButton } from "@/components/ui/secondary-button"
import FileUpload from "@/components/vendor/kokonutui/file-upload"
import { Input } from "@/components/ui/input"
import {
  createDraftingImageLayer,
  createDraftingShapeLayer,
  createDraftingTextLayer,
  type DraftingElementShapeId,
} from "@/features/workspace/model/layers"
import { QR_BACKGROUND_SHAPES } from "@/features/qr-code/styles/background-shapes"

const INSERT_SHAPE_PRIMITIVES: Array<{ id: DraftingElementShapeId; label: string }> = [
  { id: "rect", label: "Rectangle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "line", label: "Line" },
  { id: "arrow", label: "Arrow" },
]

type InsertMenuProps = {
  nodeId: string
  onInsertLayer: (layer: ReturnType<typeof createDraftingTextLayer>) => void
  triggerClassName?: string
  variant?: "rail" | "toolbar"
}

export function InsertMenu({
  nodeId,
  onInsertLayer,
  triggerClassName,
  variant = "rail",
}: InsertMenuProps) {
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<"root" | "shape" | "image">("root")
  const [imageUrl, setImageUrl] = useState("")

  function closeMenu() {
    setOpen(false)
    setPanel("root")
    setImageUrl("")
  }

  function insertText() {
    onInsertLayer(createDraftingTextLayer(nodeId))
    closeMenu()
  }

  function insertShape(shapeId: DraftingElementShapeId) {
    onInsertLayer(createDraftingShapeLayer(nodeId, shapeId))
    closeMenu()
  }

  function insertImage(value: string, source: "upload" | "url") {
    onInsertLayer(
      createDraftingImageLayer(nodeId, {
        imageSource: source,
        imageValue: value,
      }),
    )
    closeMenu()
  }

  const trigger =
    variant === "toolbar" ? (
      <Button
        className={triggerClassName}
        data-slot="drafting-insert-menu-trigger"
        type="button"
        variant="ghost"
      >
        + Insert
      </Button>
    ) : (
      <SecondaryButton
        className={triggerClassName ?? "h-9 w-full"}
        data-slot="drafting-insert-menu-trigger"
        type="button"
      >
        + Insert
      </SecondaryButton>
    )

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setPanel("root")
          setImageUrl("")
        }
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={variant === "toolbar" ? "start" : "center"}
        className="w-[min(24rem,calc(100vw-2rem))] space-y-3 border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] p-3"
        data-slot="drafting-insert-menu"
      >
        {panel === "root" ? (
          <div className="grid gap-2">
            <SecondaryButton className="h-10 w-full justify-start" type="button" onClick={insertText}>
              <TypeIcon data-icon="inline-start" />
              Text
            </SecondaryButton>
            <SecondaryButton
              className="h-10 w-full justify-start"
              type="button"
              onClick={() => setPanel("shape")}
            >
              <FrameIcon data-icon="inline-start" />
              Shape
            </SecondaryButton>
            <SecondaryButton
              className="h-10 w-full justify-start"
              type="button"
              onClick={() => setPanel("image")}
            >
              <ImageIcon data-icon="inline-start" />
              Image
            </SecondaryButton>
          </div>
        ) : null}

        {panel === "shape" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="drafting-type-control-label font-semibold text-[var(--drafting-ink)]">
                Choose shape
              </p>
              <Button size="sm" type="button" variant="ghost" onClick={() => setPanel("root")}>
                Back
              </Button>
            </div>
            <div className="grid max-h-72 grid-cols-[repeat(auto-fit,minmax(84px,1fr))] gap-2 overflow-y-auto">
              {INSERT_SHAPE_PRIMITIVES.map((shape) => (
                <OptionCard
                  appearance="drafting"
                  checked={false}
                  darkShadowTone="ink"
                  key={shape.id}
                  label={shape.label}
                  labelClassName="drafting-type-option-label"
                  name="drafting-insert-shape"
                  onSelect={() => insertShape(shape.id)}
                  size="compact"
                  value={shape.id}
                >
                  <span className="grid size-full place-items-center text-[10px] font-semibold text-[var(--drafting-ink-muted)]">
                    {shape.label}
                  </span>
                </OptionCard>
              ))}
              {QR_BACKGROUND_SHAPES.map((shape) => (
                <OptionCard
                  appearance="drafting"
                  checked={false}
                  darkShadowTone="ink"
                  key={shape.id}
                  label={shape.label}
                  labelClassName="drafting-type-option-label"
                  name="drafting-insert-shape"
                  onSelect={() => insertShape(shape.id)}
                  size="compact"
                  value={shape.id}
                >
                  <span className="flex items-center justify-center [&_svg]:size-12">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      viewBox={`0 0 ${shape.viewBox.width} ${shape.viewBox.height}`}
                    >
                      <path d={shape.path} fill="#E8E8E8" />
                    </svg>
                  </span>
                </OptionCard>
              ))}
            </div>
          </div>
        ) : null}

        {panel === "image" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="drafting-type-control-label font-semibold text-[var(--drafting-ink)]">
                Add image
              </p>
              <Button size="sm" type="button" variant="ghost" onClick={() => setPanel("root")}>
                Back
              </Button>
            </div>
            <Input
              aria-label="Image URL"
              className="drafting-type-input h-10 min-w-0 border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] px-3 text-[var(--drafting-ink)] shadow-none"
              placeholder="https://example.com/photo.png"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.currentTarget.value)}
            />
            <SecondaryButton
              className="h-9 w-full"
              disabled={!imageUrl.trim()}
              type="button"
              onClick={() => insertImage(imageUrl.trim(), "url")}
            >
              Use URL
            </SecondaryButton>
            <FileUpload
              acceptedFileTypes={["image/*"]}
              className="mx-0 max-w-full"
              onUploadError={() => undefined}
              onUploadSuccess={(file) => insertImage(URL.createObjectURL(file), "upload")}
              uploadDelay={0}
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
