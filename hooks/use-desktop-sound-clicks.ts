"use client"

import { useEffect } from "react"

import { handleDesktopSoundPointerDown } from "@/lib/desktop-interaction-sound"

export function useDesktopSoundClicks(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    document.addEventListener("pointerdown", handleDesktopSoundPointerDown, true)

    return () => {
      document.removeEventListener("pointerdown", handleDesktopSoundPointerDown, true)
    }
  }, [enabled])
}
