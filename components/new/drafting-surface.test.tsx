// @vitest-environment jsdom

import { readFileSync } from "node:fs"
import { act, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const buildDashboardQrNodePayloadSpy = vi.fn(() => new Promise(() => undefined))
const downloadDashboardQrBatchZipExportSpy = vi.fn(() => Promise.resolve())
const downloadDashboardQrNodeExportSpy = vi.fn(() => Promise.resolve())
const downloadDashboardRasterExportSpy = vi.fn(() => Promise.resolve())
const measureDashboardRasterExportSpy = vi.fn(() =>
  Promise.resolve({
    blobSizeBytes: 182000,
    extension: "png" as const,
    height: 1280,
    qualityPercent: 100,
    width: 1280,
  }),
)

vi.mock("@/components/qr/dashboard-qr-svg", () => ({
  buildDashboardQrNodePayload: (...args: Parameters<typeof buildDashboardQrNodePayloadSpy>) =>
    buildDashboardQrNodePayloadSpy(...args),
}))

vi.mock("@/components/qr/dashboard-qr-batch-export", () => ({
  downloadDashboardQrBatchZipExport: (
    ...args: Parameters<typeof downloadDashboardQrBatchZipExportSpy>
  ) => downloadDashboardQrBatchZipExportSpy(...args),
  downloadDashboardQrNodeExport: (
    ...args: Parameters<typeof downloadDashboardQrNodeExportSpy>
  ) => downloadDashboardQrNodeExportSpy(...args),
}))

vi.mock("@/components/qr/dashboard-raster-export", () => ({
  downloadDashboardRasterExport: (
    ...args: Parameters<typeof downloadDashboardRasterExportSpy>
  ) => downloadDashboardRasterExportSpy(...args),
  formatDashboardExportFileSize: (bytes: number) => `${bytes} B`,
  isRasterExportExtension: (extension: string) => extension !== "svg",
  measureDashboardRasterExport: (
    ...args: Parameters<typeof measureDashboardRasterExportSpy>
  ) => measureDashboardRasterExportSpy(...args),
}))

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: ReactNode }) => (
    <div data-slot="popover">{children}</div>
  ),
  PopoverContent: ({ children, ...props }: { children: ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: ReactNode }) => children,
}))

vi.mock("@/components/unlumen-ui/slider", () => ({
  Slider: ({
    "aria-label": ariaLabel,
    formatValue,
    label,
    appearance,
    disabled,
    max,
    min,
    onChange,
    showValue = true,
    step,
    value,
    "data-slot": dataSlot,
  }: {
    "aria-label"?: string
    "data-slot"?: string
    appearance?: string
    formatValue?: (value: number) => string
    label?: string
    disabled?: boolean
    max?: number
    min?: number
    onChange?: (value: number | [number, number]) => void
    showValue?: boolean
    step?: number
    value?: number | number[]
  }) => (
    <div data-slot={dataSlot} data-appearance={appearance}>
      {label && showValue ? (
        <span>
          {label}
          {formatValue
            ? `: ${formatValue(Array.isArray(value) ? (value[0] ?? 0) : (value ?? 0))}`
            : null}
        </span>
      ) : null}
      <input
        aria-label={ariaLabel}
        disabled={disabled}
        max={max}
        min={min}
        step={step}
        type="range"
        value={Array.isArray(value) ? (value[0] ?? min ?? 0) : (value ?? min ?? 0)}
        onChange={(event) => {
          onChange?.(Number(event.currentTarget.value))
        }}
      />
    </div>
  ),
}))

import { DraftingSurface } from "@/components/new/drafting-surface"
import { DASHBOARD_QR_NODE_ID } from "@/components/qr/dashboard-compose-scene"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

const QR_PAYLOAD = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#fff" /><path d="M20 20h40v40H20z" fill="#111" /></svg>',
  naturalHeight: 320,
  naturalWidth: 320,
}

const cleanupCallbacks: Array<() => void> = []

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  buildDashboardQrNodePayloadSpy.mockClear()
  buildDashboardQrNodePayloadSpy.mockImplementation(() => new Promise(() => undefined))
  downloadDashboardQrBatchZipExportSpy.mockClear()
  downloadDashboardQrNodeExportSpy.mockClear()
  downloadDashboardRasterExportSpy.mockClear()
  measureDashboardRasterExportSpy.mockClear()
  measureDashboardRasterExportSpy.mockImplementation(() =>
    Promise.resolve({
      blobSizeBytes: 182000,
      extension: "png",
      height: 1280,
      qualityPercent: 100,
      width: 1280,
    }),
  )
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  )
})

afterEach(() => {
  for (const cleanup of cleanupCallbacks.splice(0)) {
    cleanup()
  }

  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})

