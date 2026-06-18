import type { Metadata } from "next"

import { MobileSettingsShell } from "@/features/mobile/components/MobileSettingsShell"

export const metadata: Metadata = {
  title: "Mobile",
  description: "Mobile workspace shell.",
}

export default function MobilePage() {
  return (
    <div className="relative min-h-dvh bg-background">
      <main className="min-h-dvh" />
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-6">
        <MobileSettingsShell />
      </div>
    </div>
  )
}
