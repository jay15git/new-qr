"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Add01Icon,
  LayoutGridIcon,
  LibraryIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter, useSearchParams } from "next/navigation"

import { FluidTabs } from "@/components/ui/fluid-tabs"
import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"
import type { DesktopThemeMode } from "@/features/desktop-shell/components/FloatingToolbar"
import { DESKTOP_INSPECTOR_FG_PRIMARY } from "@/features/desktop-shell/components/InspectorControls"
import { LibraryThemeToggle } from "@/features/library/components/LibraryThemeToggle"
import { StudioHubCreatePanel } from "@/features/studio-hub/components/StudioHubCreatePanel"
import { StudioHubLibraryPanel } from "@/features/studio-hub/components/StudioHubLibraryPanel"
import { StudioHubTemplatesPanel } from "@/features/studio-hub/components/StudioHubTemplatesPanel"
import { StudioHubStyles } from "@/features/studio-hub/components/StudioHubStyles"
import {
  StudioNavigationProvider,
  useStudioHubTabFromUrl,
} from "@/features/studio-hub/hooks/useStudioNavigation"
import type { StudioHubTab } from "@/features/studio-hub/model/navigation"
import { STUDIO_THEME_KEY } from "@/features/studio-hub/model/navigation"
import { cn } from "@/lib/utils"

const HUB_TABS = [
  {
    id: "create",
    label: "Create",
    icon: (
      <HugeiconsIcon icon={Add01Icon} size={22} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    id: "templates",
    label: "Templates",
    icon: (
      <HugeiconsIcon icon={LayoutGridIcon} size={22} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    id: "library",
    label: "Library",
    icon: (
      <HugeiconsIcon icon={LibraryIcon} size={22} color="currentColor" strokeWidth={1.8} />
    ),
  },
] as const

type StudioHubShellProps = {
  fontClassName: string
}

function StudioHubShellInner({ fontClassName }: StudioHubShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = useStudioHubTabFromUrl(searchParams)
  const [activeTab, setActiveTab] = React.useState<StudioHubTab>(initialTab)
  const [theme, setTheme] = React.useState<DesktopThemeMode>("light")

  React.useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STUDIO_THEME_KEY)
      if (stored === "light" || stored === "dark") {
        setTheme(stored)
      }
    } catch {
      // Ignore storage failures.
    }
  }, [])

  const handleThemeChange = React.useCallback((nextTheme: DesktopThemeMode) => {
    setTheme(nextTheme)
    try {
      window.localStorage.setItem(STUDIO_THEME_KEY, nextTheme)
    } catch {
      // Ignore storage failures.
    }
  }, [])

  const handleTabChange = React.useCallback(
    (tabId: string) => {
      const nextTab = tabId as StudioHubTab
      setActiveTab(nextTab)
      const href = nextTab === "create" ? "/" : `/?tab=${nextTab}`
      router.replace(href, { scroll: false })
    },
    [router],
  )

  const handleSwitchToCreate = React.useCallback(() => {
    handleTabChange("create")
  }, [handleTabChange])

  return (
    <>
      <StudioHubStyles />
      <main
        data-slot="studio-hub"
        data-desktop-theme={theme}
        className={cn(
          fontClassName,
          "flex h-dvh flex-col overflow-hidden transition-colors duration-200",
          theme === "light" ? "bg-workspace-shell-light text-neutral-950" : "bg-workspace-shell text-white",
        )}
      >
        <header
          data-slot="studio-hub-header"
          className="fixed top-5 right-0 left-0 z-30 px-4 sm:px-6 max-md:top-4"
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className={cn("drafting-type-caption uppercase tracking-[0.18em]", DESKTOP_INSPECTOR_FG_PRIMARY)}>
                QR Studio
              </p>
              <h1 className={cn("drafting-type-display-data text-[1.65rem] leading-tight sm:text-[2rem]", DESKTOP_INSPECTOR_FG_PRIMARY)}>
                Design. Share. Scan.
              </h1>
            </div>
            <LibraryThemeToggle theme={theme} onThemeChange={handleThemeChange} />
          </div>
        </header>

        <ScrollArea
          data-scrollbar-visibility="while-scrolling"
          data-slot="studio-hub-scroll-area"
          scrollHideDelay={500}
          type="scroll"
          className="min-h-0 flex-1"
        >
          <ScrollAreaViewport
            data-slot="studio-hub-scroll"
            className="h-full w-full overflow-x-hidden overflow-y-auto px-4 pt-[8.5rem] pb-28 sm:px-6 sm:pt-[9rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div data-slot="studio-hub-shell" className="mx-auto flex w-full max-w-5xl flex-col gap-8">
              <div className="flex justify-center">
                <FluidTabs
                  tabs={[...HUB_TABS]}
                  active={activeTab}
                  layoutId="studio-hub-tab-pill"
                  onChange={handleTabChange}
                  className="w-full max-w-lg"
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  data-slot="studio-hub-panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeTab === "create" ? (
                    <StudioHubCreatePanel />
                  ) : activeTab === "templates" ? (
                    <StudioHubTemplatesPanel />
                  ) : (
                    <StudioHubLibraryPanel onCreateClick={handleSwitchToCreate} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar data-slot="studio-hub-scrollbar" className="w-2 border-none p-[1px]">
            <ScrollAreaThumb data-slot="studio-hub-scroll-thumb" />
          </ScrollAreaScrollbar>
        </ScrollArea>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-[var(--workspace-shell-light)] to-transparent dark:from-[var(--workspace-shell)] md:hidden" />
        <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 md:hidden">
          <FluidTabs
            tabs={[...HUB_TABS]}
            active={activeTab}
            layoutId="studio-hub-mobile-tab-pill"
            onChange={handleTabChange}
            className="pointer-events-auto w-full max-w-md shadow-lg"
          />
        </div>
      </main>
    </>
  )
}

export function StudioHubShell(props: StudioHubShellProps) {
  return (
    <StudioNavigationProvider>
      <StudioHubShellInner {...props} />
    </StudioNavigationProvider>
  )
}
