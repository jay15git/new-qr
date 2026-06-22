"use client"

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import { motion, type Transition } from "motion/react"

import { TabsSubtle, TabsSubtleItem } from "@/components/ui/tabs-subtle"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
} from "@/components/ui/file-upload"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const DESKTOP_INSPECTOR_IMAGE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024

export const DESKTOP_INSPECTOR_FG_PRIMARY =
  "text-[var(--desktop-inspector-fg-primary)]"
export const DESKTOP_INSPECTOR_FG_SECONDARY =
  "text-[var(--desktop-inspector-fg-secondary)]"
export const DESKTOP_INSPECTOR_FG_TERTIARY =
  "text-[var(--desktop-inspector-fg-tertiary)]"
export const DESKTOP_INSPECTOR_FG_MUTED =
  "text-[var(--desktop-inspector-fg-muted)]"
export const DESKTOP_INSPECTOR_FG_LABEL =
  "text-[var(--desktop-inspector-fg-label)]"
export const DESKTOP_INSPECTOR_TYPE_PANEL_CLASS =
  "text-[length:var(--desktop-inspector-type-panel)]"
export const DESKTOP_INSPECTOR_TYPE_VALUE_CLASS =
  "text-[length:var(--desktop-inspector-type-value)] leading-[1.45]"
export const DESKTOP_INSPECTOR_TYPE_LABEL_CLASS =
  "text-[length:var(--desktop-inspector-type-label)]"
export const DESKTOP_INSPECTOR_TYPE_CAPTION_CLASS =
  "text-[length:var(--desktop-inspector-type-caption)]"
export const DESKTOP_INSPECTOR_SECTION_HEADING_CLASS =
  cn(
    "mb-1.5 truncate font-medium tracking-[0.01em] text-[var(--desktop-inspector-fg-tertiary)]",
    DESKTOP_INSPECTOR_TYPE_LABEL_CLASS,
  )
export const DESKTOP_INSPECTOR_PANEL_TITLE_CLASS =
  cn(
    "truncate font-semibold leading-5 text-[var(--desktop-inspector-fg-primary)]",
    DESKTOP_INSPECTOR_TYPE_PANEL_CLASS,
  )
export const DESKTOP_INSPECTOR_VALUE_CLASS = cn(
  "font-medium tabular-nums text-[var(--desktop-inspector-fg-primary)]",
  DESKTOP_INSPECTOR_TYPE_VALUE_CLASS,
)
export const DESKTOP_INSPECTOR_CAPTION_CLASS = cn(
  "font-medium text-[var(--desktop-inspector-fg-muted)]",
  DESKTOP_INSPECTOR_TYPE_CAPTION_CLASS,
)
export const DESKTOP_INSPECTOR_SECTION_CLASS =
  "rounded-[10px] bg-[var(--desktop-inspector-section-bg)] p-3"
export const DESKTOP_INSPECTOR_SECTION_GAP_CLASS = "mt-2.5"
export const DESKTOP_INSPECTOR_MAJOR_GAP_CLASS = "mt-4"
export const DESKTOP_INSPECTOR_ROW_GAP_CLASS = "gap-2"
export const DESKTOP_INSPECTOR_ROW_CLASS =
  "flex min-w-0 items-center justify-between gap-3 py-2.5"
export const DESKTOP_INSPECTOR_FIELD_ROW_CLASS =
  "min-w-0 py-2.5"
export const DESKTOP_INSPECTOR_LABEL_CLASS = cn(
  "truncate font-medium text-[var(--desktop-inspector-fg-label)]",
  DESKTOP_INSPECTOR_TYPE_LABEL_CLASS,
)
export const DESKTOP_INSPECTOR_SCROLL_CLASS =
  "min-h-0 flex-1 overflow-y-auto px-3 py-3 scroll-fade-effect-y"
export const DESKTOP_INSPECTOR_CONTROL_CLASS =
  "cursor-pointer rounded-[6px] border border-transparent bg-transparent text-[var(--desktop-inspector-fg-tertiary)] transition hover:border-[var(--desktop-inspector-control-border-hover)] hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-[var(--desktop-inspector-fg-primary)] active:bg-[var(--desktop-inspector-control-active-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)] disabled:cursor-not-allowed"
export const DESKTOP_INSPECTOR_SELECTED_CLASS =
  "border-transparent bg-[var(--desktop-inspector-option-selected-bg)] text-[var(--desktop-inspector-option-selected-fg)] hover:border-transparent hover:bg-[var(--desktop-inspector-option-selected-bg)] hover:text-[var(--desktop-inspector-option-selected-fg)]"
