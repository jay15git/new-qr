// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest"

import {
  DEFAULT_DRAFTING_FONT_ID,
  getDraftingFontCssFamily,
  getDraftingFontById,
  isDraftingFontLoaded,
  loadDraftingFont,
  resolveDraftingFont,
} from "@/features/workspace/model/fonts"

describe("drafting font registry", () => {
  beforeEach(() => {
    document.head.innerHTML = ""
  })

  it("resolves local, Fontshare, and system fonts", () => {
    expect(resolveDraftingFont({ fontId: DEFAULT_DRAFTING_FONT_ID })).toMatchObject({
      family: "Satoshi",
      source: "local",
    })
    expect(resolveDraftingFont({ fontFamily: "General Sans" })).toMatchObject({
      id: "fontshare:general-sans",
      source: "fontshare",
    })
    expect(resolveDraftingFont({ fontFamily: "Arial" })).toMatchObject({
      id: "system:arial",
      source: "system",
    })
    expect(getDraftingFontById("fontshare:satoshi")).toBeUndefined()
  })

  it("keeps unknown legacy font families in CSS output", () => {
    expect(getDraftingFontCssFamily({ fontFamily: "Legacy Brand Font" })).toBe(
      '"Legacy Brand Font", system-ui, Arial, sans-serif',
    )
  })

  it("injects local Satoshi font-face CSS once", async () => {
    await loadDraftingFont(DEFAULT_DRAFTING_FONT_ID)
    await loadDraftingFont(DEFAULT_DRAFTING_FONT_ID)

    const styles = document.head.querySelectorAll("style#drafting-font-local-satoshi")

    expect(styles).toHaveLength(1)
    expect(styles[0]?.textContent).toContain("font-family: 'Satoshi'")
    expect(isDraftingFontLoaded(DEFAULT_DRAFTING_FONT_ID)).toBe(true)
  })

  it("injects one Fontshare stylesheet and reuses in-flight loading", async () => {
    const firstLoad = loadDraftingFont("fontshare:general-sans")
    const secondLoad = loadDraftingFont("fontshare:general-sans")
    const link = document.head.querySelector<HTMLLinkElement>(
      "link#drafting-font-fontshare-general-sans",
    )

    expect(link?.href).toBe(
      "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap",
    )
    expect(document.head.querySelectorAll("link#drafting-font-fontshare-general-sans")).toHaveLength(1)

    link?.dispatchEvent(new Event("load"))
    await Promise.all([firstLoad, secondLoad])

    expect(isDraftingFontLoaded("fontshare:general-sans")).toBe(true)
  })
})
