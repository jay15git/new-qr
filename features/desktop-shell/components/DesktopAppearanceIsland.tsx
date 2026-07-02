"use client"

import {
  CircleDotIcon,
  DropletsIcon,
  MoonIcon,
  PencilLineIcon,
  Redo2Icon,
  RotateCcwIcon,
  SquareRoundCornerIcon,
  SquareIcon,
  Undo2Icon,
} from "lucide-react"
import { type ReactNode } from "react"

import {
  AppearanceFilterControls,
  AppearanceOpacityControls,
  AppearanceOutlineControls,
  AppearanceRadiusControls,
  AppearanceShadowControls,
  AppearanceStrokeControls,
} from "@/features/desktop-shell/components/AppearancePopoverControls"
import { DesktopScanSafetyPopover } from "@/features/desktop-shell/components/DesktopScanSafetyPopover"
import {
  DesktopKeyboardShortcutsTrigger,
  DesktopThemeToggleButton,
} from "@/features/desktop-shell/components/DesktopChromeControls"
import type { DesktopThemeMode } from "@/features/desktop-shell/components/FloatingToolbar"
import { DESKTOP_INSPECTOR_FG_SECONDARY } from "@/features/desktop-shell/components/InspectorControls"
import { DesktopUtilityToolbarButton } from "@/features/desktop-shell/components/DesktopUtilityToolbar"
import type { DesktopAppearanceSnapshot } from "@/features/desktop-shell/model/appearance"
import type { ScanSafetyResult } from "@/features/qr-code/scan-safety/types"
import { DEFAULT_SCAN_SAFETY_RESULT } from "@/features/qr-code/scan-safety/types"
import DynamicIsland from "@/components/smoothui/dynamic-island"
import { DesktopTooltip } from "@/features/desktop-shell/components/DesktopTooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import { cn } from "@/lib/utils"

type AppearancePopoverId = "shadow" | "stroke" | "opacity" | "radius" | "outline" | "filters"

function getAppearancePopoverLabel(
  popoverId: AppearancePopoverId,
  appearance: DesktopAppearanceSnapshot,
): string {
  switch (popoverId) {
    case "shadow":
      return "Shadow settings"
    case "stroke":
      return appearance.usesBorderSemantics ? "Border settings" : "Stroke settings"
    case "opacity":
      return "Opacity settings"
    case "radius":
      return "Corner radius settings"
    case "outline":
      return "Outline settings"
    case "filters":
      return "Filter settings"
  }
}

const APPEARANCE_POPOVERS: Array<{
  id: AppearancePopoverId
  renderIcon: () => ReactNode
  renderControls: (props: {
    appearance: DesktopAppearanceSnapshot
    onPatch: (patch: Partial<DraftingCanvasLayer>) => void
  }) => ReactNode
}> = [
  {
    id: "shadow",
    renderIcon: () => <MoonIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceShadowControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "filters",
    renderIcon: () => <DropletsIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceFilterControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "stroke",
    renderIcon: () => <PencilLineIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceStrokeControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "outline",
    renderIcon: () => <SquareIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceOutlineControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "opacity",
    renderIcon: () => <CircleDotIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceOpacityControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "radius",
    renderIcon: () => <SquareRoundCornerIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceRadiusControls appearance={appearance} onPatch={onPatch} />
    ),
  },
]

