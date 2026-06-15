import { QR_INPUT_OPTIONS } from "@/features/qr-code/content/input-options"

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

export function getQrInputTypeLabel(inputType: LibraryQrDesign["inputType"]): string {
  return QR_INPUT_OPTIONS[inputType].label
}

export function filterLibraryDesigns(
  designs: LibraryQrDesign[],
  query: string,
): LibraryQrDesign[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return designs
  }

  return designs.filter((design) => {
    const typeLabel = getQrInputTypeLabel(design.inputType).toLowerCase()
    return (
      design.title.toLowerCase().includes(normalizedQuery) ||
      design.inputType.toLowerCase().includes(normalizedQuery) ||
      typeLabel.includes(normalizedQuery)
    )
  })
}

export function sortLibraryDesigns(
  designs: LibraryQrDesign[],
  sort: LibrarySort,
): LibraryQrDesign[] {
  const sorted = [...designs]

  if (sort === "name") {
    return sorted.sort((left, right) => left.title.localeCompare(right.title))
  }

  return sorted.sort((left, right) => right.updatedAt - left.updatedAt)
}
