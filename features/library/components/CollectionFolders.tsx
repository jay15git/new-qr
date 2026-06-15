import Link from "next/link"

import { Folder } from "@/components/ui/folder"
import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_SECONDARY,
} from "@/features/desktop-shell/components/InspectorControls"
import { LibraryEmptyState } from "@/features/library/components/LibraryEmptyState"
import type { LibraryCollection } from "@/features/library/model/types"
import { cn } from "@/lib/utils"

type CollectionFoldersProps = {
  collections: LibraryCollection[]
}

export function CollectionFolders({ collections }: CollectionFoldersProps) {
  if (collections.length === 0) {
    return (
      <LibraryEmptyState
        title="No collections yet"
        description="Group related QR codes into folders to keep your library organized."
        actionLabel="Create a QR code"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/library/collections/${collection.id}`}
          className="group flex flex-col items-center gap-3 text-center"
        >
          <Folder color={collection.folderColor} size="md" />
          <div className="space-y-0.5">
            <p className={cn("drafting-type-control-label font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
              {collection.name}
            </p>
            <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
              {collection.itemIds.length} {collection.itemIds.length === 1 ? "code" : "codes"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
