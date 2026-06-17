// @vitest-environment jsdom

import { type ComponentProps } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { DesktopElementInspector } from "@/features/desktop-shell/components/DesktopElementInspector"
import { FloatingToolbar } from "@/features/desktop-shell/components/FloatingToolbar"
import {
  createDraftingImageLayer,
  createDraftingShapeLayer,
  createDraftingTextLayer,
} from "@/features/workspace/model/layers"
import { renderWithAsyncJsdomRoot } from "@/test-utils/jsdom-react-root"

const NODE_ID = "test-node"

describe("DesktopElementInspector", () => {
  it("renders desktop element inspector slots for text layers", () => {
    const layer = createDraftingTextLayer(NODE_ID, { text: "Hello" })
    const markup = renderToStaticMarkup(
      <DesktopElementInspector layer={layer} onPatch={vi.fn()} />,
    )

    expect(markup).toContain('data-slot="desktop-element-inspector"')
    expect(markup).toContain('data-slot="desktop-transform-section"')
    expect(markup).toContain('data-slot="desktop-layer-text-inspector"')
    expect(markup).toContain('data-slot="desktop-effects-section"')
    expect(markup).not.toContain('data-slot="drafting-element-inspector"')
    expect(markup).not.toContain('data-slot="drafting-text-inspector"')
    expect(markup).not.toContain("border-[var(--drafting-line)]")
  })

  it("renders desktop shape inspector slots for shape layers", () => {
    const layer = createDraftingShapeLayer(NODE_ID)
    const markup = renderToStaticMarkup(
      <DesktopElementInspector layer={layer} onPatch={vi.fn()} />,
    )

    expect(markup).toContain('data-slot="desktop-layer-shape-inspector"')
    expect(markup).toContain('data-slot="desktop-layer-shape-options"')
    expect(markup).not.toContain('data-slot="drafting-shape-inspector"')
  })

  it("renders desktop image inspector slots for image layers", () => {
    const layer = createDraftingImageLayer(NODE_ID)
    const markup = renderToStaticMarkup(
      <DesktopElementInspector layer={layer} onPatch={vi.fn()} />,
    )

    expect(markup).toContain('data-slot="desktop-layer-image-inspector"')
    expect(markup).not.toContain('data-slot="drafting-image-inspector"')
  })
})

describe("FloatingToolbar selected element routing", () => {
  it("renders desktop element inspector when a canvas element is selected", async () => {
    const layer = createDraftingTextLayer(NODE_ID, { text: "Selected" })
    const surface = await renderWithAsyncJsdomRoot(
      <FloatingToolbar
        controller={
          {
            selectedElementLayer: layer,
            onElementLayerPatch: vi.fn(),
          } as ComponentProps<typeof FloatingToolbar>["controller"]
        }
      />,
    )

    expect(surface.container.querySelector('[data-slot="desktop-element-inspector"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-element-inspector"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="desktop-floating-inspector"]')?.getAttribute("aria-label")).toBe(
      "text element settings",
    )
  })
})
