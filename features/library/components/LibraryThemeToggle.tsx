"use client"

import { MoonIcon, SunIcon } from "lucide-react"

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
    <div
      data-slot="library-utility-toolbar"
      data-toolbar-appearance="desktop-glass"
      className={cn(
        "inline-flex min-h-14 shrink-0 items-center gap-1 rounded-full border border-white/[0.12] bg-black/55 px-2 py-1.5 text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl",
        className,
      )}
    >
      <button
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        data-slot="desktop-theme-toggle"
        className="grid size-10 place-items-center rounded-full text-current transition hover:bg-white/[0.11] hover:text-white focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:outline-none max-md:size-9"
        type="button"
        onClick={handleToggle}
      >
        {theme === "light" ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
      </button>
    </div>
  )
}
