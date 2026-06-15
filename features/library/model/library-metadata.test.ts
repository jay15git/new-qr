import { describe, expect, it } from "vitest"

import {
  buildDesignDestinationPreview,
  buildLibraryQrSummaries,
  buildQrDestinationPreview,
  dedupeContentTags,
} from "@/features/library/model/library-metadata"
import { createDefaultDraftingWorkspaceDocument } from "@/features/workspace/model/document"
import { DASHBOARD_QR_NODE_ID } from "@/features/qr-code/rendering/compose-scene"

describe("library-metadata", () => {
  it("builds wifi destination previews without passwords", () => {
    expect(
      buildQrDestinationPreview("wifi", {
        ssid: "LaunchGuest",
        password: "secret",
      }),
    ).toBe("LaunchGuest")
  })

  it("builds summaries and tags from a multi-qr document", () => {
    const document = createDefaultDraftingWorkspaceDocument()
    document.qrOrder = [DASHBOARD_QR_NODE_ID, "qr-code-extra"]
    document.qrStateByNodeId["qr-code-extra"] = {
      ...document.qrStateByNodeId[DASHBOARD_QR_NODE_ID]!,
      data: "https://example.com/rsvp",
    }
    document.contentTypeByNodeId = {
      [DASHBOARD_QR_NODE_ID]: "wifi",
      "qr-code-extra": "link",
    }
    document.contentValuesByType = {
      wifi: {
        ssid: "LaunchGuest",
        password: "secret",
        encryption: "WPA",
        hidden: false,
      },
      link: {
        url: "https://events.example.com/rsvp",
      },
    }

    const summaries = buildLibraryQrSummaries(document)
    expect(summaries).toHaveLength(2)
    expect(dedupeContentTags(summaries)).toEqual(["wifi", "link"])
    expect(buildDesignDestinationPreview(summaries)).toBe("LaunchGuest · +1 more")
  })
})