describe("DraftingSurface", () => {
  it("renders the framed layout with dashboard-style tool buttons and middle tabs", () => {
    const surface = renderSurface()
    const header = getRequiredElement(surface.container, '[data-slot="drafting-header"]')
    const headerContent = getRequiredElement(header, "div")

    expect(surface.container.querySelector('[data-slot="drafting-surface"]')).not.toBeNull()
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').className,
    ).toContain("bg-[var(--drafting-surface-bg)]")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').className,
    ).not.toContain("lg:border-[var(--drafting-line-hover)]")
    expect(header).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-nav"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-scroll-area"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-workspace"]')).not.toBeNull()
    expect(
      surface.container.querySelector('[data-slot="drafting-workspace-inset"]'),
    ).not.toBeNull()
    expect(
      surface.container.querySelector('[data-slot="drafting-workspace-inset"]')?.className,
    ).toContain("pb-3")
    expect(
      surface.container.querySelector('[data-slot="drafting-workspace-inset"]')?.className,
    ).toContain("pt-0")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').className,
    ).toContain("h-dvh")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').className,
    ).toContain("[--new-mobile-rail-height:5.75rem]")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-content-grid"]').className,
    ).toContain("grid-rows-[minmax(0,1fr)_var(--new-mobile-rail-height)]")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-content-grid"]').className,
    ).toContain(
      "lg:grid-cols-[var(--new-left-rail-width)_var(--new-middle-rail-width)_minmax(0,1fr)]",
    )
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-content-grid"]').className,
    ).toContain("lg:grid-rows-1")
    expect(surface.container.querySelector('[data-slot="dashboard-compose-surface"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="dashboard-compose-canvas"]')).not.toBeNull()
    expect(
      surface.container
        .querySelector('[data-slot="dashboard-compose-surface"]')
        ?.getAttribute("data-surface-appearance"),
    ).toBe("neutral")
    expect(
      surface.container
        .querySelector('[data-slot="dashboard-compose-toolbar"]')
        ?.getAttribute("data-toolbar-appearance"),
    ).toBe("neutral")
    expect(surface.container.textContent).not.toContain("Edit mode")
    expect(surface.container.querySelector('button[aria-label="Toggle edit mode"]')).toBeNull()
    expect(
      surface.container
        .querySelector('[data-slot="dashboard-compose-canvas"]')
        ?.getAttribute("data-compose-mode"),
    ).toBe("compose")
    expect(
      surface.container.querySelector('[data-slot="dashboard-compose-document-guides"]'),
    ).toBeNull()
    expect(surface.container.querySelector('button[aria-label="Reset defaults"]')).not.toBeNull()
    expect(surface.container.querySelectorAll('[data-slot="drafting-plus-marker"]')).toHaveLength(10)
    expect(
      surface.container.querySelector('[data-slot="drafting-plus-marker"]')?.getAttribute("class"),
    ).toContain("hidden")
    expect(
      surface.container.querySelector('[data-slot="drafting-plus-marker"]')?.getAttribute("class"),
    ).toContain("lg:block")
    expect(
      surface.container.querySelector('[data-slot="drafting-plus-marker"]')?.getAttribute("class"),
    ).toContain("text-[var(--drafting-ink-muted)]")
    expect(
      surface.container.querySelector('[data-slot="drafting-plus-marker"]')?.getAttribute("class"),
    ).not.toContain("text-black/")
    expect(surface.container.querySelectorAll('[data-drafting-tool-button="true"]')).toHaveLength(8)
    expect(surface.container.querySelector('[data-slot="tabs"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="tabs-list"]')).not.toBeNull()
    expect(getTabLabels(surface.container)).toEqual(["Content"])
    expect(surface.container.textContent).toContain("Content")
    expect(surface.container.textContent).toContain("Style")
    expect(surface.container.textContent).toContain("Corner frame")
    expect(surface.container.textContent).toContain("Corner dot")
    expect(surface.container.textContent).toContain("Background")
    expect(surface.container.textContent).toContain("Logo")
    expect(surface.container.textContent).toContain("Encoding")
    expect(surface.container.textContent).toContain("Layers")
    expect(headerContent.className).toContain("justify-end")
    expect(header.innerHTML).toContain('data-slot="switch"')
    expect(header.innerHTML).toContain('data-slot="drafting-download-trigger"')
    expect(getRequiredElement(header, '[data-slot="switch"]').className).not.toContain(
      "bg-[var(--drafting-panel-bg)]",
    )
    expect(getRequiredElement(header, '[data-slot="switch"]').className).not.toContain(
      "shadow-[var(--drafting-shadow-rest)]",
    )
    expect(header.innerHTML).toContain("bg-[#00000003]")
    expect(surface.container.textContent).not.toContain("Appearance")
    expect(surface.container.innerHTML).toContain('aria-label="Toggle dark mode"')
    expect(surface.container.innerHTML).not.toMatch(
      /dark:[^"]*shadow-\[[^\]]*rgba\(255,255,255/,
    )
  })

  it(
    "renders the header download control to the right of the dark mode switch with compact format cards",
    () => {
    const surface = renderSurface()
    const actions = getRequiredElement(
      surface.container,
      '[data-slot="drafting-header-actions"]',
    )
    const svgExportInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Export SVG"]',
    ) as HTMLInputElement
    const pngExportInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Export PNG"]',
    ) as HTMLInputElement
    const jpegExportInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Export JPEG"]',
    ) as HTMLInputElement
    const webpExportInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Export WEBP"]',
    ) as HTMLInputElement

    expect(actions.firstElementChild?.getAttribute("data-slot")).toBe("switch")
    expect(actions.querySelector('[data-slot="drafting-download-trigger"]')).not.toBeNull()
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-download-format-grid"]')
        .querySelectorAll('[data-slot="option-card"]').length,
    ).toBe(4)
    expect(svgExportInput.checked).toBe(false)
    expect(pngExportInput.checked).toBe(true)
    expect(jpegExportInput.checked).toBe(false)
    expect(webpExportInput.checked).toBe(false)
    expect(surface.container.textContent).toContain("Download PNG")
    expect(surface.container.textContent).toContain("Web & social")
    expect(surface.container.textContent).toContain("1024 × 1024")
    expect(surface.container.textContent).toContain("Current QR")
    expect(surface.container.textContent).not.toContain("Vector master")
    expect(surface.container.textContent).not.toContain("Raster export")
    },
    15000,
  )

  it(
    "shows raster quality presets and measures the default web and social export size",
    async () => {
      vi.useFakeTimers()
      const surface = renderSurface()

      await act(async () => {
        await flushPromises()
      })

      expect(surface.container.textContent).toContain("Quality preset")
      expect(surface.container.textContent).toContain("Web & social")
      expect(surface.container.textContent).toContain("1024 × 1024")
      expect(surface.container.textContent).toContain("Calculating size")

      await act(async () => {
        vi.advanceTimersByTime(250)
        await flushPromises()
      })

      expect(measureDashboardRasterExportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          extension: "png",
          qualityPercent: 100,
          targetSizePx: 1024,
          state: expect.objectContaining({
            rasterExportQualityPercent: 100,
          }),
        }),
      )
      expect(surface.container.textContent).toContain("182000 B")
      expect(
        surface.container.querySelector('[data-slot="drafting-export-size-preview"]'),
      ).toBeNull()
    },
    15000,
  )

  it("passes each raster quality preset target size into export preview", async () => {
    vi.useFakeTimers()
    const surface = renderSurface()
    const presetExpectations = [
      ["Use Quick share export preset", 512],
      ["Use Web & social export preset", 1024],
      ["Use Small print export preset", 1600],
      ["Use Flyer / poster export preset", 2400],
      ["Use Large format export preset", 3200],
      ["Use Max quality export preset", 4096],
    ] as const

    for (const [label, targetSizePx] of presetExpectations) {
      await act(async () => {
        activateElement(
          getRadioInputByAriaLabel(
            surface.container,
            label,
          ),
        )
      })
      await act(async () => {
        vi.advanceTimersByTime(250)
        await flushPromises()
      })

      expect(measureDashboardRasterExportSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          targetSizePx,
        }),
      )
    }
  })

  it("downloads the selected png export from the header control with the selected preset", async () => {
    vi.useFakeTimers()
    buildDashboardQrNodePayloadSpy.mockResolvedValue(QR_PAYLOAD)
    const surface = renderSurface()
    const maxQualityInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Use Max quality export preset"]',
    ) as HTMLInputElement

    await act(async () => {
      activateElement(maxQualityInput)
    })
    await act(async () => {
      vi.advanceTimersByTime(250)
      await flushPromises()
    })

    await act(async () => {
      activateElement(getButtonByExactText(surface.container, "Download PNG"))
      await flushPromises()
    })

    expect(downloadDashboardQrNodeExportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: "png",
        name: "QR Code",
        node: expect.objectContaining({ name: "QR Code" }),
        qualityPercent: 100,
        targetSizePx: 4096,
      }),
    )
    expect(downloadDashboardRasterExportSpy).not.toHaveBeenCalled()
  })

  it("routes jpeg and webp selections through the named qr export path", async () => {
    buildDashboardQrNodePayloadSpy.mockResolvedValue(QR_PAYLOAD)
    const surface = renderSurface()
    const jpegExportInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Export JPEG"]',
    ) as HTMLInputElement
    const webpExportInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Export WEBP"]',
    ) as HTMLInputElement

    await act(async () => {
      activateElement(jpegExportInput)
      await flushPromises()
    })

    await act(async () => {
      activateElement(getButtonByExactText(surface.container, "Download JPEG"))
      await flushPromises()
    })

    await act(async () => {
      activateElement(webpExportInput)
      await flushPromises()
    })

    await act(async () => {
      activateElement(getButtonByExactText(surface.container, "Download WEBP"))
      await flushPromises()
    })

    expect(downloadDashboardQrNodeExportSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        extension: "jpeg",
        name: "QR Code",
        targetSizePx: 1024,
      }),
    )
    expect(downloadDashboardQrNodeExportSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        extension: "webp",
        name: "QR Code",
        targetSizePx: 1024,
      }),
    )
    expect(downloadDashboardRasterExportSpy).not.toHaveBeenCalled()
  })

  it("renders all qr codes and individual qr layer names in the download target selector", async () => {
    buildDashboardQrNodePayloadSpy.mockResolvedValue(QR_PAYLOAD)
    const surface = renderSurface()

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    await act(async () => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Add QR code"]'))
      await flushPromises()
      await flushPromises()
    })

    expect(
      getRequiredElement(surface.container, 'input[aria-label="Download Current QR"]'),
    ).not.toBeNull()
    expect(
      getRequiredElement(surface.container, 'input[aria-label="Download All QR codes"]'),
    ).not.toBeNull()
    expect(
      getRequiredElement(surface.container, 'input[aria-label="Download QR Code"]'),
    ).not.toBeNull()
    expect(
      getRequiredElement(surface.container, 'input[aria-label="Download QR Code 2"]'),
    ).not.toBeNull()
    expect(
      getRequiredElement(
        surface.container,
        '[data-slot="drafting-download-target-list"]',
      ).className,
    ).toContain("grid-cols-2")
    expect(surface.container.textContent).toContain("Current QR")
  })

  it("downloads all qr layers as a zip using the selected format", async () => {
    buildDashboardQrNodePayloadSpy.mockResolvedValue(QR_PAYLOAD)
    const surface = renderSurface()

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    await act(async () => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Add QR code"]'))
      await flushPromises()
      await flushPromises()
    })

    await act(async () => {
      activateElement(
        getRequiredElement(surface.container, 'input[aria-label="Download All QR codes"]'),
      )
      activateElement(
        getRequiredElement(surface.container, 'input[aria-label="Export WEBP"]'),
      )
      await flushPromises()
    })

    await act(async () => {
      activateElement(getButtonByExactText(surface.container, "Download WEBP"))
      await flushPromises()
    })

    expect(downloadDashboardQrBatchZipExportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: "webp",
        name: "new-qr-studio",
        nodes: expect.arrayContaining([
          expect.objectContaining({ name: "QR Code" }),
          expect.objectContaining({ name: "QR Code 2" }),
        ]),
        targetSizePx: 1024,
      }),
    )
    expect(downloadDashboardQrNodeExportSpy).not.toHaveBeenCalled()
  })

  it("downloads an individual selected qr layer directly", async () => {
    buildDashboardQrNodePayloadSpy.mockResolvedValue(QR_PAYLOAD)
    const surface = renderSurface()

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    await act(async () => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Add QR code"]'))
      await flushPromises()
      await flushPromises()
    })

    await act(async () => {
      activateElement(
        getRequiredElement(surface.container, 'input[aria-label="Download QR Code 2"]'),
      )
      activateElement(getRequiredElement(surface.container, 'input[aria-label="Export SVG"]'))
      await flushPromises()
    })

    await act(async () => {
      activateElement(getButtonByExactText(surface.container, "Download SVG"))
      await flushPromises()
    })

    expect(downloadDashboardQrNodeExportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: "svg",
        name: "QR Code 2",
        node: expect.objectContaining({ name: "QR Code 2" }),
      }),
    )
    expect(downloadDashboardQrBatchZipExportSpy).not.toHaveBeenCalled()
  })

  it("downloads the default named qr layer as svg from the header control", async () => {
    buildDashboardQrNodePayloadSpy.mockImplementationOnce(() => new Promise(() => undefined))
    buildDashboardQrNodePayloadSpy.mockResolvedValueOnce({
      markup: "<svg />",
      naturalHeight: 320,
      naturalWidth: 320,
    })

    const surface = renderSurface()
    const callsBeforeDownload = buildDashboardQrNodePayloadSpy.mock.calls.length

    await act(async () => {
      activateElement(getRequiredElement(surface.container, 'input[aria-label="Export SVG"]'))
      await flushPromises()
    })

    expect(surface.container.querySelector('[data-slot="drafting-raster-preset-section"]')).toBeNull()

    await act(async () => {
      activateElement(getButtonByExactText(surface.container, "Download SVG"))
      await flushPromises()
    })

    expect(buildDashboardQrNodePayloadSpy).toHaveBeenCalledTimes(callsBeforeDownload + 1)
    expect(downloadDashboardQrNodeExportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: "svg",
        name: "QR Code",
        node: expect.objectContaining({ name: "QR Code" }),
      }),
    )
    expect(downloadDashboardRasterExportSpy).not.toHaveBeenCalled()
  })

  it("keeps png export on the qr layer path without an edit mode toggle", async () => {
    vi.useFakeTimers()
    buildDashboardQrNodePayloadSpy.mockResolvedValue(QR_PAYLOAD)
    const surface = renderSurface()

    expect(surface.container.querySelector('button[aria-label="Toggle edit mode"]')).toBeNull()

    const pngExportInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Export PNG"]',
    ) as HTMLInputElement

    await act(async () => {
      activateElement(pngExportInput)
    })
    await act(async () => {
      vi.advanceTimersByTime(250)
      await flushPromises()
    })

    expect(measureDashboardRasterExportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: "png",
        targetSizePx: 1024,
        state: expect.objectContaining({
          data: "https://new-qr-studio.local/launch",
        }),
      }),
    )
    expect(surface.container.textContent).toContain("182000 B")
    expect(
      surface.container.querySelector('[data-slot="drafting-raster-calculated-size"]')
        ?.textContent,
    ).toContain("182000 B")

    await act(async () => {
      activateElement(getButtonByExactText(surface.container, "Download PNG"))
      await flushPromises()
    })

    expect(downloadDashboardQrNodeExportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: "png",
        name: "QR Code",
        targetSizePx: 1024,
      }),
    )
    expect(downloadDashboardRasterExportSpy).not.toHaveBeenCalled()
  })

  it("switches tool button state and updates the tab tray for each dashboard section", () => {
    const surface = renderSurface()
    const contentButton = getRequiredElement(surface.container, 'button[aria-label="Open Content"]')
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')
    const cornerSquareButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner frame"]',
    )

    expect(contentButton.getAttribute("aria-pressed")).toBe("true")
    expect(styleButton.getAttribute("aria-pressed")).toBe("false")
    expect(cornerSquareButton.getAttribute("aria-pressed")).toBe("false")
    expect(getTabLabels(surface.container)).toEqual(["Content"])

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(contentButton.getAttribute("aria-pressed")).toBe("false")
    expect(styleButton.getAttribute("aria-pressed")).toBe("true")
    expect(getTabLabels(surface.container)).toEqual(["Style", "Color", "Size"])

    act(() => {
      cornerSquareButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(cornerSquareButton.getAttribute("aria-pressed")).toBe("true")
    expect(getTabLabels(surface.container)).toEqual(["Style", "Color"])

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(getTabLabels(surface.container)).toEqual([
      "Brands",
      "Colors",
      "Upload",
      "Size",
    ])
  })

  it("opens the non-document layers tool with a dedicated layers panel", () => {
    const surface = renderSurface()
    const layersButton = getRequiredElement(surface.container, 'button[aria-label="Open Layers"]')

    act(() => {
      activateElement(layersButton)
    })

    expect(layersButton.getAttribute("aria-pressed")).toBe("true")
    expect(getTabLabels(surface.container)).toEqual(["Layers"])
    expect(surface.container.querySelector('[data-slot="drafting-layers-tab"]')).not.toBeNull()
  })

  it("ports static content controls into the default /new panel without render type cards", () => {
    const surface = renderSurface()
    const contentTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-content-tab"]',
    )
    const qrData = getRequiredElement(surface.container, 'textarea[aria-label="Auto content"]') as HTMLTextAreaElement

    expect(contentTab).not.toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-content-type-selector"]')).not.toBeNull()
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-content-type-selector"]')
        .className,
    ).toContain("grid-cols-3")
    expect(
      getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]')
        .className,
    ).toContain("h-10")
    expect(
      getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]')
        .getAttribute("data-drafting-dropdown-trigger"),
    ).toBe("true")
    expect(
      getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]')
        .getAttribute("data-slot"),
    ).toBe("dropdown-menu-trigger")
    expect(
      getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]')
        .className,
    ).toContain("border-[var(--drafting-dropdown-border)]")
    expect(
      getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]')
        .querySelector("svg"),
    ).not.toBeNull()
    expect(
      getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]')
        .className,
    ).toContain("bg-[var(--drafting-dropdown-trigger-surface)]")
    expect(
      getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]')
        .className,
    ).not.toContain("bg-[var(--drafting-ink)]")
    expect(surface.container.textContent).toContain("Popular")
    expect(surface.container.textContent).not.toContain("Wi-Fi")
    expect(surface.container.textContent).not.toContain("Discord")
    expect(surface.container.textContent).toContain("Encoded value")
    expect(qrData.value).toBe("https://new-qr-studio.local/launch")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-qr-content-type",
      ),
    ).toBe("auto")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-qr-content-value",
      ),
    ).toBe("https://new-qr-studio.local/launch")
    expect(surface.container.querySelector('[data-slot="drafting-render-type-grid"]')).toBeNull()
    expect(surface.container.textContent).not.toContain("Render type")
    expect(surface.container.querySelector('[data-slot="drafting-style-margin-slider"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-style-size-slider"]')).toBeNull()
  })

  it("builds Wi-Fi payloads from the content type selector and preserves per-type drafts", () => {
    const surface = renderSurface()

    act(() => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]'))
    })
    const menuContent = getRequiredElement(document.body, '[data-slot="dropdown-menu-content"]')
    const globalsSource = readFileSync("app/globals.css", "utf8")
    expect(globalsSource).toContain('[data-drafting-dropdown-content="true"]')
    expect(globalsSource).toContain('.dark [data-drafting-dropdown-content="true"]')
    expect(globalsSource).toContain("--drafting-dropdown-menu-surface-open: #252a33;")
    expect(menuContent.getAttribute("data-drafting-dropdown-content")).toBe("true")
    expect(
      menuContent.className,
    ).toContain("bg-[var(--drafting-dropdown-menu-surface-open)]")
    expect(menuContent.className).toContain("w-[280px]")
    expect(menuContent.className).toContain("shadow-[var(--drafting-dropdown-menu-shadow-open)]")
    const selectedAutoItem = getRequiredElement(
      document.body,
      '[data-slot="dropdown-menu-item"][data-content-type="auto"]',
    )
    expect(selectedAutoItem.className).toContain("bg-[var(--drafting-dropdown-selected-fill)]")
    expect(selectedAutoItem.className).not.toContain("bg-[var(--drafting-ink)]")
    expect(selectedAutoItem.className).not.toContain("border-dashed")
    expect(selectedAutoItem.className).not.toContain("focus:bg-accent")
    expect(selectedAutoItem.querySelector("svg")?.getAttribute("class")).toContain("opacity-100")
    const wifiItem = getRequiredElement(
      document.body,
      '[data-slot="dropdown-menu-item"][data-content-type="wifi"]',
    )
    expect(wifiItem.className).toContain("bg-transparent")
    expect(wifiItem.className).not.toContain("bg-[var(--drafting-ink)]")
    expect(wifiItem.querySelectorAll("svg")).toHaveLength(2)
    expect(wifiItem.querySelector("svg")?.getAttribute("class")).toContain("opacity-0")
    act(() => {
      activateElement(wifiItem)
    })

    const ssidInput = getRequiredElement(surface.container, 'input[aria-label="Network name"]') as HTMLInputElement
    const passwordInput = getRequiredElement(surface.container, 'input[aria-label="Wi-Fi password"]') as HTMLInputElement
    const hiddenInput = getRequiredElement(surface.container, 'input[aria-label="Hidden network"]') as HTMLInputElement

    act(() => {
      changeInputValue(ssidInput, "Cafe;Guest")
      changeInputValue(passwordInput, "pa:ss")
      activateElement(hiddenInput)
    })

    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-qr-content-value",
      ),
    ).toBe(String.raw`WIFI:T:WPA;S:Cafe\;Guest;P:pa\:ss;H:true;;`)

    act(() => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Open Contact content types"]'))
    })
    act(() => {
      activateElement(getRequiredElement(document.body, '[data-slot="dropdown-menu-item"][data-content-type="sms"]'))
    })
    act(() => {
      changeInputValue(
        getRequiredElement(surface.container, 'input[aria-label="SMS phone number"]') as HTMLInputElement,
        "+1 555 010 2000",
      )
      changeInputValue(
        getRequiredElement(surface.container, 'textarea[aria-label="SMS message"]') as HTMLTextAreaElement,
        "Bring menus",
      )
    })

    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-qr-content-value",
      ),
    ).toBe("sms:+15550102000?body=Bring%20menus")

    act(() => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]'))
    })
    act(() => {
      activateElement(getRequiredElement(document.body, '[data-slot="dropdown-menu-item"][data-content-type="wifi"]'))
    })

    expect(
      (getRequiredElement(surface.container, 'input[aria-label="Network name"]') as HTMLInputElement)
        .value,
    ).toBe("Cafe;Guest")
  })

  it("shows validation for missing required static content fields", () => {
    const surface = renderSurface()

    act(() => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Open Popular content types"]'))
    })
    act(() => {
      activateElement(getRequiredElement(document.body, '[data-slot="dropdown-menu-item"][data-content-type="wifi"]'))
    })

    expect(surface.container.textContent).toContain("Enter a network name.")

    act(() => {
      changeInputValue(
        getRequiredElement(surface.container, 'input[aria-label="Network name"]') as HTMLInputElement,
        "Studio",
      )
    })

    expect(surface.container.textContent).not.toContain("Enter a network name.")
  })

  it("renders a selectable option-card grid for the style tab", () => {
    const surface = renderSurface()
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const styleGrid = getRequiredElement(
      surface.container,
      '[data-slot="drafting-style-option-grid"]',
    )
    const roundedInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Rounded"]',
    ) as HTMLInputElement
    const squareInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Square"]',
    ) as HTMLInputElement

    expect(styleGrid.getAttribute("role")).toBe("radiogroup")
    expect(styleGrid.querySelectorAll('[data-slot="option-card"]').length).toBe(8)
    expect(
      squareInput.parentElement
        ?.querySelector('[data-slot="option-card"]')
        ?.getAttribute("class"),
    ).toContain("border-[var(--drafting-option-card-border)]")
    expect(
      squareInput.parentElement
        ?.querySelector('[data-slot="option-card"]')
        ?.getAttribute("class"),
    ).toContain("shadow-[var(--drafting-option-card-shadow-rest)]")
    expect(styleGrid.innerHTML).not.toMatch(
      /dark:[^"]*shadow-\[[^\]]*rgba\(255,255,255/,
    )
    expect(roundedInput.checked).toBe(true)
    expect(squareInput.checked).toBe(false)

    act(() => {
      squareInput.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(roundedInput.checked).toBe(false)
    expect(squareInput.checked).toBe(true)
  })

  it("renders a drafting color accordion for the style color tab with solid, gradient, and palette", () => {
    const surface = renderSurface()
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const colorTab = getTabTriggerByText(surface.container, "Color")

    act(() => {
      activateElement(colorTab)
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-dots-color-accordion"]',
    )

    expect(accordion.getAttribute("data-slot")).toBe("drafting-dots-color-accordion")
    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(3)
    expect(surface.container.textContent).toContain("Solid")
    expect(surface.container.textContent).toContain("Gradient")
    expect(surface.container.textContent).toContain("Palette")
    expect(accordion.innerHTML).toContain("text-[var(--drafting-ink-muted)]")
    expect(
      getRequiredElement(
        accordion,
        '[data-slot="drafting-color-trigger"]',
      ).className,
    ).toContain("[&_[data-slot=accordion-chevron]]:text-[var(--drafting-ink-muted)]")
    const triggerMarkup = Array.from(
      accordion.querySelectorAll('[data-slot="drafting-color-trigger"]'),
    )
      .map((trigger) => trigger.outerHTML)
      .join("")
    expect(triggerMarkup).not.toContain("text-muted-foreground")
    expect(triggerMarkup).not.toContain("#111111")
  })

  it("renders a drafting size tab for style with the qr margin and size sliders", () => {
    const surface = renderSurface()
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Size"))
    })

    const sizeTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-style-size-tab"]',
    )

    expect(sizeTab.querySelector('[data-slot="drafting-style-margin-slider"]')).not.toBeNull()
    expect(sizeTab.querySelector('[data-slot="drafting-style-size-slider"]')).not.toBeNull()
    expect(sizeTab.textContent).toContain("Outer margin")
    expect(sizeTab.textContent).toContain("Size")
    expect(
      sizeTab.querySelector('[data-slot="drafting-style-margin-slider"]')?.getAttribute("data-appearance"),
    ).toBe("drafting")
    expect(
      sizeTab.querySelector('[data-slot="drafting-style-size-slider"]')?.getAttribute("data-appearance"),
    ).toBe("drafting")
  })

  it("expands style color modes without selecting them from the accordion header", () => {
    const surface = renderSurface()
    const styleButton = getRequiredElement(surface.container, 'button[aria-label="Open Style"]')

    act(() => {
      styleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const colorTab = getTabTriggerByText(surface.container, "Color")

    act(() => {
      activateElement(colorTab)
    })

    const solidItem = getRequiredElement(
      surface.container,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientTrigger = getAccordionTriggerByText(surface.container, "Gradient")
    const gradientItem = getRequiredElement(
      surface.container,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )
    const paletteTrigger = getAccordionTriggerByText(surface.container, "Palette")
    const paletteItem = getRequiredElement(
      surface.container,
      '[data-slot="accordion-item"][data-item-id="palette"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")
    expect(gradientItem.getAttribute("data-selected")).toBe("false")
    expect(paletteItem.getAttribute("data-selected")).toBe("false")

    act(() => {
      activateElement(gradientTrigger)
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("false")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
    const gradientTypeGrid = getRequiredElement(
      gradientItem,
      '[data-slot="gradient-type-option-grid"]',
    )
    const gradientTypeIcons = Array.from(gradientTypeGrid.querySelectorAll("svg"))
    expect(gradientTypeIcons.length).toBeGreaterThan(0)
    expect(gradientTypeIcons.every((icon) => icon.getAttribute("color") === "currentColor")).toBe(true)

    act(() => {
      activateElement(paletteTrigger)
    })

    expect(paletteItem.getAttribute("data-selected")).toBe("false")
    expect(paletteItem.getAttribute("data-state")).toBe("open")
    expect(gradientItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getButtonByExactText(surface.container, "Use palette"))
    })

    expect(paletteItem.getAttribute("data-selected")).toBe("true")
  })

  it("renders a drafting color accordion for the corner frame color tab with solid and gradient", () => {
    const surface = renderSurface()
    const cornerFrameButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner frame"]',
    )

    act(() => {
      cornerFrameButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const colorTab = getTabTriggerByText(surface.container, "Color")

    act(() => {
      activateElement(colorTab)
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-square-color-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Solid")
    expect(accordion.textContent).toContain("Gradient")
  })

  it("expands the corner frame gradient color mode without selecting it from the accordion header", () => {
    const surface = renderSurface()
    const cornerFrameButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner frame"]',
    )

    act(() => {
      cornerFrameButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Color"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-square-color-accordion"]',
    )
    const solidItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Gradient"))
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("false")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
  })

  it("renders a selectable option-card grid for the corner frame style tab", () => {
    const surface = renderSurface()
    const cornerFrameButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner frame"]',
    )

    act(() => {
      cornerFrameButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const cornerFrameGrid = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-square-option-grid"]',
    )
    const extraRoundedInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Extra rounded"]',
    ) as HTMLInputElement
    const squareInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Square"]',
    ) as HTMLInputElement

    expect(cornerFrameGrid.getAttribute("role")).toBe("radiogroup")
    expect(
      cornerFrameGrid.querySelectorAll('[data-slot="option-card"]').length,
    ).toBe(7)
    expect(cornerFrameGrid.innerHTML).toContain("size-[6.5rem]")
    expect(extraRoundedInput.checked).toBe(true)
    expect(squareInput.checked).toBe(false)

    act(() => {
      squareInput.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(extraRoundedInput.checked).toBe(false)
    expect(squareInput.checked).toBe(true)
  })

  it("renders a selectable option-card grid for the corner dot style tab", () => {
    const surface = renderSurface()
    const cornerDotButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner dot"]',
    )

    act(() => {
      cornerDotButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const cornerDotGrid = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-dot-option-grid"]',
    )
    const dotInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Dot"]',
    ) as HTMLInputElement
    const roundedInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="Rounded"]',
    ) as HTMLInputElement

    expect(cornerDotGrid.getAttribute("role")).toBe("radiogroup")
    expect(cornerDotGrid.querySelectorAll('[data-slot="option-card"]').length).toBe(7)
    expect(dotInput.checked).toBe(true)
    expect(roundedInput.checked).toBe(false)

    act(() => {
      roundedInput.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(dotInput.checked).toBe(false)
    expect(roundedInput.checked).toBe(true)
  })

  it("renders a drafting color accordion for the corner dot color tab with solid and gradient", () => {
    const surface = renderSurface()
    const cornerDotButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner dot"]',
    )

    act(() => {
      cornerDotButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Color"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-dot-color-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Solid")
    expect(accordion.textContent).toContain("Gradient")
  })

  it("expands the corner dot gradient color mode without selecting it from the accordion header", () => {
    const surface = renderSurface()
    const cornerDotButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Corner dot"]',
    )

    act(() => {
      cornerDotButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Color"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-corner-dot-color-accordion"]',
    )
    const solidItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Gradient"))
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("false")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
  })

  it("renders a drafting color accordion for the background colors tab with solid and gradient", () => {
    const surface = renderSurface()
    const backgroundButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Background"]',
    )

    act(() => {
      backgroundButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-background-color-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Solid")
    expect(accordion.textContent).toContain("Gradient")
  })

  it("expands the background gradient color mode without selecting it from the accordion header", () => {
    const surface = renderSurface()
    const backgroundButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Background"]',
    )

    act(() => {
      backgroundButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-background-color-accordion"]',
    )
    const solidItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Gradient"))
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("false")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
  })

  it("renders a drafting color accordion for the logo colors tab with solid and gradient", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Colors"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Solid")
    expect(accordion.textContent).toContain("Gradient")
  })

  it("expands the logo gradient color mode without selecting it from the accordion header", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Colors"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"]',
    )
    const solidItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="solid"]',
    )
    const gradientItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="gradient"]',
    )

    expect(solidItem.getAttribute("data-selected")).toBe("true")
    expect(solidItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Gradient"))
    })

    expect(gradientItem.getAttribute("data-selected")).toBe("false")
    expect(gradientItem.getAttribute("data-state")).toBe("open")
    expect(solidItem.getAttribute("data-state")).toBe("open")
  })

  it("renders the drafting brand icon tab with category filters and search", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const brandTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-brand-icon-tab"]',
    )

    expect(brandTab.querySelector('[data-slot="drafting-brand-icon-picker"]')).not.toBeNull()
    const searchInput = getRequiredElement(
      brandTab,
      'input[aria-label="Search brand icons"]',
    ) as HTMLInputElement
    const searchIcon = getRequiredElement(
      brandTab,
      '[data-slot="drafting-brand-icon-search-icon"]',
    )
    const categoryPicker = getRequiredElement(
      brandTab,
      '[data-slot="drafting-brand-icon-category-picker"]',
    )

    expect(searchInput.placeholder).toBe("Search icons")
    expect(searchIcon.getAttribute("aria-hidden")).toBe("true")
    expect(
      Boolean(
        searchInput.compareDocumentPosition(categoryPicker) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true)
    expect(
      brandTab.querySelectorAll('[data-slot="drafting-brand-icon-option"]').length,
    ).toBeGreaterThan(0)

    const brandInput = getRequiredElement(
      brandTab,
      'input[data-slot="option-card-input"][aria-label="Instagram"]',
    )
    const brandInputRoot = brandInput.closest('[data-slot="option-card-root"]')

    expect(brandInput.className).toContain("absolute")
    expect(brandInput.className).toContain("inset-0")
    expect(brandInput.className).not.toContain("sr-only")
    expect(brandInputRoot?.className).toContain("relative")
  })

  it("selects a drafting brand icon and marks preset mode active", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const instagramOption = getRequiredElement(
      surface.container,
      'input[data-slot="option-card-input"][aria-label="Instagram"]',
    ) as HTMLInputElement

    expect(surface.container.querySelector('[data-logo-source-mode="preset"]')).toBeNull()

    act(() => {
      activateElement(instagramOption)
    })

    expect(instagramOption.checked).toBe(true)
    expect(
      surface.container.querySelector('[data-logo-source-mode="preset"]'),
    ).not.toBeNull()
    expect(
      surface.container.querySelector('[data-logo-preset-id="instagram"]'),
    ).not.toBeNull()
  })

  it("updates preset-driven logo output when the drafting solid color changes", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(
        getRequiredElement(
          surface.container,
          'input[data-slot="option-card-input"][aria-label="Instagram"]',
        ),
      )
      activateElement(getTabTriggerByText(surface.container, "Colors"))
    })

    const previousPresetValue =
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-logo-preset-value",
      ) ?? ""
    const solidColorInput = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"] [data-item-id="solid"] [data-slot="color-picker"] input',
    ) as HTMLInputElement

    act(() => {
      changeInputValue(solidColorInput, "15")
    })

    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')

    expect(surfaceRoot.getAttribute("data-logo-source-mode")).toBe("preset")
    expect(surfaceRoot.getAttribute("data-logo-preset-id")).toBe("instagram")
    expect(surfaceRoot.getAttribute("data-logo-preset-value")).not.toBe(previousPresetValue)
  })

  it("updates preset-driven logo output when the drafting gradient changes", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(
        getRequiredElement(
          surface.container,
          'input[data-slot="option-card-input"][aria-label="Instagram"]',
        ),
      )
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Colors"))
    })

    const logoColorAccordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"]',
    )

    act(() => {
      activateElement(getAccordionTriggerByText(logoColorAccordion, "Gradient"))
    })

    const previousPresetValue =
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-logo-preset-value",
      ) ?? ""
    const gradientColorInput = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-color-accordion"] [data-item-id="gradient"] [data-slot="color-picker"] input',
    ) as HTMLInputElement

    act(() => {
      changeInputValue(gradientColorInput, "15")
    })

    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')

    expect(surfaceRoot.getAttribute("data-logo-source-mode")).toBe("preset")
    expect(surfaceRoot.getAttribute("data-logo-preset-id")).toBe("instagram")
    expect(surfaceRoot.getAttribute("data-logo-color-mode")).toBe("gradient")
    expect(surfaceRoot.getAttribute("data-logo-preset-value")).not.toBe(previousPresetValue)
  })

  it("renders a drafting source accordion for the background upload tab with upload file and remote url", () => {
    const surface = renderSurface()
    const backgroundButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Background"]',
    )

    act(() => {
      backgroundButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Upload"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-background-upload-accordion"]',
    )

    expect(accordion.querySelectorAll('[data-slot="accordion-item"]').length).toBe(2)
    expect(accordion.textContent).toContain("Upload file")
    expect(accordion.textContent).toContain("Remote URL")
    expect(surface.container.querySelector('[aria-label="File upload"]')).not.toBeNull()

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Remote URL"))
    })

    expect(
      surface.container.querySelector('input[aria-label="Background image URL"]'),
    ).not.toBeNull()
  })

  it("expands the logo remote url source mode without selecting it from the accordion header", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Upload"))
    })

    const accordion = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-upload-accordion"]',
    )
    const uploadItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="upload"]',
    )
    const urlItem = getRequiredElement(
      accordion,
      '[data-slot="accordion-item"][data-item-id="url"]',
    )

    expect(uploadItem.getAttribute("data-selected")).toBe("true")
    expect(uploadItem.getAttribute("data-state")).toBe("open")

    act(() => {
      activateElement(getAccordionTriggerByText(accordion, "Remote URL"))
    })

    expect(urlItem.getAttribute("data-selected")).toBe("false")
    expect(urlItem.getAttribute("data-state")).toBe("open")
    expect(uploadItem.getAttribute("data-state")).toBe("open")
  })

  it("clears the drafting preset selection when entering a remote logo url", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(
        getRequiredElement(
          surface.container,
          'input[data-slot="option-card-input"][aria-label="Instagram"]',
        ),
      )
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Upload"))
    })

    const remoteUrlTrigger = getAccordionTriggerByText(
      getRequiredElement(surface.container, '[data-slot="drafting-logo-upload-accordion"]'),
      "Remote URL",
    )

    act(() => {
      activateElement(remoteUrlTrigger)
    })

    const remoteUrlInput = getRequiredElement(
      surface.container,
      'input[aria-label="Remote logo URL"]',
    ) as HTMLInputElement

    act(() => {
      changeInputValue(remoteUrlInput, "https://example.com/logo.png")
    })

    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')

    expect(surfaceRoot.getAttribute("data-logo-source-mode")).toBe("url")
    expect(surfaceRoot.getAttribute("data-logo-preset-id")).toBe("")
    expect(surfaceRoot.getAttribute("data-logo-preset-value")).toBe("")
  })

  it("clears the drafting preset selection when uploading a logo file", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(
        getRequiredElement(
          surface.container,
          'input[data-slot="option-card-input"][aria-label="Instagram"]',
        ),
      )
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Upload"))
    })

    const fileInput = getRequiredElement(
      surface.container,
      'input[aria-label="File input"]',
    ) as HTMLInputElement
    const logoFile = new File(["logo"], "logo.png", { type: "image/png" })

    vi.useFakeTimers()

    act(() => {
      setInputFiles(fileInput, [logoFile])
      fileInput.dispatchEvent(new Event("change", { bubbles: true }))
    })

    act(() => {
      vi.runAllTimers()
    })

    vi.useRealTimers()

    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')

    expect(surfaceRoot.getAttribute("data-logo-source-mode")).toBe("upload")
    expect(surfaceRoot.getAttribute("data-logo-preset-id")).toBe("")
    expect(surfaceRoot.getAttribute("data-logo-preset-value")).toBe("")
  })

  it("renders the logo size tab with both sliders and both toggles", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Size"))
    })

    const sizeTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-size-tab"]',
    )

    expect(sizeTab.querySelector('[data-slot="drafting-logo-size-slider"]')).not.toBeNull()
    expect(sizeTab.querySelector('[data-slot="drafting-logo-margin-slider"]')).not.toBeNull()
    expect(sizeTab.querySelector('[data-slot="drafting-logo-hide-background-dots"]')).not.toBeNull()
    expect(sizeTab.querySelector('[data-slot="drafting-logo-save-as-blob"]')).not.toBeNull()
    expect(surface.container.textContent).toContain("Logo size")
    expect(surface.container.textContent).toContain("Logo margin")
    expect(surface.container.textContent).toContain("Hide background dots")
    expect(surface.container.textContent).toContain("Save embedded image as blob")
  })

  it("seeds the logo size tab defaults from the shared qr studio defaults", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')
    const defaultState = createDefaultQrStudioState()

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Size"))
    })

    const sizeTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-logo-size-tab"]',
    )
    const hideBackgroundDotsSwitch = getRequiredElement(
      sizeTab,
      '#drafting-hide-background-dots',
    )
    const saveAsBlobSwitch = getRequiredElement(sizeTab, '#drafting-save-as-blob')

    expect(sizeTab.textContent).toContain(`Logo size: ${Math.round(defaultState.imageOptions.imageSize * 100)}%`)
    expect(sizeTab.textContent).toContain(`Logo margin: ${Math.round(defaultState.imageOptions.margin)} px`)
    expect(hideBackgroundDotsSwitch.getAttribute("aria-checked")).toBe(
      String(defaultState.imageOptions.hideBackgroundDots),
    )
    expect(saveAsBlobSwitch.getAttribute("aria-checked")).toBe(
      String(defaultState.imageOptions.saveAsBlob),
    )
  })

  it("updates the logo size tab toggle states when toggled", () => {
    const surface = renderSurface()
    const logoButton = getRequiredElement(surface.container, 'button[aria-label="Open Logo"]')
    const defaultState = createDefaultQrStudioState()

    act(() => {
      logoButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    act(() => {
      activateElement(getTabTriggerByText(surface.container, "Size"))
    })

    const hideBackgroundDotsSwitch = getRequiredElement(
      surface.container,
      '#drafting-hide-background-dots',
    )
    const saveAsBlobSwitch = getRequiredElement(surface.container, '#drafting-save-as-blob')

    expect(hideBackgroundDotsSwitch.getAttribute("aria-checked")).toBe(
      String(defaultState.imageOptions.hideBackgroundDots),
    )
    expect(saveAsBlobSwitch.getAttribute("aria-checked")).toBe(
      String(defaultState.imageOptions.saveAsBlob),
    )

    act(() => {
      activateElement(hideBackgroundDotsSwitch)
      activateElement(saveAsBlobSwitch)
    })

    expect(hideBackgroundDotsSwitch.getAttribute("aria-checked")).toBe(
      String(!defaultState.imageOptions.hideBackgroundDots),
    )
    expect(saveAsBlobSwitch.getAttribute("aria-checked")).toBe(
      String(!defaultState.imageOptions.saveAsBlob),
    )
  })

  it("renders the encoding tab with a type number slider and four error correction cards", () => {
    const surface = renderSurface()
    const encodingButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Encoding"]',
    )
    const defaultState = createDefaultQrStudioState()

    act(() => {
      encodingButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const encodingTab = getRequiredElement(
      surface.container,
      '[data-slot="drafting-encoding-tab"]',
    )
    const surfaceRoot = getRequiredElement(surface.container, '[data-slot="drafting-surface"]')
    const quartileInput = getRequiredElement(
      encodingTab,
      'input[type="radio"][aria-label="Quartile (Q)"]',
    ) as HTMLInputElement

    expect(
      encodingTab.querySelector('[data-slot="drafting-type-number-slider"]'),
    ).not.toBeNull()
    expect(
      encodingTab.querySelectorAll('input[name="drafting-error-correction"]'),
    ).toHaveLength(4)
    expect(encodingTab.textContent).toContain("Type number: Auto")
    expect(encodingTab.textContent).toContain("Error correction")
    expect(quartileInput.checked).toBe(true)
    expect(surfaceRoot.getAttribute("data-qr-type-number")).toBe(
      String(defaultState.qrOptions.typeNumber),
    )
    expect(surfaceRoot.getAttribute("data-qr-error-correction-level")).toBe(
      defaultState.qrOptions.errorCorrectionLevel,
    )
  })

  it("updates the selected error correction level from the encoding option cards", () => {
    const surface = renderSurface()
    const encodingButton = getRequiredElement(
      surface.container,
      'button[aria-label="Open Encoding"]',
    )

    act(() => {
      encodingButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const highInput = getRequiredElement(
      surface.container,
      'input[type="radio"][aria-label="High (H)"]',
    ) as HTMLInputElement

    act(() => {
      activateElement(highInput)
    })

    expect(highInput.checked).toBe(true)
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-qr-error-correction-level",
      ),
    ).toBe("H")
  })

  it("does not expose the dashboard edit mode toggle or edit rail on /new", () => {
    const surface = renderSurface()

    expect(surface.container.querySelector('button[aria-label="Toggle edit mode"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="dashboard-compose-edit-mode"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="dashboard-edit-rail"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-edit-nav-scroll-area"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-edit-panel-scroll"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="dashboard-edit-page"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="tabs-list"]')).not.toBeNull()
    expect(surface.container.querySelector('[data-drafting-tool-button="true"]')).not.toBeNull()
    expect(surface.container.querySelector('button[aria-label="Open Page"]')).toBeNull()
    expect(surface.container.querySelector('button[aria-label="Open Position"]')).toBeNull()
    expect(surface.container.querySelector('button[aria-label="Open Assets"]')).toBeNull()
  })

  it("does not render a document guide overlay in the default compose surface", () => {
    const surface = renderSurface()

    expect(
      surface.container.querySelector('[data-slot="dashboard-compose-document-guides"]'),
    ).toBeNull()
  })

  it("keeps the normal /new tool rail active because edit mode is unavailable", () => {
    const surface = renderSurface()
    const layersButton = getRequiredElement(surface.container, 'button[aria-label="Open Layers"]')

    act(() => {
      activateElement(layersButton)
    })

    expect(surface.container.querySelector('button[aria-label="Toggle edit mode"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="dashboard-edit-rail"]')).toBeNull()
    expect(getTabLabels(surface.container)).toEqual(["Layers"])
    expect(getRequiredElement(surface.container, 'button[aria-label="Open Layers"]').getAttribute("aria-pressed")).toBe("true")
  })

  it("adds a duplicated qr layer from the bottom toolbar and selects it", async () => {
    buildDashboardQrNodePayloadSpy.mockResolvedValue(QR_PAYLOAD)
    const surface = renderSurface()

    await act(async () => {
      await flushPromises()
      await flushPromises()
    })

    expect(surface.container.querySelectorAll('[data-slot="dashboard-compose-node"]')).toHaveLength(1)

    await act(async () => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Add QR code"]'))
      await flushPromises()
      await flushPromises()
    })

    const selectedNodeId = getRequiredElement(
      surface.container,
      '[data-slot="drafting-surface"]',
    ).getAttribute("data-compose-selected-node-id")

    expect(selectedNodeId).toMatch(/^dashboard-qr-node-/)
    expect(selectedNodeId).not.toBe(DASHBOARD_QR_NODE_ID)
    expect(surface.container.querySelectorAll('[data-slot="dashboard-compose-node"]')).toHaveLength(2)
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-compose-edit-mode",
      ),
    ).toBe("false")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-surface"]').getAttribute(
        "data-compose-edit-section",
      ),
    ).toBeNull()
    expect(surface.container.querySelector('[data-slot="dashboard-edit-rail"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="dashboard-layer-row"]')).toBeNull()
    expect(surface.container.querySelector('[data-slot="drafting-layer-row"]')).toBeNull()

    act(() => {
      activateElement(getRequiredElement(surface.container, 'button[aria-label="Open Layers"]'))
    })

    expect(surface.container.querySelectorAll('[data-slot="drafting-layer-row"]')).toHaveLength(2)
    expect(surface.container.textContent).toContain("QR Code 2")
    expect(buildDashboardQrNodePayloadSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: "https://new-qr-studio.local/launch",
      }),
    )
  })

  it("keeps the tab tray sticky and the active middle panel as the dedicated scroll area", () => {
    const surface = renderSurface()
    const stickyTabs = getRequiredElement(surface.container, '[data-slot="drafting-tabs-sticky"]')
    const navFrame = getRequiredElement(surface.container, '[data-slot="drafting-nav"]')
    const navScrollArea = getRequiredElement(
      surface.container,
      '[data-slot="drafting-nav-scroll-area"]',
    )
    const navScroll = getRequiredElement(
      surface.container,
      '[data-slot="drafting-nav-scroll"]',
    )
    const navScrollContent = getRequiredElement(
      surface.container,
      '[data-slot="drafting-nav-scroll-content"]',
    )
    const scrollFrame = getRequiredElement(surface.container, '[data-slot="drafting-scroll-area"]')
    const panelScrollArea = getRequiredElement(
      surface.container,
      '[data-slot="drafting-tab-panel-scroll-area"]',
    )
    const panelScroll = getRequiredElement(
      surface.container,
      '[data-slot="drafting-tab-panel-scroll"]',
    )

    expect(stickyTabs.className).toContain("sticky")
    expect(navFrame.className).toContain("isolate")
    expect(navFrame.className).toContain("order-2")
    expect(navFrame.className).toContain("border-t")
    expect(navFrame.className).toContain("lg:border-t-0")
    expect(navFrame.className).not.toContain("border-y")
    expect(navFrame.className).toContain("border-transparent")
    expect(navFrame.className).not.toContain("overflow-y-auto")
    expect(navFrame.className).not.toContain("py-4")
    expect(navScrollArea.getAttribute("data-scrollbar-visibility")).toBe("while-scrolling")
    expect(navScrollArea.className).toContain("overflow-hidden")
    expect(navScrollArea.className).toContain("h-[var(--new-mobile-rail-height)]")
    expect(navScroll.className).toContain("overflow-x-auto")
    expect(navScroll.className).toContain("lg:overflow-x-hidden")
    expect(navScroll.className).toContain("lg:overflow-y-auto")
    expect(navScroll.className).toContain("scroll-fade-effect-x")
    expect(navScroll.className).toContain("scroll-fade-effect-y")
    expect(navScroll.getAttribute("data-radix-scroll-area-viewport")).toBe("")
    expect(
      surface.container.querySelector('[data-slot="drafting-nav-scrollbar-horizontal"]'),
    ).toBeNull()
    expect(
      surface.container.querySelector('[data-slot="drafting-nav-scrollbar-vertical"]'),
    ).toBeNull()
    expect(navScrollContent.className).toContain("flex-row")
    expect(navScrollContent.className).toContain("lg:flex-col")
    expect(navScrollContent.className).toContain("py-2")
    expect(navScrollContent.className).toContain("lg:py-4")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-tool-button-icon"]').className,
    ).toContain("flex")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-tool-button-icon"]').className,
    ).not.toContain("hidden")
    expect(
      getRequiredElement(surface.container, '[data-slot="drafting-tool-button-icon"]').className,
    ).toContain("lg:size-10")
    expect(
      getRequiredElement(surface.container, '[data-drafting-tool-button="true"]').className,
    ).toContain("h-16")
    expect(
      getRequiredElement(surface.container, '[data-drafting-tool-button="true"]').className,
    ).toContain("w-20")
    expect(
      getRequiredElement(surface.container, '[data-drafting-tool-button="true"]').className,
    ).toContain("min-w-20")
    expect(
      getRequiredElement(surface.container, '[data-drafting-tool-button="true"]').className,
    ).toContain("flex-col")
    expect(scrollFrame.className).toContain("hidden")
    expect(scrollFrame.className).toContain("lg:block")
    expect(scrollFrame.className).not.toContain("order-3")
    expect(scrollFrame.className).not.toContain("overflow-y-auto")
    expect(panelScrollArea.getAttribute("data-slot")).toBe("drafting-tab-panel-scroll-area")
    expect(panelScrollArea.getAttribute("data-scrollbar-visibility")).toBe("while-scrolling")
    expect(panelScrollArea.className).toContain("overflow-hidden")
    expect(panelScroll.className).toContain("overflow-x-hidden")
    expect(panelScroll.className).toContain("scroll-fade-effect-y")
    expect(panelScroll.className).not.toContain("overflow-y-auto")
    expect(panelScroll.getAttribute("data-radix-scroll-area-viewport")).toBe("")
    expect(
      surface.container.querySelector('[data-slot="drafting-tab-panel-scrollbar"]'),
    ).toBeNull()
    expect(panelScroll.getAttribute("data-active-tool")).toBe("content")
    expect(panelScroll.getAttribute("data-active-tab")).toBe("content")

    const globalsSource = readFileSync("app/globals.css", "utf8")

    expect(globalsSource).toContain('[data-slot="drafting-nav"]::before')
    expect(globalsSource).not.toContain('[data-slot="drafting-nav"]::after')
  })
})

