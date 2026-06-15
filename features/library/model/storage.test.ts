import { describe, expect, it } from "vitest"

import {
  createEmptyLibraryIndex,
  getDesktopLibraryUrl,
  parseLibraryIndex,
} from "@/features/library/model/storage"

describe("library storage", () => {
  it("creates an empty v1 index", () => {
    const index = createEmptyLibraryIndex()

    expect(index.version).toBe(1)
    expect(index.designs).toEqual([])
    expect(index.collections).toEqual([])
  })

  it("parses a valid library index", () => {
    const index = createEmptyLibraryIndex()
    expect(parseLibraryIndex(index)).toEqual(index)
    expect(parseLibraryIndex({ version: 2 })).toBeNull()
  })

  it("migrates legacy library designs", () => {
    const parsed = parseLibraryIndex({
      version: 1,
      designs: [
        {
          id: "qr-legacy",
          title: "Legacy",
          inputType: "wifi",
          updatedAt: 100,
          collectionIds: [],
          thumbnailHue: 120,
        },
      ],
      collections: [],
      updatedAt: 100,
    })

    expect(parsed?.designs[0]).toMatchObject({
      id: "qr-legacy",
      contentTags: ["wifi"],
      qrCount: 1,
      createdAt: 100,
      destinationPreview: "",
    })
  })

  it("builds desktop open urls", () => {
    expect(getDesktopLibraryUrl("qr-1")).toBe("/desktop?id=qr-1")
  })
})
