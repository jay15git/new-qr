// @vitest-environment jsdom

import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { QrQualityPanel } from "@/components/qr/qr-quality-panel"
import type {
  QrQualityReport,
  QrQualitySuggestionPath,
} from "@/components/qr/qr-quality"

const cleanupCallbacks: Array<() => void> = []

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
})

afterEach(() => {
  for (const cleanup of cleanupCallbacks.splice(0)) {
    cleanup()
  }

  vi.unstubAllGlobals()
  document.body.innerHTML = ""
})

describe("QrQualityPanel", () => {
  it("renders a single recommended badge for multi-path issues", () => {
    const panel = renderPanel({
      report: createQualityReport({
        issues: [
          createContrastIssue([
            createSuggestionPath({
              id: "dots-target-only",
              impact: "target-only",
              recommended: true,
              title: "Change dots color",
            }),
            createSuggestionPath({
              id: "dots-qr-background",
              impact: "qr-background",
              title: "Change QR background",
            }),
          ]),
        ],
        status: "risky",
      }),
    })

    expect(panel.container.textContent).toContain("Change dots color")
    expect(panel.container.textContent).toContain("Change QR background")
    expect(panel.container.textContent?.match(/Recommended/g)?.length ?? 0).toBe(1)
  })

  it("invokes the callback with the selected suggestion path", () => {
    const recommendedPath = createSuggestionPath({
      id: "dots-target-only",
      impact: "target-only",
      recommended: true,
      title: "Change dots color",
    })
    const alternatePath = createSuggestionPath({
      id: "dots-qr-background",
      impact: "qr-background",
      title: "Change QR background",
    })
    const onApplySuggestionPath = vi.fn()
    const panel = renderPanel({
      onApplySuggestionPath,
      report: createQualityReport({
        issues: [createContrastIssue([recommendedPath, alternatePath])],
        status: "risky",
      }),
    })

    const button = getRequiredElement(
      panel.container,
      'button[aria-label="Apply Change QR background"]',
    )

    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onApplySuggestionPath).toHaveBeenCalledTimes(1)
    expect(onApplySuggestionPath).toHaveBeenCalledWith(alternatePath)
  })
})

function renderPanel({
  onApplySuggestionPath = vi.fn(),
  report,
}: {
  onApplySuggestionPath?: (path: QrQualitySuggestionPath) => void
  report: QrQualityReport
}) {
  const container = document.createElement("div")
  const root = createRoot(container)

  act(() => {
    root.render(
      <QrQualityPanel
        onApplySuggestionPath={onApplySuggestionPath}
        report={report}
      />,
    )
  })

  cleanupCallbacks.push(() => {
    act(() => {
      root.unmount()
    })
  })

  document.body.appendChild(container)

  return { container }
}

function createQualityReport(overrides: Partial<QrQualityReport>): QrQualityReport {
  return {
    blockingIssueCount: 0,
    decode: {
      data: "https://new-qr-studio.local/launch",
      kind: "success",
      scale: 2,
    },
    issues: [],
    status: "readable",
    summary: "The composed dashboard scene decoded successfully at 2x.",
    warningIssueCount: 0,
    ...overrides,
  }
}

function createContrastIssue(paths: QrQualitySuggestionPath[]) {
  return {
    detail: "The weakest sampled contrast is 2.1:1. Aim for at least 4.5:1.",
    id: "dots-contrast",
    paths,
    scope: "Dots",
    severity: "error" as const,
    title: "Body dots do not contrast enough against the QR background.",
  }
}

function createSuggestionPath({
  id,
  impact,
  recommended = false,
  title,
}: {
  id: string
  impact: QrQualitySuggestionPath["impact"]
  recommended?: boolean
  title: string
}): QrQualitySuggestionPath {
  return {
    actions: [
      {
        target: "dots",
        type: "set-solid-color",
        value: "#111827",
      },
    ],
    detail: "Use #111827 on the dots to restore separation from the background.",
    id,
    impact,
    recommended,
    title,
  }
}

function getRequiredElement(parent: ParentNode, selector: string) {
  const element = parent.querySelector(selector)

  expect(element).not.toBeNull()

  return element as HTMLElement
}
