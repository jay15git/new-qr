"use client"

import { Image02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import type {
  CornerDotType,
  CornerSquareType,
  ErrorCorrectionLevel,
  FileExtension,
  TypeNumber,
} from "qr-code-styling"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  ItalicIcon,
  ListFilterIcon,
  MoonIcon,
  Redo2Icon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  Settings,
  ShapesIcon,
  Sparkles,
  SunIcon,
  TypeIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"

import { BlocksIcon } from "@/components/animate-ui/icons/blocks"
import {
  BRAND_ICON_CATALOG,
  filterBrandIcons,
  type BrandIconCategory,
  type BrandIconEntry,
} from "@/components/qr/brand-icon-catalog"
import { DEFAULT_BRAND_ICON_COLOR } from "@/components/qr/brand-icon-svg"
import {
  DRAFTING_CARD_PATTERN_NONE_ID,
  DRAFTING_CARD_PATTERNS,
  getDraftingCardPatternStyle,
  type DraftingCardPatternSelectionId,
} from "@/components/new/drafting-card-patterns"
import { DEFAULT_DRAFTING_CARD_STATE } from "@/components/new/drafting-card-state"
import {
  getCardGeneratedShaderDefinitions,
  getCardImageFilterDefinitions,
  getPaperShaderDefinition,
  type PaperShaderId,
} from "@/components/new/drafting-paper-shaders"
import {
  DEFAULT_DRAFTING_TEXT_LAYER,
  type DraftingTextAlign,
  type DraftingTextFontStyle,
  type DraftingTextFontWeight,
} from "@/components/new/drafting-layer-state"
import {
  DRAFTING_FONT_REGISTRY,
  getDraftingFontCssFamily,
  loadDraftingFont,
  resolveDraftingFont,
} from "@/components/new/drafting-font-registry"
import {
  buildStaticQrPayload,
  getDefaultStaticQrValues,
  STATIC_QR_CONTENT_META,
  validateStaticQrContent,
  type StaticQrContentValue,
  type StaticQrContentValues,
} from "@/components/qr/qr-static-content"
import {
  QR_BACKGROUND_SHAPES,
  type QrBackgroundShapeId,
} from "@/components/qr/qr-background-shapes"
import {
  CORNER_DOT_STYLE_OPTIONS,
  CORNER_SQUARE_STYLE_OPTIONS,
  DOT_STYLE_OPTIONS,
} from "@/components/qr/qr-style-options"
import { StylePreview, type StylePreviewKind } from "@/components/qr/qr-style-preview-renderer"
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
  type StudioDotType,
} from "@/components/qr/qr-studio-state"
import {
  ERROR_CORRECTION_LEVEL_OPTIONS,
  TYPE_NUMBER_MAX,
  TYPE_NUMBER_MIN,
  formatTypeNumberLabel,
} from "@/components/qr/qr-encoding-options"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/qr-input-config"
import { DownloadIcon as AnimatedDownloadIcon } from "@/components/ui/download"
import { GalleryVerticalEndIcon } from "@/components/ui/gallery-vertical-end"
import { GripIcon } from "@/components/ui/grip"
import { LayersIcon } from "@/components/ui/layers"
import LetterTIcon from "@/components/ui/letter-t-icon"
import { MessageCircleIcon } from "@/components/ui/message-circle"
import { PlayIcon } from "@/components/ui/play"
import { ReceiptTextIcon } from "@/components/ui/receipt-text"
import { cn } from "@/lib/utils"

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
    title: "Shape",
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
    group: "Add",
    id: "text",
    title: "Text",
    renderIcon: () => <LetterTIcon size={18} />,
  },
  {
    group: "Add",
    id: "image",
    title: "Image",
    renderIcon: () => <GalleryVerticalEndIcon size={18} />,
  },
  {
    group: "Add",
    id: "decorations",
    title: "Decorations",
    renderIcon: () => <ShapesIcon className="size-[18px]" />,
  },
  {
    group: "Add",
    id: "effects",
    title: "Effects",
    renderIcon: () => <Sparkles className="size-[18px]" />,
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
}> = [{ id: "all", label: "All QR Types" }, ...DESKTOP_CONTENT_COLLECTIONS]

const DESKTOP_ALL_CONTENT_TYPES = Array.from(
  new Set<QrInputType>([
    ...DESKTOP_CONTENT_PRESET_TYPES,
    ...DESKTOP_CONTENT_COLLECTIONS.flatMap((collection) => collection.types),
  ]),
)

export type DesktopPatternSettings = {
  dotsColorMode: DotsColorMode
  dotsGradient: StudioGradient
  dotsPalette: string[]
  dotsSolidColor: string
  qrDotType: StudioDotType
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
  cornerDotType: CornerDotType
  cornerSquareColorMode: DesktopCornerColorMode
  cornerSquareGradient: StudioGradient
  cornerSquareSolidColor: string
  cornerSquareType: CornerSquareType
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
  shadowBlur: number
  shadowColor: string
  shadowOffsetX: number
  shadowOffsetY: number
  shadowOpacity: number
}

export type DesktopMotionSettings = QrDotMatrixAnimationOptions