function renderSurface() {
  const container = document.createElement("div")
  const root = createRoot(container)

  act(() => {
    root.render(<DraftingSurface />)
  })

  cleanupCallbacks.push(() => {
    act(() => {
      root.unmount()
    })
  })

  document.body.appendChild(container)

  return { container }
}

function getRequiredElement(parent: ParentNode, selector: string) {
  const element = parent.querySelector(selector)

  expect(element).not.toBeNull()

  return element as HTMLElement
}

function getRadioInputByAriaLabel(parent: ParentNode, label: string) {
  const element = Array.from(parent.querySelectorAll('input[type="radio"]')).find(
    (input) => input.getAttribute("aria-label") === label,
  )

  expect(element).not.toBeNull()

  return element as HTMLInputElement
}

function activateElement(element: HTMLElement) {
  const PointerEventConstructor = window.PointerEvent ?? window.MouseEvent

  element.dispatchEvent(
    new PointerEventConstructor("pointerdown", {
      bubbles: true,
      button: 0,
      ctrlKey: false,
    }),
  )
  element.dispatchEvent(
    new PointerEventConstructor("pointerup", {
      bubbles: true,
      button: 0,
      ctrlKey: false,
    }),
  )
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }))
  element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }))
  element.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }))
}

function changeInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    element instanceof window.HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype
  const valueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    "value",
  )?.set

  valueSetter?.call(element, value)
  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
}

