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
            className="section-icon flex h-7 min-w-7 items-center justify-center rounded-full border border-transparent bg-transparent px-1 text-current transition-colors"
          >
            <Icon className="size-4 shrink-0" />
          </span>
          <span className="section-label text-center text-[9px] leading-[1.05]">
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
        "min-w-0 border-b border-border/70 px-3 py-5 lg:flex lg:min-h-0 lg:flex-col lg:self-stretch lg:border-r lg:border-b-0 lg:px-1 lg:py-6",
        className,
      )}
    >
      <nav
        aria-label="QR editor sections"
        className="flex flex-col gap-4 lg:min-h-0 lg:flex-1"
      >
        <div className="px-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Sections
          </p>
        </div>

        <DirectionAwareTabs
          activeTab={activeSection}
          bubbleClassName="hidden"
          className="border border-border/60 bg-background/35 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur"
          onTabChange={(tabId) => onSectionChange(tabId as QrEditorSectionId)}
          orientation="vertical"
          showContent={false}
          tabClassName="justify-center gap-0.5 px-0 py-1.5 text-center text-foreground/72 hover:text-foreground data-[active=true]:text-foreground/72 [&_[data-slot=section-label]]:text-muted-foreground/80 [&_[data-slot=section-icon]]:text-foreground/72 hover:[&_[data-slot=section-icon]]:border-border/60 hover:[&_[data-slot=section-icon]]:bg-background/70 hover:[&_[data-slot=section-icon]]:text-foreground data-[active=true]:[&_[data-slot=section-icon]]:border-foreground/10 data-[active=true]:[&_[data-slot=section-icon]]:bg-foreground data-[active=true]:[&_[data-slot=section-icon]]:text-background"
          tabListLabel="QR editor sections"
          tabs={tabs}
        />
      </nav>
    </aside>
  )
}
