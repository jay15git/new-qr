import type { Metadata } from "next"

import { QrStudio } from "@/components/qr/qr-studio"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: "QR Studio Dashboard",
  description:
    "A premium QR design studio for shaping content, styling, and export-ready assets in one workspace.",
}

export default function DashboardPage() {
  return (
    <TooltipProvider>
      <QrStudio variant="dashboard" />
    </TooltipProvider>
  )
}
