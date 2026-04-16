import type { Metadata } from "next"

import { HomePromptShell } from "@/components/home/home-prompt-shell"

export const metadata: Metadata = {
  title: "QR Studio Home",
  description: "AI prompt input home screen.",
}

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <HomePromptShell />
      </div>
    </main>
  )
}
