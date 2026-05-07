// @vitest-environment jsdom

import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const buildDashboardQrNodePayloadSpy = vi.fn()

vi.mock("@/components/qr/dashboard-qr-svg", () => ({
  buildDashboardQrNodePayload: (
    ...args: Parameters<typeof buildDashboardQrNodePayloadSpy>
  ) => buildDashboardQrNodePayloadSpy(...args),
}))

import { QrPane } from "@/components/new/qr-pane"
import {
  createDefaultQrStudioState,
  setSquareQrSize,
} from "@/components/qr/qr-studio-state"

const cleanupCallbacks: Array<() => void> = []

beforeEach(() => {
  buildDashboardQrNodePayloadSpy.mockReset()
  buildDashboardQrNodePayloadSpy.mockImplementation(async (state) => ({
    markup: `<svg data-width="${state.width}" data-height="${state.height}" />`,
    naturalHeight: state.height,
    naturalWidth: state.width,
  }))
})

afterEach(() => {
  for (const cleanup of cleanupCallbacks.splice(0)) {
    cleanup()
  }

  document.body.innerHTML = ""
})

describe("QrPane", () => {
  it("reuses cached markup for an equal state and rebuilds when state changes", async () => {
    const firstState = createDefaultQrStudioState()
    const secondState = structuredClone(firstState)
    const thirdState = setSquareQrSize(firstState, firstState.width + 40)

    const { container, reactRoot } = renderPane(firstState)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    expect(buildDashboardQrNodePayloadSpy).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[data-slot="dashboard-compose-node"]')).not.toBeNull()

    await act(async () => {
      reactRoot.render(
        <QrPane
          state={secondState}
          isSelected={false}
          onQrClick={() => undefined}
          onSelect={() => undefined}
        />,
      )
      await flushPromises()
      await flushPromises()
    })

    expect(buildDashboardQrNodePayloadSpy).toHaveBeenCalledTimes(1)

    await act(async () => {
      reactRoot.render(
        <QrPane
          state={thirdState}
          isSelected={false}
          onQrClick={() => undefined}
          onSelect={() => undefined}
        />,
      )
      await flushPromises()
      await flushPromises()
    })

    expect(buildDashboardQrNodePayloadSpy).toHaveBeenCalledTimes(2)
  })

  it("keeps the qr artwork inset from the pane edges", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const { container } = renderPane(state)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const canvas = container.querySelector('[data-slot="dashboard-compose-canvas"]')
    const node = container.querySelector('[data-slot="dashboard-compose-node"]')

    expect(canvas).not.toBeNull()
    expect(canvas?.className).toContain("p-4")
    expect(canvas?.className).toContain("sm:p-6")
    expect(canvas?.className).toContain("lg:p-8")
    expect(node).not.toBeNull()
    const nodeClasses = node?.className.split(/\s+/) ?? []
    expect(nodeClasses).toContain("max-h-full")
    expect(nodeClasses).toContain("max-w-full")
    expect(nodeClasses).not.toContain("h-full")
    expect(nodeClasses).not.toContain("w-full")
    expect((node as HTMLElement).style.width).toBe("240px")
    expect((node as HTMLElement).style.height).toBe("240px")
  })

  it("adds a shadow to the qr canvas when selected", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const { container } = renderPane(state, true)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const pane = container.querySelector('[data-slot="qr-pane"]')
    const canvas = container.querySelector('[data-slot="dashboard-compose-canvas"]')
    const node = container.querySelector('[data-slot="dashboard-compose-node"]')

    expect(pane).not.toBeNull()
    expect(pane?.className).not.toContain("ring-2")
    expect(canvas?.className).not.toContain("shadow-[0_24px_48px_rgba(15,23,42,0.18)]")
    expect(node?.className).toContain("shadow-[0_10px_24px_-12px_rgba(15,23,42,0.26)]")
    expect((node as HTMLElement | null)?.style.width).toBe("240px")
    expect((node as HTMLElement | null)?.style.height).toBe("240px")
  })

  it("sizes the preview wrapper from the qr state", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 320)
    const { container } = renderPane(state)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const node = container.querySelector('[data-slot="dashboard-compose-node"]')

    expect(node).not.toBeNull()
    expect((node as HTMLElement).style.width).toBe("320px")
    expect((node as HTMLElement).style.height).toBe("320px")
  })

  it("keeps the qr canvas unshadowed when not selected", async () => {
    const { container } = renderPane(createDefaultQrStudioState(), false)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const node = container.querySelector('[data-slot="dashboard-compose-node"]')

    expect(node).not.toBeNull()
    expect(node?.className).not.toContain("shadow-[0_10px_24px_-12px_rgba(15,23,42,0.26)]")
  })
})

function renderPane(state = createDefaultQrStudioState(), isSelected = false) {
  const container = document.createElement("div")
  const reactRoot = createRoot(container)

  act(() => {
    reactRoot.render(
      <QrPane
        state={state}
        isSelected={isSelected}
        onQrClick={() => undefined}
        onSelect={() => undefined}
      />,
    )
  })

  cleanupCallbacks.push(() => {
    act(() => {
      reactRoot.unmount()
    })
  })

  document.body.appendChild(container)

  return { container, reactRoot }
}

function flushPromises() {
  return Promise.resolve()
}
