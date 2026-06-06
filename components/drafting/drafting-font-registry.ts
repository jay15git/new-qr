import type { DraftingCanvasLayer } from "@/components/drafting/drafting-layer-state"

export type DraftingFontSource = "fontshare" | "local" | "system"

export type DraftingFontRegistryEntry = {
  cssText?: string
  cssUrl?: string
  fallback: string
  family: string
  id: string
  label: string
  source: DraftingFontSource
  styles: readonly ("italic" | "normal")[]
  weights: readonly number[]
}

const DRAFTING_FONT_FALLBACK = "system-ui, Arial, sans-serif"

export const DEFAULT_DRAFTING_FONT_ID = "local:satoshi"

export const DRAFTING_FONT_REGISTRY = [
  {
    cssText: [
      "@font-face {",
      "font-family: 'Satoshi';",
      "src: url('/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2') format('woff2');",
      "font-weight: 300 900;",
      "font-display: swap;",
      "font-style: normal;",
      "}",
      "@font-face {",
      "font-family: 'Satoshi';",
      "src: url('/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-VariableItalic.woff2') format('woff2');",
      "font-weight: 300 900;",
      "font-display: swap;",
      "font-style: italic;",
      "}",
    ].join("\n"),
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Satoshi",
    id: DEFAULT_DRAFTING_FONT_ID,
    label: "Satoshi",
    source: "local",
    styles: ["normal", "italic"],
    weights: [300, 400, 500, 600, 700, 900],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "General Sans",
    id: "fontshare:general-sans",
    label: "General Sans",
    source: "fontshare",
    cssUrl: "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap",
    styles: ["normal", "italic"],
    weights: [400, 500, 600, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Cabinet Grotesk",
    id: "fontshare:cabinet-grotesk",
    label: "Cabinet Grotesk",
    source: "fontshare",
    cssUrl: "https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap",
    styles: ["normal"],
    weights: [400, 500, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Clash Display",
    id: "fontshare:clash-display",
    label: "Clash Display",
    source: "fontshare",
    cssUrl: "https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap",
    styles: ["normal"],
    weights: [400, 500, 600, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Switzer",
    id: "fontshare:switzer",
    label: "Switzer",
    source: "fontshare",
    cssUrl: "https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap",
    styles: ["normal", "italic"],
    weights: [400, 500, 600, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Author",
    id: "fontshare:author",
    label: "Author",
    source: "fontshare",
    cssUrl: "https://api.fontshare.com/v2/css?f[]=author@400,500,600,700&display=swap",
    styles: ["normal", "italic"],
    weights: [400, 500, 600, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Inter",
    id: "system:inter",
    label: "Inter",
    source: "system",
    styles: ["normal", "italic"],
    weights: [400, 500, 600, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Geist",
    id: "system:geist",
    label: "Geist",
    source: "system",
    styles: ["normal"],
    weights: [400, 500, 600, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Manrope",
    id: "system:manrope",
    label: "Manrope",
    source: "system",
    styles: ["normal"],
    weights: [400, 500, 600, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Bricolage Grotesque",
    id: "system:bricolage-grotesque",
    label: "Bricolage Grotesque",
    source: "system",
    styles: ["normal"],
    weights: [400, 500, 600, 700],
  },
  {
    fallback: DRAFTING_FONT_FALLBACK,
    family: "Arial",
    id: "system:arial",
    label: "Arial",
    source: "system",
    styles: ["normal", "italic"],
    weights: [400, 700],
  },
] as const satisfies readonly DraftingFontRegistryEntry[]

const FONT_BY_ID: Map<string, DraftingFontRegistryEntry> = new Map(
  DRAFTING_FONT_REGISTRY.map((font) => [font.id, font]),
)
const FONT_BY_FAMILY: Map<string, DraftingFontRegistryEntry> = new Map(
  DRAFTING_FONT_REGISTRY.map((font) => [normalizeDraftingFontFamilyKey(font.family), font]),
)
const loadedFontIds = new Set<string>()
const fontReadyPromises = new Map<string, Promise<void>>()

export function getDraftingFontById(fontId: string | null | undefined) {
  return fontId ? FONT_BY_ID.get(fontId) : undefined
}

export function getDraftingFontByFamily(fontFamily: string | null | undefined) {
  return fontFamily ? FONT_BY_FAMILY.get(normalizeDraftingFontFamilyKey(fontFamily)) : undefined
}

export function resolveDraftingFont(
  options: { fontFamily?: string | null; fontId?: string | null } = {},
) {
  return (
    getDraftingFontById(options.fontId) ??
    getDraftingFontByFamily(options.fontFamily) ??
    getDraftingFontById(DEFAULT_DRAFTING_FONT_ID)!
  )
}

export function getDraftingFontCssFamily(
  options: { fontFamily?: string | null; fontId?: string | null } = {},
) {
  const font = getDraftingFontById(options.fontId) ?? getDraftingFontByFamily(options.fontFamily)
  const family = font?.family ?? normalizeUnknownFontFamily(options.fontFamily)

  return `"${family}", ${font?.fallback ?? DRAFTING_FONT_FALLBACK}`
}

export function normalizeDraftingFontId(
  fontId: unknown,
  fontFamily: unknown,
  fallbackFontId?: string,
) {
  if (typeof fontId === "string" && FONT_BY_ID.has(fontId)) {
    return fontId
  }

  if (typeof fontFamily === "string") {
    const font = getDraftingFontByFamily(fontFamily)
    if (font) {
      return font.id
    }
  }

  return fallbackFontId && FONT_BY_ID.has(fallbackFontId)
    ? fallbackFontId
    : DEFAULT_DRAFTING_FONT_ID
}

export function loadDraftingFont(fontId: string | null | undefined): Promise<void> {
  const font = getDraftingFontById(fontId) ?? getDraftingFontById(DEFAULT_DRAFTING_FONT_ID)!

  if (typeof document === "undefined") {
    return Promise.resolve()
  }

  const inflight = fontReadyPromises.get(font.id)
  if (inflight) {
    return inflight
  }

  const task = (async () => {
    if (font.source === "fontshare" && font.cssUrl) {
      await injectDraftingFontStylesheet(font)
    } else if (font.source === "local" && font.cssText) {
      injectDraftingFontStyle(font)
    }

    loadedFontIds.add(font.id)
    await waitForDraftingFont(font)
  })()

  fontReadyPromises.set(font.id, task)
  void task.finally(() => {
    if (fontReadyPromises.get(font.id) === task) {
      fontReadyPromises.delete(font.id)
    }
  })

  return task
}

export async function ensureDraftingFontsForLayers(layers: readonly DraftingCanvasLayer[]) {
  const fontIds = new Set<string>()
  const visit = (layer: DraftingCanvasLayer) => {
    if (layer.kind === "text") {
      fontIds.add(resolveDraftingFont({ fontFamily: layer.fontFamily, fontId: layer.fontId }).id)
    }
    layer.children?.forEach(visit)
  }

  layers.forEach(visit)
  await Promise.all([...fontIds].map(loadDraftingFont))
}

export function isDraftingFontLoaded(fontId: string | null | undefined) {
  const font = getDraftingFontById(fontId)
  return font ? loadedFontIds.has(font.id) : false
}

function injectDraftingFontStylesheet(font: DraftingFontRegistryEntry) {
  const linkId = getDraftingFontElementId(font.id)
  const existing = document.getElementById(linkId) as HTMLLinkElement | null

  if (existing) {
    return waitForStylesheetLink(existing)
  }

  const link = document.createElement("link")
  link.id = linkId
  link.rel = "stylesheet"
  link.href = font.cssUrl!
  document.head.appendChild(link)

  return waitForStylesheetLink(link)
}

function injectDraftingFontStyle(font: DraftingFontRegistryEntry) {
  const styleId = getDraftingFontElementId(font.id)

  if (document.getElementById(styleId)) {
    return
  }

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = font.cssText!
  document.head.appendChild(style)
}

async function waitForDraftingFont(font: DraftingFontRegistryEntry) {
  if (!("fonts" in document)) {
    return
  }

  try {
    await Promise.all(
      font.weights.map((weight) => document.fonts.load(`${weight} 32px "${font.family}"`)),
    )
  } catch {
    // Fontshare/local font failures should not block editing with fallback fonts.
  }
}

function waitForStylesheetLink(link: HTMLLinkElement) {
  return new Promise<void>((resolve) => {
    if (link.dataset.draftingFontLoaded === "true") {
      resolve()
      return
    }

    try {
      if (link.sheet) {
        link.dataset.draftingFontLoaded = "true"
        resolve()
        return
      }
    } catch {
      // Cross-origin stylesheets can throw when reading sheet.
    }

    const done = () => {
      link.dataset.draftingFontLoaded = "true"
      resolve()
    }
    link.addEventListener("load", done, { once: true })
    link.addEventListener("error", done, { once: true })
  })
}

function getDraftingFontElementId(fontId: string) {
  return `drafting-font-${fontId.replace(/[^a-z0-9]+/gi, "-")}`
}

function normalizeDraftingFontFamilyKey(fontFamily: string) {
  return fontFamily.trim().replace(/^["']|["']$/g, "").toLowerCase()
}

function normalizeUnknownFontFamily(fontFamily: string | null | undefined) {
  const normalized = fontFamily?.trim().replace(/^["']|["']$/g, "")

  return normalized || resolveDraftingFont().family
}
