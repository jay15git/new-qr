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
  it("renders the page controls with document presets and margin settings", () => {
    const scene = createLayeredScene()

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="page"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId={DASHBOARD_QR_NODE_ID}
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-page"')
    expect(markup).toContain("Letter portrait")
    expect(markup).toContain("A4 portrait")
    expect(markup).toContain("Safe margin")
    expect(markup).toContain("Guides on")
  })

  it("renders the qr placement controls in the position tab", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="position"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-position"')
    expect(markup).toContain("Center QR")
    expect(markup).toContain("Fit to page")
    expect(markup).toContain("Align on page")
    expect(markup).toContain("QR size")
  })

  it("renders the uploaded asset controls in the assets tab", () => {
    const scene = createLayeredScene()

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="assets"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId="image-node"
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-assets"')
    expect(markup).toContain('data-slot="dashboard-compose-image-upload"')
    expect(markup).toContain("Add image")
    expect(markup).toContain("1 assets")
    expect(markup).toContain("Landscape")
    expect(markup).toContain("Delete")
    expect(markup).not.toContain("Blend mode")
  })

  it("shows an empty state when the assets tab has no uploaded images", () => {
    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="assets"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={createDashboardComposeScene()}
        selectedNodeId={null}
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-assets"')
    expect(markup).toContain(
      "No extra assets yet. The QR remains the only exported object on the page.",
    )
    expect(markup).not.toContain("Landscape")
  })

  it("maps the legacy background section to the new page controls", () => {
    const scene = createLayeredScene()

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

    expect(markup).toContain('data-slot="dashboard-edit-page"')
    expect(markup).toContain("Letter portrait")
  })

  it("uses the drafting page layout for the /new page panel", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="page"
        appearance="drafting"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-page"')
    expect(markup).toContain("Page")
    expect(markup).toContain("Safe margin")
    expect(markup).toContain("Guides on")
  })

  it("uses the streamlined drafting layout for the /new assets panel", () => {
    const scene = createLayeredScene()

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="assets"
        appearance="drafting"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId="image-node"
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-assets"')
    expect(markup).toContain('data-slot="dashboard-compose-image-upload"')
    expect(markup).toContain('data-slot="drafting-layer-upload-button"')
    expect(markup).toContain("Add image")
    expect(markup).toContain("Choose file")
    expect(markup).toContain("Assets")
    expect(markup).toContain("1 assets")
    expect(markup).not.toContain("Composition stack")
  })

  it("renders all qr and image nodes in the drafting layers panel", () => {
    const scene = addDashboardComposeImageNode(
      upsertDashboardQrNode(
        upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD),
        {
          ...QR_PAYLOAD,
          name: "QR Code 2",
        },
        "dashboard-qr-node-copy",
      ),
      {
        id: "image-node",
        imageUrl: "/landscape.png",
        name: "Landscape",
        naturalHeight: 600,
        naturalWidth: 1200,
      },
    )

    const markup = renderToStaticMarkup(
      <DashboardEditControls
        activeSection="layers"
        appearance="drafting"
        onComposeImageUploadError={vi.fn()}
        onComposeImageUploadSuccess={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        scene={scene}
        selectedNodeId="dashboard-qr-node-copy"
      />,
    )

    expect(markup).toContain('data-slot="dashboard-edit-layers"')
    expect(markup).toContain("3 total")
    expect(markup).toContain("QR Code")
    expect(markup).toContain("QR Code 2")
    expect(markup).toContain("Landscape")
    expect(markup).toContain("Selected")
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
