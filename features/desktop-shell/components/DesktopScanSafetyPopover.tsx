"use client"

import { ShieldCheckIcon } from "lucide-react"

import { DesktopUtilityToolbarButton } from "@/features/desktop-shell/components/DesktopUtilityToolbar"
import {
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_SECTION_HEADING_CLASS,
} from "@/features/desktop-shell/components/InspectorControls"
import type { ScanSafetyResult } from "@/features/qr-code/scan-safety/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function getStatusPillClass(status: ScanSafetyResult["status"]) {
  switch (status) {
    case "invalid":
      return "bg-red-400/15 text-red-200"
    case "pending":
      return "bg-amber-400/15 text-amber-200"
    case "skipped":
      return "bg-white/10 text-white/70"
    default:
      return "bg-emerald-400/15 text-emerald-200"
  }
}

function truncateText(value: string, maxLength = 80): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}…`
}

export function DesktopScanSafetyPopover({ result }: { result: ScanSafetyResult }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <DesktopUtilityToolbarButton
          aria-label={`Scan safety: ${result.summary}`}
          data-slot="desktop-scan-safety-trigger"
        >
          <ShieldCheckIcon />
        </DesktopUtilityToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="z-[20000] w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-[16px] border border-[var(--desktop-appearance-popover-border)] bg-[var(--desktop-appearance-popover-bg)] p-0 text-[var(--desktop-inspector-fg-secondary)] shadow-[var(--desktop-appearance-popover-shadow)] backdrop-blur-xl"
        data-slot="desktop-scan-safety-popover"
        sideOffset={12}
      >
        <div className="max-h-[min(28rem,calc(100dvh-8rem))] overflow-y-auto p-3">
          <div className="mb-3">
            <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Scan Safety</p>
            <p className={cn("mt-1 text-xs", DESKTOP_INSPECTOR_FG_MUTED)}>
              Decode check on the current QR preview.
            </p>
          </div>

          <div
            className={cn(
              "mb-3 rounded-xl border border-white/10 px-3 py-2 text-xs",
              getStatusPillClass(result.status),
            )}
          >
            {result.summary}
          </div>

          {result.status === "valid" ? (
            <p className={cn("px-1 text-xs", DESKTOP_INSPECTOR_FG_MUTED)}>
              Preview decodes to the encoded content.
            </p>
          ) : null}

          {result.status === "pending" ? (
            <p className={cn("px-1 text-xs", DESKTOP_INSPECTOR_FG_MUTED)}>
              Checking scannability…
            </p>
          ) : null}

          {result.status === "skipped" ? (
            <p className={cn("px-1 text-xs", DESKTOP_INSPECTOR_FG_MUTED)}>
              Add content to check scannability.
            </p>
          ) : null}

          {result.status === "invalid" ? (
            <div className={cn("space-y-2 px-1 text-xs", DESKTOP_INSPECTOR_FG_MUTED)}>
              <p>The preview could not be decoded to the expected content.</p>
              {result.expectedText ? (
                <p>
                  <span className="font-semibold text-white/80">Expected:</span>{" "}
                  {truncateText(result.expectedText)}
                </p>
              ) : null}
              {result.decodedText ? (
                <p>
                  <span className="font-semibold text-white/80">Decoded:</span>{" "}
                  {truncateText(result.decodedText)}
                </p>
              ) : (
                <p>
                  <span className="font-semibold text-white/80">Decoded:</span> nothing
                </p>
              )}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
