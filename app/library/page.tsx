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
  title: "QR Studio",
  description: "Create, browse templates, and manage your QR design library.",
}

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <StudioHubShell fontClassName={satoshi.className} />
    </Suspense>
  )
}
