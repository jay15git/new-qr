// @vitest-environment jsdom

import { act } from "react"
import type { ComponentProps } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  createDashboardComposeScene,
  DASHBOARD_QR_NODE_ID,
  upsertDashboardQrNode,
  type DashboardComposeScene,
} from "@/components/qr/dashboard-compose-scene"
import { DashboardComposeSurface } from "@/components/qr/dashboard-compose-surface"

const QR_PAYLOAD = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#fff" /><path d="M20 20h40v40H20z" fill="#111" /></svg>',
  naturalHeight: 320,
  naturalWidth: 320,
}

let nextAnimationFrameId = 1
let animationFrameQueue = new Map<number, FrameRequestCallback>()
const cleanupCallbacks: Array<() => void> = []

beforeEach(() => {
  nextAnimationFrameId = 1
  animationFrameQueue = new Map()

  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextAnimationFrameId++
    animationFrameQueue.set(id, callback)
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    animationFrameQueue.delete(id)
  })
  vi.stubGlobal(
    "PointerEvent",
    window.PointerEvent ?? (MouseEvent as unknown as typeof PointerEvent),
  )
})

afterEach(() => {
  for (const cleanup of cleanupCallbacks.splice(0)) {
    cleanup()
  }

  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})

describe("DashboardComposeSurface interactions", () => {
  it("updates drag position live but commits the scene only on pointer release", () => {
    const scene = createDashboardScene()
    const node = scene.nodes[0]
    const onSceneChange = vi.fn()
    const surface = renderSurface({
      onSceneChange,
      scene,
      selectedNodeId: DASHBOARD_QR_NODE_ID,
    })

    dispatchPointer(surface.getNode(DASHBOARD_QR_NODE_ID), "pointerdown", {
      clientX: node.x + 24,
      clientY: node.y + 24,
    })
    dispatchPointer(window, "pointermove", {
      clientX: node.x + 64,
      clientY: node.y + 54,
    })
    flushAnimationFrames()

    expect(onSceneChange).not.toHaveBeenCalled()
    expect(surface.getNode(DASHBOARD_QR_NODE_ID).style.transform).toContain(
      `translate(${node.x + 40}px, ${node.y + 30}px)`,
    )

    dispatchPointer(window, "pointerup", {
      clientX: node.x + 64,
      clientY: node.y + 54,
    })

    expect(onSceneChange).toHaveBeenCalledTimes(1)
    expect(getCommittedScene(onSceneChange).nodes[0]?.x).toBe(node.x + 40)
    expect(getCommittedScene(onSceneChange).nodes[0]?.y).toBe(node.y + 30)
  })

  it("keeps qr resize live in the badge and flushes the final qr size once on release", () => {
    const scene = createDashboardScene()
    const node = scene.nodes[0]
    const width = node.naturalWidth * node.scale
    const height = node.naturalHeight * node.scale
    const centerX = node.x + width * 0.5
    const centerY = node.y + height * 0.5
    const cornerX = node.x + width
    const cornerY = node.y + height
    const onSceneChange = vi.fn()
    const onQrSizeChange = vi.fn()
    const surface = renderSurface({
      onQrSizeChange,
      onSceneChange,
      scene,
      selectedNodeId: DASHBOARD_QR_NODE_ID,
    })

    dispatchPointer(getRequiredElement(surface.container, '[aria-label="Resize QR from bottom right"]'), "pointerdown", {
      clientX: cornerX,
      clientY: cornerY,
    })
    dispatchPointer(window, "pointermove", {
      clientX: centerX + (cornerX - centerX) * 1.25,
      clientY: centerY + (cornerY - centerY) * 1.25,
    })
    flushAnimationFrames()

    expect(onSceneChange).not.toHaveBeenCalled()
    expect(onQrSizeChange).not.toHaveBeenCalled()
    expect(surface.container.textContent).toContain("400 × 400")

    dispatchPointer(window, "pointerup", {
      clientX: centerX + (cornerX - centerX) * 1.25,
      clientY: centerY + (cornerY - centerY) * 1.25,
    })

    expect(onSceneChange).toHaveBeenCalledTimes(1)
    expect(onQrSizeChange).toHaveBeenCalledTimes(1)
    expect(onQrSizeChange.mock.calls[0]?.[0]).toBeCloseTo(400)
    expect(getCommittedScene(onSceneChange).nodes[0]?.naturalWidth).toBeCloseTo(400)
  })

  it("does not expose qr rotation handles in the compose surface", () => {
    const scene = createDashboardScene()
    const onSceneChange = vi.fn()
    const surface = renderSurface({
      onSceneChange,
      scene,
      selectedNodeId: DASHBOARD_QR_NODE_ID,
    })

    expect(surface.container.querySelector('[aria-label="Rotate QR"]')).toBeNull()
    expect(onSceneChange).not.toHaveBeenCalled()
  })

  it("allows document-mode qr movement without enabling the separate edit toggle", () => {
    const scene = createDashboardScene()
    const node = scene.nodes[0]
    const onSceneChange = vi.fn()
    const onSelectedNodeChange = vi.fn()
    const surface = renderSurface({
      isEditMode: false,
      onSceneChange,
      onSelectedNodeChange,
      scene,
      selectedNodeId: null,
      surfaceMode: "document",
    })

    dispatchPointer(surface.getNode(DASHBOARD_QR_NODE_ID), "pointerdown", {
      clientX: 120,
      clientY: 120,
    })
    dispatchPointer(window, "pointermove", {
      clientX: 180,
      clientY: 180,
    })
    flushAnimationFrames()
    dispatchPointer(window, "pointerup", {
      clientX: 180,
      clientY: 180,
    })

    expect(onSelectedNodeChange).toHaveBeenCalledWith(DASHBOARD_QR_NODE_ID)
    expect(onSceneChange).toHaveBeenCalledTimes(1)
    expect(getCommittedScene(onSceneChange).nodes[0]?.x).toBe(node.x + 60)
    expect(getCommittedScene(onSceneChange).nodes[0]?.y).toBe(node.y + 60)
  })

  it("allows direct qr movement without enabling edit mode when opted in", () => {
    const scene = createDashboardScene()
    const node = scene.nodes[0]
    const onSceneChange = vi.fn()
    const onSelectedNodeChange = vi.fn()
    const surface = renderSurface({
      allowDirectNodeTransforms: true,
      isEditMode: false,
      onSceneChange,
      onSelectedNodeChange,
      scene,
      selectedNodeId: null,
    })

    dispatchPointer(surface.getNode(DASHBOARD_QR_NODE_ID), "pointerdown", {
      clientX: 120,
      clientY: 120,
    })
    dispatchPointer(window, "pointermove", {
      clientX: 180,
      clientY: 180,
    })
    flushAnimationFrames()
    dispatchPointer(window, "pointerup", {
      clientX: 180,
      clientY: 180,
    })

    expect(onSelectedNodeChange).toHaveBeenCalledWith(DASHBOARD_QR_NODE_ID)
    expect(onSceneChange).toHaveBeenCalledTimes(1)
    expect(getCommittedScene(onSceneChange).nodes[0]?.x).toBe(node.x + 60)
    expect(getCommittedScene(onSceneChange).nodes[0]?.y).toBe(node.y + 60)
  })

  it("allows direct qr rotation without enabling edit mode when opted in", () => {
    const scene = createDashboardScene()
    const node = scene.nodes[0]
    const width = node.naturalWidth * node.scale
    const height = node.naturalHeight * node.scale
    const centerX = node.x + width * 0.5
    const centerY = node.y + height * 0.5
    const onSceneChange = vi.fn()
    const surface = renderSurface({
      allowDirectNodeTransforms: true,
      isEditMode: false,
      onSceneChange,
      scene,
      selectedNodeId: DASHBOARD_QR_NODE_ID,
    })

    dispatchPointer(getRequiredElement(surface.container, '[aria-label="Rotate QR"]'), "pointerdown", {
      clientX: centerX,
      clientY: centerY - 160,
    })
    dispatchPointer(window, "pointermove", {
      clientX: centerX + 160,
      clientY: centerY,
    })
    flushAnimationFrames()
    dispatchPointer(window, "pointerup", {
      clientX: centerX + 160,
      clientY: centerY,
    })

    expect(onSceneChange).toHaveBeenCalledTimes(1)
    expect(getCommittedScene(onSceneChange).nodes[0]?.rotation).toBeCloseTo(90)
  })

  it("resyncs the draft canvas from incoming scene props when no interaction is active", () => {
    const scene = createDashboardScene()
    const surface = renderSurface({
      scene,
      selectedNodeId: DASHBOARD_QR_NODE_ID,
    })
    const nextScene: DashboardComposeScene = {
      ...scene,
      nodes: scene.nodes.map((node) =>
        node.id === DASHBOARD_QR_NODE_ID
          ? {
              ...node,
              x: node.x + 72,
              y: node.y + 18,
            }
          : node,
      ),
    }

    surface.rerender({
      scene: nextScene,
      selectedNodeId: DASHBOARD_QR_NODE_ID,
    })

    expect(surface.getNode(DASHBOARD_QR_NODE_ID).style.transform).toContain(
      `translate(${nextScene.nodes[0]?.x}px, ${nextScene.nodes[0]?.y}px)`,
    )
  })

  it("commits and clears interaction state when edit mode is turned off mid-drag", async () => {
    const scene = createDashboardScene()
    const node = scene.nodes[0]
    const onSceneChange = vi.fn()
    const surface = renderSurface({
      onSceneChange,
      scene,
      selectedNodeId: DASHBOARD_QR_NODE_ID,
    })

    dispatchPointer(surface.getNode(DASHBOARD_QR_NODE_ID), "pointerdown", {
      clientX: node.x + 24,
      clientY: node.y + 24,
    })
    dispatchPointer(window, "pointermove", {
      clientX: node.x + 60,
      clientY: node.y + 48,
    })
    flushAnimationFrames()

    surface.rerender({
      isEditMode: false,
      scene,
      selectedNodeId: null,
    })
    await flushMicrotasks()

    expect(onSceneChange).toHaveBeenCalledTimes(1)
    expect(surface.container.querySelector('[aria-label="Rotate QR"]')).toBeNull()

    const committedScene = getCommittedScene(onSceneChange)

    surface.rerender({
      isEditMode: true,
      scene: committedScene,
      selectedNodeId: DASHBOARD_QR_NODE_ID,
    })

    expect(surface.getNode(DASHBOARD_QR_NODE_ID).style.transform).toContain(
      `translate(${committedScene.nodes[0]?.x}px, ${committedScene.nodes[0]?.y}px)`,
    )
  })
})

