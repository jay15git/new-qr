"use client"

import { MoonIcon, SunIcon } from "lucide-react"

import {
  DesktopUtilityToolbar,
  DesktopUtilityToolbarButton,
} from "@/features/desktop-shell/components/DesktopUtilityToolbar"
import type { DesktopThemeMode } from "@/features/desktop-shell/components/FloatingToolbar"
import { cn } from "@/lib/utils"

type LibraryThemeToggleProps = {
  theme: DesktopThemeMode
  onThemeChange: (theme: DesktopThemeMode) => void
  className?: string
}

export function LibraryThemeToggle({ theme, onThemeChange, className }: LibraryThemeToggleProps) {
  function handleToggle() {
    onThemeChange(theme === "light" ? "dark" : "light")
  }

  return (
    <DesktopUtilityToolbar
      data-slot="library-utility-toolbar"
      className={cn("shrink-0", className)}
    >
      <DesktopUtilityToolbarButton
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        data-slot="desktop-theme-toggle"
        onClick={handleToggle}
      >
        {theme === "light" ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
      </DesktopUtilityToolbarButton>
    </DesktopUtilityToolbar>
  )
}
