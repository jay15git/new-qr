import { LinkIcon, MessageSquareTextIcon } from "lucide-react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import AIInputSearch from "./ai-input-search"

describe("ai input search", () => {
  it("renders one expanded shortcut pill when shortcuts are present", () => {
    const markup = renderToStaticMarkup(
      <AIInputSearch
        shortcuts={[
          { label: "Link", icon: <LinkIcon className="h-4 w-4" /> },
          { label: "Text", icon: <MessageSquareTextIcon className="h-4 w-4" /> },
        ]}
      />
    )

    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain(">Link<")
    expect(markup).not.toContain(">Text<")
  })
})
