import type { QrInputType } from "@/features/qr-code/content/input-options"
import type { LibraryQrDesignRecord } from "@/features/library/model/types"
import { QR_DESIGN_TEMPLATES } from "@/features/studio-hub/model/templates"
import { resolveDocumentNodeId } from "@/features/qr-code/rendering/document-preview"

const DEMO_LIBRARY_COUNT = 6

export function buildDemoLibraryDesigns(): LibraryQrDesignRecord[] {
  const now = Date.now()

  return QR_DESIGN_TEMPLATES.slice(0, DEMO_LIBRARY_COUNT).map((template, index) => {
    const nodeId = resolveDocumentNodeId(template.document)
    const inputType =
      template.document.contentTypeByNodeId[nodeId] ??
      template.document.selectedContentType ??
      ("link" as QrInputType)
    const qrState = template.document.qrStateByNodeId[nodeId]
    const destinationPreview = qrState?.data ?? template.subtitle

    return {
      id: template.id,
      title: template.title,
      contentTags: [inputType],
      qrSummaries: [
        {
          nodeId,
          inputType,
          destinationPreview,
        },
      ],
      qrCount: 1,
      createdAt: now - index * 86_400_000,
      updatedAt: now - index * 43_200_000,
      destinationPreview,
      collectionIds: [],
      document: template.document,
    }
  })
}
