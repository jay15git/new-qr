// @vitest-environment jsdom

import { act } from "react"
import type { ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const qrDownloadSpy = vi.fn()
const dashboardRasterExportSpy = vi.fn<(options: unknown) => Promise<void>>(
  () => Promise.resolve(),
)
const measureDashboardRasterExportSpy = vi.fn<
  (options: unknown) => Promise<{
    blobSizeBytes: number
    extension: "png" | "jpeg" | "webp"
    height: number
    qualityPercent: number
    width: number
  }>
>(() =>
  Promise.resolve({
    blobSizeBytes: 182000,
    extension: "png",
    height: 1280,
    qualityPercent: 100,
    width: 1280,
  }),
)

vi.mock("qr-code-styling", () => ({
  default: class MockQRCodeStyling {
    append() {}
    update() {}
    applyExtension() {}
    async download(downloadOptions?: unknown) {
      qrDownloadSpy(downloadOptions)
    }
  },
}))

vi.mock("@/components/qr/dashboard-raster-export", () => ({
  downloadDashboardRasterExport: (options: unknown) =>
    dashboardRasterExportSpy(options),
  formatDashboardExportFileSize: (bytes: number) => `${bytes} B`,
  isRasterExportExtension: (extension: string) => extension !== "svg",
  measureDashboardRasterExport: (options: unknown) =>
    measureDashboardRasterExportSpy(options),
}))

vi.mock("@/components/ui/slider", () => ({
  Slider: ({
    "aria-label": ariaLabel,
    disabled,
    max,
    min,
    onValueChange,
    step,
    value,
  }: {
    "aria-label"?: string
    disabled?: boolean
    max?: number
    min?: number
    onValueChange?: (value: number[]) => void
    step?: number
    value?: number[]
  }) => (
    <input
      aria-label={ariaLabel}
      disabled={disabled}
      max={max}
      min={min}
      step={step}
      type="range"
      value={value?.[0] ?? min ?? 0}
      onChange={(event) => {
        onValueChange?.([Number(event.currentTarget.value)])
      }}
    />
  ),
}))

vi.mock("@/components/qr/qr-section-rail", () => ({
  QrSectionRail: () => <div data-testid="section-rail" />,
}))

vi.mock("@/components/qr/qr-control-sections", () => ({
  QrControlSections: () => <div data-testid="control-sections" />,
}))

vi.mock("@/components/qr/dashboard-edit-controls", () => ({
  DashboardEditControls: () => <div data-testid="dashboard-edit-controls" />,
}))

vi.mock("@/components/qr/dashboard-compose-surface", () => ({
  DashboardComposeSurface: () => <div data-testid="dashboard-compose-surface" />,
}))

vi.mock("@/components/mode-toggle", () => ({
  ModeToggle: () => <div data-slot="mode-toggle" />,
}))

vi.mock("@/components/qr/dashboard-qr-svg", () => ({
  buildDashboardQrNodePayload: vi.fn(async () => ({
    markup: "<svg />",
    naturalHeight: 320,
    naturalWidth: 320,
  })),
}))

vi.mock("@/components/qr/qr-quality-decode", () => ({
  decodeDashboardQrScene: vi.fn(async () => ({
    kind: "unverified",
    reason: "stub",
  })),
}))

vi.mock("@/components/qr/qr-quality", () => ({
  analyzeQrQuality: vi.fn(() => ({})),
  applyQrQualitySuggestionPath: vi.fn((state, scene) => ({ scene, state })),
  mergeQrQualityReportWithDecode: vi.fn(() => ({
    blockingIssueCount: 0,
    decode: null,
    issues: [],
    summary: "stub",
    warningIssueCount: 0,
  })),
}))

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => children,
}))

import { QrStudio } from "@/components/qr/qr-studio"

