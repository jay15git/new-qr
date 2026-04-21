import { describe, expect, it } from "vitest"

import {
  addDashboardComposeImageNode,
  createDashboardComposeScene,
  updateDashboardComposeBackground,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"
import {
  analyzeQrQuality,
  applyQrQualityFix,
  applyQrQualitySuggestionPath,
  mergeQrQualityReportWithDecode,
} from "@/components/qr/qr-quality"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

const QR_PAYLOAD = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#fff" /><path d="M20 20h40v40H20z" fill="#111" /></svg>',
  naturalHeight: 320,
  naturalWidth: 320,
}

describe("qr quality analysis", () => {
  it("treats the default qr studio state as high contrast", () => {
    const state = createReadableState()
    const scene = createDashboardScene()
    const report = analyzeQrQuality(state, scene)

    expect(report.blockingIssueCount).toBe(0)
    expect(report.warningIssueCount).toBe(0)
    expect(report.issues).toHaveLength(0)
  })

  it("flags low body contrast and suggests a deterministic replacement color", () => {
    const state = createDefaultQrStudioState()
    state.dotsOptions.color = "#f8fafc"
    state.backgroundOptions.color = "#ffffff"

    const report = analyzeQrQuality(state, createDashboardScene())
    const issue = report.issues.find((entry) => entry.id === "dots-contrast")

    expect(issue).toBeDefined()
    expect(issue?.severity).toBe("error")
    expect(issue?.paths).toHaveLength(2)
    expect(issue?.paths.some((path) => path.recommended)).toBe(true)
    expect(issue?.paths.map((path) => path.impact)).toEqual(
      expect.arrayContaining(["target-only", "qr-background"]),
    )
    expect(
      issue?.paths.find((path) => path.impact === "target-only")?.actions.at(-1),
    ).toMatchObject({
      target: "dots",
      type: "set-solid-color",
    })
  })

  it("offers both foreground and background paths for low finder-frame contrast", () => {
    const state = createDefaultQrStudioState()
    state.cornersSquareOptions.color = "#111111"
    state.backgroundOptions.color = "#000000"

    const report = analyzeQrQuality(state, createDashboardScene())
    const issue = report.issues.find((entry) => entry.id === "corner-square-contrast")

    expect(issue).toBeDefined()
    expect(issue?.scope).toBe("Corner square")
    expect(issue?.paths.map((path) => path.impact)).toEqual(
      expect.arrayContaining(["target-only", "qr-background"]),
    )
    expect(
      issue?.paths.find((path) => path.impact === "target-only")?.actions.at(-1),
    ).toMatchObject({
      target: "cornersSquare",
      type: "set-solid-color",
    })
  })

  it("treats any weak palette swatch as a body contrast failure", () => {
    const state = createDefaultQrStudioState()
    state.dotsColorMode = "palette"
    state.dotsPalette = ["#111827", "#e5e7eb", "#0f172a", "#f8fafc"]
    state.backgroundOptions.color = "#ffffff"

    const report = analyzeQrQuality(state, createDashboardScene())

    expect(report.issues.some((issue) => issue.id === "dots-contrast")).toBe(true)
  })

  it("flags a quiet zone below four modules and suggests a wider margin", () => {
    const state = createDefaultQrStudioState()
    state.margin = 4

    const report = analyzeQrQuality(state, createDashboardScene())
    const issue = report.issues.find((entry) => entry.id === "quiet-zone")

    expect(issue).toBeDefined()
    expect(issue?.paths[0]?.actions[0]).toMatchObject({
      type: "set-quiet-zone",
    })
  })

  it("flags oversized logos and suggests shrinking them", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "url",
      value: "https://example.com/logo.png",
    }
    state.imageOptions.imageSize = 0.7

    const report = analyzeQrQuality(state, createDashboardScene())
    const issue = report.issues.find((entry) => entry.id === "logo-coverage")

    expect(issue).toBeDefined()
    expect(issue?.severity).toBe("error")
    expect(issue?.paths.flatMap((path) => path.actions).map((action) => action.type)).toContain(
      "set-logo-size",
    )
  })

  it("warns when decorative dots are used at a small module size", () => {
    const state = createDefaultQrStudioState()
    state.width = 120
    state.height = 120
    state.dotsOptions.type = "heart"

    const report = analyzeQrQuality(state, createDashboardScene())
    const issue = report.issues.find((entry) => entry.id === "decorative-dot-shape")

    expect(issue).toBeDefined()
    expect(issue?.severity).toBe("warning")
    expect(issue?.paths[0]?.actions[0]).toMatchObject({
      type: "set-dot-shape",
    })
  })

  it("flags compose image layers that overlap the qr on the dashboard", () => {
    const report = analyzeQrQuality(
      createDefaultQrStudioState(),
      createLayeredDashboardScene(),
    )
    const issue = report.issues.find((entry) =>
      entry.id.startsWith("compose-overlap-"),
    )

    expect(issue).toBeDefined()
    expect(issue?.paths.flatMap((path) => path.actions).map((action) => action.type)).toContain(
      "hide-compose-layer",
    )
  })

  it("uses the compose scene background path when the qr background is transparent", () => {
    const state = createDefaultQrStudioState()
    state.backgroundOptions.transparent = true
    state.dotsOptions.color = "#111827"
    const scene = updateDashboardComposeBackground(createDashboardScene(), {
      color: "#111827",
      mode: "solid",
    })

    const report = analyzeQrQuality(state, scene)
    const issue = report.issues.find((entry) => entry.id === "dots-contrast")

    expect(issue).toBeDefined()
    expect(issue?.paths.map((path) => path.impact)).toEqual([
      "target-only",
      "scene-background",
    ])
  })

  it("offers a background-image removal path when a background image is active", () => {
    const state = createDefaultQrStudioState()
    state.backgroundImage = {
      source: "upload",
      value: "blob:background-image",
    }
    state.dotsOptions.color = "#111111"
    state.backgroundOptions.color = "#111111"

    const report = analyzeQrQuality(state, createDashboardScene())
    const issue = report.issues.find((entry) => entry.id === "dots-contrast")

    expect(issue).toBeDefined()
    expect(issue?.paths.map((path) => path.impact)).toContain("asset-removal")
  })

  it("keeps contrast path ranking deterministic across repeated analyses", () => {
    const state = createDefaultQrStudioState()
    state.dotsOptions.color = "#f8fafc"
    state.backgroundOptions.color = "#ffffff"
    const scene = createDashboardScene()

    const first = analyzeQrQuality(state, scene)
    const second = analyzeQrQuality(state, scene)
    const firstIssue = first.issues.find((entry) => entry.id === "dots-contrast")
    const secondIssue = second.issues.find((entry) => entry.id === "dots-contrast")

    expect(firstIssue?.paths.map((path) => path.id)).toEqual(
      secondIssue?.paths.map((path) => path.id),
    )
    expect(firstIssue?.paths.find((path) => path.recommended)?.id).toBe(
      secondIssue?.paths.find((path) => path.recommended)?.id,
    )
  })
})