export const DESKTOP_OPTION_CARD_SELECTED_CLASS =
  "border-[var(--desktop-inspector-option-selected-border)] bg-[var(--desktop-inspector-option-selected-bg)] text-[var(--desktop-inspector-option-selected-fg)] hover:bg-[var(--desktop-inspector-option-selected-bg)] hover:text-[var(--desktop-inspector-option-selected-fg)]"
export const DESKTOP_INSPECTOR_INPUT_CLASS = cn(
  "desktop-inspector-input-bg bg-[var(--desktop-inspector-field-bg)] font-medium text-[var(--desktop-inspector-fg-primary)] outline-none placeholder:text-[var(--desktop-inspector-fg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]",
  DESKTOP_INSPECTOR_TYPE_VALUE_CLASS,
)
export const DESKTOP_INSPECTOR_FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
export const DESKTOP_INSPECTOR_HEADER_CLASS =
  "flex min-w-0 items-center justify-center px-4 py-3 text-center"
export const DESKTOP_INSPECTOR_FOOTER_CLASS =
  "bg-[var(--desktop-inspector-footer-bg)] p-2.5"
export const DESKTOP_INSPECTOR_RESET_CLASS = cn(
  "flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-transparent bg-transparent px-3 font-medium text-[var(--desktop-inspector-fg-secondary)] transition hover:border-[var(--desktop-inspector-control-border-hover)] hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-[var(--desktop-inspector-fg-primary)] active:bg-[var(--desktop-inspector-control-active-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]",
  DESKTOP_INSPECTOR_TYPE_VALUE_CLASS,
)
export const DESKTOP_INSPECTOR_DROPDOWN_MENU_CLASS =
  "desktop-inspector-dropdown-menu z-50 min-w-0 rounded-[10px] border border-[var(--desktop-inspector-dropdown-border)] bg-[var(--desktop-inspector-dropdown-bg)] p-1 text-[var(--desktop-inspector-fg-secondary)] shadow-[0_10px_28px_rgba(0,0,0,0.14)] ring-0 backdrop-blur-xl"
export const DESKTOP_INSPECTOR_DROPDOWN_TRIGGER_CLASS = cn(
  "desktop-inspector-input-bg cursor-pointer bg-[var(--desktop-inspector-field-bg)] font-medium text-[var(--desktop-inspector-fg-tertiary)] outline-none transition hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-[var(--desktop-inspector-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)] data-[state=open]:bg-[var(--desktop-inspector-control-hover-bg)] data-[state=open]:text-[var(--desktop-inspector-fg-primary)]",
  DESKTOP_INSPECTOR_TYPE_VALUE_CLASS,
)
export const DESKTOP_INSPECTOR_DROPDOWN_ITEM_CLASS = cn(
  "h-8 cursor-pointer rounded-[6px] px-3 font-medium text-[var(--desktop-inspector-fg-tertiary)] outline-none transition focus:bg-[var(--desktop-inspector-control-hover-bg)] focus:text-[var(--desktop-inspector-fg-primary)] focus:**:text-[var(--desktop-inspector-fg-primary)] data-[highlighted]:bg-[var(--desktop-inspector-control-hover-bg)] data-[highlighted]:text-[var(--desktop-inspector-fg-primary)] data-[highlighted]:**:text-[var(--desktop-inspector-fg-primary)] data-[state=checked]:bg-[var(--desktop-inspector-option-selected-bg)] data-[state=checked]:text-[var(--desktop-inspector-fg-primary)] data-[state=checked]:focus:bg-[var(--desktop-inspector-option-selected-bg)] data-[state=checked]:focus:text-[var(--desktop-inspector-fg-primary)] data-[state=checked]:data-[highlighted]:bg-[var(--desktop-inspector-option-selected-bg)] data-[state=checked]:data-[highlighted]:text-[var(--desktop-inspector-fg-primary)] [&_[data-slot=dropdown-menu-radio-item-indicator]]:hidden",
  DESKTOP_INSPECTOR_TYPE_VALUE_CLASS,
)
export const DESKTOP_INSPECTOR_OPTION_TILE_BUTTON_CLASS =
  "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
export const DESKTOP_INSPECTOR_OPTION_TILE_SURFACE_CLASS = cn(
  "rounded-[7px] border-2 border-transparent bg-transparent font-medium text-[var(--desktop-inspector-fg-tertiary)] transition hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-[var(--desktop-inspector-fg-primary)]",
  DESKTOP_INSPECTOR_TYPE_CAPTION_CLASS,
)

