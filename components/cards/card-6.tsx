import { cn } from "@/lib/utils"

function CornerMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("absolute size-7 text-black", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function Card_6() {
  return (
    <div className="relative w-full max-w-[84rem] bg-white">
      <CornerMark className="-left-3 -top-3" />
      <CornerMark className="-right-3 -top-3" />
      <CornerMark className="-bottom-3 -left-3" />
      <CornerMark className="-bottom-3 -right-3" />

      <div className="border border-black/12 px-12 py-12 sm:px-16 sm:py-14 md:px-20 md:py-16">
        <div className="h-16 w-full max-w-80 rounded-2xl bg-neutral-100" />
        <div className="mt-16 h-40 w-full rounded-3xl bg-neutral-100 sm:h-44 md:h-48" />
      </div>
    </div>
  )
}
