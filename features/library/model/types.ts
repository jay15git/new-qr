import type { FolderColor } from "@/components/ui/folder"
import type { QrInputType } from "@/features/qr-code/content/input-options"
import type { DraftingWorkspaceDocumentV1 } from "@/features/workspace/model/document"

export type LibraryQrSummary = {
  nodeId: string
  inputType: QrInputType
  destinationPreview: string
}

export type LibraryQrDesign = {
  id: string
  title: string
  contentTags: QrInputType[]
  qrSummaries: LibraryQrSummary[]
  qrCount: number
  createdAt: number
  updatedAt: number
  destinationPreview: string
  thumbnailDataUrl?: string
  thumbnailHue?: number
  collectionIds: string[]
}

export type LibraryCollection = {
  id: string
  name: string
  folderColor: FolderColor
  itemIds: string[]
  updatedAt: number
}

export type LibrarySort = "recent" | "name" | "oldest" | "newest" | "qr-count"

export type LibraryQrDesignRecord = LibraryQrDesign & {
  document?: DraftingWorkspaceDocumentV1
}

export type LibraryIndexV1 = {
  version: 1
  designs: LibraryQrDesignRecord[]
  collections: LibraryCollection[]
  updatedAt: number
}

type LegacyLibraryQrDesign = {
  id: string
  title: string
  inputType?: QrInputType
  contentTags?: QrInputType[]
  qrSummaries?: LibraryQrSummary[]
  qrCount?: number
  createdAt?: number
  updatedAt: number
  destinationPreview?: string
  thumbnailDataUrl?: string
  thumbnailHue?: number
  collectionIds: string[]
}

export function migrateLibraryDesign(value: unknown): LibraryQrDesign | null {
  if (typeof value !== "object" || value === null || !("id" in value) || !("title" in value)) {
    return null
  }

  const raw = value as LegacyLibraryQrDesign
  if (typeof raw.id !== "string" || typeof raw.title !== "string") {
    return null
  }

  const updatedAt = typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now()
  const createdAt = typeof raw.createdAt === "number" ? raw.createdAt : updatedAt
  const collectionIds = Array.isArray(raw.collectionIds) ? raw.collectionIds : []

  let contentTags = Array.isArray(raw.contentTags) ? raw.contentTags : []
  let qrSummaries = Array.isArray(raw.qrSummaries) ? raw.qrSummaries : []

  if (contentTags.length === 0 && raw.inputType) {
    contentTags = [raw.inputType]
  }

  if (qrSummaries.length === 0 && contentTags.length > 0) {
    const primaryType = contentTags[0]!
    qrSummaries = [
      {
        nodeId: "legacy",
        inputType: primaryType,
        destinationPreview: raw.destinationPreview ?? "",
      },
    ]
  }

  const destinationPreview =
    typeof raw.destinationPreview === "string"
      ? raw.destinationPreview
      : (qrSummaries[0]?.destinationPreview ?? "")

  return {
    id: raw.id,
    title: raw.title,
    contentTags,
    qrSummaries,
    qrCount: typeof raw.qrCount === "number" ? raw.qrCount : qrSummaries.length,
    createdAt,
    updatedAt,
    destinationPreview,
    thumbnailDataUrl: raw.thumbnailDataUrl,
    thumbnailHue: raw.thumbnailHue,
    collectionIds,
  }
}

export function migrateLibraryDesignRecord(value: unknown): LibraryQrDesignRecord | null {
  const design = migrateLibraryDesign(value)
  if (!design) {
    return null
  }

  const record = value as LibraryQrDesignRecord & { document?: DraftingWorkspaceDocumentV1 }
  return {
    ...design,
    document: record.document,
  }
}
