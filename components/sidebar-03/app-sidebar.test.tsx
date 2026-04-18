import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { getQrEditorSectionChangeDirection } from "@/components/qr/qr-sections"

let capturedDirectionAwareTabsProps: Record<string, unknown> | null = null
type TabLabelElement = ReactElement<{
  children: [
    ReactElement<{ className?: string; children: ReactElement }>,
    ReactElement<{ className?: string }>
  ]
  className?: string
}>

vi.mock("@/components/ui/direction-aware-tabs", () => ({
  DirectionAwareTabs: (props: Record<string, unknown>) => {
    capturedDirectionAwareTabsProps = props

    return <div data-testid="direction-aware-tabs" />
  },
}))

import { QrSectionRail } from "@/components/qr/qr-section-rail"

describe("QrSectionRail", () => {
  it("renders the dashboard section rail and passes the ordered sections into direction-aware tabs", () => {
    const markup = renderToStaticMarkup(
      <QrSectionRail activeSection="content" onSectionChange={vi.fn()} />,
    )

    expect(markup).toContain('data-slot="dashboard-section-rail"')
    expect(markup).toContain('aria-label="QR editor sections"')
    expect(capturedDirectionAwareTabsProps).toMatchObject({
      activeTab: "content",
      orientation: "vertical",
      showContent: false,
    })
    expect(
      (capturedDirectionAwareTabsProps?.tabs as Array<{ id: string }>).map(
        (tab) => tab.id,
      ),
    ).toEqual([
      "content",
      "style",
      "corner-square",
      "corner-dot",
      "background",
      "logo",
      "encoding",
    ])

    const firstTabLabel = (
      capturedDirectionAwareTabsProps?.tabs as Array<{ label: TabLabelElement }>
    )[0]?.label

    expect(firstTabLabel.props.className).toContain("flex-col")
    expect(firstTabLabel.props.className).toContain("justify-center")
    expect(firstTabLabel.props.children[0].props.className).toContain("section-icon")
    expect(firstTabLabel.props.children[0].props.className).toContain("rounded-[1rem]")
    expect(firstTabLabel.props.children[0].props.className).toContain("min-w-9")
    expect(firstTabLabel.props.children[1].props.className).toContain("text-center")
    expect(firstTabLabel.props.children[1].props.className).toContain("section-label")
  })

  it("maps tab selection back to the requested qr editor section", () => {
    const onSectionChange = vi.fn()

    renderToStaticMarkup(
      <QrSectionRail activeSection="corner-square" onSectionChange={onSectionChange} />,
    )

    expect(capturedDirectionAwareTabsProps).not.toBeNull()

    ;(
      capturedDirectionAwareTabsProps?.onTabChange as ((tabId: string) => void) | undefined
    )?.("logo")

    expect(onSectionChange).toHaveBeenCalledWith("logo")
  })
})

describe("getQrEditorSectionChangeDirection", () => {
  it("returns forward motion when moving to a later section", () => {
    expect(getQrEditorSectionChangeDirection("content", "background")).toBe(1)
  })

  it("returns backward motion when moving to an earlier section", () => {
    expect(getQrEditorSectionChangeDirection("encoding", "style")).toBe(-1)
  })
})
