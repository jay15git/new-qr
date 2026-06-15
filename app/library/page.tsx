import type { Metadata } from "next"
import localFont from "next/font/local"

import { LibraryPageShell } from "@/features/library/components/LibraryPageShell"
import { LibraryShell } from "@/features/library/components/LibraryShell"

const satoshi = localFont({
  src: "../../public/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  weight: "300 900",
})

export const metadata: Metadata = {
  title: "Library",
  description: "Your QR collections.",
}

export default function LibraryPage() {
  return (
    <LibraryPageShell fontClassName={satoshi.className}>
      <LibraryShell />
    </LibraryPageShell>
  )
}
