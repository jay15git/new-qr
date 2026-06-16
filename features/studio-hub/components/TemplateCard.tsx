"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "motion/react"

import type { QrDesignTemplate } from "@/features/studio-hub/model/templates"

type TemplateCardProps = {
  template: QrDesignTemplate
  index?: number
  onUse: (template: QrDesignTemplate) => void
}

export function TemplateCard({ template, index = 0, onUse }: TemplateCardProps) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        delay: index * 0.03,
        type: "spring",
        stiffness: 380,
        damping: 32,
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      data-slot="template-card"
      layoutId={`hub-item-${template.id}`}
      className="group relative block h-full w-full overflow-hidden rounded-2xl border border-[var(--desktop-inspector-control-border-hover)] bg-[var(--desktop-inspector-field-bg)] text-left shadow-[var(--drafting-shadow-rest)] transition-shadow duration-300 hover:shadow-[var(--drafting-shadow-elevated)]"
      onClick={() => onUse(template)}
    >
      <div
        className="relative h-full w-full"
        style={{
          background: `linear-gradient(135deg, ${template.accentColor}22, ${template.accentColor}08)`,
        }}
      >
        <Image
          src={template.thumbnailUrl}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[38%] to-black/75" />
        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-white/90 px-3 py-1 text-[0.68rem] font-semibold tracking-wide text-neutral-900 opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          Use template
        </div>

        <div className="absolute bottom-0 z-10 flex w-full flex-col gap-1.5 p-4">
          <h3 className="line-clamp-1 text-base font-semibold text-white sm:text-lg">
            {template.title}
          </h3>
          <p className="line-clamp-1 text-xs text-white/80 sm:text-sm">{template.subtitle}</p>
          {template.tags.length > 0 ? (
            <p className="line-clamp-1 text-xs text-white/70 sm:text-sm">
              {template.tags.join(" · ")}
            </p>
          ) : null}
        </div>
      </div>
    </motion.button>
  )
}
