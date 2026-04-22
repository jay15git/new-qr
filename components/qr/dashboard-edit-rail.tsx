"use client"

import {
  DASHBOARD_EDIT_SECTIONS,
  type DashboardEditSectionId,
} from "@/components/qr/dashboard-edit-sections"
import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs"
import { cn } from "@/lib/utils"

type DashboardEditRailProps = {
  activeSection: DashboardEditSectionId
  className?: string
  onSectionChange: (section: DashboardEditSectionId) => void
}

export function DashboardEditRail({
  activeSection,
  className,
  onSectionChange,
}: DashboardEditRailProps) {
  return (
    <aside
      data-slot="dashboard-edit-rail"
      className={cn(
        "min-w-0 border-b border-white/6 px-3 py-4 lg:flex lg:min-h-0 lg:flex-col lg:self-stretch lg:border-r lg:border-white/6 lg:border-b-0 lg:px-2 lg:py-8",
        className,
      )}
    >
      <nav
        aria-label="Dashboard edit sections"
        className="flex flex-col lg:min-h-0 lg:flex-1"
      >
        <DirectionAwareTabs
          activeTab={activeSection}
          bubbleClassName="bg-white/[0.07] ring-1 ring-white/[0.08] shadow-none mix-blend-normal"
          className="border border-white/6 bg-white/[0.03] p-1 shadow-none"
          onTabChange={(tabId) => onSectionChange(tabId as DashboardEditSectionId)}
          orientation="vertical"
          showContent={false}
          tabClassName="justify-start rounded-[1.15rem] px-3 py-3 text-left text-[0.68rem] font-medium tracking-[0.18em] uppercase text-foreground/40 hover:text-foreground/66 data-[active=true]:text-foreground"
          tabListLabel="Dashboard edit sections"
          tabs={DASHBOARD_EDIT_SECTIONS.map((section) => ({
            id: section.id,
            label: (
              <div className="relative z-20 flex min-w-0 flex-1 items-center">
                <span>{section.title}</span>
              </div>
            ),
          }))}
        />
      </nav>
    </aside>
  )
}
