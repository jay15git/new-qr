"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { AllTabContent } from "@/features/library/components/AllTabContent"
import {
  DESKTOP_INSPECTOR_CONTROL_CLASS,
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_PANEL_TITLE_CLASS,
} from "@/features/desktop-shell/components/InspectorControls"
import { MOCK_LIBRARY_DESIGNS } from "@/features/library/model/mock-library"
import { cn } from "@/lib/utils"

export function LibraryShell() {
  const codeCount = MOCK_LIBRARY_DESIGNS.length

  return (
    <section
      data-slot="library-shell"
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 pt-10"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className={cn(DESKTOP_INSPECTOR_PANEL_TITLE_CLASS, "text-[1.35rem]")}>Library</h1>
          <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
            {codeCount} {codeCount === 1 ? "code" : "codes"}
          </p>
        </div>
        <Link
          href="/"
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-[6px] px-3 text-[12px] font-semibold",
            DESKTOP_INSPECTOR_CONTROL_CLASS,
          )}
        >
          <Plus className="size-3.5" />
          New
        </Link>
      </header>

      <AllTabContent designs={MOCK_LIBRARY_DESIGNS} />
    </section>
  )
}
