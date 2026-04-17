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
})
