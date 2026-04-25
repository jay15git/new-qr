"use client"

import { useSyncExternalStore } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type ModeToggleProps = {
  className?: string
}

function subscribe() {
  return () => {}
}

export function ModeToggle({ className }: ModeToggleProps) {
  const { setTheme, theme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  const isDark = mounted ? theme === "dark" : false

  return (
    <div
      data-slot="mode-toggle"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-foreground shadow-none backdrop-blur",
        className,
      )}
    >
      <span className="text-sm font-medium text-foreground/70">Appearance</span>
      <SunIcon
        data-slot="mode-toggle-light-icon"
        className={cn(
          "size-4 transition-colors",
          isDark ? "text-foreground/35" : "text-amber-500",
        )}
      />
      <Switch
        aria-label="Toggle dark mode"
        checked={isDark}
        className="dark:data-checked:bg-foreground dark:[&_[data-slot=switch-thumb]]:data-checked:bg-background"
        disabled={!mounted}
        onCheckedChange={(checked) => {
          setTheme(checked ? "dark" : "light")
        }}
      />
      <MoonIcon
        data-slot="mode-toggle-dark-icon"
        className={cn(
          "size-4 transition-colors",
          isDark ? "text-sky-300" : "text-foreground/35",
        )}
      />
    </div>
  )
}
