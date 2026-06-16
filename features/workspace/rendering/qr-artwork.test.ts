// @vitest-environment jsdom

import { describe, expect, it } from "vitest"

import { toReactQrCodeProps } from "@/features/qr-code/adapters/react-qr-adapter"
import { createDefaultQrStudioState } from "@/features/qr-code/model/state"
import {
  createDraftingQrArtworkState,
  sanitizeDraftingQrArtworkMarkup,
} from "@/features/workspace/rendering/qr-artwork"

describe("drafting qr artwork helpers", () => {
  it("creates foreground-only ReactQRCode state for drafting artwork", () => {
    const state = createDefaultQrStudioState()
    state.backgroundImage = {
      source: "url",
      value: "https://example.com/background.png",
    }
    state.backgroundShapeId = "flower"
    state.backgroundShapeOptions = {
      edgeBlur: 14,
      paddingPx: 28,
      shadowColor: "#22c55e",
      shadowOffsetX: 10,
      shadowOffsetY: -8,
      shadowOpacity: 65,
      strokeColor: "#0f172a",
      strokeOpacity: 42,
      strokeWidth: 6,
      tiltX: 0,
      tiltY: 0,
    }
    state.backgroundGradient = {
      enabled: true,
      type: "linear",
      rotation: 45,
      colorStops: [
        { offset: 0, color: "#ff0000" },
        { offset: 1, color: "#0000ff" },
      ],
    }
    state.backgroundOptions.transparent = false
    state.backgroundOptions.color = "#facc15"

    const artworkState = createDraftingQrArtworkState(state)
    const props = toReactQrCodeProps(artworkState)

    expect(props.background).toBe("transparent")
    expect(artworkState.backgroundImage).toEqual({
      source: "none",
      value: undefined,
      presetId: undefined,
      presetColor: undefined,
    })
    expect(artworkState.backgroundShapeId).toBe("none")
    expect(artworkState.backgroundShapeOptions).toEqual({
      edgeBlur: 0,
      paddingPx: 0,
      shadowColor: "#111827",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 72,
      strokeColor: "#f8fafc",
      strokeOpacity: 100,
      strokeWidth: 0,
      tiltX: 0,
      tiltY: 0,
    })
    expect(artworkState.backgroundGradient.enabled).toBe(false)
    expect(artworkState.backgroundOptions.transparent).toBe(true)
  })

  it("strips qr-library-owned background artifacts from drafting artwork markup", () => {
    const markup = sanitizeDraftingQrArtworkMarkup(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
        <defs>
          <filter data-qr-layer="background-shape-blur-filter" id="background-shape-blur-filter" />
          <filter data-qr-layer="background-surface-blur-filter" id="background-surface-blur-filter" />
          <clipPath id="clip-path-background-color-0"><rect width="320" height="320" /></clipPath>
          <clipPath id="clip-path-dot-color-0"><path d="M20 20h40v40H20z" /></clipPath>
        </defs>
        <image data-qr-layer="background-image" href="https://example.com/bg.png" />
        <clipPath data-qr-layer="background-image-clip"><rect width="320" height="320" /></clipPath>
        <path data-qr-layer="background-shape-blur" d="M0 0h320v320H0z" />
        <path data-qr-layer="background-shape" d="M0 0h320v320H0z" />
        <rect data-qr-layer="background-surface-blur" width="320" height="320" />
        <rect width="320" height="320" clip-path="url('#clip-path-background-color-0')" fill="#fff" />
        <rect data-qr-layer="dot" clip-path="url('#clip-path-dot-color-0')" fill="#111" />
      </svg>`,
    )

    expect(markup).not.toContain("background-image")
    expect(markup).not.toContain("background-shape")
    expect(markup).not.toContain("background-surface")
    expect(markup).not.toContain("clip-path-background-color")
    expect(markup).toContain("clip-path-dot-color")
    expect(markup).toContain('data-qr-layer="dot"')
  })
})
