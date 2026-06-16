import { describe, expect, it } from "vitest"

import { getTemplateById } from "@/features/studio-hub/model/templates"
import {
  buildDocumentPreviewMarkup,
  HUB_CARD_DOCUMENT_PREVIEW_OPTIONS,
} from "@/features/qr-code/rendering/document-preview"

describe("document-preview", () => {
  it("renders real QR svg markup from a template document", async () => {
    const template = getTemplateById("minimal-ink")
    expect(template).toBeDefined()

    const markup = await buildDocumentPreviewMarkup(template!.document)

    expect(markup).toContain("<svg")
    expect(markup).toContain('data-testid="finder-patterns-outer"')
    expect(markup).toContain("#111827")
  })

  it("softens hub card previews with inset padding and no layer shadows", async () => {
    const template = getTemplateById("minimal-ink")
    expect(template).toBeDefined()

    const markup = await buildDocumentPreviewMarkup(
      template!.document,
      HUB_CARD_DOCUMENT_PREVIEW_OPTIONS,
    )

    expect(markup).toContain("<svg")
    expect(markup).not.toContain("feDropShadow")
    expect(markup).toMatch(/viewBox="-[\d.]+ -[\d.]+ [\d.]+ [\d.]+"/i)
  })
})
