"use client"

import Link from "next/link"
import { LayoutGroup, motion, type Transition } from "motion/react"
import {
  GridViewIcon,
  Menu01Icon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_PRIMARY,
} from "@/features/desktop-shell/components/InspectorControls"
import { cn } from "@/lib/utils"

type CollectionIcon = typeof QrCodeIcon

export type AnimatedCollectionItem = {
  destinationPreview?: string
  editedLabel?: string
  href?: string
  icon?: CollectionIcon
  id: string
  image: string
  tags: string[]
  title: string
}

type ViewMode = "list" | "card"

export type CollectionViewMode = ViewMode

export const LIBRARY_LIFTED_SURFACE_CLASS =
  "rounded-full bg-[var(--desktop-inspector-option-selected-bg)] shadow-[var(--drafting-shadow-rest)]"

const MAX_VISIBLE_TAGS = 3

const LIBRARY_LIST_ROW_GRID =
  "grid w-full grid-cols-[4rem_minmax(0,1.15fr)_minmax(9rem,13rem)_minmax(0,1fr)_7.25rem] items-center gap-x-6"

type AnimatedCollectionProps = {
  className?: string
  items: AnimatedCollectionItem[]
  view: ViewMode
}

const snappySpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 1,
}

export function AnimatedCollection({ className, items, view }: AnimatedCollectionProps) {
  return (
    <div
      data-slot="library-animated-collection"
      className={cn("w-full selection:bg-[var(--desktop-inspector-control-hover-bg)]", className)}
    >
      <div className="relative flex min-h-[350px] flex-col items-center">
        <LayoutGroup id="library-animated-collection">
          <motion.div
            layout
            transition={snappySpring}
            className={cn(
              "relative w-full",
              view === "list" && "flex flex-col gap-3",
              view === "card" && "grid grid-cols-4 gap-4",
            )}
          >
            {items.map((item) => (
              <CollectionItemRow key={item.id} item={item} view={view} />
            ))}
          </motion.div>
        </LayoutGroup>
      </div>
    </div>
  )
}

export function CollectionViewTabs({
  view,
  onViewChange,
  className,
}: {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <CollectionViewTab
        active={view === "card"}
        aria-label="Grid view"
        icon={GridViewIcon}
        onClick={() => onViewChange("card")}
      />
      <CollectionViewTab
        active={view === "list"}
        aria-label="List view"
        icon={Menu01Icon}
        onClick={() => onViewChange("list")}
      />
    </div>
  )
}

function CollectionItemRow({
  item,
  view,
}: {
  item: AnimatedCollectionItem
  view: ViewMode
}) {
  const isList = view === "list"

  const content = (
    <motion.div
      layout
      transition={snappySpring}
      className={cn(
        "relative z-10 w-full",
        isList && cn(LIBRARY_LIST_ROW_GRID, "py-0.5"),
        !isList && "flex flex-col items-start gap-3",
      )}
    >
      <motion.div
        layout
        transition={snappySpring}
        className={cn(
          "relative shrink-0 overflow-hidden bg-[var(--drafting-option-card-bg)]",
          isList &&
            "h-16 w-16 rounded-2xl border border-[var(--drafting-option-card-border)]",
          !isList &&
            "aspect-square w-full rounded-[1.8rem] border border-[var(--drafting-option-card-border)] shadow-[var(--drafting-option-card-shadow-rest)]",
        )}
      >
        <motion.img
          layout
          transition={snappySpring}
          src={item.image}
          alt={item.title}
          className={cn(
            "m-0! block h-full w-full object-cover p-0!",
            isList && "rounded-2xl",
            !isList && "rounded-[1.8rem]",
          )}
        />
      </motion.div>

      <motion.h3
        layout
        transition={snappySpring}
        className={cn(
          "min-w-0 truncate text-[15px] leading-tight font-medium",
          DESKTOP_INSPECTOR_FG_PRIMARY,
          !isList && "w-full px-1",
        )}
      >
        {item.title}
      </motion.h3>

      <motion.div
        layout
        transition={snappySpring}
        className={cn("min-w-0", !isList && "w-full px-1")}
      >
        {item.tags.length > 0 ? (
          <CollectionTagRow className={cn(isList && "flex-nowrap")} tags={item.tags} />
        ) : isList ? (
          <span className={cn("text-xs", DESKTOP_INSPECTOR_FG_MUTED)}>—</span>
        ) : null}
      </motion.div>

      <motion.p
        layout
        transition={snappySpring}
        className={cn(
          "min-w-0 truncate text-xs font-medium",
          DESKTOP_INSPECTOR_FG_MUTED,
          isList ? "block" : "w-full px-1",
          !isList && !item.destinationPreview && "hidden",
        )}
      >
        {item.destinationPreview || (isList ? "—" : "")}
      </motion.p>

      <motion.p
        layout
        transition={snappySpring}
        className={cn(
          "text-xs font-medium",
          DESKTOP_INSPECTOR_FG_MUTED,
          isList && "text-right whitespace-nowrap",
          !isList && "w-full px-1",
          !isList && !item.editedLabel && "hidden",
        )}
      >
        {item.editedLabel || (isList ? "—" : "")}
      </motion.p>
    </motion.div>
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "block w-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]",
          isList && "rounded-lg",
        )}
      >
        {content}
      </Link>
    )
  }

  return content
}

function CollectionTagRow({
  tags,
  className,
}: {
  tags: string[]
  className?: string
}) {
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS)
  const overflowCount = tags.length - visibleTags.length

  return (
    <motion.div layout className={cn("flex min-w-0 items-center gap-1", className)}>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
            "bg-[var(--desktop-inspector-control-hover-bg)] text-[var(--desktop-inspector-fg-muted)]",
          )}
        >
          <span className="truncate">{tag}</span>
        </span>
      ))}
      {overflowCount > 0 ? (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
            "bg-[var(--desktop-inspector-control-hover-bg)] text-[var(--desktop-inspector-fg-muted)]",
          )}
        >
          +{overflowCount}
        </span>
      ) : null}
    </motion.div>
  )
}

function CollectionViewTab({
  active,
  "aria-label": ariaLabel,
  icon,
  onClick,
}: {
  active: boolean
  "aria-label": string
  icon: CollectionIcon
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "relative grid size-10 place-items-center rounded-full transition-colors outline-none",
        active
          ? "text-[var(--desktop-inspector-option-selected-fg)]"
          : cn(
              DESKTOP_INSPECTOR_FG_MUTED,
              "hover:text-[var(--desktop-inspector-fg-primary)]",
            ),
      )}
    >
      {active ? (
        <motion.div
          layoutId="library-animated-collection-tab"
          className="absolute inset-0 rounded-full bg-[var(--desktop-inspector-option-selected-bg)] shadow-[var(--drafting-shadow-rest)]"
          transition={snappySpring}
        />
      ) : null}
      <HugeiconsIcon
        icon={icon}
        size={16}
        className={cn("relative z-10 transition-transform duration-300", active && "scale-110")}
      />
    </button>
  )
}

export default AnimatedCollection
