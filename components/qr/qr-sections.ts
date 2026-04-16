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
  | "corners"
  | "background"
  | "logo"
  | "encoding"

export type QrEditorSection = {
  id: QrEditorSectionId
  title: string
  description: string
  detail: string
  icon: LucideIcon
}

export const DEFAULT_QR_EDITOR_SECTION: QrEditorSectionId = "content"

export const QR_EDITOR_SECTIONS: QrEditorSection[] = [
  {
    id: "content",
    title: "Content",
    description: "Value, output type, and size",
    detail: "Set the encoded value, renderer, and output dimensions before styling the code.",
    icon: LinkIcon,
  },
  {
    id: "style",
    title: "Style",
    description: "Dots, color, and gradients",
    detail: "Tune the main QR modules, round sizing, and optional gradients.",
    icon: Sparkles,
  },
  {
    id: "corners",
    title: "Corners",
    description: "Frames and inner markers",
    detail: "Adjust the outer corner frames and inner corner dots independently.",
    icon: PieChart,
  },
  {
    id: "background",
    title: "Background",
    description: "Fill, transparency, and depth",
    detail: "Choose whether the QR floats transparently or sits on a solid or gradient background.",
    icon: Activity,
  },
  {
    id: "logo",
    title: "Logo",
    description: "Upload, sizing, and spacing",
    detail: "Add a remote or uploaded logo, then control how much room it occupies inside the QR.",
    icon: ImagePlusIcon,
  },
  {
    id: "encoding",
    title: "Encoding",
    description: "Mode and error correction",
    detail: "Fine-tune the technical QR options used to encode and recover the data.",
    icon: Settings,
  },
]

export function getQrEditorSection(sectionId: QrEditorSectionId) {
  return (
    QR_EDITOR_SECTIONS.find((section) => section.id === sectionId) ??
    QR_EDITOR_SECTIONS[0]
  )
}
