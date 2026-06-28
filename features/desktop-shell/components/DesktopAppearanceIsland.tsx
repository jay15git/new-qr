"use client"

import {
  CircleDotIcon,
  DropletsIcon,
  MoonIcon,
  PencilLineIcon,
  SquareRoundCornerIcon,
} from "lucide-react"
import { type ReactNode } from "react"

import {
  AppearanceBlurControls,
  AppearanceOpacityControls,
  AppearanceRadiusControls,
  AppearanceShadowControls,
  AppearanceStrokeControls,
} from "@/features/desktop-shell/components/AppearancePopoverControls"
import { DesktopScanSafetyPopover } from "@/features/desktop-shell/components/DesktopScanSafetyPopover"
import { DESKTOP_INSPECTOR_FG_SECONDARY } from "@/features/desktop-shell/components/InspectorControls"
import { DesktopUtilityToolbarButton } from "@/features/desktop-shell/components/DesktopUtilityToolbar"
import type { DesktopAppearanceSnapshot } from "@/features/desktop-shell/model/appearance"
import type { ScanSafetyResult } from "@/features/qr-code/scan-safety/types"
import { DEFAULT_SCAN_SAFETY_RESULT } from "@/features/qr-code/scan-safety/types"
import DynamicIsland from "@/components/smoothui/dynamic-island"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import { cn } from "@/lib/utils"

type AppearancePopoverId = "shadow" | "blur" | "stroke" | "opacity" | "radius"

function getAppearancePopoverLabel(
  popoverId: AppearancePopoverId,
  appearance: DesktopAppearanceSnapshot,
): string {
  switch (popoverId) {
    case "shadow":
      return "Shadow settings"
    case "blur":
      return "Blur settings"
    case "stroke":
      return appearance.usesBorderSemantics ? "Border settings" : "Stroke settings"
    case "opacity":
      return "Opacity settings"
    case "radius":
      return "Corner radius settings"
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
    id: "blur",
    renderIcon: () => <DropletsIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceBlurControls appearance={appearance} onPatch={onPatch} />
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
  if (popoverId === "stroke" && !appearance.supportsStroke) {
    return null
  }

  if (popoverId === "radius" && !appearance.supportsCornerRadius) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <DesktopUtilityToolbarButton
          aria-label={label}
          data-slot={`desktop-appearance-${popoverId}-trigger`}
        >
          {renderIcon()}
        </DesktopUtilityToolbarButton>
      </PopoverTrigger>
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
  layerLabel,
  onPatch,
  scanSafetyResult = DEFAULT_SCAN_SAFETY_RESULT,
}: {
  appearance?: DesktopAppearanceSnapshot | null
  layerLabel?: string | null
  onPatch?: (patch: Partial<DraftingCanvasLayer>) => void
  scanSafetyResult?: ScanSafetyResult
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
          {hasAppearance ? (
            <DesktopAppearanceIsland
              appearance={appearance!}
              layerLabel={layerLabel!}
              onPatch={onPatch!}
            />
          ) : null}
          <DesktopScanSafetyPopover result={scanSafetyResult} />
        </div>
      }
      showViewControls={false}
      className={cn(hasAppearance && "min-w-[12rem]")}
    />
  )
}
