"use client"

import { useState, type ReactNode } from "react"

import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"
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
          data-scrollbar-visibility="while-scrolling"
          data-slot="library-scroll-area"
          scrollHideDelay={500}
          type="scroll"
          className="min-h-0 flex-1"
        >
          <ScrollAreaViewport
            data-slot="library-scroll"
            className={cn(
              "h-full w-full overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              toolbarTitle && "pt-[7.5rem]",
            )}
          >
            {children}
          </ScrollAreaViewport>
          <ScrollAreaScrollbar
            data-slot="library-scrollbar"
            className="w-2 border-none p-[1px]"
          >
            <ScrollAreaThumb data-slot="library-scroll-thumb" />
          </ScrollAreaScrollbar>
        </ScrollArea>
      </main>
    </>
  )
}
