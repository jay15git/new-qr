import { buildLibraryDesignFromDocument } from "@/features/library/model/library-metadata"
import {
  createEmptyLibraryIndex,
  readLibraryIndex,
  upsertLibraryDesign,
} from "@/features/library/model/storage"
import type { DraftingWorkspaceDocumentV1 } from "@/features/workspace/model/document"

export async function saveDesignToLibrary(
  document: DraftingWorkspaceDocumentV1,
  options: {
    designId?: string
    title?: string
  } = {},
): Promise<string> {
  const index = (await readLibraryIndex()) ?? createEmptyLibraryIndex()
  const designId = options.designId ?? crypto.randomUUID()
  const existing = index.designs.find((entry) => entry.id === designId)
  const title =
    options.title ??
    existing?.title ??
    `QR Design ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`

  const design = buildLibraryDesignFromDocument(document, {
    id: designId,
    title,
    collectionIds: existing?.collectionIds ?? [],
    createdAt: existing?.createdAt,
    thumbnailHue: existing?.thumbnailHue ?? Math.floor(Math.random() * 360),
  })

  await upsertLibraryDesign(index, {
    ...design,
    document,
  })

  return designId
}
