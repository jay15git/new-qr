import React from "react"
import { vi } from "vitest"

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      animate,
      children,
      whileHover,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      animate?: unknown
      whileHover?: unknown
    }) => (
      <div
        data-motion-animate={JSON.stringify(animate)}
        data-motion-while-hover={JSON.stringify(whileHover)}
        {...props}
      >
        {children}
      </div>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}))
