import Link from "next/link"

import { Card } from "@/components/ui/card"
import {
  formatLibraryRelativeDate,
  getQrInputTypeLabel,
} from "@/features/library/model/library-query"
import { getDesktopLibraryUrl } from "@/features/library/model/storage"
import type { LibraryQrDesign } from "@/features/library/model/types"
import { cn } from "@/lib/utils"

type GalleryProps = {
  designs: LibraryQrDesign[]
  className?: string
}

function GalleryPreview({ design }: { design: LibraryQrDesign }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-105"
      style={{ backgroundColor: `hsl(${design.thumbnailHue} 28% 42%)` }}
    >
      <div
        className="grid aspect-square w-[42%] grid-cols-5 grid-rows-5 gap-[3px] rounded-sm bg-white/95 p-2 shadow-sm"
        style={{ color: `hsl(${design.thumbnailHue} 42% 22%)` }}
      >
        {Array.from({ length: 25 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "rounded-[1px] bg-current",
              index % 3 === 0 || index % 7 === 0 ? "opacity-100" : "opacity-35",
            )}
          />
        ))}
      </div>
    </div>
  )
}

function GalleryCard({ design }: { design: LibraryQrDesign }) {
  return (
    <Link href={getDesktopLibraryUrl(design.id)} className="group block h-full">
      <Card className="group relative h-full overflow-hidden rounded-2xl border-none p-0 after:absolute after:h-full after:w-full after:bg-linear-to-b after:from-transparent after:from-40% after:to-gray-950">
        <GalleryPreview design={design} />
        <div className="absolute bottom-0 z-10 flex flex-col gap-1 p-4">
          <h3 className="line-clamp-1 text-base font-semibold text-white sm:text-lg">
            {design.title}
          </h3>
          <p className="text-xs text-white/80 sm:text-sm">
            {getQrInputTypeLabel(design.inputType)} · {formatLibraryRelativeDate(design.updatedAt)}
          </p>
        </div>
      </Card>
    </Link>
  )
}

const Gallery = ({ designs, className }: GalleryProps) => {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3", className)}>
      {designs.map((design) => (
        <div key={design.id} className="aspect-square">
          <GalleryCard design={design} />
        </div>
      ))}
    </div>
  )
}

export default Gallery
