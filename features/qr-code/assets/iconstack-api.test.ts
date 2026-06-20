import { afterEach, describe, expect, it, vi } from "vitest"

import {
  fetchIconSvg,
  ICONSTACK_API_BASE,
  parseIconstackResultIconId,
  parseIconstackSelectionId,
  searchIcons,
  toIconstackSelectionId,
} from "@/features/qr-code/assets/iconstack-api"

describe("iconstack-api", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("encodes and decodes iconstack selection ids", () => {
    const result = {
      id: "lucide-user",
      library: "lucide",
    }

    expect(toIconstackSelectionId(result)).toBe("iconstack:lucide:user")
    expect(parseIconstackSelectionId("iconstack:lucide:user")).toEqual({
      library: "lucide",
      iconId: "user",
    })
    expect(parseIconstackSelectionId("whatsapp")).toBeNull()
  })

  it("parses icon ids from search results", () => {
    expect(
      parseIconstackResultIconId({
        id: "tabler-heart",
        library: "tabler",
      }),
    ).toBe("heart")
  })

  it("searches icons with optional library filter", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          query: "heart",
          total: 1,
          limit: 24,
          offset: 0,
          results: [
            {
              id: "lucide-heart",
              name: "Heart",
              library: "lucide",
              libraryName: "Lucide",
              category: "shapes",
              tags: ["heart"],
              style: "outline",
              url: "https://iconstack.io/icon/lucide/heart",
            },
          ],
        }),
        { status: 200 },
      ),
    )

    const response = await searchIcons({ q: "heart", library: "lucide", limit: 24 })

    expect(fetchMock).toHaveBeenCalledWith(
      `${ICONSTACK_API_BASE}/icon-search?q=heart&limit=24&offset=0&library=lucide`,
    )
    expect(response.results).toHaveLength(1)
    expect(response.results[0]?.name).toBe("Heart")
  })

  it("fetches svg markup for a library icon", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          library: "lucide",
          id: "heart",
          fullId: "lucide-heart",
          svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
          url: "https://iconstack.io/icon/lucide/heart",
        }),
        { status: 200 },
      ),
    )

    const response = await fetchIconSvg({ library: "lucide", id: "heart" })

    expect(fetchMock).toHaveBeenCalledWith(
      `${ICONSTACK_API_BASE}/icon-svg?library=lucide&id=heart`,
    )
    expect(response.svg).toContain("<svg")
  })
})
