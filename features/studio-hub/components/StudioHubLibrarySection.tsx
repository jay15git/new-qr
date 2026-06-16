"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { AllTabContent } from "@/features/library/components/AllTabContent"
import { QrDocumentPreview } from "@/features/qr-code/components/QrDocumentPreview"
import {
  DESKTOP_INSPECTOR_FG_PRIMARY,
  DESKTOP_INSPECTOR_RESET_CLASS,
} from "@/features/desktop-shell/components/InspectorControls"
import { HUB_CARD_SURFACE } from "@/features/studio-hub/components/hub-surfaces"
import { sortLibraryDesigns } from "@/features/library/model/library-query"
import type { LibraryQrDesignRecord } from "@/features/library/model/types"
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
  design: LibraryQrDesignRecord
  onOpen: (design: LibraryQrDesignRecord) => void
}) {
  return (
    <motion.button
      type="button"
      layoutId={`hub-item-${design.id}`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="group flex w-[9.25rem] shrink-0 snap-start flex-col gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
      onClick={() => onOpen(design)}
    >
      <div className={cn("relative aspect-[4/5] w-full overflow-hidden", HUB_CARD_SURFACE)}>
        {design.document ? (
          <QrDocumentPreview
            document={design.document}
            className="transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : design.thumbnailDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={design.thumbnailDataUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <span className={cn("truncate px-0.5 text-sm font-medium", DESKTOP_INSPECTOR_FG_PRIMARY)}>
        {design.title}
      </span>
    </motion.button>
  )
}

function LibraryExpandedContent({
  designs,
  onOpenDesign,
}: {
  designs: LibraryQrDesignRecord[]
  onOpenDesign: (design: LibraryQrDesignRecord) => void
}) {
  return <AllTabContent designs={designs} onDesignClick={onOpenDesign} />
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
    (design: LibraryQrDesignRecord) => {
      const usesTemplateDocument = isMockFallback && Boolean(design.document)

      void openEditor(
        usesTemplateDocument
          ? {
              source: "template",
              templateId: design.id,
              transitionId: design.id,
            }
          : {
              source: "library",
              designId: design.id,
              transitionId: design.id,
            },
        {
          id: design.id,
          title: design.title,
        },
      )
    },
    [isMockFallback, openEditor],
  )

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded((current) => !current)
  }, [])

  if (isLoading) {
    return (
      <section data-slot="studio-library-section" className="space-y-5">
        <div className="h-5 w-28 animate-pulse rounded-md bg-[var(--desktop-inspector-section-bg)]" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-[11.25rem] w-[9.25rem] shrink-0 animate-pulse rounded-2xl bg-[var(--desktop-inspector-section-bg)]"
            />
          ))}
        </div>
      </section>
    )
  }

  const hasDesigns = index.designs.length > 0
  const showToggle = hasDesigns

  return (
    <section data-slot="studio-library-section" className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className={cn("drafting-type-section-title font-semibold", DESKTOP_INSPECTOR_FG_PRIMARY)}>
          Your designs
        </h2>
        {showToggle ? (
          <button
            type="button"
            className={cn(DESKTOP_INSPECTOR_RESET_CLASS, "w-auto shrink-0 rounded-full px-3 py-1.5 text-sm")}
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
          <div
            data-slot="studio-library-empty"
            className="flex min-h-[6.5rem] items-center justify-center rounded-2xl bg-[var(--desktop-inspector-section-bg)] px-6 py-5 shadow-[var(--drafting-shadow-rest)]"
          />
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
            <LibraryExpandedContent designs={index.designs} onOpenDesign={handleOpenDesign} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
