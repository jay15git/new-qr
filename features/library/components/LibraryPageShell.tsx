"use client"

import { useState, type ReactNode } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { DesktopThemeMode } from "@/features/desktop-shell/components/FloatingToolbar"
import { DESKTOP_INSPECTOR_PANEL_TITLE_CLASS } from "@/features/desktop-shell/components/InspectorControls"
import { LibraryPageStyles } from "@/features/library/components/LibraryPageStyles"
import { LibraryThemeToggle } from "@/features/library/components/LibraryThemeToggle"
import { cn } from "@/lib/utils"

type LibraryPageShellProps = {
  children: ReactNode
  fontClassName: string
  toolbarTitle?: string
}

export function LibraryPageShell({ children, fontClassName, toolbarTitle }: LibraryPageShellProps) {
  const [theme, setTheme] = useState<DesktopThemeMode>("light")
  const themeToggle = (
    <LibraryThemeToggle theme={theme} onThemeChange={setTheme} />
  )

  return (
    <>
      <LibraryPageStyles />
      <main
        data-slot="library-page"
        data-desktop-theme={theme}
        className={cn(
          fontClassName,
          "flex h-dvh flex-col overflow-hidden transition-colors duration-200",
          theme === "light" ? "bg-workspace-shell-light text-neutral-950" : "bg-workspace-shell text-white",
        )}
      >
        {toolbarTitle ? (
          <div
            data-slot="library-page-header"
            className="fixed top-5 right-0 left-0 z-30 px-4 sm:px-6 max-md:top-4"
          >
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
              <h1 className={cn(DESKTOP_INSPECTOR_PANEL_TITLE_CLASS, "text-[1.35rem]")}>
                {toolbarTitle}
              </h1>
              {themeToggle}
            </div>
          </div>
        ) : (
          <div className="fixed top-5 right-5 z-30 max-md:top-4 max-md:right-4">{themeToggle}</div>
        )}
        <ScrollArea
          chevron
          cueSize="comfortable"
          data-slot="library-scroll-area"
          scrollFade
          className="min-h-0 flex-1"
          viewportClassName={cn(
            "px-4 py-6 sm:px-6",
            toolbarTitle && "pt-[7.5rem]",
          )}
        >
          <div data-slot="library-scroll">{children}</div>
        </ScrollArea>
      </main>
    </>
  )
}
