"use client"

import type { ReactNode } from "react"
import {
  FileStackIcon,
  ImageIcon,
  MoveIcon,
} from "lucide-react"

import {
  DASHBOARD_EDIT_SECTIONS,
  type DashboardEditSectionId,
} from "@/components/qr/dashboard-edit-sections"
import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs"
import { cn } from "@/lib/utils"

const DRAFTING_EDIT_SECTION_ICONS: Record<DashboardEditSectionId, ReactNode> = {
  page: <FileStackIcon className="size-4 shrink-0" />,
  position: <MoveIcon className="size-4 shrink-0" />,
  assets: <ImageIcon className="size-4 shrink-0" />,
  layers: <ImageIcon className="size-4 shrink-0" />,
  inspector: <MoveIcon className="size-4 shrink-0" />,
  background: <FileStackIcon className="size-4 shrink-0" />,
}

type DashboardEditRailProps = {
  activeSection: DashboardEditSectionId
  appearance?: "dashboard" | "drafting"
  className?: string
  onSectionChange: (section: DashboardEditSectionId) => void
}

export function DashboardEditRail({
  activeSection,
  appearance = "dashboard",
  className,
  onSectionChange,
}: DashboardEditRailProps) {
  const isDraftingAppearance = appearance === "drafting"

  if (isDraftingAppearance) {
    return (
      <aside
        data-slot="dashboard-edit-rail"
        data-appearance={appearance}
        className={cn("min-h-0", className)}
      >
        <nav
          aria-label="Dashboard edit sections"
          className="flex min-h-full flex-col items-center gap-4 pt-0"
        >
          {DASHBOARD_EDIT_SECTIONS.map((section) => {
            const isActive = section.id === activeSection

            return (
              <button
                key={section.id}
                aria-label={`Open ${section.title}`}
                aria-pressed={isActive}
                data-slot="drafting-edit-tool-button"
                className={cn(
                  "group flex h-auto w-20 flex-col items-center gap-3 rounded-none border-0 bg-transparent px-2 py-2.5 text-center text-black/45 shadow-none transition-[color,transform] duration-150 ease-out hover:bg-transparent hover:text-black/72 active:bg-transparent",
                  isActive && "text-black",
                )}
                onClick={() => onSectionChange(section.id)}
                type="button"
              >
                <span
                  data-slot="drafting-tool-button-icon"
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[6px] bg-black/[0.03] text-current shadow-[0_0_18px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.03)] transition-[background-color,box-shadow,transform,color] duration-150 ease-out group-hover:-translate-y-px group-hover:bg-black/[0.06] group-hover:shadow-[0_0_24px_rgba(0,0,0,0.10),0_4px_10px_rgba(0,0,0,0.06)] group-active:translate-y-0 group-active:bg-black/[0.07] group-active:shadow-[0_0_14px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]",
                    isActive &&
                      "bg-[#111111] text-white shadow-[0_0_24px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.10)] group-hover:bg-[#111111] group-hover:text-white group-hover:shadow-[0_0_28px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.14)] group-active:translate-y-0 group-active:bg-[#111111] group-active:text-white group-active:shadow-[0_0_24px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.10)]",
                  )}
                >
                  {DRAFTING_EDIT_SECTION_ICONS[section.id]}
                </span>
                <span
                  data-slot="drafting-tool-button-label"
                  className={cn(
                    "text-[0.58rem] font-medium uppercase leading-[1.15] tracking-[0.16em] text-black/45 transition-colors duration-150 group-hover:text-black/72",
                    isActive && "font-semibold text-current",
                  )}
                >
                  {section.title}
                </span>
              </button>
            )
          })}
        </nav>
      </aside>
    )
  }

  return (
    <aside
      data-slot="dashboard-edit-rail"
      data-appearance={appearance}
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
