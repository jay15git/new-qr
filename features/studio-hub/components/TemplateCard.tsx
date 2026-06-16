"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "motion/react"

import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_PRIMARY,
  DESKTOP_INSPECTOR_FG_SECONDARY,
} from "@/features/desktop-shell/components/InspectorControls"
import type { QrDesignTemplate } from "@/features/studio-hub/model/templates"
import { cn } from "@/lib/utils"

type TemplateCardProps = {
  template: QrDesignTemplate
  featured?: boolean
  index?: number
  onUse: (template: QrDesignTemplate) => void
}

export function TemplateCard({ template, featured = false, index = 0, onUse }: TemplateCardProps) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 350,
        damping: 30,
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      data-slot="template-card"
      layoutId={`hub-item-${template.id}`}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--desktop-inspector-control-border-hover)] bg-[var(--desktop-inspector-field-bg)] text-left shadow-[var(--drafting-shadow-rest)] transition-shadow hover:shadow-[var(--drafting-shadow-elevated)]",
        featured ? "col-span-2 row-span-1 sm:min-h-[220px]" : "min-h-[200px]",
      )}
      onClick={() => onUse(template)}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          featured ? "h-36 sm:h-44" : "h-32",
        )}
        style={{
          background: `linear-gradient(135deg, ${template.accentColor}22, ${template.accentColor}08)`,
        }}
      >
        <Image
          src={template.thumbnailUrl}
          alt=""
          fill
          unoptimized
          sizes={featured ? "480px" : "240px"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute right-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-neutral-900/90 dark:text-white">
          Use template
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className={cn("drafting-type-control-label font-semibold", DESKTOP_INSPECTOR_FG_PRIMARY)}>
            {template.title}
          </h3>
          <p className={cn("drafting-type-caption mt-0.5", DESKTOP_INSPECTOR_FG_MUTED)}>
            {template.subtitle}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.68rem] font-medium uppercase tracking-wide",
                DESKTOP_INSPECTOR_FG_SECONDARY,
              )}
              style={{
                backgroundColor: `${template.accentColor}18`,
                color: template.accentColor,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}
