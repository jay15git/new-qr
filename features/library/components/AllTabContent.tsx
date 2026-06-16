"use client"

import * as React from "react"

import {
  AnimatedCollection,
  CollectionViewTabs,
  LIBRARY_LIFTED_SURFACE_CLASS,
  type CollectionViewMode,
} from "@/components/ui/animated-collection"
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
  onDesignClick?: (design: LibraryQrDesign) => void
}

export function AllTabContent({ designs, onDesignClick }: AllTabContentProps) {
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<LibrarySort>("recent")
  const [view, setView] = React.useState<CollectionViewMode>("card")

  const visibleDesigns = React.useMemo(() => {
    return sortLibraryDesigns(filterLibraryDesigns(designs, query), sort)
  }, [designs, query, sort])

  const collectionItems = React.useMemo(
    () =>
      mapLibraryDesignsToAnimatedCollectionItems(visibleDesigns, {
        includeHref: !onDesignClick,
      }),
    [visibleDesigns, onDesignClick],
  )

  const handleItemClick = React.useCallback(
    (itemId: string) => {
      const design = visibleDesigns.find((entry) => entry.id === itemId)
      if (design) {
        onDesignClick?.(design)
      }
    },
    [onDesignClick, visibleDesigns],
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
      <LibraryCollectionToolbar
        query={query}
        sort={sort}
        view={view}
        onQueryChange={setQuery}
        onSortChange={setSort}
        onViewChange={setView}
      />

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
        <AnimatedCollection
          items={collectionItems}
          view={view}
          onItemClick={onDesignClick ? handleItemClick : undefined}
        />
      )}
    </div>
  )
}

type LibraryCollectionToolbarProps = {
  query: string
  sort: LibrarySort
  view: CollectionViewMode
  onQueryChange: (query: string) => void
  onSortChange: (sort: LibrarySort) => void
  onViewChange: (view: CollectionViewMode) => void
}

function LibraryCollectionToolbar({
  query,
  sort,
  view,
  onQueryChange,
  onSortChange,
  onViewChange,
}: LibraryCollectionToolbarProps) {
  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          data-slot="library-sort-select"
          className={cn("w-32 shrink-0", LIBRARY_LIFTED_SURFACE_CLASS)}
        >
          <DesktopInspectorNativeSelect
            aria-label="Sort library"
            className="h-10 rounded-full border-0 bg-transparent px-7 text-sm font-medium shadow-none focus-visible:ring-0"
            iconClassName="right-2.5 size-3.5"
            rootClassName="w-full"
            options={[
              { label: "Recent", value: "recent" },
              { label: "Name A–Z", value: "name" },
              { label: "Oldest", value: "oldest" },
              { label: "Newest", value: "newest" },
              { label: "Most codes", value: "qr-count" },
            ]}
            value={sort}
            onValueChange={onSortChange}
          />
        </div>
        <DesktopInspectorSearchInput
          aria-label="Search library"
          className={cn("h-10 w-52 shrink-0", LIBRARY_LIFTED_SURFACE_CLASS)}
          iconClassName="left-3.5"
          inputClassName="rounded-full border-0 bg-transparent pl-9 pr-4 text-sm shadow-none focus-visible:ring-0"
          placeholder="Search by name, type, or destination"
          value={query}
          onValueChange={onQueryChange}
        />
      </div>
      <CollectionViewTabs className="ml-auto" view={view} onViewChange={onViewChange} />
    </div>
  )
}
