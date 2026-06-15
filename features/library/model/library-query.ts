import { QR_INPUT_OPTIONS } from "@/features/qr-code/content/input-options"
import type { QrInputType } from "@/features/qr-code/content/input-options"

import type { LibraryQrDesign, LibrarySort } from "@/features/library/model/types"

export function formatLibraryRelativeDate(timestamp: number): string {
  const elapsedMs = Date.now() - timestamp
  const minutes = Math.floor(elapsedMs / (60 * 1000))

  if (minutes < 1) {
    return "Just now"
  }

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days}d ago`
  }

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function formatLibraryShortDate(timestamp: number): string {
  const date = new Date(timestamp)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

export function getQrInputTypeLabel(inputType: QrInputType): string {
  return QR_INPUT_OPTIONS[inputType].label
}

function designMatchesQuery(design: LibraryQrDesign, normalizedQuery: string): boolean {
  if (design.title.toLowerCase().includes(normalizedQuery)) {
    return true
  }

  if (design.destinationPreview.toLowerCase().includes(normalizedQuery)) {
    return true
  }

  for (const tag of design.contentTags) {
    if (tag.toLowerCase().includes(normalizedQuery)) {
      return true
    }

    if (getQrInputTypeLabel(tag).toLowerCase().includes(normalizedQuery)) {
      return true
    }
  }

  for (const summary of design.qrSummaries) {
    if (summary.destinationPreview.toLowerCase().includes(normalizedQuery)) {
      return true
    }
  }

  return false
}

export function filterLibraryDesigns(
  designs: LibraryQrDesign[],
  query: string,
): LibraryQrDesign[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return designs
  }

  return designs.filter((design) => designMatchesQuery(design, normalizedQuery))
}

export function sortLibraryDesigns(
  designs: LibraryQrDesign[],
  sort: LibrarySort,
): LibraryQrDesign[] {
  const sorted = [...designs]

  if (sort === "name") {
    return sorted.sort((left, right) => left.title.localeCompare(right.title))
  }

  if (sort === "oldest") {
    return sorted.sort((left, right) => left.createdAt - right.createdAt)
  }

  if (sort === "newest") {
    return sorted.sort((left, right) => right.createdAt - left.createdAt)
  }

  if (sort === "qr-count") {
    return sorted.sort((left, right) => {
      const countDelta = right.qrCount - left.qrCount
      return countDelta !== 0 ? countDelta : left.title.localeCompare(right.title)
    })
  }

  return sorted.sort((left, right) => right.updatedAt - left.updatedAt)
}
