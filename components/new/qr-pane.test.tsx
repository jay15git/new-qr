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
import { createDefaultDraftingCardState } from "@/components/new/drafting-card-state"
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
    const card = container.querySelector('[data-slot="dashboard-compose-card"]')
    const node = container.querySelector('[data-slot="dashboard-compose-node"]')

    expect(canvas).not.toBeNull()
    expect(canvas?.className).toContain("p-4")
    expect(canvas?.className).toContain("sm:p-6")
    expect(canvas?.className).toContain("lg:p-8")
    expect(card).not.toBeNull()
    expect(node).not.toBeNull()
    const nodeClasses = node?.className.split(/\s+/) ?? []
    expect(nodeClasses).toContain("max-h-full")
    expect(nodeClasses).toContain("max-w-full")
    expect(nodeClasses).not.toContain("h-full")
    expect(nodeClasses).not.toContain("w-full")
    expect((node as HTMLElement).style.width).toBe("240px")
    expect((node as HTMLElement).style.height).toBe("240px")
  })

  it("renders the editable card layer behind the qr artwork", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const cardState = {
      ...createDefaultDraftingCardState(),
      bottomSpace: 96,
      cornerRadius: 24,
      fill: "#ffcc00",
      padding: 20,
      shadow: "strong" as const,
    }
    const { container } = renderPane(state, false, cardState)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const card = container.querySelector('[data-slot="dashboard-compose-card"]') as HTMLElement
    const node = container.querySelector('[data-slot="dashboard-compose-node"]') as HTMLElement

    expect(card).not.toBeNull()
    expect(card.getAttribute("data-card-enabled")).toBe("true")
    expect(card.getAttribute("data-card-pattern")).toBe("none")
    expect(card.getAttribute("data-card-shadow")).toBe("strong")
    expect(card.style.backgroundColor).toBe("rgb(255, 204, 0)")
    expect(card.style.borderRadius).toBe("24px")
    expect(card.style.padding).toBe("20px")
    expect(card.style.width).toBe("280px")
    expect(card.style.height).toBe("376px")
    expect(node).not.toBeNull()
    expect(node.parentElement).toBe(card)
    expect(node.style.width).toBe("240px")
    expect(node.style.height).toBe("240px")
  })

  it("applies the selected card css pattern to the card layer", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const cardState = {
      ...createDefaultDraftingCardState(),
      patternId: "g3" as const,
    }
    const { container } = renderPane(state, false, cardState)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const card = container.querySelector('[data-slot="dashboard-compose-card"]') as HTMLElement

    expect(card).not.toBeNull()
    expect(card.getAttribute("data-card-pattern")).toBe("g3")
    expect(card.style.getPropertyValue("--s")).toBe("72px")
    expect(card.style.getPropertyValue("--p1")).toBe("#c02942")
    expect(card.getAttribute("style")).toContain("background-size")
  })

  it("applies selected card css pattern color overrides to the card layer", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const cardState = {
      ...createDefaultDraftingCardState(),
      patternColors: {
        g3: {
          "--p1": "#111111",
        },
      },
      patternId: "g3" as const,
    }
    const { container } = renderPane(state, false, cardState)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const card = container.querySelector('[data-slot="dashboard-compose-card"]') as HTMLElement

    expect(card).not.toBeNull()
    expect(card.getAttribute("data-card-pattern")).toBe("g3")
    expect(card.style.getPropertyValue("--p1")).toBe("#111111")
    expect(card.style.getPropertyValue("--p2")).toBe("#53777a")
  })

  it("renders qr artwork without the card wrapper when the card is disabled", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const cardState = {
      ...createDefaultDraftingCardState(),
      enabled: false,
      patternId: "g3" as const,
    }
    const { container } = renderPane(state, false, cardState)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const card = container.querySelector('[data-slot="dashboard-compose-card"]')
    const node = container.querySelector('[data-slot="dashboard-compose-node"]')

    expect(card).toBeNull()
    expect(node).not.toBeNull()
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

function renderPane(
  state = createDefaultQrStudioState(),
  isSelected = false,
  cardState = createDefaultDraftingCardState(),
) {
  const container = document.createElement("div")
  const reactRoot = createRoot(container)

  act(() => {
    reactRoot.render(
      <QrPane
        cardState={cardState}
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
