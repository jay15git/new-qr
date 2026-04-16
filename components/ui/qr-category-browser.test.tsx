import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}))

import {
  DEFAULT_QR_INPUT_TYPE,
  getNextOpenQrCategory,
} from "./qr-input-config"
import { QrCategoryBrowser } from "./qr-category-browser"

describe("qr category browser", () => {
  it("renders all category triggers with all menus collapsed initially", () => {
    const markup = renderToStaticMarkup(
      <QrCategoryBrowser activeInputType={DEFAULT_QR_INPUT_TYPE} onInputTypeChange={() => {}} />
    )

    expect(markup).toContain('data-testid="qr-category-browser"')
    expect(markup).toContain(">Popular<")
    expect(markup).toContain(">Socials<")
    expect(markup).toContain(">Contact<")
    expect(markup).toContain(">Business<")
    expect(markup).toContain(">Content<")

    expect(markup).not.toContain(">Wi-Fi<")
    expect(markup).not.toContain(">Discord<")
    expect(markup).not.toContain(">vCard<")
    expect(markup).not.toContain(">Google Review<")
    expect(markup).not.toContain(">PDF<")
  })

  it("renders only the active category menu", () => {
    const socialsMarkup = renderToStaticMarkup(
      <QrCategoryBrowser
        activeInputType={DEFAULT_QR_INPUT_TYPE}
        onInputTypeChange={() => {}}
        openCategory="socials"
      />
    )

    expect(socialsMarkup.match(/aria-expanded="true"/g)?.length ?? 0).toBe(1)
    expect(socialsMarkup).toContain(">Socials<")
    expect(socialsMarkup).toContain('data-state="open"')

    const contactMarkup = renderToStaticMarkup(
      <QrCategoryBrowser
        activeInputType={DEFAULT_QR_INPUT_TYPE}
        onInputTypeChange={() => {}}
        openCategory="contact"
      />
    )

    expect(contactMarkup.match(/aria-expanded="true"/g)?.length ?? 0).toBe(1)
    expect(contactMarkup).toContain(">Contact<")
    expect(contactMarkup).toContain('data-state="open"')
  })

  it("toggles one category open at a time", () => {
    expect(getNextOpenQrCategory(null, "socials")).toBe("socials")
    expect(getNextOpenQrCategory("socials", "socials")).toBeNull()
    expect(getNextOpenQrCategory("socials", "contact")).toBe("contact")
  })
})
