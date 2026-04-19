import { describe, expect, it } from "vitest"

import {
  createDashboardComposeScene,
  DASHBOARD_COMPOSE_CANVAS_SIZE,
  DASHBOARD_COMPOSE_CANVAS_HEIGHT,
  DASHBOARD_QR_NODE_ID,
  DASHBOARD_QR_STAGE_FIT_RATIO,
  resetDashboardComposeCamera,
  resetDashboardQrNodeTransform,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"

const QR_PAYLOAD = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#fff" /><path d="M20 20h40v40H20z" fill="#111" /></svg>',
  naturalHeight: 320,
  naturalWidth: 320,
}

describe("dashboard compose scene helpers", () => {
  it("creates a transparent landscape dashboard scene by default", () => {
    const scene = createDashboardComposeScene()

    expect(scene.canvasSize).toEqual({
      width: DASHBOARD_COMPOSE_CANVAS_SIZE,
      height: DASHBOARD_COMPOSE_CANVAS_HEIGHT,
    })
    expect(scene.background).toEqual({
      mode: "transparent",
      color: "#ffffff",
    })
    expect(scene.camera).toEqual({
      panX: 0,
      panY: 0,
      zoom: 1,
    })
    expect(scene.nodes).toEqual([])
  })

  it("creates a centered svg-backed qr node at the dashboard fit size", () => {
    const scene = upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)

    expect(scene.nodes).toHaveLength(1)

    const node = scene.nodes[0]
    const expectedScale =
      Math.min(
        (DASHBOARD_COMPOSE_CANVAS_SIZE * DASHBOARD_QR_STAGE_FIT_RATIO) /
          QR_PAYLOAD.naturalWidth,
        (DASHBOARD_COMPOSE_CANVAS_HEIGHT * DASHBOARD_QR_STAGE_FIT_RATIO) /
          QR_PAYLOAD.naturalHeight,
      )
    const expectedXOffset =
      (DASHBOARD_COMPOSE_CANVAS_SIZE - QR_PAYLOAD.naturalWidth * expectedScale) / 2
    const expectedYOffset =
      (DASHBOARD_COMPOSE_CANVAS_HEIGHT - QR_PAYLOAD.naturalHeight * expectedScale) / 2

    expect(node.id).toBe(DASHBOARD_QR_NODE_ID)
    expect(node.kind).toBe("svg")
    expect(node.originalSvgMarkup).toContain("<svg")
    expect(node.scale).toBeCloseTo(expectedScale)
    expect(node.x).toBeCloseTo(expectedXOffset)
    expect(node.y).toBeCloseTo(expectedYOffset)
  })

  it("preserves the qr transform when new svg markup is applied", () => {
    const initialScene = upsertDashboardQrNode(
      createDashboardComposeScene(),
      QR_PAYLOAD,
    )
    const transformedNode = {
      ...initialScene.nodes[0],
      rotation: 24,
      scale: 1.84,
      x: 126,
      y: 148,
    }
    const transformedScene = {
      ...initialScene,
      nodes: [transformedNode],
    }
    const updatedPayload = {
      markup:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><circle cx="200" cy="200" r="160" fill="#111" /></svg>',
      naturalHeight: 400,
      naturalWidth: 400,
    }

    const nextScene = upsertDashboardQrNode(transformedScene, updatedPayload)
    const nextNode = nextScene.nodes[0]
    const previousCenterX =
      transformedNode.x +
      transformedNode.naturalWidth * transformedNode.scale * 0.5
    const previousCenterY =
      transformedNode.y +
      transformedNode.naturalHeight * transformedNode.scale * 0.5
    const nextCenterX = nextNode.x + nextNode.naturalWidth * nextNode.scale * 0.5
    const nextCenterY = nextNode.y + nextNode.naturalHeight * nextNode.scale * 0.5

    expect(nextNode.scale).toBe(transformedNode.scale)
    expect(nextNode.rotation).toBe(transformedNode.rotation)
    expect(nextNode.originalSvgMarkup).toContain("<circle")
    expect(nextCenterX).toBeCloseTo(previousCenterX)
    expect(nextCenterY).toBeCloseTo(previousCenterY)
  })

  it("resets both the dashboard camera and qr transform to the centered defaults", () => {
    const seededScene = upsertDashboardQrNode(
      createDashboardComposeScene(),
      QR_PAYLOAD,
    )
    const adjustedScene = {
      ...seededScene,
      camera: {
        panX: 90,
        panY: -48,
        zoom: 2.2,
      },
      nodes: [
        {
          ...seededScene.nodes[0],
          rotation: 48,
          scale: 1.35,
          x: 212,
          y: 188,
        },
      ],
    }

    const cameraReset = resetDashboardComposeCamera(adjustedScene)
    const transformReset = resetDashboardQrNodeTransform(adjustedScene)
    const resetNode = transformReset.nodes[0]

    expect(cameraReset.camera).toEqual({
      panX: 0,
      panY: 0,
      zoom: 1,
    })
    expect(resetNode.rotation).toBe(0)
    expect(resetNode.x).toBeCloseTo(seededScene.nodes[0].x)
    expect(resetNode.y).toBeCloseTo(seededScene.nodes[0].y)
    expect(resetNode.scale).toBeCloseTo(seededScene.nodes[0].scale)
  })
})
