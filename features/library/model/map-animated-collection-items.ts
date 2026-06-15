import { BrushIcon, Camera01Icon, QrCodeIcon } from "@hugeicons/core-free-icons"

import type { AnimatedCollectionItem } from "@/components/ui/animated-collection"
import { getQrInputTypeLabel } from "@/features/library/model/library-query"
import { getDesktopLibraryUrl } from "@/features/library/model/storage"
import type { LibraryQrDesign } from "@/features/library/model/types"

const LIBRARY_ITEM_ICONS = [QrCodeIcon, Camera01Icon, BrushIcon] as const

function designThumbnailDataUrl(hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="hsl(${hue} 28% 42%)" width="400" height="400"/><rect x="120" y="120" width="160" height="160" rx="8" fill="white" fill-opacity="0.92"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function mapLibraryDesignsToAnimatedCollectionItems(
  designs: LibraryQrDesign[],
): AnimatedCollectionItem[] {
  return designs.map((design, index) => ({
    id: design.id,
    title: design.title,
    subtitle: getQrInputTypeLabel(design.inputType),
    idNumber: design.id.replace(/^qr-/, ""),
    image: designThumbnailDataUrl(design.thumbnailHue),
    icon: LIBRARY_ITEM_ICONS[index % LIBRARY_ITEM_ICONS.length],
    href: getDesktopLibraryUrl(design.id),
  }))
}
