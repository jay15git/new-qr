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
      [1, 1, 1, null],
      [2, 2, 1, null],
      [3, 3, 1, null],
      [4, 2, 2, null],
      [5, 3, 2, '"a a b" "c d e"'],
      [6, 3, 2, null],
      [7, 3, 3, '"a a b" "c d e" "f g ."'],
      [8, 4, 2, null],
      [9, 3, 4, '"a a b" "a a c" "d e f" "g h i"'],
      [10, 5, 2, null],
    ])(
      "count=%i → cols=%i, rows=%i, areas=%s",
      (count, expectedCols, expectedRows, expectedAreas) => {
        const result = getQrLayout(count, false)
        expect(result.cols).toBe(expectedCols)
        expect(result.rows).toBe(expectedRows)
        expect(result.areas).toBe(expectedAreas)
      },
    )
  })

  describe("portrait", () => {
    it.each([
      [1, 1, 1, null],
      [2, 1, 2, null],
      [3, 1, 3, null],
      [4, 2, 2, null],
      [5, 2, 3, '"a b" "a c" "d e"'],
      [6, 2, 3, null],
      [7, 2, 4, '"a b" "a c" "d e" "f g"'],
      [8, 2, 4, null],
      [9, 4, 3, '"a a b c" "a a d e" "f g h i"'],
      [10, 2, 5, null],
    ])(
      "count=%i → cols=%i, rows=%i, areas=%s",
      (count, expectedCols, expectedRows, expectedAreas) => {
        const result = getQrLayout(count, true)
        expect(result.cols).toBe(expectedCols)
        expect(result.rows).toBe(expectedRows)
        expect(result.areas).toBe(expectedAreas)
      },
    )
  })

  describe("area coverage", () => {
    it("every layout has enough cells for its panes", () => {
      for (let count = 1; count <= 10; count++) {
        for (const isPortrait of [false, true]) {
          const { cols, rows, areas } = getQrLayout(count, isPortrait)
          const totalCells = cols * rows

          if (areas) {
            // Count all area names (including '.' for empty cells)
            const tokens = areas.replace(/"/g, "").split(/\s+/)
            const names = tokens.filter((n) => n !== ".")
            const uniqueNames = new Set(names)
            // Each pane gets one unique name; spanned cells appear multiple times
            expect(uniqueNames.size).toBeGreaterThanOrEqual(count)
            // Total referenced cells (including empty) should equal grid size
            expect(tokens.length).toBe(totalCells)
          } else {
            // Symmetric grid: must exactly fit
            expect(totalCells).toBe(count)
          }
        }
      }
    })
  })
})
