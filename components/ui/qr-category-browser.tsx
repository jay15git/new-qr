"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import {
  QR_CATEGORIES,
  type QrCategoryKey,
  type QrInputType,
} from "./qr-input-config"

interface QrCategoryBrowserProps {
  activeInputType: QrInputType | null
  onInputTypeChange: (value: QrInputType) => void
  openCategory?: QrCategoryKey | null
  onOpenCategoryChange?: (value: QrCategoryKey | null) => void
}

export function QrCategoryBrowser({
  activeInputType,
  onInputTypeChange,
  openCategory: openCategoryProp,
  onOpenCategoryChange,
}: QrCategoryBrowserProps) {
  const isControlled = openCategoryProp !== undefined
  const [internalOpenCategory, setInternalOpenCategory] = React.useState<QrCategoryKey | null>(null)
  const openCategory = isControlled ? openCategoryProp : internalOpenCategory

  const setOpenCategory = React.useCallback(
    (value: QrCategoryKey | null) => {
      if (!isControlled) {
        setInternalOpenCategory(value)
      }

      onOpenCategoryChange?.(value)
    },
    [isControlled, onOpenCategoryChange]
  )

  return (
    <div
      data-testid="qr-category-browser"
      className="flex flex-wrap items-center gap-2 px-2"
    >
      {QR_CATEGORIES.map((category) => {
        const CategoryIcon = category.icon
        const isOpen = openCategory === category.key
        const isSelectedCategory = category.items.some((item) => item.value === activeInputType)

        return (
          <DropdownMenu
            key={category.key}
            open={isOpen}
            onOpenChange={(open) => {
              if (open) {
                setOpenCategory(category.key)
                return
              }

              if (openCategory === category.key) {
                setOpenCategory(null)
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 rounded-full border-[#2E2F33] bg-[#16171A] px-3 text-xs text-[#9CA3AF] shadow-none hover:bg-[#202227] hover:text-[#F9FAFB]",
                  (isOpen || isSelectedCategory) &&
                    "border-[#1EAEDB] bg-[#1EAEDB]/10 text-[#1EAEDB] hover:bg-[#1EAEDB]/15 hover:text-[#7DD3FC]"
                )}
              >
                <CategoryIcon data-icon="inline-start" />
                {category.label}
                <ChevronDown
                  data-icon="inline-end"
                  className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[22rem] max-w-[calc(100vw-2rem)] rounded-3xl border border-[#2E2F33] bg-[#16171A] p-2 text-[#F9FAFB] shadow-2xl"
            >
              <DropdownMenuGroup className="grid gap-1 sm:grid-cols-2">
                {category.items.map((item) => {
                  const ItemIcon = item.icon
                  const isActive = activeInputType === item.value

                  return (
                    <DropdownMenuItem
                      key={item.value}
                      onSelect={() => {
                        onInputTypeChange(item.value)
                        setOpenCategory(null)
                      }}
                      className={cn(
                        "min-h-10 rounded-2xl border border-transparent px-3 py-2 text-xs text-[#D1D5DB] focus:bg-[#24262C] focus:text-white",
                        isActive && "border-[#1EAEDB]/50 bg-[#1EAEDB]/12 text-[#7DD3FC]"
                      )}
                    >
                      <ItemIcon />
                      <span className="truncate">{item.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      })}
    </div>
  )
}
