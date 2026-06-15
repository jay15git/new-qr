import type { QrInputType } from "@/features/qr-code/content/input-options"
import { STATIC_QR_CONTENT_META } from "@/features/qr-code/content/static-payload"
import type { StaticQrContentValues } from "@/features/qr-code/content/static-payload"
import type { DraftingWorkspaceDocumentV1 } from "@/features/workspace/model/document"

import type { LibraryQrDesign, LibraryQrSummary } from "@/features/library/model/types"

const PREVIEW_MAX_LENGTH = 40

const USERNAME_TYPES = new Set<QrInputType>([
  "instagram",
  "x",
  "tiktok",
  "telegram",
  "snapchat",
  "threads",
])

const URL_TYPES = new Set<QrInputType>([
  "link",
  "website",
  "facebook",
  "youtube",
  "linkedin",
  "payment-link",
  "menu",
  "event",
])

function truncatePreview(value: string, maxLength = PREVIEW_MAX_LENGTH): string {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }

  return `${trimmed.slice(0, maxLength - 1)}…`
}

function stringField(values: StaticQrContentValues | undefined, key: string): string {
  const value = values?.[key]
  return typeof value === "string" ? value.trim() : ""
}

function stripUrlForPreview(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return ""
  }

  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
    const host = parsed.host.replace(/^www\./, "")
    const path = parsed.pathname === "/" ? "" : parsed.pathname
    return truncatePreview(`${host}${path}`)
  } catch {
    return truncatePreview(trimmed.replace(/^https?:\/\//, "").replace(/^www\./, ""))
  }
}

export function buildQrDestinationPreview(
  inputType: QrInputType,
  contentValues: StaticQrContentValues | undefined,
): string {
  const values = contentValues ?? {}
  const meta = STATIC_QR_CONTENT_META[inputType]
  const primaryField = meta.primaryField

  if (inputType === "wifi") {
    const ssid = stringField(values, "ssid")
    return ssid ? truncatePreview(ssid) : ""
  }

  if (USERNAME_TYPES.has(inputType)) {
    const username = stringField(values, "username")
    if (!username) {
      return ""
    }

    return truncatePreview(username.startsWith("@") ? username : `@${username}`)
  }

  if (URL_TYPES.has(inputType) || primaryField === "url") {
    return stripUrlForPreview(stringField(values, "url"))
  }

  if (primaryField === "phone") {
    return truncatePreview(stringField(values, "phone"))
  }

  if (primaryField === "email") {
    return truncatePreview(stringField(values, "email"))
  }

  if (primaryField === "firstName") {
    const firstName = stringField(values, "firstName")
    const lastName = stringField(values, "lastName")
    const fullName = [firstName, lastName].filter(Boolean).join(" ")
    return truncatePreview(fullName)
  }

  if (primaryField === "text") {
    const text = stringField(values, "text")
    if (text.startsWith("http://") || text.startsWith("https://")) {
      return stripUrlForPreview(text)
    }

    return truncatePreview(text)
  }

  const fallback = stringField(values, primaryField)
  return truncatePreview(fallback)
}

function resolveNodeInputType(
  document: DraftingWorkspaceDocumentV1,
  nodeId: string,
): QrInputType {
  return document.contentTypeByNodeId[nodeId] ?? document.selectedContentType
}

export function buildLibraryQrSummaries(
  document: DraftingWorkspaceDocumentV1,
): LibraryQrSummary[] {
  return document.qrOrder
    .filter((nodeId) => document.qrStateByNodeId[nodeId])
    .map((nodeId) => {
      const inputType = resolveNodeInputType(document, nodeId)
      const contentValues = document.contentValuesByType[inputType]
      return {
        nodeId,
        inputType,
        destinationPreview: buildQrDestinationPreview(inputType, contentValues),
      }
    })
}

export function dedupeContentTags(summaries: LibraryQrSummary[]): QrInputType[] {
  const seen = new Set<QrInputType>()
  const tags: QrInputType[] = []

  for (const summary of summaries) {
    if (seen.has(summary.inputType)) {
      continue
    }

    seen.add(summary.inputType)
    tags.push(summary.inputType)
  }

  return tags
}

export function buildDesignDestinationPreview(summaries: LibraryQrSummary[]): string {
  if (summaries.length === 0) {
    return ""
  }

  const firstPreview = summaries[0]?.destinationPreview ?? ""
  if (summaries.length === 1) {
    return firstPreview
  }

  const remaining = summaries.length - 1
  if (!firstPreview) {
    return `${remaining} more code${remaining === 1 ? "" : "s"}`
  }

  return `${firstPreview} · +${remaining} more`
}

export function buildLibraryDesignFromDocument(
  document: DraftingWorkspaceDocumentV1,
  options: {
    id: string
    title: string
    collectionIds?: string[]
    createdAt?: number
    updatedAt?: number
    thumbnailDataUrl?: string
    thumbnailHue?: number
  },
): LibraryQrDesign {
  const qrSummaries = buildLibraryQrSummaries(document)
  const now = Date.now()

  return {
    id: options.id,
    title: options.title,
    contentTags: dedupeContentTags(qrSummaries),
    qrSummaries,
    qrCount: qrSummaries.length,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
    destinationPreview: buildDesignDestinationPreview(qrSummaries),
    thumbnailDataUrl: options.thumbnailDataUrl,
    thumbnailHue: options.thumbnailHue,
    collectionIds: options.collectionIds ?? [],
  }
}
