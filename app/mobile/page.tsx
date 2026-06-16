import type { Metadata } from "next"
import localFont from "next/font/local"
import { Suspense } from "react"

import { StudioHubShell } from "@/features/studio-hub/components/StudioHubShell"

const satoshi = localFont({
  src: "../../public/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  weight: "300 900",
})

export const metadata: Metadata = {
  title: "Mobile Workspace",
  description: "A mobile-first QR workspace shell.",
}

export default function MobilePage() {
  return (
    <Suspense fallback={null}>
      <StudioHubShell fontClassName={satoshi.className} />
    </Suspense>
  )
}
