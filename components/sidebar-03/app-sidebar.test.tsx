import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
}))

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarTrigger: () => <button type="button">Toggle</button>,
  useSidebar: () => ({ state: "expanded" }),
}))

vi.mock("@/components/sidebar-03/logo", () => ({
  Logo: () => <div>Logo</div>,
}))

vi.mock("@/components/sidebar-03/nav-notifications", () => ({
  NotificationsPopover: () => <div>Notifications</div>,
}))

vi.mock("@/components/sidebar-03/team-switcher", () => ({
  TeamSwitcher: () => <div>Team switcher</div>,
}))

vi.mock("@/components/sidebar-03/nav-main", () => ({
  default: ({ routes }: { routes: Array<{ title: string }> }) => (
    <div data-routes={JSON.stringify(routes.map((route) => route.title))} />
  ),
}))

import { DashboardSidebar } from "./app-sidebar"

describe("DashboardSidebar", () => {
  it("uses the QR settings sections as the primary sidebar labels", () => {
    const markup = renderToStaticMarkup(<DashboardSidebar />)

    expect(markup).toContain("Dots")
    expect(markup).toContain("Corners")
    expect(markup).toContain("Background")
    expect(markup).toContain("Logo")
    expect(markup).not.toContain("Home")
    expect(markup).not.toContain("Products")
    expect(markup).not.toContain("Settings")
  })
})