export type DesktopEncodingSettings = {
  errorCorrectionLevel: ErrorCorrectionLevel
  typeNumber: TypeNumber
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

export type DesktopLayerKind = "card" | "qr" | "text"
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
  extension: FileExtension
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
  onActiveToolChange: (toolId: DesktopToolbarToolId) => void
  onRedo?: () => void
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
  FileExtension
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
  dotsGradient: DEFAULT_DESKTOP_DOTS_GRADIENT,
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
  cornerDotType: "dot",
  cornerSquareColorMode: "solid",
  cornerSquareGradient: {
    ...DEFAULT_DESKTOP_DOTS_GRADIENT,
    colorStops: [
      { offset: 0, color: "#18181b" },
      { offset: 1, color: "#52525b" },
    ],
  },
  cornerSquareSolidColor: "#18181b",
  cornerSquareType: "extra-rounded",
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

const DESKTOP_INSPECTOR_SECTION_CLASS = "rounded-[10px] bg-[var(--desktop-inspector-section-bg)] p-3"
const DESKTOP_INSPECTOR_CONTROL_CLASS =
  "rounded-[6px] bg-[var(--desktop-inspector-control-bg)] text-white/58 transition hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
const DESKTOP_INSPECTOR_SELECTED_CLASS =
  "bg-[var(--desktop-inspector-selected-bg)] text-[var(--desktop-inspector-selected-fg)] hover:bg-[var(--desktop-inspector-selected-bg)] hover:text-[var(--desktop-inspector-selected-fg)]"
const DESKTOP_INSPECTOR_INPUT_CLASS =
  "bg-[var(--desktop-inspector-field-bg)] text-white outline-none placeholder:text-white/32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
const DESKTOP_INSPECTOR_FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"
const DESKTOP_INSPECTOR_HEADER_CLASS =
  "flex min-w-0 items-center justify-center bg-[var(--desktop-inspector-header-bg)] px-4 py-3.5 text-center"
const DESKTOP_INSPECTOR_FOOTER_CLASS =
  "bg-[var(--desktop-inspector-footer-bg)] p-3"
const DESKTOP_INSPECTOR_RESET_CLASS =
  "flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--desktop-inspector-control-bg)] px-3 text-[12px] font-semibold text-white/82 transition hover:bg-[var(--desktop-inspector-control-hover-bg)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--desktop-inspector-focus)]"

export function DesktopToolbarPrototype({
  controller,
  theme,
  onThemeChange,
}: {
  controller?: DesktopToolbarController
  theme?: DesktopThemeMode
  onThemeChange?: (theme: DesktopThemeMode) => void
} = {}) {
  const [activeTool, setActiveTool] = useState<DesktopToolbarToolId | null>(null)
  const [desktopTheme, setDesktopTheme] = useState<DesktopThemeMode>("dark")
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

  function handleContentReset() {
    setContentValuesByType((current) => ({
      ...current,
      [selectedContentType]: getDefaultStaticQrValues(selectedContentType),
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
        data-slot="desktop-toolbar-prototype"
        className={cn(
          "relative min-h-dvh overflow-hidden transition-colors duration-200",
          actualDesktopTheme === "light" ? "bg-[#f4f6f9]" : "bg-[#07080a]",
        )}
      >
        <DesktopThemeStyles />
        <div className="fixed right-5 top-5 z-30 inline-flex items-center gap-2 max-md:right-4 max-md:top-4">
          <button
            aria-label={`Switch to ${actualDesktopTheme === "light" ? "dark" : "light"} mode`}
            data-slot="desktop-theme-toggle"
            data-toolbar-appearance="desktop-glass"
            className="grid size-14 place-items-center rounded-full border border-white/[0.12] bg-black/55 text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl transition hover:bg-white/[0.11] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
            type="button"
            onClick={handleDesktopThemeToggle}
          >
            {actualDesktopTheme === "light" ? (
              <MoonIcon className="size-4" />
            ) : (
              <SunIcon className="size-4" />
            )}
          </button>
          <div
            data-slot="desktop-action-toolbar"
            data-toolbar-appearance="desktop-glass"
            className="inline-flex min-h-14 items-center gap-1 rounded-full border border-white/[0.12] bg-black/55 px-3 py-1.5 text-white/72 shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
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
        </div>
        <nav
          aria-label="Desktop tools"
          data-slot="desktop-floating-toolbar"
          className="fixed bottom-5 left-5 top-5 z-[25] flex w-14 flex-col items-center justify-start gap-1.5 overflow-y-auto rounded-full border border-white/[0.12] bg-black/55 p-1.5 text-white/72 shadow-[0_22px_55px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl max-md:bottom-4 max-md:left-3 max-md:top-4 max-md:w-12 max-md:p-1"
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
                        "grid size-11 place-items-center rounded-full text-current transition-[background-color,color,box-shadow,transform] duration-150 ease-out outline-none hover:bg-white/[0.11] hover:text-white focus-visible:ring-2 focus-visible:ring-white/45 active:scale-95 max-md:size-10",
                        isActive &&
                          "bg-white/[0.18] text-white shadow-none hover:bg-white/[0.2]",
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
        </nav>

        {activeToolConfig ? (
          <aside
            aria-label={`${activeToolConfig.title} settings`}
            data-slot="desktop-floating-inspector"
            className="fixed bottom-5 left-[5.75rem] top-5 z-[25] flex w-72 min-w-0 flex-col overflow-hidden rounded-[24px] border border-white/[0.1] bg-black/55 text-white shadow-[0_24px_65px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl max-md:bottom-4 max-md:left-[4.25rem] max-md:top-4 max-md:w-[min(16rem,calc(100vw-5rem))] max-md:rounded-[22px]"
          >
            {actualActiveTool === "content" ? (
              <DesktopContentInspector
                contentType={actualContentType}
                contentValues={actualContentValues}
                encodedValue={actualEncodedContentValue}
                validation={actualContentValidation}
                onContentReset={controller?.onContentReset ?? handleContentReset}
                onContentTypeChange={controller?.onContentTypeChange ?? handleContentTypeChange}
                onContentValueChange={controller?.onContentValueChange ?? handleContentValueChange}
              />
            ) : actualActiveTool === "pattern" ? (
              <DesktopPatternInspector
                desktopTheme={actualDesktopTheme}
                settings={actualPatternSettings}
                onPatternReset={controller?.onPatternReset ?? (() => setPatternSettings(DEFAULT_DESKTOP_PATTERN_SETTINGS))}
                onPatternSettingsChange={onPatternSettingsChange}
              />
            ) : actualActiveTool === "corners" ? (
              <DesktopCornersInspector
                desktopTheme={actualDesktopTheme}
                settings={actualCornersSettings}
                onCornersReset={controller?.onCornersReset ?? (() => setCornersSettings(DEFAULT_DESKTOP_CORNERS_SETTINGS))}
                onCornersSettingsChange={onCornersSettingsChange}
              />
            ) : actualActiveTool === "logo" ? (
              <DesktopLogoInspector
                settings={actualLogoSettings}
                onLogoReset={controller?.onLogoReset ?? (() => setLogoSettings(DEFAULT_DESKTOP_LOGO_SETTINGS))}
                onLogoSettingsChange={onLogoSettingsChange}
              />
            ) : actualActiveTool === "shape" ? (
              <DesktopShapeInspector
                desktopTheme={actualDesktopTheme}
                settings={actualShapeSettings}
                onShapeReset={controller?.onShapeReset ?? (() => setShapeSettings(DEFAULT_DESKTOP_SHAPE_SETTINGS))}
                onShapeSettingsChange={onShapeSettingsChange}
              />
            ) : actualActiveTool === "motion" ? (
              <DesktopMotionInspector
                settings={actualMotionSettings}
                onMotionReset={controller?.onMotionReset ?? (() => setMotionSettings(DEFAULT_DESKTOP_MOTION_SETTINGS))}
                onMotionSettingsChange={onMotionSettingsChange}
              />
            ) : actualActiveTool === "encoding" ? (
              <DesktopEncodingInspector
                settings={actualEncodingSettings}
                onEncodingReset={controller?.onEncodingReset ?? (() => setEncodingSettings(DEFAULT_DESKTOP_ENCODING_SETTINGS))}
                onEncodingSettingsChange={onEncodingSettingsChange}
              />
            ) : actualActiveTool === "text" ? (
              <DesktopTextInspector
                settings={actualTextSettings}
                onTextReset={controller?.onTextReset ?? (() => setTextSettings(DEFAULT_DESKTOP_TEXT_SETTINGS))}
                onTextSettingsChange={onTextSettingsChange}
              />
            ) : actualActiveTool === "image" ? (
              <DesktopImageInspector
                settings={actualImageSettings}
                onImageReset={controller?.onImageReset ?? (() => setImageSettings(DEFAULT_DESKTOP_IMAGE_SETTINGS))}
                onImageSettingsChange={onImageSettingsChange}
              />
            ) : actualActiveTool === "decorations" ? (
              <DesktopDecorationsInspector
                settings={actualDecorationsSettings}
                onDecorationsReset={controller?.onDecorationsReset ?? (() => setDecorationsSettings(DEFAULT_DESKTOP_DECORATIONS_SETTINGS))}
                onDecorationsSettingsChange={onDecorationsSettingsChange}
              />
            ) : actualActiveTool === "effects" ? (
              <DesktopEffectsInspector
                settings={actualEffectsSettings}
                onEffectsReset={controller?.onEffectsReset ?? (() => setEffectsSettings(DEFAULT_DESKTOP_EFFECTS_SETTINGS))}
                onEffectsSettingsChange={onEffectsSettingsChange}
              />
            ) : actualActiveTool === "layers" ? (
              <DesktopLayersInspector
                settings={actualLayersSettings}
                onLayersReset={controller?.onLayersReset ?? (() => setLayersSettings(DEFAULT_DESKTOP_LAYERS_SETTINGS))}
                onLayersSettingsChange={onLayersSettingsChange}
              />
            ) : actualActiveTool === "export" ? (
              <DesktopExportInspector
                settings={actualExportSettings}
                onExportDownload={controller?.onExportDownload ?? (() => undefined)}
                onExportReset={controller?.onExportReset ?? (() => setExportSettings(DEFAULT_DESKTOP_EXPORT_SETTINGS))}
                onExportSettingsChange={onExportSettingsChange}
              />
            ) : (
              <DesktopPlaceholderInspector tool={activeToolConfig} />
            )}
          </aside>
        ) : null}
      </section>
    </TooltipProvider>
  )
}

function DesktopThemeStyles() {
  return (
    <style>{`
      [data-desktop-theme="light"] {
        color-scheme: light;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"],
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"],
      [data-desktop-theme="light"] [data-slot="desktop-theme-toggle"],
      [data-desktop-theme="light"] [data-slot="desktop-action-toolbar"] {
        background: rgba(255, 255, 255, 0.72) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        color: rgba(15, 23, 42, 0.68) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"] button:hover,
      [data-desktop-theme="light"] [data-slot="desktop-theme-toggle"]:hover,
      [data-desktop-theme="light"] [data-slot="desktop-action-toolbar"] button:hover {
        background: rgba(15, 23, 42, 0.08) !important;
        color: rgba(15, 23, 42, 0.92) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"] button[aria-pressed="true"] {
        background: rgba(15, 23, 42, 0.11) !important;
        color: rgba(15, 23, 42, 0.96) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-toolbar"] [class*="border-white"] {
        border-color: rgba(15, 23, 42, 0.11) !important;
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

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [class*="text-white"] {
        color: rgba(15, 23, 42, 0.82) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] h2,
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] p[class*="font-semibold"],
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] label,
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] summary {
        color: rgba(15, 23, 42, 0.92) !important;
      }

      [data-slot="desktop-floating-inspector"] {
        --desktop-inspector-section-bg: rgba(255, 255, 255, 0.045);
        --desktop-inspector-header-bg: rgba(255, 255, 255, 0.025);
        --desktop-inspector-footer-bg: rgba(0, 0, 0, 0.18);
        --desktop-inspector-control-bg: rgba(0, 0, 0, 0.22);
        --desktop-inspector-control-hover-bg: rgba(255, 255, 255, 0.09);
        --desktop-inspector-selected-bg: #f8fafc;
        --desktop-inspector-selected-fg: #111827;
        --desktop-inspector-field-bg: rgba(0, 0, 0, 0.22);
        --desktop-inspector-focus: rgba(255, 255, 255, 0.36);
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] {
        --desktop-inspector-section-bg: rgba(15, 23, 42, 0.055);
        --desktop-inspector-header-bg: rgba(15, 23, 42, 0.025);
        --desktop-inspector-footer-bg: rgba(15, 23, 42, 0.045);
        --desktop-inspector-control-bg: rgba(15, 23, 42, 0.065);
        --desktop-inspector-control-hover-bg: rgba(15, 23, 42, 0.1);
        --desktop-inspector-selected-bg: #111827;
        --desktop-inspector-selected-fg: #ffffff;
        --desktop-inspector-field-bg: rgba(255, 255, 255, 0.62);
        --desktop-inspector-focus: rgba(15, 23, 42, 0.36);
      }

      [data-slot="desktop-floating-inspector"] :is(input, textarea, select) {
        background-color: var(--desktop-inspector-field-bg) !important;
        border-color: transparent !important;
        color: currentColor !important;
        box-shadow: none !important;
      }

      [data-slot="desktop-floating-inspector"] :is(input, textarea, select):focus,
      [data-slot="desktop-floating-inspector"] :is(input, textarea, select):focus-visible {
        border-color: transparent !important;
        box-shadow: inset 0 0 0 1px var(--desktop-inspector-focus) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] input,
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] textarea,
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] select {
        color: rgba(15, 23, 42, 0.92) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] input::placeholder,
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] textarea::placeholder {
        color: rgba(15, 23, 42, 0.36) !important;
      }

      [data-slot="desktop-floating-inspector"] button {
        border-color: transparent !important;
      }

      [data-slot="desktop-floating-inspector"] button[aria-pressed="true"]:not([data-desktop-tool-button="true"]) {
        background-color: var(--desktop-inspector-selected-bg) !important;
        border-color: transparent !important;
        color: var(--desktop-inspector-selected-fg) !important;
        box-shadow: none !important;
      }

      [data-slot="desktop-floating-inspector"] button[aria-pressed="true"]:not([data-desktop-tool-button="true"]) :is(span, svg) {
        color: var(--desktop-inspector-selected-fg) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] button[data-desktop-content-type-option="true"] {
        border-color: transparent !important;
        color: rgba(15, 23, 42, 0.48) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] button[data-desktop-content-type-option="true"]:hover {
        background-color: rgba(15, 23, 42, 0.06) !important;
        color: rgba(15, 23, 42, 0.86) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] button[data-desktop-content-type-option="true"][aria-pressed="true"] {
        background-color: var(--desktop-inspector-selected-bg) !important;
        border-color: transparent !important;
        color: var(--desktop-inspector-selected-fg) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-export-download"] {
        background-color: #111827 !important;
        color: #ffffff !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-toolbar-separator"] {
        background-color: rgba(15, 23, 42, 0.11) !important;
      }

      [data-slot="desktop-floating-inspector"] {
        background: rgba(0, 0, 0, 0.55) !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
        border-radius: 24px !important;
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
        backdrop-filter: blur(40px) !important;
      }

      [data-slot="desktop-floating-inspector"] .scroll-fade-effect-y > section,
      [data-slot="desktop-floating-inspector"] .scroll-fade-effect-y > div,
      [data-slot="desktop-floating-inspector"] .scroll-fade-effect-y > details {
        background: var(--desktop-inspector-section-bg) !important;
        border-width: 0 !important;
        border-top-width: 0 !important;
        border-radius: 10px !important;
        box-shadow: none !important;
        margin-top: 12px !important;
        padding: 12px !important;
      }

      [data-slot="desktop-floating-inspector"] .scroll-fade-effect-y > :first-child {
        border-top-width: 0 !important;
        margin-top: 0 !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] {
        background: rgba(255, 255, 255, 0.72) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] .scroll-fade-effect-y > section,
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] .scroll-fade-effect-y > div,
      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] .scroll-fade-effect-y > details {
        background: var(--desktop-inspector-section-bg) !important;
        border-top-color: rgba(15, 23, 42, 0.1) !important;
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
        background: rgba(0, 0, 0, 0.88) !important;
        border-color: rgba(255, 255, 255, 0.18) !important;
        color: #f8fafc !important;
      }

      [data-slot="desktop-floating-inspector"] [data-desktop-adaptive-option-preview="true"] svg {
        color: #f8fafc !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-desktop-adaptive-option-preview="true"] {
        background: rgba(255, 255, 255, 0.86) !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
        color: #18181b !important;
      }

      [data-desktop-theme="light"] [data-slot="desktop-floating-inspector"] [data-desktop-adaptive-option-preview="true"] svg {
        color: #18181b !important;
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
      <h2 className="truncate text-[15px] font-semibold leading-5 text-white">{title}</h2>
    </div>
  )
}

function DesktopInspectorFooter({
  label,
  onReset,
}: {
  label: string
  onReset: () => void
}) {
  return (
    <div className={DESKTOP_INSPECTOR_FOOTER_CLASS}>
      <button
        aria-label={label}
        className={DESKTOP_INSPECTOR_RESET_CLASS}
        type="button"
        onClick={onReset}
      >
        <RotateCcwIcon className="size-3.5" />
        {label}
      </button>
    </div>
  )
}

function getDesktopAdaptiveOptionPreviewStyle(desktopTheme: DesktopThemeMode): CSSProperties {
  return {
    backgroundColor: desktopTheme === "light" ? "rgba(255, 255, 255, 0.86)" : "rgba(0, 0, 0, 0.88)",
    borderColor: desktopTheme === "light" ? "rgba(15, 23, 42, 0.14)" : "rgba(255, 255, 255, 0.18)",
    color: desktopTheme === "light" ? "#18181b" : "#f8fafc",
  }
}

function DesktopLogoInspector({
  onLogoReset,
  onLogoSettingsChange,
  settings,
}: {
  onLogoReset: () => void
  onLogoSettingsChange: (patch: Partial<DesktopLogoSettings>) => void
  settings: DesktopLogoSettings
}) {
  const [category, setCategory] = useState<BrandIconCategory | "all">("all")
  const [query, setQuery] = useState("")
  const brandIcons = useMemo(
    () => filterBrandIcons(query, category).slice(0, 24),
    [category, query],
  )

  return (
    <div data-slot="desktop-logo-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Logo" />

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Source</p>
          <div className="grid grid-cols-4 gap-1.5" data-slot="desktop-logo-source-mode">
            {DESKTOP_LOGO_SOURCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Use ${option.label} logo source`}
                aria-pressed={settings.sourceMode === option.value}
                className={cn(
                  "h-8 px-1.5 text-[10px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.sourceMode === option.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onLogoSettingsChange({ sourceMode: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {settings.sourceMode === "brand" ? (
          <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
            <div className="flex min-w-0 items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <select
                  aria-label="Logo icon category"
                  className={cn(
                    "h-8 w-full appearance-none rounded-[6px] px-2.5 pr-7 text-[12px] font-semibold transition",
                    DESKTOP_INSPECTOR_INPUT_CLASS,
                  )}
                  value={category}
                  onChange={(event) => setCategory(event.currentTarget.value as BrandIconCategory | "all")}
                >
                  {DESKTOP_BRAND_ICON_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-white/55" />
              </div>
              <div className="relative h-8 w-24 shrink-0">
                <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-white/45" />
                <input
                  aria-label="Search logo icons"
                  className={cn(
                    "h-full w-full rounded-[6px] pl-7 pr-2 text-[12px]",
                    DESKTOP_INSPECTOR_INPUT_CLASS,
                  )}
                  placeholder="Search"
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                />
              </div>
            </div>

            <div
              aria-label="Brand icons"
              className="mt-2 grid max-h-44 grid-cols-4 gap-1.5 overflow-y-auto pr-1"
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
          </section>
        ) : null}

        {settings.sourceMode === "upload" || settings.sourceMode === "url" ? (
          <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
            <p className="mb-2 truncate text-[12px] font-semibold text-white">Upload</p>
            <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-logo-upload-mode">
              {DESKTOP_ASSET_SOURCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  aria-label={`Use ${option.label} logo asset`}
                  aria-pressed={settings.uploadMode === option.value}
                  className={cn(
                    "h-8 px-2 text-[11px] font-semibold",
                    DESKTOP_INSPECTOR_CONTROL_CLASS,
                    settings.uploadMode === option.value &&
                      DESKTOP_INSPECTOR_SELECTED_CLASS,
                  )}
                  type="button"
                  onClick={() => onLogoSettingsChange({ uploadMode: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <input
              aria-label="Remote logo URL"
              className={cn("mt-2 h-9 w-full rounded-[7px] px-3 text-[12px]", DESKTOP_INSPECTOR_INPUT_CLASS)}
              placeholder="https://example.com/logo.png"
              value={settings.remoteUrl}
              onChange={(event) => onLogoSettingsChange({ remoteUrl: event.currentTarget.value })}
            />
          </section>
        ) : null}

        {settings.sourceMode === "brand" ? (
          <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
            <div className="mb-3 flex min-w-0 items-center gap-3">
              <DesktopCornerColorPreview
                gradient={settings.gradient}
                mode={settings.colorMode}
                solidColor={settings.solidColor}
                className="size-12 shrink-0 rounded-[8px]"
              />
              <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-white">
                Icon Color
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-logo-color-mode">
              {DESKTOP_CORNER_COLOR_MODES.map((option) => (
                <button
                  key={option.value}
                  aria-label={`Use ${option.value} logo color`}
                  aria-pressed={settings.colorMode === option.value}
                  className={cn(
                    "h-8 rounded-[6px] border border-white/[0.09] bg-black/22 px-2 text-[11px] font-semibold text-white/58 transition hover:bg-white/[0.09] hover:text-white",
                    settings.colorMode === option.value &&
                      DESKTOP_INSPECTOR_SELECTED_CLASS,
                  )}
                  type="button"
                  onClick={() => onLogoSettingsChange({ colorMode: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {settings.colorMode === "solid" ? (
              <div className="mt-3">
                <DesktopColorInputRow
                  label="Logo icon color"
                  value={settings.solidColor}
                  onChange={(solidColor) => onLogoSettingsChange({ solidColor })}
                />
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
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
          </section>
        ) : null}

        {settings.sourceMode !== "none" ? (
          <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
            <p className="mb-3 truncate text-[12px] font-semibold text-white">Size</p>
            <DesktopMotionSliderRow
              label="Logo size"
              max={100}
              min={0}
              value={settings.size}
              valueLabel={`${Math.round(settings.size)}%`}
              onChange={(size) => onLogoSettingsChange({ size })}
            />
            <div className="mt-3 grid gap-2">
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
      </div>

      <DesktopInspectorFooter label="Reset Logo" onReset={onLogoReset} />
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
      className={cn(
        "relative grid h-12 min-w-0 place-items-center rounded-[7px] border border-white/[0.08] bg-white/[0.055] text-white/70 transition hover:bg-white/[0.1] hover:text-white",
        selected && DESKTOP_INSPECTOR_SELECTED_CLASS,
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
  onCornersReset,
  onCornersSettingsChange,
  settings,
}: {
  desktopTheme: DesktopThemeMode
  onCornersReset: () => void
  onCornersSettingsChange: (patch: Partial<DesktopCornersSettings>) => void
  settings: DesktopCornersSettings
}) {
  return (
    <div data-slot="desktop-corners-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Corners" />

      <div data-impeccable-variants="a34b4748" data-impeccable-variant-count="3" style={{ display: "contents" }}>
        {/* impeccable-variants-start a34b4748 */}
        {/* Original */}
        <div data-impeccable-variant="original">
          <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
            <section className="p-0">
              <div className="mb-2 min-w-0">
                <p className="truncate text-[12px] font-semibold text-white">Corner Frame</p>
              </div>
              <div
                aria-label="Corner frame presets"
                data-slot="desktop-corner-frame-preset-shelf"
                className="grid grid-cols-3 gap-2"
              >
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

            <section className="mt-4 p-0">
              <div className="mb-2 min-w-0">
                <p className="truncate text-[12px] font-semibold text-white">Corner Dot</p>
              </div>
              <div
                aria-label="Corner dot presets"
                data-slot="desktop-corner-dot-preset-shelf"
                className="grid grid-cols-3 gap-2"
              >
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

            <div className={cn("mt-3 flex items-center justify-between gap-3 px-3 py-2.5", DESKTOP_INSPECTOR_SECTION_CLASS)}>
              <div className="flex min-w-0 items-center gap-2">
                <ShieldCheckIcon className="size-4 shrink-0 text-white/55" />
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-white">Scan Safety</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200">
                Valid
              </span>
            </div>
          </div>
        </div>
        {/* Variants: insert below this line */}
        {/* impeccable-variants-end a34b4748 */}
      </div>

      <DesktopInspectorFooter label="Reset Corners" onReset={onCornersReset} />
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
      className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}
      data-slot={dataSlot}
    >
      <div className="mb-3 flex min-w-0 items-center gap-3">
        <DesktopCornerColorPreview
          gradient={gradient}
          mode={mode}
          solidColor={solidColor}
          className="size-12 shrink-0 rounded-[8px]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-white">{title}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {DESKTOP_CORNER_COLOR_MODES.map((option) => (
          <button
            key={option.value}
            aria-label={`Use ${option.value} ${target} color`}
            aria-pressed={mode === option.value}
            className={cn(
              "h-8 rounded-[6px] border border-white/[0.09] bg-black/22 px-2 text-[11px] font-semibold text-white/58 transition hover:bg-white/[0.09] hover:text-white",
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
        <div className="mt-3">
          <DesktopColorInputRow
            label={`${colorLabelPrefix} solid color`}
            value={solidColor}
            onChange={onSolidColorChange}
          />
        </div>
      ) : null}

      {mode === "gradient" ? (
        <div className="mt-3 grid gap-2">
          <DesktopColorInputRow
            label={`${colorLabelPrefix} start color`}
            value={gradient.colorStops[0].color}
            onChange={(color) => onGradientChange(updateDesktopGradientColor(gradient, 0, color))}
          />
          <DesktopColorInputRow
            label={`${colorLabelPrefix} end color`}
            value={gradient.colorStops[1].color}
            onChange={(color) => onGradientChange(updateDesktopGradientColor(gradient, 1, color))}
          />
          <DesktopSegmentedRow
            label={`${colorLabelPrefix} gradient type`}
            options={DESKTOP_GRADIENT_TYPE_OPTIONS}
            value={gradient.type}
            onChange={(type) => onGradientChange({ ...gradient, enabled: true, type })}
          />
        </div>
      ) : null}
    </section>
  )
}

function DesktopCornerColorPreview({
  className,
  gradient,
  mode,
  solidColor,
}: {
  className?: string
  gradient: StudioGradient
  mode: DesktopCornerColorMode
  solidColor: string
}) {
  const background = getDesktopCornerColorPreviewBackground({ gradient, mode, solidColor })

  return (
    <span
      aria-hidden="true"
      data-slot="desktop-style-preview-surface"
      className={cn(
        "block overflow-hidden border border-white/[0.1] bg-[#15161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      style={{ background }}
    />
  )
}

function DesktopCornerStyleButton({
  desktopTheme,
  label,
  onClick,
  previewKind,
  selected,
  target,
  value,
}: {
  desktopTheme: DesktopThemeMode
  label: string
  onClick: () => void
  previewKind: Extract<StylePreviewKind, "corner-dot" | "corner-square">
  selected: boolean
  target: "corner dot" | "corner frame"
  value: CornerDotType | CornerSquareType
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-1.5">
      <button
        aria-label={`Use ${label} ${target}`}
        aria-pressed={selected}
        data-desktop-preview-option="true"
        className="relative aspect-square w-full min-w-0 rounded-[7px] p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
        type="button"
        onClick={onClick}
      >
        <span
          aria-hidden="true"
          data-desktop-adaptive-option-preview="true"
          data-slot="desktop-style-preview-surface"
          className={cn(
            "grid size-full place-items-center overflow-hidden rounded-[6px] border border-white/[0.1] bg-[#15161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition group-hover:brightness-110",
            selected && "border-black",
          )}
          style={getDesktopAdaptiveOptionPreviewStyle(desktopTheme)}
        >
          <span className="grid size-[62%] place-items-center [&_svg]:size-full [&_svg]:text-current">
            <StylePreview previewKind={previewKind} value={value} />
          </span>
        </span>
      </button>
      <span className="block w-full truncate px-0.5 text-center text-[10px] font-semibold text-white/72">
        {label}
      </span>
    </div>
  )
}

function getDesktopCornerColorPreviewBackground({
  gradient,
  mode,
  solidColor,
}: {
  gradient: StudioGradient
  mode: DesktopCornerColorMode
  solidColor: string
}) {
  if (mode === "gradient") {
    const [start, end] = gradient.colorStops
    const gradientType = gradient.type === "radial" ? "radial-gradient(circle" : "linear-gradient(135deg"

    return `${gradientType}, ${start.color}, ${end.color})`
  }

  return solidColor
}

function DesktopShapeInspector({
  desktopTheme,
  onShapeReset,
  onShapeSettingsChange,
  settings,
}: {
  desktopTheme: DesktopThemeMode
  onShapeReset: () => void
  onShapeSettingsChange: (patch: Partial<DesktopShapeSettings>) => void
  settings: DesktopShapeSettings
}) {
  const selectedShapeLabel =
    settings.backgroundShapeId === "none"
      ? "None"
      : (QR_BACKGROUND_SHAPES.find((shape) => shape.id === settings.backgroundShapeId)?.label ??
        "Custom")

  return (
    <div data-slot="desktop-shape-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Shape" />

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className="p-0">
          <div className="mb-2 min-w-0">
            <p className="truncate text-[12px] font-semibold text-white">Shape Options</p>
          </div>
          <div
            aria-label="Shape options"
            data-slot="desktop-shape-preset-shelf"
            className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1"
          >
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
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="mb-3 flex min-w-0 items-center gap-3">
            <DesktopShapePreview
              label={selectedShapeLabel}
              settings={settings}
              shapeId={settings.backgroundShapeId}
              className="size-12 shrink-0 rounded-[8px]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white">Shape Color</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-shape-color-mode">
            {DESKTOP_SHAPE_COLOR_MODES.map((mode) => (
              <button
                key={mode.value}
                aria-label={`Use ${mode.value} shape color`}
                aria-pressed={settings.shapeColorMode === mode.value}
                className={cn(
                  "h-8 rounded-[6px] border border-white/[0.09] bg-black/22 px-2 text-[11px] font-semibold text-white/58 transition hover:bg-white/[0.09] hover:text-white",
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
            <div className="mt-3">
              <DesktopColorInputRow
                label="Shape solid color"
                value={settings.shapeSolidColor}
                onChange={(shapeSolidColor) => onShapeSettingsChange({ shapeSolidColor })}
              />
            </div>
          ) : null}

          {settings.shapeColorMode === "gradient" ? (
            <div className="mt-3 grid gap-2">
              <DesktopColorInputRow
                label="Shape start color"
                value={settings.shapeGradient.colorStops[0].color}
                onChange={(color) =>
                  onShapeSettingsChange({
                    shapeGradient: updateDesktopGradientColor(settings.shapeGradient, 0, color),
                  })
                }
              />
              <DesktopColorInputRow
                label="Shape end color"
                value={settings.shapeGradient.colorStops[1].color}
                onChange={(color) =>
                  onShapeSettingsChange({
                    shapeGradient: updateDesktopGradientColor(settings.shapeGradient, 1, color),
                  })
                }
              />
              <DesktopSegmentedRow
                label="Shape gradient type"
                options={DESKTOP_GRADIENT_TYPE_OPTIONS}
                value={settings.shapeGradient.type}
                onChange={(type) =>
                  onShapeSettingsChange({ shapeGradient: { ...settings.shapeGradient, type } })
                }
              />
            </div>
          ) : null}
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Frame</p>
          <div className="grid gap-2">
            <DesktopMotionToggleRow
              checked={settings.cardEnabled}
              label="Show shape"
              onChange={(cardEnabled) => onShapeSettingsChange({ cardEnabled })}
            />
            <DesktopNumberRow
              label="Corner radius"
              max={64}
              min={0}
              value={settings.cardRadius}
              onChange={(cardRadius) => onShapeSettingsChange({ cardRadius })}
            />
            <DesktopNumberRow
              label="Padding"
              max={72}
              min={8}
              value={settings.padding}
              onChange={(padding) => onShapeSettingsChange({ padding })}
            />
            <DesktopNumberRow
              label="Bottom space"
              max={240}
              min={0}
              value={settings.bottomSpace}
              onChange={(bottomSpace) => onShapeSettingsChange({ bottomSpace })}
            />
          </div>
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Fill</p>
          <DesktopColorInputRow
            label="Shape fill color"
            value={settings.cardFill}
            onChange={(cardFill) => onShapeSettingsChange({ cardFill })}
          />
          <div className="mt-3 grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto pr-1" data-slot="desktop-shape-patterns">
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Image</p>
          <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-shape-image-source">
            {DESKTOP_ASSET_SOURCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Use ${option.label} shape image source`}
                aria-pressed={settings.cardImageSourceMode === option.value}
                className={cn(
                  "h-8 px-2 text-[11px] font-semibold",
                  DESKTOP_INSPECTOR_CONTROL_CLASS,
                  settings.cardImageSourceMode === option.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onShapeSettingsChange({ cardImageSourceMode: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input
            aria-label="Shape image URL"
            className={cn("mt-2 h-9 w-full rounded-[7px] px-3 text-[12px]", DESKTOP_INSPECTOR_INPUT_CLASS)}
            placeholder="https://example.com/shape.png"
            value={settings.cardImageUrl}
            onChange={(event) => onShapeSettingsChange({ cardImageUrl: event.currentTarget.value })}
          />
          <div className="mt-3 grid grid-cols-2 gap-1.5">
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
          <div className="mt-3">
            <DesktopMotionSliderRow
              label="Image opacity"
              max={100}
              min={0}
              value={settings.cardImageOpacity}
              valueLabel={`${Math.round(settings.cardImageOpacity)}%`}
              onChange={(cardImageOpacity) => onShapeSettingsChange({ cardImageOpacity })}
            />
          </div>
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Border</p>
          <div className="grid gap-2">
            <DesktopColorInputRow
              label="Shape border color"
              value={settings.borderColor}
              onChange={(borderColor) => onShapeSettingsChange({ borderColor })}
            />
            <DesktopNumberRow
              label="Border width"
              max={24}
              min={0}
              value={settings.borderWidth}
              onChange={(borderWidth) => onShapeSettingsChange({ borderWidth })}
            />
            <DesktopNumberRow
              label="Border opacity"
              max={100}
              min={0}
              value={settings.borderOpacity}
              onChange={(borderOpacity) => onShapeSettingsChange({ borderOpacity })}
            />
          </div>
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Shape Details</p>
          <div className="grid gap-2">
            <DesktopNumberRow label="Shape padding" max={192} min={0} value={settings.shapePadding} onChange={(shapePadding) => onShapeSettingsChange({ shapePadding })} />
            <DesktopColorInputRow label="Shape stroke color" value={settings.shapeStrokeColor} onChange={(shapeStrokeColor) => onShapeSettingsChange({ shapeStrokeColor })} />
            <DesktopNumberRow label="Shape stroke width" max={24} min={0} value={settings.shapeStrokeWidth} onChange={(shapeStrokeWidth) => onShapeSettingsChange({ shapeStrokeWidth })} />
            <DesktopNumberRow label="Shape stroke opacity" max={100} min={0} value={settings.shapeStrokeOpacity} onChange={(shapeStrokeOpacity) => onShapeSettingsChange({ shapeStrokeOpacity })} />
            <DesktopColorInputRow label="Shape backing shadow color" value={settings.shapeShadowColor} onChange={(shapeShadowColor) => onShapeSettingsChange({ shapeShadowColor })} />
            <DesktopNumberRow label="Shape shadow blur" max={32} min={0} value={settings.shapeShadowBlur} onChange={(shapeShadowBlur) => onShapeSettingsChange({ shapeShadowBlur })} />
            <DesktopNumberRow label="Shape shadow opacity" max={100} min={0} value={settings.shapeShadowOpacity} onChange={(shapeShadowOpacity) => onShapeSettingsChange({ shapeShadowOpacity })} />
            <DesktopNumberRow label="Shape shadow X" max={64} min={-64} value={settings.shapeShadowOffsetX} onChange={(shapeShadowOffsetX) => onShapeSettingsChange({ shapeShadowOffsetX })} />
            <DesktopNumberRow label="Shape shadow Y" max={64} min={-64} value={settings.shapeShadowOffsetY} onChange={(shapeShadowOffsetY) => onShapeSettingsChange({ shapeShadowOffsetY })} />
          </div>
        </section>
      </div>

      <DesktopInspectorFooter label="Reset Shape" onReset={onShapeReset} />
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
        data-desktop-preview-option="true"
        className={cn("relative aspect-square w-full min-w-0 rounded-[7px] p-0 transition", DESKTOP_INSPECTOR_FOCUS_CLASS)}
        type="button"
        onClick={onClick}
      >
        <DesktopShapePreview
          fillOverride="currentColor"
          label={label}
          previewStyle={{
            backgroundColor: desktopTheme === "light" ? "rgba(255, 255, 255, 0.86)" : "rgba(0, 0, 0, 0.88)",
            borderColor: desktopTheme === "light" ? "rgba(15, 23, 42, 0.14)" : "rgba(255, 255, 255, 0.18)",
            color: desktopTheme === "light" ? "#18181b" : "#f8fafc",
          }}
          settings={settings}
          shapeId={shapeId}
          className={cn(
            "size-full rounded-[6px] transition group-hover:bg-white/[0.1]",
            selected && "border-black bg-white/[0.08]",
          )}
        />
      </button>
      <span className="block w-full truncate px-0.5 text-center text-[10px] font-semibold text-white/72">
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
      data-desktop-shape-option-preview={fillOverride ? "true" : undefined}
      data-slot="desktop-style-preview-surface"
      className={cn(
        "grid place-items-center overflow-hidden border border-white/[0.1] bg-[#15161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      style={previewStyle}
    >
      {shape ? (
        <svg
          className="size-[62%]"
          fill="none"
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
        <span className="flex size-[96%] items-center justify-center rounded-[7px] border border-dashed border-white/[0.22] text-[10px] font-semibold text-white/42">
          {label}
        </span>
      )}
    </span>
  )
}

function DesktopMotionInspector({
  onMotionReset,
  onMotionSettingsChange,
  settings,
}: {
  onMotionReset: () => void
  onMotionSettingsChange: (patch: QrDotMatrixAnimationPatch) => void
  settings: DesktopMotionSettings
}) {
  return (
    <div data-slot="desktop-motion-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Motion" />

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <DesktopMotionToggleRow
            checked={settings.enabled}
            label="Dot matrix motion"
            onChange={(enabled) => onMotionSettingsChange({ enabled })}
          />
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="mb-2 min-w-0">
            <p className="truncate text-[12px] font-semibold text-white">Loader</p>
          </div>
          <div
            aria-label="Motion loader presets"
            data-slot="desktop-motion-loader-shelf"
            className="grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto pr-1"
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Timing</p>
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Loader Color</p>
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
            <div className="mt-3 grid gap-2">
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Output</p>
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
      </div>

      <DesktopInspectorFooter label="Reset Motion" onReset={onMotionReset} />
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
      className={cn(
        "flex w-full min-w-0 items-center justify-between gap-3 px-3 py-2.5 text-left",
        DESKTOP_INSPECTOR_CONTROL_CLASS,
        checked && DESKTOP_INSPECTOR_SELECTED_CLASS,
      )}
      type="button"
      onClick={() => onChange(!checked)}
    >
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-semibold text-white">{label}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full bg-white/[0.12] transition",
          checked && "bg-black/18",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform",
            checked && "translate-x-4",
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
    <label className={cn("grid min-w-0 gap-2 px-3 py-2.5", DESKTOP_INSPECTOR_CONTROL_CLASS)}>
      <span className="flex min-w-0 items-center justify-between gap-3">
        <span className="truncate text-[12px] font-semibold text-white/74">{label}</span>
        <span className="shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold text-white/62">
          {valueLabel}
        </span>
      </span>
      <input
        aria-label={`Motion ${label.toLowerCase()}`}
        className="h-1.5 w-full accent-white"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
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
      data-desktop-preview-option="true"
      className={cn(
        "relative h-10 min-w-0 px-2.5 text-left",
        DESKTOP_INSPECTOR_CONTROL_CLASS,
        selected && DESKTOP_INSPECTOR_SELECTED_CLASS,
      )}
      type="button"
      onClick={onClick}
    >
      <span className="block max-w-[calc(100%-1.25rem)] truncate text-[11px] font-semibold text-white/78">
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
      data-desktop-preview-option="true"
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
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-white/78">
        {label}
      </span>
    </button>
  )
}

function DesktopContentInspector({
  contentType,
  contentValues,
  encodedValue,
  onContentReset,
  onContentTypeChange,
  onContentValueChange,
  validation,
}: {
  contentType: QrInputType
  contentValues: StaticQrContentValues
  encodedValue: string
  onContentReset: () => void
  onContentTypeChange: (type: QrInputType) => void
  onContentValueChange: (field: string, value: StaticQrContentValue) => void
  validation: ReturnType<typeof validateStaticQrContent>
}) {
  const activeOption = QR_INPUT_OPTIONS[contentType]
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

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <div>
          <div className="min-w-0">
            <div
              className="flex h-9 w-full min-w-0 items-center overflow-hidden rounded-[7px] border border-white/[0.1] bg-white/[0.08] focus-within:border-white/45"
              data-slot="desktop-content-filter-search-row"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Filter QR types"
                    className="flex h-full min-w-[116px] max-w-[132px] shrink-0 items-center justify-between gap-2 bg-black/10 px-2.5 text-[12px] font-semibold text-white outline-none transition hover:bg-white/[0.08] focus-visible:bg-white/[0.1]"
                    data-slot="desktop-content-type-filter-trigger"
                    type="button"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <ListFilterIcon className="size-3.5 shrink-0 text-white/55" />
                      <span className="truncate">{activeCollectionLabel}</span>
                    </span>
                    <ChevronDownIcon className="size-3.5 shrink-0 text-white/45" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-44 border border-white/[0.08] bg-[#111116] p-1.5 text-white shadow-[0_18px_42px_rgba(0,0,0,0.45)]"
                  data-slot="desktop-content-type-filter-menu"
                >
                  <DropdownMenuRadioGroup
                    aria-label="QR type filters"
                    value={collectionId}
                    onValueChange={(value) => setCollectionId(value as DesktopContentCollectionId)}
                  >
                    {DESKTOP_CONTENT_FILTER_OPTIONS.map((collection) => (
                      <DropdownMenuRadioItem
                        key={collection.id}
                        className="h-8 rounded-[6px] px-2 text-[12px] font-semibold text-white/72 focus:bg-white/[0.1] focus:text-white data-[state=checked]:bg-white data-[state=checked]:text-neutral-950"
                        value={collection.id}
                      >
                        {collection.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="relative min-w-0 flex-1 self-stretch">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/45" />
                <input
                  aria-label="Search QR types"
                  className="h-full w-full bg-transparent pl-7 pr-3 text-[12px] text-white outline-none placeholder:text-white/35"
                  placeholder="Search"
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid max-h-36 grid-cols-3 gap-1.5 overflow-y-auto pr-1" data-slot="desktop-content-type-collection">
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
                  "relative flex h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-[7px] bg-white/[0.055] px-1 text-[10px] font-semibold text-white/62 transition hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
                  isSelected && DESKTOP_INSPECTOR_SELECTED_CLASS,
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
              <p className="col-span-3 px-1 py-3 text-center text-[11px] text-white/45">
                No QR types found
              </p>
            ) : null}
          </div>
        </div>

        <div className={cn("mt-3 px-3 py-2.5", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-white">{activeOption.label}</p>
          </div>
        </div>

        <div className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <DesktopContentFields
            contentType={contentType}
            contentValues={contentValues}
            validation={validation}
            onContentValueChange={onContentValueChange}
          />
        </div>

        <details className={cn("mt-3 px-3 py-2.5", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <summary className="cursor-pointer select-none text-[12px] font-semibold text-white">
            Encoded value
          </summary>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-[6px] bg-black/24 p-2.5 text-[11px] leading-4 text-white/58">
            {encodedValue || "No payload yet"}
          </pre>
        </details>
      </div>

      <DesktopInspectorFooter label="Reset Content" onReset={onContentReset} />
    </div>
  )
}

function DesktopPatternInspector({
  desktopTheme,
  onPatternReset,
  onPatternSettingsChange,
  settings,
}: {
  desktopTheme: DesktopThemeMode
  onPatternReset: () => void
  onPatternSettingsChange: (patch: Partial<DesktopPatternSettings>) => void
  settings: DesktopPatternSettings
}) {
  return (
    <div data-slot="desktop-pattern-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Pattern" />

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className="p-0">
          <div className="mb-2 min-w-0">
            <p className="truncate text-[12px] font-semibold text-white">Module Pattern</p>
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="mb-3 flex min-w-0 items-center gap-3">
            <DesktopDotsColorPreview settings={settings} className="size-12 shrink-0 rounded-[8px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white">Module Color</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5" data-slot="desktop-pattern-color-mode">
            {DESKTOP_DOTS_COLOR_MODES.map((mode) => (
              <button
                key={mode.value}
                aria-pressed={settings.dotsColorMode === mode.value}
                className={cn(
                  "h-8 rounded-[6px] border border-white/[0.09] bg-black/22 px-2 text-[11px] font-semibold text-white/58 transition hover:bg-white/[0.09] hover:text-white",
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
            <div className="mt-3">
              <DesktopColorInputRow
                label="Solid color"
                value={settings.dotsSolidColor}
                onChange={(dotsSolidColor) => onPatternSettingsChange({ dotsSolidColor })}
              />
            </div>
          ) : null}

          {settings.dotsColorMode === "gradient" ? (
            <div className="mt-3 grid gap-2">
              <DesktopColorInputRow
                label="Start color"
                value={settings.dotsGradient.colorStops[0].color}
                onChange={(color) =>
                  onPatternSettingsChange({
                    dotsGradient: updateDesktopGradientColor(settings.dotsGradient, 0, color),
                  })
                }
              />
              <DesktopColorInputRow
                label="End color"
                value={settings.dotsGradient.colorStops[1].color}
                onChange={(color) =>
                  onPatternSettingsChange({
                    dotsGradient: updateDesktopGradientColor(settings.dotsGradient, 1, color),
                  })
                }
              />
              <DesktopSegmentedRow
                label="Gradient type"
                options={DESKTOP_GRADIENT_TYPE_OPTIONS}
                value={settings.dotsGradient.type}
                onChange={(type) =>
                  onPatternSettingsChange({ dotsGradient: { ...settings.dotsGradient, type } })
                }
              />
            </div>
          ) : null}

          {settings.dotsColorMode === "palette" ? (
            <div className="mt-3 grid gap-2">
              <div className="flex min-w-0 flex-wrap gap-2 rounded-[7px] bg-black/20 p-2.5">
                {settings.dotsPalette.map((color, index) => (
                  <input
                    key={`${color}-${index}`}
                    aria-label={`Pattern color ${index + 1}`}
                    className="size-7 shrink-0 cursor-pointer rounded-full border border-white/[0.12] bg-transparent p-0.5"
                    type="color"
                    value={color}
                    onChange={(event) =>
                      onPatternSettingsChange({
                        dotsPalette: settings.dotsPalette.map((currentColor, currentIndex) =>
                          currentIndex === index ? event.currentTarget.value : currentColor,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <div className={cn("mt-3 flex items-center justify-between gap-3 px-3 py-2.5", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheckIcon className="size-4 shrink-0 text-white/55" />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-white">Scan Safety</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200">
            Valid
          </span>
        </div>
      </div>

      <DesktopInspectorFooter label="Reset Pattern" onReset={onPatternReset} />
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
  value: StudioDotType
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-1.5">
      <button
        aria-label={`Use ${label} pattern`}
        aria-pressed={selected}
        data-desktop-preview-option="true"
        className="relative aspect-square w-full min-w-0 rounded-[7px] p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
        type="button"
        onClick={onClick}
      >
        <DesktopQrDotPreview
          value={value}
          className={cn(
            "size-full rounded-[6px] transition group-hover:brightness-110",
            selected && "border-black",
          )}
          style={getDesktopAdaptiveOptionPreviewStyle(desktopTheme)}
        />
      </button>
      <span className="block w-full truncate px-0.5 text-center text-[10px] font-semibold text-white/72">
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
  value: StudioDotType
}) {
  return (
    <span
      aria-hidden="true"
      data-desktop-adaptive-option-preview="true"
      data-slot="desktop-style-preview-surface"
      className={cn(
        "grid place-items-center overflow-hidden border border-white/[0.1] bg-[#15161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      style={style}
    >
      <span className="grid size-[62%] place-items-center [&_svg]:size-full [&_svg]:text-current">
        <StylePreview previewKind="dots" value={value} />
      </span>
    </span>
  )
}

function DesktopDotsColorPreview({
  className,
  settings,
}: {
  className?: string
  settings: DesktopPatternSettings
}) {
  const background = getDesktopDotsColorPreviewBackground(settings)

  return (
    <span
      aria-hidden="true"
      data-slot="desktop-style-preview-surface"
      className={cn(
        "block overflow-hidden border border-white/[0.1] bg-[#15161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
      style={{ background }}
    />
  )
}

function DesktopColorInputRow({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="flex min-w-0 items-center justify-between gap-3 rounded-[7px] bg-black/20 px-2.5 py-2">
      <span className="truncate text-[12px] font-semibold text-white/74">{label}</span>
      <span className="flex items-center gap-2">
        <input
          aria-label={`${label} swatch`}
          className="size-7 shrink-0 cursor-pointer rounded-[6px] border border-white/[0.12] bg-transparent p-0.5"
          type="color"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        <input
          aria-label={label}
          className={cn("h-7 w-20 rounded-[5px] px-2 text-[11px] font-semibold", DESKTOP_INSPECTOR_INPUT_CLASS)}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </span>
    </label>
  )
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
    <label className={cn("flex min-w-0 items-center justify-between gap-3 px-2.5 py-2", DESKTOP_INSPECTOR_CONTROL_CLASS)}>
      <span className="truncate text-[12px] font-semibold text-white/74">{label}</span>
      <input
        aria-label={label}
        className={cn("h-7 w-20 rounded-[5px] px-2 text-[11px] font-semibold", DESKTOP_INSPECTOR_INPUT_CLASS)}
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
    <button
      aria-label={`Use ${label} decoration pattern`}
      aria-pressed={selected}
      data-desktop-preview-option="true"
      className={cn(
        "relative min-w-0 rounded-[7px] border border-white/[0.08] bg-white/[0.055] p-1.5 text-left transition hover:bg-white/[0.1]",
        selected && "border-black bg-white/[0.08] p-2",
      )}
      type="button"
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        data-slot="desktop-style-preview-surface"
        className="block h-12 w-full rounded-[6px] border border-white/[0.1] bg-[#15161a]"
        style={style}
      />
      <span className="mt-1.5 block truncate text-[10px] font-semibold text-white/72">
        {label}
      </span>
    </button>
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
        "flex h-9 min-w-0 items-center justify-between gap-2 rounded-[7px] border border-white/[0.08] bg-white/[0.055] px-2.5 text-left transition hover:bg-white/[0.1]",
        selected && DESKTOP_INSPECTOR_SELECTED_CLASS,
      )}
      type="button"
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-white/78">
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
      <p className="mb-2 truncate text-[12px] font-semibold text-white">{label}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            aria-pressed={value === option.value}
            className={cn(
              "h-8 truncate rounded-[6px] border border-white/[0.09] bg-black/22 px-2 text-[11px] font-semibold text-white/58 transition hover:bg-white/[0.09] hover:text-white",
              value === option.value && DESKTOP_INSPECTOR_SELECTED_CLASS,
            )}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
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

function getDesktopDotsColorPreviewBackground(settings: DesktopPatternSettings) {
  if (settings.dotsColorMode === "gradient") {
    const [start, end] = settings.dotsGradient.colorStops
    const gradientType = settings.dotsGradient.type === "radial" ? "radial-gradient(circle" : "linear-gradient(135deg"

    return `${gradientType}, ${start.color}, ${end.color})`
  }

  if (settings.dotsColorMode === "palette") {
    return `linear-gradient(135deg, ${settings.dotsPalette.join(", ")})`
  }

  return settings.dotsSolidColor
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
    <div className="min-w-0 px-3 py-2.5">
      <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
        <label className="truncate text-[12px] font-semibold text-white" htmlFor={controlId}>
          {field.label}
        </label>
        {field.error ? (
          <span className="shrink-0 text-[10px] font-semibold text-white/72">{field.error}</span>
        ) : null}
      </div>
      {field.type === "textarea" ? (
        <textarea
          id={controlId}
          aria-invalid={field.error ? true : undefined}
          className={cn(
            "min-h-24 w-full resize-none rounded-[7px] px-3 py-2.5 text-[12px] leading-5",
            DESKTOP_INSPECTOR_INPUT_CLASS,
          )}
          placeholder={field.placeholder}
          value={stringContentValue(field.value)}
          onChange={(event) => onContentValueChange(field.id, event.currentTarget.value)}
        />
      ) : null}
      {field.type === "text" ? (
        <input
          id={controlId}
          aria-invalid={field.error ? true : undefined}
          className={cn("h-9 w-full rounded-[7px] px-3 text-[12px]", DESKTOP_INSPECTOR_INPUT_CLASS)}
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
            "flex h-8 w-full items-center justify-between rounded-[7px] border border-white/[0.09] bg-black/22 px-2.5 text-[12px] font-semibold text-white/62 transition",
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
                  "h-8 rounded-[6px] border border-white/[0.09] bg-black/22 px-2 text-[11px] font-semibold text-white/58 transition hover:bg-white/[0.09] hover:text-white",
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
  onEncodingReset,
  onEncodingSettingsChange,
  settings,
}: {
  onEncodingReset: () => void
  onEncodingSettingsChange: (patch: Partial<DesktopEncodingSettings>) => void
  settings: DesktopEncodingSettings
}) {
  return (
    <div data-slot="desktop-encoding-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Encoding" />
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <DesktopMotionSliderRow
            label="Type number"
            max={TYPE_NUMBER_MAX}
            min={TYPE_NUMBER_MIN}
            value={settings.typeNumber}
            valueLabel={formatTypeNumberLabel(settings.typeNumber)}
            onChange={(typeNumber) => onEncodingSettingsChange({ typeNumber: typeNumber as TypeNumber })}
          />
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Error Correction</p>
          <div className="grid gap-1.5" data-slot="desktop-error-correction-grid">
            {ERROR_CORRECTION_LEVEL_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Use ${option.title} error correction`}
                aria-pressed={settings.errorCorrectionLevel === option.value}
                className={cn(
                  "min-w-0 rounded-[7px] border border-white/[0.08] bg-white/[0.055] px-3 py-2 text-left transition hover:bg-white/[0.1]",
                  settings.errorCorrectionLevel === option.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onEncodingSettingsChange({ errorCorrectionLevel: option.value })}
              >
                <span className="flex min-w-0 items-center justify-between gap-3">
                  <span className="truncate text-[12px] font-semibold text-white">
                    {option.title} ({option.label})
                  </span>
                </span>
                <span className="mt-1 block text-[10px] font-semibold leading-4 text-white/48">
                  {option.summary}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <DesktopInspectorFooter label="Reset Encoding" onReset={onEncodingReset} />
    </div>
  )
}

function DesktopImageInspector({
  onImageReset,
  onImageSettingsChange,
  settings,
}: {
  onImageReset: () => void
  onImageSettingsChange: (patch: Partial<DesktopImageSettings>) => void
  settings: DesktopImageSettings
}) {
  return (
    <div data-slot="desktop-image-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Image" />
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Intent</p>
          <div className="grid grid-cols-3 gap-1.5" data-slot="desktop-image-intent">
            {DESKTOP_IMAGE_INTENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Use image as ${option.label}`}
                aria-pressed={settings.intent === option.value}
                className={cn(
                  "h-9 rounded-[6px] border border-white/[0.09] bg-black/22 px-1.5 text-[10px] font-semibold text-white/58 transition hover:bg-white/[0.09] hover:text-white",
                  settings.intent === option.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onImageSettingsChange({ intent: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Source</p>
          <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-image-source-mode">
            {DESKTOP_ASSET_SOURCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Use ${option.label} image source`}
                aria-pressed={settings.sourceMode === option.value}
                className={cn(
                  "h-8 rounded-[6px] border border-white/[0.09] bg-black/22 px-2 text-[11px] font-semibold text-white/58 transition hover:bg-white/[0.09] hover:text-white",
                  settings.sourceMode === option.value &&
                    DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onImageSettingsChange({ sourceMode: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input
            aria-label="Shape image URL"
            className={cn("mt-2 h-9 w-full rounded-[7px] px-3 text-[12px]", DESKTOP_INSPECTOR_INPUT_CLASS)}
            placeholder="https://example.com/shape.png"
            value={settings.remoteUrl}
            onChange={(event) => onImageSettingsChange({ remoteUrl: event.currentTarget.value })}
          />
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Image Fit</p>
          <div className="grid grid-cols-2 gap-1.5">
            {(["cover", "contain"] as const).map((fit) => (
              <button
                key={fit}
                aria-label={`Use ${fit} image fit`}
                aria-pressed={settings.fit === fit}
                className={cn(
                  "h-8 rounded-[6px] border border-white/[0.09] bg-black/22 px-2 text-[11px] font-semibold capitalize text-white/58 transition hover:bg-white/[0.09] hover:text-white",
                  settings.fit === fit && DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onImageSettingsChange({ fit })}
              >
                {fit}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <DesktopMotionSliderRow
              label="Opacity"
              max={100}
              min={0}
              value={settings.opacity}
              valueLabel={`${Math.round(settings.opacity)}%`}
              onChange={(opacity) => onImageSettingsChange({ opacity })}
            />
          </div>
        </section>
      </div>
      <DesktopInspectorFooter label="Reset Image" onReset={onImageReset} />
    </div>
  )
}

function DesktopDecorationsInspector({
  onDecorationsReset,
  onDecorationsSettingsChange,
  settings,
}: {
  onDecorationsReset: () => void
  onDecorationsSettingsChange: (patch: Partial<DesktopDecorationsSettings>) => void
  settings: DesktopDecorationsSettings
}) {
  return (
    <div data-slot="desktop-decorations-inspector" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesktopInspectorHeader title="Decorations" />
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Add</p>
          <div className="grid grid-cols-2 gap-1.5" data-slot="desktop-decoration-kind">
            {DESKTOP_DECORATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                aria-label={`Add ${option.label} decoration`}
                aria-pressed={settings.kind === option.value}
                className={cn(
                  "h-9 rounded-[7px] border border-white/[0.08] bg-white/[0.055] px-2 text-[11px] font-semibold text-white/62 transition hover:bg-white/[0.1] hover:text-white",
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Fill</p>
          <DesktopColorInputRow
            label="Decoration fill color"
            value={settings.fill}
            onChange={(fill) => onDecorationsSettingsChange({ fill })}
          />
          <div className="mt-3 grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto pr-1" data-slot="desktop-decoration-patterns">
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Frame</p>
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
      </div>
      <DesktopInspectorFooter label="Reset Decorations" onReset={onDecorationsReset} />
    </div>
  )
}

function DesktopEffectsInspector({
  onEffectsReset,
  onEffectsSettingsChange,
  settings,
}: {
  onEffectsReset: () => void
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
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Generated Effects</p>
          <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto pr-1" data-slot="desktop-generated-effects">
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Preset</p>
          <select
            aria-label="Generated effect preset"
            className={cn(
              "h-8 w-full appearance-none rounded-[6px] px-2.5 text-[12px] font-semibold transition",
              DESKTOP_INSPECTOR_INPUT_CLASS,
            )}
            value={settings.generatedShaderPresetName}
            onChange={(event) =>
              onEffectsSettingsChange({ generatedShaderPresetName: event.currentTarget.value })
            }
          >
            {generatedDefinition.presets.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Motion</p>
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Image Filters</p>
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
          <select
            aria-label="Image filter preset"
            className={cn(
              "mt-2 h-8 w-full appearance-none rounded-[6px] px-2.5 text-[12px] font-semibold transition",
              DESKTOP_INSPECTOR_INPUT_CLASS,
            )}
            value={settings.filterPresetName}
            onChange={(event) => onEffectsSettingsChange({ filterPresetName: event.currentTarget.value })}
          >
            {filterDefinition.presets.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </section>
      </div>
      <DesktopInspectorFooter label="Reset Effects" onReset={onEffectsReset} />
    </div>
  )
}

function DesktopLayersInspector({
  onLayersReset,
  onLayersSettingsChange,
  settings,
}: {
  onLayersReset: () => void
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
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
            <p className="truncate text-[12px] font-semibold text-white">Layer Stack</p>
            <span className="shrink-0 text-[10px] font-bold text-white/45">
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
                  "flex min-w-0 items-center gap-2 rounded-[7px] border border-white/[0.08] bg-white/[0.055] px-2.5 py-2 text-left transition hover:bg-white/[0.1]",
                  settings.selectedLayerId === layer.id && DESKTOP_INSPECTOR_SELECTED_CLASS,
                )}
                type="button"
                onClick={() => onLayersSettingsChange({ selectedLayerId: layer.id })}
              >
                <span className="shrink-0 text-[10px] font-bold text-white/38">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-white">
                    {layer.name}
                  </span>
                  <span className="block truncate text-[10px] font-semibold text-white/42">
                    {layer.kind} · {layer.width} x {layer.height}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] font-bold text-white/45">
                  {layer.isVisible ? "Shown" : "Hidden"}
                </span>
              </button>
            ))}
          </div>
        </section>

        {selectedLayer ? (
          <>
            <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
              <p className="mb-3 truncate text-[12px] font-semibold text-white">Inspector</p>
              <input
                aria-label="Layer name"
                className={cn("h-9 w-full rounded-[7px] px-3 text-[12px]", DESKTOP_INSPECTOR_INPUT_CLASS)}
                value={selectedLayer.name}
                onChange={(event) => patchSelectedLayer({ name: event.currentTarget.value })}
              />
            </section>
            <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
              <p className="mb-3 truncate text-[12px] font-semibold text-white">Geometry</p>
              <div className="grid grid-cols-2 gap-2">
                <DesktopNumberRow label="X" value={selectedLayer.x} onChange={(x) => patchSelectedLayer({ x })} />
                <DesktopNumberRow label="Y" value={selectedLayer.y} onChange={(y) => patchSelectedLayer({ y })} />
                <DesktopNumberRow label="W" min={1} value={selectedLayer.width} onChange={(width) => patchSelectedLayer({ width })} />
                <DesktopNumberRow label="H" min={1} value={selectedLayer.height} onChange={(height) => patchSelectedLayer({ height })} />
              </div>
            </section>
          </>
        ) : null}
      </div>
      <DesktopInspectorFooter label="Reset Layers" onReset={onLayersReset} />
    </div>
  )
}

function DesktopExportInspector({
  onExportDownload,
  onExportReset,
  onExportSettingsChange,
  settings,
}: {
  onExportDownload: () => void
  onExportReset: () => void
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
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Target</p>
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Format</p>
          <div className="grid grid-cols-4 gap-1.5" data-slot="desktop-export-format-grid">
            {DESKTOP_DOWNLOAD_EXTENSIONS.map((extension) => (
              <button
                key={extension}
                aria-label={`Export ${extension.toUpperCase()}`}
                aria-pressed={settings.extension === extension}
                className={cn(
                  "h-9 rounded-[7px] border border-white/[0.08] bg-white/[0.055] px-1.5 text-[11px] font-semibold text-white/62 transition hover:bg-white/[0.1] hover:text-white",
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
          <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
            <p className="mb-2 truncate text-[12px] font-semibold text-white">Quality</p>
            <div className="grid gap-1.5" data-slot="desktop-export-quality-grid">
              {DESKTOP_RASTER_EXPORT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  aria-label={`Use ${preset.label} export quality`}
                  aria-pressed={settings.qualityPresetId === preset.id}
                  className={cn(
                    "min-w-0 rounded-[7px] border border-white/[0.08] bg-white/[0.055] px-3 py-2 text-left transition hover:bg-white/[0.1]",
                    settings.qualityPresetId === preset.id &&
                      DESKTOP_INSPECTOR_SELECTED_CLASS,
                  )}
                  type="button"
                  onClick={() => onExportSettingsChange({ qualityPresetId: preset.id })}
                >
                  <span className="block truncate text-[12px] font-semibold text-white">
                    {preset.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold text-white/45">
                    {preset.sizePx} x {preset.sizePx} px · {preset.primaryUse}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
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
        <button
          aria-label="Reset Export"
          className={cn("h-8", DESKTOP_INSPECTOR_RESET_CLASS)}
          type="button"
          onClick={onExportReset}
        >
          <RotateCcwIcon className="size-3.5" />
          Reset Export
        </button>
        {isRasterExport ? (
          <p className="mt-2 truncate text-center text-[10px] font-semibold text-white/42">
            {selectedQuality.sizePx}px raster preset
          </p>
        ) : null}
      </div>
    </div>
  )
}

function DesktopTextInspector({
  onTextReset,
  onTextSettingsChange,
  settings,
}: {
  onTextReset: () => void
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

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 scroll-fade-effect-y">
        <section className={DESKTOP_INSPECTOR_SECTION_CLASS}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Preset</p>
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-2 truncate text-[12px] font-semibold text-white">Font</p>
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
            <input
              aria-label="Text font size"
              className={cn(
                "h-8 rounded-[6px] px-2 text-[12px] font-semibold",
                DESKTOP_INSPECTOR_INPUT_CLASS,
              )}
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
              className="mt-2 grid max-h-44 gap-1.5 overflow-y-auto pr-1"
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
            <p className="truncate text-[12px] font-semibold text-white">Text</p>
            <button
              aria-label="Add Text"
              className={cn("grid size-7 shrink-0 place-items-center", DESKTOP_INSPECTOR_CONTROL_CLASS)}
              type="button"
              onClick={() => onTextSettingsChange({ text: DEFAULT_DESKTOP_TEXT_SETTINGS.text })}
            >
              <TypeIcon className="size-3.5" />
            </button>
          </div>
          <textarea
            aria-label="Text layer content"
            className={cn(
              "min-h-16 w-full resize-none rounded-[7px] px-3 py-2 text-[12px] leading-5",
              DESKTOP_INSPECTOR_INPUT_CLASS,
            )}
            value={settings.text}
            onChange={(event) => onTextSettingsChange({ text: event.currentTarget.value })}
          />
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Color</p>
          <DesktopColorInputRow
            label="Text fill color"
            value={settings.fill}
            onChange={(fill) => onTextSettingsChange({ fill })}
          />
        </section>

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Alignment</p>
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

        <section className={cn("mt-3", DESKTOP_INSPECTOR_SECTION_CLASS)}>
          <p className="mb-3 truncate text-[12px] font-semibold text-white">Spacing</p>
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
      </div>

      <DesktopInspectorFooter label="Reset Text" onReset={onTextReset} />
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
    <label className={cn("mt-2 grid min-w-0 gap-1.5 px-3 py-2.5", DESKTOP_INSPECTOR_CONTROL_CLASS)}>
      <span className="flex min-w-0 items-center justify-between gap-3">
        <span className="truncate text-[12px] font-semibold text-white/74">{label}</span>
        <span className="shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold text-white/62">
          {valueLabel}
        </span>
      </span>
      <input
        aria-label={`Text font ${label.toLowerCase()}`}
        className="h-1.5 w-full accent-white"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
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
