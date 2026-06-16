import type { QrInputType } from "@/features/qr-code/content/input-options"

export type StudioHubTab = "create" | "templates" | "library"

export type StudioHubSource = "blank" | "prompt" | "template" | "library"

export type StudioNavigationIntent = {
  source: StudioHubSource
  inputType?: QrInputType
  prompt?: string
  templateId?: string
  designId?: string
  returnTab?: StudioHubTab
  transitionId?: string
}

export type StudioSessionMeta = {
  source: StudioHubSource
  returnTab: StudioHubTab
  designId?: string
  templateId?: string
  transitionId?: string
  prompt?: string
}

export const STUDIO_SESSION_KEY = "new-qr:studio-session"
export const STUDIO_THEME_KEY = "new-qr:desktop-theme"

export function parseStudioHubTab(value: string | null | undefined): StudioHubTab {
  if (value === "templates" || value === "library" || value === "create") {
    return value
  }

  return "create"
}

export function buildHubUrl(tab: StudioHubTab): string {
  if (tab === "create") {
    return "/"
  }

  return `/?tab=${tab}`
}

export function buildDesktopEditorUrl(intent: StudioNavigationIntent): string {
  const params = new URLSearchParams()

  params.set("source", intent.source)

  if (intent.returnTab && intent.returnTab !== "create") {
    params.set("returnTab", intent.returnTab)
  }

  if (intent.inputType) {
    params.set("inputType", intent.inputType)
  }

  if (intent.prompt) {
    params.set("prompt", intent.prompt)
  }

  if (intent.templateId) {
    params.set("templateId", intent.templateId)
  }

  if (intent.designId) {
    params.set("id", intent.designId)
  }

  if (intent.transitionId) {
    params.set("transitionId", intent.transitionId)
  }

  const query = params.toString()
  return query ? `/desktop?${query}` : "/desktop"
}

export function writeStudioSession(meta: StudioSessionMeta): void {
  try {
    window.sessionStorage.setItem(STUDIO_SESSION_KEY, JSON.stringify(meta))
  } catch {
    // Session metadata is optional when storage is unavailable.
  }
}

export function readStudioSession(): StudioSessionMeta | null {
  try {
    const raw = window.sessionStorage.getItem(STUDIO_SESSION_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StudioSessionMeta
    if (!parsed || typeof parsed.source !== "string" || typeof parsed.returnTab !== "string") {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function clearStudioSession(): void {
  try {
    window.sessionStorage.removeItem(STUDIO_SESSION_KEY)
  } catch {
    // Ignore storage failures.
  }
}
