import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { DashboardEditControls } from "@/components/qr/dashboard-edit-controls"
import {
  addDashboardComposeImageNode,
  createDashboardComposeScene,
  DASHBOARD_QR_NODE_ID,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"

const QR_PAYLOAD = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#fff" /><path d="M20 20h40v40H20z" fill="#111" /></svg>',
  naturalHeight: 320,
  naturalWidth: 320,
}

describe("DashboardEditControls", () => {
  it("renders the draggable layers list in top-first stack order without inline inspector controls", () => {
    const scene = createLayeredScene()

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="layers"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId="image-node"
      />,
    )

    const imageIndex = markup.indexOf('data-node-id="image-node"')
    const qrIndex = markup.indexOf(`data-node-id="${DASHBOARD_QR_NODE_ID}"`)

    expect(markup).toContain('data-slot="dashboard-edit-layers"')
    expect(markup).toContain('data-slot="dashboard-compose-image-upload"')
    expect(markup).toContain('data-slot="draggable-list"')
    expect(markup).toContain('data-slot="draggable-list-handle"')
    expect(markup).toContain("Add image")
    expect(markup).toContain("Layers")
    expect(markup).toContain("Composition stack")
    expect(markup).toContain("QR Code")
    expect(markup).toContain("Landscape")
    expect(imageIndex).toBeGreaterThan(-1)
    expect(qrIndex).toBeGreaterThan(imageIndex)
    expect(qrIndex).toBeGreaterThan(-1)
    expect(markup).toContain("Hide")
    expect(markup).toContain("Lock")
    expect(markup).toContain("Delete")
    expect(markup).not.toContain("Delete layer")
    expect(markup).not.toContain("Blend mode")
    expect(markup).not.toContain("Scale")
    expect(markup).not.toContain("Layer name")
    expect(markup).not.toContain("Move up")
    expect(markup).not.toContain("Move down")
  })

  it("shows a disabled reorder affordance when only one layer exists", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="layers"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).toContain('data-slot="draggable-list-handle"')
    expect(markup).toContain('data-disabled="true"')
    expect(markup).toContain("Hide")
    expect(markup).toContain("Lock")
  })

  it("renders the selected layer controls in the inspector tab", () => {
    const scene = createLayeredScene()

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="inspector"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId="image-node"
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-inspector"')
    expect(markup).toContain('data-slot="dashboard-layer-inspector"')
    expect(markup).toContain("Inspector")
    expect(markup).toContain("Landscape")
    expect(markup).toContain("Blend mode")
    expect(markup).toContain("Scale")
    expect(markup).toContain("Delete layer")
    expect(markup).not.toContain("Composition stack")
  })

  it("shows an empty state when the inspector has no selected layer", () => {
    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="inspector"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={createDashboardComposeScene()}
        selectedNodeId={null}
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-inspector"')
    expect(markup).toContain(
      "Select a layer in Layers to edit its name, transform, opacity, and blend mode.",
    )
    expect(markup).not.toContain('data-slot="dashboard-layer-inspector"')
  })

  it("renders solid, gradient, and transparent canvas background options", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="background"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-background"')
    expect(markup).toContain("Solid")
    expect(markup).toContain("Gradient")
    expect(markup).toContain("Transparent")
    expect(markup).toMatch(/data-item-id="transparent"[^>]*data-state="open"/)
  })
})

function createLayeredScene() {
  return addDashboardComposeImageNode(
    upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD),
    {
      id: "image-node",
      imageUrl: "/landscape.png",
      name: "Landscape",
      naturalHeight: 600,
      naturalWidth: 1200,
    },
  )
}
