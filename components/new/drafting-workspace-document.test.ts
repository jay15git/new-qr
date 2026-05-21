import { describe, expect, it } from "vitest"

import { DASHBOARD_QR_NODE_ID } from "@/components/qr/dashboard-compose-scene"
import {
  cloneDraftingWorkspaceDocument,
  createDefaultDraftingWorkspaceDocument,
  parseDraftingWorkspaceDocument,
  serializeDraftingWorkspaceDocument,
} from "@/components/new/drafting-workspace-document"

describe("drafting workspace document", () => {
  it("round-trips a versioned drafting workspace document", () => {
    const document = createDefaultDraftingWorkspaceDocument()
    document.qrOrder = [DASHBOARD_QR_NODE_ID, "qr-code-extra"]
    document.activeQrNodeId = "qr-code-extra"
    document.qrStateByNodeId["qr-code-extra"] = {
      ...cloneDraftingWorkspaceDocument(document).qrStateByNodeId[DASHBOARD_QR_NODE_ID],
      data: "https://example.com/extra",
    }
    document.cardStateByNodeId["qr-code-extra"] =
      cloneDraftingWorkspaceDocument(document).cardStateByNodeId[DASHBOARD_QR_NODE_ID]
    document.selectedContentType = "wifi"
    document.contentValuesByType = {
      wifi: {
        encryption: "WPA",
        hidden: true,
        password: "secret",
        ssid: "Studio",
      },
    }

    expect(parseDraftingWorkspaceDocument(serializeDraftingWorkspaceDocument(document))).toEqual(
      document,
    )
  })

  it("falls back to defaults for invalid documents", () => {
    expect(parseDraftingWorkspaceDocument(null)).toEqual(createDefaultDraftingWorkspaceDocument())
    expect(parseDraftingWorkspaceDocument({ version: 999, qrOrder: [] })).toEqual(
      createDefaultDraftingWorkspaceDocument(),
    )
  })

  it("creates one default pane when saved state is missing pane data", () => {
    const parsed = parseDraftingWorkspaceDocument({
      activeQrNodeId: "missing-pane",
      cardStateByNodeId: {},
      contentValuesByType: {},
      qrOrder: [],
      qrStateByNodeId: {},
      selectedContentType: "auto",
      version: 1,
    })

    expect(parsed.qrOrder).toEqual([DASHBOARD_QR_NODE_ID])
    expect(parsed.activeQrNodeId).toBe(DASHBOARD_QR_NODE_ID)
    expect(parsed.qrStateByNodeId[DASHBOARD_QR_NODE_ID]?.data).toBe(
      "https://new-qr-studio.local/launch",
    )
    expect(parsed.cardStateByNodeId[DASHBOARD_QR_NODE_ID]?.enabled).toBe(true)
  })
})
