"use client"

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"

import {
  DESKTOP_INSPECTOR_FG_MUTED,
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
          returnTab: "templates",
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
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className={cn("drafting-type-section-title", DESKTOP_INSPECTOR_FG_PRIMARY)}>
          Featured templates
        </h2>
        <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
          Curated starter designs with QR styling, card frames, and default content.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {featuredTemplates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            featured
            index={index}
            onUse={handleUseTemplate}
          />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <LayoutGroup id="template-category-filters">
          {TEMPLATE_CATEGORIES.map((entry) => {
            const isActive = category === entry.id

            return (
              <button
                key={entry.id}
                type="button"
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
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
                    className="absolute inset-0 rounded-full bg-[var(--desktop-inspector-option-selected-bg)] shadow-[var(--drafting-shadow-rest)]"
                  />
                ) : null}
                <span className="relative z-10">{entry.label}</span>
              </button>
            )
          })}
        </LayoutGroup>
      </div>

      <LayoutGroup id="template-gallery-grid">
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                onUse={handleUseTemplate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  )
}
