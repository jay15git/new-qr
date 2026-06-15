"use client"

import * as React from "react"

import { AnimatedCollection } from "@/components/ui/animated-collection"
import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_RESET_CLASS,
  DesktopInspectorNativeSelect,
  DesktopInspectorSearchInput,
} from "@/features/desktop-shell/components/InspectorControls"
import { LibraryEmptyState } from "@/features/library/components/LibraryEmptyState"
import {
  filterLibraryDesigns,
  sortLibraryDesigns,
} from "@/features/library/model/library-query"
import { mapLibraryDesignsToAnimatedCollectionItems } from "@/features/library/model/map-animated-collection-items"
import type { LibraryQrDesign, LibrarySort } from "@/features/library/model/types"
import { cn } from "@/lib/utils"

type AllTabContentProps = {
  designs: LibraryQrDesign[]
}

export function AllTabContent({ designs }: AllTabContentProps) {
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<LibrarySort>("recent")

  const visibleDesigns = React.useMemo(() => {
    return sortLibraryDesigns(filterLibraryDesigns(designs, query), sort)
  }, [designs, query, sort])

  const collectionItems = React.useMemo(
    () => mapLibraryDesignsToAnimatedCollectionItems(visibleDesigns),
    [visibleDesigns],
  )

  if (designs.length === 0) {
    return (
      <LibraryEmptyState
        title="No QR codes yet"
        description="Your saved QR designs will show up here once you create them."
        actionLabel="Create a QR code"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex h-9 w-full min-w-0 items-center gap-2">
        <DesktopInspectorSearchInput
          aria-label="Search library"
          className="min-w-0 flex-1"
          placeholder="Search by name or type"
          value={query}
          onValueChange={setQuery}
        />
        <DesktopInspectorNativeSelect
          aria-label="Sort library"
          className="w-32 shrink-0"
          options={[
            { label: "Recent", value: "recent" },
            { label: "Name A–Z", value: "name" },
          ]}
          value={sort}
          onValueChange={setSort}
        />
      </div>

      {visibleDesigns.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[var(--desktop-inspector-control-border-hover)] bg-[var(--desktop-inspector-field-bg)] px-6 py-10 text-center">
          <div className="space-y-1">
            <h2 className={cn("drafting-type-control-label font-semibold", DESKTOP_INSPECTOR_FG_MUTED)}>
              No matches
            </h2>
            <p className={cn("drafting-type-caption max-w-sm", DESKTOP_INSPECTOR_FG_MUTED)}>
              Try a different search term or clear the filter.
            </p>
          </div>
          <button className={DESKTOP_INSPECTOR_RESET_CLASS} type="button" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      ) : (
        <AnimatedCollection items={collectionItems} />
      )}
    </div>
  )
}
