import { DashboardSidebar } from "@/components/sidebar-03/app-sidebar"
import { DEFAULT_QR_EDITOR_SECTION } from "@/components/qr/qr-sections"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Sidebar03() {
  return (
    <SidebarProvider>
      <div className="relative flex h-dvh w-full">
        <DashboardSidebar
          activeSection={DEFAULT_QR_EDITOR_SECTION}
          onSectionChange={() => {}}
        />
        <SidebarInset className="flex flex-col" />
      </div>
    </SidebarProvider>
  )
}
