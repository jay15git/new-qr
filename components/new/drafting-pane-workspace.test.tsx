// @vitest-environment jsdom

import { createRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DraftingPaneWorkspace } from "@/components/new/drafting-pane-workspace"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

vi.mock("@/components/qr/dashboard-qr-svg", () => ({
  buildDashboardQrNodePayload: vi.fn(() =>
    Promise.resolve({
      markup: "<svg />",
      naturalHeight: 240,
      naturalWidth: 240,
    }),
  ),
}))

const cleanupCallbacks: Array<() => void> = []

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  )
  stubPortraitOrientation(false)
})

afterEach(() => {
  while (cleanupCallbacks.length > 0) {
    cleanupCallbacks.pop()?.()
  }
  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})

describe("DraftingPaneWorkspace", () => {
  it("swaps panes when a dragged pane drops onto another pane", async () => {
    const onSwapPanes = vi.fn()
    const workspace = renderWorkspace({ onSwapPanes })
    const [firstPane, secondPane] = getPaneSurfaces(workspace.container)
    const dataTransfer = createDataTransfer()

    await act(async () => {
      firstPane.dispatchEvent(createDragEvent("dragstart", dataTransfer))
      secondPane.dispatchEvent(createDragEvent("dragover", dataTransfer))
      secondPane.dispatchEvent(createDragEvent("drop", dataTransfer))
      await flushPromises()
    })

    expect(onSwapPanes).toHaveBeenCalledWith("pane-1", "pane-2")
  })

  it("keeps resizable panel slot identity stable when pane content is swapped", async () => {
    const panes = createPanes(2)
    const workspace = renderWorkspace({ panes })

    await act(async () => {
      await flushPromises()
    })

    const panelIdsBefore = getResizablePanels(workspace.container).map((panel) =>
      panel.getAttribute("data-panel"),
    )
    const paneDataBefore = getQrNodes(workspace.container).map((node) =>
      node.getAttribute("data-node-id"),
    )

    await act(async () => {
      workspace.render([...panes].reverse())
      await flushPromises()
    })

    expect(getResizablePanels(workspace.container).map((panel) =>
      panel.getAttribute("data-panel"),
    )).toEqual(panelIdsBefore)
    expect(getQrNodes(workspace.container).map((node) =>
      node.getAttribute("data-node-id"),
    )).toEqual([...paneDataBefore].reverse())
  })

  it("does not swap when a pane drops onto itself", async () => {
    const onSwapPanes = vi.fn()
    const workspace = renderWorkspace({ onSwapPanes })
    const [firstPane] = getPaneSurfaces(workspace.container)
    const dataTransfer = createDataTransfer()

    await act(async () => {
      firstPane.dispatchEvent(createDragEvent("dragstart", dataTransfer))
      firstPane.dispatchEvent(createDragEvent("dragover", dataTransfer))
      firstPane.dispatchEvent(createDragEvent("drop", dataTransfer))
      await flushPromises()
    })

    expect(onSwapPanes).not.toHaveBeenCalled()
  })

  it("does not swap when a dragged pane drops outside a target slot", async () => {
    const onSwapPanes = vi.fn()
    const workspace = renderWorkspace({ onSwapPanes })
    const [firstPane] = getPaneSurfaces(workspace.container)
    const dataTransfer = createDataTransfer()

    await act(async () => {
      firstPane.dispatchEvent(createDragEvent("dragstart", dataTransfer))
      workspace.container.dispatchEvent(createDragEvent("drop", dataTransfer))
      await flushPromises()
    })

    expect(onSwapPanes).not.toHaveBeenCalled()
  })

  it("marks the hovered drop target while dragging another pane", async () => {
    const workspace = renderWorkspace({ onSwapPanes: vi.fn() })
    const [firstPane, secondPane] = getPaneSurfaces(workspace.container)
    const dataTransfer = createDataTransfer()

    await act(async () => {
      firstPane.dispatchEvent(createDragEvent("dragstart", dataTransfer))
      secondPane.dispatchEvent(createDragEvent("dragover", dataTransfer))
      await flushPromises()
    })

    expect(secondPane.getAttribute("data-snap-target")).toBe("true")
  })

  it("renders one pane without resize handles", async () => {
    const workspace = renderWorkspace({ paneCount: 1 })

    await act(async () => {
      await flushPromises()
    })

    expect(getPaneSurfaces(workspace.container, 1)).toHaveLength(1)
    expect(getResizeHandles(workspace.container)).toHaveLength(0)
  })

  it("renders five landscape panes as two resizable rows", async () => {
    const workspace = renderWorkspace({ paneCount: 5 })

    await act(async () => {
      await flushPromises()
    })

    const layout = getPaneLayout(workspace.container)
    const groups = getLayoutGroups(layout)
    const panes = getPaneSurfaces(workspace.container, 5)

    expect(layout.getAttribute("data-layout-direction")).toBe("rows")
    expect(layout.getAttribute("data-resize-orientation")).toBe("vertical")
    expect(groups.map((group) => group.getAttribute("data-layout-group-size"))).toEqual([
      "3",
      "2",
    ])
    expect(getNestedPanelGroups(workspace.container).map((group) =>
      group.getAttribute("data-resize-orientation"),
    )).toEqual(["horizontal", "horizontal"])
    expect(getResizeHandles(workspace.container)).toHaveLength(4)
    expect(panes).toHaveLength(5)
  })

  it("renders five portrait panes as two resizable columns", async () => {
    stubPortraitOrientation(true)
    const workspace = renderWorkspace({ paneCount: 5 })

    await act(async () => {
      await flushPromises()
    })

    const layout = getPaneLayout(workspace.container)
    const groups = getLayoutGroups(layout)

    expect(layout.getAttribute("data-layout-direction")).toBe("columns")
    expect(layout.getAttribute("data-resize-orientation")).toBe("horizontal")
    expect(groups.map((group) => group.getAttribute("data-layout-group-size"))).toEqual([
      "3",
      "2",
    ])
    expect(getNestedPanelGroups(workspace.container).map((group) =>
      group.getAttribute("data-resize-orientation"),
    )).toEqual(["vertical", "vertical"])
    expect(getResizeHandles(workspace.container)).toHaveLength(4)
  })

  it("hides resize handles while the active pane is maximized", async () => {
    const workspace = renderWorkspace({ paneCount: 3 })
    const maximizeButton = workspace.container.querySelector(
      'button[aria-label="Maximize pane"]',
    ) as HTMLButtonElement | null

    expect(maximizeButton).not.toBeNull()

    await act(async () => {
      maximizeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      await flushPromises()
    })

    expect(getPaneSurfaces(workspace.container, 1)).toHaveLength(1)
    expect(getResizeHandles(workspace.container)).toHaveLength(0)
  })
})

