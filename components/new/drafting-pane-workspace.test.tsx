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
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    })),
  })
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
})

function renderWorkspace({
  onSwapPanes,
}: {
  onSwapPanes: (sourcePaneId: string, targetPaneId: string) => void
}) {
  const container = document.createElement("div")
  const root = createRoot(container)

  act(() => {
    root.render(
      <DraftingPaneWorkspace
        activePaneId="pane-1"
        onPaneQrClick={() => undefined}
        onPaneSelect={() => undefined}
        onReset={() => undefined}
        onSwapPanes={onSwapPanes}
        panes={[
          {
            id: "pane-1",
            name: "QR Code",
            state: { ...createDefaultQrStudioState(), data: "https://one.example" },
          },
          {
            id: "pane-2",
            name: "QR Code 2",
            state: { ...createDefaultQrStudioState(), data: "https://two.example" },
          },
        ]}
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

function getPaneSurfaces(parent: ParentNode) {
  const panes = Array.from(
    parent.querySelectorAll('[data-slot="dashboard-compose-surface"]'),
  ) as HTMLElement[]

  expect(panes).toHaveLength(2)

  return panes
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
