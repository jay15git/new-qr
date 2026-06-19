"use client"

import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export const DESKTOP_UTILITY_TOOLBAR_SHELL_CLASS =
  "inline-flex min-h-14 items-center gap-1 rounded-full border border-white/[0.12] bg-black/55 px-2 py-1.5 text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"

export const DESKTOP_UTILITY_TOOLBAR_BUTTON_CLASS =
  "grid size-10 cursor-pointer place-items-center rounded-full text-current transition hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 disabled:cursor-not-allowed max-md:size-9"

export const DESKTOP_GLASS_TOOLBAR_ICON_BUTTON_CLASS =
  "grid size-8 cursor-pointer place-items-center rounded-full text-current transition hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 disabled:cursor-not-allowed disabled:opacity-35"

export function DesktopUtilityToolbar({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-toolbar-appearance="desktop-glass"
      className={cn(DESKTOP_UTILITY_TOOLBAR_SHELL_CLASS, className)}
      {...props}
    />
  )
}

export function DesktopUtilityToolbarButton({
  className,
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={cn(DESKTOP_UTILITY_TOOLBAR_BUTTON_CLASS, className)}
      type={type}
      {...props}
    />
  )
}
