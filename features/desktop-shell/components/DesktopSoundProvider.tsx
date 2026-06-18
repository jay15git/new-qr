"use client"

import { useEffect, type ReactNode } from "react"

import { useSound } from "@/hooks/use-sound"
import { click001Sound } from "@/lib/click-001"
import { click003Sound } from "@/lib/click-003"
import { clickSoftSound } from "@/lib/click-soft"
import {
  handleDesktopSoundPointerDown,
  registerDesktopZonePlayer,
  unregisterDesktopZonePlayer,
} from "@/lib/desktop-interaction-sound"
import { getAudioContext } from "@/lib/sound-engine"

type DesktopSoundProviderProps = {
  children: ReactNode
  enabled?: boolean
}

export function DesktopSoundProvider({ children, enabled = true }: DesktopSoundProviderProps) {
  const [playPanel] = useSound(click001Sound, { volume: 0.35 })
  const [playToolbar] = useSound(click003Sound, { volume: 0.5, interrupt: true })
  const [playSlider] = useSound(clickSoftSound, { volume: 0.4, interrupt: true })

  useEffect(() => {
    if (!enabled) return

    registerDesktopZonePlayer("panel", playPanel)
    registerDesktopZonePlayer("toolbar", playToolbar)
    registerDesktopZonePlayer("slider", playSlider)

    return () => {
      unregisterDesktopZonePlayer("panel")
      unregisterDesktopZonePlayer("toolbar")
      unregisterDesktopZonePlayer("slider")
    }
  }, [enabled, playPanel, playToolbar, playSlider])

  useEffect(() => {
    if (!enabled) return

    const warmAudioContext = () => {
      const ctx = getAudioContext()
      if (ctx.state === "suspended") {
        void ctx.resume()
      }
    }

    document.addEventListener("pointerdown", warmAudioContext, { capture: true, once: true })
    document.addEventListener("pointerdown", handleDesktopSoundPointerDown, true)

    return () => {
      document.removeEventListener("pointerdown", warmAudioContext, true)
      document.removeEventListener("pointerdown", handleDesktopSoundPointerDown, true)
    }
  }, [enabled])

  return children
}
