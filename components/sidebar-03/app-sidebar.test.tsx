import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarSeparator: () => <hr />,
  SidebarTrigger: () => <button type="button">Toggle</button>,
  useSidebar: () => ({ state: "expanded" }),
}))

import { DashboardSidebar } from "./app-sidebar"

describe("DashboardSidebar", () => {
  it("renders a simplified qr section rail", () => {
    const markup = renderToStaticMarkup(
      <DashboardSidebar activeSection="content" onSectionChange={() => {}} />,
    )

    expect(markup).toContain("Content")
    expect(markup).toContain("Style")
    expect(markup).toContain("Corners")
    expect(markup).toContain("Background")
    expect(markup).toContain("Logo")
    expect(markup).toContain("Encoding")
    expect(markup).not.toContain("Acme")
    expect(markup).not.toContain("Notifications")
    expect(markup).not.toContain("Team switcher")
  })
})
