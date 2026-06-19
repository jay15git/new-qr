import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  DESKTOP_INSPECTOR_INPUT_CLASS,
  DesktopInspectorNativeSelect,
  DesktopInspectorSearchInput,
  DesktopInspectorSegmentedControl,
  DesktopInspectorTextInput,
} from "@/features/desktop-shell/components/InspectorControls"

describe("desktop inspector controls", () => {
  it("renders shared input and select controls with the desktop inspector class contract", () => {
    const markup = renderToStaticMarkup(
      <div>
        <DesktopInspectorTextInput aria-label="Remote logo URL" />
        <DesktopInspectorNativeSelect
          aria-label="Logo icon category"
          options={[
            { label: "All", value: "all" },
            { label: "Social", value: "social" },
          ]}
          value="all"
          onValueChange={vi.fn()}
        />
        <DesktopInspectorSearchInput aria-label="Search logo icons" value="" onValueChange={vi.fn()} />
      </div>,
    )

    expect(markup).toContain(DESKTOP_INSPECTOR_INPUT_CLASS)
    expect(markup).toContain("desktop-inspector-input-bg")
    expect(markup).toContain('aria-label="Logo icon category"')
    expect(markup).toContain('aria-label="Search logo icons"')
  })

  it("renders segmented controls with tabs-subtle selected state", () => {
    const markup = renderToStaticMarkup(
      <DesktopInspectorSegmentedControl
        ariaLabelPrefix="Use"
        columns={2}
        items={[
          { label: "Solid", value: "solid" },
          { label: "Gradient", value: "gradient" },
        ]}
        value="solid"
        onValueChange={vi.fn()}
      />,
    )

    expect(markup).toContain('aria-selected="true"')
    expect(markup).toContain('role="tablist"')
    expect(markup).toContain('role="tab"')
    expect(markup).not.toContain('aria-pressed="true"')
  })
})