function setInputFiles(element: HTMLInputElement, files: File[]) {
  Object.defineProperty(element, "files", {
    configurable: true,
    value: files,
  })
}

function getTabLabels(parent: ParentNode) {
  return Array.from(parent.querySelectorAll('[data-slot="tabs-trigger"]')).map(
    (element) => element.textContent?.trim() ?? "",
  )
}

function getTabTriggerByText(parent: ParentNode, text: string) {
  const trigger = Array.from(parent.querySelectorAll('[data-slot="tabs-trigger"]')).find(
    (element) => element.textContent?.trim() === text,
  )

  expect(trigger).not.toBeNull()

  return trigger as HTMLElement
}

function getAccordionTriggerByText(parent: ParentNode, text: string) {
  const trigger = Array.from(
    parent.querySelectorAll('[data-slot="drafting-color-trigger"]'),
  ).find((element) => element.textContent?.includes(text))

  expect(trigger).not.toBeNull()

  return trigger as HTMLElement
}

function getButtonByExactText(parent: ParentNode, text: string) {
  const button = Array.from(parent.querySelectorAll("button")).find(
    (element) => element.textContent?.trim() === text,
  )

  expect(button).not.toBeNull()

  return button as HTMLButtonElement
}

async function flushPromises() {
  await Promise.resolve()
}
