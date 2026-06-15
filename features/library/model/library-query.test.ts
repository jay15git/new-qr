import { describe, expect, it } from "vitest"

import {
  filterLibraryDesigns,
  sortLibraryDesigns,
} from "@/features/library/model/library-query"
import { MOCK_LIBRARY_DESIGNS } from "@/features/library/model/mock-library"

describe("library-query", () => {
  it("filters designs by title and type label", () => {
    const results = filterLibraryDesigns(MOCK_LIBRARY_DESIGNS, "wifi")

    expect(results).toHaveLength(1)
    expect(results[0]?.title).toBe("Workshop Wi-Fi")
  })

  it("sorts designs by name", () => {
    const results = sortLibraryDesigns(MOCK_LIBRARY_DESIGNS, "name")

    expect(results[0]?.title).toBe("Contact Card")
    expect(results.at(-1)?.title).toBe("YouTube Channel")
  })
})
