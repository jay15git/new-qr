"use client"

import {
  CircleDotIcon,
  DropletsIcon,
  MoonIcon,
  PencilLineIcon,
  SquareRoundCornerIcon,
} from "lucide-react"
import { type CSSProperties, type ReactNode } from "react"

import {
  AppearanceBlurControls,
  AppearanceOpacityControls,
  AppearanceRadiusControls,
  AppearanceShadowControls,
  AppearanceStrokeControls,
} from "@/features/desktop-shell/components/AppearancePopoverControls"
import { DesktopUtilityToolbarButton } from "@/features/desktop-shell/components/DesktopUtilityToolbar"
import type { DesktopAppearanceSnapshot } from "@/features/desktop-shell/model/appearance"
import DynamicIsland from "@/components/smoothui/dynamic-island"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import { cn } from "@/lib/utils"

const DESKTOP_APPEARANCE_POPOVER_STYLE = {
  "--desktop-inspector-field-bg": "#141414",
  "--desktop-inspector-section-bg": "#181818",
} as CSSProperties

type AppearancePopoverId = "shadow" | "blur" | "stroke" | "opacity" | "radius"

const APPEARANCE_POPOVERS: Array<{
  id: AppearancePopoverId
  label: string
  renderIcon: () => ReactNode
  renderControls: (props: {
    appearance: DesktopAppearanceSnapshot
    onPatch: (patch: Partial<DraftingCanvasLayer>) => void
  }) => ReactNode
}> = [
  {
    id: "shadow",
    label: "Shadow settings",
    renderIcon: () => <MoonIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceShadowControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "blur",
    label: "Blur settings",
    renderIcon: () => <DropletsIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceBlurControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "stroke",
    label: "Stroke settings",
    renderIcon: () => <PencilLineIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceStrokeControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "opacity",
    label: "Opacity settings",
    renderIcon: () => <CircleDotIcon className="size-3.5" />,
    renderControls: ({ appearance, onPatch }) => (
      <AppearanceOpacityControls appearance={appearance} onPatch={onPatch} />
    ),
  },
  {
    id: "radius",
    label: "Corner radius settings",
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
        className="z-[20000] w-[min(18rem,calc(100vw-1rem))] overflow-hidden rounded-[16px] border border-[#242424] bg-[#0a0a0a] p-0 text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
        style={DESKTOP_APPEARANCE_POPOVER_STYLE}
      >
        <div className="max-h-[min(28rem,calc(100dvh-8rem))] overflow-y-auto p-3">
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
      <div className="hidden min-w-0 max-w-[7rem] truncate px-1 text-[11px] font-semibold text-white/72 sm:block">
        {layerLabel}
      </div>
      {APPEARANCE_POPOVERS.map((popover) => (
        <DesktopAppearancePopover
          key={popover.id}
          appearance={appearance}
          label={popover.label}
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
}: {
  appearance?: DesktopAppearanceSnapshot | null
  layerLabel?: string | null
  onPatch?: (patch: Partial<DraftingCanvasLayer>) => void
}) {
  const hasAppearance = Boolean(appearance && layerLabel && onPatch)

  return (
    <DynamicIsland
      appearance="desktop-glass"
      idleContent={
        hasAppearance ? (
          <DesktopAppearanceIsland
            appearance={appearance!}
            layerLabel={layerLabel!}
            onPatch={onPatch!}
          />
        ) : undefined
      }
      showViewControls={false}
      className={cn(hasAppearance && "min-w-[12rem]")}
    />
  )
}
