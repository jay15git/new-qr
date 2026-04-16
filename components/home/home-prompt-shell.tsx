"use client"

import * as React from "react"

import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { QrCategoryBrowser } from "@/components/ui/qr-category-browser"
import {
  DEFAULT_QR_INPUT_TYPE,
  type QrInputType,
} from "@/components/ui/qr-input-config"

export function HomePromptShell() {
  const [activeInputType, setActiveInputType] = React.useState<QrInputType | null>(
    DEFAULT_QR_INPUT_TYPE
  )

  return (
    <div className="flex w-full flex-col gap-3">
      <PromptInputBox
        activeInputType={activeInputType}
        onInputTypeChange={setActiveInputType}
      />
      <QrCategoryBrowser
        activeInputType={activeInputType}
        onInputTypeChange={setActiveInputType}
      />
    </div>
  )
}
