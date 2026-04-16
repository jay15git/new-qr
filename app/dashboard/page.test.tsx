import type { ReactNode } from "react"
import { isValidElement } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/sidebar-03/app-sidebar", () => ({
  DashboardSidebar: () => <div data-testid="dashboard-sidebar" />,
}))

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}))

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}))

import { DashboardSidebar } from "@/components/sidebar-03/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import DashboardPage from "./page"

describe("dashboard page", () => {
  it("renders the floating sidebar route shell without extra UI", () => {
    const page = DashboardPage()

    expect(isValidElement(page)).toBe(true)
    expect(page.type).toBe(TooltipProvider)

    const provider = page.props.children

    expect(isValidElement(provider)).toBe(true)
    expect(provider.type).toBe(SidebarProvider)
    expect(provider.props.className).toContain("min-h-screen")
    expect(provider.props.className).toContain("w-full")

    const layout = provider.props.children

    expect(isValidElement(layout)).toBe(true)
    expect(layout.type).toBe("div")
    expect(layout.props.className).toContain("flex")
    expect(layout.props.className).toContain("min-h-screen")

    const [sidebar, main] = layout.props.children

    expect(isValidElement(sidebar)).toBe(true)
    expect(sidebar.type).toBe(DashboardSidebar)
    expect(isValidElement(main)).toBe(true)
    expect(main.type).toBe("main")
    expect(main.props.className).toContain("flex-1")
    expect(main.props.children).toBeUndefined()
  })
})
