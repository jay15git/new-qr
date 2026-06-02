"use client"

import { DraftingSurface } from "@/components/new/drafting-surface"
import {
  DesktopToolbarPrototype,
  type DesktopThemeMode,
} from "@/components/desktop/desktop-toolbar-prototype"
import { cn } from "@/lib/utils"
import { useState } from "react"

type DesktopWorkspaceProps = {
  fontClassName?: string
}

export function DesktopWorkspace({ fontClassName }: DesktopWorkspaceProps) {
  const [desktopTheme, setDesktopTheme] = useState<DesktopThemeMode>("dark")

  return (
    <section
      aria-label="Desktop workspace"
      data-desktop-theme={desktopTheme}
      data-slot="desktop-workspace"
      className={cn(
        fontClassName,
        "relative h-dvh min-h-dvh overflow-hidden transition-colors duration-200",
        desktopTheme === "light" ? "bg-[#e7e9ec] text-neutral-950" : "bg-[#1b1d21] text-white",
      )}
    >
      <DraftingSurface
        chrome="canvas-only"
        fontClassName={fontClassName}
        paneToolbarVariant="desktop-zoom"
        renderOverlay={(controller) => (
          <DesktopToolbarPrototype
            controller={controller}
            theme={desktopTheme}
            onThemeChange={setDesktopTheme}
          />
        )}
      />
      <DesktopWorkspaceStyles />
    </section>
  )
}

function DesktopWorkspaceStyles() {
  return (
    <style>{`
      [data-slot="desktop-workspace"] [data-slot="drafting-surface"] {
        position: absolute;
        inset: 0;
        height: 100dvh;
        min-height: 100dvh;
        grid-template-rows: 1fr;
        overflow: hidden;
        background: #1b1d21;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-surface"] {
        background: #e7e9ec;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-surface"] {
        background: transparent !important;
        background-image: none !important;
      }

      [data-slot="desktop-workspace"] [data-slot="drafting-pane-layout"] [data-slot="resizable-panel"] {
        flex: 1 1 0 !important;
      }

      [data-slot="desktop-workspace"] [data-slot="desktop-toolbar-prototype"] {
        position: absolute;
        inset: 0;
        z-index: 5;
        min-height: 100dvh;
        background: transparent !important;
        pointer-events: none;
      }

      [data-slot="desktop-workspace"] [data-slot="desktop-floating-toolbar"],
      [data-slot="desktop-workspace"] [data-slot="desktop-floating-inspector"],
      [data-slot="desktop-workspace"] [data-slot="desktop-resize-toolbar"],
      [data-slot="desktop-workspace"] [data-slot="desktop-text-format-toolbar"],
      [data-slot="desktop-workspace"] [data-slot="desktop-theme-toggle"] {
        pointer-events: auto;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-resize-toolbar"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-floating-toolbar"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-context-menu"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-size-value"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-rotation-value"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] {
        background: rgba(255, 255, 255, 0.72) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        color: rgba(15, 23, 42, 0.76) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-resize-toolbar"] button,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] button,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] label,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] input,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] select,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-floating-toolbar"] button,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-context-menu"] button,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-size-value"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-rotation-value"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button {
        color: rgba(15, 23, 42, 0.76) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-resize-toolbar"] button:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] button:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] label:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-floating-toolbar"] button:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-context-menu"] button:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover {
        background: rgba(15, 23, 42, 0.08) !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] div,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] input[type="number"] {
        background: rgba(15, 23, 42, 0.06) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-resize-toolbar"] button[aria-label="Reset canvas size"] {
        border-color: rgba(15, 23, 42, 0.12) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-context-menu-separator"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-toolbar-separator"] {
        background: rgba(15, 23, 42, 0.12) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-context-menu"] {
        background: rgba(255, 255, 255, 0.72) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        color: rgba(15, 23, 42, 0.76) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-context-menu"] button {
        color: rgba(15, 23, 42, 0.76) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-context-menu"] button:hover {
        background: rgba(15, 23, 42, 0.08) !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-context-menu-separator"] {
        background: rgba(15, 23, 42, 0.12) !important;
      }
    `}</style>
  )
}