export const DESKTOP_INSPECTOR_OPTION_GRID_COLS_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const

export type DesktopInspectorOptionGridColumns = keyof typeof DESKTOP_INSPECTOR_OPTION_GRID_COLS_CLASS

export const DESKTOP_INSPECTOR_OPTION_GRID_ITEM_PADDING_CLASS = {
  tight: "p-[3px]",
  loose: "p-1",
} as const

export type DesktopInspectorOptionGridSpacing = keyof typeof DESKTOP_INSPECTOR_OPTION_GRID_ITEM_PADDING_CLASS

export function desktopInspectorOptionGridClass(
  columns: DesktopInspectorOptionGridColumns,
  className?: string,
) {
  return cn("grid gap-0", DESKTOP_INSPECTOR_OPTION_GRID_COLS_CLASS[columns], className)
}

export const DESKTOP_INSPECTOR_OPTION_SELECTION_SPRING: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 1,
}

type DesktopInspectorOptionSelectionRect = {
  height: number
  left: number
  top: number
  width: number
}

function measureDesktopInspectorOptionSelection(
  container: HTMLElement,
): DesktopInspectorOptionSelectionRect | null {
  const selected = container.querySelector<HTMLElement>(
    '[data-desktop-animated-option-selection="true"][aria-pressed="true"]',
  )

  if (!selected) {
    return null
  }

  return {
    left: selected.offsetLeft,
    top: selected.offsetTop,
    width: selected.offsetWidth,
    height: selected.offsetHeight,
  }
}

export function DesktopInspectorAnimatedOptionGrid({
  className,
  columns,
  children,
  selectedKey,
  ...props
}: {
  className?: string
  columns: DesktopInspectorOptionGridColumns
  children: ReactNode
  selectedKey?: string | number | boolean | null
} & ComponentProps<"div">) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedRect, setSelectedRect] = useState<DesktopInspectorOptionSelectionRect | null>(null)

  const measureSelected = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    setSelectedRect(measureDesktopInspectorOptionSelection(container))
  }, [])

  useLayoutEffect(() => {
    measureSelected()
  }, [measureSelected, selectedKey, children])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const viewport = container.closest<HTMLElement>('[data-slot="scroll-area-viewport"]')
    const resizeTarget = viewport ?? container

    const handleChange = () => {
      measureSelected()
    }

    let observer: ResizeObserver | undefined

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(handleChange)
      observer.observe(container)
      container
        .querySelectorAll('[data-desktop-animated-option-selection="true"]')
        .forEach((node) => observer?.observe(node))
    }

    resizeTarget.addEventListener("scroll", handleChange, { passive: true })
    window.addEventListener("resize", handleChange)

    return () => {
      observer?.disconnect()
      resizeTarget.removeEventListener("scroll", handleChange)
      window.removeEventListener("resize", handleChange)
    }
  }, [measureSelected, selectedKey])

  return (
    <div
      ref={containerRef}
      className={cn("relative", desktopInspectorOptionGridClass(columns, className))}
      {...props}
    >
      {selectedRect ? (
        <motion.div
          data-slot="desktop-inspector-option-selection-indicator"
          className="pointer-events-none absolute z-0 rounded-[7px] border-2 border-[var(--desktop-inspector-option-selected-border)] bg-[var(--desktop-inspector-option-selected-bg)]"
          initial={false}
          animate={{
            left: selectedRect.left,
            top: selectedRect.top,
            width: selectedRect.width,
            height: selectedRect.height,
          }}
          transition={DESKTOP_INSPECTOR_OPTION_SELECTION_SPRING}
        />
      ) : null}
      {children}
    </div>
  )
}

export function desktopInspectorOptionStackClass(className?: string) {
  return cn("grid gap-0", className)
}

export function desktopInspectorOptionGridItemClass(
  spacing: DesktopInspectorOptionGridSpacing = "tight",
) {
  return cn("w-full min-w-0", DESKTOP_INSPECTOR_OPTION_GRID_ITEM_PADDING_CLASS[spacing])
}

type DesktopInspectorSectionElement = "section" | "div" | "details"

type DesktopInspectorSectionProps = Omit<ComponentProps<"section">, "as"> & {
  as?: DesktopInspectorSectionElement
  dataSlot?: string
  resize?: boolean
}

