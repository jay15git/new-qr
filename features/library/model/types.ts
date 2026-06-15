import type { FolderColor } from "@/components/ui/folder"
import type { QrInputType } from "@/features/qr-code/content/input-options"
import type { DraftingWorkspaceDocumentV1 } from "@/features/workspace/model/document"

export type LibraryQrDesign = {
  id: string
  title: string
  inputType: QrInputType
  thumbnailHue: number
  updatedAt: number
  collectionIds: string[]
}

export type LibraryCollection = {
  id: string
  name: string
  folderColor: FolderColor
  itemIds: string[]
  updatedAt: number
}

export type LibrarySort = "recent" | "name"

export type LibraryQrDesignRecord = LibraryQrDesign & {
  document?: DraftingWorkspaceDocumentV1
  thumbnailDataUrl?: string
}

export type LibraryIndexV1 = {
  version: 1
  designs: LibraryQrDesignRecord[]
  collections: LibraryCollection[]
  updatedAt: number
}
