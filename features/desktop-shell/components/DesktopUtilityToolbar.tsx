"use client"

import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export const DESKTOP_UTILITY_TOOLBAR_SHELL_CLASS =
  "inline-flex min-h-12 cursor-pointer items-center gap-0.5 rounded-full border border-[var(--desktop-glass-border)] bg-[var(--desktop-glass-bg)] px-1.5 py-1 text-[var(--desktop-glass-fg)] shadow-[var(--desktop-glass-shadow)] backdrop-blur-2xl"

export const DESKTOP_UTILITY_TOOLBAR_BUTTON_CLASS =
  "grid size-9 cursor-pointer place-items-center rounded-full text-current transition hover:bg-[var(--desktop-glass-button-hover-bg)] hover:text-[var(--desktop-glass-button-hover-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-glass-button-focus-ring)] disabled:cursor-not-allowed max-md:size-8 [&_svg]:size-3.5"

export const DESKTOP_GLASS_TOOLBAR_ICON_BUTTON_CLASS =
  "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-current transition hover:bg-[var(--desktop-glass-button-hover-bg)] hover:text-[var(--desktop-glass-button-hover-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-glass-button-focus-ring)] disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-3.5"

export const DESKTOP_CANVAS_GLASS_TOOLBAR_SHELL_CLASS =
  "inline-flex min-h-12 cursor-pointer items-center gap-0.5 rounded-full border border-white/[0.12] bg-black/55 px-2.5 py-1 text-white/78 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"

export const DESKTOP_CANVAS_GLASS_TOOLBAR_VERTICAL_SHELL_CLASS =
  "inline-flex min-w-12 cursor-pointer flex-col items-center gap-0.5 rounded-full border border-white/[0.12] bg-black/55 px-1 py-2.5 text-white/78 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"

export const DESKTOP_COMPOSE_TOOLBAR_ICON_BUTTON_CLASS = DESKTOP_GLASS_TOOLBAR_ICON_BUTTON_CLASS

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
