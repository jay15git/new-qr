"use client"

import { EditableChip } from "@/components/ui/editable-chip"
import { cn } from "@/lib/utils"

function CornerMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("absolute size-4 text-black/35", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

function ChipCorner({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute block size-3.5 border-zinc-700/80", className)}
    />
  )
}

export function CardAbove() {
  return (
    <div className="relative w-full bg-white">
      <CornerMark className="left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
      <CornerMark className="right-0 top-0 translate-x-1/2 -translate-y-1/2" />

      <div className="flex h-14 w-full items-center justify-center border border-b-0 border-dashed border-black/12 bg-white sm:h-16">
        <div className="relative inline-flex px-1 py-1">
          <ChipCorner className="left-0 top-0 border-l-2 border-t-2" />
          <ChipCorner className="right-0 top-0 border-r-2 border-t-2" />
          <ChipCorner className="bottom-0 left-0 border-b-2 border-l-2" />
          <ChipCorner className="bottom-0 right-0 border-b-2 border-r-2" />

          <div className="relative z-10">
            <EditableChip
              defaultLabel="Favorites"
              onChange={(value) => console.log("Saved:", value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
