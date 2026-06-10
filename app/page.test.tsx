import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import "../test-utils/mock-framer-motion"

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
