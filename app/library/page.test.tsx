import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import "../../test-utils/mock-framer-motion"

vi.mock("next/font/local", () => ({
  default: () => ({
    className: "mock-satoshi-font",
  }),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

import LibraryPage from "./page"

describe("library page", () => {
  it("renders the studio hub with prompt and category browser", () => {
    const markup = renderToStaticMarkup(<LibraryPage />)

    expect(markup).toContain('data-slot="studio-hub"')
    expect(markup).toContain('aria-label="Switch to dark mode"')
    expect(markup).toContain('data-testid="qr-category-browser"')
    expect(markup).toContain(">Popular<")
    expect(markup).toContain(">Socials<")
    expect(markup).toContain(">Contact<")
    expect(markup).toContain(">Business<")
    expect(markup).toContain(">Content<")
    expect(markup).toContain('data-slot="studio-hub-home"')
    expect(markup).toContain('data-slot="studio-library-section"')
    expect(markup).toContain('data-slot="studio-templates-section"')
    expect(markup).toContain("Templates")
  })
})