function createDashboardScene() {
  return upsertDashboardQrNode(createDashboardComposeScene(), QR_PAYLOAD)
}

function flushAnimationFrames() {
  const callbacks = [...animationFrameQueue.values()]
  animationFrameQueue.clear()

  act(() => {
    for (const callback of callbacks) {
      callback(16)
    }
  })
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve()
  })
}

function dispatchPointer(
  target: EventTarget,
  type: string,
  coordinates: {
    clientX: number
    clientY: number
  },
) {
  const PointerEventCtor = window.PointerEvent ?? (MouseEvent as unknown as typeof PointerEvent)

  act(() => {
    target.dispatchEvent(
      new PointerEventCtor(type, {
        bubbles: true,
        button: 0,
        buttons: 1,
        clientX: coordinates.clientX,
        clientY: coordinates.clientY,
      }),
    )
  })
}

function getCommittedScene(onSceneChange: ReturnType<typeof vi.fn>) {
  const scene = onSceneChange.mock.calls[0]?.[0]

  expect(typeof scene).toBe("object")

  return scene as DashboardComposeScene
}

function getRequiredElement<T extends Element>(container: ParentNode, selector: string) {
  const element = container.querySelector(selector)

  expect(element).not.toBeNull()

  return element as T
}

function renderSurface(
  overrides: Partial<ComponentProps<typeof DashboardComposeSurface>>,
) {
  let props: ComponentProps<typeof DashboardComposeSurface> = {
    errorMessage: null,
    isEditMode: true,
    onEditModeChange: vi.fn(),
    onReset: vi.fn(),
    onQrSizeChange: vi.fn(),
    onSceneChange: vi.fn(),
    onSelectedNodeChange: vi.fn(),
    qrSize: QR_PAYLOAD.naturalWidth,
    scene: createDashboardScene(),
    selectedNodeId: DASHBOARD_QR_NODE_ID,
    ...overrides,
  }
  const container = document.createElement("div")
  const root = createRoot(container)

  document.body.appendChild(container)

  act(() => {
    root.render(<DashboardComposeSurface {...props} />)
  })
  setCanvasRect(container)
  cleanupCallbacks.push(() => {
    act(() => {
      root.unmount()
    })
  })

  return {
    container,
    getNode(nodeId: string) {
      return getRequiredElement<HTMLDivElement>(container, `[data-node-id="${nodeId}"]`)
    },
    rerender(
      nextOverrides: Partial<ComponentProps<typeof DashboardComposeSurface>>,
    ) {
      props = {
        ...props,
        ...nextOverrides,
      }

      act(() => {
        root.render(<DashboardComposeSurface {...props} />)
      })
      setCanvasRect(container)
    },
  }
}

function setCanvasRect(container: HTMLElement) {
  const canvas = getRequiredElement<HTMLDivElement>(
    container,
    '[data-slot="dashboard-compose-canvas"]',
  )

  Object.defineProperty(canvas, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      bottom: 640,
      height: 640,
      left: 0,
      right: 960,
      toJSON() {
        return this
      },
      top: 0,
      width: 960,
      x: 0,
      y: 0,
    }),
  })
}
