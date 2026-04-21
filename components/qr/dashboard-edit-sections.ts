import type { QrEditorSectionId } from "@/components/qr/qr-sections"

export type DashboardEditSectionId = "layers" | "background"
export type DashboardEditSectionDirection = -1 | 0 | 1

export const DEFAULT_DASHBOARD_EDIT_SECTION: DashboardEditSectionId = "layers"

export const DASHBOARD_EDIT_SECTIONS: Array<{
  id: DashboardEditSectionId
  title: string
}> = [
  {
    id: "layers",
    title: "Layers",
  },
  {
    id: "background",
    title: "Background",
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
