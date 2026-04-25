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
})
