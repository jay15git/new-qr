"use client"

import {
  AppleIcon,
  ArrowLeft01Icon,
  Download02Icon,
  Image02Icon,
  KeyboardIcon,
  SaveIcon,
  WindowsOldIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import type {
  QrFinderPatternInnerStyle,
  QrFinderPatternOuterStyle,
  QrErrorCorrectionLevel,
  QrFileExtension,
  QrTypeNumber,
} from "@/features/qr-code/model/types"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  ItalicIcon,
  MoonIcon,
  Redo2Icon,
  RotateCcwIcon,
  ShieldCheckIcon,
  Settings,
  ShapesIcon,
  Sparkles,
  SunIcon,
  TypeIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"

import { BlocksIcon } from "@/components/vendor/animate-ui/icons/blocks"
import {
  BRAND_ICON_CATALOG,
  filterBrandIcons,
  type BrandIconCategory,
  type BrandIconEntry,
} from "@/features/qr-code/assets/brand-icons"
import { DEFAULT_BRAND_ICON_COLOR } from "@/features/qr-code/assets/brand-icon-svg"
import {
  DRAFTING_CARD_PATTERN_NONE_ID,
  DRAFTING_CARD_PATTERNS,
  getDraftingCardPatternStyle,
  type DraftingCardPatternSelectionId,
} from "@/features/workspace/model/card-patterns"
import { DEFAULT_DRAFTING_CARD_STATE } from "@/features/workspace/model/card-state"
import {
  getCardGeneratedShaderDefinitions,
  getCardImageFilterDefinitions,
  getPaperShaderDefinition,
  type PaperShaderId,
} from "@/features/workspace/rendering/paper-shaders"
import {
  DEFAULT_DRAFTING_TEXT_LAYER,
  type DraftingTextAlign,
  type DraftingTextFontStyle,
  type DraftingTextFontWeight,
} from "@/features/workspace/model/layers"
import {
  DesktopUtilityToolbar,
  DesktopUtilityToolbarButton,
} from "@/features/desktop-shell/components/DesktopUtilityToolbar"
import { DRAFTING_KEYBOARD_SHORTCUT_GROUPS } from "@/features/workspace/model/keyboard-shortcuts"
import {
  DRAFTING_FONT_REGISTRY,
  getDraftingFontCssFamily,
  loadDraftingFont,
  resolveDraftingFont,
} from "@/features/workspace/model/fonts"
import {
  buildStaticQrPayload,
  getDefaultStaticQrValues,
  STATIC_QR_CONTENT_META,
  validateStaticQrContent,
  type StaticQrContentValue,
  type StaticQrContentValues,
} from "@/features/qr-code/content/static-payload"
import {
  QR_BACKGROUND_SHAPES,
  type QrBackgroundShapeId,
} from "@/features/qr-code/styles/background-shapes"
import {
  CORNER_DOT_STYLE_OPTIONS,
  CORNER_SQUARE_STYLE_OPTIONS,
  DOT_STYLE_OPTIONS,
} from "@/features/qr-code/styles/style-options"
import { StylePreview, type StylePreviewKind } from "@/features/qr-code/components/StylePreview"
import {
  DEFAULT_DOT_MATRIX_ANIMATION,
  DEFAULT_BACKGROUND_SHAPE_OPTIONS,
  QR_DOT_MATRIX_ANIMATION_SPEED_MAX,
  QR_DOT_MATRIX_ANIMATION_SPEED_MIN,
  QR_DOT_MATRIX_COLOR_PRESET_OPTIONS,
  QR_DOT_MATRIX_MATRIX_SIZE_MAX,
  QR_DOT_MATRIX_MATRIX_SIZE_MIN,
  QR_DOT_MATRIX_MATRIX_SIZE_STEP,
  QR_DOT_MATRIX_OVERLAY_SCALE_MAX,
  QR_DOT_MATRIX_OVERLAY_SCALE_MIN,
  QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS,
  type DotsColorMode,
  type QrDotMatrixAnimationOptions,
  type QrDotMatrixAnimationPatch,
  type StudioGradient,
  type StudioDataModulesStyle,
} from "@/features/qr-code/model/state"
import {
  ERROR_CORRECTION_LEVEL_OPTIONS,
  TYPE_NUMBER_MAX,
  TYPE_NUMBER_MIN,
  formatQrTypeNumberLabel,
} from "@/features/qr-code/styles/encoding-options"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Kbd } from "@/components/kbd"
import { CalligraphText } from "@/components/ui/calligraph-text"
import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"
import {
  ColorPicker as AmploColorPicker,
  parseColor,
  type OklchColor,
} from "@/components/ui/fill-picker/fill-picker"
import {
  DESKTOP_INSPECTOR_CONTROL_CLASS,
  DESKTOP_INSPECTOR_DROPDOWN_ITEM_CLASS,
  DESKTOP_INSPECTOR_DROPDOWN_MENU_CLASS,
  DESKTOP_INSPECTOR_DROPDOWN_TRIGGER_CLASS,
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_FG_SECONDARY,
  DESKTOP_INSPECTOR_FG_TERTIARY,
  DESKTOP_INSPECTOR_FIELD_ROW_CLASS,
  DESKTOP_INSPECTOR_FOCUS_CLASS,
  DESKTOP_INSPECTOR_FOOTER_CLASS,
  DESKTOP_INSPECTOR_HEADER_CLASS,
  DESKTOP_INSPECTOR_INPUT_CLASS,
  DESKTOP_INSPECTOR_LABEL_CLASS,
  DESKTOP_INSPECTOR_MAJOR_GAP_CLASS,
  DESKTOP_INSPECTOR_PANEL_TITLE_CLASS,
  DESKTOP_INSPECTOR_RESET_CLASS,
  DESKTOP_INSPECTOR_ROW_CLASS,
  DESKTOP_INSPECTOR_ROW_GAP_CLASS,
  DESKTOP_INSPECTOR_SECTION_CLASS,
  DESKTOP_INSPECTOR_SECTION_GAP_CLASS,
  DESKTOP_INSPECTOR_SECTION_HEADING_CLASS,
  DESKTOP_INSPECTOR_SELECTED_CLASS,
  DESKTOP_OPTION_CARD_SELECTED_CLASS,
  DesktopInspectorLabel,
  DesktopInspectorNativeSelect,
  DesktopInspectorSearchInput,
  DesktopInspectorSection,
  DesktopInspectorSegmentedControl,
  DesktopInspectorTextarea,
  DesktopInspectorTextInput,
} from "@/features/desktop-shell/components/InspectorControls"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DEFAULT_QR_INPUT_TYPE,
  QR_INPUT_OPTIONS,
  type QrInputType,
} from "@/features/qr-code/content/input-options"
import { DownloadIcon as AnimatedDownloadIcon } from "@/components/ui/download"
import { ElasticSlider } from "@/components/ui/elastic-slider"
import { GalleryVerticalEndIcon } from "@/components/ui/gallery-vertical-end"
import { GripIcon } from "@/components/ui/grip"
import { LayersIcon } from "@/components/ui/layers"
import LetterTIcon from "@/components/ui/letter-t-icon"
import { MessageCircleIcon } from "@/components/ui/message-circle"
import { PlayIcon } from "@/components/ui/play"
import { ReceiptTextIcon } from "@/components/ui/receipt-text"
import { cn } from "@/lib/utils"
import type { DraftingCanvasLayer } from "@/features/workspace/model/layers"
import { ElementInspector } from "@/features/workspace/components/ElementInspector"
import { InsertMenu } from "@/features/workspace/components/InsertMenu"

type DesktopToolbarGroup = "QR" | "Add" | "Manage"
export type DesktopToolbarToolId =
  | "content"
  | "pattern"
  | "corners"
  | "logo"
  | "shape"
  | "motion"
  | "encoding"
  | "text"
  | "image"
  | "decorations"
  | "effects"
  | "layers"
  | "export"

type DesktopToolbarTool = {
  group: DesktopToolbarGroup
  id: DesktopToolbarToolId
  title: string
  renderIcon: () => ReactNode
}

export type DesktopThemeMode = "dark" | "light"

type DesktopShortcutPlatform = "apple" | "windows"

const DESKTOP_SHORTCUT_PLATFORMS: Array<{
  icon: typeof WindowsOldIcon
  label: string
  value: DesktopShortcutPlatform
}> = [
  { icon: AppleIcon, label: "Apple", value: "apple" },
  { icon: WindowsOldIcon, label: "Windows", value: "windows" },
]

function getDefaultShortcutPlatform(): DesktopShortcutPlatform {
  if (typeof navigator === "undefined") {
    return "windows"
  }

  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    ""
  const userAgent = navigator.userAgent ?? ""
  const platformSignature = `${platform} ${userAgent}`.toLowerCase()

  return /mac|iphone|ipad|ipod/.test(platformSignature) ? "apple" : "windows"
}

function getShortcutKeyCombos(keys: string, platform: DesktopShortcutPlatform): string[][] {
  if (keys === "Arrow keys") {
    return [["↑"], ["↓"], ["←"], ["→"]]
  }

  if (keys === "Shift + Arrow") {
    return [["Shift", "← ↑ ↓ →"]]
  }

  return keys.split(" / ").map((combo) =>
    combo.split(" + ").map((key) => {
      if (key === "Cmd/Ctrl") {
        return platform === "apple" ? "⌘" : "Ctrl"
      }

      return key
    }),
  )
}

const DESKTOP_COLOR_PICKER_SWATCHES = [
  "#111111",
  "#4B4F56",
  "#FFFFFF",
  "#C19B1D",
  "#151515",
  "oklch(0.7 0.18 30)",
  "oklch(0.7 0.18 150)",
  "color(display-p3 0.85 0.45 0.15)",
]

