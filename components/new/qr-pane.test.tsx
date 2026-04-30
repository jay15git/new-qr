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
})

function renderPane(state = createDefaultQrStudioState()) {
  const container = document.createElement("div")
  const reactRoot = createRoot(container)

  act(() => {
    reactRoot.render(
      <QrPane
        state={state}
        isSelected={false}
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
