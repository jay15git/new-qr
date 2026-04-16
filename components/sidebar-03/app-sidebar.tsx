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
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="gap-3 px-2 py-3 md:pt-3.5">
        <div
          className={cn(
            "flex items-start gap-2",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed ? (
            <div className="px-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-sidebar-foreground/55">
                Main editor
              </p>
              <h2 className="mt-1 text-sm font-semibold text-sidebar-foreground">
                QR settings
              </h2>
            </div>
          ) : null}
          <SidebarTrigger className={cn(isCollapsed && "mx-auto")} />
        </div>
        {!isCollapsed ? (
          <p className="px-2 text-xs leading-5 text-sidebar-foreground/70">
            Switch between content, styling, branding, and encoding controls.
          </p>
        ) : null}
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel>Sections</SidebarGroupLabel>
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
                      className={cn(
                        "h-auto items-start gap-3 px-2 py-2.5",
                        isCollapsed && "justify-center",
                      )}
                      onClick={() => onSectionChange(section.id)}
                    >
                      <Icon className="mt-0.5 size-4" />
                      {!isCollapsed ? (
                        <span className="flex min-w-0 flex-col text-left">
                          <span className="text-sm font-medium text-sidebar-foreground">
                            {section.title}
                          </span>
                          <span className="text-xs leading-5 text-sidebar-foreground/65">
                            {section.description}
                          </span>
                        </span>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
