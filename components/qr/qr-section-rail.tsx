"use client"

import {
  QR_EDITOR_SECTIONS,
  type QrEditorSectionId,
} from "@/components/qr/qr-sections"
import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs"
import { cn } from "@/lib/utils"

type QrSectionRailProps = {
  activeSection: QrEditorSectionId
  className?: string
  onSectionChange: (section: QrEditorSectionId) => void
}

export function QrSectionRail({
  activeSection,
  className,
  onSectionChange,
}: QrSectionRailProps) {
  const tabs = QR_EDITOR_SECTIONS.map((section) => {
    const Icon = section.icon

    return {
      id: section.id,
      label: (
        <span
          data-section={section.id}
          className="relative z-20 flex flex-col items-center justify-center gap-0.5"
        >
          <span
            data-slot="section-icon"
            className="section-icon flex h-9 min-w-9 items-center justify-center rounded-[1rem] bg-transparent px-1.5 py-1.5 text-current transition-colors"
          >
            <Icon className="size-4 shrink-0" />
          </span>
          <span className="section-label text-center text-[0.58rem] leading-[1.15]">
            {section.title}
          </span>
        </span>
      ),
    }
  })

  return (
    <aside
      data-slot="dashboard-section-rail"
      className={cn(
        "min-w-0 border-b border-white/6 px-3 py-4 lg:flex lg:min-h-0 lg:flex-col lg:self-stretch lg:border-r lg:border-white/6 lg:border-b-0 lg:px-2 lg:py-8",
        className,
      )}
    >
      <nav
        aria-label="QR editor sections"
        className="flex flex-col lg:min-h-0 lg:flex-1"
      >
        <DirectionAwareTabs
          activeTab={activeSection}
          bubbleClassName="hidden"
          className="border-0 bg-transparent p-0 shadow-none"
          onTabChange={(tabId) => onSectionChange(tabId as QrEditorSectionId)}
          orientation="vertical"
          showContent={false}
          tabClassName="justify-center gap-1 rounded-[1.2rem] px-0 py-2 text-center text-foreground/34 hover:text-foreground/58 data-[active=true]:text-foreground [&_[data-slot=section-label]]:font-medium [&_[data-slot=section-label]]:tracking-[0.16em] [&_[data-slot=section-label]]:uppercase [&_[data-slot=section-label]]:text-current/75 [&_[data-slot=section-icon]]:text-current hover:[&_[data-slot=section-icon]]:bg-white/[0.04] data-[active=true]:[&_[data-slot=section-icon]]:bg-white/[0.08] data-[active=true]:[&_[data-slot=section-icon]]:text-foreground"
          tabListLabel="QR editor sections"
          tabs={tabs}
        />
      </nav>
    </aside>
  )
}
