import { describe, expect, it } from "vitest"

import { getQrLayout } from "./qr-layout-engine"

describe("getQrLayout", () => {
  it("throws for count below 1", () => {
    expect(() => getQrLayout(0, false)).toThrow("QR count must be between 1 and 10")
  })

  it("throws for count above 10", () => {
    expect(() => getQrLayout(11, false)).toThrow("QR count must be between 1 and 10")
  })

  describe("landscape", () => {
    it.each([
      [1, 1, 1, [1]],
      [2, 2, 1, [2]],
      [3, 3, 1, [3]],
      [4, 2, 2, [2, 2]],
      [5, 3, 2, [3, 2]],
      [6, 3, 2, [3, 3]],
      [7, 4, 2, [4, 3]],
      [8, 4, 2, [4, 4]],
      [9, 5, 2, [5, 4]],
      [10, 5, 2, [5, 5]],
    ])(
      "count=%i -> cols=%i, rows=%i, groups=%s",
      (count, expectedCols, expectedRows, expectedGroups) => {
        const result = getQrLayout(count, false)
        expect(result.cols).toBe(expectedCols)
        expect(result.rows).toBe(expectedRows)
        expect(result.groups).toEqual(expectedGroups)
        expect(result.direction).toBe("rows")
      },
    )
  })

  describe("portrait", () => {
    it.each([
      [1, 1, 1, [1]],
      [2, 1, 2, [2]],
      [3, 1, 3, [3]],
      [4, 2, 2, [2, 2]],
      [5, 2, 3, [3, 2]],
      [6, 2, 3, [3, 3]],
      [7, 2, 4, [4, 3]],
      [8, 2, 4, [4, 4]],
      [9, 2, 5, [5, 4]],
      [10, 2, 5, [5, 5]],
    ])(
      "count=%i -> cols=%i, rows=%i, groups=%s",
      (count, expectedCols, expectedRows, expectedGroups) => {
        const result = getQrLayout(count, true)
        expect(result.cols).toBe(expectedCols)
        expect(result.rows).toBe(expectedRows)
        expect(result.groups).toEqual(expectedGroups)
        expect(result.direction).toBe("columns")
      },
    )
  })

  describe("group coverage", () => {
    it("every layout accounts for every pane exactly once", () => {
      for (let count = 1; count <= 10; count++) {
        for (const isPortrait of [false, true]) {
          const { groups } = getQrLayout(count, isPortrait)
          expect(groups.reduce((total, groupCount) => total + groupCount, 0)).toBe(count)
        }
      }
    })

    it.each([5, 7, 9])("centers one-short groups for odd count %i", (count) => {
      expect(getQrLayout(count, false).groups).toEqual([
        Math.ceil(count / 2),
        Math.floor(count / 2),
      ])
      expect(getQrLayout(count, true).groups).toEqual([
        Math.ceil(count / 2),
        Math.floor(count / 2),
      ])
    })
  })
})
