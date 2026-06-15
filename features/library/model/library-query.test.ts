import { describe, expect, it } from "vitest"

import {
  filterLibraryDesigns,
  sortLibraryDesigns,
} from "@/features/library/model/library-query"
import { MOCK_LIBRARY_DESIGNS } from "@/features/library/model/mock-library"

describe("library-query", () => {
  it("filters designs by title and type label", () => {
    const results = filterLibraryDesigns(MOCK_LIBRARY_DESIGNS, "wifi")

    expect(results).toHaveLength(2)
    expect(results.map((design) => design.title)).toEqual(
      expect.arrayContaining(["Event Kit", "Workshop Wi-Fi"]),
    )
  })

  it("filters designs by destination preview", () => {
    const results = filterLibraryDesigns(MOCK_LIBRARY_DESIGNS, "launchguest")

    expect(results).toHaveLength(1)
    expect(results[0]?.title).toBe("Event Kit")
  })

  it("sorts designs by name", () => {
    const results = sortLibraryDesigns(MOCK_LIBRARY_DESIGNS, "name")

    expect(results[0]?.title).toBe("Contact Card")
    expect(results.at(-1)?.title).toBe("YouTube Channel")
  })

  it("sorts designs by qr count", () => {
    const results = sortLibraryDesigns(MOCK_LIBRARY_DESIGNS, "qr-count")

    expect(results[0]?.title).toBe("Event Kit")
    expect(results[0]?.qrCount).toBe(3)
  })

  it("sorts designs by created date", () => {
    const oldest = sortLibraryDesigns(MOCK_LIBRARY_DESIGNS, "oldest")
    const newest = sortLibraryDesigns(MOCK_LIBRARY_DESIGNS, "newest")

    expect(oldest[0]?.createdAt).toBeLessThanOrEqual(oldest.at(-1)?.createdAt ?? 0)
    expect(newest[0]?.createdAt).toBeGreaterThanOrEqual(newest.at(-1)?.createdAt ?? 0)
  })
})
