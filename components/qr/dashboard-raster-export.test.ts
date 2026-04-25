// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const qrCodeConstructorSpy = vi.fn()

vi.mock("qr-code-styling", () => ({
  default: class MockQRCodeStyling {
    constructor(options: { height?: number; width?: number }) {
      qrCodeConstructorSpy(options)
    }

    applyExtension() {}

    async getRawData() {
      return new Blob(
        [
          '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" /></svg>',
        ],
        {
          type: "image/svg+xml",
        },
      )
    }
  },
}))

import {
  downloadDashboardRasterExport,
  formatDashboardExportFileSize,
  getDashboardRasterExportDimensions,
  getLossyRasterEncoderQuality,
  isRasterExportExtension,
  measureDashboardRasterExport,
} from "@/components/qr/dashboard-raster-export"
import {
  createDefaultQrStudioState,
  setSquareQrSize,
} from "@/components/qr/qr-studio-state"

const originalCreateObjectUrl = URL.createObjectURL
const originalRevokeObjectUrl = URL.revokeObjectURL
const originalImage = globalThis.Image

describe("dashboard raster export helper", () => {
  let anchorClickSpy: ReturnType<typeof vi.fn>
  let canvasContext: {
    clearRect: ReturnType<typeof vi.fn>
    drawImage: ReturnType<typeof vi.fn>
  }
  let canvasToBlobSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    let objectUrlCallCount = 0

    qrCodeConstructorSpy.mockClear()
    anchorClickSpy = vi.fn()
    canvasContext = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    }
    canvasToBlobSpy = vi.fn((callback: (blob: Blob | null) => void) => {
      callback(
        new Blob(["raster"], {
          type: "image/png",
        }),
      )
    })

    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return {
          getContext: vi.fn(() => canvasContext),
          height: 0,
          toBlob: canvasToBlobSpy,
          width: 0,
        } as unknown as HTMLCanvasElement
      }

      if (tagName === "a") {
        return {
          click: anchorClickSpy,
          download: "",
          href: "",
        } as unknown as HTMLAnchorElement
      }

      return document.createElementNS("http://www.w3.org/1999/xhtml", tagName)
    })

    vi.spyOn(document.body, "appendChild").mockImplementation(
      (node: Node) => node,
    )
    vi.spyOn(document.body, "removeChild").mockImplementation((node: Node) => node)

    URL.createObjectURL = vi.fn(() => `blob:mock-${++objectUrlCallCount}`)
    URL.revokeObjectURL = vi.fn()

    class MockImage {
      onerror: null | (() => void) = null
      onload: null | (() => void) = null

      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }

    globalThis.Image = MockImage as typeof Image
  })

  afterEach(() => {
    vi.restoreAllMocks()
    URL.createObjectURL = originalCreateObjectUrl
    URL.revokeObjectURL = originalRevokeObjectUrl
    globalThis.Image = originalImage
  })

  it("treats svg as the only non-raster extension", () => {
    expect(isRasterExportExtension("svg")).toBe(false)
    expect(isRasterExportExtension("png")).toBe(true)
  })

  it("uses scale-based sizing for png exports", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 320)

    await downloadDashboardRasterExport({
      extension: "png",
      name: "poster",
      qualityPercent: 50,
      state,
    })

    expect(qrCodeConstructorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        height: 640,
        type: "svg",
        width: 640,
      }),
    )
    expect(canvasToBlobSpy).toHaveBeenCalledWith(expect.any(Function), "image/png", undefined)
    expect(anchorClickSpy).toHaveBeenCalledTimes(1)
  })

  it("uses fixed target sizing when requested", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 320)

    await downloadDashboardRasterExport({
      extension: "png",
      name: "poster",
      qualityPercent: 100,
      state,
      targetSizePx: 1024,
    })

    expect(qrCodeConstructorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        height: 1024,
        type: "svg",
        width: 1024,
      }),
    )
    expect(getDashboardRasterExportDimensions(state, 100, 9000)).toEqual({
      height: 4096,
      requestedScale: 4096 / 320,
      scale: 4096 / 320,
      width: 4096,
    })
  })

  it("passes lossy encoder quality for jpeg and webp exports", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 320)

    await downloadDashboardRasterExport({
      extension: "jpeg",
      name: "poster",
      qualityPercent: 75,
      state,
    })
    await downloadDashboardRasterExport({
      extension: "webp",
      name: "poster",
      qualityPercent: 25,
      state,
    })

    expect(canvasToBlobSpy).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      "image/jpeg",
      0.75,
    )
    expect(canvasToBlobSpy).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      "image/webp",
      0.25,
    )
  })

  it("returns measured blob size metadata for raster preview", async () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 320)

    const result = await measureDashboardRasterExport({
      extension: "webp",
      qualityPercent: 75,
      state,
    })

    expect(result).toEqual({
      blobSizeBytes: 6,
      encoderQuality: 0.75,
      extension: "webp",
      height: 960,
      qualityPercent: 75,
      width: 960,
    })
  })

  it("caps export dimensions at the configured maximum", () => {
    const state = setSquareQrSize(createDefaultQrStudioState(), 1200)

    expect(getDashboardRasterExportDimensions(state, 100)).toEqual({
      height: 4096,
      requestedScale: 4,
      scale: 4096 / 1200,
      width: 4096,
    })
  })

  it("exposes the lossy encoder quality mapping", () => {
    expect(getLossyRasterEncoderQuality(10)).toBe(0.25)
    expect(getLossyRasterEncoderQuality(75)).toBe(0.75)
    expect(getLossyRasterEncoderQuality(200)).toBe(1)
  })

  it("formats dashboard export sizes for display", () => {
    expect(formatDashboardExportFileSize(0)).toBe("0 B")
    expect(formatDashboardExportFileSize(1536)).toBe("1.50 KB")
    expect(formatDashboardExportFileSize(1_250_000)).toBe("1.19 MB")
  })
})
