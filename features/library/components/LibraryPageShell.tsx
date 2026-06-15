"use client"

import { useState, type ReactNode } from "react"

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
          "min-h-dvh px-4 py-6 transition-colors duration-200 sm:px-6",
          theme === "light" ? "bg-workspace-shell-light text-neutral-950" : "bg-workspace-shell text-white",
        )}
      >
        <LibraryThemeToggle theme={theme} onThemeChange={setTheme} />
        {children}
      </main>
    </>
  )
}