describe("qr quality fixes", () => {
  it("applies a solid color fix without clobbering unrelated qr state", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "preset",
      presetColor: "#111827",
      presetId: "github" as never,
      value: "data:image/svg+xml,%3Csvg%20/%3E",
    }
    state.dotsColorMode = "gradient"
    state.dotsGradient.enabled = true
    const scene = createDashboardScene()

    const result = applyQrQualityFix(state, scene, {
      target: "dots",
      type: "set-solid-color",
      value: "#101010",
    })

    expect(result.state.dotsColorMode).toBe("solid")
    expect(result.state.dotsOptions.color).toBe("#101010")
    expect(result.state.dotsGradient.enabled).toBe(false)
    expect(result.state.logo.value).toBe(state.logo.value)
    expect(result.scene).toEqual(scene)
  })

  it("hides the requested compose layer and preserves the qr node", () => {
    const state = createDefaultQrStudioState()
    const scene = createLayeredDashboardScene()
    const imageNode = scene.nodes.find((node) => node.kind === "image")

    const result = applyQrQualityFix(state, scene, {
      nodeId: imageNode?.id ?? "",
      type: "hide-compose-layer",
    })

    expect(result.scene.nodes.find((node) => node.id === imageNode?.id)?.isVisible).toBe(
      false,
    )
    expect(result.scene.nodes.find((node) => node.kind === "svg")?.isVisible).toBe(true)
    expect(result.state).toEqual(state)
  })

  it("applies multi-action suggestion paths without dropping unrelated state", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "preset",
      presetColor: "#111827",
      presetId: "github" as never,
      value: "data:image/svg+xml,%3Csvg%20/%3E",
    }
    state.backgroundImage = {
      source: "upload",
      value: "blob:background-image",
    }
    state.backgroundGradient.enabled = true
    state.backgroundGradient.colorStops = [
      { color: "#111111", offset: 0 },
      { color: "#161616", offset: 1 },
    ]
    state.dotsOptions.color = "#111111"
    const scene = createDashboardScene()
    const report = analyzeQrQuality(state, scene)
    const issue = report.issues.find((entry) => entry.id === "dots-contrast")
    const path = issue?.paths.find((entry) => entry.impact === "asset-removal")

    expect(path?.actions.map((action) => action.type)).toEqual([
      "disable-gradient",
      "set-background-color",
    ])

    const result = applyQrQualitySuggestionPath(state, scene, path ?? { actions: [] })

    expect(result.state.backgroundGradient.enabled).toBe(false)
    expect(result.state.backgroundImage.source).toBe("none")
    expect(result.state.backgroundOptions.transparent).toBe(false)
    expect(result.state.logo.value).toBe(state.logo.value)
  })
})

describe("qr quality status merging", () => {
  it("marks a clean, decoded scene as readable", () => {
    const report = analyzeQrQuality(
      createReadableState(),
      createDashboardScene(),
    )

    const merged = mergeQrQualityReportWithDecode(report, {
      data: "https://new-qr-studio.local/launch",
      kind: "success",
      scale: 2,
    })

    expect(merged.status).toBe("readable")
  })

  it("marks a failed decode as unreadable", () => {
    const state = createDefaultQrStudioState()
    state.dotsOptions.color = "#f8fafc"

    const report = analyzeQrQuality(state, createDashboardScene())
    const merged = mergeQrQualityReportWithDecode(report, {
      kind: "failure",
      scaleTried: 2,
    })

    expect(merged.status).toBe("unreadable")
  })

  it("marks remote-asset verification failures as unverified", () => {
    const report = analyzeQrQuality(
      createDefaultQrStudioState(),
      createDashboardScene(),
    )
    const merged = mergeQrQualityReportWithDecode(report, {
      kind: "unverified",
      reason: "Remote QR assets blocked pixel-level verification.",
    })

    expect(merged.status).toBe("unverified")
    expect(merged.summary).toContain("Remote QR assets")
  })
})

function createDashboardScene() {
  return upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)
}

function createLayeredDashboardScene() {
  return addDashboardComposeImageNode(createDashboardScene(), {
    id: "overlap-image",
    imageUrl: "/overlay.png",
    name: "Overlay",
    naturalHeight: 360,
    naturalWidth: 420,
  })
}

function createReadableState() {
  const state = createDefaultQrStudioState()
  state.margin = 40
  return state
}
