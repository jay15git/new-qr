import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  addDashboardComposeImageNode,
  createDashboardComposeScene,
  createDashboardDocumentComposeScene,
  DASHBOARD_QR_NODE_ID,
  DASHBOARD_QR_STAGE_FIT_RATIO,
  type DashboardComposeScene,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"
import {
  DashboardComposeSurface,
  getNextDashboardQrSize,
} from "@/components/qr/dashboard-compose-surface"
import type { QrQualityReport } from "@/components/qr/qr-quality"

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
        selectedNodeId={DASHBOARD_QR_NODE_ID}
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

  it("can expose direct qr transform affordances without edit mode", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        allowDirectNodeTransforms
        errorMessage={null}
        isEditMode={false}
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

    expect(markup).toContain('aria-label="Rotate QR"')
    expect(markup).toContain('aria-label="Resize QR from top left"')
    expect(markup).toContain('aria-label="Resize QR from top right"')
    expect(markup).toContain('aria-label="Resize QR from bottom left"')
    expect(markup).toContain('aria-label="Resize QR from bottom right"')
    expect(markup).toContain("320 × 320")
    expect(markup).toContain("rounded-[4px] border border-black")
    expect(markup).toContain("bg-black/72")
    expect(markup).toContain("h-6 w-6 items-center justify-center rounded-[4px] border border-black")
    expect(markup).not.toContain("border-sky-600")
    expect(markup).not.toContain("text-sky-700")
  })

  it("keeps the default dashboard surface tint and allows a neutral variant", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const dashboardMarkup = renderToStaticMarkup(
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

    const neutralMarkup = renderToStaticMarkup(
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
        surfaceAppearance="neutral"
      />,
    )

    expect(dashboardMarkup).toContain('data-surface-appearance="dashboard"')
    expect(dashboardMarkup).toContain("background-color:#e8edf4")
    expect(dashboardMarkup).toContain('data-toolbar-appearance="dashboard"')
    expect(neutralMarkup).toContain('data-surface-appearance="neutral"')
    expect(neutralMarkup).toContain("background-color:#ececec")
    expect(neutralMarkup).toContain('data-toolbar-appearance="neutral"')
    expect(neutralMarkup).toContain("border-[#00000017]")
    expect(neutralMarkup).not.toContain("background-color:#e8edf4")
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

    expect(markup).not.toContain('aria-label="Rotate QR"')
    expect(markup).toContain('aria-label="Resize QR from top left"')
    expect(markup).toContain('aria-label="Resize QR from top right"')
    expect(markup).toContain('aria-label="Resize QR from bottom left"')
    expect(markup).toContain('aria-label="Resize QR from bottom right"')
  })

  it("renders the add qr toolbar action when a handler is supplied", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={true}
        onAddQrCode={vi.fn()}
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

    expect(markup).toContain('aria-label="Add QR code"')
  })

  it("visually elevates the selected qr without changing its stored z-index", () => {
    const scene = addDashboardComposeImageNode(
      upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD),
      {
        id: "image-node",
        imageUrl: "/landscape.png",
        name: "Landscape",
        naturalHeight: 600,
        naturalWidth: 1200,
      },
    )

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

    expect(markup).toContain(`data-node-id="${DASHBOARD_QR_NODE_ID}"`)
    expect(markup).toContain('data-z-index="1"')
    expect(markup).toContain("drop-shadow-[0_22px_34px_rgba(15,23,42,0.28)]")
    expect(markup).toContain("z-index:10000")
  })

  it("shows selected qr elevation and transform controls in document mode", () => {
    const scene = addDashboardComposeImageNode(
      upsertDashboardQrNode(createDashboardDocumentComposeScene(), QR_PAYLOAD),
      {
        id: "image-node",
        imageUrl: "/landscape.png",
        name: "Landscape",
        naturalHeight: 600,
        naturalWidth: 1200,
      },
    )

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
        selectedNodeId={DASHBOARD_QR_NODE_ID}
        surfaceAppearance="neutral"
        surfaceMode="document"
      />,
    )

    const imageNodeIndex = markup.indexOf('data-node-id="image-node"')
    const qrNodeIndex = markup.indexOf(`data-node-id="${DASHBOARD_QR_NODE_ID}"`)

    expect(imageNodeIndex).toBeGreaterThan(-1)
    expect(qrNodeIndex).toBeGreaterThan(imageNodeIndex)
    expect(markup).toContain('data-selected="true"')
    expect(markup).toContain("drop-shadow-[0_22px_34px_rgba(15,23,42,0.28)]")
    expect(markup).toContain("z-index:10000")
    expect(markup).toContain('aria-label="Rotate QR"')
    expect(markup).toContain('aria-label="Resize QR from top left"')
    expect(markup).not.toContain("border border-[#111111]")
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
      'bottom-[-2.75rem] left-1/2 -translate-x-1/2 rounded-[4px] border border-black/24 bg-white/92',
    )
    expect(markup).toContain("320 × 320")
    expect(markup).not.toContain(`${fittedSize} × ${fittedSize}`)
    expect(markup).not.toContain(
      'top-[-2.75rem] -translate-x-1/2 rounded-[4px] border border-black/24 bg-white/92',
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
        selectedNodeId={null}
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

  it("renders a white document page with guides when the drafting surface opts into document mode", () => {
    const scene = upsertDashboardQrNode(createDashboardDocumentComposeScene(), QR_PAYLOAD)

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
        surfaceAppearance="neutral"
        surfaceMode="document"
      />,
    )

    expect(markup).toContain("Document mode")
    expect(markup).toContain('aria-label="Toggle document mode"')
    expect(markup).toContain('data-compose-mode="document"')
    expect(markup).toContain('data-slot="dashboard-compose-document-guides"')
    expect(markup).toContain("dark:border-foreground/14")
    expect(markup).toContain("background:#ffffff")
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

  it("renders the dashboard quality panel with the current status", () => {
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
        qualityReport={createQualityReport({
          status: "readable",
          summary: "The composed dashboard scene decoded successfully at 2x.",
        })}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={null}
      />,
    )

    expect(markup).toContain('data-slot="dashboard-quality-panel"')
    expect(markup).toContain("Quality check")
    expect(markup).toContain("Readable")
  })

  it("renders risky reports with issue summaries and fix actions", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        isEditMode={false}
        onApplyQualitySuggestionPath={vi.fn()}
        onEditModeChange={vi.fn()}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        onSelectedNodeChange={vi.fn()}
        qualityReport={createQualityReport({
          issues: [
            {
              detail: "The weakest sampled contrast is 2.1:1.",
              paths: [
                {
                  actions: [
                    {
                      target: "dots",
                      type: "set-solid-color",
                      value: "#111827",
                    },
                  ],
                  detail: "Use #111827 on the dots to restore separation from the background.",
                  id: "dots-contrast-target-only",
                  impact: "target-only",
                  recommended: true,
                  title: "Change dots color",
                },
              ],
              id: "dots-contrast",
              scope: "Dots",
              severity: "error",
              title: "Body dots do not contrast enough against the QR background.",
            },
          ],
          status: "risky",
          summary: "The scene decoded at 2x, but 1 blocking issue still deserves attention.",
        })}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={null}
      />,
    )

    expect(markup).toContain("Risky")
    expect(markup).toContain("Body dots do not contrast enough")
    expect(markup).toContain("Change dots color")
  })

  it("renders unverified reports with the verification summary", () => {
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
        qualityReport={createQualityReport({
          decode: {
            kind: "unverified",
            reason: "Remote QR assets blocked pixel-level verification.",
          },
          status: "unverified",
          summary:
            "Remote QR assets blocked pixel-level verification. Heuristic checks found 0 blocking issues.",
        })}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
        selectedNodeId={null}
      />,
    )

    expect(markup).toContain("Unverified")
    expect(markup).toContain("Remote QR assets blocked pixel-level verification.")
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

function createQualityReport(
  overrides: Partial<QrQualityReport>,
): QrQualityReport {
  return {
    blockingIssueCount: 0,
    decode: {
      kind: "success",
      data: "https://new-qr-studio.local/launch",
      scale: 2,
    },
    issues: [],
    status: "readable",
    summary: "The composed dashboard scene decoded successfully at 2x.",
    warningIssueCount: 0,
    ...overrides,
  }
}