const DESKTOP_TOOLBAR_TOOLS: DesktopToolbarTool[] = [
  {
    group: "QR",
    id: "content",
    title: "Content",
    renderIcon: () => <ReceiptTextIcon size={18} />,
  },
  {
    group: "QR",
    id: "pattern",
    title: "Pattern",
    renderIcon: () => <GripIcon size={18} />,
  },
  {
    group: "QR",
    id: "corners",
    title: "Corners",
    renderIcon: () => <BlocksIcon animateOnHover size={18} />,
  },
  {
    group: "QR",
    id: "logo",
    title: "Logo",
    renderIcon: () => <MessageCircleIcon size={18} />,
  },
  {
    group: "QR",
    id: "shape",
    title: "Frame",
    renderIcon: () => (
      <HugeiconsIcon icon={Image02Icon} size={18} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    group: "QR",
    id: "motion",
    title: "Motion",
    renderIcon: () => <PlayIcon size={18} />,
  },
  {
    group: "QR",
    id: "encoding",
    title: "Encoding",
    renderIcon: () => <Settings className="size-[18px]" />,
  },
  {
    group: "Manage",
    id: "layers",
    title: "Layers",
    renderIcon: () => <LayersIcon size={18} />,
  },
  {
    group: "Manage",
    id: "export",
    title: "Export",
    renderIcon: () => <AnimatedDownloadIcon size={18} />,
  },
]

const DESKTOP_CONTENT_PRESET_TYPES: QrInputType[] = [
  "auto",
  "link",
  "text",
  "email",
  "phone",
  "sms",
  "wifi",
  "vcard",
]

const DESKTOP_ELASTIC_SLIDER_CLASS =
  "desktop-elastic-slider [--elastic-slider-height:--spacing(8)] [--elastic-slider-radius:9999px] [--elastic-slider-bg:rgba(255,255,255,0.095)] [--elastic-slider-fill:rgba(255,255,255,0.13)] [--elastic-slider-fill-active:rgba(255,255,255,0.2)] [--elastic-slider-hash:rgba(255,255,255,0.24)] [--elastic-slider-handle:rgba(255,255,255,0.7)] [--elastic-slider-label:rgba(255,255,255,0.58)] [--elastic-slider-focus:rgba(255,255,255,0.82)]"

type DesktopContentCollectionId = "all" | "popular" | "contact" | "social" | "business" | "files"

const DESKTOP_CONTENT_COLLECTIONS: Array<{
  id: DesktopContentCollectionId
  label: string
  types: QrInputType[]
}> = [
  {
    id: "popular",
    label: "Popular",
    types: ["auto", "link", "text", "email", "phone", "sms", "wifi", "vcard"],
  },
  {
    id: "contact",
    label: "Contact",
    types: ["phone", "email", "sms", "vcard", "whatsapp-chat", "telegram-username", "map-location"],
  },
  {
    id: "social",
    label: "Social",
    types: ["instagram", "x", "tiktok", "youtube", "linkedin", "telegram", "snapchat", "threads", "pinterest", "facebook", "discord"],
  },
  {
    id: "business",
    label: "Business",
    types: ["website", "google-review", "booking-link", "payment-link", "menu", "app-download", "event", "coupon"],
  },
  {
    id: "files",
    label: "Files",
    types: ["pdf", "image", "video", "document", "form"],
  },
]

const DESKTOP_CONTENT_FILTER_OPTIONS: Array<{
  id: DesktopContentCollectionId
  label: string
}> = [{ id: "all", label: "All" }, ...DESKTOP_CONTENT_COLLECTIONS]

const DESKTOP_ALL_CONTENT_TYPES = Array.from(
  new Set<QrInputType>([
    ...DESKTOP_CONTENT_PRESET_TYPES,
    ...DESKTOP_CONTENT_COLLECTIONS.flatMap((collection) => collection.types),
  ]),
)

export type DesktopPatternSettings = {
  dotsColorMode: DotsColorMode
  dataModulesGradient: StudioGradient
  dotsPalette: string[]
  dotsSolidColor: string
  qrDotType: StudioDataModulesStyle
}

export type DesktopLogoSourceMode = "brand" | "none" | "upload" | "url"
export type DesktopAssetSourceMode = "upload" | "url"

export type DesktopLogoSettings = {
  colorMode: DesktopCornerColorMode
  gradient: StudioGradient
  hideBackgroundDots: boolean
  margin: number
  remoteUrl: string
  saveAsBlob: boolean
  selectedBrandIconId: string
  size: number
  solidColor: string
  sourceMode: DesktopLogoSourceMode
  uploadMode: DesktopAssetSourceMode
}

export type DesktopCornersSettings = {
  cornerDotColorMode: DesktopCornerColorMode
  cornerDotGradient: StudioGradient
  cornerDotSolidColor: string
  cornerDotType: QrFinderPatternInnerStyle
  cornerSquareColorMode: DesktopCornerColorMode
  cornerSquareGradient: StudioGradient
  cornerSquareSolidColor: string
  cornerSquareType: QrFinderPatternOuterStyle
}

type DesktopCornerColorMode = "solid" | "gradient"

type DesktopShapeColorMode = "solid" | "gradient"

export type DesktopShapeSettings = {
  backgroundShapeId: QrBackgroundShapeId
  borderColor: string
  borderOpacity: number
  borderWidth: number
  bottomSpace: number
  cardEnabled: boolean
  cardFill: string
  cardImageFit: "contain" | "cover"
  cardImageOpacity: number
  cardImageSourceMode: DesktopAssetSourceMode
  cardImageUrl: string
  cardPatternId: DraftingCardPatternSelectionId
  cardRadius: number
  padding: number
  shapeColorMode: DesktopShapeColorMode
  shapeGradient: StudioGradient
  shapePadding: number
  shapeShadowBlur: number
  shapeShadowColor: string
  shapeShadowOffsetX: number
  shapeShadowOffsetY: number
  shapeShadowOpacity: number
  shapeSolidColor: string
  shapeStrokeColor: string
  shapeStrokeOpacity: number
  shapeStrokeWidth: number
  shapeTiltX: number
  shapeTiltY: number
  shadowBlur: number
  shadowColor: string
  shadowOffsetX: number
  shadowOffsetY: number
  shadowOpacity: number
}

export type DesktopMotionSettings = QrDotMatrixAnimationOptions

export type DesktopEncodingSettings = {
  errorCorrectionLevel: QrErrorCorrectionLevel
  typeNumber: QrTypeNumber
}

type DesktopImageIntent = "image-object" | "logo" | "shape-fill"

export type DesktopImageSettings = {
  fit: "contain" | "cover"
  intent: DesktopImageIntent
  opacity: number
  remoteUrl: string
  sourceMode: DesktopAssetSourceMode
}

export type DesktopDecorationsSettings = {
  fill: string
  kind: "badge" | "frame" | "label" | "sticker"
  patternId: DraftingCardPatternSelectionId
  radius: number
  strokeColor: string
  strokeWidth: number
}

export type DesktopEffectsSettings = {
  filterId: PaperShaderId
  filterPresetName: string
  generatedShaderId: PaperShaderId
  generatedShaderPresetName: string
  paused: boolean
  speed: number
  frame: number
}

export type DesktopLayerKind = "card" | "image" | "qr" | "shape" | "text"
export type DesktopLayerRow = {
  blur: number
  height: number
  id: string
  isLocked: boolean
  isVisible: boolean
  kind: DesktopLayerKind
  name: string
  opacity: number
  shadowBlur: number
  shadowColor: string
  shadowOffsetX: number
  shadowOffsetY: number
  shadowOpacity: number
  tiltX: number
  tiltY: number
  width: number
  x: number
  y: number
}

export type DesktopLayersSettings = {
  layers: DesktopLayerRow[]
  selectedLayerId: string
}

export type DesktopExportTarget = "all-qr" | "current" | "surface"
export type DesktopRasterExportPresetId =
  | "flyer-poster"
  | "large-format"
  | "max-quality"
  | "quick-share"
  | "small-print"
  | "web-social"

export type DesktopExportSettings = {
  extension: QrFileExtension
  qualityPresetId: DesktopRasterExportPresetId
  target: DesktopExportTarget
}

export type DesktopTextSettings = {
  fill: string
  fontFamily: string
  fontId: string
  fontSize: number
  fontStyle: DraftingTextFontStyle
  fontWeight: DraftingTextFontWeight
  letterSpacing: number
  lineHeight: number
  text: string
  textAlign: DraftingTextAlign
  underline: boolean
}

type DesktopTextPresetId = "body" | "caption" | "title"

export type DesktopToolbarController = {
  activeTool: DesktopToolbarToolId | null
  canRedo?: boolean
  canUndo?: boolean
  contentType: QrInputType
  contentValues: StaticQrContentValues
  contentValidation: ReturnType<typeof validateStaticQrContent>
  encodedContentValue: string
  patternSettings: DesktopPatternSettings
  logoSettings: DesktopLogoSettings
  cornersSettings: DesktopCornersSettings
  shapeSettings: DesktopShapeSettings
  motionSettings: DesktopMotionSettings
  encodingSettings: DesktopEncodingSettings
  imageSettings: DesktopImageSettings
  decorationsSettings: DesktopDecorationsSettings
  effectsSettings: DesktopEffectsSettings
  layersSettings: DesktopLayersSettings
  exportSettings: DesktopExportSettings
  textSettings: DesktopTextSettings
  insertNodeId?: string
  selectedElementLayer?: DraftingCanvasLayer | null
  onInsertLayer?: (layer: DraftingCanvasLayer) => void
  onElementLayerPatch?: (patch: Partial<DraftingCanvasLayer>) => void
  onActiveToolChange: (toolId: DesktopToolbarToolId) => void
  onRedo?: () => void
  onSave?: () => void
  onUndo?: () => void
  onResetDefaults?: () => void
  onContentReset: () => void
  onContentTypeChange: (type: QrInputType) => void
  onContentValueChange: (field: string, value: StaticQrContentValue) => void
  onPatternReset: () => void
  onPatternSettingsChange: (patch: Partial<DesktopPatternSettings>) => void
  onLogoReset: () => void
  onLogoSettingsChange: (patch: Partial<DesktopLogoSettings>) => void
  onCornersReset: () => void
  onCornersSettingsChange: (patch: Partial<DesktopCornersSettings>) => void
  onShapeReset: () => void
  onShapeSettingsChange: (patch: Partial<DesktopShapeSettings>) => void
  onMotionReset: () => void
  onMotionSettingsChange: (patch: QrDotMatrixAnimationPatch) => void
  onEncodingReset: () => void
  onEncodingSettingsChange: (patch: Partial<DesktopEncodingSettings>) => void
  onImageReset: () => void
  onImageSettingsChange: (patch: Partial<DesktopImageSettings>) => void
  onDecorationsReset: () => void
  onDecorationsSettingsChange: (patch: Partial<DesktopDecorationsSettings>) => void
  onEffectsReset: () => void
  onEffectsSettingsChange: (patch: Partial<DesktopEffectsSettings>) => void
  onLayersReset: () => void
  onLayersSettingsChange: (patch: Partial<DesktopLayersSettings>) => void
  onExportReset: () => void
  onExportSettingsChange: (patch: Partial<DesktopExportSettings>) => void
  onExportDownload: () => void
  onTextReset: () => void
  onTextSettingsChange: (patch: Partial<DesktopTextSettings>) => void
}

const DEFAULT_DESKTOP_DOTS_GRADIENT: StudioGradient = {
  enabled: true,
  type: "linear",
  rotation: 0,
  colorStops: [
    { offset: 0, color: "#18181b" },
    { offset: 1, color: "#3f3f46" },
  ],
}

const DEFAULT_DESKTOP_DOTS_PALETTE = ["#04879c", "#0c3c78", "#090030", "#f30a49"]

const DESKTOP_DOTS_PALETTE_PRESETS: Array<{
  colors: string[]
  label: string
}> = [
  { label: "Aurora", colors: ["#67e8f9", "#a78bfa", "#f0abfc", "#f8fafc"] },
  { label: "Fire", colors: ["#f97316", "#ef4444", "#facc15", "#7f1d1d"] },
  { label: "Mint", colors: ["#34d399", "#6ee7b7", "#d9f99d", "#064e3b"] },
  { label: "Neon", colors: ["#22d3ee", "#a855f7", "#f8fafc", "#111827"] },
  { label: "Ocean", colors: ["#38bdf8", "#2563eb", "#0f172a", "#bae6fd"] },
  { label: "Prism", colors: ["#64748b", "#eab308", "#22c55e", "#ec4899"] },
  { label: "Sunset", colors: ["#f59e0b", "#f97316", "#fde047", "#7c2d12"] },
  { label: "Signal", colors: ["#04879c", "#0c3c78", "#090030", "#f30a49"] },
  { label: "Candy", colors: ["#fb7185", "#f0abfc", "#c084fc", "#38bdf8"] },
  { label: "Mono", colors: ["#020617", "#334155", "#94a3b8", "#f8fafc"] },
]

const DESKTOP_BRAND_ICON_CATEGORY_OPTIONS: Array<{
  label: string
  value: BrandIconCategory | "all"
}> = [
  { label: "All", value: "all" },
  { label: "Social", value: "social" },
  { label: "Business", value: "business" },
  { label: "Payments", value: "payments" },
  { label: "Travel", value: "travel" },
  { label: "Media", value: "media" },
  { label: "Web", value: "web" },
]

const DESKTOP_DOTS_COLOR_MODES: Array<{ label: string; value: DotsColorMode }> = [
  { label: "Solid", value: "solid" },
  { label: "Gradient", value: "gradient" },
  { label: "Patterns", value: "palette" },
]

const DESKTOP_CORNER_COLOR_MODES: Array<{ label: string; value: DesktopCornerColorMode }> = [
  { label: "Solid", value: "solid" },
  { label: "Gradient", value: "gradient" },
]

const DESKTOP_SHAPE_COLOR_MODES: Array<{ label: string; value: DesktopShapeColorMode }> = [
  { label: "Solid", value: "solid" },
  { label: "Gradient", value: "gradient" },
]

const DESKTOP_GRADIENT_TYPE_OPTIONS: Array<{ label: string; value: StudioGradient["type"] }> = [
  { label: "Linear", value: "linear" },
  { label: "Radial", value: "radial" },
]

const DESKTOP_LOGO_SOURCE_OPTIONS: Array<{ label: string; value: DesktopLogoSourceMode }> = [
  { label: "None", value: "none" },
  { label: "Brand", value: "brand" },
  { label: "Upload", value: "upload" },
  { label: "URL", value: "url" },
]

const DESKTOP_ASSET_SOURCE_OPTIONS: Array<{ label: string; value: DesktopAssetSourceMode }> = [
  { label: "Upload", value: "upload" },
  { label: "URL", value: "url" },
]

const DESKTOP_IMAGE_INTENT_OPTIONS: Array<{ label: string; value: DesktopImageIntent }> = [
  { label: "Object", value: "image-object" },
  { label: "Shape fill", value: "shape-fill" },
  { label: "Logo", value: "logo" },
]

const DESKTOP_DECORATION_OPTIONS: Array<{ label: string; value: DesktopDecorationsSettings["kind"] }> = [
  { label: "Frame", value: "frame" },
  { label: "Badge", value: "badge" },
  { label: "Label", value: "label" },
  { label: "Sticker", value: "sticker" },
]

const DESKTOP_EXPORT_TARGET_OPTIONS: Array<{ label: string; value: DesktopExportTarget }> = [
  { label: "Current QR", value: "current" },
  { label: "All QR codes", value: "all-qr" },
  { label: "Full surface", value: "surface" },
]

const DESKTOP_DOWNLOAD_EXTENSIONS = ["svg", "png", "webp", "jpeg"] as const satisfies ReadonlyArray<
  QrFileExtension
>

const DESKTOP_RASTER_EXPORT_PRESETS = [
  { id: "quick-share", label: "Quick share", primaryUse: "chat, email, docs", sizePx: 512 },
  { id: "web-social", label: "Web & social", primaryUse: "sites, posts, menus", sizePx: 1024 },
  { id: "small-print", label: "Small print", primaryUse: "stickers, cards", sizePx: 1600 },
  { id: "flyer-poster", label: "Flyer / poster", primaryUse: "nearby signage", sizePx: 2400 },
  { id: "large-format", label: "Large format", primaryUse: "banners, walls", sizePx: 3200 },
  { id: "max-quality", label: "Max quality", primaryUse: "handoff, archive", sizePx: 4096 },
] as const

const DEFAULT_DESKTOP_PATTERN_SETTINGS: DesktopPatternSettings = {
  dotsColorMode: "solid",
  dataModulesGradient: DEFAULT_DESKTOP_DOTS_GRADIENT,
  dotsPalette: DEFAULT_DESKTOP_DOTS_PALETTE,
  dotsSolidColor: "#18181b",
  qrDotType: "rounded",
}

const DEFAULT_DESKTOP_LOGO_SETTINGS: DesktopLogoSettings = {
  colorMode: "solid",
  gradient: structuredClone(DEFAULT_DESKTOP_DOTS_GRADIENT),
  hideBackgroundDots: true,
  margin: 12,
  remoteUrl: "",
  saveAsBlob: true,
  selectedBrandIconId: BRAND_ICON_CATALOG[0]?.id ?? "instagram",
  size: 40,
  solidColor: DEFAULT_BRAND_ICON_COLOR,
  sourceMode: "brand",
  uploadMode: "upload",
}

const DEFAULT_DESKTOP_CORNERS_SETTINGS: DesktopCornersSettings = {
  cornerDotColorMode: "solid",
  cornerDotGradient: {
    ...DEFAULT_DESKTOP_DOTS_GRADIENT,
    colorStops: [
      { offset: 0, color: "#18181b" },
      { offset: 1, color: "#52525b" },
    ],
  },
  cornerDotSolidColor: "#18181b",
  cornerDotType: "circle",
  cornerSquareColorMode: "solid",
  cornerSquareGradient: {
    ...DEFAULT_DESKTOP_DOTS_GRADIENT,
    colorStops: [
      { offset: 0, color: "#18181b" },
      { offset: 1, color: "#52525b" },
    ],
  },
  cornerSquareSolidColor: "#18181b",
  cornerSquareType: "rounded-lg",
}

const DEFAULT_DESKTOP_SHAPE_SETTINGS: DesktopShapeSettings = {
  backgroundShapeId: "none",
  borderColor: DEFAULT_DRAFTING_CARD_STATE.border.color,
  borderOpacity: DEFAULT_DRAFTING_CARD_STATE.border.opacity,
  borderWidth: DEFAULT_DRAFTING_CARD_STATE.border.width,
  bottomSpace: DEFAULT_DRAFTING_CARD_STATE.bottomSpace,
  cardEnabled: DEFAULT_DRAFTING_CARD_STATE.enabled,
  cardFill: DEFAULT_DRAFTING_CARD_STATE.fill,
  cardImageFit: DEFAULT_DRAFTING_CARD_STATE.cardImage.fit,
  cardImageOpacity: DEFAULT_DRAFTING_CARD_STATE.cardImage.opacity,
  cardImageSourceMode: "upload",
  cardImageUrl: "",
  cardPatternId: DEFAULT_DRAFTING_CARD_STATE.patternId,
  cardRadius: DEFAULT_DRAFTING_CARD_STATE.cornerRadius,
  padding: DEFAULT_DRAFTING_CARD_STATE.padding,
  shapeColorMode: "solid",
  shapeGradient: {
    enabled: true,
    type: "linear",
    rotation: 0,
    colorStops: [
      { offset: 0, color: "#18181b" },
      { offset: 1, color: "#52525b" },
    ],
  },
  shapePadding: DEFAULT_BACKGROUND_SHAPE_OPTIONS.paddingPx,
  shapeShadowBlur: DEFAULT_BACKGROUND_SHAPE_OPTIONS.edgeBlur,
  shapeShadowColor: DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowColor,
  shapeShadowOffsetX: DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetX,
  shapeShadowOffsetY: DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOffsetY,
  shapeShadowOpacity: DEFAULT_BACKGROUND_SHAPE_OPTIONS.shadowOpacity,
  shapeSolidColor: "#18181b",
  shapeStrokeColor: DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeColor,
  shapeStrokeOpacity: DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeOpacity,
  shapeStrokeWidth: DEFAULT_BACKGROUND_SHAPE_OPTIONS.strokeWidth,
  shapeTiltX: DEFAULT_BACKGROUND_SHAPE_OPTIONS.tiltX,
  shapeTiltY: DEFAULT_BACKGROUND_SHAPE_OPTIONS.tiltY,
  shadowBlur: DEFAULT_DRAFTING_CARD_STATE.shadow.blur,
  shadowColor: DEFAULT_DRAFTING_CARD_STATE.shadow.color,
  shadowOffsetX: DEFAULT_DRAFTING_CARD_STATE.shadow.offsetX,
  shadowOffsetY: DEFAULT_DRAFTING_CARD_STATE.shadow.offsetY,
  shadowOpacity: DEFAULT_DRAFTING_CARD_STATE.shadow.opacity,
}

const DEFAULT_DESKTOP_MOTION_SETTINGS: DesktopMotionSettings = {
  ...DEFAULT_DOT_MATRIX_ANIMATION,
}

const DEFAULT_DESKTOP_ENCODING_SETTINGS: DesktopEncodingSettings = {
  errorCorrectionLevel: "Q",
  typeNumber: 0,
}

const DEFAULT_DESKTOP_IMAGE_SETTINGS: DesktopImageSettings = {
  fit: "cover",
  intent: "image-object",
  opacity: 100,
  remoteUrl: "",
  sourceMode: "upload",
}

const DEFAULT_DESKTOP_DECORATIONS_SETTINGS: DesktopDecorationsSettings = {
  fill: DEFAULT_DRAFTING_CARD_STATE.fill,
  kind: "frame",
  patternId: DRAFTING_CARD_PATTERN_NONE_ID,
  radius: DEFAULT_DRAFTING_CARD_STATE.cornerRadius,
  strokeColor: DEFAULT_DRAFTING_CARD_STATE.border.color,
  strokeWidth: DEFAULT_DRAFTING_CARD_STATE.border.width,
}

const DEFAULT_DESKTOP_EFFECTS_SETTINGS: DesktopEffectsSettings = {
  filterId: getCardImageFilterDefinitions()[0]?.id ?? "paper-texture",
  filterPresetName: getCardImageFilterDefinitions()[0]?.presets[0]?.name ?? "",
  frame: 0,
  generatedShaderId: getCardGeneratedShaderDefinitions()[0]?.id ?? "mesh-gradient",
  generatedShaderPresetName: getCardGeneratedShaderDefinitions()[0]?.presets[0]?.name ?? "",
  paused: false,
  speed: 1,
}

const DEFAULT_DESKTOP_LAYERS: DesktopLayerRow[] = [
  {
    blur: 0,
    height: 448,
    id: "desktop-layer-card",
    isLocked: false,
    isVisible: true,
    kind: "card",
    name: "QR Shape",
    opacity: 100,
    shadowBlur: DEFAULT_DRAFTING_CARD_STATE.shadow.blur,
    shadowColor: DEFAULT_DRAFTING_CARD_STATE.shadow.color,
    shadowOffsetX: DEFAULT_DRAFTING_CARD_STATE.shadow.offsetX,
    shadowOffsetY: DEFAULT_DRAFTING_CARD_STATE.shadow.offsetY,
    shadowOpacity: DEFAULT_DRAFTING_CARD_STATE.shadow.opacity,
    tiltX: 0,
    tiltY: 0,
    width: 384,
    x: -192,
    y: -224,
  },
  {
    blur: 0,
    height: 300,
    id: "desktop-layer-qr",
    isLocked: false,
    isVisible: true,
    kind: "qr",
    name: "QR Code",
    opacity: 100,
    shadowBlur: 0,
    shadowColor: "#111827",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowOpacity: 0,
    tiltX: 0,
    tiltY: 0,
    width: 300,
    x: -150,
    y: -180,
  },
  {
    blur: 0,
    height: 48,
    id: "desktop-layer-text",
    isLocked: false,
    isVisible: true,
    kind: "text",
    name: "Text: Add text",
    opacity: 100,
    shadowBlur: 0,
    shadowColor: "#111827",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowOpacity: 0,
    tiltX: 0,
    tiltY: 0,
    width: 240,
    x: -120,
    y: 150,
  },
]

const DEFAULT_DESKTOP_LAYERS_SETTINGS: DesktopLayersSettings = {
  layers: DEFAULT_DESKTOP_LAYERS.map((layer) => ({ ...layer })),
  selectedLayerId: DEFAULT_DESKTOP_LAYERS[1]?.id ?? "",
}

const DEFAULT_DESKTOP_EXPORT_SETTINGS: DesktopExportSettings = {
  extension: "png",
  qualityPresetId: "web-social",
  target: "current",
}

const DEFAULT_DESKTOP_TEXT_SETTINGS: DesktopTextSettings = {
  fill: DEFAULT_DRAFTING_TEXT_LAYER.fill,
  fontFamily: DEFAULT_DRAFTING_TEXT_LAYER.fontFamily,
  fontId: DEFAULT_DRAFTING_TEXT_LAYER.fontId,
  fontSize: DEFAULT_DRAFTING_TEXT_LAYER.fontSize,
  fontStyle: DEFAULT_DRAFTING_TEXT_LAYER.fontStyle,
  fontWeight: DEFAULT_DRAFTING_TEXT_LAYER.fontWeight,
  letterSpacing: DEFAULT_DRAFTING_TEXT_LAYER.letterSpacing,
  lineHeight: DEFAULT_DRAFTING_TEXT_LAYER.lineHeight,
  text: DEFAULT_DRAFTING_TEXT_LAYER.text,
  textAlign: DEFAULT_DRAFTING_TEXT_LAYER.textAlign,
  underline: DEFAULT_DRAFTING_TEXT_LAYER.underline,
}

const DESKTOP_TEXT_PRESETS: Array<{
  fontSize: number
  fontWeight: DraftingTextFontWeight
  id: DesktopTextPresetId
  label: string
  lineHeight: number
}> = [
  { fontSize: 32, fontWeight: "normal", id: "body", label: "Body", lineHeight: 1.22 },
  { fontSize: 52, fontWeight: 700, id: "title", label: "Title", lineHeight: 1.05 },
  { fontSize: 18, fontWeight: 500, id: "caption", label: "Caption", lineHeight: 1.35 },
]

const DESKTOP_TEXT_ALIGN_OPTIONS: Array<{ label: string; value: DraftingTextAlign }> = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
]

const DESKTOP_MOTION_COLOR_SWATCHES: Record<DesktopMotionSettings["colorPreset"], string[]> = {
  aurora: ["#67e8f9", "#a78bfa", "#f0abfc"],
  fire: ["#f97316", "#ef4444", "#facc15"],
  mint: ["#34d399", "#6ee7b7", "#d9f99d"],
  neon: ["#22d3ee", "#a855f7", "#f8fafc"],
  ocean: ["#38bdf8", "#2563eb", "#0f172a"],
  prism: ["#64748b", "#eab308", "#22c55e"],
  sunset: ["#f59e0b", "#f97316", "#fde047"],
  theme: ["#22d3ee", "#22d3ee", "#22d3ee"],
}

