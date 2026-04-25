import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

describe("theme contract", () => {
  it("defines the premium dashboard font and token system", () => {
    const layoutSource = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8")
    const globalsSource = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8")

    expect(layoutSource).toContain("Bricolage_Grotesque")
    expect(layoutSource).toContain("Manrope")
    expect(globalsSource).toContain("--font-heading: var(--font-display);")
    expect(globalsSource).toContain("--space-md: 1rem;")
    expect(globalsSource).not.toContain("264.376")
  })

  it("keeps the new drafting chrome on scoped monochrome tokens", () => {
    const checkedFiles = [
      "app/new/page.tsx",
      "components/new/drafting-surface.tsx",
      "components/new/drafting-style-tab.tsx",
      "components/new/drafting-layers-tab.tsx",
    ]
    const disallowedColorTokens =
      /\b(?:amber|sky|red|rose|orange|yellow|pink|purple|violet|blue|cyan|teal|emerald|green|lime)-/
    const disallowedLiterals = /#[0-9a-fA-F]{3,8}|rgba?\(/

    for (const file of checkedFiles) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8")

      expect(source, `${file} uses a non-monochrome utility token`).not.toMatch(
        disallowedColorTokens,
      )
      expect(source, `${file} uses a non-tokenized color literal`).not.toMatch(disallowedLiterals)
    }
  })

  it("maps the new drafting dark theme to Pencil token aliases", () => {
    const globalsSource = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8")
    const requiredDarkTokens = [
      "--drafting-dark-page-bg: #101216;",
      "--drafting-dark-shell-bg: #101216;",
      "--drafting-dark-surface-muted: #ffffff08;",
      "--drafting-dark-surface-subtle: #ffffff0d;",
      "--drafting-dark-surface-raised: #252a33;",
      "--drafting-dark-surface-selected: #f6f8fb;",
      "--drafting-dark-border: #ffffff22;",
      "--drafting-dark-border-strong: #ffffff59;",
      "--drafting-dark-text-primary: #f6f8fb;",
      "--drafting-dark-text-secondary: #c8d0dc;",
      "--drafting-dark-text-muted: #a8b0bd;",
      "--drafting-dark-ink-primary: #dfe5ee;",
      "--drafting-dark-ink-muted: #b8c0cc;",
      "--drafting-dark-selected-foreground: #101216;",
      "--drafting-dark-button-fill-default: #ffffff08;",
      "--drafting-dark-button-fill-hover: #ffffff0d;",
      "--drafting-dark-button-fill-pressed: #ffffff14;",
      "--drafting-dark-button-fill-selected: #f6f8fb;",
      "--drafting-dark-panel-tray-fill: #ffffff0d;",
      "--drafting-dark-panel-surface-selected: #101216;",
      "--drafting-dark-option-fill-default: #101216;",
      "--drafting-dark-option-fill-selected: #f6f8fb;",
      "--drafting-dark-option-border-default: #ffffff20;",
      "--drafting-dark-option-motif-selected: #101216;",
      "--drafting-dark-shadow-rest: 0 0 18px 2px #00000010, 0 3px 8px 1px #00000009;",
      "--drafting-dark-shadow-active: 0 0 14px 1px #00000012, 0 2px 6px 0 #0000000c;",
      "--drafting-dark-option-shadow-rest: 0 0 10px 0 #00000010, 0 2px 4px 0 #00000009;",
    ]

    for (const token of requiredDarkTokens) {
      expect(globalsSource).toContain(token)
    }

    expect(globalsSource).toContain("--drafting-page-bg: var(--drafting-dark-page-bg);")
    expect(globalsSource).toContain("--drafting-control-bg: var(--drafting-dark-button-fill-default);")
    expect(globalsSource).toContain("--drafting-ink: var(--drafting-dark-text-primary);")
    expect(globalsSource).toContain("--drafting-line: var(--drafting-dark-border);")
    expect(globalsSource).toContain("--drafting-shadow-rest: var(--drafting-dark-shadow-rest);")
    expect(globalsSource).toContain(
      "--drafting-panel-tab-tray-bg: var(--drafting-dark-panel-tray-fill);",
    )
    expect(globalsSource).toContain("--drafting-panel-tab-shadow-selected: none;")
    expect(globalsSource).toContain(
      "--drafting-option-card-shadow-rest: var(--drafting-dark-option-shadow-rest);",
    )
    expect(globalsSource).not.toContain('[data-slot="tabs-list"],')
    expect(globalsSource).not.toContain("--drafting-dark-depth-shadow")
    expect(globalsSource).not.toContain("rgba(150, 150, 150")
  })

  it("keeps component-specific drafting tokens defined for light mode", () => {
    const globalsSource = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8")
    const requiredLightMappings = [
      "--drafting-button-shadow-rest: var(--drafting-shadow-rest);",
      "--drafting-button-shadow-hover: var(--drafting-shadow-hover);",
      "--drafting-panel-tab-tray-bg: var(--drafting-control-bg);",
      "--drafting-panel-tab-shadow-hover: var(--drafting-shadow-hover);",
      "--drafting-panel-tab-shadow-selected: var(--drafting-shadow-active);",
      "--drafting-option-card-border: #00000017;",
      "--drafting-option-card-shadow-rest: 0 0 10px 0 rgb(0 0 0 / 0.08), 0 2px 4px 0 rgb(0 0 0 / 0.06);",
      "--drafting-option-card-shadow-selected: 0 0 22px 2px rgb(0 0 0 / 0.14), 0 5px 10px 1px rgb(0 0 0 / 0.1);",
    ]

    for (const token of requiredLightMappings) {
      expect(globalsSource).toContain(token)
    }
  })
})
