import { DownloadIcon, RefreshCcwIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SecondaryButton } from "@/components/ui/secondary-button"
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
}: QrPreviewCardProps) {
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

  const previewStage = (
    <div className={cn("rounded-[calc(var(--radius-xl)+4px)] border border-border/70 bg-muted/30 p-4")}>
      <div
        ref={previewRef}
        className={cn(
          "flex aspect-square items-center justify-center rounded-[calc(var(--radius-xl)-2px)] bg-background p-4 shadow-inner [&_canvas]:h-full [&_canvas]:w-full [&_canvas]:max-w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-full",
        )}
      />
    </div>
  )

  return (
    <Card className="w-full bg-card/95 shadow-sm backdrop-blur" size="default">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">
              Live preview
            </CardTitle>
            <CardDescription>
              Every change is applied directly to the same QR instance for fast styling feedback.
            </CardDescription>
          </div>
          <Badge variant="secondary">qr-code-styling</Badge>
        </div>
        {previewBadges}
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {previewStage}

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

        <div className="rounded-[var(--radius-xl)] border border-border/70 bg-muted/20 p-4">
          <p className="break-all text-sm text-muted-foreground">
            {state.data.trim() || "Add text or a URL to begin."}
          </p>
        </div>

        {errorMessage ? (
          <p aria-live="polite" role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t border-border/70 pt-6">
        <p className="w-full text-sm text-muted-foreground">
          Export format is chosen per button. The preview renderer badge above does
          not change the downloaded file type.
        </p>
        <div className="flex w-full flex-wrap gap-2">
          {DOWNLOAD_EXTENSIONS.map((extension) => (
            <SecondaryButton
              key={extension}
              disabled={!canDownload}
              onClick={() => {
                void onDownload(extension)
              }}
            >
              <DownloadIcon data-icon="inline-start" />
              {extension.toUpperCase()}
            </SecondaryButton>
          ))}
        </div>
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
