"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "motion/react"

import {
  DESKTOP_INSPECTOR_FG_PRIMARY,
} from "@/features/desktop-shell/components/InspectorControls"
import { HUB_CARD_SURFACE } from "@/features/studio-hub/components/hub-surfaces"
import type { QrDesignTemplate } from "@/features/studio-hub/model/templates"
import { cn } from "@/lib/utils"

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
      className={cn("group relative block h-full w-full overflow-hidden text-left", HUB_CARD_SURFACE)}
      onClick={() => onUse(template)}
    >
      <div className="relative flex h-full w-full flex-col">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <Image
            src={template.thumbnailUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </div>
        <div className="shrink-0 px-4 py-3">
          <h3 className={cn("line-clamp-1 text-base font-semibold sm:text-lg", DESKTOP_INSPECTOR_FG_PRIMARY)}>
            {template.title}
          </h3>
        </div>
      </div>
    </motion.button>
  )
}
