import Link from "next/link"

import {
  DESKTOP_INSPECTOR_RESET_CLASS,
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_SECONDARY,
} from "@/features/desktop-shell/components/InspectorControls"
import { cn } from "@/lib/utils"

type LibraryEmptyStateProps = {
  title: string
  description: string
  actionLabel: string
  actionHref?: string
}

export function LibraryEmptyState({
  title,
  description,
  actionLabel,
  actionHref = "/",
}: LibraryEmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[var(--desktop-inspector-control-border-hover)] bg-[var(--desktop-inspector-field-bg)] px-6 py-10 text-center">
      <div className="space-y-1">
        <h2 className={cn("drafting-type-control-label font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
          {title}
        </h2>
        <p className={cn("drafting-type-caption max-w-sm", DESKTOP_INSPECTOR_FG_MUTED)}>{description}</p>
      </div>
      <Link href={actionHref} className={DESKTOP_INSPECTOR_RESET_CLASS}>
        {actionLabel}
      </Link>
    </div>
  )
}
