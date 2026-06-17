"use client"

import { useState, type ReactNode } from "react"
import { CopyPlusIcon, FrameIcon, ImageIcon, TypeIcon } from "lucide-react"

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
import { cn } from "@/lib/utils"

const INSERT_SHAPE_PRIMITIVES: Array<{ id: DraftingElementShapeId; label: string }> = [
  { id: "rect", label: "Rectangle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "line", label: "Line" },
  { id: "arrow", label: "Arrow" },
]

const DESKTOP_INSERT_POPOVER_SHELL =
  "w-[min(18rem,calc(100vw-2rem))] rounded-[20px] border border-white/[0.12] bg-black/70 p-2 text-white/84 shadow-[0_24px_64px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"

const DESKTOP_INSERT_MENU_ITEM =
  "flex h-10 w-full items-center gap-2 rounded-[10px] px-2 text-left text-sm font-semibold text-current transition hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 disabled:cursor-not-allowed disabled:opacity-40"

type InsertMenuProps = {
  nodeId: string
  onInsertLayer: (layer: ReturnType<typeof createDraftingTextLayer>) => void
  canAddQrCode?: boolean
  onAddQrCode?: () => void
  triggerClassName?: string
  variant?: "rail" | "toolbar" | "bottom-toolbar"
}

export function InsertMenu({
  nodeId,
  onInsertLayer,
  canAddQrCode = true,
  onAddQrCode,
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

  function addQrCode() {
    onAddQrCode?.()
    closeMenu()
  }

  const isDesktopPopover = variant === "bottom-toolbar"

  function renderMenuAction({
    children,
    disabled,
    onClick,
    slot,
  }: {
    children: ReactNode
    disabled?: boolean
    onClick: () => void
    slot?: string
  }) {
    if (isDesktopPopover) {
      return (
        <button
          className={DESKTOP_INSERT_MENU_ITEM}
          data-slot={slot}
          disabled={disabled}
          type="button"
          onClick={onClick}
        >
          {children}
        </button>
      )
    }

    return (
      <SecondaryButton
        className="h-10 w-full justify-start"
        data-slot={slot}
        disabled={disabled}
        type="button"
        onClick={onClick}
      >
        {children}
      </SecondaryButton>
    )
  }

  const trigger =
    variant === "bottom-toolbar" ? (
      <Button
        aria-label="Add content"
        className={
          triggerClassName ??
          "h-8 w-8 rounded-md border-0 bg-transparent p-0 text-[var(--drafting-ink-muted)] shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[var(--drafting-ink)]"
        }
        data-slot="drafting-insert-menu-trigger"
        size="icon-md"
        title="Add content"
        type="button"
        variant="ghost"
      >
        <CopyPlusIcon />
      </Button>
    ) : variant === "toolbar" ? (
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
        align={variant === "bottom-toolbar" ? "center" : variant === "toolbar" ? "start" : "center"}
        className={cn(
          isDesktopPopover
            ? DESKTOP_INSERT_POPOVER_SHELL
            : "w-[min(24rem,calc(100vw-2rem))] space-y-3 border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] p-3",
        )}
        data-slot={isDesktopPopover ? "desktop-insert-menu-popover" : "drafting-insert-menu"}
        side={variant === "bottom-toolbar" ? "top" : undefined}
        sideOffset={variant === "bottom-toolbar" ? 12 : undefined}
      >
        {panel === "root" ? (
          <div className={cn("grid", isDesktopPopover ? "gap-0.5" : "gap-2")}>
            {renderMenuAction({ onClick: insertText, children: (
              <>
                <TypeIcon className="size-4 shrink-0" data-icon="inline-start" />
                Text
              </>
            ) })}
            {renderMenuAction({
              onClick: () => setPanel("shape"),
              children: (
                <>
                  <FrameIcon className="size-4 shrink-0" data-icon="inline-start" />
                  Shape
                </>
              ),
            })}
            {renderMenuAction({
              onClick: () => setPanel("image"),
              children: (
                <>
                  <ImageIcon className="size-4 shrink-0" data-icon="inline-start" />
                  Image
                </>
              ),
            })}
            {onAddQrCode
              ? renderMenuAction({
                  disabled: !canAddQrCode,
                  onClick: addQrCode,
                  slot: "drafting-insert-menu-add-qr",
                  children: (
                    <>
                      <CopyPlusIcon className="size-4 shrink-0" data-icon="inline-start" />
                      {canAddQrCode ? "QR code" : "Maximum 10 QR codes reached"}
                    </>
                  ),
                })
              : null}
          </div>
        ) : null}

        {panel === "shape" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p
                className={cn(
                  "font-semibold",
                  isDesktopPopover
                    ? "text-sm text-white/72"
                    : "drafting-type-control-label text-[var(--drafting-ink)]",
                )}
              >
                Choose shape
              </p>
              <Button
                className={isDesktopPopover ? "text-white/70 hover:bg-white/[0.11] hover:text-white" : undefined}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => setPanel("root")}
              >
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
              <p
                className={cn(
                  "font-semibold",
                  isDesktopPopover
                    ? "text-sm text-white/72"
                    : "drafting-type-control-label text-[var(--drafting-ink)]",
                )}
              >
                Add image
              </p>
              <Button
                className={isDesktopPopover ? "text-white/70 hover:bg-white/[0.11] hover:text-white" : undefined}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => setPanel("root")}
              >
                Back
              </Button>
            </div>
            <Input
              aria-label="Image URL"
              className={cn(
                "h-10 min-w-0 px-3 shadow-none",
                isDesktopPopover
                  ? "border-white/[0.12] bg-white/[0.08] text-white placeholder:text-white/40"
                  : "drafting-type-input border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] text-[var(--drafting-ink)]",
              )}
              placeholder="https://example.com/photo.png"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.currentTarget.value)}
            />
            {isDesktopPopover ? (
              <button
                className={DESKTOP_INSERT_MENU_ITEM}
                disabled={!imageUrl.trim()}
                type="button"
                onClick={() => insertImage(imageUrl.trim(), "url")}
              >
                Use URL
              </button>
            ) : (
              <SecondaryButton
                className="h-9 w-full"
                disabled={!imageUrl.trim()}
                type="button"
                onClick={() => insertImage(imageUrl.trim(), "url")}
              >
                Use URL
              </SecondaryButton>
            )}
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