describe("QrStudio dashboard download controls", () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(async () => {
    vi.useFakeTimers()
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    qrDownloadSpy.mockClear()
    dashboardRasterExportSpy.mockClear()
    measureDashboardRasterExportSpy.mockClear()

    await act(async () => {
      root.render(<QrStudio variant="dashboard" />)
    })
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    vi.useRealTimers()
    container.remove()
  })

  it("renders format selection with a single dashboard export action", () => {
    expect(container.textContent).toContain("Export format")
    expect(container.textContent).toContain("SVG")
    expect(container.textContent).toContain("PNG")
    expect(container.textContent).toContain("JPEG")
    expect(container.textContent).toContain("WEBP")
    expect(container.textContent).toContain("Download SVG")
    expect(container.textContent).not.toContain("Raster quality")
  })

  it("shows raster controls and a measured size preview after selecting a raster format", async () => {
    const pngOption = getButtonByExactText(container, "PNG")

    await act(async () => {
      pngOption.click()
    })

    expect(qrDownloadSpy).not.toHaveBeenCalled()
    expect(dashboardRasterExportSpy).not.toHaveBeenCalled()
    expect(container.textContent).toContain("Raster quality")
    expect(container.textContent).toContain("Calculating size…")

    await act(async () => {
      vi.advanceTimersByTime(250)
      await flushPromises()
    })

    expect(measureDashboardRasterExportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: "png",
        qualityPercent: 100,
        state: expect.objectContaining({
          rasterExportQualityPercent: 100,
        }),
      }),
    )
    expect(container.textContent).toContain("182000 B")
    expect(container.textContent).toContain("1280 × 1280")
  })

  it("downloads the selected raster format only when the submit button is pressed", async () => {
    const jpegOption = getButtonByExactText(container, "JPEG")

    await act(async () => {
      jpegOption.click()
    })
    await act(async () => {
      vi.advanceTimersByTime(250)
      await flushPromises()
    })

    const slider = getRangeByLabel(container, "Raster quality")

    await act(async () => {
      setRangeValue(slider, "88")
    })
    await act(async () => {
      vi.advanceTimersByTime(250)
      await flushPromises()
    })

    expect(dashboardRasterExportSpy).not.toHaveBeenCalled()

    await act(async () => {
      getButtonByExactText(container, "Download JPEG").click()
    })

    expect(dashboardRasterExportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: "jpeg",
        name: "new-qr-studio",
        qualityPercent: 88,
        state: expect.objectContaining({
          rasterExportQualityPercent: 88,
        }),
      }),
    )
  })

  it("keeps svg downloads on the upstream path", async () => {
    await act(async () => {
      getButtonByExactText(container, "Download SVG").click()
    })

    expect(qrDownloadSpy).toHaveBeenCalledWith({
      extension: "svg",
      name: "new-qr-studio",
    })
    expect(dashboardRasterExportSpy).not.toHaveBeenCalled()
  })

  it("discards stale measured size results when the user changes formats quickly", async () => {
    const firstMeasurement = createDeferred<{
      blobSizeBytes: number
      extension: "png" | "jpeg" | "webp"
      height: number
      qualityPercent: number
      width: number
    }>()
    const secondMeasurement = createDeferred<{
      blobSizeBytes: number
      extension: "png" | "jpeg" | "webp"
      height: number
      qualityPercent: number
      width: number
    }>()

    measureDashboardRasterExportSpy
      .mockImplementationOnce(() => firstMeasurement.promise)
      .mockImplementationOnce(() => secondMeasurement.promise)

    await act(async () => {
      getButtonByExactText(container, "PNG").click()
    })
    await act(async () => {
      vi.advanceTimersByTime(250)
      await flushPromises()
    })

    await act(async () => {
      getButtonByExactText(container, "JPEG").click()
    })
    await act(async () => {
      vi.advanceTimersByTime(250)
      await flushPromises()
    })

    await act(async () => {
      secondMeasurement.resolve({
        blobSizeBytes: 2200,
        extension: "jpeg",
        height: 1024,
        qualityPercent: 100,
        width: 1024,
      })
      await flushPromises()
    })

    expect(container.textContent).toContain("2200 B")
    expect(container.textContent).toContain("1024 × 1024")

    await act(async () => {
      firstMeasurement.resolve({
        blobSizeBytes: 999,
        extension: "png",
        height: 640,
        qualityPercent: 100,
        width: 640,
      })
      await flushPromises()
    })

    expect(container.textContent).toContain("2200 B")
    expect(container.textContent).not.toContain("999 B")
  })
})

function createDeferred<T>() {
  let resolve!: (value: T) => void

  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return {
    promise,
    resolve,
  }
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

function getButtonByExactText(container: HTMLElement, label: string) {
  const match = Array.from(container.querySelectorAll("button")).find(
    (button) => button.textContent?.trim() === label,
  )

  if (!match) {
    throw new Error(`Unable to find button with exact text: ${label}`)
  }

  return match
}

function getRangeByLabel(container: HTMLElement, label: string) {
  const match = container.querySelector<HTMLInputElement>(
    `input[type="range"][aria-label="${label}"]`,
  )

  if (!match) {
    throw new Error(`Unable to find range input with label: ${label}`)
  }

  return match
}

function setRangeValue(element: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )

  descriptor?.set?.call(element, value)
  element.dispatchEvent(new Event("input", { bubbles: true }))
}