function useTResizeHeight(enabled: boolean) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      setHeight(null)
      return
    }

    const element = contentRef.current

    if (!element) {
      return
    }

    const update = () => {
      const element = contentRef.current
      if (!element) {
        return
      }

      const host = element.parentElement
      if (!host) {
        setHeight(element.offsetHeight)
        return
      }

      const { paddingBottom, paddingTop } = getComputedStyle(host)
      const paddingY =
        (Number.parseFloat(paddingTop) || 0) + (Number.parseFloat(paddingBottom) || 0)

      setHeight(element.offsetHeight + paddingY)
    }

    if (typeof ResizeObserver === "undefined") {
      update()
      return
    }

    const observer = new ResizeObserver(update)
    observer.observe(element)
    update()

    return () => observer.disconnect()
  }, [enabled])

  return { contentRef, height }
}

export function DesktopInspectorSection({
  as = "section",
  children,
  className,
  dataSlot,
  resize = false,
  style,
  ...props
}: DesktopInspectorSectionProps) {
  const Component = as as ElementType
  const { contentRef, height } = useTResizeHeight(resize)
  const resizeStyle: CSSProperties | undefined =
    resize && height !== null ? { height } : undefined

  return (
    <Component
      data-slot={dataSlot}
      className={cn(
        DESKTOP_INSPECTOR_SECTION_CLASS,
        resize && "t-resize overflow-hidden",
        className,
      )}
      style={{ ...style, ...resizeStyle }}
      {...props}
    >
      {resize ? <div ref={contentRef}>{children}</div> : children}
    </Component>
  )
}

type DesktopInspectorLabelProps = ComponentProps<"p">

export function DesktopInspectorLabel({
  className,
  ...props
}: DesktopInspectorLabelProps) {
  return (
    <p
      className={cn("mb-1.5", DESKTOP_INSPECTOR_LABEL_CLASS, className)}
      {...props}
    />
  )
}

type DesktopInspectorTextInputProps = ComponentProps<"input">

export function DesktopInspectorTextInput({
  className,
  type = "text",
  ...props
}: DesktopInspectorTextInputProps) {
  return (
    <input
      className={cn("h-9 w-full rounded-[7px] px-3", DESKTOP_INSPECTOR_INPUT_CLASS, className)}
      type={type}
      {...props}
    />
  )
}

type DesktopInspectorTextareaProps = ComponentProps<"textarea">

export function DesktopInspectorTextarea({
  className,
  ...props
}: DesktopInspectorTextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-none rounded-[7px] px-3 py-2.5",
        DESKTOP_INSPECTOR_INPUT_CLASS,
        className,
      )}
      {...props}
    />
  )
}

type DesktopInspectorNativeSelectProps<TValue extends string> =
  Omit<ComponentProps<"select">, "onChange" | "value"> & {
    iconClassName?: string
    options: Array<{ label: string; value: TValue }>
    onValueChange: (value: TValue) => void
    rootClassName?: string
    showIcon?: boolean
    value: TValue
  }

export function DesktopInspectorNativeSelect<TValue extends string>({
  className,
  iconClassName,
  onValueChange,
  options,
  rootClassName,
  showIcon = true,
  value,
  ...props
}: DesktopInspectorNativeSelectProps<TValue>) {
  return (
    <div className={cn("relative min-w-0", rootClassName)}>
      <select
        className={cn(
          "h-8 w-full cursor-pointer appearance-none rounded-[6px] px-2.5 pr-7 font-medium transition",
          DESKTOP_INSPECTOR_INPUT_CLASS,
          className,
        )}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value as TValue)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showIcon ? (
        <ChevronDownIcon
          className={cn(
            "pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2",
            DESKTOP_INSPECTOR_FG_MUTED,
            iconClassName,
          )}
        />
      ) : null}
    </div>
  )
}

type DesktopInspectorSegmentedControlProps<TValue extends string> = {
  ariaLabelPrefix?: string
  className?: string
  columns?: 2 | 3 | 4
  dataSlot?: string
  itemClassName?: string
  items: Array<{ icon?: ReactNode; label: string; value: TValue }>
  itemAriaLabel?: (item: { icon?: ReactNode; label: string; value: TValue }) => string
  onValueChange: (value: TValue) => void
  selectedClassName?: string
  value: TValue
}

const DESKTOP_INSPECTOR_TAB_ITEM_CLASS = cn(
  "h-8 min-w-0 flex-1 justify-center px-2 py-0 [&_span]:font-medium [&_span]:text-[var(--desktop-inspector-fg-tertiary)]",
  "[&_span]:text-[length:var(--desktop-inspector-type-label)]",
  "[&[aria-selected=true]_span]:text-[length:var(--desktop-inspector-type-value)] [&[aria-selected=true]_span]:text-[var(--desktop-inspector-fg-primary)]",
)

