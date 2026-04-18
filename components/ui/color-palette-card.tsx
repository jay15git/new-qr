import * as React from "react"

import { cn } from "@/lib/utils"

export interface ColorPaletteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  colors: string[]
  statsText: string
  icon?: React.ReactNode
}

const ColorPaletteCard = React.forwardRef<HTMLDivElement, ColorPaletteCardProps>(
  ({ className, colors, statsText, icon, ...props }, ref) => {
    const palette = colors.map((color, index) => {
      const normalizedColor = color.startsWith("#") ? color : `#${color}`

      return {
        key: `${normalizedColor}-${index}`,
        label: normalizedColor.toUpperCase(),
        value: normalizedColor,
      }
    })

    const defaultIcon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={18}
        height={18}
        viewBox="0 0 18 18"
        className="fill-current"
        aria-hidden="true"
      >
        <path d="M4 7.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S5.5 9.83 5.5 9 4.83 7.5 4 7.5zm10 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S9.83 7.5 9 7.5z" />
      </svg>
    )

    return (
      <div
        data-slot="color-palette-card"
        ref={ref}
        className={cn(
          "flex h-[200px] w-full max-w-[350px] flex-col overflow-hidden rounded-xl bg-card font-sans shadow-lg",
          className,
        )}
        {...props}
      >
        <div className="flex h-[86%] w-full">
          {palette.map((color) => (
            <div
              key={color.key}
              className="group flex h-full flex-1 items-center justify-center text-white transition-[flex] duration-200 ease-in-out hover:flex-[2]"
              style={{ backgroundColor: color.value }}
            >
              <span className="opacity-0 font-mono text-sm font-medium tracking-[0.16em] transition-opacity duration-200 group-hover:opacity-100">
                {color.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex h-[14%] w-full items-center justify-between bg-card px-6 text-muted-foreground">
          <span className="text-sm">{statsText}</span>
          {icon || defaultIcon}
        </div>
      </div>
    )
  },
)
ColorPaletteCard.displayName = "ColorPaletteCard"

export { ColorPaletteCard }
