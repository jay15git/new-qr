import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  createDashboardComposeScene,
  DASHBOARD_QR_STAGE_FIT_RATIO,
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
  it("renders interactive resize handles on all four qr corners", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
      />,
    )

    expect(markup).toContain('aria-label="Resize QR from top left"')
    expect(markup).toContain('aria-label="Resize QR from top right"')
    expect(markup).toContain('aria-label="Resize QR from bottom left"')
    expect(markup).toContain('aria-label="Resize QR from bottom right"')
  })

  it("projects scene node coordinates into pixel translation so resize stays centered visually", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)
    const node = scene.nodes[0]

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
      />,
    )

    expect(markup).toContain(
      `transform:translate(${node.x}px, ${node.y}px) rotate(${node.rotation}deg)`,
    )
  })

  it("renders the selected qr size label below the composer preview", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)
    const fittedSize = Math.round(QR_PAYLOAD.naturalWidth * DASHBOARD_QR_STAGE_FIT_RATIO * 2)

    const markup = renderToStaticMarkup(
      <DashboardComposeSurface
        errorMessage={null}
        onReset={vi.fn()}
        onQrSizeChange={vi.fn()}
        onSceneChange={vi.fn()}
        qrSize={QR_PAYLOAD.naturalWidth}
        scene={scene}
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
})
