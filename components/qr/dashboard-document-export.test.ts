// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  addDashboardComposeImageNode,
  createDashboardDocumentComposeScene,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"
import {
  downloadDashboardDocumentExport,
  measureDashboardDocumentExport,
} from "@/components/qr/dashboard-document-export"

const originalCreateObjectUrl = URL.createObjectURL
const originalRevokeObjectUrl = URL.revokeObjectURL
const originalImage = globalThis.Image

const QR_PAYLOAD = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#fff" /><path d="M20 20h40v40H20z" fill="#111" /></svg>',
  naturalHeight: 320,
  naturalWidth: 320,
}

describe("dashboard document export", () => {
  let anchorClickSpy: ReturnType<typeof vi.fn>
  let canvasContext: {
    clearRect: ReturnType<typeof vi.fn>
    drawImage: ReturnType<typeof vi.fn>
  }
  let canvasToBlobSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    let objectUrlCallCount = 0

    anchorClickSpy = vi.fn()
    canvasContext = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    }
    canvasToBlobSpy = vi.fn((callback: (blob: Blob | null) => void) => {
      callback(
        new Blob(["document"], {
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

    vi.spyOn(document.body, "appendChild").mockImplementation((node: Node) => node)
    vi.spyOn(document.body, "removeChild").mockImplementation((node: Node) => node)

    URL.createObjectURL = vi.fn(() => `blob:document-export-${++objectUrlCallCount}`)
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

  it("measures full-document raster output using the document page size", async () => {
    const scene = addDashboardComposeImageNode(
      upsertDashboardQrNode(createDashboardDocumentComposeScene(), QR_PAYLOAD),
      {
        id: "image-node",
        imageUrl: "data:image/png;base64,AAAA",
        name: "Stamp",
        naturalHeight: 400,
        naturalWidth: 400,
      },
    )

    const result = await measureDashboardDocumentExport({
      extension: "png",
      qualityPercent: 50,
      scene,
    })

    expect(result).toEqual({
      blobSizeBytes: 8,
      encoderQuality: undefined,
      extension: "png",
      height: 2112,
      qualityPercent: 50,
      width: 1632,
    })
    expect(canvasToBlobSpy).toHaveBeenCalledWith(expect.any(Function), "image/png", undefined)
  })

  it("downloads the full document as svg", async () => {
    const scene = addDashboardComposeImageNode(
      upsertDashboardQrNode(createDashboardDocumentComposeScene(), QR_PAYLOAD),
      {
        id: "image-node",
        imageUrl: "data:image/png;base64,AAAA",
        name: "Stamp",
        naturalHeight: 400,
        naturalWidth: 400,
      },
    )

    await downloadDashboardDocumentExport({
      extension: "svg",
      name: "poster-sheet",
      qualityPercent: 100,
      scene,
    })

    expect(anchorClickSpy).toHaveBeenCalledTimes(1)
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalled()
  })
})