export function FloatingToolbar({
  controller,
  theme,
  onThemeChange,
  onBack,
}: {
  controller?: DesktopToolbarController
  theme?: DesktopThemeMode
  onThemeChange?: (theme: DesktopThemeMode) => void
  onBack?: () => void
} = {}) {
  const [activeTool, setActiveTool] = useState<DesktopToolbarToolId | null>(null)
  const [desktopTheme, setDesktopTheme] = useState<DesktopThemeMode>("dark")
  const [shortcutPlatform, setShortcutPlatform] = useState<DesktopShortcutPlatform>(
    getDefaultShortcutPlatform,
  )
  const [patternSettings, setPatternSettings] = useState<DesktopPatternSettings>(
    DEFAULT_DESKTOP_PATTERN_SETTINGS,
  )
  const [logoSettings, setLogoSettings] = useState<DesktopLogoSettings>(
    DEFAULT_DESKTOP_LOGO_SETTINGS,
  )
  const [cornersSettings, setCornersSettings] = useState<DesktopCornersSettings>(
    DEFAULT_DESKTOP_CORNERS_SETTINGS,
  )
  const [shapeSettings, setShapeSettings] = useState<DesktopShapeSettings>(
    DEFAULT_DESKTOP_SHAPE_SETTINGS,
  )
  const [motionSettings, setMotionSettings] = useState<DesktopMotionSettings>(
    DEFAULT_DESKTOP_MOTION_SETTINGS,
  )
  const [encodingSettings, setEncodingSettings] = useState<DesktopEncodingSettings>(
    DEFAULT_DESKTOP_ENCODING_SETTINGS,
  )
  const [imageSettings, setImageSettings] = useState<DesktopImageSettings>(
    DEFAULT_DESKTOP_IMAGE_SETTINGS,
  )
  const [decorationsSettings, setDecorationsSettings] = useState<DesktopDecorationsSettings>(
    DEFAULT_DESKTOP_DECORATIONS_SETTINGS,
  )
  const [effectsSettings, setEffectsSettings] = useState<DesktopEffectsSettings>(
    DEFAULT_DESKTOP_EFFECTS_SETTINGS,
  )
  const [layersSettings, setLayersSettings] = useState<DesktopLayersSettings>(
    DEFAULT_DESKTOP_LAYERS_SETTINGS,
  )
  const [exportSettings, setExportSettings] = useState<DesktopExportSettings>(
    DEFAULT_DESKTOP_EXPORT_SETTINGS,
  )
  const [textSettings, setTextSettings] = useState<DesktopTextSettings>(
    DEFAULT_DESKTOP_TEXT_SETTINGS,
  )
  const actualActiveTool = controller?.activeTool ?? activeTool
  const actualDesktopTheme = theme ?? desktopTheme
  const activeToolConfig = DESKTOP_TOOLBAR_TOOLS.find((tool) => tool.id === actualActiveTool)
  const [selectedContentType, setSelectedContentType] =
    useState<QrInputType>(DEFAULT_QR_INPUT_TYPE)
  const [contentValuesByType, setContentValuesByType] = useState<
    Partial<Record<QrInputType, StaticQrContentValues>>
  >(() => ({
    [DEFAULT_QR_INPUT_TYPE]: getDefaultStaticQrValues(DEFAULT_QR_INPUT_TYPE),
  }))
  const selectedContentValues =
    contentValuesByType[selectedContentType] ?? getDefaultStaticQrValues(selectedContentType)
  const selectedContentValue = useMemo(
    () => buildStaticQrPayload(selectedContentType, selectedContentValues),
    [selectedContentType, selectedContentValues],
  )
  const selectedContentValidation = useMemo(
    () => validateStaticQrContent(selectedContentType, selectedContentValues),
    [selectedContentType, selectedContentValues],
  )

  function handleContentTypeChange(type: QrInputType) {
    setSelectedContentType(type)
    setContentValuesByType((current) => {
      if (current[type]) {
        return current
      }

      return {
        ...current,
        [type]: getDefaultStaticQrValues(type),
      }
    })
  }

  function handleContentValueChange(field: string, value: StaticQrContentValue) {
    setContentValuesByType((current) => ({
      ...current,
      [selectedContentType]: {
        ...(current[selectedContentType] ?? getDefaultStaticQrValues(selectedContentType)),
        [field]: value,
      },
    }))
  }

  const actualPatternSettings = controller?.patternSettings ?? patternSettings
  const actualLogoSettings = controller?.logoSettings ?? logoSettings
  const actualCornersSettings = controller?.cornersSettings ?? cornersSettings
  const actualShapeSettings = controller?.shapeSettings ?? shapeSettings
  const actualMotionSettings = controller?.motionSettings ?? motionSettings
  const actualEncodingSettings = controller?.encodingSettings ?? encodingSettings
  const actualImageSettings = controller?.imageSettings ?? imageSettings
  const actualDecorationsSettings = controller?.decorationsSettings ?? decorationsSettings
  const actualEffectsSettings = controller?.effectsSettings ?? effectsSettings
  const actualLayersSettings = controller?.layersSettings ?? layersSettings
  const actualExportSettings = controller?.exportSettings ?? exportSettings
  const actualTextSettings = controller?.textSettings ?? textSettings
  const actualContentType = controller?.contentType ?? selectedContentType
  const actualContentValues = controller?.contentValues ?? selectedContentValues
  const actualEncodedContentValue = controller?.encodedContentValue ?? selectedContentValue
  const actualContentValidation = controller?.contentValidation ?? selectedContentValidation
  const onActiveToolChange = controller?.onActiveToolChange ?? setActiveTool
  const onPatternSettingsChange =
    controller?.onPatternSettingsChange ??
    ((patch: Partial<DesktopPatternSettings>) =>
      setPatternSettings((current) => ({ ...current, ...patch })))
  const onLogoSettingsChange =
    controller?.onLogoSettingsChange ??
    ((patch: Partial<DesktopLogoSettings>) =>
      setLogoSettings((current) => ({ ...current, ...patch })))
  const onCornersSettingsChange =
    controller?.onCornersSettingsChange ??
    ((patch: Partial<DesktopCornersSettings>) =>
      setCornersSettings((current) => ({ ...current, ...patch })))
  const onShapeSettingsChange =
    controller?.onShapeSettingsChange ??
    ((patch: Partial<DesktopShapeSettings>) =>
      setShapeSettings((current) => ({ ...current, ...patch })))
  const onMotionSettingsChange =
    controller?.onMotionSettingsChange ??
    ((patch: QrDotMatrixAnimationPatch) =>
      setMotionSettings((current) => ({
        ...current,
        ...patch,
        loader: (patch.loader ?? current.loader) as DesktopMotionSettings["loader"],
      })))
  const onEncodingSettingsChange =
    controller?.onEncodingSettingsChange ??
    ((patch: Partial<DesktopEncodingSettings>) =>
      setEncodingSettings((current) => ({ ...current, ...patch })))
  const onImageSettingsChange =
    controller?.onImageSettingsChange ??
    ((patch: Partial<DesktopImageSettings>) =>
      setImageSettings((current) => ({ ...current, ...patch })))
  const onDecorationsSettingsChange =
    controller?.onDecorationsSettingsChange ??
    ((patch: Partial<DesktopDecorationsSettings>) =>
      setDecorationsSettings((current) => ({ ...current, ...patch })))
  const onEffectsSettingsChange =
    controller?.onEffectsSettingsChange ??
    ((patch: Partial<DesktopEffectsSettings>) =>
      setEffectsSettings((current) => ({ ...current, ...patch })))
  const onLayersSettingsChange =
    controller?.onLayersSettingsChange ??
    ((patch: Partial<DesktopLayersSettings>) =>
      setLayersSettings((current) => ({ ...current, ...patch })))
  const onExportSettingsChange =
    controller?.onExportSettingsChange ??
    ((patch: Partial<DesktopExportSettings>) =>
      setExportSettings((current) => ({ ...current, ...patch })))
  const onTextSettingsChange =
    controller?.onTextSettingsChange ??
    ((patch: Partial<DesktopTextSettings>) =>
      setTextSettings((current) => ({ ...current, ...patch })))
  const onDesktopThemeChange =
    onThemeChange ??
    ((nextTheme: DesktopThemeMode) => {
      setDesktopTheme(nextTheme)
    })

  function handleDesktopThemeToggle() {
    onDesktopThemeChange(actualDesktopTheme === "light" ? "dark" : "light")
  }

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-label="Desktop workspace prototype"
        data-desktop-theme={actualDesktopTheme}
        data-slot="desktop-floating-toolbar-root"
        className={cn(
          "relative min-h-dvh overflow-hidden transition-colors duration-200",
          actualDesktopTheme === "light" ? "bg-[#f4f6f9]" : "bg-[#07080a]",
        )}
      >
        <DesktopThemeStyles />
        <DesktopUtilityToolbar
          data-slot="desktop-document-toolbar"
          className="fixed left-[25rem] top-5 z-30 max-md:left-4 max-md:top-4"
        >
          {onBack ? (
            <DesktopUtilityToolbarButton
              aria-label="Back to studio hub"
              data-slot="desktop-back-trigger"
              onClick={onBack}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={18}
                color="currentColor"
                strokeWidth={1.8}
              />
            </DesktopUtilityToolbarButton>
          ) : null}
          <DesktopUtilityToolbarButton
            aria-label="Save"
            data-slot="desktop-save-trigger"
            onClick={() => controller?.onSave?.()}
          >
            <HugeiconsIcon
              icon={SaveIcon}
              size={18}
              color="currentColor"
              strokeWidth={1.8}
            />
          </DesktopUtilityToolbarButton>
          <DesktopUtilityToolbarButton
            aria-label="Download"
            data-slot="desktop-download-trigger"
            onClick={() => controller?.onExportDownload?.()}
          >
            <HugeiconsIcon
              icon={Download02Icon}
              size={18}
              color="currentColor"
              strokeWidth={1.8}
            />
          </DesktopUtilityToolbarButton>
        </DesktopUtilityToolbar>
        <DesktopUtilityToolbar
          data-slot="desktop-utility-toolbar"
          className="fixed right-5 top-5 z-30 max-md:right-4 max-md:top-4"
        >
          <Popover>
            <PopoverTrigger asChild>
              <DesktopUtilityToolbarButton
                aria-label="Open keyboard shortcuts"
                data-slot="desktop-keyboard-shortcuts-trigger"
              >
                <HugeiconsIcon
                  icon={KeyboardIcon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.8}
                />
              </DesktopUtilityToolbarButton>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              data-slot="desktop-keyboard-shortcuts-popover"
              sideOffset={12}
              className="z-[20000] flex h-[min(44rem,calc(100dvh-7rem))] max-h-[min(44rem,calc(100dvh-7rem))] w-[min(27rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-[16px] border border-[#242424] bg-[#0a0a0a] p-0 text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
              style={
                {
                  "--desktop-inspector-field-bg": "#141414",
                  "--desktop-inspector-section-bg": "#181818",
                } as CSSProperties
              }
            >
              <div className="grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 px-4 pb-2 pt-3">
                <div
                  aria-label="Shortcut platform"
                  className="inline-flex gap-1"
                  data-slot="desktop-shortcut-platform-toggle"
                  role="group"
                >
                  {DESKTOP_SHORTCUT_PLATFORMS.map((platform) => {
                    const isSelected = shortcutPlatform === platform.value

	                    return (
	                      <button
	                        aria-label={`Use ${platform.label} shortcuts`}
	                        aria-pressed={isSelected}
	                        className={cn(
	                          "grid size-7 place-items-center rounded-full text-white/52 transition hover:bg-[#262626] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
	                          isSelected && "bg-[#303030] text-white",
	                        )}
	                        data-platform={platform.value}
	                        data-slot="desktop-shortcut-platform-button"
	                        key={platform.value}
	                        onClick={() => setShortcutPlatform(platform.value)}
	                        type="button"
	                      >
	                        <HugeiconsIcon
	                          icon={platform.icon}
	                          size={15}
	                          color="currentColor"
	                          strokeWidth={1.8}
	                        />
	                      </button>
	                    )
                  })}
                </div>
                <div className="min-w-0 text-center">
                  <h2 className="text-sm font-semibold text-white/92">Shortcuts</h2>
                </div>
                <span aria-hidden="true" className="w-[3.75rem]" />
              </div>
              <ScrollArea
                className="h-full min-h-0 flex-1 overflow-hidden"
                data-scrollbar-visibility="while-scrolling"
                data-slot="desktop-keyboard-shortcuts-scroll-area"
                scrollHideDelay={500}
                type="scroll"
              >
                <ScrollAreaViewport
                  className="h-full w-full overflow-x-hidden overflow-y-auto px-3 pb-3 pt-1 scroll-fade-effect-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  data-slot="desktop-keyboard-shortcuts-scroll"
                >
                  <div className="grid gap-2.5">
                    {DRAFTING_KEYBOARD_SHORTCUT_GROUPS.map((group) => (
                      <section
                        key={group.title}
                        aria-label={`${group.title} shortcuts`}
                        className={cn(DESKTOP_INSPECTOR_SECTION_CLASS, "p-2.5")}
                      >
                        <h3 className="px-1 pb-1.5 text-[11px] font-semibold text-white/64">
                          {group.title}
                        </h3>
                        <div className="grid gap-1">
                          {group.shortcuts.map(([keys, description]) => (
                            <div
                              key={keys}
                              className="grid grid-cols-[minmax(10rem,12.5rem)_1fr] items-center gap-3 rounded-[7px] px-2 py-1.5 text-[12px]"
                            >
                              <span
                                className="flex min-w-0 flex-wrap items-center gap-1.5 justify-self-start"
                                data-slot="desktop-shortcut-keycaps"
                              >
                                {getShortcutKeyCombos(keys, shortcutPlatform).map((combo, comboIndex) => (
                                  <span
                                    className="inline-flex items-center gap-1"
                                    key={`${keys}-${comboIndex}`}
                                  >
                                    {comboIndex > 0 ? (
                                      <span className="px-0.5 text-[10px] font-semibold text-white/34">
                                        /
                                      </span>
                                    ) : null}
                                    {combo.map((key, keyIndex) => (
                                      <span
                                        className="inline-flex items-center gap-1"
                                        key={`${keys}-${comboIndex}-${keyIndex}`}
                                      >
                                        {keyIndex > 0 ? (
                                          <span
                                            aria-hidden="true"
                                            className="text-[11px] font-semibold text-white/38"
                                            data-slot="desktop-shortcut-combo-separator"
                                          >
                                            +
                                          </span>
                                        ) : null}
                                        <Kbd
                                          className="border-[#333333] bg-[#202020] text-white/88 shadow-[0_3px_6px_-2px_rgba(0,0,0,0.25)]"
                                          data-slot="desktop-shortcut-kbd"
                                          size="md"
                                          variant="sculpted"
                                        >
                                          <CalligraphText>{key}</CalligraphText>
                                        </Kbd>
                                      </span>
                                    ))}
                                  </span>
                                ))}
                              </span>
                              <span className="min-w-0 text-white/58">{description}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar
                  className="w-2 border-none p-[1px]"
                  data-slot="desktop-keyboard-shortcuts-scrollbar"
                >
                  <ScrollAreaThumb
                    className="bg-white/24 hover:bg-white/38"
                    data-slot="desktop-keyboard-shortcuts-scroll-thumb"
                  />
                </ScrollAreaScrollbar>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <DesktopUtilityToolbarButton
            aria-label={`Switch to ${actualDesktopTheme === "light" ? "dark" : "light"} mode`}
            data-slot="desktop-theme-toggle"
            onClick={handleDesktopThemeToggle}
          >
            {actualDesktopTheme === "light" ? (
              <MoonIcon className="size-4" />
            ) : (
              <SunIcon className="size-4" />
            )}
          </DesktopUtilityToolbarButton>
        </DesktopUtilityToolbar>
        <div
          data-slot="desktop-action-toolbar"
          data-toolbar-appearance="desktop-glass"
          className="fixed bottom-4 left-[25rem] z-30 inline-flex min-h-14 items-center gap-1 rounded-full border border-white/[0.12] bg-black/55 px-3 py-1.5 text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl max-md:left-auto max-md:right-4"
        >
          <button
            aria-label="Reset defaults"
            className="grid size-8 place-items-center rounded-full text-current transition hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!controller?.onResetDefaults}
            type="button"
            onClick={controller?.onResetDefaults}
          >
            <RotateCcwIcon className="size-4" />
          </button>
          <button
            aria-label="Undo"
            className="grid size-8 place-items-center rounded-full text-current transition hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!controller?.canUndo || !controller.onUndo}
            type="button"
            onClick={controller?.onUndo}
          >
            <Undo2Icon className="size-4" />
          </button>
          <button
            aria-label="Redo"
            className="grid size-8 place-items-center rounded-full text-current transition hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!controller?.canRedo || !controller.onRedo}
            type="button"
            onClick={controller?.onRedo}
          >
            <Redo2Icon className="size-4" />
          </button>
        </div>
        <div
          data-slot="desktop-left-toolbar-shell"
          data-toolbar-appearance="desktop-glass"
          className="fixed bottom-5 left-5 top-5 z-[25] grid w-[23.75rem] grid-cols-[4.5rem_minmax(0,1fr)] overflow-hidden rounded-[20px] border border-white/[0.1] bg-black/55 text-white shadow-[0_24px_65px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl max-md:bottom-4 max-md:left-3 max-md:top-4 max-md:w-[min(20rem,calc(100vw-1.5rem))] max-md:grid-cols-[3.5rem_minmax(0,1fr)] max-md:rounded-[18px]"
        >
          <nav
            aria-label="Desktop tools"
            data-slot="desktop-floating-toolbar"
            className="relative flex min-h-0 min-w-0 flex-col items-center justify-start gap-1.5 overflow-x-hidden overflow-y-auto border-r border-white/[0.08] p-1.5 pt-14 text-[var(--desktop-toolbar-fg)] max-md:p-1 max-md:pt-12"
          >
            {DESKTOP_TOOLBAR_TOOLS.map((tool, index) => {
              const isActive = actualActiveTool === tool.id
              const previousGroup = DESKTOP_TOOLBAR_TOOLS[index - 1]?.group
              const startsGroup = index > 0 && tool.group !== previousGroup

              return (
                <div key={tool.id} className="flex flex-col items-center gap-1.5">
                  {startsGroup ? (
                    <span
                      aria-hidden="true"
                      data-slot="desktop-toolbar-separator"
                      className="my-1 h-px w-7 bg-white/[0.13]"
                    />
                  ) : null}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label={`Open ${tool.title}`}
                        aria-pressed={isActive}
                        data-desktop-tool-button="true"
                        data-tool-id={tool.id}
                        type="button"
                        className={cn(
                          "grid size-11 place-items-center rounded-full text-current transition-[background-color,color,box-shadow,transform] duration-150 ease-out outline-none hover:bg-white/[0.11] hover:text-[var(--desktop-toolbar-fg-hover)] focus-visible:ring-2 focus-visible:ring-white/45 active:scale-95 max-md:size-10",
                          isActive &&
                            "bg-white/[0.18] text-[var(--desktop-toolbar-fg-active)] shadow-none hover:bg-white/[0.2]",
                        )}
                        onClick={() => onActiveToolChange(tool.id)}
                      >
                        {tool.renderIcon()}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      hideArrow
                      side="right"
                      sideOffset={10}
                      className="border border-white/[0.12] bg-[#15161a] text-white shadow-xl"
                    >
                      {tool.title}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )
            })}
            {controller?.onInsertLayer && controller.insertNodeId ? (
              <div className="flex flex-col items-center gap-1.5">
                <span
                  aria-hidden="true"
                  data-slot="desktop-toolbar-separator"
                  className="my-1 h-px w-7 bg-white/[0.13]"
                />
                <InsertMenu
                  nodeId={controller.insertNodeId}
                  variant="toolbar"
                  onInsertLayer={controller.onInsertLayer}
                />
              </div>
            ) : null}
          </nav>

          {activeToolConfig || controller?.selectedElementLayer ? (
            <aside
              aria-label={
                controller?.selectedElementLayer
                  ? `${controller.selectedElementLayer.kind} element settings`
                  : `${activeToolConfig?.title ?? "Tool"} settings`
              }
              data-slot="desktop-floating-inspector"
              className="flex min-h-0 min-w-0 flex-col overflow-hidden"
            >
              {controller?.selectedElementLayer ? (
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  <ElementInspector
                    layer={controller.selectedElementLayer}
                    sliderVariant="desktop-elastic"
                    onPatch={(patch) => controller.onElementLayerPatch?.(patch)}
                  />
                </div>
              ) : actualActiveTool === "content" ? (
                <DesktopContentInspector
                  contentType={actualContentType}
                  contentValues={actualContentValues}
                  desktopTheme={actualDesktopTheme}
                  encodedValue={actualEncodedContentValue}
                  validation={actualContentValidation}
                  onContentTypeChange={controller?.onContentTypeChange ?? handleContentTypeChange}
                  onContentValueChange={controller?.onContentValueChange ?? handleContentValueChange}
                />
              ) : actualActiveTool === "pattern" ? (
                <DesktopPatternInspector
                  desktopTheme={actualDesktopTheme}
                  settings={actualPatternSettings}
                  onPatternSettingsChange={onPatternSettingsChange}
                />
              ) : actualActiveTool === "corners" ? (
                <DesktopCornersInspector
                  desktopTheme={actualDesktopTheme}
                  settings={actualCornersSettings}
                  onCornersSettingsChange={onCornersSettingsChange}
                />
              ) : actualActiveTool === "logo" ? (
                <DesktopLogoInspector
                  desktopTheme={actualDesktopTheme}
                  settings={actualLogoSettings}
                  onLogoSettingsChange={onLogoSettingsChange}
                />
              ) : actualActiveTool === "shape" ? (
                <DesktopShapeInspector
                  desktopTheme={actualDesktopTheme}
                  settings={actualShapeSettings}
                  onShapeSettingsChange={onShapeSettingsChange}
                />
              ) : actualActiveTool === "motion" ? (
                <DesktopMotionInspector
                  settings={actualMotionSettings}
                  onMotionSettingsChange={onMotionSettingsChange}
                />
              ) : actualActiveTool === "encoding" ? (
                <DesktopEncodingInspector
                  settings={actualEncodingSettings}
                  onEncodingSettingsChange={onEncodingSettingsChange}
                />
              ) : actualActiveTool === "text" ? (
                <DesktopTextInspector
                  settings={actualTextSettings}
                  onTextSettingsChange={onTextSettingsChange}
                />
              ) : actualActiveTool === "image" ? (
                <DesktopImageInspector
                  settings={actualImageSettings}
                  onImageSettingsChange={onImageSettingsChange}
                />
              ) : actualActiveTool === "decorations" ? (
                <DesktopDecorationsInspector
                  settings={actualDecorationsSettings}
                  onDecorationsSettingsChange={onDecorationsSettingsChange}
                />
              ) : actualActiveTool === "effects" ? (
                <DesktopEffectsInspector
                  settings={actualEffectsSettings}
                  onEffectsSettingsChange={onEffectsSettingsChange}
                />
              ) : actualActiveTool === "layers" ? (
                <DesktopLayersInspector
                  settings={actualLayersSettings}
                  onLayersSettingsChange={onLayersSettingsChange}
                />
              ) : actualActiveTool === "export" ? (
                <DesktopExportInspector
                  settings={actualExportSettings}
                  onExportDownload={controller?.onExportDownload ?? (() => undefined)}
                  onExportSettingsChange={onExportSettingsChange}
                />
              ) : activeToolConfig ? (
                <DesktopPlaceholderInspector tool={activeToolConfig} />
              ) : null}
            </aside>
          ) : null}
        </div>
      </section>
    </TooltipProvider>
  )
}

function DesktopThemeStyles() {
  return (
    <style>{`
      body:has([data-slot="desktop-floating-toolbar-root"]) {
        --desktop-inspector-fg-primary: rgba(255, 255, 255, 0.94);
        --desktop-inspector-fg-secondary: rgba(255, 255, 255, 0.72);
        --desktop-inspector-fg-tertiary: rgba(255, 255, 255, 0.56);
        --desktop-inspector-fg-muted: rgba(255, 255, 255, 0.42);
        --desktop-inspector-dropdown-bg: rgba(12, 12, 16, 0.9);
        --desktop-inspector-dropdown-border: rgba(255, 255, 255, 0.08);
        --desktop-inspector-control-hover-bg: rgba(255, 255, 255, 0.09);
        --desktop-inspector-option-selected-bg: rgba(255, 255, 255, 0.14);
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) {
        --desktop-inspector-fg-primary: rgba(15, 23, 42, 0.90);
        --desktop-inspector-fg-secondary: rgba(15, 23, 42, 0.62);
        --desktop-inspector-fg-tertiary: rgba(15, 23, 42, 0.48);
        --desktop-inspector-fg-muted: rgba(15, 23, 42, 0.38);
        --desktop-inspector-dropdown-bg: rgba(255, 255, 255, 0.84);
        --desktop-inspector-dropdown-border: rgba(15, 23, 42, 0.09);
        --desktop-inspector-control-hover-bg: rgba(15, 23, 42, 0.06);
        --desktop-inspector-option-selected-bg: rgba(15, 23, 42, 0.08);
      }

      [data-slot="desktop-inspector-filter-trigger"] {
        color: var(--desktop-inspector-fg-tertiary) !important;
      }

      [data-slot="desktop-inspector-filter-trigger"]:hover,
      [data-slot="desktop-inspector-filter-trigger"][data-state="open"] {
        color: var(--desktop-inspector-fg-secondary) !important;
      }

      [data-slot="desktop-inspector-filter-trigger"] span {
        color: inherit !important;
      }

      [data-slot="desktop-inspector-filter-menu"] {
        background-color: var(--desktop-inspector-dropdown-bg) !important;
        border-color: var(--desktop-inspector-dropdown-border) !important;
        color: var(--desktop-inspector-fg-secondary) !important;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14) !important;
        --tw-ring-color: transparent !important;
      }

      [data-slot="desktop-inspector-filter-menu"] [data-slot="dropdown-menu-radio-item"] {
        color: var(--desktop-inspector-fg-tertiary) !important;
      }

      [data-slot="desktop-inspector-filter-menu"] [data-slot="dropdown-menu-radio-item"]:is(:focus, [data-highlighted]) {
        background-color: var(--desktop-inspector-control-hover-bg) !important;
        color: var(--desktop-inspector-fg-secondary) !important;
      }

      [data-slot="desktop-inspector-filter-menu"] [data-slot="dropdown-menu-radio-item"][data-state="checked"] {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        color: var(--desktop-inspector-fg-secondary) !important;
      }

      [data-slot="desktop-inspector-filter-menu"] [data-slot="dropdown-menu-radio-item"][data-state="checked"]:is(:focus, [data-highlighted]) {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        color: var(--desktop-inspector-fg-secondary) !important;
      }

      [data-desktop-theme="light"] {
        color-scheme: light;
      }

      [data-desktop-theme="light"] [data-slot="desktop-left-toolbar-shell"],
      [data-desktop-theme="light"] [data-slot="desktop-document-toolbar"],
      [data-desktop-theme="light"] [data-slot="desktop-utility-toolbar"],
      [data-desktop-theme="light"] [data-slot="desktop-action-toolbar"] {
        background: rgba(255, 255, 255, 0.72) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        color: rgba(15, 23, 42, 0.68) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"] button:hover,
      [data-desktop-theme="light"] [data-slot="desktop-document-toolbar"] button:hover,
      [data-desktop-theme="light"] [data-slot="desktop-utility-toolbar"] button:hover,
      [data-desktop-theme="light"] [data-slot="desktop-action-toolbar"] button:hover {
        background: rgba(15, 23, 42, 0.08) !important;
        color: var(--desktop-toolbar-fg-hover) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"] {
        --desktop-toolbar-fg: rgba(15, 23, 42, 0.48);
        --desktop-toolbar-fg-hover: rgba(15, 23, 42, 0.62);
        --desktop-toolbar-fg-active: rgba(15, 23, 42, 0.90);
        color: var(--desktop-toolbar-fg) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"] button[aria-pressed="true"] {
        background: rgba(15, 23, 42, 0.11) !important;
        color: var(--desktop-toolbar-fg-active) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"] [class*="border-white"] {
        border-color: rgba(15, 23, 42, 0.11) !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] {
        background: #ffffff !important;
        border-color: #dedede !important;
        color: rgba(23, 23, 23, 0.92) !important;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.14) !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] div,
      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] section,
      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] kbd {
        border-color: #dddddd !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] section {
        background: #f4f4f4 !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] [data-slot="desktop-shortcut-platform-toggle"] {
        background: transparent !important;
        border-color: transparent !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] [data-slot="desktop-shortcut-platform-button"] {
        color: rgba(23, 23, 23, 0.52) !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] [data-slot="desktop-shortcut-platform-button"]:hover {
        background: #eeeeee !important;
        color: rgba(23, 23, 23, 0.86) !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] [data-slot="desktop-shortcut-platform-button"][aria-pressed="true"] {
        background: #e5e5e5 !important;
        color: rgba(23, 23, 23, 0.94) !important;
        box-shadow: none !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] kbd {
        background: #ffffff !important;
        color: rgba(23, 23, 23, 0.86) !important;
      }

      [data-slot="desktop-keyboard-shortcuts-scrollbar"][data-state="hidden"],
      [data-slot="desktop-shape-preset-shelf-scrollbar"][data-state="hidden"],
      [data-slot="desktop-corner-frame-preset-shelf-scrollbar"][data-state="hidden"],
      [data-slot="desktop-corner-dot-preset-shelf-scrollbar"][data-state="hidden"] {
        opacity: 0;
      }

      [data-slot="desktop-keyboard-shortcuts-scrollbar"],
      [data-slot="desktop-shape-preset-shelf-scrollbar"],
      [data-slot="desktop-corner-frame-preset-shelf-scrollbar"],
      [data-slot="desktop-corner-dot-preset-shelf-scrollbar"] {
        transition: opacity 150ms ease;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-scroll-thumb"] {
        background: rgba(23, 23, 23, 0.24) !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-scroll-thumb"]:hover {
        background: rgba(23, 23, 23, 0.38) !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] p,
      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] h3,
      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] span {
        color: rgba(23, 23, 23, 0.6) !important;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-keyboard-shortcuts-popover"] h2 {
        color: rgba(23, 23, 23, 0.92) !important;
      }

      [data-slot="desktop-style-preview-surface"] {
        background: rgba(255, 255, 255, 0.045) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        box-shadow: none !important;
      }

      [data-slot="desktop-floating-inspector"] [data-desktop-shape-option-preview="true"] {
        background: rgba(0, 0, 0, 0.88) !important;
        border-color: rgba(255, 255, 255, 0.18) !important;
        color: #f8fafc !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-style-preview-surface"] {
        background: rgba(255, 255, 255, 0.48) !important;
        border-color: rgba(15, 23, 42, 0.11) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-desktop-shape-option-preview="true"] {
        background: rgba(255, 255, 255, 0.86) !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
        color: #18181b !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-style-preview-surface"] svg {
        color: rgba(15, 23, 42, 0.9) !important;
      }

      [data-slot="desktop-floating-toolbar"] {
        --desktop-toolbar-fg: rgba(255, 255, 255, 0.56);
        --desktop-toolbar-fg-hover: rgba(255, 255, 255, 0.72);
        --desktop-toolbar-fg-active: rgba(255, 255, 255, 0.94);
        color: var(--desktop-toolbar-fg);
      }

      [data-slot="desktop-floating-toolbar"] button:hover {
        color: var(--desktop-toolbar-fg-hover);
      }

      [data-slot="desktop-floating-toolbar"] button[aria-pressed="true"] {
        color: var(--desktop-toolbar-fg-active);
      }

      [data-slot="desktop-floating-inspector"] {
        --desktop-inspector-fg-primary: rgba(255, 255, 255, 0.94);
        --desktop-inspector-fg-secondary: rgba(255, 255, 255, 0.72);
        --desktop-inspector-fg-tertiary: rgba(255, 255, 255, 0.56);
        --desktop-inspector-fg-muted: rgba(255, 255, 255, 0.42);
        --desktop-inspector-section-bg: rgba(255, 255, 255, 0.055);
        --desktop-inspector-header-bg: rgba(255, 255, 255, 0.025);
        --desktop-inspector-footer-bg: rgba(0, 0, 0, 0.18);
        --desktop-inspector-control-bg: transparent;
        --desktop-inspector-control-hover-bg: rgba(255, 255, 255, 0.09);
        --desktop-inspector-control-active-bg: rgba(255, 255, 255, 0.13);
        --desktop-inspector-control-border-hover: rgba(255, 255, 255, 0.12);
        --desktop-inspector-option-selected-bg: rgba(255, 255, 255, 0.14);
        --desktop-inspector-option-selected-border: #f8fafc;
        --desktop-inspector-option-selected-fg: rgba(255, 255, 255, 0.96);
        --desktop-inspector-field-bg: rgba(0, 0, 0, 0.22);
        --desktop-inspector-focus: rgba(255, 255, 255, 0.36);
        color: var(--desktop-inspector-fg-secondary);
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] {
        --desktop-inspector-fg-primary: rgba(15, 23, 42, 0.90);
        --desktop-inspector-fg-secondary: rgba(15, 23, 42, 0.62);
        --desktop-inspector-fg-tertiary: rgba(15, 23, 42, 0.48);
        --desktop-inspector-fg-muted: rgba(15, 23, 42, 0.38);
        --desktop-inspector-section-bg: rgba(15, 23, 42, 0.032);
        --desktop-inspector-header-bg: rgba(15, 23, 42, 0.025);
        --desktop-inspector-footer-bg: rgba(15, 23, 42, 0.045);
        --desktop-inspector-control-bg: transparent;
        --desktop-inspector-control-hover-bg: rgba(15, 23, 42, 0.1);
        --desktop-inspector-control-active-bg: rgba(15, 23, 42, 0.14);
        --desktop-inspector-control-border-hover: rgba(15, 23, 42, 0.16);
        --desktop-inspector-option-selected-bg: rgba(255, 255, 255, 0.96);
        --desktop-inspector-option-selected-border: #111827;
        --desktop-inspector-option-selected-fg: rgba(15, 23, 42, 0.94);
        --desktop-inspector-field-bg: rgba(255, 255, 255, 0.62);
        --desktop-inspector-focus: rgba(15, 23, 42, 0.36);
        color: var(--desktop-inspector-fg-secondary);
      }

      [data-slot="desktop-color-picker-popover"] {
        --color-picker-bg: rgba(23, 24, 29, 0.95);
        --color-picker-border: rgba(255, 255, 255, 0.1);
        --color-picker-fg: #ffffff;
        --color-picker-muted-fg: rgba(255, 255, 255, 0.64);
        --color-picker-control-bg: rgba(0, 0, 0, 0.22);
        --color-picker-control-hover-bg: rgba(255, 255, 255, 0.08);
        --color-picker-control-border: rgba(255, 255, 255, 0.12);
        --color-picker-focus: rgba(255, 255, 255, 0.38);
        --color-picker-highlight: rgba(255, 255, 255, 0.1);
        --color-picker-swatch-inner: rgba(255, 255, 255, 0.18);
        --desktop-color-picker-popover-bg: rgba(23, 24, 29, 0.95);
        --desktop-color-picker-popover-border: rgba(255, 255, 255, 0.1);
        --desktop-color-picker-popover-fg: #ffffff;
      }

      body:has([data-slot="desktop-floating-toolbar-root"][data-desktop-theme="light"]) [data-slot="desktop-color-picker-popover"] {
        --color-picker-bg: rgba(255, 255, 255, 0.96);
        --color-picker-border: rgba(15, 23, 42, 0.12);
        --color-picker-fg: #18181b;
        --color-picker-muted-fg: rgba(15, 23, 42, 0.58);
        --color-picker-control-bg: rgba(15, 23, 42, 0.04);
        --color-picker-control-hover-bg: rgba(15, 23, 42, 0.08);
        --color-picker-control-border: rgba(15, 23, 42, 0.12);
        --color-picker-focus: rgba(15, 23, 42, 0.34);
        --color-picker-highlight: rgba(255, 255, 255, 0.9);
        --color-picker-swatch-inner: rgba(15, 23, 42, 0.16);
        --desktop-color-picker-popover-bg: rgba(255, 255, 255, 0.96);
        --desktop-color-picker-popover-border: rgba(15, 23, 42, 0.12);
        --desktop-color-picker-popover-fg: #18181b;
      }

      [data-slot="desktop-floating-inspector"] :is(input, textarea, select) {
        background-color: var(--desktop-inspector-field-bg) !important;
        border-color: transparent !important;
        color: currentColor !important;
        box-shadow: none !important;
      }

      [data-slot="desktop-floating-inspector"] [data-slot="elastic-slider-label"] {
        color: var(--desktop-inspector-fg-secondary) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-slot="elastic-slider"] {
        --elastic-slider-bg: rgba(15, 23, 42, 0.035);
        --elastic-slider-fill: rgba(15, 23, 42, 0.052);
        --elastic-slider-fill-active: rgba(15, 23, 42, 0.085);
        --elastic-slider-hash: rgba(15, 23, 42, 0.13);
        --elastic-slider-handle: rgba(15, 23, 42, 0.46);
      }

      [data-slot="desktop-floating-inspector"] [data-slot="desktop-motion-toggle-track"][data-state="checked"] {
        background: #ffffff !important;
        border-color: #ffffff !important;
      }

      [data-slot="desktop-floating-inspector"] [data-slot="desktop-motion-toggle-track"][data-state="checked"] [data-slot="desktop-motion-toggle-thumb"] {
        background: #020617 !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-slot="desktop-motion-toggle-track"] {
        background: rgba(15, 23, 42, 0.1) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-slot="desktop-motion-toggle-track"][data-state="checked"] {
        background: #020617 !important;
        border-color: #020617 !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-slot="desktop-motion-toggle-track"][data-state="checked"] [data-slot="desktop-motion-toggle-thumb"],
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-slot="desktop-motion-toggle-track"][data-state="unchecked"] [data-slot="desktop-motion-toggle-thumb"] {
        background: #ffffff !important;
      }

      [data-slot="desktop-floating-inspector"] :is(input, textarea, select):focus,
      [data-slot="desktop-floating-inspector"] :is(input, textarea, select):focus-visible {
        border-color: transparent !important;
        box-shadow: inset 0 0 0 1px var(--desktop-inspector-focus) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] input::placeholder,
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] textarea::placeholder {
        color: var(--desktop-inspector-fg-muted) !important;
      }

      [data-slot="desktop-floating-inspector"] button {
        border-color: transparent !important;
      }

      [data-slot="desktop-floating-inspector"] button[aria-pressed="true"]:not([data-slot="desktop-motion-toggle-row"]):not([data-desktop-tool-button="true"]):not([data-desktop-preview-option="true"]):not([data-desktop-content-type-option="true"]):not([data-desktop-option-tile="true"]) {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        border-color: transparent !important;
        color: var(--desktop-inspector-option-selected-fg) !important;
        box-shadow: none !important;
      }

      [data-slot="desktop-floating-inspector"] button[aria-pressed="true"]:not([data-slot="desktop-motion-toggle-row"]):not([data-desktop-tool-button="true"]):not([data-desktop-preview-option="true"]):not([data-desktop-content-type-option="true"]):not([data-desktop-option-tile="true"]):hover {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        border-color: transparent !important;
        color: var(--desktop-inspector-option-selected-fg) !important;
        filter: none !important;
      }

      [data-slot="desktop-floating-inspector"] button:is([data-desktop-preview-option="true"], [data-desktop-content-type-option="true"], [data-desktop-option-tile="true"])[aria-pressed="true"] {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        border-color: var(--desktop-inspector-option-selected-border) !important;
      }

      [data-slot="desktop-floating-inspector"] button[aria-pressed="true"]:not([data-slot="desktop-motion-toggle-row"]):not([data-desktop-tool-button="true"]) :is(span, svg):not([data-desktop-preview-caption="true"]) {
        color: var(--desktop-inspector-option-selected-fg) !important;
      }

      [data-slot="desktop-floating-inspector"] button[data-desktop-preview-option="true"][aria-pressed="true"]:hover [data-desktop-adaptive-option-preview="true"] {
        filter: none !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] button[data-desktop-content-type-option="true"] {
        border-color: transparent !important;
        color: var(--desktop-inspector-fg-tertiary) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] button[data-desktop-content-type-option="true"]:hover {
        background-color: rgba(15, 23, 42, 0.06) !important;
        color: var(--desktop-inspector-fg-secondary) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] button:is([data-desktop-preview-option="true"], [data-desktop-content-type-option="true"], [data-desktop-option-tile="true"])[aria-pressed="true"] {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        border-color: var(--desktop-inspector-option-selected-border) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] button[aria-pressed="true"]:not([data-slot="desktop-motion-toggle-row"]):not([data-desktop-tool-button="true"]):not([data-desktop-preview-option="true"]):not([data-desktop-content-type-option="true"]):not([data-desktop-option-tile="true"]) {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        border-color: transparent !important;
        color: var(--desktop-inspector-option-selected-fg) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-export-download"] {
        background-color: #111827 !important;
        color: #ffffff !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-toolbar-separator"] {
        background-color: rgba(15, 23, 42, 0.11) !important;
      }

      [data-slot="desktop-left-toolbar-shell"] {
        background: rgba(0, 0, 0, 0.55) !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
        border-radius: 20px !important;
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
        backdrop-filter: blur(40px) !important;
      }

      [data-slot="desktop-left-toolbar-shell"] [data-slot="desktop-floating-toolbar"],
      [data-slot="desktop-left-toolbar-shell"] [data-slot="desktop-floating-inspector"] {
        background: transparent !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-left-toolbar-shell"] {
        background: rgba(255, 255, 255, 0.72) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-desktop-shape-option-preview="true"] {
        background: rgba(255, 255, 255, 0.86) !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
        color: #18181b !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-desktop-shape-option-preview="true"] svg {
        color: #18181b !important;
      }

      [data-slot="desktop-floating-inspector"] [data-desktop-adaptive-option-preview="true"] {
        background: transparent !important;
        border-color: transparent !important;
        color: #f8fafc !important;
      }

      [data-slot="desktop-floating-inspector"] [data-desktop-adaptive-option-preview="true"] svg {
        color: #f8fafc !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-desktop-adaptive-option-preview="true"] {
        background: transparent !important;
        border-color: transparent !important;
        color: #18181b !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-desktop-adaptive-option-preview="true"] svg {
        color: #18181b !important;
      }

      [data-slot="desktop-floating-inspector"] button[aria-pressed="true"]:not([data-slot="desktop-motion-toggle-row"]):not([data-desktop-tool-button="true"]):not([data-desktop-preview-option="true"]):not([data-desktop-content-type-option="true"]):not([data-desktop-option-tile="true"]) {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        border-color: transparent !important;
        color: var(--desktop-inspector-option-selected-fg) !important;
      }

      [data-slot="desktop-floating-inspector"] button[aria-pressed="true"]:not([data-slot="desktop-motion-toggle-row"]):not([data-desktop-tool-button="true"]):not([data-desktop-preview-option="true"]):not([data-desktop-content-type-option="true"]):not([data-desktop-option-tile="true"]):hover {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        border-color: transparent !important;
        color: var(--desktop-inspector-option-selected-fg) !important;
        filter: none !important;
      }

      [data-slot="desktop-floating-inspector"] button[data-desktop-preview-option="true"][aria-pressed="true"]:hover [data-desktop-adaptive-option-preview="true"] {
        filter: none !important;
      }

      [data-slot="desktop-floating-inspector"] [data-slot="desktop-color-picker"] {
        background-color: transparent !important;
        border-color: rgba(255, 255, 255, 0.18) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-slot="desktop-color-picker"] {
        border-color: rgba(15, 23, 42, 0.14) !important;
      }
    `}</style>
  )
}

function DesktopInspectorHeader({
  title,
}: {
  title: string
}) {
  return (
    <div className={DESKTOP_INSPECTOR_HEADER_CLASS}>
      <h2 className={DESKTOP_INSPECTOR_PANEL_TITLE_CLASS}>{title}</h2>
    </div>
  )
}

function DesktopInspectorScrollArea({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ScrollArea
      data-scrollbar-visibility="while-scrolling"
      data-slot="desktop-inspector-scroll-area"
      scrollHideDelay={500}
      type="scroll"
      className="min-h-0 flex-1 overflow-hidden"
    >
      <ScrollAreaViewport
        data-slot="desktop-inspector-scroll"
        className="h-full w-full overflow-x-hidden overflow-y-auto px-3 py-3 scroll-fade-effect-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ScrollAreaViewport>
      <ScrollAreaScrollbar
        data-slot="desktop-inspector-scrollbar"
        className="w-2 border-none p-[1px]"
      >
        <ScrollAreaThumb className="bg-white/24 hover:bg-white/38" />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}

function getDesktopAdaptiveOptionPreviewStyle(
  desktopTheme: DesktopThemeMode,
): CSSProperties {
  return {
    backgroundColor: "transparent",
    color: desktopTheme === "light" ? "#18181b" : "#f8fafc",
  }
}

function DesktopLogoInspector({
  desktopTheme,
  onLogoSettingsChange,
  settings,
}: {
  desktopTheme: DesktopThemeMode
  onLogoSettingsChange: (patch: Partial<DesktopLogoSettings>) => void
  settings: DesktopLogoSettings
}) {
  const [category, setCategory] = useState<BrandIconCategory | "all">("all")
  const [query, setQuery] = useState("")
  const activeCategoryLabel =
    DESKTOP_BRAND_ICON_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "All"
  const brandIcons = useMemo(
    () => filterBrandIcons(query, category).slice(0, 24),
    [category, query],
  )

  return (
    <div data-slot="desktop-logo-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Logo" />

      <DesktopInspectorScrollArea>
        <DesktopInspectorSection>
          <DesktopInspectorLabel>Source</DesktopInspectorLabel>
          <DesktopInspectorSegmentedControl
            columns={4}
            dataSlot="desktop-logo-source-mode"
            itemAriaLabel={(option) => `Use ${option.label} logo source`}
            itemClassName="px-1.5 text-[10px]"
            items={DESKTOP_LOGO_SOURCE_OPTIONS}
            value={settings.sourceMode}
            onValueChange={(sourceMode) => onLogoSettingsChange({ sourceMode })}
          />
        </DesktopInspectorSection>

        {settings.sourceMode === "brand" ? (
          <DesktopInspectorSection className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
            <div className="flex min-w-0 items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Filter logo icons"
                    className={cn(
                      "flex h-8 min-w-[92px] flex-1 items-center justify-between gap-2 rounded-full px-3 text-[12px] font-semibold",
                      DESKTOP_INSPECTOR_DROPDOWN_TRIGGER_CLASS,
                    )}
                    data-slot="desktop-inspector-filter-trigger desktop-logo-category-filter-trigger"
                    type="button"
                  >
                    <span className="min-w-0 truncate">{activeCategoryLabel}</span>
                    <ChevronDownIcon className={cn("size-3.5 shrink-0", DESKTOP_INSPECTOR_FG_MUTED)} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={cn("w-36", DESKTOP_INSPECTOR_DROPDOWN_MENU_CLASS)}
                  data-slot="desktop-inspector-filter-menu desktop-logo-category-filter-menu"
                >
                  <DropdownMenuRadioGroup
                    aria-label="Logo icon categories"
                    value={category}
                    onValueChange={(value) => setCategory(value as BrandIconCategory | "all")}
                  >
                    {DESKTOP_BRAND_ICON_CATEGORY_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        className={DESKTOP_INSPECTOR_DROPDOWN_ITEM_CLASS}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DesktopInspectorSearchInput
                aria-label="Search logo icons"
                placeholder="Search"
                value={query}
                onValueChange={setQuery}
              />
            </div>

            <div
              aria-label="Brand icons"
              className="mt-2 grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto pr-1"
              data-slot="desktop-logo-brand-icons"
            >
              {brandIcons.map((brandIcon) => (
                <DesktopBrandIconButton
                  key={brandIcon.id}
                  brandIcon={brandIcon}
                  selected={settings.selectedBrandIconId === brandIcon.id}
                  onClick={() => onLogoSettingsChange({ selectedBrandIconId: brandIcon.id })}
                />
              ))}
            </div>
          </DesktopInspectorSection>
        ) : null}

        {settings.sourceMode === "upload" || settings.sourceMode === "url" ? (
          <DesktopInspectorSection className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
            <DesktopInspectorLabel>Upload</DesktopInspectorLabel>
            <DesktopInspectorSegmentedControl
              dataSlot="desktop-logo-upload-mode"
              itemAriaLabel={(option) => `Use ${option.label} logo asset`}
              items={DESKTOP_ASSET_SOURCE_OPTIONS}
              value={settings.uploadMode}
              onValueChange={(uploadMode) => onLogoSettingsChange({ uploadMode })}
            />
            <DesktopInspectorTextInput
              aria-label="Remote logo URL"
              className="mt-2"
              placeholder="https://example.com/logo.png"
              value={settings.remoteUrl}
              onChange={(event) => onLogoSettingsChange({ remoteUrl: event.currentTarget.value })}
            />
          </DesktopInspectorSection>
        ) : null}

        {settings.sourceMode === "brand" ? (
          <DesktopInspectorSection className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS} dataSlot="desktop-logo-color">
            <DesktopInspectorLabel className="mb-3">
              Icon Color
            </DesktopInspectorLabel>
            <DesktopInspectorSegmentedControl
              dataSlot="desktop-logo-color-mode"
              itemAriaLabel={(option) => `Use ${option.value} logo color`}
              items={DESKTOP_CORNER_COLOR_MODES}
              value={settings.colorMode}
              onValueChange={(colorMode) => onLogoSettingsChange({ colorMode })}
            />
            {settings.colorMode === "solid" ? (
              <div className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
                <DesktopColorInputRow
                  label="Logo icon color"
                  value={settings.solidColor}
                  onChange={(solidColor) => onLogoSettingsChange({ solidColor })}
                />
              </div>
            ) : (
              <div className="mt-2.5 grid gap-2">
                <DesktopColorInputRow
                  label="Logo start color"
                  value={settings.gradient.colorStops[0].color}
                  onChange={(color) =>
                    onLogoSettingsChange({
                      gradient: updateDesktopGradientColor(settings.gradient, 0, color),
                    })
                  }
                />
                <DesktopColorInputRow
                  label="Logo end color"
                  value={settings.gradient.colorStops[1].color}
                  onChange={(color) =>
                    onLogoSettingsChange({
                      gradient: updateDesktopGradientColor(settings.gradient, 1, color),
                    })
                  }
                />
              </div>
            )}
          </DesktopInspectorSection>
        ) : null}

        {settings.sourceMode !== "none" ? (
          <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
            <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Size</p>
            <DesktopMotionSliderRow
              label="Logo size"
              max={100}
              min={0}
              value={settings.size}
              valueLabel={`${Math.round(settings.size)}%`}
              onChange={(size) => onLogoSettingsChange({ size })}
            />
            <div className="mt-2.5 grid gap-2">
              <DesktopNumberRow
                label="Logo margin"
                max={40}
                min={0}
                value={settings.margin}
                onChange={(margin) => onLogoSettingsChange({ margin })}
              />
              <DesktopMotionToggleRow
                checked={settings.hideBackgroundDots}
                label="Hide background dots"
                onChange={(hideBackgroundDots) => onLogoSettingsChange({ hideBackgroundDots })}
              />
              <DesktopMotionToggleRow
                checked={settings.saveAsBlob}
                label="Save embedded image as blob"
                onChange={(saveAsBlob) => onLogoSettingsChange({ saveAsBlob })}
              />
            </div>
          </section>
        ) : null}
      </DesktopInspectorScrollArea>

    </div>
  )
}

function DesktopBrandIconButton({
  brandIcon,
  onClick,
  selected,
}: {
  brandIcon: BrandIconEntry
  onClick: () => void
  selected: boolean
}) {
  const Icon = brandIcon.icon

  return (
      <button
        aria-label={`Use ${brandIcon.label} logo icon`}
        aria-pressed={selected}
        data-desktop-option-tile="true"
        className={cn(
          "relative grid h-12 min-w-0 place-items-center rounded-[7px] border-2 border-transparent bg-transparent text-[var(--desktop-inspector-fg-tertiary)] transition hover:border-[var(--desktop-inspector-control-border-hover)] hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-[var(--desktop-inspector-fg-primary)]",
          selected && DESKTOP_OPTION_CARD_SELECTED_CLASS,
        )}
      type="button"
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  )
}

function DesktopCornersInspector({
  desktopTheme,
  onCornersSettingsChange,
  settings,
}: {
  desktopTheme: DesktopThemeMode
  onCornersSettingsChange: (patch: Partial<DesktopCornersSettings>) => void
  settings: DesktopCornersSettings
}) {
  return (
    <div data-slot="desktop-corners-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Corners" />

      <div data-impeccable-variants="a34b4748" data-impeccable-variant-count="3" style={{ display: "contents" }}>
        {/* impeccable-variants-start a34b4748 */}
        {/* Original */}
        <div data-impeccable-variant="original" className="flex min-h-0 flex-1 flex-col">
          <DesktopInspectorScrollArea>
            <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
              <div className="mb-2 min-w-0">
                <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Corner Frame</p>
              </div>
              <ScrollArea
                className="h-80 overflow-hidden"
                data-scrollbar-visibility="while-scrolling"
                data-slot="desktop-corner-frame-preset-shelf-scroll-area"
                scrollHideDelay={500}
                type="scroll"
              >
                <ScrollAreaViewport
                  aria-label="Corner frame presets"
                  className="h-full w-full overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  data-slot="desktop-corner-frame-preset-shelf"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {CORNER_SQUARE_STYLE_OPTIONS.map((option) => (
                      <DesktopCornerStyleButton
                        desktopTheme={desktopTheme}
                        key={option.value}
                        label={option.label}
                        previewKind="corner-square"
                        selected={settings.cornerSquareType === option.value}
                        target="corner frame"
                        value={option.value}
                        onClick={() => onCornersSettingsChange({ cornerSquareType: option.value })}
                      />
                    ))}
                  </div>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar
                  className="w-2 border-none p-[1px]"
                  data-slot="desktop-corner-frame-preset-shelf-scrollbar"
                >
                  <ScrollAreaThumb
                    className="bg-neutral-500/45 hover:bg-neutral-500/60"
                    data-slot="desktop-corner-frame-preset-shelf-scroll-thumb"
                  />
                </ScrollAreaScrollbar>
              </ScrollArea>
            </section>

            <DesktopCornerColorSection
              dataSlot="desktop-corner-frame-color"
              gradient={settings.cornerSquareGradient}
              mode={settings.cornerSquareColorMode}
              solidColor={settings.cornerSquareSolidColor}
              target="corner frame"
              title="Frame Color"
              onGradientChange={(cornerSquareGradient) =>
                onCornersSettingsChange({ cornerSquareColorMode: "gradient", cornerSquareGradient })
              }
              onModeChange={(cornerSquareColorMode) =>
                onCornersSettingsChange({ cornerSquareColorMode })
              }
              onSolidColorChange={(cornerSquareSolidColor) =>
                onCornersSettingsChange({ cornerSquareColorMode: "solid", cornerSquareSolidColor })
              }
            />

            <section className={cn(DESKTOP_INSPECTOR_MAJOR_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
              <div className="mb-2 min-w-0">
                <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Corner Dot</p>
              </div>
              <ScrollArea
                className="h-80 overflow-hidden"
                data-scrollbar-visibility="while-scrolling"
                data-slot="desktop-corner-dot-preset-shelf-scroll-area"
                scrollHideDelay={500}
                type="scroll"
              >
                <ScrollAreaViewport
                  aria-label="Corner dot presets"
                  className="h-full w-full overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  data-slot="desktop-corner-dot-preset-shelf"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {CORNER_DOT_STYLE_OPTIONS.map((option) => (
                      <DesktopCornerStyleButton
                        desktopTheme={desktopTheme}
                        key={option.value}
                        label={option.label}
                        previewKind="corner-dot"
                        selected={settings.cornerDotType === option.value}
                        target="corner dot"
                        value={option.value}
                        onClick={() => onCornersSettingsChange({ cornerDotType: option.value })}
                      />
                    ))}
                  </div>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar
                  className="w-2 border-none p-[1px]"
                  data-slot="desktop-corner-dot-preset-shelf-scrollbar"
                >
                  <ScrollAreaThumb
                    className="bg-neutral-500/45 hover:bg-neutral-500/60"
                    data-slot="desktop-corner-dot-preset-shelf-scroll-thumb"
                  />
                </ScrollAreaScrollbar>
              </ScrollArea>
            </section>

            <DesktopCornerColorSection
              dataSlot="desktop-corner-dot-color"
              gradient={settings.cornerDotGradient}
              mode={settings.cornerDotColorMode}
              solidColor={settings.cornerDotSolidColor}
              target="corner dot"
              title="Dot Color"
              onGradientChange={(cornerDotGradient) =>
                onCornersSettingsChange({ cornerDotColorMode: "gradient", cornerDotGradient })
              }
              onModeChange={(cornerDotColorMode) =>
                onCornersSettingsChange({ cornerDotColorMode })
              }
              onSolidColorChange={(cornerDotSolidColor) =>
                onCornersSettingsChange({ cornerDotColorMode: "solid", cornerDotSolidColor })
              }
            />

            <div className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, "flex items-center justify-between gap-3 px-3 py-2.5", DESKTOP_INSPECTOR_SECTION_CLASS)}>
              <div className="flex min-w-0 items-center gap-2">
                <ShieldCheckIcon className={cn("size-4 shrink-0", DESKTOP_INSPECTOR_FG_MUTED)} />
                <div className="min-w-0">
                  <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Scan Safety</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200">
                Valid
              </span>
            </div>
          </DesktopInspectorScrollArea>
        </div>
        {/* Variants: insert below this line */}
        {/* impeccable-variants-end a34b4748 */}
      </div>

    </div>
  )
}

