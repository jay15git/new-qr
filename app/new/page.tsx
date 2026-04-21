import type { Metadata } from "next"
import { CardAbove } from "@/components/cards/card-above"
import { CardSidebar } from "@/components/cards/card-sidebar"

export const metadata: Metadata = {
  title: "New",
  description: "A plain placeholder page.",
}

export default function NewPage() {
  return (
    <main className="bg-white px-6 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
      <div className="grid h-[calc(100dvh-3rem)] w-full grid-rows-[auto_minmax(0,1fr)] sm:h-[calc(100dvh-4rem)]">
        <CardAbove />

        <div className="-mt-px flex min-h-0 w-full items-stretch">
          <CardSidebar
            className="z-20 w-[8rem] shrink-0"
            items={[
              {
                label: "Home",
                selected: true,
                icon: (
                  <svg
                    aria-hidden="true"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5.75 8.75h5.5v5.5h-5.5zm7 0h5.5v5.5h-5.5zm-7 7h5.5v5.5h-5.5zm7 0h5.5v5.5h-5.5z"
                      stroke="currentColor"
                      strokeWidth="1.25"
                    />
                  </svg>
                ),
              },
              {
                label: "Library",
                icon: (
                  <svg
                    aria-hidden="true"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 5.75h10M7 10.75h10M7 15.75h10M5.75 5.75h.5M5.75 10.75h.5M5.75 15.75h.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.25"
                    />
                  </svg>
                ),
              },
            ]}
          />
          <CardSidebar
            className="-ml-px z-10 w-[16rem] shrink-0"
            showLeftCorners={false}
            hideLeftBorder
          />
          <CardSidebar
            className="-ml-px min-w-0 flex-1"
            showLeftCorners={false}
            hideLeftBorder
          />
        </div>
      </div>
    </main>
  )
}