function renderWorkspace({
  onSwapPanes = vi.fn(),
  paneCount = 2,
  panes = createPanes(paneCount),
}: {
  onSwapPanes?: (sourcePaneId: string, targetPaneId: string) => void
  paneCount?: number
  panes?: ReturnType<typeof createPanes>
}) {
  const container = document.createElement("div")
  const root = createRoot(container)

  function render(nextPanes = panes) {
    root.render(
      <DraftingPaneWorkspace
        activePaneId="pane-1"
        onPaneQrClick={() => undefined}
        onPaneSelect={() => undefined}
        onReset={() => undefined}
        onSwapPanes={onSwapPanes}
        panes={nextPanes}
      />,
    )
  }

  act(() => {
    render()
  })

  cleanupCallbacks.push(() => {
    act(() => {
      root.unmount()
    })
  })

  document.body.appendChild(container)

  return { container, render }
}

function createPanes(paneCount: number) {
  return Array.from({ length: paneCount }, (_, index) => ({
    id: `pane-${index + 1}`,
    name: index === 0 ? "QR Code" : `QR Code ${index + 1}`,
    state: {
      ...createDefaultQrStudioState(),
      data: `https://${index + 1}.example`,
    },
  }))
}

function getPaneLayout(parent: ParentNode) {
  const layout = parent.querySelector('[data-slot="drafting-pane-layout"]') as HTMLElement | null

  expect(layout).not.toBeNull()

  return layout as HTMLElement
}

function getLayoutGroups(parent: ParentNode) {
  return Array.from(parent.querySelectorAll("[data-layout-group]")) as HTMLElement[]
}

function getNestedPanelGroups(parent: ParentNode) {
  const layout = getPaneLayout(parent)
  return Array.from(
    layout.querySelectorAll('[data-slot="resizable-panel-group"]'),
  ) as HTMLElement[]
}

function getResizeHandles(parent: ParentNode) {
  return Array.from(
    parent.querySelectorAll('[data-slot="drafting-resize-handle"]'),
  ) as HTMLElement[]
}

function getResizablePanels(parent: ParentNode) {
  return Array.from(parent.querySelectorAll("[data-panel]")) as HTMLElement[]
}

function getQrNodes(parent: ParentNode) {
  return Array.from(
    parent.querySelectorAll('[data-slot="dashboard-compose-node"]'),
  ) as HTMLElement[]
}

function getPaneSurfaces(parent: ParentNode, expectedCount = 2) {
  const panes = Array.from(
    parent.querySelectorAll('[data-slot="dashboard-compose-surface"]'),
  ) as HTMLElement[]

  expect(panes).toHaveLength(expectedCount)

  return panes
}

function stubPortraitOrientation(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      addEventListener: vi.fn(),
      matches,
      removeEventListener: vi.fn(),
    })),
  })
}

function createDataTransfer() {
  const values = new Map<string, string>()

  return {
    dropEffect: "none",
    effectAllowed: "all",
    getData: vi.fn((type: string) => values.get(type) ?? ""),
    setData: vi.fn((type: string, value: string) => {
      values.set(type, value)
    }),
  }
}

function createDragEvent(type: string, dataTransfer: ReturnType<typeof createDataTransfer>) {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as Event & { dataTransfer: ReturnType<typeof createDataTransfer> }

  Object.defineProperty(event, "dataTransfer", {
    value: dataTransfer,
  })

  return event
}

async function flushPromises() {
  await Promise.resolve()
}
