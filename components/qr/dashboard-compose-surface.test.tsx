import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  addDashboardComposeImageNode,
  createDashboardComposeScene,
  DASHBOARD_QR_NODE_ID,
  DASHBOARD_QR_STAGE_FIT_RATIO,
  type DashboardComposeScene,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"
import {
  DashboardComposeSurface,
  getNextDashboardQrSize,
} from "@/components/qr/dashboard-compose-surface"

const QR_PAYLOAD = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#fff" /><path d="M20 20h40v40H20z" fill="#111" /></svg>',
  naturalHeight: 320,
  naturalWidth: 320,
}

describe("DashboardComposeSurface", () => {
  it("hides qr transform affordances while edit mode is off", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={false}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={null}
      />,
    )

    expect(markup).toContain("Edit mode")
    expect(markup).toContain('aria-label="Toggle edit mode"')
    expect(markup).not.toContain('aria-label="Rotate QR"')
    expect(markup).not.toContain('aria-label="Resize QR from top left"')
    expect(markup).not.toContain('aria-label="Resize QR from top right"')
    expect(markup).not.toContain('aria-label="Resize QR from bottom left"')
    expect(markup).not.toContain('aria-label="Resize QR from bottom right"')
    expect(markup).not.toContain("320 × 320")
  })

  it("projects scene node coordinates into pixel translation so resize stays centered visually", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)
    const node = scene.nodes[0]

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).toContain(
      `transform:translate(${node.x}px, ${node.y}px) rotate(${node.rotation}deg)`,
    )
  })

  it("renders interactive rotate and resize affordances when edit mode is on", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).toContain('aria-label="Rotate QR"')
    expect(markup).toContain('aria-label="Resize QR from top left"')
    expect(markup).toContain('aria-label="Resize QR from top right"')
    expect(markup).toContain('aria-label="Resize QR from bottom left"')
    expect(markup).toContain('aria-label="Resize QR from bottom right"')
  })

  it("renders the selected qr size label below the composer preview in edit mode", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)
    const fittedSize = Math.round(QR_PAYLOAD.naturalWidth * DASHBOARD_QR_STAGE_FIT_RATIO * 2)

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).toContain(
      'bottom-[-2.75rem] left-1/2 -translate-x-1/2 rounded-full border border-slate-300/90 bg-white/92',
    )
    expect(markup).toContain("320 × 320")
    expect(markup).not.toContain(`${fittedSize} × ${fittedSize}`)
    expect(markup).not.toContain(
      'top-[-2.75rem] -translate-x-1/2 rounded-full border border-slate-300/90 bg-white/92',
    )
  })

  it("converts resize drag distance into the next canonical qr size", () => {
    expect(
      getNextDashboardQrSize({
        nextDistance: 125,
        startDistance: 100,
        startSize: 320,
      }),
    ).toBe(400)
  })

  it("hides invisible nodes from the compose stage", () => {
    const seededScene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)
    const scene = {
      ...seededScene,
      nodes: [
        {
          ...seededScene.nodes[0],
          isVisible: false,
        },
      ],
    }

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).not.toContain('data-slot="dashboard-compose-node"')
    expect(markup).not.toContain('data-selected="true"')
  })

  it("renders locked nodes without transform handles while edit mode is on", () => {
    const seededScene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)
    const scene = {
      ...seededScene,
      nodes: [
        {
          ...seededScene.nodes[0],
          isLocked: true,
        },
      ],
    }

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={scene.nodes[0]?.id ?? null}
      />,
    )

    expect(markup).toContain('data-locked="true"')
    expect(markup).not.toContain('aria-label="Rotate QR"')
    expect(markup).not.toContain('aria-label="Resize QR from top left"')
  })

  it("renders image nodes as canvas layers", () => {
    const scene = createLayeredScene()

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId="image-node"
      />,
    )

    expect(markup).toContain('data-node-id="image-node"')
    expect(markup).toContain('src="/landscape.png"')
    expect(markup).toContain('alt="Landscape"')
    expect(markup).toContain('aria-label="Rotate Landscape"')
  })

  it("renders lower z-index nodes first so higher z-index nodes appear above them", () => {
    const scene = createLayeredScene()

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={DASHBOARD_QR_NODE_ID}
      />,
    )

    const backgroundNodeIndex = markup.indexOf(`data-node-id="${DASHBOARD_QR_NODE_ID}"`)
    const foregroundNodeIndex = markup.indexOf('data-node-id="image-node"')

    expect(backgroundNodeIndex).toBeGreaterThan(-1)
    expect(foregroundNodeIndex).toBeGreaterThan(backgroundNodeIndex)
    expect(markup).toContain(`data-node-id="${DASHBOARD_QR_NODE_ID}"`)
    expect(markup).toContain('data-z-index="1"')
    expect(markup).toContain('data-node-id="image-node"')
    expect(markup).toContain('data-z-index="2"')
  })

  it("hides invisible image nodes from the compose stage", () => {
    const scene = {
      ...createLayeredScene(),
      nodes: createLayeredScene().nodes.map((node) =>
        node.id === "image-node" ? { ...node, isVisible: false } : node,
      ),
    }

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId="image-node"
      />,
    )

    expect(markup).not.toContain('data-node-id="image-node"')
  })

  it("renders locked image nodes without image transform handles while selected", () => {
    const scene = {
      ...createLayeredScene(),
      nodes: createLayeredScene().nodes.map((node) =>
        node.id === "image-node" ? { ...node, isLocked: true } : node,
      ),
    }

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId="image-node"
      />,
    )

    expect(markup).toContain('data-node-id="image-node"')
    expect(markup).toContain('data-locked="true"')
    expect(markup).not.toContain('aria-label="Rotate Landscape"')
    expect(markup).not.toContain('aria-label="Resize Landscape from top left"')
  })

  it("renders gradient canvas backgrounds on the stage container", () => {
    const scene: DashboardComposeScene = {
      ...upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD),
      background: {
        mode: "gradient" as const,
        color: "#ffffff",
        gradient: {
          enabled: true,
          type: "linear" as const,
          rotation: Math.PI / 4,
          colorStops: [
            { offset: 0, color: "#111827" },
            { offset: 1, color: "#60a5fa" },
          ],
        },
      },
    }

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={false}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={null}
      />,
    )

    expect(markup).toContain("linear-gradient(45deg, #111827 0%, #60a5fa 100%)")
    expect(markup).toContain('data-slot="dashboard-compose-viewport"')
  })

  it("applies solid backgrounds to the full compose viewport", () => {
    const scene: DashboardComposeScene = {
      ...upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD),
      background: {
        ...createDashboardComposeScene().background,
        mode: "solid",
        color: "#ff7a59",
      },
    }

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={false}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={null}
      />,
    )

    expect(markup).toContain('data-slot="dashboard-compose-viewport"')
    expect(markup).toContain("background:#ff7a59")
  })
})

function createLayeredScene(): DashboardComposeScene {
  const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

  return addDashboardComposeImageNode(scene, {
    id: "image-node",
    imageUrl: "/landscape.png",
    name: "Landscape",
    naturalHeight: 600,
    naturalWidth: 1200,
  })
}
