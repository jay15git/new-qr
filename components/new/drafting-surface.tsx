"use client"

import { Image02Icon, SignalIcon, SquareIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type ReactNode, useState } from "react"

import type { CornerDotType, CornerSquareType } from "qr-code-styling"

import {
  DraftingCornerDotStyleTab,
  DraftingCornerSquareStyleTab,
  DraftingStyleTab,
} from "@/components/new/drafting-style-tab"
import {
  DEFAULT_QR_EDITOR_SECTION,
  type QrEditorSectionId,
} from "@/components/qr/qr-sections"
import type { StudioDotType } from "@/components/qr/qr-studio-state"
import { LinkIcon, PieChart, Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const OUTER_MARKERS = [
  "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
] as const

const JUNCTION_MARKERS = [
  "left-0 top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "left-[var(--new-left-rail-width)] top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "right-0 top-[var(--new-header-height)] translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-[var(--new-left-rail-width)] -translate-x-1/2 translate-y-1/2",
  "bottom-0 left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] -translate-x-1/2 translate-y-1/2",
] as const

type DraftingPanelTab = {
  id: string
  label: string
}

type DraftingTool = {
  id: QrEditorSectionId
  title: string
  renderIcon: () => ReactNode
}

const DRAFTING_PANEL_TABS: Record<QrEditorSectionId, DraftingPanelTab[]> = {
  content: [{ id: "content", label: "Content" }],
  style: [
    { id: "style", label: "Style" },
    { id: "color", label: "Color" },
  ],
  "corner-square": [
    { id: "style", label: "Style" },
    { id: "color", label: "Color" },
  ],
  "corner-dot": [
    { id: "style", label: "Style" },
    { id: "color", label: "Color" },
  ],
  background: [
    { id: "colors", label: "Colors" },
    { id: "upload", label: "Upload" },
  ],
  logo: [
    { id: "brand-icons", label: "Brands" },
    { id: "colors", label: "Colors" },
    { id: "upload", label: "Upload" },
    { id: "size", label: "Size" },
  ],
  encoding: [{ id: "encoding", label: "Encoding" }],
}

const DEFAULT_DRAFTING_PANEL_TABS: Record<QrEditorSectionId, string> = {
  content: "content",
  style: "style",
  "corner-square": "style",
  "corner-dot": "style",
  background: "colors",
  logo: "brand-icons",
  encoding: "encoding",
}

const DRAFTING_PANEL_TAB_TRAY_CLASS_NAME =
  "grid h-auto w-full auto-cols-fr grid-flow-col items-stretch gap-2 rounded-[4px] bg-[#00000008] p-1 shadow-none"

const DRAFTING_PANEL_TAB_TRIGGER_CLASS_NAME =
  "min-w-0 rounded-[4px] border border-transparent bg-transparent px-3 py-2 text-[0.72rem] font-medium tracking-[0.04em] text-[#00000073] shadow-none transition-[color,box-shadow,background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[#FFFFFFF2] hover:text-[#000000A6] hover:shadow-[0_0_24px_3px_rgba(0,0,0,0.08),0_4px_10px_1px_rgba(0,0,0,0.025)] active:translate-y-0 active:bg-[#FFFFFFF2] active:font-medium active:text-[#262626] active:shadow-[0_0_14px_1px_rgba(0,0,0,0.07)] data-[state=active]:bg-[#FFFFFF] data-[state=active]:font-semibold data-[state=active]:text-[#262626] data-[state=active]:shadow-[0_0_24px_3px_rgba(0,0,0,0.08),0_4px_10px_1px_rgba(0,0,0,0.025)] data-[state=active]:hover:-translate-y-px data-[state=active]:hover:bg-[#FFFFFF] data-[state=active]:hover:text-[#262626] data-[state=active]:hover:shadow-[0_0_28px_4px_rgba(0,0,0,0.10),0_4px_10px_1px_rgba(0,0,0,0.03)] data-[state=active]:active:translate-y-0"

const DRAFTING_TOOLS: DraftingTool[] = [
  {
    id: "content",
    title: "Content",
    renderIcon: () => <LinkIcon className="size-4 shrink-0" />,
  },
  {
    id: "style",
    title: "Style",
    renderIcon: () => <Sparkles className="size-4 shrink-0" />,
  },
  {
    id: "corner-square",
    title: "Corner Frame",
    renderIcon: () => (
      <HugeiconsIcon icon={SquareIcon} size={16} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    id: "corner-dot",
    title: "Corner Dot",
    renderIcon: () => <PieChart className="size-4 shrink-0" />,
  },
  {
    id: "background",
    title: "Background",
    renderIcon: () => (
      <HugeiconsIcon icon={Image02Icon} size={16} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    id: "logo",
    title: "Logo",
    renderIcon: () => (
      <HugeiconsIcon icon={SignalIcon} size={16} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    id: "encoding",
    title: "Encoding",
    renderIcon: () => <Settings className="size-4 shrink-0" />,
  },
]

function PlusMarker({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="drafting-plus-marker"
      className={cn("pointer-events-none absolute size-4 text-black/42", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function DraftingSurface() {
  const [activeTool, setActiveTool] = useState<QrEditorSectionId>(
    DEFAULT_QR_EDITOR_SECTION,
  )
  const [selectedDotType, setSelectedDotType] = useState<StudioDotType>("rounded")
  const [selectedCornerSquareType, setSelectedCornerSquareType] =
    useState<CornerSquareType>("extra-rounded")
  const [selectedCornerDotType, setSelectedCornerDotType] =
    useState<CornerDotType>("dot")
  const [activePanelTabs, setActivePanelTabs] = useState<Record<QrEditorSectionId, string>>(
    DEFAULT_DRAFTING_PANEL_TABS,
  )
  const activeToolConfig =
    DRAFTING_TOOLS.find((section) => section.id === activeTool) ?? DRAFTING_TOOLS[0]
  const activeToolTabs = DRAFTING_PANEL_TABS[activeTool]
  const activePanelTab = activePanelTabs[activeTool]
  const renderPanelContent = (toolId: QrEditorSectionId, tabId: string) => {
    if (toolId === "style" && tabId === "style") {
      return <DraftingStyleTab onValueChange={setSelectedDotType} value={selectedDotType} />
    }

    if (toolId === "corner-square" && tabId === "style") {
      return (
        <DraftingCornerSquareStyleTab
          onValueChange={setSelectedCornerSquareType}
          value={selectedCornerSquareType}
        />
      )
    }

    if (toolId === "corner-dot" && tabId === "style") {
      return (
        <DraftingCornerDotStyleTab
          onValueChange={setSelectedCornerDotType}
          value={selectedCornerDotType}
        />
      )
    }

    return null
  }

  return (
    <section
      aria-label="Drafting workspace"
      data-slot="drafting-surface"
      className="relative grid h-[calc(100dvh-3rem)] w-full grid-rows-[var(--new-header-height)_minmax(0,1fr)] overflow-visible border border-dashed border-black/18 bg-[#f4f6f8] shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:h-[calc(100dvh-4rem)] [--new-header-height:4.5rem] [--new-left-rail-width:clamp(6.25rem,10vw,7.5rem)] [--new-middle-rail-width:clamp(15rem,24vw,18.5rem)]"
    >
      {OUTER_MARKERS.map((marker) => (
        <PlusMarker key={marker} className={marker} />
      ))}
      {JUNCTION_MARKERS.map((marker) => (
        <PlusMarker key={marker} className={marker} />
      ))}

      <div
        aria-hidden="true"
        data-slot="drafting-divider-horizontal"
        className="pointer-events-none absolute left-0 right-0 top-[var(--new-header-height)] border-t border-dashed border-black/18"
      />
      <div
        aria-hidden="true"
        data-slot="drafting-divider-vertical"
        className="pointer-events-none absolute bottom-0 left-[var(--new-left-rail-width)] top-[var(--new-header-height)] border-l border-dashed border-black/18"
      />
      <div
        aria-hidden="true"
        data-slot="drafting-divider-vertical"
        className="pointer-events-none absolute bottom-0 left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] top-[var(--new-header-height)] border-l border-dashed border-black/18"
      />

      <header
        aria-label="Header frame"
        data-slot="drafting-header"
        className="min-h-0"
      />

      <div className="grid min-h-0 grid-cols-[var(--new-left-rail-width)_var(--new-middle-rail-width)_minmax(0,1fr)]">
        <nav
          aria-label="Primary navigation frame"
          data-slot="drafting-nav"
          className="min-h-0 overflow-y-auto px-3 py-4"
        >
          <div
            data-slot="drafting-nav-scroll"
            className="flex min-h-full flex-col items-center gap-4 pt-0"
          >
            {DRAFTING_TOOLS.map((tool) => {
              const isActive = tool.id === activeTool

              return (
                <Button
                  key={tool.id}
                  aria-label={`Open ${tool.title}`}
                  aria-pressed={isActive}
                  data-drafting-tool-button="true"
                  className={cn(
                    "group flex h-auto w-20 flex-col items-center gap-3 rounded-none border-0 bg-transparent px-2 py-2.5 text-center text-black/45 shadow-none transition-[color,transform] duration-150 ease-out hover:bg-transparent hover:text-black/72 active:bg-transparent",
                    isActive && "text-black",
                  )}
                  size="default"
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTool(tool.id)}
                >
                  <span
                    data-slot="drafting-tool-button-icon"
                    className={cn(
                      "flex size-10 items-center justify-center rounded-[6px] bg-black/[0.03] text-current shadow-[0_0_18px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.03)] transition-[background-color,box-shadow,transform,color] duration-150 ease-out group-hover:-translate-y-px group-hover:bg-black/[0.06] group-hover:shadow-[0_0_24px_rgba(0,0,0,0.10),0_4px_10px_rgba(0,0,0,0.06)] group-active:translate-y-0 group-active:bg-black/[0.07] group-active:shadow-[0_0_14px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]",
                      isActive &&
                        "bg-[#111111] text-white shadow-[0_0_24px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.10)] group-hover:bg-[#111111] group-hover:text-white group-hover:shadow-[0_0_28px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.14)] group-active:translate-y-0 group-active:bg-[#111111] group-active:text-white group-active:shadow-[0_0_24px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.10)]",
                    )}
                  >
                    {tool.renderIcon()}
                  </span>
                  <span
                    data-slot="drafting-tool-button-label"
                    className={cn(
                      "text-[0.58rem] font-medium uppercase leading-[1.15] tracking-[0.16em] text-black/45 transition-colors duration-150 group-hover:text-black/72",
                      isActive && "font-semibold text-current",
                    )}
                  >
                    {tool.title}
                  </span>
                </Button>
              )
            })}
          </div>
        </nav>
        <aside
          aria-label="Middle scroll frame"
          data-slot="drafting-scroll-area"
          className="min-h-0"
        >
          <Tabs
            className="h-full min-h-0 gap-0"
            value={activePanelTab}
            onValueChange={(value) =>
              setActivePanelTabs((current) => ({ ...current, [activeTool]: value }))
            }
          >
            <div
              data-slot="drafting-tabs-sticky"
              className="sticky top-0 z-10 px-4 py-4"
            >
              <TabsList
                aria-label={`${activeToolConfig.title} settings groups`}
                className={DRAFTING_PANEL_TAB_TRAY_CLASS_NAME}
              >
                {activeToolTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={DRAFTING_PANEL_TAB_TRIGGER_CLASS_NAME}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div data-slot="drafting-tab-panels" className="min-h-0 flex-1">
              {activeToolTabs.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="mt-0 h-full min-h-0 data-[state=inactive]:hidden"
                >
                  <div
                    aria-label={`${activeToolConfig.title} ${tab.label} panel`}
                    data-active-tab={tab.id}
                    data-active-tool={activeTool}
                    data-slot="drafting-tab-panel-scroll"
                    className="h-full overflow-y-auto px-4 pb-4"
                  >
                    {renderPanelContent(activeTool, tab.id)}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </aside>
        <section
          aria-label="Workspace frame"
          data-slot="drafting-workspace"
          className="min-h-0"
        />
      </div>
    </section>
  )
}
