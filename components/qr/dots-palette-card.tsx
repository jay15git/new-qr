"use client"

import { Button } from "@/components/ui/button"
import { ColorPaletteCard } from "@/components/ui/color-palette-card"
import { cn } from "@/lib/utils"

export function DotsPaletteCard({
  className,
  descriptionClassName,
  isDashboardMode,
  onApply,
  palette,
  title = "Palette preview",
}: {
  className?: string
  descriptionClassName?: string
  isDashboardMode?: boolean
  onApply?: () => void
  palette: string[]
  title?: string
}) {
  const paletteLabel = `${palette.length} ${palette.length === 1 ? "swatch" : "swatches"}`
  const cardColors = palette.map((color) => color.replace(/^#/, ""))

  return (
    <div
      data-slot="dots-palette-card"
      className={cn(
        isDashboardMode
          ? "border-0 bg-transparent p-0"
          : "rounded-[var(--radius-xl)] border border-border/70 bg-muted/20 p-4",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>
          Dot coloring rotates through the active palette in a fixed order.
        </p>
      </div>

      <div className="mt-4 flex min-h-[232px] w-full items-center justify-center">
        <ColorPaletteCard colors={cardColors} statsText={paletteLabel} />
      </div>

      {onApply ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full rounded-full border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          onClick={onApply}
        >
          Use palette
        </Button>
      ) : null}
    </div>
  )
}
