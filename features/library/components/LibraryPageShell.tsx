"use client"

import { useState, type ReactNode } from "react"

import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"
import type { DesktopThemeMode } from "@/features/desktop-shell/components/FloatingToolbar"
import { LibraryPageStyles } from "@/features/library/components/LibraryPageStyles"
import { LibraryThemeToggle } from "@/features/library/components/LibraryThemeToggle"
import { cn } from "@/lib/utils"

type LibraryPageShellProps = {
  children: ReactNode
  fontClassName: string
}

export function LibraryPageShell({ children, fontClassName }: LibraryPageShellProps) {
  const [theme, setTheme] = useState<DesktopThemeMode>("light")

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
        <LibraryThemeToggle theme={theme} onThemeChange={setTheme} />
        <ScrollArea
          data-scrollbar-visibility="while-scrolling"
          data-slot="library-scroll-area"
          scrollHideDelay={500}
          type="scroll"
          className="min-h-0 flex-1"
        >
          <ScrollAreaViewport
            data-slot="library-scroll"
            className="h-full w-full overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
