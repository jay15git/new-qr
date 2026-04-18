import { DownloadIcon, RefreshCcwIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  DOWNLOAD_EXTENSIONS,
  type QrStudioState,
} from "@/components/qr/qr-studio-state"
import { cn } from "@/lib/utils"

type QrPreviewCardProps = {
  canDownload: boolean
  downloadName: string
  errorMessage: string | null
  onDownload: (
    extension: (typeof DOWNLOAD_EXTENSIONS)[number],
  ) => void | Promise<void>
  onDownloadNameChange: (value: string) => void
  onReset: () => void
  previewRef: React.RefObject<HTMLDivElement | null>
  state: QrStudioState
  variant?: "settings" | "dashboard"
}

export function QrPreviewCard({
  canDownload,
  downloadName,
  errorMessage,
  onDownload,
  onDownloadNameChange,
  onReset,
  previewRef,
  state,
  variant = "settings",
}: QrPreviewCardProps) {
  const isDashboard = variant === "dashboard"
  const previewBadges = (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="outline"
        className="border-white/8 bg-white/[0.04] text-foreground/70"
      >
        {state.type.toUpperCase()}
      </Badge>
      <Badge
        variant="outline"
        className="border-white/8 bg-white/[0.04] text-foreground/70"
      >
        {state.width} x {state.height}
      </Badge>
      <Badge
        variant="outline"
        className="border-white/8 bg-white/[0.04] text-foreground/70"
      >
        EC {state.qrOptions.errorCorrectionLevel}
      </Badge>
    </div>
  )

  if (isDashboard) {
    return (
      <div
        data-slot="dashboard-preview-shell"
        className="flex h-full min-h-0 flex-col gap-6 px-5 py-6 sm:px-6 lg:px-8 lg:py-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[0.68rem] font-medium tracking-[0.22em] text-foreground/40 uppercase">
              Preview
            </p>
            <h2 className="font-heading text-xl font-medium tracking-[-0.04em] text-foreground">
              Export stage
            </h2>
          </div>
          {previewBadges}
        </div>

        <div
          data-slot="dashboard-preview-canvas"
          className="flex min-h-0 flex-1 items-center justify-center"
        >
          <div
            ref={previewRef}
            data-slot="dashboard-proof-stage"
            className="flex aspect-square w-full max-w-[34rem] max-h-[calc(100svh-19rem)] items-center justify-center rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,oklch(0.96_0.006_90),oklch(0.91_0.012_90))] p-5 shadow-[0_24px_60px_-44px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.78)] [&_canvas]:h-full [&_canvas]:w-full [&_canvas]:max-w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-full lg:max-h-[calc(100svh-21rem)]"
          />
        </div>

        <div
          data-slot="dashboard-preview-footer"
          className="flex flex-col gap-4 border-t border-white/6 pt-5"
        >
          {errorMessage ? (
            <p aria-live="polite" role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex w-full justify-end">
            <Button
              variant="ghost"
              className="rounded-full text-foreground/58 hover:bg-white/[0.04] hover:text-foreground"
              onClick={onReset}
            >
              <RefreshCcwIcon data-icon="inline-start" />
              Reset defaults
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const previewStage = (
    <div
      className={cn(
        "rounded-[calc(var(--radius-xl)+4px)] border border-border/70 bg-muted/30",
        isDashboard
          ? "bg-[radial-gradient(circle_at_top,oklch(0.32_0.03_66/0.28),transparent_58%),color-mix(in_oklch,var(--color-muted)_72%,transparent)] p-4 xl:p-6"
          : "p-4",
      )}
    >
      <div
        ref={previewRef}
        data-slot={isDashboard ? "proof-stage" : undefined}
        className={cn(
          "flex aspect-square items-center justify-center rounded-[calc(var(--radius-xl)-2px)] bg-background shadow-inner [&_canvas]:h-full [&_canvas]:w-full [&_canvas]:max-w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-full",
          isDashboard
            ? "mx-auto w-full max-w-full border border-black/8 bg-[linear-gradient(180deg,oklch(0.97_0.006_95),oklch(0.92_0.012_95))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] lg:size-[clamp(23rem,34vw,34rem)]"
            : "p-4",
        )}
      />
    </div>
  )

  const filenameField = (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="download-name">Export filename</FieldLabel>
        <Input
          id="download-name"
          value={downloadName}
          onChange={(event) => onDownloadNameChange(event.target.value)}
          placeholder="new-qr"
        />
      </Field>
    </FieldGroup>
  )

  const encodedContent = isDashboard ? (
    <div className="rounded-[var(--radius-xl)] border border-border/70 bg-muted/20 px-3 py-2">
      <p className="break-all font-mono text-xs text-muted-foreground">
        {state.data.trim() || "Add text or a URL to begin."}
      </p>
    </div>
  ) : (
    <div className="rounded-[var(--radius-xl)] border border-border/70 bg-muted/20 p-4">
      <p className="break-all text-sm text-muted-foreground">
        {state.data.trim() || "Add text or a URL to begin."}
      </p>
    </div>
  )

  const exportButtons = (
    <div className="flex w-full flex-wrap gap-2">
      {DOWNLOAD_EXTENSIONS.map((extension) => (
        <Button
          key={extension}
          disabled={!canDownload}
          variant={extension === state.type ? "default" : "outline"}
          onClick={() => {
            void onDownload(extension)
          }}
        >
          <DownloadIcon data-icon="inline-start" />
          {extension.toUpperCase()}
        </Button>
      ))}
    </div>
  )

  return (
    <Card
      className={cn(
        "w-full bg-card/95 shadow-sm backdrop-blur",
        isDashboard &&
          "rounded-[2rem] border border-border/70 bg-[color-mix(in_oklch,var(--color-card)_90%,transparent)] shadow-[0_28px_90px_-48px_rgba(0,0,0,0.85)] xl:min-h-[calc(100svh-13rem)]",
      )}
      size={isDashboard ? "sm" : "default"}
    >
      <CardHeader className={cn(isDashboard ? "gap-4" : "gap-4")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle
              as={isDashboard ? "h2" : "div"}
              className={cn(isDashboard ? "text-xl" : "text-xl")}
            >
              {isDashboard ? "Preview stage" : "Live preview"}
            </CardTitle>
            {!isDashboard ? (
              <CardDescription>
                Every change is applied directly to the same QR instance for fast styling feedback.
              </CardDescription>
            ) : null}
          </div>
          {!isDashboard ? <Badge variant="secondary">qr-code-styling</Badge> : null}
        </div>
        {previewBadges}
      </CardHeader>
      <CardContent
        className={cn("flex flex-col", isDashboard ? "min-h-0 flex-1 gap-5" : "gap-5")}
      >
        {previewStage}
        {filenameField}
        {encodedContent}

        {errorMessage ? (
          <p aria-live="polite" role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </CardContent>
      <CardFooter
        className={cn(
          "flex flex-col gap-4 border-t border-border/70",
          isDashboard ? "pt-4" : "pt-6",
        )}
      >
        {exportButtons}
        <Separator />
        <div className="flex w-full justify-end">
          <Button variant="ghost" onClick={onReset}>
            <RefreshCcwIcon data-icon="inline-start" />
            Reset defaults
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
