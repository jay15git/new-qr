"use client"

import * as React from "react"

import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"
import type { DesktopThemeMode } from "@/features/desktop-shell/components/FloatingToolbar"
import { DESKTOP_INSPECTOR_FG_PRIMARY } from "@/features/desktop-shell/components/InspectorControls"
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
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className={cn("drafting-type-caption uppercase tracking-[0.18em]", DESKTOP_INSPECTOR_FG_PRIMARY)}>
                QR Studio
              </p>
              <h1 className={cn("drafting-type-display-data text-[1.65rem] leading-tight sm:text-[2rem]", DESKTOP_INSPECTOR_FG_PRIMARY)}>
                Design. Share. Scan.
              </h1>
            </div>
            <LibraryThemeToggle theme={theme} onThemeChange={handleThemeChange} />
          </div>
        </header>

        <ScrollArea
          data-scrollbar-visibility="while-scrolling"
          data-slot="studio-hub-scroll-area"
          scrollHideDelay={500}
          type="scroll"
          className="min-h-0 flex-1"
        >
          <ScrollAreaViewport
            data-slot="studio-hub-scroll"
            className="h-full w-full overflow-x-hidden overflow-y-auto px-4 pt-[7rem] pb-12 sm:px-6 sm:pt-[7.5rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div data-slot="studio-hub-shell" className="mx-auto flex w-full max-w-6xl flex-col">
              <StudioHubHome />
            </div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar data-slot="studio-hub-scrollbar" className="w-2 border-none p-[1px]">
            <ScrollAreaThumb data-slot="studio-hub-scroll-thumb" />
          </ScrollAreaScrollbar>
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