export function DesktopInspectorSegmentedControl<TValue extends string>({
  ariaLabelPrefix,
  className,
  columns = 2,
  dataSlot,
  itemClassName,
  itemAriaLabel,
  items,
  onValueChange,
  selectedClassName: _selectedClassName = DESKTOP_INSPECTOR_SELECTED_CLASS,
  value,
}: DesktopInspectorSegmentedControlProps<TValue>) {
  const generatedId = useId()
  const idPrefix = (dataSlot ?? generatedId).replace(/:/g, "")
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  )
  const compactItemClass =
    columns === 4 ? "px-1 [&_span]:text-[length:var(--desktop-inspector-type-caption)]" : columns === 3 ? "px-1.5 [&_span]:text-[length:var(--desktop-inspector-type-caption)]" : undefined

  return (
    <TabsSubtle
      className={cn("w-full gap-0 py-0 my-0", className)}
      data-slot={dataSlot ?? "desktop-inspector-segmented-control"}
      idPrefix={idPrefix}
      selectedIndex={selectedIndex}
      onSelect={(index) => {
        const next = items[index]
        if (next) onValueChange(next.value)
      }}
    >
      {items.map((item, index) => (
        <TabsSubtleItem
          key={item.value}
          aria-label={
            itemAriaLabel?.(item) ??
            (ariaLabelPrefix ? `${ariaLabelPrefix} ${item.label}` : undefined)
          }
          className={cn(DESKTOP_INSPECTOR_TAB_ITEM_CLASS, compactItemClass, itemClassName)}
          index={index}
          label={item.label}
        />
      ))}
    </TabsSubtle>
  )
}

type DesktopInspectorSearchInputProps =
  Omit<ComponentProps<"input">, "onChange"> & {
    iconClassName?: string
    inputClassName?: string
    onValueChange: (value: string) => void
  }

export function DesktopInspectorSearchInput({
  className,
  iconClassName,
  inputClassName,
  onValueChange,
  type = "text",
  ...props
}: DesktopInspectorSearchInputProps) {
  return (
    <div className={cn("relative h-8 w-24 shrink-0", className)}>
      <SearchIcon
        className={cn(
          "pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2",
          DESKTOP_INSPECTOR_FG_MUTED,
          iconClassName,
        )}
      />
      <Input
        className={cn(
          "h-full w-full rounded-[6px] border-transparent pl-7 pr-2",
          DESKTOP_INSPECTOR_INPUT_CLASS,
          inputClassName,
          "focus-visible:ring-0 focus-visible:shadow-none",
        )}
        type={type}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        {...props}
      />
    </div>
  )
}

export function DesktopInspectorImageFileUpload({
  className,
  "data-slot": dataSlot = "desktop-inspector-image-file-upload",
  label = "Image file upload",
  onFileAccept,
}: {
  className?: string
  "data-slot"?: string
  label?: string
  onFileAccept: (file: File) => void
}) {
  return (
    <FileUpload
      accept="image/*"
      className={cn("gap-2", className)}
      data-slot={dataSlot}
      label={label}
      maxFiles={1}
      maxSize={DESKTOP_INSPECTOR_IMAGE_UPLOAD_MAX_SIZE}
      onFileAccept={onFileAccept}
    >
      <FileUploadDropzone
        className={cn(
          "rounded-[8px] border border-dashed border-white/[0.12] bg-[var(--desktop-inspector-field-bg)] p-4 text-center shadow-none outline-none transition-colors",
          "hover:bg-[var(--desktop-inspector-control-hover-bg)]",
          "data-[dragging]:border-[var(--desktop-inspector-focus)] data-[dragging]:bg-[var(--desktop-inspector-control-hover-bg)]",
          "data-[invalid]:border-red-400/70",
        )}
      >
        <p className={DESKTOP_INSPECTOR_VALUE_CLASS}>
          Drag & drop image here
        </p>
        <p className={cn("mt-1", DESKTOP_INSPECTOR_CAPTION_CLASS)}>
          Or click to browse (max 5MB)
        </p>
        <FileUploadTrigger
          className={cn(
            "mt-3 inline-flex h-8 cursor-pointer items-center justify-center rounded-[6px] px-3",
            DESKTOP_INSPECTOR_TYPE_LABEL_CLASS,
            DESKTOP_INSPECTOR_CONTROL_CLASS,
          )}
          type="button"
        >
          Browse files
        </FileUploadTrigger>
      </FileUploadDropzone>
    </FileUpload>
  )
}
