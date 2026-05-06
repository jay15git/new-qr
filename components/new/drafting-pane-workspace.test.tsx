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
const FIVE_PANE_FLEX_BASIS = "0 0 calc(0.3333333333333333*(100% - 1rem))"

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  stubPortraitOrientation(false)
})

afterEach(() => {
  while (cleanupCallbacks.length > 0) {
    cleanupCallbacks.pop()?.()
  }
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

  it("renders five landscape panes as two centered uniform rows", async () => {
    const workspace = renderWorkspace({ paneCount: 5 })

    await act(async () => {
      await flushPromises()
    })

    const layout = getPaneLayout(workspace.container)
    const groups = getLayoutGroups(layout)
    const panes = getPaneSurfaces(workspace.container, 5)

    expect(layout.getAttribute("data-layout-direction")).toBe("rows")
    expect(groups.map((group) => group.getAttribute("data-layout-group-size"))).toEqual([
      "3",
      "2",
    ])
    expect(Array.from(groups[0].children).map((child) => (child as HTMLElement).style.flex)).toEqual([
      FIVE_PANE_FLEX_BASIS,
      FIVE_PANE_FLEX_BASIS,
      FIVE_PANE_FLEX_BASIS,
    ])
    expect(Array.from(groups[1].children).map((child) => (child as HTMLElement).style.flex)).toEqual([
      FIVE_PANE_FLEX_BASIS,
      FIVE_PANE_FLEX_BASIS,
    ])
    expect(panes).toHaveLength(5)
  })

  it("renders five portrait panes as two centered uniform columns", async () => {
    stubPortraitOrientation(true)
    const workspace = renderWorkspace({ paneCount: 5 })

    await act(async () => {
      await flushPromises()
    })

    const layout = getPaneLayout(workspace.container)
    const groups = getLayoutGroups(layout)

    expect(layout.getAttribute("data-layout-direction")).toBe("columns")
    expect(groups.map((group) => group.getAttribute("data-layout-group-size"))).toEqual([
      "3",
      "2",
    ])
    expect(Array.from(groups[0].children).map((child) => (child as HTMLElement).style.flex)).toEqual([
      FIVE_PANE_FLEX_BASIS,
      FIVE_PANE_FLEX_BASIS,
      FIVE_PANE_FLEX_BASIS,
    ])
    expect(Array.from(groups[1].children).map((child) => (child as HTMLElement).style.flex)).toEqual([
      FIVE_PANE_FLEX_BASIS,
      FIVE_PANE_FLEX_BASIS,
    ])
  })
})

function renderWorkspace({
  onSwapPanes = vi.fn(),
  paneCount = 2,
}: {
  onSwapPanes?: (sourcePaneId: string, targetPaneId: string) => void
  paneCount?: number
}) {
  const container = document.createElement("div")
  const root = createRoot(container)
  const panes = Array.from({ length: paneCount }, (_, index) => ({
    id: `pane-${index + 1}`,
    name: index === 0 ? "QR Code" : `QR Code ${index + 1}`,
    state: {
      ...createDefaultQrStudioState(),
      data: `https://${index + 1}.example`,
    },
  }))

  act(() => {
    root.render(
      <DraftingPaneWorkspace
        activePaneId="pane-1"
        onPaneQrClick={() => undefined}
        onPaneSelect={() => undefined}
        onReset={() => undefined}
        onSwapPanes={onSwapPanes}
        panes={panes}
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

function getPaneLayout(parent: ParentNode) {
  const layout = parent.querySelector('[data-slot="drafting-pane-layout"]') as HTMLElement | null

  expect(layout).not.toBeNull()

  return layout as HTMLElement
}

function getLayoutGroups(parent: ParentNode) {
  return Array.from(parent.querySelectorAll("[data-layout-group]")) as HTMLElement[]
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