function DesktopAppearancePopover({
  appearance,
  label,
  onPatch,
  popoverId,
  renderControls,
  renderIcon,
}: {
  appearance: DesktopAppearanceSnapshot
  label: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
  popoverId: AppearancePopoverId
  renderControls: (props: {
    appearance: DesktopAppearanceSnapshot
    onPatch: (patch: Partial<DraftingCanvasLayer>) => void
  }) => ReactNode
  renderIcon: () => ReactNode
}) {
  if (popoverId === "outline" && !appearance.supportsOutline) {
    return null
  }

  if (popoverId === "stroke" && !appearance.supportsStroke) {
    return null
  }

  if (popoverId === "radius" && !appearance.supportsCornerRadius) {
    return null
  }

  return (
    <Popover>
      <DesktopTooltip content={label} side="bottom" sideOffset={10}>
        <PopoverTrigger asChild>
          <DesktopUtilityToolbarButton
            aria-label={label}
            data-slot={`desktop-appearance-${popoverId}-trigger`}
          >
            {renderIcon()}
          </DesktopUtilityToolbarButton>
        </PopoverTrigger>
      </DesktopTooltip>
      <PopoverContent
        align="center"
        data-slot={`desktop-appearance-${popoverId}-popover`}
        sideOffset={12}
        className="z-[20000] w-[min(18rem,calc(100vw-1rem))] overflow-hidden rounded-[16px] border border-[var(--desktop-appearance-popover-border)] bg-[var(--desktop-appearance-popover-bg)] p-0 text-[var(--desktop-inspector-fg-secondary)] shadow-[var(--desktop-appearance-popover-shadow)] backdrop-blur-xl"
      >
        <div
          className="max-h-[min(28rem,calc(100dvh-8rem))] overflow-y-auto p-3"
          data-slot="desktop-floating-inspector"
        >
          {renderControls({ appearance, onPatch })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DesktopDynamicIslandDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-0.5 h-6 w-px shrink-0 bg-[var(--desktop-glass-border)]"
    />
  )
}

export function DesktopHistoryActionButtons({
  canRedo,
  canUndo,
  onRedo,
  onResetDefaults,
  onUndo,
}: {
  canRedo?: boolean
  canUndo?: boolean
  onRedo?: () => void
  onResetDefaults?: () => void
  onUndo?: () => void
}) {
  return (
    <div
      className="flex min-w-0 items-center gap-0.5"
      data-slot="desktop-history-actions"
    >
      <DesktopTooltip content="Reset defaults" side="bottom" sideOffset={10}>
        <DesktopUtilityToolbarButton
          aria-label="Reset defaults"
          disabled={!onResetDefaults}
          onClick={onResetDefaults}
        >
          <RotateCcwIcon className="size-3.5" />
        </DesktopUtilityToolbarButton>
      </DesktopTooltip>
      <DesktopTooltip content="Undo" side="bottom" sideOffset={10}>
        <DesktopUtilityToolbarButton
          aria-label="Undo"
          disabled={!canUndo || !onUndo}
          onClick={onUndo}
        >
          <Undo2Icon className="size-3.5" />
        </DesktopUtilityToolbarButton>
      </DesktopTooltip>
      <DesktopTooltip content="Redo" side="bottom" sideOffset={10}>
        <DesktopUtilityToolbarButton
          aria-label="Redo"
          disabled={!canRedo || !onRedo}
          onClick={onRedo}
        >
          <Redo2Icon className="size-3.5" />
        </DesktopUtilityToolbarButton>
      </DesktopTooltip>
    </div>
  )
}

export function DesktopAppearanceIsland({
  appearance,
  layerLabel,
  onPatch,
}: {
  appearance: DesktopAppearanceSnapshot
  layerLabel: string
  onPatch: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  return (
    <div
      className="flex min-w-0 items-center gap-1 px-1"
      data-slot="desktop-appearance-island"
    >
      <div
        className={cn(
          "hidden min-w-0 max-w-[7rem] truncate px-1 text-[11px] font-semibold sm:block",
          DESKTOP_INSPECTOR_FG_SECONDARY,
        )}
      >
        {layerLabel}
      </div>
      {APPEARANCE_POPOVERS.map((popover) => (
        <DesktopAppearancePopover
          key={popover.id}
          appearance={appearance}
          label={getAppearancePopoverLabel(popover.id, appearance)}
          onPatch={onPatch}
          popoverId={popover.id}
          renderControls={popover.renderControls}
          renderIcon={popover.renderIcon}
        />
      ))}
    </div>
  )
}

export function DesktopDynamicIslandChrome({
  appearance,
  canRedo,
  canUndo,
  layerLabel,
  onPatch,
  onRedo,
  onResetDefaults,
  onThemeChange,
  onUndo,
  scanSafetyResult = DEFAULT_SCAN_SAFETY_RESULT,
  theme = "dark",
}: {
  appearance?: DesktopAppearanceSnapshot | null
  canRedo?: boolean
  canUndo?: boolean
  layerLabel?: string | null
  onPatch?: (patch: Partial<DraftingCanvasLayer>) => void
  onRedo?: () => void
  onResetDefaults?: () => void
  onThemeChange?: (theme: DesktopThemeMode) => void
  onUndo?: () => void
  scanSafetyResult?: ScanSafetyResult
  theme?: DesktopThemeMode
}) {
  const hasAppearance = Boolean(appearance && layerLabel && onPatch)

  return (
    <DynamicIsland
      appearance="desktop-glass"
      idleContent={
        <div
          className="flex min-w-0 items-center gap-1 px-1"
          data-slot="desktop-dynamic-island-content"
        >
          <DesktopHistoryActionButtons
            canRedo={canRedo}
            canUndo={canUndo}
            onRedo={onRedo}
            onResetDefaults={onResetDefaults}
            onUndo={onUndo}
          />
          {hasAppearance ? (
            <>
              <DesktopDynamicIslandDivider />
              <DesktopAppearanceIsland
                appearance={appearance!}
                layerLabel={layerLabel!}
                onPatch={onPatch!}
              />
            </>
          ) : null}
          <DesktopScanSafetyPopover result={scanSafetyResult} />
          <DesktopDynamicIslandDivider />
          <DesktopKeyboardShortcutsTrigger popoverSide="bottom" variant="glass" />
          {onThemeChange ? (
            <DesktopThemeToggleButton
              theme={theme}
              onToggle={() => onThemeChange(theme === "light" ? "dark" : "light")}
              variant="glass"
            />
          ) : null}
        </div>
      }
      showViewControls={false}
      className={cn(hasAppearance && "min-w-[12rem]")}
    />
  )
}
