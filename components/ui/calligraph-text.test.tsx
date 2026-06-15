// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

import { CalligraphText } from "@/components/ui/calligraph-text"
import { renderWithJsdomRoot } from "@/test-utils/jsdom-react-root"

beforeEach(() => {
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
  vi.unstubAllGlobals()
})

describe("CalligraphText", () => {
  it("renders updated label text when children change", () => {
    const { container, rerender } = renderWithJsdomRoot(<CalligraphText>Ctrl</CalligraphText>)

    expect(container.textContent).toContain("Ctrl")

    rerender(<CalligraphText>⌘</CalligraphText>)

    expect(container.textContent).toContain("⌘")
  })
})
