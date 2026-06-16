"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { useStudioNavigationOptional } from "@/features/studio-hub/hooks/useStudioNavigation"
import { readStudioSession } from "@/features/studio-hub/model/navigation"

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function HubToEditorTransition() {
  const navigation = useStudioNavigationOptional()
  const [sessionTransitionId, setSessionTransitionId] = React.useState<string | null>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const session = readStudioSession()
    if (session?.transitionId && !prefersReducedMotion()) {
      setSessionTransitionId(session.transitionId)
      setVisible(true)
      const timer = window.setTimeout(() => {
        setVisible(false)
        navigation?.clearTransition()
      }, 520)
      return () => window.clearTimeout(timer)
    }

    navigation?.clearTransition()
    return undefined
  }, [navigation])

  const transitionItem = navigation?.transitionItem
  const transitionId = transitionItem?.id ?? sessionTransitionId

  if (!transitionId || prefersReducedMotion()) {
    return null
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={transitionId}
          layoutId={`hub-item-${transitionId}`}
          className="pointer-events-none fixed inset-4 z-[100] rounded-[1.8rem] border border-white/20 bg-[var(--desktop-inspector-field-bg)] shadow-2xl sm:inset-8"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          {transitionItem?.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={transitionItem.thumbnailUrl}
              alt=""
              className="h-full w-full rounded-[1.8rem] object-cover"
            />
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
