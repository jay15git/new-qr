import type { QrEditorSectionId } from "@/components/qr/qr-sections"

export type DashboardEditSectionId =
  | "page"
  | "position"
  | "assets"
  | "layers"
  | "inspector"
  | "background"
export type DashboardEditSectionDirection = -1 | 0 | 1

export const DEFAULT_DASHBOARD_EDIT_SECTION: DashboardEditSectionId = "page"

export const DASHBOARD_EDIT_SECTIONS: Array<{
  id: DashboardEditSectionId
  title: string
}> = [
  {
    id: "page",
    title: "Page",
  },
  {
    id: "position",
    title: "Position",
  },
  {
    id: "assets",
    title: "Assets",
  },
  {
    id: "layers",
    title: "Layers",
  },
]

export function getDashboardEditSectionIndex(sectionId: DashboardEditSectionId) {
  return DASHBOARD_EDIT_SECTIONS.findIndex((section) => section.id === sectionId)
}

export function getDashboardEditSectionChangeDirection(
  currentSection: DashboardEditSectionId,
  nextSection: DashboardEditSectionId,
): DashboardEditSectionDirection {
  const currentIndex = getDashboardEditSectionIndex(currentSection)
  const nextIndex = getDashboardEditSectionIndex(nextSection)

  if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) {
    return 0
  }

  return nextIndex > currentIndex ? 1 : -1
}

export function getNextDashboardSectionStateForEditMode({
  activeSection,
  lastEditorSection,
  nextIsEditMode,
}: {
  activeSection: QrEditorSectionId
  lastEditorSection: QrEditorSectionId
  nextIsEditMode: boolean
}) {
  if (nextIsEditMode) {
    return {
      activeSection,
      lastEditorSection: activeSection,
    }
  }

  return {
    activeSection: lastEditorSection,
    lastEditorSection,
  }
}
