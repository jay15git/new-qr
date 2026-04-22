import { describe, expect, it } from "vitest"

import {
  DOT_STYLE_PREVIEW_ROWS,
  STYLE_PREVIEW_SAMPLE_DATA,
} from "@/components/qr/qr-style-preview"

describe("qr style preview helper", () => {
  it("builds a stable curated qr fragment from the sample payload", () => {
    expect(STYLE_PREVIEW_SAMPLE_DATA).toBe("https://example.com")
    expect(DOT_STYLE_PREVIEW_ROWS).toEqual([
      "010000111",
      "001110000",
      "110011100",
      "100000011",
      "010110100",
      "111110011",
      "100010101",
      "101001011",
      "100101100",
    ])
  })
})
