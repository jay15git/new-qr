"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { StudioHubCreatePanel } from "@/features/studio-hub/components/StudioHubCreatePanel"
import { StudioHubLibrarySection } from "@/features/studio-hub/components/StudioHubLibrarySection"
import { TemplateGallery } from "@/features/studio-hub/components/TemplateGallery"

export function StudioHubHome() {
  const searchParams = useSearchParams()
  const libraryOpen = searchParams.get("library") === "open"

  return (
    <div data-slot="studio-hub-home" className="flex flex-col gap-12">
      <StudioHubCreatePanel />
      <StudioHubLibrarySection initialExpanded={libraryOpen} />
      <section data-slot="studio-templates-section" className="w-full">
        <TemplateGallery />
      </section>
    </div>
  )
}
