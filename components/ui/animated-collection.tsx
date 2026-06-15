"use client"

import Link from "next/link"
import { AnimatePresence, LayoutGroup, motion, type Transition } from "motion/react"
import {
  GridViewIcon,
  Menu01Icon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_PRIMARY,
  DESKTOP_INSPECTOR_FG_TERTIARY,
} from "@/features/desktop-shell/components/InspectorControls"
import { cn } from "@/lib/utils"

type CollectionIcon = typeof QrCodeIcon

export type AnimatedCollectionItem = {
  href?: string
  icon?: CollectionIcon
  id: string
  image: string
  subtitle: string
  title: string
}

type ViewMode = "list" | "card"

export type CollectionViewMode = ViewMode

export const LIBRARY_LIFTED_SURFACE_CLASS =
  "rounded-full bg-[var(--desktop-inspector-option-selected-bg)] shadow-[var(--drafting-shadow-rest)]"

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

const fastFade: Transition = {
  duration: 0.1,
  ease: "linear",
}

export function AnimatedCollection({ className, items, view }: AnimatedCollectionProps) {
  return (
    <div
      data-slot="library-animated-collection"
      className={cn("w-full selection:bg-[var(--desktop-inspector-control-hover-bg)]", className)}
    >
      <div className="relative flex min-h-[350px] flex-col items-center">
        <LayoutGroup>
          <motion.div
            layout
            transition={snappySpring}
            className={cn(
              "relative w-full",
              view === "list" && "flex flex-col gap-4",
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
  const icon = item.icon ?? QrCodeIcon
  const content = (
    <motion.div
      layout
      transition={snappySpring}
      className={cn(
        "relative z-10 flex items-center",
        view === "list" && "w-full flex-row gap-4",
        view === "card" && "w-full flex-col items-start gap-3",
      )}
    >
      <motion.div
        layout
        transition={snappySpring}
        className={cn(
          "relative shrink-0 overflow-hidden bg-[var(--drafting-option-card-bg)]",
          view === "list" &&
            "h-16 w-16 rounded-2xl border border-[var(--drafting-option-card-border)]",
          view === "card" &&
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
            view === "list" && "rounded-2xl",
            view === "card" && "rounded-[1.8rem]",
          )}
        />
      </motion.div>

      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={`${item.id}-info`}
          layout
          initial={{
            opacity: 0,
            scale: 0.9,
            filter: "blur(4px)",
          }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
          transition={fastFade}
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-0.5",
            view === "card" ? "w-full px-1" : "px-0",
          )}
        >
          <motion.h3
            layout
            className={cn(
              "truncate text-[15px] leading-tight font-medium",
              DESKTOP_INSPECTOR_FG_PRIMARY,
            )}
          >
            {item.title}
          </motion.h3>
          <motion.div
            layout
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              DESKTOP_INSPECTOR_FG_MUTED,
            )}
          >
            <HugeiconsIcon icon={icon} size={12} className={DESKTOP_INSPECTOR_FG_TERTIARY} />
            <span className="truncate">{item.subtitle}</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )

  if (item.href) {
    return (
      <Link href={item.href} className="block w-full">
        {content}
      </Link>
    )
  }

  return content
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
