// @vitest-environment jsdom

import { act, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DraftingLayersTab } from "@/components/new/drafting-layers-tab"
import {
  addDashboardComposeImageNode,
  createDashboardDocumentComposeScene,
  DASHBOARD_QR_NODE_ID,
  upsertDashboardQrNode,
  type DashboardComposeScene,
} from "@/components/qr/dashboard-compose-scene"

vi.mock("@/components/ui/draggable-list", () => ({
  DraggableList: ({
    children,
    items,
    onReorder,
  }: {
    children: ReactNode
    items: Array<{ id: string }>
    onReorder: (items: Array<{ id: string }>) => void
  }) => (
    <div data-slot="mock-draggable-list">
      <button
        aria-label="Mock reorder layers"
        onClick={() => onReorder([...items].reverse())}
        type="button"
      >
        Reorder
      </button>
      {children}
    </div>
  ),
  DraggableListHandle: ({ label }: { label: string }) => (
    <button aria-label={label} type="button">
      Handle
    </button>
  ),
  DraggableListItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const QR_PAYLOAD = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#fff" /><path d="M20 20h40v40H20z" fill="#111" /></svg>',
  naturalHeight: 320,
  naturalWidth: 320,
}

const cleanupCallbacks: Array<() => void> = []

afterEach(() => {
  for (const cleanup of cleanupCallbacks.splice(0)) {
    cleanup()
  }

  document.body.innerHTML = ""
})

describe("DraftingLayersTab", () => {
  it("renders rows for the qr layer and uploaded image layers with icon controls", () => {
    const view = renderHarness(createLayeredScene())

    expect(view.container.querySelectorAll('[data-slot="drafting-layer-row"]')).toHaveLength(2)
    expect(view.container.textContent).toContain("QR Code")
    expect(view.container.textContent).toContain("Landscape")
    expect(view.container.querySelector('button[aria-label="Hide QR Code"]')).not.toBeNull()
    expect(view.container.querySelector('button[aria-label="Lock QR Code"]')).not.toBeNull()
    expect(view.container.querySelector('button[aria-label="Delete Landscape"]')).not.toBeNull()
    expect(view.container.querySelector('button[aria-label="Delete QR Code"]')).toBeNull()
    expect(view.container.innerHTML).not.toMatch(
      /dark:[^"]*shadow-\[[^\]]*rgba\(255,255,255/,
    )
  })

  it("wires reorder interactions through the compose scene helpers", () => {
    const view = renderHarness(createLayeredScene())

    expect(getLayerNames(view.container)).toEqual(["Landscape", "QR Code"])

    act(() => {
      activateElement(getRequiredElement(view.container, 'button[aria-label="Mock reorder layers"]'))
    })

    expect(getLayerNames(view.container)).toEqual(["QR Code", "Landscape"])
  })

  it("falls back to the qr layer when deleting the selected image layer", () => {
    const view = renderHarness(createLayeredScene(), "image-node")

    expect(getRequiredElement(view.container, "[data-selected-node-id]").getAttribute("data-selected-node-id")).toBe(
      "image-node",
    )

    act(() => {
      activateElement(getRequiredElement(view.container, 'button[aria-label="Delete Landscape"]'))
    })

    expect(view.container.querySelectorAll('[data-slot="drafting-layer-row"]')).toHaveLength(1)
    expect(getRequiredElement(view.container, "[data-selected-node-id]").getAttribute("data-selected-node-id")).toBe(
      DASHBOARD_QR_NODE_ID,
    )
  })

  it("allows deleting an extra qr layer while preserving another qr selection fallback", () => {
    const view = renderHarness(createTwoQrScene(), "dashboard-qr-node-copy")

    expect(view.container.querySelectorAll('[data-slot="drafting-layer-row"]')).toHaveLength(2)
    expect(view.container.querySelector('button[aria-label="Delete QR Code 2"]')).not.toBeNull()

    act(() => {
      activateElement(getRequiredElement(view.container, 'button[aria-label="Delete QR Code 2"]'))
    })

    expect(view.container.querySelectorAll('[data-slot="drafting-layer-row"]')).toHaveLength(1)
    expect(
      getRequiredElement(view.container, "[data-selected-node-id]").getAttribute(
        "data-selected-node-id",
      ),
    ).toBe(DASHBOARD_QR_NODE_ID)
  })
})

function Harness({
  initialScene,
  initialSelectedNodeId,
}: {
  initialScene: DashboardComposeScene
  initialSelectedNodeId: string | null
}) {
  const [scene, setScene] = useState(initialScene)
  const [selectedNodeId, setSelectedNodeId] = useState(initialSelectedNodeId)

  return (
    <div data-selected-node-id={selectedNodeId ?? ""}>
      <DraftingLayersTab
        onSceneChange={setScene}
        onSelectedNodeChange={setSelectedNodeId}
        scene={scene}
        selectedNodeId={selectedNodeId}
      />
    </div>
  )
}

function renderHarness(
  initialScene: DashboardComposeScene,
  initialSelectedNodeId: string | null = DASHBOARD_QR_NODE_ID,
) {
  const container = document.createElement("div")
  const root = createRoot(container)

  act(() => {
    root.render(
      <Harness
        initialScene={initialScene}
        initialSelectedNodeId={initialSelectedNodeId}
      />,
    )
  })

  cleanupCallbacks.push(() => {
    act(() => {
      root.unmount()
    })
  })

  document.body.appendChild(container)

  return { container }
}

function createLayeredScene() {
  return addDashboardComposeImageNode(
    upsertDashboardQrNode(createDashboardDocumentComposeScene(), QR_PAYLOAD),
    {
      id: "image-node",
      imageUrl: "/landscape.png",
      name: "Landscape",
      naturalHeight: 600,
      naturalWidth: 1200,
    },
  )
}

function createTwoQrScene() {
  return upsertDashboardQrNode(
    upsertDashboardQrNode(createDashboardDocumentComposeScene(), QR_PAYLOAD),
    {
      ...QR_PAYLOAD,
      name: "QR Code 2",
    },
    "dashboard-qr-node-copy",
  )
}

function getLayerNames(parent: ParentNode) {
  return Array.from(parent.querySelectorAll('[data-slot="drafting-layer-row"] p:first-of-type')).map(
    (node) => node.textContent ?? "",
  )
}

function getRequiredElement(parent: ParentNode, selector: string) {
  const element = parent.querySelector(selector)

  expect(element).not.toBeNull()

  return element as HTMLElement
}

function activateElement(element: HTMLElement) {
  element.dispatchEvent(new MouseEvent("click", { bubbles: true }))
}
