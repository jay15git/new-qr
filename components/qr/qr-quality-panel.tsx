"use client"

import { useState, type ComponentType } from "react"
import {
  ChevronDownIcon,
  CircleAlertIcon,
  ScanLineIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  QrQualityReport,
  QrQualitySuggestionPath,
} from "@/components/qr/qr-quality"
import { cn } from "@/lib/utils"

type QrQualityPanelProps = {
  onApplySuggestionPath?: ((path: QrQualitySuggestionPath) => void) | undefined
  report: QrQualityReport
}

const STATUS_ICONS = {
  readable: ShieldCheckIcon,
  risky: TriangleAlertIcon,
  unreadable: CircleAlertIcon,
  unverified: ScanLineIcon,
} satisfies Record<QrQualityReport["status"], ComponentType<{ className?: string }>>

const STATUS_LABELS: Record<QrQualityReport["status"], string> = {
  readable: "Readable",
  risky: "Risky",
  unreadable: "Unreadable",
  unverified: "Unverified",
}

export function QrQualityPanel({
  onApplySuggestionPath,
  report,
}: QrQualityPanelProps) {
  const [isOpen, setIsOpen] = useState(report.issues.length > 0)
  const StatusIcon = STATUS_ICONS[report.status]

  return (
    <Collapsible
      data-slot="dashboard-quality-panel"
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full max-w-sm rounded-[1.6rem] border border-slate-300/80 bg-white/90 shadow-[0_20px_44px_-32px_rgba(15,23,42,0.9)] backdrop-blur"
    >
      <div className="flex items-start gap-3 px-4 py-4">
        <div
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
            report.status === "readable" && "bg-emerald-100 text-emerald-700",
            report.status === "risky" && "bg-amber-100 text-amber-700",
            report.status === "unreadable" && "bg-rose-100 text-rose-700",
            report.status === "unverified" && "bg-slate-200 text-slate-700",
          )}
        >
          <StatusIcon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">Quality check</p>
            <Badge
              variant="outline"
              className={cn(
                "border-slate-300/90 bg-white/70 text-[0.68rem] tracking-[0.16em] uppercase",
                report.status === "readable" && "text-emerald-700",
                report.status === "risky" && "text-amber-700",
                report.status === "unreadable" && "text-rose-700",
                report.status === "unverified" && "text-slate-700",
              )}
            >
              {STATUS_LABELS[report.status]}
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-300/90 bg-white/70 text-[0.68rem] tracking-[0.16em] uppercase text-slate-600"
            >
              {report.blockingIssueCount} blocking / {report.warningIssueCount} warnings
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{report.summary}</p>
        </div>
      </div>

      <div className="border-t border-slate-200/80 px-3 py-3">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between rounded-[1.15rem] px-3 text-sm text-slate-700 hover:bg-slate-100/80"
          >
            <span>
              {report.issues.length === 0
                ? "No suggestions right now"
                : `${report.issues.length} suggestion${report.issues.length === 1 ? "" : "s"}`}
            </span>
            <ChevronDownIcon
              className={cn("size-4 transition-transform", isOpen && "rotate-180")}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
          <div className="mt-3 flex flex-col gap-3 px-1 pb-1">
            {report.issues.length === 0 ? (
              <p className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50/90 px-3 py-3 text-sm text-slate-600">
                The current dashboard scene does not need any QR readability changes.
              </p>
            ) : (
              report.issues.map((issue) => (
                <article
                  key={issue.id}
                  className="rounded-[1.2rem] border border-slate-200/90 bg-slate-50/90 px-3 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-slate-300/90 bg-white/80 text-[0.64rem] tracking-[0.14em] uppercase",
                        issue.severity === "error" ? "text-rose-700" : "text-amber-700",
                      )}
                    >
                      {issue.severity === "error" ? "Blocking" : "Warning"}
                    </Badge>
                    <span className="text-[0.68rem] font-medium tracking-[0.14em] text-slate-500 uppercase">
                      {issue.scope}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{issue.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{issue.detail}</p>

                  {issue.paths.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-2.5">
                      {issue.paths.map((path) => (
                        <section
                          key={path.id}
                          className={cn(
                            "rounded-[1rem] border px-3 py-3",
                            path.recommended && issue.paths.length > 1
                              ? "border-emerald-300/80 bg-emerald-50/80"
                              : "border-slate-200/90 bg-white/90",
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-slate-900">
                                  {path.title}
                                </p>
                                {path.recommended && issue.paths.length > 1 ? (
                                  <Badge
                                    variant="outline"
                                    className="border-emerald-300/90 bg-white/80 text-[0.64rem] tracking-[0.14em] uppercase text-emerald-700"
                                  >
                                    Recommended
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {path.detail}
                              </p>
                            </div>

                            <Button
                              aria-label={`Apply ${path.title}`}
                              variant="outline"
                              className="h-8 rounded-full border-slate-300/90 bg-white px-3 text-xs text-slate-700 hover:bg-slate-100"
                              onClick={() => onApplySuggestionPath?.(path)}
                            >
                              Apply
                            </Button>
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
