"use client"

import * as React from "react"

import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { QrCategoryBrowser } from "@/features/home/components/QrCategoryBrowser"
import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_RESET_CLASS,
} from "@/features/desktop-shell/components/InspectorControls"
import {
  DEFAULT_QR_INPUT_TYPE,
  type QrInputType,
} from "@/features/qr-code/content/input-options"
import { useStudioNavigation } from "@/features/studio-hub/hooks/useStudioNavigation"
import { cn } from "@/lib/utils"

export function StudioHubCreatePanel() {
  const { openEditor } = useStudioNavigation()
  const [activeInputType, setActiveInputType] = React.useState<QrInputType | null>(
    DEFAULT_QR_INPUT_TYPE,
  )

  const handleSend = React.useCallback(
    (message: string) => {
      void openEditor({
        source: "prompt",
        inputType: activeInputType ?? DEFAULT_QR_INPUT_TYPE,
        prompt: message,
      })
    },
    [activeInputType, openEditor],
  )

  const handleStartBlank = React.useCallback(() => {
    void openEditor({
      source: "blank",
    })
  }, [openEditor])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div
        data-slot="studio-create-prompt"
        className="rounded-[1.35rem] border border-[var(--desktop-inspector-control-border-hover)] bg-[var(--desktop-inspector-field-bg)] p-1 shadow-[var(--drafting-shadow-rest)] backdrop-blur-sm"
      >
        <PromptInputBox
          activeInputType={activeInputType}
          onInputTypeChange={setActiveInputType}
          onSend={handleSend}
          placeholder="Describe your QR code or paste a link..."
          className="border-0 bg-transparent shadow-none"
        />
      </div>

      <QrCategoryBrowser activeInputType={activeInputType} onInputTypeChange={setActiveInputType} />

      <div className="flex items-center justify-center pt-1">
        <button
          type="button"
          className={cn(DESKTOP_INSPECTOR_RESET_CLASS, "rounded-full px-4 py-2")}
          onClick={handleStartBlank}
        >
          Start blank canvas
        </button>
      </div>

      <p className={cn("drafting-type-caption text-center", DESKTOP_INSPECTOR_FG_MUTED)}>
        Pick a type, describe your intent, or jump straight into the editor.
      </p>
    </div>
  )
}
