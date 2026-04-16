import { QrStudio } from "@/components/qr/qr-studio"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardPage() {
  return (
    <TooltipProvider>
      <QrStudio variant="dashboard" />
    </TooltipProvider>
  )
}
