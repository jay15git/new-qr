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
    span: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
  },
}))

import { PromptInputBox } from "./ai-prompt-box"

describe("prompt input box", () => {
  it("renders Auto selected by default and removes the upload button", () => {
    const markup = renderToStaticMarkup(<PromptInputBox />)

    expect(markup).toContain('aria-label="Auto"')
    expect(markup).toContain('aria-label="Text"')
    expect(markup).toContain('aria-label="Link"')
    expect(markup).toContain('aria-label="Phone"')
    expect(markup).toContain('aria-label="Email"')
    expect(markup).toContain('aria-label="Instagram"')
    expect(markup).toContain('aria-label="WhatsApp"')

    expect(markup).toContain('aria-pressed="false"')
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain(">Auto<")
    expect(markup).not.toContain(">Text<")
    expect(markup).not.toContain(">Link<")
    expect(markup).not.toContain(">Phone<")
    expect(markup).not.toContain(">Email<")
    expect(markup).not.toContain(">Instagram<")
    expect(markup).not.toContain(">WhatsApp<")
    expect(markup).not.toContain("lucide-paperclip")

    expect(markup).not.toContain(">Search<")
    expect(markup).not.toContain(">Think<")
    expect(markup).not.toContain(">Canvas<")
  })

  it("renders the controlled active input type and clears quick-pill selection for dropdown-only types", () => {
    const emailMarkup = renderToStaticMarkup(
      <PromptInputBox activeInputType="email" onInputTypeChange={() => {}} />
    )

    expect(emailMarkup).toContain(">Email<")
    expect(emailMarkup).not.toContain(">Auto<")

    const wifiMarkup = renderToStaticMarkup(
      <PromptInputBox activeInputType="wifi" onInputTypeChange={() => {}} />
    )

    expect(wifiMarkup).not.toContain(">Auto<")
    expect(wifiMarkup).not.toContain(">Text<")
    expect(wifiMarkup).not.toContain(">Link<")
    expect(wifiMarkup).not.toContain(">Phone<")
    expect(wifiMarkup).not.toContain(">Email<")
    expect(wifiMarkup).not.toContain(">Instagram<")
    expect(wifiMarkup).not.toContain(">WhatsApp<")
    expect(wifiMarkup).not.toContain('aria-pressed="true"')
  })

  it("does not rotate quick-option icons", () => {
    const markup = renderToStaticMarkup(<PromptInputBox />)

    expect(markup).toContain('data-motion-animate="{&quot;scale&quot;:1}"')
    expect(markup).toContain(
      'data-motion-while-hover="{&quot;scale&quot;:1.1,&quot;transition&quot;:{&quot;type&quot;:&quot;spring&quot;,&quot;stiffness&quot;:300,&quot;damping&quot;:10}}"'
    )
    expect(markup).not.toContain("rotate")
  })
})
