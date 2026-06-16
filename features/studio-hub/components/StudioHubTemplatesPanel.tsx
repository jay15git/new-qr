"use client"

import { TemplateGallery } from "@/features/studio-hub/components/TemplateGallery"

export function StudioHubTemplatesPanel() {
  return (
    <section data-slot="studio-templates-panel" className="w-full">
      <TemplateGallery />
    </section>
  )
}
