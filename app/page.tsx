import type { Metadata } from "next"

import { PromptInputBox } from "@/components/ui/ai-prompt-box"

export const metadata: Metadata = {
  title: "QR Studio Home",
  description: "AI prompt input home screen.",
}

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <PromptInputBox />
      </div>
    </main>
  )
}
