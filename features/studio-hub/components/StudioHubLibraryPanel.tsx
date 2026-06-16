"use client"

import * as React from "react"

import { AllTabContent } from "@/features/library/components/AllTabContent"
import { CollectionFolders } from "@/features/library/components/CollectionFolders"
import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_PRIMARY,
} from "@/features/desktop-shell/components/InspectorControls"
import { LibraryEmptyState } from "@/features/library/components/LibraryEmptyState"
import { useLibraryIndex } from "@/features/studio-hub/hooks/useLibraryIndex"
import { useStudioNavigation } from "@/features/studio-hub/hooks/useStudioNavigation"
import type { LibraryQrDesign } from "@/features/library/model/types"
import { cn } from "@/lib/utils"

type StudioHubLibraryPanelProps = {
  onCreateClick: () => void
}

export function StudioHubLibraryPanel({ onCreateClick }: StudioHubLibraryPanelProps) {
  const { index, isLoading, isMockFallback } = useLibraryIndex()
  const { openEditor } = useStudioNavigation()

  const handleOpenDesign = React.useCallback(
    (design: LibraryQrDesign) => {
      void openEditor(
        {
          source: "library",
          designId: design.id,
          returnTab: "library",
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl bg-[var(--desktop-inspector-section-bg)]"
          />
        ))}
      </div>
    )
  }

  return (
    <section data-slot="studio-library-panel" className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className={cn("drafting-type-section-title", DESKTOP_INSPECTOR_FG_PRIMARY)}>
            Collections
          </h2>
          <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
            Group related designs into folders.
          </p>
        </div>
        <CollectionFolders collections={index.collections} />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className={cn("drafting-type-section-title", DESKTOP_INSPECTOR_FG_PRIMARY)}>
            Your designs
          </h2>
          {isMockFallback ? (
            <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
              Showing sample designs until you save your first QR.
            </p>
          ) : null}
        </div>

        {index.designs.length === 0 ? (
          <div className="space-y-4">
            <LibraryEmptyState
              title="No QR codes yet"
              description="Your saved QR designs will show up here once you create them."
              actionLabel="Create a QR code"
            />
            <div className="flex justify-center">
              <button
                type="button"
                className="drafting-type-caption font-medium text-[var(--desktop-inspector-fg-secondary)] underline-offset-4 hover:underline"
                onClick={onCreateClick}
              >
                Go to Create
              </button>
            </div>
          </div>
        ) : (
          <AllTabContent designs={index.designs} onDesignClick={handleOpenDesign} />
        )}
      </div>
    </section>
  )
}