function DesktopCornerColorSection({
  dataSlot,
  gradient,
  mode,
  onGradientChange,
  onModeChange,
  onSolidColorChange,
  solidColor,
  target,
  title,
}: {
  dataSlot: string
  gradient: StudioGradient
  mode: DesktopCornerColorMode
  onGradientChange: (gradient: StudioGradient) => void
  onModeChange: (mode: DesktopCornerColorMode) => void
  onSolidColorChange: (color: string) => void
  solidColor: string
  target: "corner dot" | "corner frame"
  title: string
}) {
  const colorLabelPrefix = target === "corner frame" ? "Frame" : "Dot"

  return (
    <section
      className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}
      data-slot={dataSlot}
    >
      <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>{title}</p>

      <div className="grid grid-cols-2 gap-1.5">
        {DESKTOP_CORNER_COLOR_MODES.map((option) => (
          <button
            key={option.value}
            aria-label={`Use ${option.value} ${target} color`}
            aria-pressed={mode === option.value}
            className={cn(
              "h-8 px-2 text-[11px] font-semibold",
              DESKTOP_INSPECTOR_CONTROL_CLASS,
              mode === option.value && DESKTOP_INSPECTOR_SELECTED_CLASS,
            )}
            type="button"
            onClick={() => onModeChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mode === "solid" ? (
        <div className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
          <DesktopColorInputRow
            ariaLabel={`${colorLabelPrefix} solid color`}
            label="Solid color"
            value={solidColor}
            onChange={onSolidColorChange}
          />
        </div>
      ) : null}

      {mode === "gradient" ? (
        <div className="mt-2.5 grid gap-2">
          <DesktopColorInputRow
            ariaLabel={`${colorLabelPrefix} start color`}
            label="Start color"
            value={gradient.colorStops[0].color}
            onChange={(color) => onGradientChange(updateDesktopGradientColor(gradient, 0, color))}
          />
          <DesktopColorInputRow
            ariaLabel={`${colorLabelPrefix} end color`}
            label="End color"
            value={gradient.colorStops[1].color}
            onChange={(color) => onGradientChange(updateDesktopGradientColor(gradient, 1, color))}
          />
          <DesktopSegmentedRow
            label="Type"
            options={DESKTOP_GRADIENT_TYPE_OPTIONS}
            value={gradient.type}
            onChange={(type) => onGradientChange({ ...gradient, enabled: true, type })}
          />
        </div>
      ) : null}
    </section>
  )
}

function DesktopCornerStyleButton({
  color,
  desktopTheme,
  frameColor,
  frameStyle,
  label,
  onClick,
  previewKind,
  selected,
  target,
  value,
}: {
  color?: string
  desktopTheme: DesktopThemeMode
  frameColor?: string
  frameStyle?: QrFinderPatternOuterStyle
  label: string
  onClick: () => void
  previewKind: Extract<StylePreviewKind, "corner-dot" | "corner-square">
  selected: boolean
  target: "corner dot" | "corner frame"
  value: QrFinderPatternInnerStyle | QrFinderPatternOuterStyle
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-1.5">
      <button
        aria-label={`Use ${label} ${target}`}
        aria-pressed={selected}
        data-desktop-preview-option="true"
        className={cn(
          "relative aspect-square w-full min-w-0 rounded-[7px] border-2 border-transparent bg-transparent p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
          selected && DESKTOP_OPTION_CARD_SELECTED_CLASS,
        )}
        type="button"
        onClick={onClick}
      >
        <span
          aria-hidden="true"
          data-desktop-adaptive-option-preview="true"
          data-slot="desktop-style-preview-surface"
          className={cn(
            "grid size-full place-items-center overflow-hidden rounded-[6px] border-2 border-transparent bg-[#15161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition group-hover:brightness-110",
          )}
          style={getDesktopAdaptiveOptionPreviewStyle(desktopTheme)}
        >
          <span
            className="grid size-[68%] place-items-center [&_svg]:size-full [&_svg]:text-current"
          >
            <StylePreview
              color={color}
              frameColor={frameColor}
              frameStyle={frameStyle}
              previewKind={previewKind}
              value={value}
            />
          </span>
        </span>
      </button>
      <span
        data-desktop-preview-caption="true"
        className={cn("block w-full truncate px-0.5 text-center text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_TERTIARY)}
      >
        {label}
      </span>
    </div>
  )
}

function DesktopShapeInspector({
  desktopTheme,
  onShapeSettingsChange,
  settings,
}: {
  desktopTheme: DesktopThemeMode
  onShapeSettingsChange: (patch: Partial<DesktopShapeSettings>) => void
  settings: DesktopShapeSettings
}) {
  return (
    <div data-slot="desktop-shape-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Shape" />

      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <div className="mb-2 min-w-0">
            <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Shape Options</p>
          </div>
          <ScrollArea
            className="h-80 overflow-hidden"
            data-scrollbar-visibility="while-scrolling"
            data-slot="desktop-shape-preset-shelf-scroll-area"
            scrollHideDelay={500}
            type="scroll"
          >
            <ScrollAreaViewport
              aria-label="Shape options"
              className="h-full w-full overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              data-slot="desktop-shape-preset-shelf"
            >
              <div className="grid grid-cols-3 gap-2">
                <DesktopShapePresetButton
                  desktopTheme={desktopTheme}
                  label="None"
                  selected={settings.backgroundShapeId === "none"}
                  settings={settings}
                  shapeId="none"
                  onClick={() => onShapeSettingsChange({ backgroundShapeId: "none" })}
                />
                {QR_BACKGROUND_SHAPES.map((shape) => (
                  <DesktopShapePresetButton
                    desktopTheme={desktopTheme}
                    key={shape.id}
                    label={shape.label}
                    selected={settings.backgroundShapeId === shape.id}
                    settings={settings}
                    shapeId={shape.id}
                    onClick={() => onShapeSettingsChange({ backgroundShapeId: shape.id })}
                  />
                ))}
              </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar
              className="w-2 border-none p-[1px]"
              data-slot="desktop-shape-preset-shelf-scrollbar"
            >
              <ScrollAreaThumb
                className="bg-neutral-500/45 hover:bg-neutral-500/60"
                data-slot="desktop-shape-preset-shelf-scroll-thumb"
              />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)} data-slot="desktop-shape-color">
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Shape Color</p>

          <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-shape-color-mode">
            {DESKTOP_SHAPE_COLOR_MODES.map((mode) => (
              <button
                key={mode.value}
                aria-label={`Use ${mode.value} shape color`}
                aria-pressed={settings.shapeColorMode === mode.value}
                className={cn(
                  "h-8 px-2 text-[11px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.shapeColorMode === mode.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onShapeSettingsChange({ shapeColorMode: mode.value })}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {settings.shapeColorMode === "solid" ? (
            <div className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
              <DesktopColorInputRow
                ariaLabel="Shape solid color"
                label="Solid color"
                value={settings.shapeSolidColor}
                onChange={(shapeSolidColor) => onShapeSettingsChange({ shapeSolidColor })}
              />
            </div>
          ) : null}

          {settings.shapeColorMode === "gradient" ? (
            <div className={cn("mt-2.5 grid", DESKTOP_INSPECTOR_ROW_GAP_CLASS)}>
              <DesktopColorInputRow
                ariaLabel="Shape start color"
                label="Start color"
                value={settings.shapeGradient.colorStops[0].color}
                onChange={(color) =>
                  onShapeSettingsChange({
                    shapeGradient: updateDesktopGradientColor(settings.shapeGradient, 0, color),
                  })
                }
              />
              <DesktopColorInputRow
                ariaLabel="Shape end color"
                label="End color"
                value={settings.shapeGradient.colorStops[1].color}
                onChange={(color) =>
                  onShapeSettingsChange({
                    shapeGradient: updateDesktopGradientColor(settings.shapeGradient, 1, color),
                  })
                }
              />
              <DesktopSegmentedRow
                label="Type"
                options={DESKTOP_GRADIENT_TYPE_OPTIONS}
                value={settings.shapeGradient.type}
                onChange={(type) =>
                  onShapeSettingsChange({ shapeGradient: { ...settings.shapeGradient, type } })
                }
              />
            </div>
          ) : null}
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Frame</p>
          <div className="grid gap-2">
            <DesktopMotionToggleRow
              checked={settings.cardEnabled}
              label="Show shape"
              onChange={(cardEnabled) => onShapeSettingsChange({ cardEnabled })}
            />
            <DesktopElasticSliderRow
              label="Corner radius"
              max={64}
              min={0}
              value={settings.cardRadius}
              valueLabel={`${Math.round(settings.cardRadius)}`}
              onChange={(cardRadius) => onShapeSettingsChange({ cardRadius })}
            />
            <DesktopElasticSliderRow
              label="Padding"
              max={72}
              min={8}
              value={settings.padding}
              valueLabel={`${Math.round(settings.padding)}`}
              onChange={(padding) => onShapeSettingsChange({ padding })}
            />
            <DesktopElasticSliderRow
              label="Bottom space"
              max={240}
              min={0}
              value={settings.bottomSpace}
              valueLabel={`${Math.round(settings.bottomSpace)}`}
              onChange={(bottomSpace) => onShapeSettingsChange({ bottomSpace })}
            />
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Tilt</p>
          <div className="grid gap-2">
            <DesktopElasticSliderRow
              label="Horizontal tilt"
              max={60}
              min={-60}
              value={settings.shapeTiltX}
              valueLabel={`${Math.round(settings.shapeTiltX)}°`}
              onChange={(shapeTiltX) => onShapeSettingsChange({ shapeTiltX })}
            />
            <DesktopElasticSliderRow
              label="Vertical tilt"
              max={60}
              min={-60}
              value={settings.shapeTiltY}
              valueLabel={`${Math.round(settings.shapeTiltY)}°`}
              onChange={(shapeTiltY) => onShapeSettingsChange({ shapeTiltY })}
            />
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Fill</p>
          <DesktopColorInputRow
            label="Shape fill color"
            value={settings.cardFill}
            onChange={(cardFill) => onShapeSettingsChange({ cardFill })}
          />
          <div className="mt-2.5 grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1" data-slot="desktop-shape-patterns">
            <DesktopPatternSwatchButton
              label="None"
              selected={settings.cardPatternId === DRAFTING_CARD_PATTERN_NONE_ID}
              style={{ backgroundColor: settings.cardFill }}
              onClick={() => onShapeSettingsChange({ cardPatternId: DRAFTING_CARD_PATTERN_NONE_ID })}
            />
            {DRAFTING_CARD_PATTERNS.slice(0, 8).map((pattern) => (
              <DesktopPatternSwatchButton
                key={pattern.id}
                label={pattern.label}
                selected={settings.cardPatternId === pattern.id}
                style={getDraftingCardPatternStyle(pattern.id, {}) ?? pattern.style}
                onClick={() => onShapeSettingsChange({ cardPatternId: pattern.id })}
              />
            ))}
          </div>
        </section>

        <DesktopInspectorSection className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
          <DesktopInspectorLabel className="mb-3">Image</DesktopInspectorLabel>
          <DesktopInspectorSegmentedControl
            ariaLabelPrefix="Use"
            dataSlot="desktop-shape-image-source"
            items={DESKTOP_ASSET_SOURCE_OPTIONS}
            value={settings.cardImageSourceMode}
            onValueChange={(cardImageSourceMode) =>
              onShapeSettingsChange({ cardImageSourceMode })
            }
          />
          <DesktopInspectorTextInput
            aria-label="Shape image URL"
            className="mt-2"
            placeholder="https://example.com/shape.png"
            value={settings.cardImageUrl}
            onChange={(event) => onShapeSettingsChange({ cardImageUrl: event.currentTarget.value })}
          />
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            {(["cover", "contain"] as const).map((fit) => (
              <button
                key={fit}
                aria-label={`Use ${fit} shape image fit`}
                aria-pressed={settings.cardImageFit === fit}
                className={cn(
                  "h-8 px-2 text-[11px] font-semibold capitalize",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.cardImageFit === fit &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onShapeSettingsChange({ cardImageFit: fit })}
              >
                {fit}
              </button>
            ))}
          </div>
          <div className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
            <DesktopMotionSliderRow
              label="Image opacity"
              max={100}
              min={0}
              value={settings.cardImageOpacity}
              valueLabel={`${Math.round(settings.cardImageOpacity)}%`}
              onChange={(cardImageOpacity) => onShapeSettingsChange({ cardImageOpacity })}
            />
          </div>
        </DesktopInspectorSection>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Border</p>
          <div className="grid gap-2">
            <DesktopColorInputRow
              label="Shape border color"
              value={settings.borderColor}
              onChange={(borderColor) => onShapeSettingsChange({ borderColor })}
            />
            <DesktopElasticSliderRow
              label="Border width"
              max={24}
              min={0}
              value={settings.borderWidth}
              valueLabel={`${Math.round(settings.borderWidth)}`}
              onChange={(borderWidth) => onShapeSettingsChange({ borderWidth })}
            />
            <DesktopElasticSliderRow
              label="Border opacity"
              max={100}
              min={0}
              value={settings.borderOpacity}
              valueLabel={`${Math.round(settings.borderOpacity)}`}
              onChange={(borderOpacity) => onShapeSettingsChange({ borderOpacity })}
            />
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Shape Details</p>
          <div className="grid gap-2">
            <DesktopElasticSliderRow label="Shape padding" max={192} min={0} value={settings.shapePadding} valueLabel={`${Math.round(settings.shapePadding)}`} onChange={(shapePadding) => onShapeSettingsChange({ shapePadding })} />
            <DesktopColorInputRow label="Shape stroke color" value={settings.shapeStrokeColor} onChange={(shapeStrokeColor) => onShapeSettingsChange({ shapeStrokeColor })} />
            <DesktopElasticSliderRow label="Shape stroke width" max={24} min={0} value={settings.shapeStrokeWidth} valueLabel={`${Math.round(settings.shapeStrokeWidth)}`} onChange={(shapeStrokeWidth) => onShapeSettingsChange({ shapeStrokeWidth })} />
            <DesktopElasticSliderRow label="Shape stroke opacity" max={100} min={0} value={settings.shapeStrokeOpacity} valueLabel={`${Math.round(settings.shapeStrokeOpacity)}`} onChange={(shapeStrokeOpacity) => onShapeSettingsChange({ shapeStrokeOpacity })} />
            <DesktopColorInputRow label="Shape backing shadow color" value={settings.shapeShadowColor} onChange={(shapeShadowColor) => onShapeSettingsChange({ shapeShadowColor })} />
            <DesktopElasticSliderRow label="Shape shadow blur" max={32} min={0} value={settings.shapeShadowBlur} valueLabel={`${Math.round(settings.shapeShadowBlur)}`} onChange={(shapeShadowBlur) => onShapeSettingsChange({ shapeShadowBlur })} />
            <DesktopElasticSliderRow label="Shape shadow opacity" max={100} min={0} value={settings.shapeShadowOpacity} valueLabel={`${Math.round(settings.shapeShadowOpacity)}`} onChange={(shapeShadowOpacity) => onShapeSettingsChange({ shapeShadowOpacity })} />
            <DesktopElasticSliderRow label="Shape shadow X" max={64} min={-64} value={settings.shapeShadowOffsetX} valueLabel={`${Math.round(settings.shapeShadowOffsetX)}`} onChange={(shapeShadowOffsetX) => onShapeSettingsChange({ shapeShadowOffsetX })} />
            <DesktopElasticSliderRow label="Shape shadow Y" max={64} min={-64} value={settings.shapeShadowOffsetY} valueLabel={`${Math.round(settings.shapeShadowOffsetY)}`} onChange={(shapeShadowOffsetY) => onShapeSettingsChange({ shapeShadowOffsetY })} />
          </div>
        </section>
      </DesktopInspectorScrollArea>

    </div>
  )
}

function DesktopShapePresetButton({
  desktopTheme,
  label,
  onClick,
  selected,
  settings,
  shapeId,
}: {
  desktopTheme: DesktopThemeMode
  label: string
  onClick: () => void
  selected: boolean
  settings: DesktopShapeSettings
  shapeId: QrBackgroundShapeId
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-1.5">
      <button
        aria-label={`Use ${label} shape`}
        aria-pressed={selected}
        data-desktop-option-tile="true"
        className={cn(
          "relative aspect-square w-full min-w-0 rounded-[7px] border-2 border-transparent bg-transparent p-0 transition",
          DESKTOP_INSPECTOR_FOCUS_CLASS,
          selected && DESKTOP_OPTION_CARD_SELECTED_CLASS,
        )}
        type="button"
        onClick={onClick}
      >
        <DesktopShapePreview
          fillOverride="currentColor"
          label={label}
          previewStyle={getDesktopAdaptiveOptionPreviewStyle(desktopTheme)}
          settings={settings}
          shapeId={shapeId}
          className={cn(
            "size-full rounded-[6px] transition group-hover:brightness-110",
          )}
        />
      </button>
      <span
        data-desktop-preview-caption="true"
        className={cn("block w-full truncate px-0.5 text-center text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_TERTIARY)}
      >
        {label}
      </span>
    </div>
  )
}

function DesktopShapePreview({
  className,
  fillOverride,
  label,
  previewStyle,
  settings,
  shapeId,
}: {
  className?: string
  fillOverride?: string
  label: string
  previewStyle?: CSSProperties
  settings: DesktopShapeSettings
  shapeId: QrBackgroundShapeId
}) {
  const previewId = useId().replace(/:/g, "")
  const shape = shapeId === "none" ? null : QR_BACKGROUND_SHAPES.find((item) => item.id === shapeId)
  const gradientId = shape ? `desktop-shape-preview-${shape.id}-${previewId}` : undefined
  const gradientFill = gradientId ? `url(#${gradientId})` : undefined
  const shapeFill = fillOverride ?? (settings.shapeColorMode === "gradient" ? gradientFill : settings.shapeSolidColor)

  return (
    <span
      aria-hidden="true"
      data-desktop-adaptive-option-preview={fillOverride ? "true" : undefined}
      data-slot="desktop-style-preview-surface"
      className={cn(
        "grid place-items-center overflow-hidden border-2 border-transparent bg-[#15161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      style={previewStyle}
    >
      {shape ? (
        <svg
          className="size-[62%]"
          fill="none"
          style={{
            perspective: "600px",
            transform: `rotateX(${settings.shapeTiltY}deg) rotateY(${settings.shapeTiltX}deg)`,
            transformOrigin: "center center",
          }}
          viewBox={`0 0 ${shape.viewBox.width} ${shape.viewBox.height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {settings.shapeColorMode === "gradient" ? (
            <defs>
              {settings.shapeGradient.type === "radial" ? (
                <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                  {settings.shapeGradient.colorStops.map((stop) => (
                    <stop key={`${shape.id}-${stop.offset}`} offset={stop.offset} stopColor={stop.color} />
                  ))}
                </radialGradient>
              ) : (
                <linearGradient
                  id={gradientId}
                  x1="0%"
                  x2="100%"
                  y1="0%"
                  y2="100%"
                  gradientTransform={`rotate(${(settings.shapeGradient.rotation * 180) / Math.PI} .5 .5)`}
                >
                  {settings.shapeGradient.colorStops.map((stop) => (
                    <stop key={`${shape.id}-${stop.offset}`} offset={stop.offset} stopColor={stop.color} />
                  ))}
                </linearGradient>
              )}
            </defs>
          ) : null}
          <path d={shape.path} fill={shapeFill} />
        </svg>
      ) : (
        <span className={cn("flex size-[96%] items-center justify-center rounded-[7px] text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_MUTED)}>
          {label}
        </span>
      )}
    </span>
  )
}

function DesktopMotionInspector({
  onMotionSettingsChange,
  settings,
}: {
  onMotionSettingsChange: (patch: QrDotMatrixAnimationPatch) => void
  settings: DesktopMotionSettings
}) {
  return (
    <div data-slot="desktop-motion-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Motion" />

      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <DesktopMotionToggleRow
            checked={settings.enabled}
            label="Dot matrix motion"
            onChange={(enabled) => onMotionSettingsChange({ enabled })}
          />
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="mb-2 min-w-0">
            <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Loader</p>
          </div>
          <div
            aria-label="Motion loader presets"
            data-slot="desktop-motion-loader-shelf"
            className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1"
          >
            {QR_DOT_MATRIX_SQUARE_LOADER_OPTIONS.map((loader) => (
              <DesktopMotionLoaderButton
                key={loader.value}
                label={loader.label}
                selected={settings.loader === loader.value}
                onClick={() => onMotionSettingsChange({ loader: loader.value })}
              />
            ))}
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Timing</p>
          <div className="grid gap-3">
            <DesktopMotionSliderRow
              label="Speed"
              max={QR_DOT_MATRIX_ANIMATION_SPEED_MAX}
              min={QR_DOT_MATRIX_ANIMATION_SPEED_MIN}
              value={settings.speed}
              valueLabel={`${Math.round(settings.speed)}x`}
              onChange={(speed) => onMotionSettingsChange({ speed })}
            />
            <DesktopMotionSliderRow
              label="Matrix density"
              max={QR_DOT_MATRIX_MATRIX_SIZE_MAX}
              min={QR_DOT_MATRIX_MATRIX_SIZE_MIN}
              step={QR_DOT_MATRIX_MATRIX_SIZE_STEP}
              value={settings.matrixSize}
              valueLabel={`${Math.round(settings.matrixSize)}x${Math.round(settings.matrixSize)}`}
              onChange={(matrixSize) => onMotionSettingsChange({ matrixSize })}
            />
            <DesktopMotionSliderRow
              label="Overlay scale"
              max={QR_DOT_MATRIX_OVERLAY_SCALE_MAX}
              min={QR_DOT_MATRIX_OVERLAY_SCALE_MIN}
              value={settings.overlayScale}
              valueLabel={`${Math.round(settings.overlayScale)}%`}
              onChange={(overlayScale) => onMotionSettingsChange({ overlayScale })}
            />
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Loader Color</p>
          <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-motion-color-presets">
            {QR_DOT_MATRIX_COLOR_PRESET_OPTIONS.map((preset) => (
              <DesktopMotionColorPresetButton
                key={preset.value}
                colors={
                  preset.value === "theme"
                    ? [settings.customColorBase, settings.customColorMid, settings.customColorPeak]
                    : DESKTOP_MOTION_COLOR_SWATCHES[preset.value]
                }
                label={preset.label}
                selected={settings.colorPreset === preset.value}
                onClick={() => onMotionSettingsChange({ colorPreset: preset.value })}
              />
            ))}
          </div>

          {settings.colorPreset === "theme" ? (
            <div className="mt-2.5 grid gap-2">
              <DesktopColorInputRow
                label="Motion base color"
                value={settings.customColorBase}
                onChange={(customColorBase) =>
                  onMotionSettingsChange({ customColor: customColorBase, customColorBase })
                }
              />
              <DesktopColorInputRow
                label="Motion mid color"
                value={settings.customColorMid}
                onChange={(customColorMid) => onMotionSettingsChange({ customColorMid })}
              />
              <DesktopColorInputRow
                label="Motion peak color"
                value={settings.customColorPeak}
                onChange={(customColorPeak) => onMotionSettingsChange({ customColorPeak })}
              />
            </div>
          ) : null}
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Output</p>
          <div className="grid gap-2">
            <DesktopMotionToggleRow
              checked={settings.animated}
              label="Animated preview"
              onChange={(animated) => onMotionSettingsChange({ animated })}
            />
            <DesktopMotionToggleRow
              checked={settings.exportAnimatedSvg}
              label="Animated SVG export"
              onChange={(exportAnimatedSvg) => onMotionSettingsChange({ exportAnimatedSvg })}
            />
          </div>
        </section>
      </DesktopInspectorScrollArea>

    </div>
  )
}

function DesktopMotionToggleRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
	    <button
	      aria-label={label}
	      aria-pressed={checked}
	      data-slot="desktop-motion-toggle-row"
	      className={cn(
	        DESKTOP_INSPECTOR_ROW_CLASS,
	        "w-full rounded-[6px] bg-transparent text-left text-[var(--desktop-inspector-fg-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]",
	      )}
	      type="button"
	      onClick={() => onChange(!checked)}
	    >
	      <span className="min-w-0">
        <span className={cn("block truncate text-[12px] font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>{label}</span>
      </span>
	      <span
	        aria-hidden="true"
	        data-state={checked ? "checked" : "unchecked"}
	        data-slot="desktop-motion-toggle-track"
	        className={cn(
	          "relative h-5 w-9 shrink-0 rounded-full border border-white/[0.12] bg-white/[0.12] transition-colors",
	          checked && "border-white bg-white",
	        )}
	      >
	        <span
	          data-slot="desktop-motion-toggle-thumb"
	          className={cn(
	            "absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.24)] transition-[background-color,transform]",
	            checked && "translate-x-4 bg-black",
	          )}
	        />
	      </span>
	    </button>
  )
}

function DesktopMotionSliderRow({
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
  valueLabel,
}: {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step?: number
  value: number
  valueLabel: string
}) {
  return (
    <DesktopElasticSliderRow
      ariaLabel={`Motion ${label.toLowerCase()}`}
      label={label}
      max={max}
      min={min}
      step={step}
      value={value}
      valueLabel={valueLabel}
      onChange={onChange}
    />
  )
}

function DesktopElasticSliderRow({
  ariaLabel,
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
  valueLabel,
}: {
  ariaLabel?: string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step?: number
  value: number
  valueLabel: string
}) {
  return (
    <div
      data-slot="desktop-elastic-slider-row"
      className="grid min-w-0 py-1.5"
    >
      <div data-slot="desktop-elastic-slider">
        <ElasticSlider
          aria-label={ariaLabel ?? label}
          className={DESKTOP_ELASTIC_SLIDER_CLASS}
          formatValue={() => valueLabel}
          label={label}
          max={max}
          min={min}
          step={step}
          value={value}
          onValueChange={onChange}
        />
      </div>
    </div>
  )
}

function DesktopMotionLoaderButton({
  label,
  onClick,
  selected,
}: {
  label: string
  onClick: () => void
  selected: boolean
}) {
  return (
      <button
        aria-label={`Use ${label} motion loader`}
        aria-pressed={selected}
      className={cn(
        "relative h-10 min-w-0 px-2.5 text-left",
        DESKTOP_INSPECTOR_CONTROL_CLASS,
        selected && DESKTOP_INSPECTOR_SELECTED_CLASS,
      )}
      type="button"
      onClick={onClick}
    >
      <span className={cn("block max-w-[calc(100%-1.25rem)] truncate text-[11px] font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
        {label}
      </span>
    </button>
  )
}

function DesktopMotionColorPresetButton({
  colors,
  label,
  onClick,
  selected,
}: {
  colors: string[]
  label: string
  onClick: () => void
  selected: boolean
}) {
  return (
      <button
        aria-label={`Use ${label} motion colors`}
        aria-pressed={selected}
      className={cn(
        "relative flex h-9 min-w-0 items-center gap-2 px-2 text-left",
        DESKTOP_INSPECTOR_CONTROL_CLASS,
        selected && DESKTOP_INSPECTOR_SELECTED_CLASS,
      )}
      type="button"
      onClick={onClick}
    >
      <span className="flex shrink-0 -space-x-1">
        {colors.map((color, index) => (
          <span
            key={`${label}-${color}-${index}`}
            aria-hidden="true"
            className="size-4 rounded-full border border-black/35"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <span className={cn("min-w-0 flex-1 truncate text-[11px] font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
        {label}
      </span>
    </button>
  )
}

function DesktopPatternPalettePresetButton({
  colors,
  label,
  onClick,
  selected,
}: {
  colors: string[]
  label: string
  onClick: () => void
  selected: boolean
}) {
  return (
    <button
      aria-label={`Use ${label} pattern palette`}
      aria-pressed={selected}
      className={cn(
        "relative flex h-9 min-w-0 items-center gap-2 px-2 text-left",
        DESKTOP_INSPECTOR_CONTROL_CLASS,
        selected && DESKTOP_INSPECTOR_SELECTED_CLASS,
      )}
      type="button"
      onClick={onClick}
    >
      <span className="flex shrink-0 -space-x-1">
        {colors.map((color, index) => (
          <span
            key={`${label}-${color}-${index}`}
            aria-hidden="true"
            className="size-4 rounded-full border border-black/35"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <span className={cn("min-w-0 flex-1 truncate text-[11px] font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
        {label}
      </span>
    </button>
  )
}

function DesktopContentInspector({
  contentType,
  contentValues,
  desktopTheme,
  encodedValue,
  onContentTypeChange,
  onContentValueChange,
  validation,
}: {
  contentType: QrInputType
  contentValues: StaticQrContentValues
  desktopTheme: DesktopThemeMode
  encodedValue: string
  onContentTypeChange: (type: QrInputType) => void
  onContentValueChange: (field: string, value: StaticQrContentValue) => void
  validation: ReturnType<typeof validateStaticQrContent>
}) {
  const [collectionId, setCollectionId] = useState<DesktopContentCollectionId>("popular")
  const [query, setQuery] = useState("")
  const activeCollectionLabel =
    DESKTOP_CONTENT_FILTER_OPTIONS.find((collection) => collection.id === collectionId)?.label ?? "Popular"
  const visibleTypes = useMemo(() => {
    const collectionTypes =
      collectionId === "all"
        ? DESKTOP_ALL_CONTENT_TYPES
        : (DESKTOP_CONTENT_COLLECTIONS.find((collection) => collection.id === collectionId)?.types ??
          DESKTOP_CONTENT_PRESET_TYPES)
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return collectionTypes
    }

    return collectionTypes.filter((type) => {
      const option = QR_INPUT_OPTIONS[type]
      const meta = STATIC_QR_CONTENT_META[type]

      return `${option.label} ${meta.title} ${meta.description}`
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [collectionId, query])

  return (
    <div data-slot="desktop-content-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Content" />

      <DesktopInspectorScrollArea>
        <DesktopInspectorSection dataSlot="desktop-content-type-section">
          <div className="min-w-0">
            <div
              className="flex h-9 w-full min-w-0 items-center gap-2"
              data-slot="desktop-content-filter-search-row"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Filter QR types"
                    className={cn(
                      "flex h-full min-w-[84px] max-w-24 shrink-0 items-center justify-between gap-2 rounded-[7px] px-3 text-[12px] font-semibold",
                      DESKTOP_INSPECTOR_DROPDOWN_TRIGGER_CLASS,
                    )}
                    data-slot="desktop-inspector-filter-trigger desktop-content-type-filter-trigger"
                    type="button"
                  >
                    <span className="min-w-0 truncate">{activeCollectionLabel}</span>
                    <ChevronDownIcon className={cn("size-3.5 shrink-0", DESKTOP_INSPECTOR_FG_MUTED)} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={cn("w-32", DESKTOP_INSPECTOR_DROPDOWN_MENU_CLASS)}
                  data-slot="desktop-inspector-filter-menu desktop-content-type-filter-menu"
                >
                  <DropdownMenuRadioGroup
                    aria-label="QR type filters"
                    value={collectionId}
                    onValueChange={(value) => setCollectionId(value as DesktopContentCollectionId)}
                  >
                    {DESKTOP_CONTENT_FILTER_OPTIONS.map((collection) => (
                      <DropdownMenuRadioItem
                        key={collection.id}
                        className={DESKTOP_INSPECTOR_DROPDOWN_ITEM_CLASS}
                        value={collection.id}
                      >
                        {collection.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DesktopInspectorSearchInput
                aria-label="Search QR types"
                className="h-full min-w-0 flex-1 shrink self-stretch"
                iconClassName="left-2.5"
                inputClassName="rounded-[7px] pr-3"
                placeholder="Search"
                value={query}
                onValueChange={setQuery}
              />
            </div>
          </div>

          <ScrollArea
            className="mt-3 h-[180px] overflow-hidden"
            data-scrollbar-visibility="while-scrolling"
            data-slot="desktop-content-type-collection-scroll-area"
            scrollHideDelay={500}
            type="scroll"
          >
            <ScrollAreaViewport
              className="h-full w-full overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              data-slot="desktop-content-type-collection-scroll"
            >
              <div className="grid grid-cols-3 gap-1.5" data-slot="desktop-content-type-collection">
                {visibleTypes.map((type) => {
                const option = QR_INPUT_OPTIONS[type]
                const Icon = option.icon
                const isSelected = contentType === type

                return (
                  <button
                    key={type}
                    aria-label={`Use ${option.label} content`}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative flex h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-[7px] border-2 border-transparent bg-transparent px-1 text-[10px] font-semibold text-[var(--desktop-inspector-fg-tertiary)] transition hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-[var(--desktop-inspector-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
                      isSelected && DESKTOP_OPTION_CARD_SELECTED_CLASS,
                    )}
                    data-desktop-content-type-option="true"
                    type="button"
                    onClick={() => onContentTypeChange(type)}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="max-w-full truncate">{option.label}</span>
                  </button>
                )
              })}
                {visibleTypes.length === 0 ? (
                  <p className={cn("col-span-3 px-1 py-3 text-center text-[11px]", DESKTOP_INSPECTOR_FG_MUTED)}>
                    No QR types found
                  </p>
                ) : null}
              </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar
              className="w-2 border-none p-[1px]"
              data-slot="desktop-content-type-collection-scrollbar"
            >
              <ScrollAreaThumb
                className={cn(
                  desktopTheme === "light"
                    ? "bg-slate-950/15 hover:bg-slate-950/25"
                    : "bg-white/24 hover:bg-white/38",
                )}
                data-slot="desktop-content-type-collection-scroll-thumb"
              />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </DesktopInspectorSection>

        <div className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <DesktopContentFields
            contentType={contentType}
            contentValues={contentValues}
            validation={validation}
            onContentValueChange={onContentValueChange}
          />
        </div>

        <details className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, "px-3 py-2.5", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <summary className={cn("cursor-pointer select-none text-[12px] font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
            Encoded value
          </summary>
          <pre className={cn("mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-[6px] bg-black/24 p-2.5 text-[11px] leading-4", DESKTOP_INSPECTOR_FG_TERTIARY)}>
            {encodedValue || "No payload yet"}
          </pre>
        </details>
      </DesktopInspectorScrollArea>

    </div>
  )
}

function DesktopPatternInspector({
  desktopTheme,
  onPatternSettingsChange,
  settings,
}: {
  desktopTheme: DesktopThemeMode
  onPatternSettingsChange: (patch: Partial<DesktopPatternSettings>) => void
  settings: DesktopPatternSettings
}) {
  return (
    <div data-slot="desktop-pattern-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Pattern" />

      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <div className="mb-2 min-w-0">
            <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Module Pattern</p>
          </div>
          <div
            aria-label="Module pattern presets"
            data-slot="desktop-pattern-preset-shelf"
            className="grid grid-cols-3 gap-2"
          >
            {DOT_STYLE_OPTIONS.map((option) => (
              <DesktopModulePatternButton
                desktopTheme={desktopTheme}
                key={option.value}
                label={option.label}
                selected={settings.qrDotType === option.value}
                value={option.value}
                onClick={() => onPatternSettingsChange({ qrDotType: option.value })}
              />
            ))}
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)} data-slot="desktop-module-color">
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Module Color</p>

          <div className="grid grid-cols-3 gap-1.5" data-slot="desktop-pattern-color-mode">
            {DESKTOP_DOTS_COLOR_MODES.map((mode) => (
              <button
                key={mode.value}
                aria-label={`Use ${mode.label} module color`}
                aria-pressed={settings.dotsColorMode === mode.value}
                className={cn(
                  "h-8 px-2 text-[11px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.dotsColorMode === mode.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onPatternSettingsChange({ dotsColorMode: mode.value })}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {settings.dotsColorMode === "solid" ? (
            <div className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
              <DesktopColorInputRow
                label="Solid color"
                value={settings.dotsSolidColor}
                onChange={(dotsSolidColor) => onPatternSettingsChange({ dotsSolidColor })}
              />
            </div>
          ) : null}

          {settings.dotsColorMode === "gradient" ? (
            <div className="mt-2.5 grid gap-2">
              <DesktopColorInputRow
                ariaLabel="Start color"
                label="Start color"
                value={settings.dataModulesGradient.colorStops[0].color}
                onChange={(color) =>
                  onPatternSettingsChange({
                    dataModulesGradient: updateDesktopGradientColor(settings.dataModulesGradient, 0, color),
                  })
                }
              />
              <DesktopColorInputRow
                ariaLabel="End color"
                label="End color"
                value={settings.dataModulesGradient.colorStops[1].color}
                onChange={(color) =>
                  onPatternSettingsChange({
                    dataModulesGradient: updateDesktopGradientColor(settings.dataModulesGradient, 1, color),
                  })
                }
              />
              <DesktopSegmentedRow
                label="Type"
                options={DESKTOP_GRADIENT_TYPE_OPTIONS}
                value={settings.dataModulesGradient.type}
                onChange={(type) =>
                  onPatternSettingsChange({ dataModulesGradient: { ...settings.dataModulesGradient, type } })
                }
              />
            </div>
          ) : null}

          {settings.dotsColorMode === "palette" ? (
            <div className="mt-2.5 grid gap-2">
              <div className={cn(DESKTOP_INSPECTOR_ROW_CLASS, "border-b border-white/[0.07] py-2.5 last:border-b-0")}>
                <span className={DESKTOP_INSPECTOR_LABEL_CLASS}>Palette</span>
                <span className="flex min-w-0 flex-wrap justify-end gap-2">
                  {settings.dotsPalette.map((color, index) => (
                    <DesktopColorSwatchPicker
                      ariaLabel={`Pattern color ${index + 1}`}
                      key={`${color}-${index}`}
                      value={color}
                      onChange={(nextColor) =>
                        onPatternSettingsChange({
                          dotsPalette: settings.dotsPalette.map((currentColor, currentIndex) =>
                            currentIndex === index ? nextColor : currentColor,
                          ),
                        })
                      }
                    />
                  ))}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-pattern-palette-presets">
                {DESKTOP_DOTS_PALETTE_PRESETS.map((preset) => (
                  <DesktopPatternPalettePresetButton
                    colors={preset.colors}
                    key={preset.label}
                    label={preset.label}
                    selected={areDesktopColorPalettesEqual(settings.dotsPalette, preset.colors)}
                    onClick={() => onPatternSettingsChange({ dotsPalette: [...preset.colors] })}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <div className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, "flex items-center justify-between gap-3 px-3 py-2.5", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheckIcon className={cn("size-4 shrink-0", DESKTOP_INSPECTOR_FG_MUTED)} />
            <div className="min-w-0">
              <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Scan Safety</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200">
            Valid
          </span>
        </div>
      </DesktopInspectorScrollArea>

    </div>
  )
}

function DesktopModulePatternButton({
  desktopTheme,
  label,
  onClick,
  selected,
  value,
}: {
  desktopTheme: DesktopThemeMode
  label: string
  onClick: () => void
  selected: boolean
  value: StudioDataModulesStyle
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-1.5">
      <button
        aria-label={`Use ${label} pattern`}
        aria-pressed={selected}
        data-desktop-preview-option="true"
        className={cn(
          "relative aspect-square w-full min-w-0 rounded-[7px] border-2 border-transparent bg-transparent p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
          selected && DESKTOP_OPTION_CARD_SELECTED_CLASS,
        )}
        type="button"
        onClick={onClick}
      >
        <DesktopQrDotPreview
          value={value}
          className={cn(
            "size-full rounded-[6px] transition group-hover:brightness-110",
          )}
          style={getDesktopAdaptiveOptionPreviewStyle(desktopTheme)}
        />
      </button>
      <span
        data-desktop-preview-caption="true"
        className={cn("block w-full truncate px-0.5 text-center text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_TERTIARY)}
      >
        {label}
      </span>
    </div>
  )
}

function DesktopQrDotPreview({
  className,
  style,
  value,
}: {
  className?: string
  style?: CSSProperties
  value: StudioDataModulesStyle
}) {
  return (
    <span
      aria-hidden="true"
      data-desktop-adaptive-option-preview="true"
      data-slot="desktop-style-preview-surface"
      className={cn(
        "grid place-items-center overflow-hidden border-2 border-transparent bg-[#15161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      style={style}
    >
      <span className="grid size-[78%] place-items-center [&_svg]:size-full [&_svg]:text-current">
        <StylePreview previewKind="dots" value={value} />
      </span>
    </span>
  )
}

function DesktopColorInputRow({
  ariaLabel,
  label,
  onChange,
  value,
}: {
  ariaLabel?: string
  label: string
  onChange: (value: string) => void
  value: string
}) {
  const inputLabel = ariaLabel ?? label

  return (
    <div className={DESKTOP_INSPECTOR_ROW_CLASS}>
      <span className={DESKTOP_INSPECTOR_LABEL_CLASS}>{label}</span>
      <span className="flex items-center gap-2">
        <DesktopColorSwatchPicker
          ariaLabel={`${inputLabel} swatch`}
          value={value}
          onChange={onChange}
        />
        <DesktopInspectorTextInput
          aria-label={inputLabel}
          className="h-7 w-20 rounded-[5px] px-2 text-[11px] font-semibold"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </span>
    </div>
  )
}

function DesktopColorSwatchPicker({
  ariaLabel,
  onChange,
  value,
}: {
  ariaLabel: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <span
      className="grid size-7 shrink-0 place-items-center rounded-full border-2 bg-transparent p-0.5"
      style={{ borderColor: value }}
    >
      <DesktopColorPickerPopover
        aria-label={ariaLabel}
        triggerClassName="size-5 shrink-0 border-0"
        value={value}
        onChange={onChange}
      />
    </span>
  )
}

function DesktopColorPickerPopover({
  ariaLabel,
  "aria-label": ariaLabelProp,
  onChange,
  triggerClassName,
  value,
}: {
  ariaLabel?: string
  "aria-label"?: string
  onChange: (value: string) => void
  triggerClassName?: string
  value: string
}) {
  const triggerLabel = ariaLabel ?? ariaLabelProp ?? "Color swatch"
  const color = parseDesktopColor(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={triggerLabel}
          className={cn(
            "cursor-pointer overflow-hidden rounded-full border bg-transparent p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
            triggerClassName,
          )}
          data-slot="desktop-color-picker"
          style={{ backgroundColor: value }}
          type="button"
        >
          <span
            aria-hidden="true"
            className="block size-full rounded-full"
            style={{ backgroundColor: value }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        data-slot="desktop-color-picker-popover"
        className="w-[300px] border-0 bg-transparent p-0 shadow-none"
        side="right"
        sideOffset={8}
      >
        <AmploColorPicker.Root
          backgroundColor="#111111"
          className={cn(
            "max-w-none gap-3 border-[var(--desktop-color-picker-popover-border)] bg-[var(--desktop-color-picker-popover-bg)] p-3 text-[var(--desktop-color-picker-popover-fg)] shadow-2xl shadow-black/30 backdrop-blur-xl",
            "data-[slot=color-picker]:rounded-xl",
          )}
          defaultFormat="hex"
          onValueChange={(_nextColor, _formatted, formats) => onChange(formats.hex)}
          value={color}
        >
          <AmploColorPicker.Area mode="hsv-sv" />
          <div className="flex flex-col gap-1.5">
            <AmploColorPicker.Hue />
            <AmploColorPicker.Alpha />
          </div>
          <div className="flex items-center gap-2">
            <AmploColorPicker.FormatSwitcher className="flex-1" />
            <AmploColorPicker.EyeDropper className="h-8 w-full flex-1" />
          </div>
          <AmploColorPicker.CssInput className="font-mono text-xs" />
          <AmploColorPicker.Swatches presets={DESKTOP_COLOR_PICKER_SWATCHES} />
        </AmploColorPicker.Root>
      </PopoverContent>
    </Popover>
  )
}

function parseDesktopColor(value: string): OklchColor {
  return parseColor(value) ?? { l: 0, c: 0, h: 0, alpha: 1 }
}

function DesktopNumberRow({
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
}: {
  label: string
  max?: number
  min?: number
  onChange: (value: number) => void
  step?: number
  value: number
}) {
  return (
    <label className={DESKTOP_INSPECTOR_ROW_CLASS}>
      <span className={DESKTOP_INSPECTOR_LABEL_CLASS}>{label}</span>
      <DesktopInspectorTextInput
        aria-label={label}
        className="h-7 w-20 rounded-[5px] px-2 text-[11px] font-semibold"
        max={max}
        min={min}
        step={step}
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.currentTarget.value)

          if (Number.isFinite(nextValue)) {
            onChange(nextValue)
          }
        }}
      />
    </label>
  )
}

function DesktopPatternSwatchButton({
  label,
  onClick,
  selected,
  style,
}: {
  label: string
  onClick: () => void
  selected: boolean
  style: CSSProperties
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-1.5">
      <button
        aria-label={`Use ${label} decoration pattern`}
        aria-pressed={selected}
        data-desktop-option-tile="true"
        className={cn(
          "relative aspect-square w-full min-w-0 rounded-[7px] border-2 border-transparent bg-transparent p-0 transition",
          DESKTOP_INSPECTOR_FOCUS_CLASS,
          selected && DESKTOP_OPTION_CARD_SELECTED_CLASS,
        )}
        type="button"
        onClick={onClick}
      >
        <span
          aria-hidden="true"
          className="block size-full rounded-[6px] transition group-hover:brightness-110"
          style={style}
        />
      </button>
      <span
        data-desktop-preview-caption="true"
        className={cn("block w-full truncate px-0.5 text-center text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_TERTIARY)}
      >
        {label}
      </span>
    </div>
  )
}

function DesktopTextPresetButton({
  label,
  onClick,
  selected,
}: {
  label: string
  onClick: () => void
  selected: boolean
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "flex h-9 min-w-0 items-center justify-between gap-2 px-2.5 text-left",
        DESKTOP_INSPECTOR_CONTROL_CLASS,
        selected && DESKTOP_INSPECTOR_SELECTED_CLASS,
      )}
      type="button"
      onClick={onClick}
    >
      <span className={cn("min-w-0 flex-1 truncate text-[11px] font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
        {label}
      </span>
    </button>
  )
}

function DesktopSegmentedRow<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: TValue) => void
  options: Array<{ label: string; value: TValue }>
  value: TValue
}) {
  return (
    <div className="min-w-0 py-2.5">
      <DesktopInspectorLabel>{label}</DesktopInspectorLabel>
      <DesktopInspectorSegmentedControl
        items={options}
        value={value}
        onValueChange={onChange}
      />
    </div>
  )
}

function updateDesktopGradientColor(
  gradient: StudioGradient,
  index: 0 | 1,
  color: string,
): StudioGradient {
  return {
    ...gradient,
    enabled: true,
    colorStops: gradient.colorStops.map((stop, stopIndex) =>
      stopIndex === index ? { ...stop, color } : stop,
    ) as StudioGradient["colorStops"],
  }
}

function areDesktopColorPalettesEqual(currentPalette: string[], presetPalette: string[]): boolean {
  return (
    currentPalette.length === presetPalette.length &&
    currentPalette.every((color, index) => color.toLowerCase() === presetPalette[index]?.toLowerCase())
  )
}

function DesktopContentFields({
  contentType,
  contentValues,
  onContentValueChange,
  validation,
}: {
  contentType: QrInputType
  contentValues: StaticQrContentValues
  onContentValueChange: (field: string, value: StaticQrContentValue) => void
  validation: ReturnType<typeof validateStaticQrContent>
}) {
  const fields = getDesktopContentFields(contentType, contentValues, validation)

  return (
    <div data-slot="desktop-content-fields" className="divide-y divide-white/[0.07]">
      {fields.map((field) => (
        <DesktopContentFieldRow
          key={field.id}
          field={field}
          onContentValueChange={onContentValueChange}
        />
      ))}
    </div>
  )
}

type DesktopContentField = {
  error?: string
  id: string
  label: string
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  type: "text" | "textarea" | "toggle" | "segmented"
  value: StaticQrContentValue | undefined
}

function DesktopContentFieldRow({
  field,
  onContentValueChange,
}: {
  field: DesktopContentField
  onContentValueChange: (field: string, value: StaticQrContentValue) => void
}) {
  const controlId = `desktop-content-${field.id}`

  return (
    <div className={DESKTOP_INSPECTOR_FIELD_ROW_CLASS}>
      <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
        <label className={DESKTOP_INSPECTOR_LABEL_CLASS} htmlFor={controlId}>
          {field.label}
        </label>
        {field.error ? (
          <span className={cn("shrink-0 text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_TERTIARY)}>{field.error}</span>
        ) : null}
      </div>
      {field.type === "textarea" ? (
        <DesktopInspectorTextarea
          id={controlId}
          aria-invalid={field.error ? true : undefined}
          placeholder={field.placeholder}
          value={stringContentValue(field.value)}
          onChange={(event) => onContentValueChange(field.id, event.currentTarget.value)}
        />
      ) : null}
      {field.type === "text" ? (
        <DesktopInspectorTextInput
          id={controlId}
          aria-invalid={field.error ? true : undefined}
          placeholder={field.placeholder}
          value={stringContentValue(field.value)}
          onChange={(event) => onContentValueChange(field.id, event.currentTarget.value)}
        />
      ) : null}
      {field.type === "toggle" ? (
        <button
          id={controlId}
          aria-pressed={Boolean(field.value)}
          className={cn(
            "flex h-8 w-full items-center justify-between px-2.5 text-[12px] font-semibold",
            DESKTOP_INSPECTOR_CONTROL_CLASS,
            field.value && DESKTOP_INSPECTOR_SELECTED_CLASS,
          )}
          type="button"
          onClick={() => onContentValueChange(field.id, !field.value)}
        >
          <span>{field.value ? "On" : "Off"}</span>
          <span className={cn("h-4 w-7 rounded-full bg-white/18 p-0.5", field.value && "bg-white")}>
            <span
              className={cn(
                "block size-3 rounded-full bg-white transition-transform",
                field.value && "translate-x-3",
              )}
            />
          </span>
        </button>
      ) : null}
      {field.type === "segmented" ? (
        <div id={controlId} className="grid grid-cols-3 gap-1.5">
          {field.options?.map((option) => {
            const selected = field.value === option.value

            return (
              <button
                key={option.value}
                aria-pressed={selected}
                className={cn(
                  "h-8 px-2 text-[11px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  selected && DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onContentValueChange(field.id, option.value)}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function getDesktopContentFields(
  contentType: QrInputType,
  contentValues: StaticQrContentValues,
  validation: ReturnType<typeof validateStaticQrContent>,
): DesktopContentField[] {
  const text = (id: string, label: string, placeholder: string, error?: string): DesktopContentField => ({
    error,
    id,
    label,
    placeholder,
    type: "text",
    value: contentValues[id],
  })
  const textarea = (id: string, label: string, placeholder: string, error?: string): DesktopContentField => ({
    error,
    id,
    label,
    placeholder,
    type: "textarea",
    value: contentValues[id],
  })

  if (contentType === "auto") {
    return [textarea("text", "Payload", "https://example.com/invite")]
  }

  if (contentType === "text") {
    return [textarea("text", "Text", "Plain text to encode")]
  }

  if (isUrlContentType(contentType)) {
    return [text("url", "URL", "https://example.com", validation.fieldErrors.url)]
  }

  if (contentType === "phone") {
    return [text("phone", "Phone number", "+1 555 010 2000", validation.fieldErrors.phone)]
  }

  if (contentType === "email") {
    return [
      text("email", "Email", "hello@example.com", validation.fieldErrors.email),
      text("subject", "Subject", "Launch"),
      textarea("body", "Body", "Message body"),
    ]
  }

  if (contentType === "sms") {
    return [
      text("phone", "Phone number", "+1 555 010 2000", validation.fieldErrors.phone),
      textarea("message", "Message", "Message text"),
    ]
  }

  if (contentType === "wifi") {
    return [
      text("ssid", "Network", "Cafe Guest", validation.fieldErrors.ssid),
      {
        id: "security",
        label: "Security",
        options: [
          { label: "WPA", value: "WPA" },
          { label: "WEP", value: "WEP" },
          { label: "None", value: "nopass" },
        ],
        type: "segmented",
        value: contentValues.security ?? "WPA",
      },
      text("password", "Password", "Network password"),
      { id: "hidden", label: "Hidden network", type: "toggle", value: contentValues.hidden },
    ]
  }

  if (contentType === "vcard") {
    return [
      text("firstName", "First name", "Jay", validation.fieldErrors.firstName),
      text("lastName", "Last name", "Shah"),
      text("phone", "Phone", "+91 98765 43210"),
      text("email", "Email", "jay@example.com"),
      text("company", "Company", "New QR"),
      text("url", "Website", "https://example.com"),
    ]
  }

  if (contentType === "whatsapp" || contentType === "whatsapp-chat") {
    return [
      text("phone", "Phone number", "+91 98765 43210", validation.fieldErrors.phone),
      textarea("message", "Message", "I would like to book"),
    ]
  }

  if (isUsernameContentType(contentType)) {
    return [text("username", "Username", "@newqr", validation.fieldErrors.username)]
  }

  if (contentType === "map-location") {
    return [
      text("query", "Place", "Mumbai", validation.fieldErrors.query),
      text("latitude", "Latitude", "19.0760", validation.fieldErrors.latitude),
      text("longitude", "Longitude", "72.8777", validation.fieldErrors.longitude),
    ]
  }

  if (contentType === "event") {
    const eventMode = stringContentValue(contentValues.eventMode) || "url"
    const fields: DesktopContentField[] = [
      {
        id: "eventMode",
        label: "Event type",
        options: [
          { label: "URL", value: "url" },
          { label: "Calendar", value: "calendar" },
        ],
        type: "segmented",
        value: eventMode,
      },
    ]

    if (eventMode === "calendar") {
      fields.push(
        text("title", "Title", "Launch Briefing", validation.fieldErrors.title),
        text("start", "Start", "2026-06-01T09:00", validation.fieldErrors.start),
        text("end", "End", "2026-06-01T10:30"),
        text("location", "Location", "Studio 2"),
      )
    } else {
      fields.push(text("url", "URL", "https://example.com/rsvp", validation.fieldErrors.url))
    }

    return fields
  }

  if (contentType === "coupon") {
    return [
      text("code", "Code", "SAVE20", validation.fieldErrors.code),
      textarea("description", "Description", "20% off"),
      text("url", "URL", "https://example.com/save"),
    ]
  }

  return [textarea("text", "Payload", "Paste a value to encode")]
}

function isUrlContentType(type: QrInputType) {
  return [
    "link",
    "website",
    "facebook",
    "youtube",
    "linkedin",
    "discord",
    "google-review",
    "booking-link",
    "payment-link",
    "menu",
    "app-download",
    "pdf",
    "image",
    "video",
    "document",
    "form",
  ].includes(type)
}

function isUsernameContentType(type: QrInputType) {
  return [
    "instagram",
    "x",
    "tiktok",
    "telegram",
    "snapchat",
    "threads",
    "pinterest",
    "telegram-username",
  ].includes(type)
}

function stringContentValue(value: StaticQrContentValue | undefined) {
  return typeof value === "string" ? value : ""
}

function DesktopEncodingInspector({
  onEncodingSettingsChange,
  settings,
}: {
  onEncodingSettingsChange: (patch: Partial<DesktopEncodingSettings>) => void
  settings: DesktopEncodingSettings
}) {
  return (
    <div data-slot="desktop-encoding-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Encoding" />
      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <DesktopMotionSliderRow
            label="Type number"
            max={TYPE_NUMBER_MAX}
            min={TYPE_NUMBER_MIN}
            value={settings.typeNumber}
            valueLabel={formatQrTypeNumberLabel(settings.typeNumber)}
            onChange={(typeNumber) => onEncodingSettingsChange({ typeNumber: typeNumber as QrTypeNumber })}
          />
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Error Correction</p>
          <div className="grid gap-1.5" data-slot="desktop-error-correction-grid">
            {ERROR_CORRECTION_LEVEL_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Use ${option.title} error correction`}
                aria-pressed={settings.errorCorrectionLevel === option.value}
                className={cn(
                  "min-w-0 px-3 py-2 text-left",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.errorCorrectionLevel === option.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onEncodingSettingsChange({ errorCorrectionLevel: option.value })}
              >
                <span className="flex min-w-0 items-center justify-between gap-3">
                  <span className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>
                    {option.title} ({option.label})
                  </span>
                </span>
                <span className={cn("mt-1 block text-[10px] font-semibold leading-4", DESKTOP_INSPECTOR_FG_MUTED)}>
                  {option.summary}
                </span>
              </button>
            ))}
          </div>
        </section>
      </DesktopInspectorScrollArea>
    </div>
  )
}

function DesktopImageInspector({
  onImageSettingsChange,
  settings,
}: {
  onImageSettingsChange: (patch: Partial<DesktopImageSettings>) => void
  settings: DesktopImageSettings
}) {
  return (
    <div data-slot="desktop-image-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Image" />
      <DesktopInspectorScrollArea>
        <DesktopInspectorSection>
          <DesktopInspectorLabel>Intent</DesktopInspectorLabel>
          <DesktopInspectorSegmentedControl
            columns={3}
            dataSlot="desktop-image-intent"
            itemAriaLabel={(option) => `Use image as ${option.label}`}
            itemClassName="h-9 px-1.5 text-[10px]"
            items={DESKTOP_IMAGE_INTENT_OPTIONS}
            value={settings.intent}
            onValueChange={(intent) => onImageSettingsChange({ intent })}
          />
        </DesktopInspectorSection>

        <DesktopInspectorSection className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
          <DesktopInspectorLabel>Source</DesktopInspectorLabel>
          <DesktopInspectorSegmentedControl
            dataSlot="desktop-image-source-mode"
            itemAriaLabel={(option) => `Use ${option.label} image source`}
            items={DESKTOP_ASSET_SOURCE_OPTIONS}
            value={settings.sourceMode}
            onValueChange={(sourceMode) => onImageSettingsChange({ sourceMode })}
          />
          <DesktopInspectorTextInput
            aria-label="Shape image URL"
            className="mt-2"
            placeholder="https://example.com/shape.png"
            value={settings.remoteUrl}
            onChange={(event) => onImageSettingsChange({ remoteUrl: event.currentTarget.value })}
          />
        </DesktopInspectorSection>

        <DesktopInspectorSection className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
          <DesktopInspectorLabel>Image Fit</DesktopInspectorLabel>
          <DesktopInspectorSegmentedControl
            itemAriaLabel={(option) => `Use ${option.value} image fit`}
            itemClassName="capitalize"
            items={[
              { label: "cover", value: "cover" },
              { label: "contain", value: "contain" },
            ]}
            value={settings.fit}
            onValueChange={(fit) => onImageSettingsChange({ fit })}
          />
          <div className={DESKTOP_INSPECTOR_SECTION_GAP_CLASS}>
            <DesktopMotionSliderRow
              label="Opacity"
              max={100}
              min={0}
              value={settings.opacity}
              valueLabel={`${Math.round(settings.opacity)}%`}
              onChange={(opacity) => onImageSettingsChange({ opacity })}
            />
          </div>
        </DesktopInspectorSection>
      </DesktopInspectorScrollArea>
    </div>
  )
}

function DesktopDecorationsInspector({
  onDecorationsSettingsChange,
  settings,
}: {
  onDecorationsSettingsChange: (patch: Partial<DesktopDecorationsSettings>) => void
  settings: DesktopDecorationsSettings
}) {
  return (
    <div data-slot="desktop-decorations-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Decorations" />
      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Add</p>
          <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-decoration-kind">
            {DESKTOP_DECORATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Add ${option.label} decoration`}
                aria-pressed={settings.kind === option.value}
                className={cn(
                  "h-9 px-2 text-[11px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.kind === option.value && DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onDecorationsSettingsChange({ kind: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Fill</p>
          <DesktopColorInputRow
            label="Decoration fill color"
            value={settings.fill}
            onChange={(fill) => onDecorationsSettingsChange({ fill })}
          />
          <div className="mt-2.5 grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1" data-slot="desktop-decoration-patterns">
            <DesktopPatternSwatchButton
              label="None"
              selected={settings.patternId === DRAFTING_CARD_PATTERN_NONE_ID}
              style={{ backgroundColor: settings.fill }}
              onClick={() => onDecorationsSettingsChange({ patternId: DRAFTING_CARD_PATTERN_NONE_ID })}
            />
            {DRAFTING_CARD_PATTERNS.slice(0, 8).map((pattern) => (
              <DesktopPatternSwatchButton
                key={pattern.id}
                label={pattern.label}
                selected={settings.patternId === pattern.id}
                style={getDraftingCardPatternStyle(pattern.id, {}) ?? pattern.style}
                onClick={() => onDecorationsSettingsChange({ patternId: pattern.id })}
              />
            ))}
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Frame</p>
          <div className="grid gap-2">
            <DesktopNumberRow
              label="Decoration radius"
              max={96}
              min={0}
              value={settings.radius}
              onChange={(radius) => onDecorationsSettingsChange({ radius })}
            />
            <DesktopColorInputRow
              label="Decoration stroke color"
              value={settings.strokeColor}
              onChange={(strokeColor) => onDecorationsSettingsChange({ strokeColor })}
            />
            <DesktopNumberRow
              label="Decoration stroke"
              max={24}
              min={0}
              value={settings.strokeWidth}
              onChange={(strokeWidth) => onDecorationsSettingsChange({ strokeWidth })}
            />
          </div>
        </section>
      </DesktopInspectorScrollArea>
    </div>
  )
}

function DesktopEffectsInspector({
  onEffectsSettingsChange,
  settings,
}: {
  onEffectsSettingsChange: (patch: Partial<DesktopEffectsSettings>) => void
  settings: DesktopEffectsSettings
}) {
  const generatedShaders = getCardGeneratedShaderDefinitions()
  const imageFilters = getCardImageFilterDefinitions()
  const generatedDefinition = getPaperShaderDefinition(settings.generatedShaderId)
  const filterDefinition = getPaperShaderDefinition(settings.filterId)

  return (
    <div data-slot="desktop-effects-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Effects" />
      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Generated Effects</p>
          <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pr-1" data-slot="desktop-generated-effects">
            {generatedShaders.slice(0, 12).map((shader) => (
              <DesktopTextPresetButton
                key={shader.id}
                label={shader.label}
                selected={settings.generatedShaderId === shader.id}
                onClick={() =>
                  onEffectsSettingsChange({
                    generatedShaderId: shader.id,
                    generatedShaderPresetName: shader.presets[0]?.name ?? "",
                  })
                }
              />
            ))}
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Preset</p>
          <DesktopInspectorNativeSelect
            aria-label="Generated effect preset"
            className="pr-2.5"
            options={generatedDefinition.presets.map((preset) => ({
              label: preset.name,
              value: preset.name,
            }))}
            showIcon={false}
            value={settings.generatedShaderPresetName}
            onValueChange={(generatedShaderPresetName) =>
              onEffectsSettingsChange({ generatedShaderPresetName })
            }
          />
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Motion</p>
          <div className="grid gap-2">
            <DesktopMotionToggleRow
              checked={settings.paused}
              label="Pause"
              onChange={(paused) => onEffectsSettingsChange({ paused })}
            />
            <DesktopMotionSliderRow
              label="Speed"
              max={4}
              min={0}
              value={settings.speed}
              valueLabel={settings.speed.toFixed(2)}
              onChange={(speed) => onEffectsSettingsChange({ speed })}
            />
            <DesktopMotionSliderRow
              label="Frame"
              max={10000}
              min={0}
              value={settings.frame}
              valueLabel={`${Math.round(settings.frame)}`}
              onChange={(frame) => onEffectsSettingsChange({ frame })}
            />
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Image Filters</p>
          <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-image-filters">
            {imageFilters.map((filter) => (
              <DesktopTextPresetButton
                key={filter.id}
                label={filter.label}
                selected={settings.filterId === filter.id}
                onClick={() =>
                  onEffectsSettingsChange({
                    filterId: filter.id,
                    filterPresetName: filter.presets[0]?.name ?? "",
                  })
                }
              />
            ))}
          </div>
          <DesktopInspectorNativeSelect
            aria-label="Image filter preset"
            className="pr-2.5"
            options={filterDefinition.presets.map((preset) => ({
              label: preset.name,
              value: preset.name,
            }))}
            rootClassName="mt-2"
            showIcon={false}
            value={settings.filterPresetName}
            onValueChange={(filterPresetName) => onEffectsSettingsChange({ filterPresetName })}
          />
        </section>
      </DesktopInspectorScrollArea>
    </div>
  )
}

function DesktopLayersInspector({
  onLayersSettingsChange,
  settings,
}: {
  onLayersSettingsChange: (patch: Partial<DesktopLayersSettings>) => void
  settings: DesktopLayersSettings
}) {
  const selectedLayer =
    settings.layers.find((layer) => layer.id === settings.selectedLayerId) ?? settings.layers[0]

  function patchSelectedLayer(patch: Partial<DesktopLayerRow>) {
    if (!selectedLayer) {
      return
    }

    onLayersSettingsChange({
      layers: settings.layers.map((layer) =>
        layer.id === selectedLayer.id ? { ...layer, ...patch } : layer,
      ),
    })
  }

  return (
    <div data-slot="desktop-layers-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Layers" />
      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
            <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Layer Stack</p>
            <span className={cn("shrink-0 text-[10px] font-bold", DESKTOP_INSPECTOR_FG_MUTED)}>
              {settings.layers.length} total
            </span>
          </div>
          <div className="grid gap-1.5" data-slot="desktop-layer-list">
            {settings.layers.map((layer, index) => (
              <button
                key={layer.id}
                aria-label={`Select ${layer.name}`}
                aria-pressed={settings.selectedLayerId === layer.id}
                className={cn(
                  "flex min-w-0 items-center gap-2 px-2.5 py-2 text-left",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.selectedLayerId === layer.id && DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onLayersSettingsChange({ selectedLayerId: layer.id })}
              >
                <span className={cn("shrink-0 text-[10px] font-bold", DESKTOP_INSPECTOR_FG_MUTED)}>{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[12px] font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
                    {layer.name}
                  </span>
                  <span className={cn("block truncate text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_MUTED)}>
                    {layer.kind} · {layer.width} x {layer.height}
                  </span>
                </span>
                <span className={cn("shrink-0 text-[10px] font-bold", DESKTOP_INSPECTOR_FG_MUTED)}>
                  {layer.isVisible ? "Shown" : "Hidden"}
                </span>
              </button>
            ))}
          </div>
        </section>

        {selectedLayer ? (
          <>
            <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
              <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Inspector</p>
              <DesktopInspectorTextInput
                aria-label="Layer name"
                value={selectedLayer.name}
                onChange={(event) => patchSelectedLayer({ name: event.currentTarget.value })}
              />
            </section>
            <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
              <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Geometry</p>
              <div className="grid grid-cols-2 gap-2">
                <DesktopNumberRow label="X" value={selectedLayer.x} onChange={(x) => patchSelectedLayer({ x })} />
                <DesktopNumberRow label="Y" value={selectedLayer.y} onChange={(y) => patchSelectedLayer({ y })} />
                <DesktopNumberRow label="W" min={1} value={selectedLayer.width} onChange={(width) => patchSelectedLayer({ width })} />
                <DesktopNumberRow label="H" min={1} value={selectedLayer.height} onChange={(height) => patchSelectedLayer({ height })} />
              </div>
              <div className="mt-2.5 grid gap-2">
                <DesktopElasticSliderRow
                  label="Horizontal tilt"
                  max={60}
                  min={-60}
                  value={selectedLayer.tiltX}
                  valueLabel={`${Math.round(selectedLayer.tiltX)}°`}
                  onChange={(tiltX) => patchSelectedLayer({ tiltX })}
                />
                <DesktopElasticSliderRow
                  label="Vertical tilt"
                  max={60}
                  min={-60}
                  value={selectedLayer.tiltY}
                  valueLabel={`${Math.round(selectedLayer.tiltY)}°`}
                  onChange={(tiltY) => patchSelectedLayer({ tiltY })}
                />
              </div>
            </section>
          </>
        ) : null}
      </DesktopInspectorScrollArea>
    </div>
  )
}

function DesktopExportInspector({
  onExportDownload,
  onExportSettingsChange,
  settings,
}: {
  onExportDownload: () => void
  onExportSettingsChange: (patch: Partial<DesktopExportSettings>) => void
  settings: DesktopExportSettings
}) {
  const selectedQuality =
    DESKTOP_RASTER_EXPORT_PRESETS.find((preset) => preset.id === settings.qualityPresetId) ??
    DESKTOP_RASTER_EXPORT_PRESETS[1]
  const isRasterExport = settings.extension !== "svg"

  return (
    <div data-slot="desktop-export-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Export" />
      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Target</p>
          <div className="grid gap-1.5" data-slot="desktop-export-target-list">
            {DESKTOP_EXPORT_TARGET_OPTIONS.map((option) => (
              <DesktopTextPresetButton
                key={option.value}
                label={option.label}
                selected={settings.target === option.value}
                onClick={() => onExportSettingsChange({ target: option.value })}
              />
            ))}
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Format</p>
          <div className="grid grid-cols-4 gap-1.5" data-slot="desktop-export-format-grid">
            {DESKTOP_DOWNLOAD_EXTENSIONS.map((extension) => (
              <button
                key={extension}
                aria-label={`Export ${extension.toUpperCase()}`}
                aria-pressed={settings.extension === extension}
                className={cn(
                  "h-9 px-1.5 text-[11px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.extension === extension && DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onExportSettingsChange({ extension })}
              >
                {extension.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {isRasterExport ? (
          <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
            <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Quality</p>
            <div className="grid gap-1.5" data-slot="desktop-export-quality-grid">
              {DESKTOP_RASTER_EXPORT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  aria-label={`Use ${preset.label} export quality`}
                  aria-pressed={settings.qualityPresetId === preset.id}
                  className={cn(
                    "min-w-0 px-3 py-2 text-left",
                    DESKTOP_INSPECTOR_CONTROL_CLASS,
                    settings.qualityPresetId === preset.id &&
                      DESKTOP_INSPECTOR_SELECTED_CLASS,
                  )}
                  type="button"
                  onClick={() => onExportSettingsChange({ qualityPresetId: preset.id })}
                >
                  <span className={cn("block truncate text-[12px] font-semibold", DESKTOP_INSPECTOR_FG_SECONDARY)}>
                    {preset.label}
                  </span>
                  <span className={cn("mt-0.5 block truncate text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_MUTED)}>
                    {preset.sizePx} x {preset.sizePx} px · {preset.primaryUse}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </DesktopInspectorScrollArea>
      <div className={DESKTOP_INSPECTOR_FOOTER_CLASS}>
        <button
          aria-label={`Download ${settings.extension.toUpperCase()}`}
          className={cn("mb-2", DESKTOP_INSPECTOR_RESET_CLASS, DESKTOP_INSPECTOR_SELECTED_CLASS)}
          data-slot="desktop-export-download"
          type="button"
          onClick={onExportDownload}
        >
          <AnimatedDownloadIcon size={14} />
          Download {settings.extension.toUpperCase()}
        </button>
        {isRasterExport ? (
          <p className={cn("mt-2 truncate text-center text-[10px] font-semibold", DESKTOP_INSPECTOR_FG_MUTED)}>
            {selectedQuality.sizePx}px raster preset
          </p>
        ) : null}
      </div>
    </div>
  )
}

function DesktopTextInspector({
  onTextSettingsChange,
  settings,
}: {
  onTextSettingsChange: (patch: Partial<DesktopTextSettings>) => void
  settings: DesktopTextSettings
}) {
  const selectedFont = resolveDraftingFont({
    fontFamily: settings.fontFamily,
    fontId: settings.fontId,
  })
  const supportedWeights = selectedFont.weights
  const fontWeight = getDesktopTextInspectorFontWeight(settings.fontWeight, supportedWeights)
  const selectedPreset = getDesktopTextPresetId(settings)
  const [fontMenuOpen, setFontMenuOpen] = useState(false)

  useEffect(() => {
    void loadDraftingFont(selectedFont.id)
  }, [selectedFont.id])

  return (
    <div data-slot="desktop-text-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Text" />

      <DesktopInspectorScrollArea>
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Preset</p>
          <div className="grid grid-cols-3 gap-1.5" data-slot="desktop-text-preset-options">
            {DESKTOP_TEXT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                aria-label={`Use ${preset.label} text preset`}
                aria-pressed={selectedPreset === preset.id}
                className={cn(
                  "h-8 px-2 text-[11px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  selectedPreset === preset.id && DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() =>
                  onTextSettingsChange({
                    fontSize: preset.fontSize,
                    fontWeight: preset.fontWeight,
                    lineHeight: preset.lineHeight,
                  })
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-2", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Font</p>
          <div className="grid grid-cols-[1fr_4.75rem] gap-1.5">
            <div className="min-w-0" data-slot="desktop-text-font-selector">
              <button
                aria-controls="desktop-text-font-listbox"
                aria-expanded={fontMenuOpen}
                aria-label="Text font"
                aria-haspopup="listbox"
                className={cn(
                  "flex h-8 w-full min-w-0 items-center justify-between gap-2 px-2.5 text-left text-[12px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                )}
                style={{ fontFamily: getDraftingFontCssFamily({ fontId: selectedFont.id }) }}
                type="button"
                onClick={() => setFontMenuOpen((open) => !open)}
              >
                <span className="min-w-0 flex-1 truncate">{selectedFont.label}</span>
                <ChevronDownIcon
                  className={cn("size-3.5 shrink-0 text-current transition-transform", fontMenuOpen && "rotate-180")}
                />
              </button>
            </div>
            <DesktopInspectorTextInput
              aria-label="Text font size"
              className="h-8 rounded-[6px] px-2 text-[12px] font-semibold"
              max={300}
              min={6}
              type="number"
              value={settings.fontSize}
              onChange={(event) => {
                const fontSize = Number(event.currentTarget.value)

                if (Number.isFinite(fontSize)) {
                  onTextSettingsChange({ fontSize })
                }
              }}
            />
          </div>
          {fontMenuOpen ? (
            <div
              id="desktop-text-font-listbox"
              aria-label="Text font options"
              className="mt-2 grid max-h-40 gap-1.5 overflow-y-auto pr-1"
              data-slot="desktop-text-font-listbox"
              role="listbox"
            >
              {DRAFTING_FONT_REGISTRY.map((font) => (
                <button
                  key={font.id}
                  aria-label={`Use ${font.label} text font`}
                  aria-selected={selectedFont.id === font.id}
                  className={cn(
                    "flex h-8 min-w-0 items-center px-2.5 text-left text-[12px] font-semibold",
                    DESKTOP_INSPECTOR_CONTROL_CLASS,
                    selectedFont.id === font.id && DESKTOP_INSPECTOR_SELECTED_CLASS,
                  )}
                  role="option"
                  style={{ fontFamily: getDraftingFontCssFamily({ fontId: font.id }) }}
                  type="button"
                  onClick={() => {
                    void loadDraftingFont(font.id)
                    onTextSettingsChange({ fontFamily: font.family, fontId: font.id })
                    setFontMenuOpen(false)
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{font.label}</span>
                </button>
              ))}
            </div>
          ) : null}
          <DesktopTextInlineSlider
            label="Size"
            max={300}
            min={6}
            value={settings.fontSize}
            valueLabel={`${Math.round(settings.fontSize)} px`}
            onChange={(fontSize) => onTextSettingsChange({ fontSize })}
          />
          <DesktopTextInlineSlider
            label="Weight"
            max={Math.max(...supportedWeights)}
            min={Math.min(...supportedWeights)}
            step={getDesktopFontWeightSliderStep(supportedWeights)}
            value={fontWeight}
            valueLabel={String(Math.round(fontWeight))}
            onChange={(nextWeight) =>
              onTextSettingsChange({
                fontWeight: getNearestDesktopFontWeight(nextWeight, supportedWeights),
              })
            }
          />
          <div className="mt-2 grid grid-cols-3 gap-1.5" data-slot="desktop-text-emphasis">
            <DesktopTextToggleButton
              active={fontWeight >= 700}
              icon={<BoldIcon className="size-3.5" />}
              label="Bold"
              onClick={() =>
                onTextSettingsChange({
                  fontWeight:
                    fontWeight >= 700
                      ? getNearestDesktopFontWeight(400, supportedWeights)
                      : getNearestDesktopFontWeight(700, supportedWeights),
                })
              }
            />
            <DesktopTextToggleButton
              active={settings.fontStyle === "italic"}
              icon={<ItalicIcon className="size-3.5" />}
              label="Italic"
              onClick={() =>
                onTextSettingsChange({
                  fontStyle: settings.fontStyle === "italic" ? "normal" : "italic",
                })
              }
            />
            <DesktopTextToggleButton
              active={settings.underline}
              icon={<UnderlineIcon className="size-3.5" />}
              label="Underline"
              onClick={() => onTextSettingsChange({ underline: !settings.underline })}
            />
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
            <p className={DESKTOP_INSPECTOR_SECTION_HEADING_CLASS}>Text</p>
            <button
              aria-label="Add Text"
              className={cn("grid size-7 shrink-0 place-items-center", DESKTOP_INSPECTOR_CONTROL_CLASS)}
              type="button"
              onClick={() => onTextSettingsChange({ text: DEFAULT_DESKTOP_TEXT_SETTINGS.text })}
            >
              <TypeIcon className="size-3.5" />
            </button>
          </div>
          <DesktopInspectorTextarea
            aria-label="Text layer content"
            className="min-h-16 py-2"
            value={settings.text}
            onChange={(event) => onTextSettingsChange({ text: event.currentTarget.value })}
          />
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Color</p>
          <DesktopColorInputRow
            label="Text fill color"
            value={settings.fill}
            onChange={(fill) => onTextSettingsChange({ fill })}
          />
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Alignment</p>
          <div className="grid grid-cols-3 gap-1.5" data-slot="desktop-text-alignment">
            {DESKTOP_TEXT_ALIGN_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Align text ${option.value}`}
                aria-pressed={settings.textAlign === option.value}
                className={cn(
                  "h-8 px-2 text-[11px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.textAlign === option.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onTextSettingsChange({ textAlign: option.value })}
              >
                <DesktopTextAlignIcon value={option.value} />
              </button>
            ))}
          </div>
        </section>

        <section className={cn(DESKTOP_INSPECTOR_SECTION_GAP_CLASS, DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className={cn("mb-3", DESKTOP_INSPECTOR_SECTION_HEADING_CLASS)}>Spacing</p>
          <div className="grid gap-2">
            <DesktopTextInlineSlider
              label="Letter spacing"
              max={200}
              min={-50}
              value={settings.letterSpacing}
              valueLabel={`${Math.round(settings.letterSpacing)} px`}
              onChange={(letterSpacing) => onTextSettingsChange({ letterSpacing })}
            />
            <DesktopTextInlineSlider
              label="Line height"
              max={4}
              min={0.6}
              step={0.05}
              value={settings.lineHeight}
              valueLabel={settings.lineHeight.toFixed(2)}
              onChange={(lineHeight) => onTextSettingsChange({ lineHeight })}
            />
          </div>
        </section>
      </DesktopInspectorScrollArea>

    </div>
  )
}

function DesktopTextToggleButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={`${label} text`}
      aria-pressed={active}
      className={cn(
        "h-8 px-2 text-[11px] font-semibold",
        DESKTOP_INSPECTOR_CONTROL_CLASS,
        active && DESKTOP_INSPECTOR_SELECTED_CLASS,
      )}
      type="button"
      onClick={onClick}
    >
      <span className="grid place-items-center">{icon}</span>
    </button>
  )
}

function DesktopTextAlignIcon({ value }: { value: DraftingTextAlign }) {
  if (value === "center") {
    return <AlignCenterIcon className="mx-auto size-3.5" />
  }

  if (value === "right") {
    return <AlignRightIcon className="mx-auto size-3.5" />
  }

  return <AlignLeftIcon className="mx-auto size-3.5" />
}

function DesktopTextInlineSlider({
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
  valueLabel,
}: {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step?: number
  value: number
  valueLabel: string
}) {
  return (
    <div
      data-slot="desktop-elastic-slider-row"
      className="mt-2 grid min-w-0 py-1.5"
    >
      <div data-slot="desktop-elastic-slider">
        <ElasticSlider
          aria-label={`Text font ${label.toLowerCase()}`}
          className={DESKTOP_ELASTIC_SLIDER_CLASS}
          formatValue={() => valueLabel}
          label={label}
          max={max}
          min={min}
          step={step}
          value={value}
          onValueChange={onChange}
        />
      </div>
    </div>
  )
}

function getDesktopTextPresetId(settings: DesktopTextSettings) {
  return (
    DESKTOP_TEXT_PRESETS.find(
      (preset) =>
        preset.fontSize === settings.fontSize &&
        preset.fontWeight === settings.fontWeight &&
        preset.lineHeight === settings.lineHeight,
    )?.id ?? "body"
  )
}

function getDesktopTextInspectorFontWeight(
  fontWeight: DraftingTextFontWeight,
  supportedWeights: readonly number[],
) {
  if (fontWeight === "bold") {
    return getNearestDesktopFontWeight(700, supportedWeights)
  }

  if (typeof fontWeight === "number" && Number.isFinite(fontWeight)) {
    return getNearestDesktopFontWeight(fontWeight, supportedWeights)
  }

  return getNearestDesktopFontWeight(400, supportedWeights)
}

function getNearestDesktopFontWeight(value: number, supportedWeights: readonly number[]) {
  return supportedWeights.reduce((nearestWeight, candidateWeight) => {
    const nearestDistance = Math.abs(nearestWeight - value)
    const candidateDistance = Math.abs(candidateWeight - value)

    if (candidateDistance === nearestDistance) {
      return candidateWeight > nearestWeight ? candidateWeight : nearestWeight
    }

    return candidateDistance < nearestDistance ? candidateWeight : nearestWeight
  }, supportedWeights[0] ?? 400)
}

function getDesktopFontWeightSliderStep(supportedWeights: readonly number[]) {
  const sortedWeights = [...new Set(supportedWeights)].sort((a, b) => a - b)

  if (sortedWeights.length < 2) {
    return 1
  }

  return Math.min(
    ...sortedWeights.slice(1).map((fontWeight, index) => fontWeight - sortedWeights[index]),
  )
}

function DesktopPlaceholderInspector({ tool }: { tool: DesktopToolbarTool }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title={tool.title} />
    </div>
  )
}

export { DESKTOP_TOOLBAR_TOOLS }
