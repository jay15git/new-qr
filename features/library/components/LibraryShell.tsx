"use client"

import { AllTabContent } from "@/features/library/components/AllTabContent"
import { MOCK_LIBRARY_DESIGNS } from "@/features/library/model/mock-library"

export function LibraryShell() {
  return (
    <section
      data-slot="library-shell"
      className="mx-auto flex w-full max-w-5xl flex-col gap-5"
    >
      <AllTabContent designs={MOCK_LIBRARY_DESIGNS} />
    </section>
  )
}
