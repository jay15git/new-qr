import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

let capturedDirectionAwareTabsProps: Record<string, unknown> | null = null

vi.mock("@/components/ui/direction-aware-tabs", () => ({
  DirectionAwareTabs: (props: Record<string, unknown>) => {
    capturedDirectionAwareTabsProps = props

    return <div data-testid="direction-aware-tabs" />
  },
}))

import { QrControlSections } from "@/components/qr/qr-control-sections"
import { createDefaultQrStudioState } from "@/components/qr/qr-studio-state"

const baseProps = {
  backgroundSourceMode: "none" as const,
  logoSourceMode: "none" as const,
  onBackgroundModeChange: vi.fn(),
  onBackgroundUploadError: vi.fn(),
  onBackgroundUploadSuccess: vi.fn(),
  onLogoModeChange: vi.fn(),
  onLogoUploadError: vi.fn(),
  onLogoUploadSuccess: vi.fn(),
  setState: vi.fn(),
  state: createDefaultQrStudioState(),
}

type LogoTabConfig = {
  id: string
  content?: React.ReactNode
}

function getCapturedLogoTabs() {
  return (capturedDirectionAwareTabsProps?.tabs as LogoTabConfig[] | undefined) ?? []
}

function getTabMarkup(tabId: string) {
  const tab = getCapturedLogoTabs().find((entry) => entry.id === tabId)

  return renderToStaticMarkup(<>{tab?.content ?? null}</>)
}

describe("QrControlSections dashboard logo tabs", () => {
  it("passes brand icons, colors, upload, and size tabs in order", () => {
    renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="logo" logoSourceMode="upload" />,
    )

    expect(capturedDirectionAwareTabsProps).toMatchObject({
      activeTab: "upload",
      tabListLabel: "Logo settings groups",
    })
    expect(getCapturedLogoTabs().map((tab) => tab.id)).toEqual([
      "brand-icons",
      "colors",
      "upload",
      "size",
    ])
  })

  it("keeps brand icons as the default active dashboard tab for preset logos", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "preset",
      presetId: "whatsapp" as never,
      presetColor: "#111827",
      value: "data:image/svg+xml,%3Csvg%20/%3E",
    }

    renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="logo"
        logoSourceMode="preset"
        state={state}
      />,
    )

    expect(capturedDirectionAwareTabsProps).toMatchObject({
      activeTab: "brand-icons",
    })
  })

  it("renders solid and gradient color treatments in the colors tab for preset logos", () => {
    const state = createDefaultQrStudioState()
    state.logo = {
      source: "preset",
      presetId: "github" as never,
      presetColor: "#111827",
      value: "data:image/svg+xml,%3Csvg%20/%3E",
    }

    renderToStaticMarkup(
      <QrControlSections
        {...baseProps}
        activeSection="logo"
        logoSourceMode="preset"
        state={state}
      />,
    )

    const brandIconsMarkup = getTabMarkup("brand-icons")
    const colorsMarkup = getTabMarkup("colors")

    expect(brandIconsMarkup).toContain("Search brand icons")
    expect(brandIconsMarkup).not.toContain("Logo icon color")
    expect(colorsMarkup).toContain(">Solid<")
    expect(colorsMarkup).toContain(">Gradient<")
    expect(colorsMarkup).toMatch(/data-item-id="solid"[^>]*data-state="open"/)
    expect(colorsMarkup).toMatch(/data-item-id="gradient"[^>]*data-state="closed"/)
    expect(colorsMarkup).toContain("Logo icon color")
    expect(colorsMarkup).toContain('data-slot="color-picker"')
    expect(colorsMarkup).not.toContain("Logo icon gradient")
  })

  it("renders helper copy instead of the color picker when no preset logo is selected", () => {
    renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="logo" logoSourceMode="upload" />,
    )

    const colorsMarkup = getTabMarkup("colors")

    expect(colorsMarkup).toContain("Icon color applies only to built-in brand icons.")
    expect(colorsMarkup).toContain("Choose a brand icon in the Brand Icons tab to edit its color.")
    expect(colorsMarkup).not.toContain('data-slot="color-picker"')
  })

  it("renders the size and logo placement controls in the size tab", () => {
    renderToStaticMarkup(
      <QrControlSections {...baseProps} activeSection="logo" logoSourceMode="upload" />,
    )

    const sizeMarkup = getTabMarkup("size")
    const uploadMarkup = getTabMarkup("upload")

    expect(sizeMarkup).toContain("Logo size")
    expect(sizeMarkup).toContain('data-slot="logo-size-slider"')
    expect(sizeMarkup).toContain("Logo margin")
    expect(sizeMarkup).toContain('data-slot="logo-margin-slider"')
    expect(sizeMarkup).toContain("Hide background dots")
    expect(sizeMarkup).toContain("Save embedded image as blob")
    expect(uploadMarkup).not.toContain('data-slot="logo-size-slider"')
    expect(uploadMarkup).not.toContain('data-slot="logo-margin-slider"')
    expect(uploadMarkup).not.toContain("Hide background dots")
    expect(uploadMarkup).not.toContain("Save embedded image as blob")
  })
})
