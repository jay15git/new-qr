"use client"

import * as React from "react"

import { SearchIcon } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { QrCategoryBrowser } from "@/features/home/components/QrCategoryBrowser"
import {
  DESKTOP_INSPECTOR_FG_PRIMARY,
} from "@/features/desktop-shell/components/InspectorControls"
import {
  DEFAULT_QR_INPUT_TYPE,
  QR_CATEGORIES,
  type QrInputType,
} from "@/features/qr-code/content/input-options"
import { HUB_PILL_SURFACE } from "@/features/studio-hub/components/hub-surfaces"
import { useStudioNavigation } from "@/features/studio-hub/hooks/useStudioNavigation"
import { cn } from "@/lib/utils"

export function StudioHubCreatePanel() {
  const { openEditor } = useStudioNavigation()
  const [activeInputType, setActiveInputType] = React.useState<QrInputType | null>(
    DEFAULT_QR_INPUT_TYPE,
  )
  const [prompt, setPrompt] = React.useState("")
  const showSuggestions = prompt.trim().length > 0

  const filteredCategories = React.useMemo(() => {
    if (!showSuggestions) return []

    const query = prompt.trim().toLowerCase()

    return QR_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.value.toLowerCase().includes(query) ||
          category.label.toLowerCase().includes(query),
      ),
    })).filter((category) => category.items.length > 0)
  }, [prompt, showSuggestions])

  const handleSend = React.useCallback(
    (message: string) => {
      void openEditor({
        source: "prompt",
        inputType: activeInputType ?? DEFAULT_QR_INPUT_TYPE,
        prompt: message,
      })
    },
    [activeInputType, openEditor],
  )

  return (
    <section
      data-slot="studio-create-hero"
      className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 pt-2 text-center"
    >
      <div className="space-y-2">
        <h2 className={cn("drafting-type-display-data font-semibold tracking-tight", DESKTOP_INSPECTOR_FG_PRIMARY)}>
          What are you making?
        </h2>
      </div>

      <Popover open={showSuggestions}>
        <PopoverAnchor asChild>
          <div
            data-slot="studio-create-prompt"
            className={cn("w-full px-1", HUB_PILL_SURFACE)}
          >
            <InputGroup
              className="h-11 rounded-full border-0 bg-transparent shadow-none focus-within:border-transparent focus-within:ring-0"
              size="lg"
            >
              <InputGroupAddon align="inline-start" className="pl-3">
                <SearchIcon className="size-4 opacity-50" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Describe your QR code or paste a link..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && prompt.trim()) {
                    event.preventDefault()
                    handleSend(prompt)
                  }
                }}
              />
            </InputGroup>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="center"
          sideOffset={10}
          className="w-[var(--radix-popover-trigger-width)] rounded-2xl p-0"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Command shouldFilter={false} className="rounded-2xl bg-transparent">
            <CommandList className="max-h-80">
              <CommandEmpty>No matching QR types</CommandEmpty>
              {filteredCategories.map((category) => (
                <CommandGroup heading={category.label} key={category.key}>
                  {category.items.map((item) => {
                    const ItemIcon = item.icon

                    return (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        onSelect={() => {
                          setActiveInputType(item.value)
                          setPrompt(item.label)
                        }}
                      >
                        <ItemIcon />
                        {item.label}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <QrCategoryBrowser activeInputType={activeInputType} onInputTypeChange={setActiveInputType} />
    </section>
  )
}
