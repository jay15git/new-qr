"use client"

import {
  type QrEditorSectionId,
  QR_EDITOR_SECTIONS,
} from "@/components/qr/qr-sections"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type DashboardSidebarProps = {
  activeSection: QrEditorSectionId
  onSectionChange: (section: QrEditorSectionId) => void
}

export function DashboardSidebar({
  activeSection,
  onSectionChange,
}: DashboardSidebarProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <aside aria-label="Studio navigation">
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="lg:top-24 lg:bottom-6 lg:h-auto"
      >
        <SidebarHeader className="gap-2 px-2 py-2.5 md:pt-3">
          <div
            className={cn(
              "flex items-start gap-2",
              isCollapsed ? "justify-center" : "justify-between",
            )}
          >
            {!isCollapsed ? (
              <div className="px-1.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/55">
                  Studio
                </p>
              </div>
            ) : null}
            <SidebarTrigger className={cn(isCollapsed && "mx-auto")} />
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="px-2 py-2.5">
          <nav aria-label="Studio sections">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-1.5 text-[11px] uppercase tracking-[0.16em]">
                Sections
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {QR_EDITOR_SECTIONS.map((section) => {
                    const Icon = section.icon

                    return (
                      <SidebarMenuItem key={section.id}>
                        <SidebarMenuButton
                          type="button"
                          tooltip={section.title}
                          isActive={section.id === activeSection}
                          size="sm"
                          className={cn(
                            "h-auto items-center gap-2 px-1.5 py-2",
                            isCollapsed && "justify-center",
                          )}
                          onClick={() => onSectionChange(section.id)}
                        >
                          <Icon className="size-4" />
                          {!isCollapsed ? (
                            <span className="min-w-0 truncate text-sm font-medium text-sidebar-foreground">
                              {section.title}
                            </span>
                          ) : null}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </nav>
        </SidebarContent>
      </Sidebar>
    </aside>
  )
}
