"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { DesktopWorkspace } from "@/features/desktop-shell/components/DesktopWorkspace"
import { HubToEditorTransition } from "@/features/studio-hub/components/HubToEditorTransition"
import { STUDIO_THEME_KEY } from "@/features/studio-hub/model/navigation"
import type { DesktopThemeMode } from "@/features/desktop-shell/components/FloatingToolbar"
import type { DesktopToolbarToolId } from "@/features/desktop-shell/components/FloatingToolbar"

type DesktopPageClientProps = {
  fontClassName: string
}

function resolveInitialTool(source: string | null): DesktopToolbarToolId | undefined {
  if (source === "prompt" || source === "blank") {
    return "content"
  }

  return undefined
}

export function DesktopPageClient({ fontClassName }: DesktopPageClientProps) {
  const searchParams = useSearchParams()
  const source = searchParams.get("source")
  const [initialTheme] = React.useState<DesktopThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light"
    }

    try {
      const stored = window.localStorage.getItem(STUDIO_THEME_KEY)
      return stored === "dark" ? "dark" : "light"
    } catch {
      return "light"
    }
  })

  return (
    <>
      <HubToEditorTransition />
      <DesktopWorkspace
        fontClassName={fontClassName}
        initialTheme={initialTheme}
        initialActiveTool={resolveInitialTool(source)}
      />
    </>
  )
}
