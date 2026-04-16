import { DashboardSidebar } from "@/components/sidebar-03/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardPage() {
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-screen w-full">
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          <main className="flex-1" />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
