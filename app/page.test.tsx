import { isValidElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/ui/ai-prompt-box", () => ({
  PromptInputBox: () => <div data-testid="prompt-input-box" />,
}))

import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import Home from "./page"

describe("home page", () => {
  it("renders the prompt box inside the centered CTA layout", () => {
    const page = Home()

    expect(isValidElement(page)).toBe(true)
    expect(page.type).toBe("main")
    expect(page.props.className).toContain("flex")
    expect(page.props.className).toContain("min-h-screen")
    expect(page.props.className).toContain("items-center")
    expect(page.props.className).toContain("justify-center")
    expect(page.props.className).toContain("px-4")

    const innerWrapper = page.props.children

    expect(isValidElement(innerWrapper)).toBe(true)
    expect(innerWrapper.type).toBe("div")
    expect(innerWrapper.props.className).toContain("w-full")
    expect(innerWrapper.props.className).toContain("max-w-lg")
    expect(isValidElement(innerWrapper.props.children)).toBe(true)
    expect(innerWrapper.props.children.type).toBe(PromptInputBox)
  })
})
