"use client"

import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import useMeasure from "react-use-measure"

import { cn } from "@/lib/utils"

type TabId = number | string
type TabDirection = -1 | 0 | 1

type Tab = {
  id: TabId
  label: ReactNode
  content?: ReactNode
}

interface DirectionAwareTabsProps {
  tabs: Tab[]
  activeTab?: TabId
  className?: string
  containerClassName?: string
  contentClassName?: string
  defaultActiveTab?: TabId
  onChange?: (tabId: TabId) => void
  onTabChange?: (tabId: TabId) => void
  orientation?: "horizontal" | "vertical"
  rounded?: string
  showContent?: boolean
  tabClassName?: string
  tabListLabel?: string
  bubbleClassName?: string
}

function DirectionAwareTabs({
  activeTab,
  tabs,
  bubbleClassName,
  className,
  containerClassName,
  contentClassName,
  defaultActiveTab,
  onChange,
  onTabChange,
  orientation = "horizontal",
  rounded,
  showContent = true,
  tabClassName,
  tabListLabel = "Tabs",
}: DirectionAwareTabsProps) {
  const fallbackTabId = tabs[0]?.id
  const [internalActiveTab, setInternalActiveTab] = useState<TabId | undefined>(
    defaultActiveTab ?? fallbackTabId,
  )
  const [direction, setDirection] = useState<TabDirection>(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const isControlled = activeTab !== undefined
  const resolvedActiveTab = getResolvedTabId({
    activeTab: isControlled ? activeTab : internalActiveTab,
    fallbackTabId,
    tabs,
  })
  const previousActiveTabRef = useRef<TabId | undefined>(resolvedActiveTab)
  const [ref, bounds] = useMeasure()

  useEffect(() => {
    const previousActiveTab = previousActiveTabRef.current

    if (resolvedActiveTab === previousActiveTab) {
      return
    }

    setDirection(getTabDirection(tabs, previousActiveTab, resolvedActiveTab))
    previousActiveTabRef.current = resolvedActiveTab
  }, [resolvedActiveTab, tabs])

  const content = useMemo(() => {
    const activeTabContent = tabs.find((tab) => tab.id === resolvedActiveTab)?.content
    return activeTabContent || null
  }, [resolvedActiveTab, tabs])

  const handleTabClick = (newTabId: TabId) => {
    if (newTabId === resolvedActiveTab || (showContent && isAnimating)) {
      return
    }

    const newDirection = getTabDirection(tabs, resolvedActiveTab, newTabId)

    setDirection(newDirection)
    previousActiveTabRef.current = newTabId

    if (!isControlled) {
      setInternalActiveTab(newTabId)
    }

    onTabChange?.(newTabId)
    onChange?.(newTabId)
  }

  const variants = {
    initial: (direction: TabDirection) => ({
      x: 300 * direction,
      opacity: 0,
      filter: "blur(4px)",
    }),
    active: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      x: -300 * direction,
      opacity: 0,
      filter: "blur(4px)",
    }),
  }

  return (
    <div
      data-slot="direction-aware-tabs"
      className={cn("flex w-full flex-col items-center", containerClassName)}
    >
      <div
        data-slot="direction-aware-tab-list"
        role="tablist"
        aria-label={tabListLabel}
        aria-orientation={orientation}
        className={cn(
          "flex w-full cursor-pointer border border-none bg-neutral-600 shadow-inner-shadow",
          orientation === "vertical"
            ? "flex-col gap-1 rounded-[1.5rem] p-2"
            : "space-x-1 rounded-full px-[3px] py-[3.2px]",
          className,
          rounded,
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-slot="direction-aware-tab"
            data-active={tab.id === resolvedActiveTab}
            data-tab={String(tab.id)}
            role="tab"
            aria-selected={tab.id === resolvedActiveTab}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative flex items-center gap-2 font-medium transition focus-visible:outline-1 focus-visible:ring-1 focus-visible:outline-none",
              orientation === "vertical"
                ? "w-full justify-start rounded-[1rem] px-3.5 py-3 text-sm"
                : "rounded-full px-3.5 py-1.5 text-xs sm:text-sm",
              tab.id === resolvedActiveTab
                ? "text-white"
                : "text-neutral-200/80 hover:text-neutral-300/60",
              rounded,
              tabClassName,
            )}
            style={{ WebkitTapHighlightColor: "transparent" }}
            type="button"
          >
            {tab.id === resolvedActiveTab && (
              <motion.span
                layoutId="bubble"
                className={cn(
                  "absolute inset-0 z-10 border border-white/10 bg-neutral-700 mix-blend-difference shadow-inner-shadow",
                  bubbleClassName,
                )}
                style={rounded ? { borderRadius: 9 } : { borderRadius: 9999 }}
                transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
              />
            )}

            {tab.label}
          </button>
        ))}
      </div>

      {showContent ? (
        <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}>
          <motion.div
            data-slot="direction-aware-tab-panels"
            className={cn("relative mx-auto h-full w-full overflow-hidden", contentClassName)}
            initial={false}
            animate={{ height: bounds.height }}
          >
            <div className="p-1" ref={ref}>
              <AnimatePresence
                custom={direction}
                mode="popLayout"
                onExitComplete={() => setIsAnimating(false)}
              >
                <motion.div
                  key={String(resolvedActiveTab)}
                  data-slot="direction-aware-tab-panel"
                  variants={variants}
                  initial="initial"
                  animate="active"
                  exit="exit"
                  custom={direction}
                  onAnimationStart={() => setIsAnimating(true)}
                  onAnimationComplete={() => setIsAnimating(false)}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </MotionConfig>
      ) : null}
    </div>
  )
}

function getResolvedTabId({
  activeTab,
  fallbackTabId,
  tabs,
}: {
  activeTab?: TabId
  fallbackTabId?: TabId
  tabs: Tab[]
}) {
  if (activeTab !== undefined && tabs.some((tab) => tab.id === activeTab)) {
    return activeTab
  }

  return fallbackTabId
}

function getTabDirection(
  tabs: Tab[],
  currentTab?: TabId,
  nextTab?: TabId,
): TabDirection {
  if (currentTab === undefined || nextTab === undefined || currentTab === nextTab) {
    return 0
  }

  const currentIndex = tabs.findIndex((tab) => tab.id === currentTab)
  const nextIndex = tabs.findIndex((tab) => tab.id === nextTab)

  if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) {
    return 0
  }

  return nextIndex > currentIndex ? 1 : -1
}

export { DirectionAwareTabs }
export type { DirectionAwareTabsProps, Tab as DirectionAwareTab, TabId }
