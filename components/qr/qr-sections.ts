import {
  Activity,
  ImagePlusIcon,
  LinkIcon,
  PieChart,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

export type QrEditorSectionId =
  | "content"
  | "style"
  | "corner-square"
  | "corner-dot"
  | "background"
  | "logo"
  | "encoding"

export type QrEditorSection = {
  id: QrEditorSectionId
  title: string
  icon: LucideIcon
}

export type QrEditorSectionDirection = -1 | 0 | 1

export const DEFAULT_QR_EDITOR_SECTION: QrEditorSectionId = "content"

export const QR_EDITOR_SECTIONS: QrEditorSection[] = [
  {
    id: "content",
    title: "Content",
    icon: LinkIcon,
  },
  {
    id: "style",
    title: "Style",
    icon: Sparkles,
  },
  {
    id: "corner-square",
    title: "Corner Square",
    icon: PieChart,
  },
  {
    id: "corner-dot",
    title: "Corner Dot",
    icon: PieChart,
  },
  {
    id: "background",
    title: "Background",
    icon: Activity,
  },
  {
    id: "logo",
    title: "Logo",
    icon: ImagePlusIcon,
  },
  {
    id: "encoding",
    title: "Encoding",
    icon: Settings,
  },
]

export function getQrEditorSection(sectionId: QrEditorSectionId) {
  return (
    QR_EDITOR_SECTIONS.find((section) => section.id === sectionId) ??
    QR_EDITOR_SECTIONS[0]
  )
}

export function getQrEditorSectionIndex(sectionId: QrEditorSectionId) {
  return QR_EDITOR_SECTIONS.findIndex((section) => section.id === sectionId)
}

export function getQrEditorSectionChangeDirection(
  currentSection: QrEditorSectionId,
  nextSection: QrEditorSectionId,
): QrEditorSectionDirection {
  const currentIndex = getQrEditorSectionIndex(currentSection)
  const nextIndex = getQrEditorSectionIndex(nextSection)

  if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) {
    return 0
  }

  return nextIndex > currentIndex ? 1 : -1
}
