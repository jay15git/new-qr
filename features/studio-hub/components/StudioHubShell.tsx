"use client"

import * as React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { DesktopThemeMode } from "@/features/desktop-shell/components/FloatingToolbar"
import { LibraryThemeToggle } from "@/features/library/components/LibraryThemeToggle"
import { StudioHubHome } from "@/features/studio-hub/components/StudioHubHome"
import { StudioHubStyles } from "@/features/studio-hub/components/StudioHubStyles"
import { StudioNavigationProvider } from "@/features/studio-hub/hooks/useStudioNavigation"
import { STUDIO_THEME_KEY } from "@/features/studio-hub/model/navigation"
import { cn } from "@/lib/utils"

type StudioHubShellProps = {
  fontClassName: string
}

function StudioHubShellInner({ fontClassName }: StudioHubShellProps) {
  const [theme, setTheme] = React.useState<DesktopThemeMode>("light")

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STUDIO_THEME_KEY)
      if (stored === "light" || stored === "dark") {
        setTheme(stored)
      }
    } catch {
      // Ignore storage failures.
    }
  }, [])

  const handleThemeChange = React.useCallback((nextTheme: DesktopThemeMode) => {
    setTheme(nextTheme)
    try {
      window.localStorage.setItem(STUDIO_THEME_KEY, nextTheme)
    } catch {
      // Ignore storage failures.
    }
  }, [])

  return (
    <>
      <StudioHubStyles />
      <main
        data-slot="studio-hub"
        data-desktop-theme={theme}
        className={cn(
          fontClassName,
          "flex h-dvh flex-col overflow-hidden transition-colors duration-200",
          theme === "light" ? "bg-workspace-shell-light text-neutral-950" : "bg-workspace-shell text-white",
        )}
      >
        <header
          data-slot="studio-hub-header"
          className="fixed top-5 right-0 left-0 z-30 px-4 sm:px-6 max-md:top-4"
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-4">
            <LibraryThemeToggle theme={theme} onThemeChange={handleThemeChange} />
          </div>
        </header>

        <ScrollArea
          chevron
          cueSize="comfortable"
          data-slot="studio-hub-scroll-area"
          scrollFade
          className="min-h-0 flex-1"
          viewportClassName="px-4 pt-[5.5rem] pb-16 sm:px-6 sm:pt-[6rem]"
        >
          <div data-slot="studio-hub-scroll" className="mx-auto flex w-full max-w-5xl flex-col">
            <div data-slot="studio-hub-shell">
              <StudioHubHome />
            </div>
          </div>
        </ScrollArea>
      </main>
    </>
  )
}

export function StudioHubShell(props: StudioHubShellProps) {
  return (
    <StudioNavigationProvider>
      <StudioHubShellInner {...props} />
    </StudioNavigationProvider>
  )
}
