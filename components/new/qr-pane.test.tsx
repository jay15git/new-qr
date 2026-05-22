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
  createDefaultDraftingCardPaperShader,
  createDefaultDraftingCardState,
} from "@/components/new/drafting-card-state"
import {
  getDraftingCardLayerId,
  type DraftingCanvasLayer,
} from "@/components/new/drafting-layer-state"
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
    expect(nodeClasses).toContain("absolute")
    expect(nodeClasses).toContain("max-h-none")
    expect(nodeClasses).toContain("max-w-none")
    expect(nodeClasses).not.toContain("h-full")
    expect(nodeClasses).not.toContain("w-full")
    expect((node as HTMLElement).style.width).toBe("240px")
    expect((node as HTMLElement).style.height).toBe("240px")
  })

  it("sizes the preview from rendered qr bounds so shadow blur does not shrink the qr core", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    state.backgroundShapeOptions = {
      edgeBlur: 10,
      paddingPx: 20,
      shadowColor: "#020617",
      shadowOffsetX: -14,
      shadowOffsetY: 18,
      shadowOpacity: 0,
      strokeColor: "#0f172a",
      strokeOpacity: 55,
      strokeWidth: 8,
    }
    const cardState = {
      ...createDefaultDraftingCardState(),
      bottomSpace: 96,
      padding: 20,
    }
    const { container } = renderPane(state, false, cardState)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const card = container.querySelector('[data-slot="dashboard-compose-card"]') as HTMLElement
    const node = container.querySelector('[data-slot="dashboard-compose-node"]') as HTMLElement

    expect(node).not.toBeNull()
    expect(node.style.width).toBe("328px")
    expect(node.style.height).toBe("328px")
    expect(card).not.toBeNull()
    expect(card.style.width).toBe("368px")
    expect(card.style.height).toBe("464px")
  })

  it("renders the editable card layer behind the qr artwork", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const cardState = {
      ...createDefaultDraftingCardState(),
      bottomSpace: 96,
      border: {
        color: "#111827",
        opacity: 40,
        width: 6,
      },
      cornerRadius: 24,
      fill: "#ffcc00",
      padding: 20,
      shadow: {
        blur: 30,
        color: "#000000",
        offsetX: 6,
        offsetY: 8,
        opacity: 35,
      },
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
    expect(card.getAttribute("data-card-border-width")).toBe("6")
    expect(card.getAttribute("data-card-pattern")).toBe("none")
    expect(card.getAttribute("data-card-shadow-blur")).toBe("30")
    expect(card.getAttribute("data-card-shadow-offset-x")).toBe("6")
    expect(card.getAttribute("data-card-shadow-offset-y")).toBe("8")
    expect(card.style.backgroundColor).toBe("rgb(255, 204, 0)")
    expect(card.style.border).toContain("6px solid rgba(17, 24, 39, 0.4)")
    expect(card.style.borderRadius).toBe("24px")
    expect(card.style.width).toBe("280px")
    expect(card.style.height).toBe("376px")
    expect(card.style.boxShadow).toContain("6px 8px 30px rgba(0, 0, 0, 0.35)")
    expect(node).not.toBeNull()
    expect(node.parentElement).toBe(card.parentElement)
    expect(node.style.width).toBe("240px")
    expect(node.style.height).toBe("240px")
  })

  it("renders selected qr backing shapes as a qr-layer background without changing the card", async () => {
    buildDashboardQrNodePayloadSpy.mockImplementationOnce(async () => ({
      markup:
        '<svg width="240" height="240" viewBox="0 0 240 240"><defs><filter data-qr-layer="background-shape-blur-filter" id="background-shape-blur-filter"/></defs><path data-qr-layer="background-shape-blur" d="M0 0h240v240H0z"/><path data-qr-layer="background-shape" d="M0 0h240v240H0z"/><rect width="240" height="240" clip-path="url(\'#clip-path-background-color-0\')" fill="#fff"/><path data-qr-layer="dot" d="M20 20h40v40H20z" fill="#111"/></svg>',
      naturalHeight: 240,
      naturalWidth: 240,
    }))
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    state.backgroundShapeId = "flower"
    state.backgroundShapeOptions = {
      edgeBlur: 20,
      paddingPx: 24,
      shadowColor: "#22c55e",
      shadowOffsetX: 16,
      shadowOffsetY: -12,
      shadowOpacity: 80,
      strokeColor: "#0f172a",
      strokeOpacity: 40,
      strokeWidth: 8,
    }
    const cardState = {
      ...createDefaultDraftingCardState(),
      fill: "#ffffff",
      shadow: {
        blur: 30,
        color: "#000000",
        offsetX: 6,
        offsetY: 8,
        opacity: 35,
      },
    }
    const { container } = renderPane(state, false, cardState)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const card = container.querySelector('[data-slot="dashboard-compose-card"]') as HTMLElement
    const cardShape = card.querySelector('[data-slot="drafting-card-shape"]')
    const qrBackground = container.querySelector('[data-slot="drafting-qr-background"]')
    const qrSvg = Array.from(
      container.querySelectorAll('[data-slot="dashboard-compose-node"] svg'),
    ).find((svg) => svg.querySelector('[data-qr-layer="dot"]'))
    const dropShadow = Array.from(qrBackground?.querySelectorAll("*") ?? []).find(
      (node) => node.tagName.toLowerCase() === "fedropshadow",
    )

    expect(card.getAttribute("data-card-shape")).toBeNull()
    expect(cardShape).toBeNull()
    expect(card.style.boxShadow).toContain("6px 8px 30px rgba(0, 0, 0, 0.35)")
    expect(qrBackground).not.toBeNull()
    expect(qrBackground?.getAttribute("data-background-shape")).toBe("flower")
    expect(dropShadow?.getAttribute("dx")).toBe("16")
    expect(dropShadow?.getAttribute("dy")).toBe("-12")
    expect(dropShadow?.getAttribute("stdDeviation")).toBe("10")
    expect(dropShadow?.getAttribute("flood-color")).toBe("#22c55e")
    expect(dropShadow?.getAttribute("flood-opacity")).toBe("0.8")
    expect(qrSvg?.querySelector('[data-qr-layer="background-shape"]')).toBeNull()
    expect(qrSvg?.querySelector('[data-qr-layer="background-shape-blur"]')).toBeNull()
    expect(qrSvg?.querySelector('[data-qr-layer="background-shape-blur-filter"]')).toBeNull()
    expect(qrSvg?.querySelector('[data-qr-layer="dot"]')).not.toBeNull()
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

  it("marks the card layer with the selected paper shader", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const cardState = {
      ...createDefaultDraftingCardState(),
      paperShader: createDefaultDraftingCardPaperShader("warp"),
      styleMode: "paper-shader" as const,
    }
    const { container } = renderPane(state, false, cardState)

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const card = container.querySelector('[data-slot="dashboard-compose-card"]') as HTMLElement

    expect(card).not.toBeNull()
    expect(card.getAttribute("data-card-style-mode")).toBe("paper-shader")
    expect(card.getAttribute("data-card-pattern")).toBe("none")
    expect(card.getAttribute("data-card-paper-shader")).toBe("warp")
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

  it("keeps the qr canvas unshadowed when selected", async () => {
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
    expect(node?.className).not.toContain("shadow-[0_10px_24px_-12px_rgba(15,23,42,0.26)]")
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

  it("shows all edge and corner resize handles for the selected layer", async () => {
    const { container } = renderPane(createDefaultQrStudioState(), true, createDefaultDraftingCardState(), {
      onLayerChange: () => undefined,
      selectedLayerId: "preview:qr",
    })

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const directions = Array.from(
      container.querySelectorAll('[data-slot="drafting-layer-resize-handle"]'),
    ).map((handle) => handle.getAttribute("data-resize-direction"))

    expect(directions).toEqual(["n", "ne", "e", "se", "s", "sw", "w", "nw"])
  })

  it("keeps resize control padding equal around rectangular layers", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 240)
    const cardState = {
      ...createDefaultDraftingCardState(),
      bottomSpace: 96,
      padding: 20,
    }
    const { container } = renderPane(state, true, cardState, {
      onLayerChange: () => undefined,
      selectedLayerId: getDraftingCardLayerId("preview"),
    })

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const card = container.querySelector('[data-slot="dashboard-compose-card"]') as HTMLElement
    const frame = container.querySelector('[data-slot="drafting-layer-resize-frame"]') as HTMLElement

    expect(card).not.toBeNull()
    expect(card.className).toContain("overflow-visible")
    expect(card.className).not.toContain("outline")
    expect(frame).not.toBeNull()
    expect(frame.className).toContain("border")
    expect(frame.style.width).toBe("304px")
    expect(frame.style.height).toBe("400px")
  })

  it("clears layer selection when clicking empty preview canvas space", async () => {
    const onLayerSelect = vi.fn()
    const { container } = renderPane(createDefaultQrStudioState(), true, createDefaultDraftingCardState(), {
      onLayerChange: () => undefined,
      onLayerSelect,
      selectedLayerId: "preview:qr",
    })

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const canvas = container.querySelector('[data-slot="dashboard-compose-canvas"]')

    expect(canvas).not.toBeNull()

    act(() => {
      canvas?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onLayerSelect).toHaveBeenCalledWith(null)
  })

  it("applies qr layer shadow to foreground qr shapes instead of the background rect", async () => {
    buildDashboardQrNodePayloadSpy.mockImplementationOnce(async () => ({
      markup:
        '<svg width="240" height="240" viewBox="0 0 240 240"><defs><clipPath id="clip-path-background-color-0"><rect x="0" y="0" width="240" height="240"/></clipPath><clipPath id="clip-path-dot-color-0"><path d="M0 0h10v10z"/></clipPath></defs><rect x="0" y="0" width="240" height="240" clip-path="url(\'#clip-path-background-color-0\')" fill="#f8fafc"/><rect x="20" y="20" width="200" height="200" clip-path="url(\'#clip-path-dot-color-0\')" fill="#111827"/></svg>',
      naturalHeight: 240,
      naturalWidth: 240,
    }))
    const qrLayer = {
      blur: 0,
      height: 240,
      id: "preview:qr",
      isLocked: false,
      isVisible: true,
      kind: "qr",
      name: "QR code",
      nodeId: "preview",
      opacity: 1,
      rotation: 0,
      shadow: {
        blur: 18,
        color: "#020617",
        offsetX: 6,
        offsetY: 8,
        opacity: 60,
      },
      width: 240,
      x: -120,
      y: -120,
      zIndex: 1,
    } satisfies DraftingCanvasLayer
    const { container } = renderPane(createDefaultQrStudioState(), true, createDefaultDraftingCardState(), {
      layers: [qrLayer],
      selectedLayerId: "preview:qr",
    })

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    const svg = Array.from(
      container.querySelectorAll('[data-slot="dashboard-compose-node"] svg'),
    ).find((candidate) => candidate.querySelector('rect[clip-path*="clip-path-dot-color"]'))
    const backgroundRect = svg?.querySelector(
      'rect[clip-path*="clip-path-background-color"]',
    )
    const shadowGroup = svg?.querySelector('[data-drafting-qr-shadow-source="true"]')
    const dropShadow = Array.from(svg?.querySelectorAll("*") ?? []).find(
      (node) => node.tagName.toLowerCase() === "fedropshadow",
    )

    expect(backgroundRect).toBeNull()
    expect(shadowGroup?.querySelector('rect[clip-path*="clip-path-dot-color"]')).not.toBeNull()
    expect(dropShadow?.getAttribute("dx")).toBe("6")
    expect(dropShadow?.getAttribute("dy")).toBe("8")
    expect(dropShadow?.getAttribute("stdDeviation")).toBe("9")
    expect(dropShadow?.getAttribute("flood-opacity")).toBe("0.6")
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
  props: {
    layers?: DraftingCanvasLayer[]
    onLayerChange?: (layerId: string, patch: Partial<DraftingCanvasLayer>) => void
    onLayerSelect?: (layerId: string | null) => void
    selectedLayerId?: string | null
  } = {},
) {
  const container = document.createElement("div")
  const reactRoot = createRoot(container)

  act(() => {
    reactRoot.render(
      <QrPane
        cardState={cardState}
        layers={props.layers}
        state={state}
        isSelected={isSelected}
        onLayerChange={props.onLayerChange}
        onLayerSelect={props.onLayerSelect}
        onQrClick={() => undefined}
        onSelect={() => undefined}
        selectedLayerId={props.selectedLayerId}
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
