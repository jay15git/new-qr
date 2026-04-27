import * as React from "react"

import { cn } from "@/lib/utils"

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

export const SecondaryButton = React.forwardRef<
  HTMLButtonElement,
  SecondaryButtonProps
>(({ className, selected = false, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      data-slot="secondary-button"
      data-selected={selected}
      className={cn(
        // Layout
        "group inline-flex shrink-0 items-center justify-center gap-2",
        "h-10 rounded-md px-4",
        "text-sm font-medium whitespace-nowrap",
        // Interaction
        "transition-all duration-150 ease-out",
        "outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-45",
        // Icon sizing
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Light mode — default
        "bg-[#00000003] text-[#00000073]",
        "shadow-[0_0_18px_2px_#00000010,0_3px_8px_1px_#00000009]",
        // Light mode — hover
        "hover:-translate-y-px hover:bg-[#00000006] hover:text-[#000000A6]",
        "hover:shadow-[0_0_24px_3px_#00000030,0_4px_10px_1px_#00000018]",
        // Light mode — active/pressed
        "active:translate-y-0 active:bg-[#00000007] active:text-[#262626]",
        "active:shadow-[0_0_14px_1px_#00000012,0_2px_6px_#0000000C]",
        // Light mode — selected
        "data-[selected=true]:bg-[#111111] data-[selected=true]:text-white",
        "data-[selected=true]:shadow-[0_0_24px_3px_#00000030,0_4px_10px_1px_#00000018]",
        // Light mode — selected hover
        "data-[selected=true]:hover:-translate-y-px",
        "data-[selected=true]:hover:shadow-[0_0_28px_4px_#0000001A,0_5px_12px_1px_#00000010]",
        // Dark mode — default
        "dark:bg-[#FFFFFF08] dark:text-[#A8B0BD]",
        "dark:shadow-[0_0_18px_2px_#00000010,0_3px_8px_1px_#00000009]",
        // Dark mode — hover
        "dark:hover:-translate-y-px dark:hover:bg-[#FFFFFF0D] dark:hover:text-[#C8D0DC]",
        "dark:hover:shadow-[0_0_24px_3px_#00000016,0_4px_10px_1px_#0000000E]",
        // Dark mode — active/pressed
        "dark:active:translate-y-0 dark:active:bg-[#FFFFFF14] dark:active:text-[#DFE5EE]",
        "dark:active:shadow-[0_0_14px_1px_#00000012,0_2px_6px_#0000000C]",
        // Dark mode — selected
        "dark:data-[selected=true]:bg-[#F6F8FB] dark:data-[selected=true]:text-[#101216]",
        "dark:data-[selected=true]:shadow-[0_0_24px_3px_#00000016,0_4px_10px_1px_#0000000E]",
        // Dark mode — selected hover
        "dark:data-[selected=true]:hover:-translate-y-px",
        "dark:data-[selected=true]:hover:shadow-[0_0_28px_4px_#0000001A,0_5px_12px_1px_#00000010]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})
SecondaryButton.displayName = "SecondaryButton"
