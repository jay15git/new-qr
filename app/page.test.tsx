import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

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

import Home from "./page"

describe("home page", () => {
  it("renders the prompt box and qr category browser inside the centered CTA layout", () => {
    const markup = renderToStaticMarkup(<Home />)

    expect(markup).toContain("min-h-screen")
    expect(markup).toContain('aria-label="Auto"')
    expect(markup).toContain('data-testid="qr-category-browser"')
    expect(markup).toContain(">Popular<")
    expect(markup).toContain(">Socials<")
    expect(markup).toContain(">Contact<")
    expect(markup).toContain(">Business<")
    expect(markup).toContain(">Content<")
  })
})
