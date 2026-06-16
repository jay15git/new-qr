"use client"

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"

import { LIBRARY_LIFTED_SURFACE_CLASS } from "@/components/ui/animated-collection"
import {
  DESKTOP_INSPECTOR_FG_PRIMARY,
} from "@/features/desktop-shell/components/InspectorControls"
import { TemplateCard } from "@/features/studio-hub/components/TemplateCard"
import { useStudioNavigation } from "@/features/studio-hub/hooks/useStudioNavigation"
import {
  QR_DESIGN_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getFeaturedTemplates,
  type QrDesignTemplate,
  type QrDesignTemplateCategory,
} from "@/features/studio-hub/model/templates"
import { cn } from "@/lib/utils"

export function TemplateGallery() {
  const { openEditor } = useStudioNavigation()
  const [category, setCategory] = React.useState<QrDesignTemplateCategory | "all">("all")

  const filteredTemplates = React.useMemo(() => {
    if (category === "all") {
      return QR_DESIGN_TEMPLATES
    }

    return QR_DESIGN_TEMPLATES.filter((template) => template.category === category)
  }, [category])

  const featuredTemplates = React.useMemo(() => getFeaturedTemplates(), [])

  const handleUseTemplate = React.useCallback(
    (template: QrDesignTemplate) => {
      void openEditor(
        {
          source: "template",
          templateId: template.id,
          transitionId: template.id,
        },
        {
          id: template.id,
          thumbnailUrl: template.thumbnailUrl,
          title: template.title,
        },
      )
    },
    [openEditor],
  )

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className={cn("drafting-type-section-title font-semibold", DESKTOP_INSPECTOR_FG_PRIMARY)}>
          Templates
        </h2>
      </div>

      <div className="space-y-4">
        <h3 className={cn("drafting-type-control-label font-semibold", DESKTOP_INSPECTOR_FG_PRIMARY)}>
          Featured
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {featuredTemplates.map((template, index) => (
            <div key={template.id} className="aspect-square">
              <TemplateCard template={template} index={index} onUse={handleUseTemplate} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <LayoutGroup id="template-category-filters">
          {TEMPLATE_CATEGORIES.map((entry) => {
            const isActive = category === entry.id

            return (
              <button
                key={entry.id}
                type="button"
                className={cn(
                  "relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-[var(--desktop-inspector-option-selected-fg)]"
                    : "text-[var(--desktop-inspector-fg-muted)] hover:text-[var(--desktop-inspector-fg-secondary)]",
                )}
                onClick={() => setCategory(entry.id)}
              >
                {isActive ? (
                  <motion.span
                    layoutId="template-category-pill"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className={cn("absolute inset-0", LIBRARY_LIFTED_SURFACE_CLASS)}
                  />
                ) : null}
                <span className="relative z-10">{entry.label}</span>
              </button>
            )
          })}
        </LayoutGroup>
      </div>

      <LayoutGroup id="template-gallery-grid">
        <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <motion.div key={template.id} layout className="aspect-square">
                <TemplateCard template={template} index={index} onUse={handleUseTemplate} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  )
}
