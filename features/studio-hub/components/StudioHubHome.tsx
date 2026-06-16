"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { StudioHubCreatePanel } from "@/features/studio-hub/components/StudioHubCreatePanel"
import { StudioHubLibrarySection } from "@/features/studio-hub/components/StudioHubLibrarySection"
import { TemplateGallery } from "@/features/studio-hub/components/TemplateGallery"

function HubSectionDivider() {
  return (
    <div
      aria-hidden
      className="h-px w-full bg-[var(--desktop-inspector-control-border-hover)] opacity-60"
    />
  )
}

export function StudioHubHome() {
  const searchParams = useSearchParams()
  const libraryOpen = searchParams.get("library") === "open"

  return (
    <div data-slot="studio-hub-home" className="flex flex-col gap-16 sm:gap-20">
      <StudioHubCreatePanel />

      <div className="flex flex-col gap-10 sm:gap-12">
        <HubSectionDivider />
        <StudioHubLibrarySection initialExpanded={libraryOpen} />
      </div>

      <div className="flex flex-col gap-10 sm:gap-12">
        <HubSectionDivider />
        <section data-slot="studio-templates-section" className="w-full">
          <TemplateGallery />
        </section>
      </div>
    </div>
  )
}
