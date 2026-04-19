import { describe, expect, it } from "vitest"

import {
  DOT_STYLE_PREVIEW_ROWS,
  STYLE_PREVIEW_SAMPLE_DATA,
} from "@/components/qr/qr-style-preview"

describe("qr style preview helper", () => {
  it("builds a stable curated qr fragment from the sample payload", () => {
    expect(STYLE_PREVIEW_SAMPLE_DATA).toBe("https://example.com")
    expect(DOT_STYLE_PREVIEW_ROWS).toEqual([
      "1010101",
      "0000000",
      "1110111",
      "0001110",
      "1001100",
      "0111110",
      "1000001",
    ])
  })
})
