"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"

import { AllTabContent } from "@/features/library/components/AllTabContent"
import { CollectionFolders } from "@/features/library/components/CollectionFolders"
import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_PRIMARY,
  DESKTOP_INSPECTOR_RESET_CLASS,
} from "@/features/desktop-shell/components/InspectorControls"
import { sortLibraryDesigns } from "@/features/library/model/library-query"
import type { LibraryQrDesign } from "@/features/library/model/types"
import { useLibraryIndex } from "@/features/studio-hub/hooks/useLibraryIndex"
import { useStudioNavigation } from "@/features/studio-hub/hooks/useStudioNavigation"
import { cn } from "@/lib/utils"

const STRIP_PREVIEW_COUNT = 6

type StudioHubLibrarySectionProps = {
  initialExpanded?: boolean
}

function LibraryStripCard({
  design,
  onOpen,
}: {
  design: LibraryQrDesign
  onOpen: (design: LibraryQrDesign) => void
}) {
  return (
    <motion.button
      type="button"
      layoutId={`hub-item-${design.id}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group flex w-[9.5rem] shrink-0 snap-start flex-col gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
      onClick={() => onOpen(design)}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-[var(--desktop-inspector-control-border-hover)] bg-[var(--desktop-inspector-field-bg)] shadow-[var(--drafting-shadow-rest)] transition-shadow group-hover:shadow-[var(--drafting-shadow-elevated)]">
        {design.thumbnailDataUrl ? (
          <Image
            src={design.thumbnailDataUrl}
            alt=""
            fill
            unoptimized
            sizes="152px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--desktop-inspector-fg-muted)]">
            No preview
          </div>
        )}
      </div>
      <span className={cn("truncate px-0.5 text-sm font-medium", DESKTOP_INSPECTOR_FG_PRIMARY)}>
        {design.title}
      </span>
    </motion.button>
  )
}

function LibraryExpandedContent({
  index,
  isMockFallback,
  onOpenDesign,
}: {
  index: ReturnType<typeof useLibraryIndex>["index"]
  isMockFallback: boolean
  onOpenDesign: (design: LibraryQrDesign) => void
}) {
  return (
    <div className="space-y-8 pt-2">
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className={cn("drafting-type-control-label font-semibold", DESKTOP_INSPECTOR_FG_PRIMARY)}>
            Collections
          </h3>
          <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
            Group related designs into folders.
          </p>
        </div>
        <CollectionFolders collections={index.collections} />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className={cn("drafting-type-control-label font-semibold", DESKTOP_INSPECTOR_FG_PRIMARY)}>
            All designs
          </h3>
          {isMockFallback ? (
            <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
              Showing sample designs until you save your first QR.
            </p>
          ) : null}
        </div>
        <AllTabContent designs={index.designs} onDesignClick={onOpenDesign} />
      </div>
    </div>
  )
}

export function StudioHubLibrarySection({ initialExpanded = false }: StudioHubLibrarySectionProps) {
  const { index, isLoading, isMockFallback } = useLibraryIndex()
  const { openEditor } = useStudioNavigation()
  const [isExpanded, setIsExpanded] = React.useState(initialExpanded)

  React.useEffect(() => {
    if (initialExpanded) {
      setIsExpanded(true)
    }
  }, [initialExpanded])

  const recentDesigns = React.useMemo(
    () => sortLibraryDesigns(index.designs, "recent").slice(0, STRIP_PREVIEW_COUNT),
    [index.designs],
  )

  const handleOpenDesign = React.useCallback(
    (design: LibraryQrDesign) => {
      void openEditor(
        {
          source: "library",
          designId: design.id,
          transitionId: design.id,
        },
        {
          id: design.id,
          thumbnailUrl: design.thumbnailDataUrl,
          title: design.title,
        },
      )
    },
    [openEditor],
  )

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded((current) => !current)
  }, [])

  if (isLoading) {
    return (
      <section data-slot="studio-library-section" className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-[var(--desktop-inspector-section-bg)]" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-[11.5rem] w-[9.5rem] shrink-0 animate-pulse rounded-xl bg-[var(--desktop-inspector-section-bg)]"
            />
          ))}
        </div>
      </section>
    )
  }

  const hasDesigns = index.designs.length > 0
  const showToggle = hasDesigns

  return (
    <section data-slot="studio-library-section" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className={cn("drafting-type-section-title", DESKTOP_INSPECTOR_FG_PRIMARY)}>
            Your designs
          </h2>
          {!isExpanded && hasDesigns ? (
            <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
              Recent work — open any design to keep editing.
            </p>
          ) : null}
        </div>
        {showToggle ? (
          <button
            type="button"
            className={cn(DESKTOP_INSPECTOR_RESET_CLASS, "shrink-0 rounded-full px-3 py-1.5 text-sm")}
            onClick={toggleExpanded}
          >
            {isExpanded ? "Show less" : "See all"}
          </button>
        ) : null}
      </div>

      {!isExpanded ? (
        hasDesigns ? (
          <div
            data-slot="studio-library-strip"
            className="studio-library-strip -mx-1 flex gap-3 overflow-x-auto px-1 pb-1"
          >
            {recentDesigns.map((design) => (
              <LibraryStripCard key={design.id} design={design} onOpen={handleOpenDesign} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[5.5rem] items-center justify-center rounded-xl border border-dashed border-[var(--desktop-inspector-control-border-hover)] bg-[var(--desktop-inspector-field-bg)] px-6 py-4 text-center">
            <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
              Create your first QR — saved designs will appear here.
            </p>
          </div>
        )
      ) : null}

      <AnimatePresence initial={false}>
        {isExpanded && hasDesigns ? (
          <motion.div
            key="library-expanded"
            data-slot="studio-library-expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <LibraryExpandedContent
              index={index}
              isMockFallback={isMockFallback}
              onOpenDesign={handleOpenDesign}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
