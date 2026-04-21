"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CardSidebarItem = {
  icon: ReactNode
  label?: string
  selected?: boolean
}

type CardSidebarProps = {
  className?: string
  showLeftCorners?: boolean
  showRightCorners?: boolean
  hideLeftBorder?: boolean
  hideRightBorder?: boolean
  icon?: ReactNode
  label?: string
  selected?: boolean
  items?: CardSidebarItem[]
}

function CornerMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("absolute size-4 text-black/35", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function CardSidebar({
  className,
  showLeftCorners = true,
  showRightCorners = true,
  hideLeftBorder = false,
  hideRightBorder = false,
  icon,
  label,
  selected = false,
  items,
}: CardSidebarProps) {
  const initialSelectedIndex =
    items?.findIndex((item) => item.selected) ??
    ((icon || label) && selected ? 0 : -1)
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)

  const renderedItems =
    items && items.length > 0
      ? items
      : icon || label
        ? [{ icon, label, selected }]
        : []

  return (
    <div className={cn("relative h-full bg-white", className)}>
      {showLeftCorners ? (
        <CornerMark className="left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
      ) : null}
      {showRightCorners ? (
        <CornerMark className="right-0 top-0 translate-x-1/2 -translate-y-1/2" />
      ) : null}
      {showLeftCorners ? (
        <CornerMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
      ) : null}
      {showRightCorners ? (
        <CornerMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      ) : null}

      <div
        className={cn(
          "flex h-full flex-col border border-dashed border-black/12 bg-white px-3 py-4",
          hideLeftBorder && "border-l-0",
          hideRightBorder && "border-r-0"
        )}
      >
        {renderedItems.length > 0 ? (
          <div className="flex flex-col items-center gap-5 pt-4">
            {renderedItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3"
              >
                {item.icon ? (
                  <Button
                    aria-pressed={selectedIndex === index}
                    size="icon-lg"
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "rounded-none border-0 bg-transparent text-black shadow-none hover:bg-transparent",
                      selectedIndex === index &&
                        "bg-black text-white shadow-[0_0_24px_rgba(0,0,0,0.28)]"
                    )}
                  >
                    {item.icon}
                  </Button>
                ) : null}
                {item.label ? (
                  <span
                    className={cn(
                      "text-center text-[11px] font-medium leading-none transition-colors",
                      selectedIndex === index ? "text-black" : "text-black/70"
                    )}
                  >
                    {item.label}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
