// @vitest-environment jsdom

import { act, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DraftingLayersTab } from "@/components/new/drafting-layers-tab"
import { DASHBOARD_QR_NODE_ID } from "@/components/qr/dashboard-compose-scene"

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

const cleanupCallbacks: Array<() => void> = []

afterEach(() => {
  for (const cleanup of cleanupCallbacks.splice(0)) {
    cleanup()
  }

  document.body.innerHTML = ""
})

describe("DraftingLayersTab", () => {
  it("renders rows for qr layers with icon controls", () => {
    const view = renderHarness([
      { id: DASHBOARD_QR_NODE_ID, name: "QR Code" },
      { id: "qr-2", name: "QR Code 2" },
    ])

    expect(view.container.querySelectorAll('[data-slot="drafting-layer-row"]')).toHaveLength(2)
    expect(view.container.textContent).toContain("QR Code")
    expect(view.container.textContent).toContain("QR Code 2")
    expect(view.container.querySelector('button[aria-label="Delete QR Code"]')).toBeNull()
    expect(view.container.querySelector('button[aria-label="Delete QR Code 2"]')).not.toBeNull()
    expect(view.container.innerHTML).not.toMatch(
      /dark:[^"]*shadow-\[[^\]]*rgba\(255,255,255/,
    )
  })

  it("wires reorder interactions", () => {
    const view = renderHarness([
      { id: "qr-2", name: "QR Code 2" },
      { id: DASHBOARD_QR_NODE_ID, name: "QR Code" },
    ])

    expect(getLayerNames(view.container)).toEqual(["QR Code 2", "QR Code"])

    act(() => {
      activateElement(getRequiredElement(view.container, 'button[aria-label="Mock reorder layers"]'))
    })

    expect(getLayerNames(view.container)).toEqual(["QR Code", "QR Code 2"])
  })

  it("falls back to the qr layer when deleting the selected extra layer", () => {
    const view = renderHarness(
      [
        { id: DASHBOARD_QR_NODE_ID, name: "QR Code" },
        { id: "qr-2", name: "QR Code 2" },
      ],
      "qr-2",
    )

    expect(getRequiredElement(view.container, "[data-selected-node-id]").getAttribute("data-selected-node-id")).toBe(
      "qr-2",
    )

    act(() => {
      activateElement(getRequiredElement(view.container, 'button[aria-label="Delete QR Code 2"]'))
    })

    expect(view.container.querySelectorAll('[data-slot="drafting-layer-row"]')).toHaveLength(1)
    expect(getRequiredElement(view.container, "[data-selected-node-id]").getAttribute("data-selected-node-id")).toBe(
      DASHBOARD_QR_NODE_ID,
    )
  })

  it("allows deleting an extra qr layer while preserving another qr selection fallback", () => {
    const view = renderHarness(
      [
        { id: DASHBOARD_QR_NODE_ID, name: "QR Code" },
        { id: "qr-2", name: "QR Code 2" },
      ],
      "qr-2",
    )

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
  initialPanes,
  initialSelectedNodeId,
}: {
  initialPanes: Array<{ id: string; name: string }>
  initialSelectedNodeId: string | null
}) {
  const [panes, setPanes] = useState(initialPanes)
  const [selectedNodeId, setSelectedNodeId] = useState(initialSelectedNodeId)

  return (
    <div data-selected-node-id={selectedNodeId ?? ""}>
      <DraftingLayersTab
        onReorder={(orderedIds) => {
          const paneMap = new Map(panes.map((p) => [p.id, p]))
          setPanes(orderedIds.map((id) => paneMap.get(id)!).filter(Boolean))
        }}
        onRemoveNode={(nodeId) => {
          setPanes((current) => current.filter((p) => p.id !== nodeId))
        }}
        onSelectedNodeChange={setSelectedNodeId}
        panes={panes}
        selectedNodeId={selectedNodeId}
      />
    </div>
  )
}

function renderHarness(
  initialPanes: Array<{ id: string; name: string }>,
  initialSelectedNodeId: string | null = DASHBOARD_QR_NODE_ID,
) {
  const container = document.createElement("div")
  const root = createRoot(container)

  act(() => {
    root.render(
      <Harness
        initialPanes={initialPanes}
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
