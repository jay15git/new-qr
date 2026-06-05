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
        sliderVariant="desktop-elastic"
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
        --drafting-canvas-dot-rgb: 246 248 251;
        --drafting-canvas-dot-opacity: 0.035;
        position: absolute;
        inset: 0;
        height: 100dvh;
        min-height: 100dvh;
        grid-template-rows: 1fr;
        overflow: hidden;
        background: #1b1d21;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-surface"] {
        --drafting-canvas-dot-rgb: 15 23 42;
        --drafting-canvas-dot-opacity: 0.08;
        background: #e7e9ec;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-surface"] {
        background-color: transparent !important;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-surface"][data-grid-visible="false"] {
        background-image: none !important;
      }

      [data-slot="desktop-workspace"] [data-slot="elastic-slider"],
      body:has([data-slot="desktop-workspace"]) [data-slot="elastic-slider"] {
        --elastic-slider-bg: rgba(255, 255, 255, 0.095);
        --elastic-slider-fill: rgba(255, 255, 255, 0.13);
        --elastic-slider-fill-active: rgba(255, 255, 255, 0.2);
        --elastic-slider-hash: rgba(255, 255, 255, 0.24);
        --elastic-slider-handle: rgba(255, 255, 255, 0.7);
        --elastic-slider-label: rgba(255, 255, 255, 0.58);
        --elastic-slider-focus: rgba(255, 255, 255, 0.82);
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="elastic-slider"],
      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="elastic-slider"] {
        --elastic-slider-bg: rgba(15, 23, 42, 0.08);
        --elastic-slider-fill: rgba(15, 23, 42, 0.1);
        --elastic-slider-fill-active: rgba(15, 23, 42, 0.16);
        --elastic-slider-hash: rgba(15, 23, 42, 0.22);
        --elastic-slider-handle: rgba(15, 23, 42, 0.58);
        --elastic-slider-label: rgba(15, 23, 42, 0.56);
        --elastic-slider-focus: rgba(15, 23, 42, 0.78);
      }

      [data-slot="desktop-workspace"] [data-slot="drafting-pane-layout"] [data-slot="resizable-panel"] {
        flex: 1 1 0 !important;
      }

      [data-slot="desktop-workspace"] [data-slot="desktop-toolbar-prototype"] {
        position: absolute;
        inset: 0;
        z-index: 60;
        min-height: 100dvh;
        background: transparent !important;
        pointer-events: none;
      }

      [data-slot="desktop-workspace"] [data-slot="desktop-floating-toolbar"],
      [data-slot="desktop-workspace"] [data-slot="desktop-floating-inspector"],
      [data-slot="desktop-workspace"] [data-slot="desktop-action-toolbar"],
      [data-slot="desktop-workspace"] [data-slot="desktop-resize-toolbar"],
      [data-slot="desktop-workspace"] [data-slot="desktop-text-format-toolbar"],
      [data-slot="desktop-workspace"] [data-slot="desktop-theme-toggle"] {
        pointer-events: auto;
      }

      [data-slot="desktop-workspace"] [data-toolbar-appearance="desktop-glass"] button,
      [data-slot="desktop-workspace"] button[data-toolbar-appearance="desktop-glass"] {
        transform: none !important;
        translate: none !important;
        scale: none !important;
        rotate: none !important;
      }

      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-floating-toolbar"][data-toolbar-appearance="desktop-glass"] button,
      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-context-menu"][data-toolbar-appearance="desktop-glass"] button {
        transform: none !important;
        translate: none !important;
        scale: none !important;
        rotate: none !important;
      }

      [data-slot="desktop-workspace"] [data-toolbar-appearance="desktop-glass"] button:hover,
      [data-slot="desktop-workspace"] [data-toolbar-appearance="desktop-glass"] button:active,
      [data-slot="desktop-workspace"] button[data-toolbar-appearance="desktop-glass"]:hover,
      [data-slot="desktop-workspace"] button[data-toolbar-appearance="desktop-glass"]:active {
        transform: none !important;
        translate: none !important;
        scale: none !important;
        rotate: none !important;
      }

      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-floating-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover,
      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-floating-toolbar"][data-toolbar-appearance="desktop-glass"] button:active,
      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-context-menu"][data-toolbar-appearance="desktop-glass"] button:hover,
      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-context-menu"][data-toolbar-appearance="desktop-glass"] button:active {
        transform: none !important;
        translate: none !important;
        scale: none !important;
        rotate: none !important;
      }

      [data-slot="desktop-workspace"] [data-toolbar-appearance="desktop-glass"] button svg,
      [data-slot="desktop-workspace"] button[data-toolbar-appearance="desktop-glass"] svg {
        transform-origin: center;
        transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease, opacity 180ms ease;
      }

      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-floating-toolbar"][data-toolbar-appearance="desktop-glass"] button svg,
      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-context-menu"][data-toolbar-appearance="desktop-glass"] button svg {
        transform-origin: center;
        transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease, opacity 180ms ease;
      }

      [data-slot="desktop-workspace"] [data-toolbar-appearance="desktop-glass"] button:active svg,
      [data-slot="desktop-workspace"] button[data-toolbar-appearance="desktop-glass"]:active svg {
        transform: scale(0.84) !important;
      }

      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-floating-toolbar"][data-toolbar-appearance="desktop-glass"] button:active svg,
      body:has([data-slot="desktop-workspace"]) [data-slot="drafting-layer-context-menu"][data-toolbar-appearance="desktop-glass"] button:active svg {
        transform: scale(0.84) !important;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button {
        position: relative !important;
        border-radius: 9999px !important;
        overflow: hidden !important;
        transform: none !important;
        translate: none !important;
        scale: none !important;
        rotate: none !important;
        transition: color 180ms ease !important;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button::before {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0);
        transform: scale(1);
        opacity: 0;
        transition: none;
        content: "";
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button > svg {
        position: relative;
        z-index: 1;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button svg {
        transform-origin: center;
        transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease, opacity 180ms ease;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:active svg {
        transform: scale(0.84) !important;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover {
        background: transparent !important;
        color: rgba(255, 255, 255, 0.96) !important;
        transform: none !important;
        translate: none !important;
        scale: none !important;
        rotate: none !important;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:active {
        transform: none !important;
        translate: none !important;
        scale: none !important;
        rotate: none !important;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover::before {
        background: rgba(255, 255, 255, 0.11);
        opacity: 1;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button[aria-pressed="true"] {
        background: transparent !important;
        color: rgba(255, 255, 255, 0.96) !important;
        box-shadow: none !important;
      }

      [data-slot="desktop-workspace"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button[aria-pressed="true"]::before {
        background: rgba(255, 255, 255, 0.16);
        opacity: 1;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-resize-toolbar"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-theme-toggle"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-action-toolbar"],
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

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-context-menu"] {
        background: rgb(255, 255, 255) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-floating-toolbar"],
      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-floating-toolbar"] {
        --drafting-layer-toolbar-button-hover-bg: rgba(15, 23, 42, 0.08);
        --drafting-layer-toolbar-button-hover-text: rgba(15, 23, 42, 0.95);
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-resize-toolbar"] button,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-theme-toggle"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-action-toolbar"] button,
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

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] button:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] label:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-context-menu"] button:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover {
        background: transparent !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-resize-toolbar"] button:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-theme-toggle"]:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-action-toolbar"] button:hover,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-floating-toolbar"] button:hover {
        background-color: rgba(15, 23, 42, 0.08) !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover::before {
        background: rgba(15, 23, 42, 0.08);
        opacity: 1;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button[aria-pressed="true"] {
        background: transparent !important;
        color: rgba(15, 23, 42, 0.95) !important;
        box-shadow: none !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button[aria-pressed="true"]::before {
        background: rgba(15, 23, 42, 0.12);
        opacity: 1;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] div,
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-text-format-toolbar"] input[type="number"] {
        background: rgba(15, 23, 42, 0.06) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="tooltip-content"] {
        border-radius: 9999px !important;
        background: rgba(15, 15, 15, 0.94) !important;
        color: rgba(255, 255, 255, 0.96) !important;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="tooltip-content"] svg {
        fill: rgba(15, 15, 15, 0.94) !important;
        background: rgba(15, 15, 15, 0.94) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover {
        background: transparent !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover::before {
        background: rgba(15, 23, 42, 0.08);
        opacity: 1;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button[aria-pressed="true"] {
        background: transparent !important;
        color: rgba(15, 23, 42, 0.95) !important;
        box-shadow: none !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button[aria-pressed="true"]::before {
        background: rgba(15, 23, 42, 0.12);
        opacity: 1;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="desktop-resize-toolbar"] button[aria-label="Reset canvas size"] {
        border-color: rgba(15, 23, 42, 0.12) !important;
      }

      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-context-menu-separator"],
      [data-slot="desktop-workspace"][data-desktop-theme="light"] [data-slot="drafting-layer-toolbar-separator"] {
        background: rgba(15, 23, 42, 0.12) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-context-menu"] {
        background: rgb(255, 255, 255) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        color: rgba(15, 23, 42, 0.76) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="dark"]) [data-slot="drafting-layer-context-menu"] {
        background: rgb(23, 23, 23) !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
        color: rgba(255, 255, 255, 0.84) !important;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-context-menu"] button {
        color: rgba(15, 23, 42, 0.76) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="dark"]) [data-slot="drafting-layer-context-menu"] button {
        color: rgba(255, 255, 255, 0.84) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-context-menu"] button:hover {
        background-color: rgba(15, 23, 42, 0.08) !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-floating-toolbar"] button:hover {
        background-color: rgba(15, 23, 42, 0.08) !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-floating-toolbar-button"]:hover {
        background-color: rgba(15, 23, 42, 0.08) !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="dark"]) [data-slot="drafting-layer-context-menu"] button:hover {
        background-color: rgba(255, 255, 255, 0.11) !important;
        color: rgba(255, 255, 255, 0.96) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="drafting-layer-context-menu-separator"] {
        background: rgba(15, 23, 42, 0.12) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"],
      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-zoom-popover"] {
        background: rgba(255, 255, 255, 0.86) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        color: rgba(15, 23, 42, 0.82) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"] p,
      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"] span,
      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"] label {
        color: rgba(15, 23, 42, 0.72) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-zoom-popover"] button {
        color: rgba(15, 23, 42, 0.82) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-zoom-popover"] button:hover {
        background: rgba(15, 23, 42, 0.08) !important;
        color: rgba(15, 23, 42, 0.95) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"] p:first-child {
        color: rgba(15, 23, 42, 0.92) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"] label,
      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"] span.rounded-full {
        background: rgba(15, 23, 42, 0.06) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"] input[type="number"] {
        background: rgba(15, 23, 42, 0.07) !important;
        color: rgba(15, 23, 42, 0.9) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="desktop-layer-appearance-popover"] input[type="color"] {
        background: rgba(255, 255, 255, 0.72) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button:hover::before {
        background: rgba(15, 23, 42, 0.08) !important;
      }

      body:has([data-slot="desktop-workspace"][data-desktop-theme="light"]) [data-slot="dashboard-compose-toolbar"][data-toolbar-appearance="desktop-glass"] button[aria-pressed="true"]::before {
        background: rgba(15, 23, 42, 0.12) !important;
      }
    `}</style>
  )
}
