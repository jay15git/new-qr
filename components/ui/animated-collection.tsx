"use client"

import Link from "next/link"
import { AnimatePresence, LayoutGroup, motion, type Transition } from "motion/react"
import {
  GridViewIcon,
  Playlist01Icon,
  QrCodeIcon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"

import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_PRIMARY,
  DESKTOP_INSPECTOR_FG_SECONDARY,
  DESKTOP_INSPECTOR_FG_TERTIARY,
} from "@/features/desktop-shell/components/InspectorControls"
import { cn } from "@/lib/utils"

type CollectionIcon = typeof QrCodeIcon

export type AnimatedCollectionItem = {
  href?: string
  icon?: CollectionIcon
  id: string
  idNumber: string
  image: string
  subtitle: string
  title: string
}

type ViewMode = "list" | "card"

type AnimatedCollectionProps = {
  className?: string
  items: AnimatedCollectionItem[]
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

export function AnimatedCollection({ className, items }: AnimatedCollectionProps) {
  const [view, setView] = useState<ViewMode>("card")

  return (
    <div
      data-slot="library-animated-collection"
      className={cn("w-full selection:bg-[var(--desktop-inspector-control-hover-bg)]", className)}
    >
      <div className="flex flex-col gap-6">
        <div className="flex w-fit items-center gap-4">
          <CollectionViewTab
            active={view === "list"}
            icon={Playlist01Icon}
            label="List view"
            onClick={() => setView("list")}
          />
          <CollectionViewTab
            active={view === "card"}
            icon={GridViewIcon}
            label="Card view"
            onClick={() => setView("card")}
          />
        </div>

        <div className="h-px w-full bg-[var(--desktop-inspector-control-border-hover)]" />

        <div className="relative flex min-h-[350px] flex-col items-center">
          <LayoutGroup>
            <motion.div
              layout
              transition={snappySpring}
              className={cn(
                "relative w-full",
                view === "list" && "flex flex-col gap-4",
                view === "card" && "grid grid-cols-2 gap-4 sm:grid-cols-3",
              )}
            >
              {items.map((item) => (
                <CollectionItemRow key={item.id} item={item} view={view} />
              ))}
            </motion.div>
          </LayoutGroup>
        </div>
      </div>
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
            "flex min-w-0 flex-1 items-center justify-between",
            view === "card" ? "w-full px-1" : "px-0",
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
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
          </div>

          <motion.div
            layout
            className={cn(
              "ml-2 flex shrink-0 items-center gap-1 rounded-full bg-[var(--desktop-inspector-field-bg)] px-2 py-1 text-[10px] font-bold",
              DESKTOP_INSPECTOR_FG_SECONDARY,
            )}
          >
            <HugeiconsIcon
              icon={StarIcon}
              size={10}
              className="fill-yellow-500 text-yellow-500"
            />
            <span>#{item.idNumber}</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {view === "list" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 -bottom-2 left-18 h-px bg-[var(--desktop-inspector-control-border-hover)]"
        />
      ) : null}
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
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: CollectionIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-normal uppercase transition-colors outline-none",
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
      <span className="relative z-10 flex items-center gap-2">
        <HugeiconsIcon
          icon={icon}
          size={16}
          className={cn("transition-transform duration-300", active && "scale-110")}
        />
        {label}
      </span>
    </button>
  )
}

export default AnimatedCollection
