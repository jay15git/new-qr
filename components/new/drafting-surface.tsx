"use client"

import { Image02Icon, SignalIcon, SquareIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import type {
  CornerDotType,
  CornerSquareType,
  ErrorCorrectionLevel,
  FileExtension,
  TypeNumber,
} from "qr-code-styling"

import {
  DraftingBackgroundColorTab,
  DraftingBackgroundUploadTab,
  DraftingBrandIconTab,
  DraftingContentTab,
  DraftingCornerDotColorTab,
  DraftingCornerDotStyleTab,
  DraftingCornerSquareColorTab,
  DraftingCornerSquareStyleTab,
  DraftingDotsColorTab,
  DraftingEncodingTab,
  DraftingLogoColorTab,
  DraftingLogoSizeTab,
  DraftingLogoUploadTab,
  DraftingSizeTab,
  DraftingStyleTab,
} from "@/components/new/drafting-style-tab"
import {
  DRAFTING_LAYERS_TAB_ICON,
  DraftingLayersTab,
} from "@/components/new/drafting-layers-tab"
import {
  filterBrandIcons,
  findBrandIconById,
  type BrandIconCategory,
  type BrandIconId,
  type BrandIconEntry,
} from "@/components/qr/brand-icon-catalog"
import {
  createBrandIconDataUrl,
  createBrandIconGradientDataUrl,
  DEFAULT_BRAND_ICON_COLOR,
} from "@/components/qr/brand-icon-svg"
import {
  applyAssetNoneSelection,
  applyAssetUrlValue,
  applyLogoPresetColor,
  applyLogoPresetGradient,
  applyLogoPresetSelection,
} from "@/components/qr/qr-control-sections"
import {
  DEFAULT_QR_EDITOR_SECTION,
  type QrEditorSectionId,
} from "@/components/qr/qr-sections"
import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import {
  downloadDashboardQrBatchZipExport,
  downloadDashboardQrNodeExport,
} from "@/components/qr/dashboard-qr-batch-export"
import {
  downloadDashboardRasterExport,
  formatDashboardExportFileSize,
  isRasterExportExtension,
  measureDashboardRasterExport,
} from "@/components/qr/dashboard-raster-export"
import { DashboardComposeSurface } from "@/components/qr/dashboard-compose-surface"
import {
  createDashboardComposeScene,
  type DashboardComposeScene,
  DASHBOARD_QR_NODE_ID,
  getDashboardComposeNode,
  getDashboardQrNodes,
  isDashboardQrNodeId,
  upsertDashboardQrNode,
  updateDashboardComposeNode,
} from "@/components/qr/dashboard-compose-scene"
import {
  createDefaultQrStudioState,
  type AssetSourceMode,
  type DotsColorMode,
  type QrStudioState,
  type StudioDotType,
  type StudioGradient,
} from "@/components/qr/qr-studio-state"
import { DownloadIcon, LinkIcon, PieChart, Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ModeToggle } from "@/components/mode-toggle"
import { OptionCard } from "@/components/ui/option-card"
import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const OUTER_MARKERS = [
  "hidden lg:block left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  "hidden lg:block right-0 top-0 translate-x-1/2 -translate-y-1/2",
  "hidden lg:block bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  "hidden lg:block bottom-0 right-0 translate-x-1/2 translate-y-1/2",
] as const

const JUNCTION_MARKERS = [
  "hidden lg:block left-0 top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "hidden lg:block left-[var(--new-left-rail-width)] top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "hidden lg:block left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "hidden lg:block right-0 top-[var(--new-header-height)] translate-x-1/2 -translate-y-1/2",
  "hidden lg:block bottom-0 left-[var(--new-left-rail-width)] -translate-x-1/2 translate-y-1/2",
  "hidden lg:block bottom-0 left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] -translate-x-1/2 translate-y-1/2",
] as const

type DraftingBinaryColorMode = "solid" | "gradient"
type DraftingAssetSourceMode = Extract<AssetSourceMode, "upload" | "url">
type DraftingBrandIconCategoryFilter = BrandIconCategory | "all"

type DraftingPanelTab = {
  id: string
  label: string
}

type DraftingToolId = QrEditorSectionId | "layers"

type DraftingTool = {
  id: DraftingToolId
  title: string
  renderIcon: () => ReactNode
}

type DraftingQrStateByNodeId = Record<string, QrStudioState>

const DRAFTING_PANEL_TABS: Record<DraftingToolId, DraftingPanelTab[]> = {
  content: [{ id: "content", label: "Content" }],
  style: [
    { id: "style", label: "Style" },
    { id: "color", label: "Color" },
    { id: "size", label: "Size" },
  ],
  "corner-square": [
    { id: "style", label: "Style" },
    { id: "color", label: "Color" },
  ],
  "corner-dot": [
    { id: "style", label: "Style" },
    { id: "color", label: "Color" },
  ],
  background: [
    { id: "colors", label: "Colors" },
    { id: "upload", label: "Upload" },
  ],
  logo: [
    { id: "brand-icons", label: "Brands" },
    { id: "colors", label: "Colors" },
    { id: "upload", label: "Upload" },
    { id: "size", label: "Size" },
  ],
  encoding: [{ id: "encoding", label: "Encoding" }],
  layers: [{ id: "layers", label: "Layers" }],
}

const DEFAULT_DRAFTING_PANEL_TABS: Record<DraftingToolId, string> = {
  content: "content",
  style: "style",
  "corner-square": "style",
  "corner-dot": "style",
  background: "colors",
  logo: "brand-icons",
  encoding: "encoding",
  layers: "layers",
}

const DRAFTING_PANEL_TAB_TRAY_CLASS_NAME =
  "grid h-auto w-full min-w-0 max-w-full auto-cols-fr grid-flow-col items-stretch gap-1 overflow-hidden rounded-[4px] bg-[var(--drafting-control-bg)] p-1 shadow-none dark:bg-[var(--drafting-panel-tab-tray-bg)] sm:gap-2"

const DRAFTING_PANEL_TAB_TRIGGER_CLASS_NAME =
  "min-w-0 rounded-[4px] border border-transparent bg-transparent px-2 py-2 text-[0.68rem] font-medium tracking-[0.04em] text-[var(--drafting-ink-muted)] shadow-none transition-[color,box-shadow,background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[var(--drafting-panel-bg-hover)] hover:text-[var(--drafting-ink-strong-muted)] hover:shadow-[var(--drafting-shadow-hover)] active:translate-y-0 active:bg-[var(--drafting-panel-bg-hover)] active:font-medium active:text-[var(--drafting-ink)] active:shadow-[var(--drafting-shadow-active)] data-[state=active]:bg-[var(--drafting-panel-bg-active)] data-[state=active]:font-semibold data-[state=active]:text-[var(--drafting-ink)] data-[state=active]:shadow-[var(--drafting-shadow-active)] data-[state=active]:hover:-translate-y-px data-[state=active]:hover:bg-[var(--drafting-panel-bg-active)] data-[state=active]:hover:text-[var(--drafting-ink)] data-[state=active]:hover:shadow-[var(--drafting-shadow-hover)] data-[state=active]:active:translate-y-0 dark:bg-[var(--drafting-panel-tab-bg)] dark:text-[var(--drafting-panel-tab-label)] dark:hover:bg-[var(--drafting-panel-tab-bg-hover)] dark:hover:text-[var(--drafting-panel-tab-label-hover)] dark:hover:shadow-[var(--drafting-panel-tab-shadow-hover)] dark:active:bg-[var(--drafting-panel-tab-bg-active)] dark:active:text-[var(--drafting-panel-tab-label-selected)] dark:active:shadow-[var(--drafting-panel-tab-shadow-active)] dark:data-[state=active]:bg-[var(--drafting-panel-tab-bg-selected)] dark:data-[state=active]:text-[var(--drafting-panel-tab-label-selected)] dark:data-[state=active]:shadow-[var(--drafting-panel-tab-shadow-selected)] dark:data-[state=active]:hover:bg-[var(--drafting-panel-tab-bg-selected)] dark:data-[state=active]:hover:text-[var(--drafting-panel-tab-label-selected)] dark:data-[state=active]:hover:shadow-[var(--drafting-panel-tab-shadow-selected-hover)] sm:px-3 sm:text-[0.72rem]"

const DEFAULT_DRAFTING_STUDIO_STATE = createDefaultQrStudioState()
const IGNORE_DRAFTING_UPLOAD_ERROR: (message: string) => void = () => undefined
const DEFAULT_DOWNLOAD_NAME = "new-qr-studio"
const DRAFTING_DOWNLOAD_EXTENSIONS = ["svg", "png", "webp", "jpeg"] as const satisfies ReadonlyArray<
  FileExtension
>
const DRAFTING_RASTER_EXPORT_PRESETS = [
  {
    id: "quick-share",
    label: "Quick Share",
    primaryUse: "chat, email, docs, previews",
    sizePx: 512,
  },
  {
    id: "web-social",
    label: "Web & Social",
    primaryUse: "websites, social posts, menus",
    sizePx: 1024,
  },
  {
    id: "small-print",
    label: "Small Print",
    primaryUse: "stickers, cards, table tents",
    sizePx: 1600,
  },
  {
    id: "flyer-poster",
    label: "Flyer / Poster",
    primaryUse: "flyers, posters, nearby signage",
    sizePx: 2400,
  },
  {
    id: "large-format",
    label: "Large Format",
    primaryUse: "banners, wall signs, storefronts",
    sizePx: 3200,
  },
  {
    id: "max-quality",
    label: "Max Quality",
    primaryUse: "designer handoff, archive, safest PNG",
    sizePx: 4096,
  },
] as const
type DraftingRasterExportPresetId = (typeof DRAFTING_RASTER_EXPORT_PRESETS)[number]["id"]
const DEFAULT_DRAFTING_RASTER_EXPORT_PRESET_ID: DraftingRasterExportPresetId = "web-social"

function cloneDraftingQrState(state: QrStudioState): QrStudioState {
  return structuredClone(state)
}

const DRAFTING_TOOLS: DraftingTool[] = [
  {
    id: "content",
    title: "Content",
    renderIcon: () => <LinkIcon className="size-4 shrink-0" />,
  },
  {
    id: "style",
    title: "Style",
    renderIcon: () => <Sparkles className="size-4 shrink-0" />,
  },
  {
    id: "corner-square",
    title: "Corner Frame",
    renderIcon: () => (
      <HugeiconsIcon icon={SquareIcon} size={16} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    id: "corner-dot",
    title: "Corner Dot",
    renderIcon: () => <PieChart className="size-4 shrink-0" />,
  },
  {
    id: "background",
    title: "Background",
    renderIcon: () => (
      <HugeiconsIcon icon={Image02Icon} size={16} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    id: "logo",
    title: "Logo",
    renderIcon: () => (
      <HugeiconsIcon icon={SignalIcon} size={16} color="currentColor" strokeWidth={1.8} />
    ),
  },
  {
    id: "encoding",
    title: "Encoding",
    renderIcon: () => <Settings className="size-4 shrink-0" />,
  },
  {
    id: "layers",
    title: "Layers",
    renderIcon: () => <DRAFTING_LAYERS_TAB_ICON className="size-4 shrink-0" />,
  },
]

type DraftingDownloadExtension = (typeof DRAFTING_DOWNLOAD_EXTENSIONS)[number]
type DraftingDownloadTarget = "all-qr" | "current" | `qr:${string}`
type DraftingExportSizePreview =
  | { status: "error" }
  | { status: "idle" }
  | { status: "pending" }
  | ({
      status: "ready"
      blobSizeBytes: number
      encoderQuality?: number
      extension: DraftingDownloadExtension
      height: number
      qualityPercent: number
      width: number
    })

function PlusMarker({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="drafting-plus-marker"
      className={cn("pointer-events-none absolute size-4 text-[var(--drafting-ink-muted)]", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2.25" />
    </svg>
  )
}

export function DraftingSurface() {
  const [activeTool, setActiveTool] = useState<DraftingToolId>(
    DEFAULT_QR_EDITOR_SECTION,
  )
  const [selectedContentValue, setSelectedContentValue] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.data,
  )
  const [selectedQrMargin, setSelectedQrMargin] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.margin,
  )
  const [selectedRasterExportQualityPercent, setSelectedRasterExportQualityPercent] =
    useState(DEFAULT_DRAFTING_STUDIO_STATE.rasterExportQualityPercent)
  const [selectedQrSize, setSelectedQrSize] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.width,
  )
  const [selectedDotType, setSelectedDotType] = useState<StudioDotType>("rounded")
  const [selectedDotsColorMode, setSelectedDotsColorMode] = useState<DotsColorMode>(
    DEFAULT_DRAFTING_STUDIO_STATE.dotsColorMode,
  )
  const [selectedDotColor, setSelectedDotColor] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.dotsOptions.color,
  )
  const [selectedDotsGradient, setSelectedDotsGradient] = useState<StudioGradient>(
    structuredClone(DEFAULT_DRAFTING_STUDIO_STATE.dotsGradient),
  )
  const [selectedDotsPalette] = useState<string[]>([
    ...DEFAULT_DRAFTING_STUDIO_STATE.dotsPalette,
  ])
  const [openDotsColorItems, setOpenDotsColorItems] = useState<string[]>(["solid"])
  const [selectedCornerSquareType, setSelectedCornerSquareType] =
    useState<CornerSquareType>("extra-rounded")
  const [selectedCornerSquareColorMode, setSelectedCornerSquareColorMode] =
    useState<DraftingBinaryColorMode>(
      DEFAULT_DRAFTING_STUDIO_STATE.cornersSquareGradient.enabled ? "gradient" : "solid",
    )
  const [selectedCornerSquareColor, setSelectedCornerSquareColor] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.cornersSquareOptions.color,
  )
  const [selectedCornerSquareGradient, setSelectedCornerSquareGradient] =
    useState<StudioGradient>(
      structuredClone(DEFAULT_DRAFTING_STUDIO_STATE.cornersSquareGradient),
    )
  const [openCornerSquareColorItems, setOpenCornerSquareColorItems] = useState<string[]>([
    "solid",
  ])
  const [selectedCornerDotType, setSelectedCornerDotType] =
    useState<CornerDotType>("dot")
  const [selectedCornerDotColorMode, setSelectedCornerDotColorMode] =
    useState<DraftingBinaryColorMode>(
      DEFAULT_DRAFTING_STUDIO_STATE.cornersDotGradient.enabled ? "gradient" : "solid",
    )
  const [selectedCornerDotColor, setSelectedCornerDotColor] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.cornersDotOptions.color,
  )
  const [selectedCornerDotGradient, setSelectedCornerDotGradient] =
    useState<StudioGradient>(
      structuredClone(DEFAULT_DRAFTING_STUDIO_STATE.cornersDotGradient),
    )
  const [openCornerDotColorItems, setOpenCornerDotColorItems] = useState<string[]>([
    "solid",
  ])
  const [selectedBackgroundColorMode, setSelectedBackgroundColorMode] =
    useState<DraftingBinaryColorMode>(
      DEFAULT_DRAFTING_STUDIO_STATE.backgroundGradient.enabled ? "gradient" : "solid",
    )
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.backgroundOptions.color,
  )
  const [selectedBackgroundGradient, setSelectedBackgroundGradient] =
    useState<StudioGradient>(
      structuredClone(DEFAULT_DRAFTING_STUDIO_STATE.backgroundGradient),
    )
  const [openBackgroundColorItems, setOpenBackgroundColorItems] = useState<string[]>([
    "solid",
  ])
  const [selectedBackgroundAssetSourceMode, setSelectedBackgroundAssetSourceMode] =
    useState<DraftingAssetSourceMode>(
      DEFAULT_DRAFTING_STUDIO_STATE.backgroundImage.source === "url" ? "url" : "upload",
    )
  const [selectedBackgroundRemoteUrl, setSelectedBackgroundRemoteUrl] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.backgroundImage.source === "url"
      ? (DEFAULT_DRAFTING_STUDIO_STATE.backgroundImage.value ?? "")
      : "",
  )
  const [openBackgroundUploadItems, setOpenBackgroundUploadItems] = useState<string[]>([
    "upload",
  ])
  const [selectedLogoColorMode, setSelectedLogoColorMode] = useState<DraftingBinaryColorMode>(
    DEFAULT_DRAFTING_STUDIO_STATE.logoGradient.enabled ? "gradient" : "solid",
  )
  const [selectedLogoSourceMode, setSelectedLogoSourceMode] = useState<AssetSourceMode>(
    DEFAULT_DRAFTING_STUDIO_STATE.logo.source,
  )
  const [selectedLogoColor, setSelectedLogoColor] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.logo.presetColor ?? DEFAULT_BRAND_ICON_COLOR,
  )
  const [selectedLogoGradient, setSelectedLogoGradient] = useState<StudioGradient>(
    structuredClone(DEFAULT_DRAFTING_STUDIO_STATE.logoGradient),
  )
  const [openLogoColorItems, setOpenLogoColorItems] = useState<string[]>(["solid"])
  const [brandIconQuery, setBrandIconQuery] = useState("")
  const [brandIconCategory, setBrandIconCategory] =
    useState<DraftingBrandIconCategoryFilter>("all")
  const [selectedLogoPresetId, setSelectedLogoPresetId] = useState<BrandIconId | undefined>(
    DEFAULT_DRAFTING_STUDIO_STATE.logo.presetId,
  )
  const [selectedLogoPresetValue, setSelectedLogoPresetValue] = useState<string | undefined>(
    DEFAULT_DRAFTING_STUDIO_STATE.logo.value,
  )
  const [selectedLogoAssetSourceMode, setSelectedLogoAssetSourceMode] =
    useState<DraftingAssetSourceMode>(
      DEFAULT_DRAFTING_STUDIO_STATE.logo.source === "url" ? "url" : "upload",
    )
  const [selectedLogoRemoteUrl, setSelectedLogoRemoteUrl] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.logo.source === "url"
      ? (DEFAULT_DRAFTING_STUDIO_STATE.logo.value ?? "")
      : "",
  )
  const [openLogoUploadItems, setOpenLogoUploadItems] = useState<string[]>(["upload"])
  const [selectedLogoSize, setSelectedLogoSize] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.imageOptions.imageSize * 100,
  )
  const [selectedLogoMargin, setSelectedLogoMargin] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.imageOptions.margin,
  )
  const [selectedHideBackgroundDots, setSelectedHideBackgroundDots] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.imageOptions.hideBackgroundDots,
  )
  const [selectedSaveAsBlob, setSelectedSaveAsBlob] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.imageOptions.saveAsBlob,
  )
  const [selectedTypeNumber, setSelectedTypeNumber] = useState<TypeNumber>(
    DEFAULT_DRAFTING_STUDIO_STATE.qrOptions.typeNumber,
  )
  const [selectedErrorCorrectionLevel, setSelectedErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>(
      DEFAULT_DRAFTING_STUDIO_STATE.qrOptions.errorCorrectionLevel,
    )
  const [draftingScene, setDraftingScene] = useState(() => createDashboardComposeScene())
  const isComposeEditMode = false
  const [selectedComposeNodeId, setSelectedComposeNodeId] = useState<string | null>(null)
  const [activeQrNodeId, setActiveQrNodeId] = useState(DASHBOARD_QR_NODE_ID)
  const [qrStateByNodeId, setQrStateByNodeId] = useState<DraftingQrStateByNodeId>(() => ({
    [DASHBOARD_QR_NODE_ID]: cloneDraftingQrState(DEFAULT_DRAFTING_STUDIO_STATE),
  }))
  const [composeErrorMessage, setComposeErrorMessage] = useState<string | null>(null)
  const [selectedDownloadExtension, setSelectedDownloadExtension] =
    useState<DraftingDownloadExtension>("png")
  const [selectedDownloadTarget, setSelectedDownloadTarget] =
    useState<DraftingDownloadTarget>("current")
  const [selectedRasterExportPresetId, setSelectedRasterExportPresetId] =
    useState<DraftingRasterExportPresetId>(DEFAULT_DRAFTING_RASTER_EXPORT_PRESET_ID)
  const [draftingExportSizePreview, setDraftingExportSizePreview] =
    useState<DraftingExportSizePreview>({
      status: "idle",
    })
  const [activePanelTabs, setActivePanelTabs] = useState<Record<DraftingToolId, string>>(
    DEFAULT_DRAFTING_PANEL_TABS,
  )
  const dashboardPayloadRequestRef = useRef(0)
  const draftingExportPreviewRequestRef = useRef(0)
  const draftingExportPreviewTimeoutRef = useRef<number | null>(null)
  const activeToolConfig =
    DRAFTING_TOOLS.find((section) => section.id === activeTool) ?? DRAFTING_TOOLS[0]
  const activeToolTabs = DRAFTING_PANEL_TABS[activeTool]
  const activePanelTab = activePanelTabs[activeTool]
  const filteredBrandIcons = filterBrandIcons(brandIconQuery, brandIconCategory)
  const draftingStudioState = useMemo<QrStudioState>(
    () => ({
      ...DEFAULT_DRAFTING_STUDIO_STATE,
      data: selectedContentValue,
      type: DEFAULT_DRAFTING_STUDIO_STATE.type,
      width: selectedQrSize,
      height: selectedQrSize,
      margin: selectedQrMargin,
      rasterExportQualityPercent: selectedRasterExportQualityPercent,
      logo: {
        presetColor: selectedLogoColor,
        presetId: selectedLogoPresetId,
        source: selectedLogoSourceMode,
        value:
          selectedLogoSourceMode === "preset"
            ? selectedLogoPresetValue
            : selectedLogoSourceMode === "url"
              ? selectedLogoRemoteUrl
              : undefined,
      },
      backgroundImage: {
        presetColor: undefined,
        presetId: undefined,
        source: selectedBackgroundAssetSourceMode === "url" ? "url" : "none",
        value:
          selectedBackgroundAssetSourceMode === "url"
            ? selectedBackgroundRemoteUrl
            : undefined,
      },
      qrOptions: {
        ...DEFAULT_DRAFTING_STUDIO_STATE.qrOptions,
        typeNumber: selectedTypeNumber,
        errorCorrectionLevel: selectedErrorCorrectionLevel,
      },
      imageOptions: {
        ...DEFAULT_DRAFTING_STUDIO_STATE.imageOptions,
        hideBackgroundDots: selectedHideBackgroundDots,
        imageSize: selectedLogoSize / 100,
        margin: selectedLogoMargin,
        saveAsBlob: selectedSaveAsBlob,
      },
      dotsOptions: {
        ...DEFAULT_DRAFTING_STUDIO_STATE.dotsOptions,
        type: selectedDotType,
        color: selectedDotColor,
      },
      dotsColorMode: selectedDotsColorMode,
      dotsPalette: [...selectedDotsPalette],
      cornersSquareOptions: {
        type: selectedCornerSquareType,
        color: selectedCornerSquareColor,
      },
      cornersDotOptions: {
        type: selectedCornerDotType,
        color: selectedCornerDotColor,
      },
      backgroundOptions: {
        color: selectedBackgroundColor,
        transparent: false,
      },
      logoGradient: {
        ...structuredClone(selectedLogoGradient),
        enabled: selectedLogoColorMode === "gradient",
      },
      dotsGradient: {
        ...structuredClone(selectedDotsGradient),
        enabled: selectedDotsColorMode === "gradient",
      },
      cornersSquareGradient: {
        ...structuredClone(selectedCornerSquareGradient),
        enabled: selectedCornerSquareColorMode === "gradient",
      },
      cornersDotGradient: {
        ...structuredClone(selectedCornerDotGradient),
        enabled: selectedCornerDotColorMode === "gradient",
      },
      backgroundGradient: {
        ...structuredClone(selectedBackgroundGradient),
        enabled: selectedBackgroundColorMode === "gradient",
      },
    }),
    [
      selectedBackgroundAssetSourceMode,
      selectedBackgroundColor,
      selectedBackgroundColorMode,
      selectedBackgroundGradient,
      selectedBackgroundRemoteUrl,
      selectedContentValue,
      selectedCornerDotColor,
      selectedCornerDotColorMode,
      selectedCornerDotGradient,
      selectedCornerDotType,
      selectedCornerSquareColor,
      selectedCornerSquareColorMode,
      selectedCornerSquareGradient,
      selectedCornerSquareType,
      selectedDotColor,
      selectedDotsColorMode,
      selectedDotsGradient,
      selectedDotsPalette,
      selectedDotType,
      selectedErrorCorrectionLevel,
      selectedHideBackgroundDots,
      selectedLogoColor,
      selectedLogoColorMode,
      selectedLogoGradient,
      selectedLogoMargin,
      selectedLogoPresetId,
      selectedLogoPresetValue,
      selectedLogoRemoteUrl,
      selectedLogoSize,
      selectedLogoSourceMode,
      selectedRasterExportQualityPercent,
      selectedQrMargin,
      selectedQrSize,
      selectedSaveAsBlob,
      selectedTypeNumber,
    ],
  )
  const ensureDotsColorItemExpanded = (itemId: DotsColorMode) =>
    setOpenDotsColorItems((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    )
  const ensureCornerSquareColorItemExpanded = (itemId: DraftingBinaryColorMode) =>
    setOpenCornerSquareColorItems((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    )
  const ensureCornerDotColorItemExpanded = (itemId: DraftingBinaryColorMode) =>
    setOpenCornerDotColorItems((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    )
  const ensureBackgroundColorItemExpanded = (itemId: DraftingBinaryColorMode) =>
    setOpenBackgroundColorItems((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    )
  const ensureLogoColorItemExpanded = (itemId: DraftingBinaryColorMode) =>
    setOpenLogoColorItems((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    )
  const ensureBackgroundUploadItemExpanded = (itemId: DraftingAssetSourceMode) =>
    setOpenBackgroundUploadItems((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    )
  const ensureLogoUploadItemExpanded = (itemId: DraftingAssetSourceMode) =>
    setOpenLogoUploadItems((current) =>
      current.includes(itemId) ? current : [...current, itemId],
    )
  const canDownload = Boolean(draftingStudioState.data.trim())
  const isDraftingRasterExport = isRasterExportExtension(selectedDownloadExtension)
  const selectedRasterExportPreset =
    DRAFTING_RASTER_EXPORT_PRESETS.find(
      (preset) => preset.id === selectedRasterExportPresetId,
    ) ?? DRAFTING_RASTER_EXPORT_PRESETS[1]
  const selectedRasterExportTargetSizePx = isDraftingRasterExport
    ? selectedRasterExportPreset.sizePx
    : undefined
  const draftingQrNodes = useMemo(() => getDashboardQrNodes(draftingScene), [draftingScene])
  const activeQrDownloadTarget = getDraftingQrNodeDownloadTarget(activeQrNodeId)
  const shouldMeasureActiveQrExport =
    !isComposeEditMode &&
    (selectedDownloadTarget === "current" ||
      selectedDownloadTarget === activeQrDownloadTarget)
  const shouldMeasureFullPageExport =
    isComposeEditMode && selectedDownloadTarget === "current"
  const draftingDownloadTargetOptions = useMemo(
    () => [
      {
        id: "current" as const,
        label: isComposeEditMode ? "Full page" : "Current QR",
      },
      ...(draftingQrNodes.length > 0 || !isComposeEditMode
        ? [
            {
              id: "all-qr" as const,
              label: "All QR codes",
            },
          ]
        : []),
      ...draftingQrNodes.map((node) => ({
        id: getDraftingQrNodeDownloadTarget(node.id),
        label: node.name,
      })),
    ],
    [draftingQrNodes, isComposeEditMode],
  )
  const effectiveDraftingExportSizePreview: DraftingExportSizePreview =
    canDownload && isDraftingRasterExport
      ? draftingExportSizePreview
      : {
          status: "idle",
        }

  function buildDraftingLogoStateSnapshot({
    logoColor = selectedLogoColor,
    logoColorMode = selectedLogoColorMode,
    logoGradient = selectedLogoGradient,
    logoPresetId = selectedLogoPresetId,
    logoPresetValue = selectedLogoPresetValue,
    logoRemoteUrl = selectedLogoRemoteUrl,
    logoSourceMode = selectedLogoSourceMode,
  }: {
    logoColor?: string
    logoColorMode?: DraftingBinaryColorMode
    logoGradient?: StudioGradient
    logoPresetId?: BrandIconId
    logoPresetValue?: string
    logoRemoteUrl?: string
    logoSourceMode?: AssetSourceMode
  } = {}): QrStudioState {
    return {
      ...DEFAULT_DRAFTING_STUDIO_STATE,
      logo: {
        presetColor: logoColor,
        presetId: logoPresetId,
        source: logoSourceMode,
        value:
          logoSourceMode === "preset"
            ? logoPresetValue
            : logoSourceMode === "url"
              ? logoRemoteUrl
              : undefined,
      },
      logoGradient: {
        ...structuredClone(logoGradient),
        enabled: logoColorMode === "gradient",
      },
    }
  }

  function syncDraftingLogoAsset(nextState: QrStudioState) {
    setSelectedLogoSourceMode(nextState.logo.source)
    setSelectedLogoPresetId(nextState.logo.presetId)
    setSelectedLogoPresetValue(
      nextState.logo.source === "preset" ? nextState.logo.value : undefined,
    )

    if (nextState.logo.source === "url") {
      setSelectedLogoAssetSourceMode("url")
      setSelectedLogoRemoteUrl(nextState.logo.value ?? "")
    }
  }

  function clearDraftingLogoPreset(nextSourceMode: DraftingAssetSourceMode) {
    const clearedState = applyAssetNoneSelection(buildDraftingLogoStateSnapshot(), "logo")

    setSelectedLogoPresetId(clearedState.logo.presetId)
    setSelectedLogoPresetValue(undefined)
    setSelectedLogoSourceMode(nextSourceMode)
    setSelectedLogoAssetSourceMode(nextSourceMode)

    if (nextSourceMode === "upload") {
      setSelectedLogoRemoteUrl("")
    }
  }

  function handleDraftingBrandIconSelection(brandIcon: BrandIconEntry) {
    const nextValue =
      selectedLogoColorMode === "gradient"
        ? createBrandIconGradientDataUrl(brandIcon, {
            ...structuredClone(selectedLogoGradient),
            enabled: true,
          })
        : createBrandIconDataUrl(brandIcon, selectedLogoColor)
    const nextState = applyLogoPresetSelection(
      buildDraftingLogoStateSnapshot({
        logoColorMode: selectedLogoColorMode,
      }),
      brandIcon,
      nextValue,
      selectedLogoColor,
    )

    syncDraftingLogoAsset(nextState)
  }

  function handleDraftingLogoColorChange(value: string) {
    ensureLogoColorItemExpanded("solid")
    setSelectedLogoColorMode("solid")
    setSelectedLogoColor(value)

    const selectedIcon = findBrandIconById(selectedLogoPresetId)

    if (!selectedIcon) {
      return
    }

    const nextState = applyLogoPresetColor(
      buildDraftingLogoStateSnapshot({
        logoColor: value,
        logoColorMode: "solid",
      }),
      createBrandIconDataUrl(selectedIcon, value),
      value,
    )

    syncDraftingLogoAsset(nextState)
  }

  function handleDraftingLogoGradientChange(value: StudioGradient) {
    const nextGradient = {
      ...structuredClone(value),
      enabled: true,
    }

    ensureLogoColorItemExpanded("gradient")
    setSelectedLogoColorMode("gradient")
    setSelectedLogoGradient(nextGradient)

    const selectedIcon = findBrandIconById(selectedLogoPresetId)

    if (!selectedIcon) {
      return
    }

    const nextState = applyLogoPresetGradient(
      buildDraftingLogoStateSnapshot({
        logoColorMode: "gradient",
        logoGradient: nextGradient,
      }),
      createBrandIconGradientDataUrl(selectedIcon, nextGradient),
      nextGradient,
    )

    syncDraftingLogoAsset(nextState)
  }

  function applyDraftingQrStateToControls(nextState: QrStudioState) {
    setSelectedContentValue(nextState.data)
    setSelectedQrMargin(nextState.margin)
    setSelectedRasterExportQualityPercent(nextState.rasterExportQualityPercent)
    setSelectedQrSize(nextState.width)
    setSelectedDotType(nextState.dotsOptions.type)
    setSelectedDotsColorMode(nextState.dotsColorMode)
    setSelectedDotColor(nextState.dotsOptions.color)
    setSelectedDotsGradient(structuredClone(nextState.dotsGradient))
    setOpenDotsColorItems([nextState.dotsColorMode])
    setSelectedCornerSquareType(nextState.cornersSquareOptions.type)
    setSelectedCornerSquareColorMode(
      nextState.cornersSquareGradient.enabled ? "gradient" : "solid",
    )
    setSelectedCornerSquareColor(nextState.cornersSquareOptions.color)
    setSelectedCornerSquareGradient(structuredClone(nextState.cornersSquareGradient))
    setOpenCornerSquareColorItems([
      nextState.cornersSquareGradient.enabled ? "gradient" : "solid",
    ])
    setSelectedCornerDotType(nextState.cornersDotOptions.type)
    setSelectedCornerDotColorMode(nextState.cornersDotGradient.enabled ? "gradient" : "solid")
    setSelectedCornerDotColor(nextState.cornersDotOptions.color)
    setSelectedCornerDotGradient(structuredClone(nextState.cornersDotGradient))
    setOpenCornerDotColorItems([nextState.cornersDotGradient.enabled ? "gradient" : "solid"])
    setSelectedBackgroundColorMode(
      nextState.backgroundGradient.enabled ? "gradient" : "solid",
    )
    setSelectedBackgroundColor(nextState.backgroundOptions.color)
    setSelectedBackgroundGradient(structuredClone(nextState.backgroundGradient))
    setOpenBackgroundColorItems([nextState.backgroundGradient.enabled ? "gradient" : "solid"])
    setSelectedBackgroundAssetSourceMode(
      nextState.backgroundImage.source === "url" ? "url" : "upload",
    )
    setSelectedBackgroundRemoteUrl(
      nextState.backgroundImage.source === "url" ? (nextState.backgroundImage.value ?? "") : "",
    )
    setOpenBackgroundUploadItems([
      nextState.backgroundImage.source === "url" ? "url" : "upload",
    ])
    setSelectedLogoColorMode(nextState.logoGradient.enabled ? "gradient" : "solid")
    setSelectedLogoSourceMode(nextState.logo.source)
    setSelectedLogoColor(nextState.logo.presetColor ?? DEFAULT_BRAND_ICON_COLOR)
    setSelectedLogoGradient(structuredClone(nextState.logoGradient))
    setOpenLogoColorItems([nextState.logoGradient.enabled ? "gradient" : "solid"])
    setSelectedLogoPresetId(nextState.logo.presetId)
    setSelectedLogoPresetValue(nextState.logo.source === "preset" ? nextState.logo.value : undefined)
    setSelectedLogoAssetSourceMode(nextState.logo.source === "url" ? "url" : "upload")
    setSelectedLogoRemoteUrl(
      nextState.logo.source === "url" ? (nextState.logo.value ?? "") : "",
    )
    setOpenLogoUploadItems([nextState.logo.source === "url" ? "url" : "upload"])
    setSelectedLogoSize(nextState.imageOptions.imageSize * 100)
    setSelectedLogoMargin(nextState.imageOptions.margin)
    setSelectedHideBackgroundDots(nextState.imageOptions.hideBackgroundDots)
    setSelectedSaveAsBlob(nextState.imageOptions.saveAsBlob)
    setSelectedTypeNumber(nextState.qrOptions.typeNumber)
    setSelectedErrorCorrectionLevel(nextState.qrOptions.errorCorrectionLevel)
  }

  function handleComposeNodeSelection(nodeId: string | null) {
    if (nodeId && isDashboardQrNodeId(nodeId)) {
      const nextQrState =
        nodeId === activeQrNodeId
          ? draftingStudioState
          : (qrStateByNodeId[nodeId] ?? draftingStudioState)

      setQrStateByNodeId((current) => ({
        ...current,
        [activeQrNodeId]: cloneDraftingQrState(draftingStudioState),
        [nodeId]: cloneDraftingQrState(nextQrState),
      }))
      setActiveQrNodeId(nodeId)
      applyDraftingQrStateToControls(nextQrState)
    }

    setSelectedComposeNodeId(nodeId)
  }

  function resetDraftingWorkspace() {
    const nextState = createDefaultQrStudioState()

    setActiveTool(DEFAULT_QR_EDITOR_SECTION)
    applyDraftingQrStateToControls(nextState)
    setBrandIconQuery("")
    setBrandIconCategory("all")
    setSelectedComposeNodeId(null)
    setActiveQrNodeId(DASHBOARD_QR_NODE_ID)
    setQrStateByNodeId({
      [DASHBOARD_QR_NODE_ID]: cloneDraftingQrState(nextState),
    })
    setComposeErrorMessage(null)
    setSelectedDownloadExtension("png")
    setSelectedDownloadTarget("current")
    setSelectedRasterExportPresetId(DEFAULT_DRAFTING_RASTER_EXPORT_PRESET_ID)
    setDraftingExportSizePreview({
      status: "idle",
    })
    setDraftingScene(createDashboardComposeScene())
    setActivePanelTabs({ ...DEFAULT_DRAFTING_PANEL_TABS })
  }

  useEffect(() => {
    return () => {
      if (draftingExportPreviewTimeoutRef.current !== null) {
        window.clearTimeout(draftingExportPreviewTimeoutRef.current)
      }

    }
  }, [])

  useEffect(() => {
    const requestId = ++dashboardPayloadRequestRef.current

    void buildDashboardQrNodePayload(draftingStudioState)
      .then((payload) => {
        if (dashboardPayloadRequestRef.current !== requestId) {
          return
        }

        setDraftingScene((current) => upsertDashboardQrNode(current, payload, activeQrNodeId))
        queueMicrotask(() => setComposeErrorMessage(null))
      })
      .catch(() => {
        if (dashboardPayloadRequestRef.current !== requestId) {
          return
        }

        queueMicrotask(() => {
          setComposeErrorMessage("The compose surface could not be updated.")
        })
      })
  }, [activeQrNodeId, draftingStudioState])

  useEffect(() => {
    if (draftingExportPreviewTimeoutRef.current !== null) {
      window.clearTimeout(draftingExportPreviewTimeoutRef.current)
    }

    const requestId = ++draftingExportPreviewRequestRef.current

    if (
      !canDownload ||
      !isDraftingRasterExport ||
      (!shouldMeasureFullPageExport && !shouldMeasureActiveQrExport)
    ) {
      queueMicrotask(() => {
        if (draftingExportPreviewRequestRef.current !== requestId) {
          return
        }

        setDraftingExportSizePreview({
          status: "idle",
        })
      })
      return
    }

    queueMicrotask(() => {
      if (draftingExportPreviewRequestRef.current !== requestId) {
        return
      }

      setDraftingExportSizePreview({
        status: "pending",
      })
    })

    draftingExportPreviewTimeoutRef.current = window.setTimeout(() => {
      void measureDashboardRasterExport({
        extension: selectedDownloadExtension,
        qualityPercent: draftingStudioState.rasterExportQualityPercent,
        state: draftingStudioState,
        targetSizePx: selectedRasterExportTargetSizePx,
      })
        .then((result) => {
          if (draftingExportPreviewRequestRef.current !== requestId) {
            return
          }

          setDraftingExportSizePreview({
            ...result,
            status: "ready",
          })
        })
        .catch(() => {
          if (draftingExportPreviewRequestRef.current !== requestId) {
            return
          }

          setDraftingExportSizePreview({
            status: "error",
          })
        })
    }, 250)

    return () => {
      if (draftingExportPreviewTimeoutRef.current !== null) {
        window.clearTimeout(draftingExportPreviewTimeoutRef.current)
      }
    }
  }, [
    canDownload,
    draftingScene,
    draftingStudioState,
    isComposeEditMode,
    isDraftingRasterExport,
    selectedDownloadExtension,
    selectedDownloadTarget,
    selectedRasterExportTargetSizePx,
    shouldMeasureActiveQrExport,
    shouldMeasureFullPageExport,
  ])

  async function handleAddQrCode() {
    const sourceQrNodeId =
      selectedComposeNodeId && isDashboardQrNodeId(selectedComposeNodeId)
        ? selectedComposeNodeId
        : activeQrNodeId
    const sourceState =
      sourceQrNodeId === activeQrNodeId
        ? draftingStudioState
        : (qrStateByNodeId[sourceQrNodeId] ?? draftingStudioState)
    const nextNodeId = `${DASHBOARD_QR_NODE_ID}-${crypto.randomUUID()}`
    const nextName = getNextDraftingQrLayerName(draftingScene)

    try {
      const payload = await buildDashboardQrNodePayload(sourceState)

      setQrStateByNodeId((current) => ({
        ...current,
        [activeQrNodeId]: cloneDraftingQrState(draftingStudioState),
        [nextNodeId]: cloneDraftingQrState(sourceState),
      }))
      setDraftingScene((current) => {
        const sourceNode = getDashboardComposeNode(current, sourceQrNodeId)
        const createdScene = upsertDashboardQrNode(
          current,
          {
            ...payload,
            name: nextName,
          },
          nextNodeId,
        )
        const createdNode = getDashboardComposeNode(createdScene, nextNodeId)

        if (!sourceNode || !createdNode) {
          return createdScene
        }

        return updateDashboardComposeNode(createdScene, nextNodeId, {
          name: nextName,
          naturalHeight: payload.naturalHeight,
          naturalWidth: payload.naturalWidth,
          rotation: sourceNode.rotation,
          scale: sourceNode.scale,
          x: sourceNode.x + 36,
          y: sourceNode.y + 36,
        })
      })
      setActiveQrNodeId(nextNodeId)
      applyDraftingQrStateToControls(sourceState)
      setSelectedComposeNodeId(nextNodeId)
      setComposeErrorMessage(null)
    } catch {
      setComposeErrorMessage("The QR layer could not be added. Try again.")
    }
  }

  async function buildDraftingSceneWithFreshActiveQrNode() {
    const payload = await buildDashboardQrNodePayload(draftingStudioState)
    const nextScene = upsertDashboardQrNode(draftingScene, payload, activeQrNodeId)

    setDraftingScene(nextScene)
    setQrStateByNodeId((current) => ({
      ...current,
      [activeQrNodeId]: cloneDraftingQrState(draftingStudioState),
    }))

    return nextScene
  }

  async function handleDownload() {
    try {
      if (selectedDownloadTarget === "all-qr") {
        const nextScene = await buildDraftingSceneWithFreshActiveQrNode()
        const qrNodes = getDashboardQrNodes(nextScene)

        if (qrNodes.length === 0) {
          throw new Error("No QR codes are available for export.")
        }

        await downloadDashboardQrBatchZipExport({
          extension: selectedDownloadExtension,
          name: DEFAULT_DOWNLOAD_NAME,
          nodes: qrNodes,
          qualityPercent: draftingStudioState.rasterExportQualityPercent,
          targetSizePx: selectedRasterExportTargetSizePx,
        })
      } else if (selectedDownloadTarget === "current" || selectedDownloadTarget.startsWith("qr:")) {
        const nextScene = await buildDraftingSceneWithFreshActiveQrNode()
        const nodeId =
          selectedDownloadTarget === "current"
            ? activeQrNodeId
            : selectedDownloadTarget.slice("qr:".length)
        const qrNode = getDashboardQrNodes(nextScene).find((node) => node.id === nodeId)

        if (!qrNode) {
          throw new Error("The selected QR code is unavailable for export.")
        }

        await downloadDashboardQrNodeExport({
          extension: selectedDownloadExtension,
          name: qrNode.name,
          node: qrNode,
          qualityPercent: draftingStudioState.rasterExportQualityPercent,
          targetSizePx: selectedRasterExportTargetSizePx,
        })
      } else if (isRasterExportExtension(selectedDownloadExtension)) {
        await downloadDashboardRasterExport({
          extension: selectedDownloadExtension,
          name: DEFAULT_DOWNLOAD_NAME,
          qualityPercent: draftingStudioState.rasterExportQualityPercent,
          state: draftingStudioState,
          targetSizePx: selectedRasterExportTargetSizePx,
        })
      } else {
        await downloadDraftingSvgExport({
          name: DEFAULT_DOWNLOAD_NAME,
          state: draftingStudioState,
        })
      }

      setComposeErrorMessage(null)
    } catch {
      setComposeErrorMessage(
        isComposeEditMode
          ? "The document could not be exported. Try another format."
          : "The QR image could not be exported. Try another format.",
      )
    }
  }

  const renderPanelContent = (toolId: DraftingToolId, tabId: string) => {
    if (toolId === "content" && tabId === "content") {
      return (
        <DraftingContentTab
          contentValue={selectedContentValue}
          onContentValueChange={setSelectedContentValue}
        />
      )
    }

    if (toolId === "style" && tabId === "style") {
      return <DraftingStyleTab onValueChange={setSelectedDotType} value={selectedDotType} />
    }

    if (toolId === "style" && tabId === "color") {
      return (
        <DraftingDotsColorTab
          gradient={selectedDotsGradient}
          mode={selectedDotsColorMode}
          openItemIds={openDotsColorItems}
          palette={selectedDotsPalette}
          solidColor={selectedDotColor}
          onGradientChange={(value) => {
            ensureDotsColorItemExpanded("gradient")
            setSelectedDotsColorMode("gradient")
            setSelectedDotsGradient({ ...value, enabled: true })
          }}
          onModeChange={(value) => {
            ensureDotsColorItemExpanded(value)
            setSelectedDotsColorMode(value)
          }}
          onOpenItemIdsChange={setOpenDotsColorItems}
          onSolidColorChange={(value) => {
            ensureDotsColorItemExpanded("solid")
            setSelectedDotsColorMode("solid")
            setSelectedDotColor(value)
          }}
        />
      )
    }

    if (toolId === "style" && tabId === "size") {
      return (
        <DraftingSizeTab
          margin={selectedQrMargin}
          size={selectedQrSize}
          onMarginChange={setSelectedQrMargin}
          onSizeChange={setSelectedQrSize}
        />
      )
    }

    if (toolId === "corner-square" && tabId === "style") {
      return (
        <DraftingCornerSquareStyleTab
          onValueChange={setSelectedCornerSquareType}
          value={selectedCornerSquareType}
        />
      )
    }

    if (toolId === "corner-square" && tabId === "color") {
      return (
        <DraftingCornerSquareColorTab
          gradient={selectedCornerSquareGradient}
          mode={selectedCornerSquareColorMode}
          openItemIds={openCornerSquareColorItems}
          solidColor={selectedCornerSquareColor}
          onGradientChange={(value) => {
            ensureCornerSquareColorItemExpanded("gradient")
            setSelectedCornerSquareColorMode("gradient")
            setSelectedCornerSquareGradient({ ...value, enabled: true })
          }}
          onModeChange={(value) => {
            ensureCornerSquareColorItemExpanded(value)
            setSelectedCornerSquareColorMode(value)
          }}
          onOpenItemIdsChange={setOpenCornerSquareColorItems}
          onSolidColorChange={(value) => {
            ensureCornerSquareColorItemExpanded("solid")
            setSelectedCornerSquareColorMode("solid")
            setSelectedCornerSquareColor(value)
          }}
        />
      )
    }

    if (toolId === "corner-dot" && tabId === "style") {
      return (
        <DraftingCornerDotStyleTab
          onValueChange={setSelectedCornerDotType}
          value={selectedCornerDotType}
        />
      )
    }

    if (toolId === "corner-dot" && tabId === "color") {
      return (
        <DraftingCornerDotColorTab
          gradient={selectedCornerDotGradient}
          mode={selectedCornerDotColorMode}
          openItemIds={openCornerDotColorItems}
          solidColor={selectedCornerDotColor}
          onGradientChange={(value) => {
            ensureCornerDotColorItemExpanded("gradient")
            setSelectedCornerDotColorMode("gradient")
            setSelectedCornerDotGradient({ ...value, enabled: true })
          }}
          onModeChange={(value) => {
            ensureCornerDotColorItemExpanded(value)
            setSelectedCornerDotColorMode(value)
          }}
          onOpenItemIdsChange={setOpenCornerDotColorItems}
          onSolidColorChange={(value) => {
            ensureCornerDotColorItemExpanded("solid")
            setSelectedCornerDotColorMode("solid")
            setSelectedCornerDotColor(value)
          }}
        />
      )
    }

    if (toolId === "background" && tabId === "colors") {
      return (
        <DraftingBackgroundColorTab
          gradient={selectedBackgroundGradient}
          mode={selectedBackgroundColorMode}
          openItemIds={openBackgroundColorItems}
          solidColor={selectedBackgroundColor}
          onGradientChange={(value) => {
            ensureBackgroundColorItemExpanded("gradient")
            setSelectedBackgroundColorMode("gradient")
            setSelectedBackgroundGradient({ ...value, enabled: true })
          }}
          onModeChange={(value) => {
            ensureBackgroundColorItemExpanded(value)
            setSelectedBackgroundColorMode(value)
          }}
          onOpenItemIdsChange={setOpenBackgroundColorItems}
          onSolidColorChange={(value) => {
            ensureBackgroundColorItemExpanded("solid")
            setSelectedBackgroundColorMode("solid")
            setSelectedBackgroundColor(value)
          }}
        />
      )
    }

    if (toolId === "background" && tabId === "upload") {
      return (
        <DraftingBackgroundUploadTab
          mode={selectedBackgroundAssetSourceMode}
          openItemIds={openBackgroundUploadItems}
          remoteUrl={selectedBackgroundRemoteUrl}
          onModeChange={(value) => {
            ensureBackgroundUploadItemExpanded(value)
            setSelectedBackgroundAssetSourceMode(value)
          }}
          onOpenItemIdsChange={setOpenBackgroundUploadItems}
          onRemoteUrlChange={(value) => {
            ensureBackgroundUploadItemExpanded("url")
            setSelectedBackgroundAssetSourceMode("url")
            setSelectedBackgroundRemoteUrl(value)
          }}
          onUploadError={IGNORE_DRAFTING_UPLOAD_ERROR}
          onUploadSuccess={() => {
            ensureBackgroundUploadItemExpanded("upload")
            setSelectedBackgroundAssetSourceMode("upload")
          }}
        />
      )
    }

    if (toolId === "logo" && tabId === "colors") {
      return (
        <DraftingLogoColorTab
          gradient={selectedLogoGradient}
          mode={selectedLogoColorMode}
          openItemIds={openLogoColorItems}
          solidColor={selectedLogoColor}
          onGradientChange={handleDraftingLogoGradientChange}
          onModeChange={(value) => {
            ensureLogoColorItemExpanded(value)
            setSelectedLogoColorMode(value)
          }}
          onOpenItemIdsChange={setOpenLogoColorItems}
          onSolidColorChange={handleDraftingLogoColorChange}
        />
      )
    }

    if (toolId === "logo" && tabId === "brand-icons") {
      return (
        <DraftingBrandIconTab
          brandIcons={filteredBrandIcons}
          brandIconQuery={brandIconQuery}
          selectedBrandIconId={selectedLogoPresetId}
          selectedCategory={brandIconCategory}
          onBrandIconCategoryChange={setBrandIconCategory}
          onBrandIconQueryChange={setBrandIconQuery}
          onSelect={handleDraftingBrandIconSelection}
        />
      )
    }

    if (toolId === "logo" && tabId === "upload") {
      return (
        <DraftingLogoUploadTab
          mode={selectedLogoAssetSourceMode}
          openItemIds={openLogoUploadItems}
          remoteUrl={selectedLogoRemoteUrl}
          onModeChange={(value) => {
            ensureLogoUploadItemExpanded(value)

            if (value === "upload") {
              clearDraftingLogoPreset("upload")
              return
            }

            const nextState = applyAssetUrlValue(
              buildDraftingLogoStateSnapshot({
                logoRemoteUrl: selectedLogoRemoteUrl,
                logoSourceMode: "url",
              }),
              "logo",
              selectedLogoRemoteUrl,
            )

            syncDraftingLogoAsset(nextState)
          }}
          onOpenItemIdsChange={setOpenLogoUploadItems}
          onRemoteUrlChange={(value) => {
            ensureLogoUploadItemExpanded("url")
            const nextState = applyAssetUrlValue(
              buildDraftingLogoStateSnapshot({
                logoRemoteUrl: value,
                logoSourceMode: "url",
              }),
              "logo",
              value,
            )

            syncDraftingLogoAsset(nextState)
          }}
          onUploadError={IGNORE_DRAFTING_UPLOAD_ERROR}
          onUploadSuccess={() => {
            ensureLogoUploadItemExpanded("upload")
            clearDraftingLogoPreset("upload")
          }}
        />
      )
    }

    if (toolId === "logo" && tabId === "size") {
      return (
        <DraftingLogoSizeTab
          hideBackgroundDots={selectedHideBackgroundDots}
          logoMargin={selectedLogoMargin}
          logoSize={selectedLogoSize}
          saveAsBlob={selectedSaveAsBlob}
          onHideBackgroundDotsChange={setSelectedHideBackgroundDots}
          onLogoMarginChange={setSelectedLogoMargin}
          onLogoSizeChange={setSelectedLogoSize}
          onSaveAsBlobChange={setSelectedSaveAsBlob}
        />
      )
    }

    if (toolId === "encoding" && tabId === "encoding") {
      return (
        <DraftingEncodingTab
          errorCorrectionLevel={selectedErrorCorrectionLevel}
          typeNumber={selectedTypeNumber}
          onErrorCorrectionLevelChange={setSelectedErrorCorrectionLevel}
          onTypeNumberChange={setSelectedTypeNumber}
        />
      )
    }

    if (toolId === "layers" && tabId === "layers") {
      return (
        <DraftingLayersTab
          onSceneChange={setDraftingScene}
          onSelectedNodeChange={handleComposeNodeSelection}
          scene={draftingScene}
          selectedNodeId={selectedComposeNodeId}
        />
      )
    }

    return null
  }

  return (
    <section
      aria-label="Drafting workspace"
      data-logo-color-mode={selectedLogoColorMode}
      data-logo-preset-id={selectedLogoPresetId ?? ""}
      data-logo-preset-value={selectedLogoPresetValue ?? ""}
      data-logo-source-mode={selectedLogoSourceMode}
      data-qr-content-value={selectedContentValue}
      data-qr-error-correction-level={selectedErrorCorrectionLevel}
      data-qr-margin={selectedQrMargin}
      data-qr-size={selectedQrSize}
      data-qr-type-number={selectedTypeNumber}
      data-slot="drafting-surface"
      className="relative grid h-dvh w-full grid-rows-[var(--new-header-height)_minmax(0,1fr)] overflow-visible bg-[var(--drafting-surface-bg)] sm:h-[calc(100dvh-4rem)] lg:border lg:border-dashed lg:border-[var(--drafting-line-hover)] lg:shadow-[var(--drafting-shadow-shell)] [--new-header-height:3.875rem] [--new-left-rail-width:clamp(6.25rem,10vw,7.5rem)] [--new-middle-rail-width:clamp(15rem,24vw,18.5rem)] [--new-mobile-rail-height:3.25rem]"
      data-compose-edit-mode={isComposeEditMode ? "true" : "false"}
      data-compose-selected-node-id={selectedComposeNodeId ?? ""}
    >
      {OUTER_MARKERS.map((marker) => (
        <PlusMarker key={marker} className={marker} />
      ))}
      {JUNCTION_MARKERS.map((marker) => (
        <PlusMarker key={marker} className={marker} />
      ))}

      <div
        aria-hidden="true"
        data-slot="drafting-divider-horizontal"
        className="pointer-events-none absolute left-0 right-0 top-[var(--new-header-height)] z-20 h-0"
      />
      <div
        aria-hidden="true"
        data-slot="drafting-divider-vertical"
        className="pointer-events-none absolute bottom-0 left-[var(--new-left-rail-width)] top-[var(--new-header-height)] z-20 hidden w-0 lg:block"
      />
      <div
        aria-hidden="true"
        data-slot="drafting-divider-vertical"
        className="pointer-events-none absolute bottom-0 left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] top-[var(--new-header-height)] z-20 hidden w-0 lg:block"
      />

      <header
        aria-label="Header frame"
        data-slot="drafting-header"
        className="min-h-0 min-w-0 px-3 py-2 sm:px-4"
      >
        <div className="flex h-full min-w-0 items-center justify-end">
          <div data-slot="drafting-header-actions" className="flex h-full min-w-0 max-w-full items-center gap-1.5 sm:gap-2.5">
            <ModeToggle appearance="drafting" className="shrink-0 border-[var(--drafting-line)] bg-[var(--drafting-panel-bg)] px-2 text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)] backdrop-blur-sm [&>span:first-child]:hidden sm:px-3 sm:[&>span:first-child]:inline" />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  aria-label="Open download options"
                  data-slot="drafting-download-trigger"
                  disabled={!canDownload}
                  type="button"
                  variant="ghost"
                  className="h-8 shrink-0 rounded-[6px] border-0 bg-[var(--drafting-control-bg)] px-2 text-[var(--drafting-ink-muted)] shadow-[var(--drafting-shadow-rest)] transition-[background-color,box-shadow,transform,color] duration-150 ease-out hover:-translate-y-px hover:bg-[var(--drafting-control-bg-hover)] hover:text-[var(--drafting-ink-strong-muted)] hover:shadow-[var(--drafting-shadow-hover)] active:translate-y-0 active:bg-[var(--drafting-control-bg-active)] active:shadow-[var(--drafting-shadow-active)] sm:px-3.5"
                >
                  <DownloadIcon data-icon="inline-start" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                data-slot="drafting-download-popover"
                sideOffset={10}
                className="flex max-h-[calc(100dvh-5rem)] w-[min(27rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-[12px] border border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] p-0 text-[var(--drafting-ink)] shadow-[var(--drafting-shadow-rest)] backdrop-blur-xl"
              >
                <div className="flex min-h-0 flex-1 flex-col">
                  <div
                    data-slot="drafting-download-dialog-body"
                    className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-2.5"
                  >
                    <div
                      data-slot="drafting-download-target-section"
                      className="flex flex-col gap-2.5"
                    >
                      <p className="text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[var(--drafting-ink)]">
                        Target
                      </p>
                      <div
                        data-slot="drafting-download-target-list"
                        role="radiogroup"
                        aria-label="Download target"
                        className="grid grid-cols-2 gap-1 sm:grid-cols-3"
                      >
                        {draftingDownloadTargetOptions.map((target) => {
                          const isSelected = target.id === selectedDownloadTarget

                          return (
                            <OptionCard
                              appearance="drafting"
                              darkShadowTone="ink"
                              key={target.id}
                              checked={isSelected}
                              className={cn(
                                "w-full gap-0",
                                "[&_[data-slot=option-card]]:h-full [&_[data-slot=option-card]]:min-h-[36px] [&_[data-slot=option-card]]:w-full [&_[data-slot=option-card]]:rounded-[7px]",
                                "[&_[data-slot=option-card-motif]]:size-full",
                                "[&_[data-slot=option-card-label]]:sr-only",
                              )}
                              label={`Download ${target.label}`}
                              motifClassName="size-full px-1.5 py-1"
                              name="drafting-download-target"
                              onSelect={() => setSelectedDownloadTarget(target.id)}
                              value={target.id}
                            >
                              <span
                                className={cn(
                                  "flex min-w-0 items-center justify-center text-center text-[0.7rem] font-semibold leading-tight",
                                  isSelected
                                    ? "text-[var(--drafting-ink)]"
                                    : "text-[var(--drafting-ink-muted)]",
                                )}
                              >
                                {target.label}
                              </span>
                            </OptionCard>
                          )
                        })}
                      </div>
                    </div>

                    <div
                      data-slot="drafting-download-format-section"
                      className="flex flex-col gap-2.5"
                    >
                      <p className="text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[var(--drafting-ink)]">
                        Format
                      </p>
                      <div
                        data-slot="drafting-download-format-grid"
                        role="radiogroup"
                        aria-label="Download format"
                        className="grid grid-cols-4 gap-1"
                      >
                        {DRAFTING_DOWNLOAD_EXTENSIONS.map((extension) => {
                          const isSelected = extension === selectedDownloadExtension

                          return (
                            <OptionCard
                              appearance="drafting"
                              darkShadowTone="ink"
                              key={extension}
                              checked={isSelected}
                              className={cn(
                                "w-full gap-0",
                                "[&_[data-slot=option-card]]:h-full [&_[data-slot=option-card]]:min-h-[36px] [&_[data-slot=option-card]]:w-full [&_[data-slot=option-card]]:rounded-[7px]",
                                "[&_[data-slot=option-card-motif]]:size-full",
                                "[&_[data-slot=option-card-label]]:sr-only",
                              )}
                              label={`Export ${extension.toUpperCase()}`}
                              motifClassName="size-full px-1.5 py-1"
                              name="drafting-download-format"
                              onSelect={() => setSelectedDownloadExtension(extension)}
                              value={extension}
                            >
                              <span className="flex size-full items-center justify-center text-center">
                                <span
                                  className={cn(
                                    "text-[0.68rem] font-semibold uppercase leading-none tracking-[0.1em]",
                                    isSelected
                                      ? "text-[var(--drafting-ink)]"
                                      : "text-[var(--drafting-ink-muted)]",
                                  )}
                                >
                                  {extension}
                                </span>
                              </span>
                            </OptionCard>
                          )
                        })}
                      </div>
                    </div>

                    {isDraftingRasterExport ? (
                      <div
                        data-slot="drafting-raster-preset-section"
                        className="flex flex-col gap-2.5"
                      >
                        <p className="text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[var(--drafting-ink)]">
                          Quality preset
                        </p>

                        <div
                          data-slot="drafting-raster-preset-grid"
                          role="radiogroup"
                          aria-label="Raster quality preset"
                          className="grid grid-cols-1 gap-1 sm:grid-cols-2"
                        >
                          {DRAFTING_RASTER_EXPORT_PRESETS.map((preset) => {
                            const isSelected = preset.id === selectedRasterExportPresetId
                            const selectedPresetExportSizeLabel =
                              isSelected &&
                              effectiveDraftingExportSizePreview.status === "pending"
                                ? "Calculating size"
                                : isSelected &&
                                    effectiveDraftingExportSizePreview.status === "ready"
                                  ? formatDashboardExportFileSize(
                                      effectiveDraftingExportSizePreview.blobSizeBytes,
                                    )
                                  : isSelected &&
                                      effectiveDraftingExportSizePreview.status === "error"
                                    ? "Size unavailable"
                                    : null

                            return (
                              <OptionCard
                                appearance="drafting"
                                darkShadowTone="ink"
                                key={preset.id}
                                checked={isSelected}
                                className={cn(
                                  "w-full items-stretch gap-0 text-left",
                                  "[&_[data-slot=option-card]]:h-full [&_[data-slot=option-card]]:min-h-[58px] [&_[data-slot=option-card]]:w-full [&_[data-slot=option-card]]:justify-start [&_[data-slot=option-card]]:rounded-[7px]",
                                  "[&_[data-slot=option-card-motif]]:size-full [&_[data-slot=option-card-motif]]:justify-start",
                                  "[&_[data-slot=option-card-label]]:sr-only",
                                )}
                                label={`Use ${preset.label} export preset`}
                                motifClassName="size-full px-2 py-1.5"
                                name="drafting-raster-quality-preset"
                                onSelect={() => setSelectedRasterExportPresetId(preset.id)}
                                value={preset.id}
                              >
                                <span className="flex min-w-0 flex-col gap-0.5 text-left">
                                  <span className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
                                    <span
                                      className={cn(
                                        "text-[0.74rem] font-semibold leading-tight",
                                        isSelected
                                          ? "text-[var(--drafting-ink)]"
                                          : "text-[var(--drafting-ink-strong-muted)]",
                                      )}
                                    >
                                      {preset.label}
                                    </span>
                                    <span
                                      aria-hidden="true"
                                      className="text-[0.68rem] leading-4 text-[var(--drafting-ink-subtle)]"
                                    >
                                      •
                                    </span>
                                    <span
                                      data-slot="drafting-raster-quality-value"
                                      className="text-[0.68rem] font-semibold leading-4 text-[var(--drafting-ink)]"
                                    >
                                      {preset.sizePx} × {preset.sizePx}
                                    </span>
                                    {selectedPresetExportSizeLabel ? (
                                      <>
                                        <span
                                          aria-hidden="true"
                                          className="text-[0.68rem] leading-4 text-[var(--drafting-ink-subtle)]"
                                        >
                                          •
                                        </span>
                                        <span
                                          data-slot="drafting-raster-calculated-size"
                                          className="text-[0.68rem] font-semibold leading-4 text-[var(--drafting-ink)]"
                                        >
                                          {selectedPresetExportSizeLabel}
                                        </span>
                                      </>
                                    ) : null}
                                  </span>
                                  <span className="text-[0.68rem] leading-4 text-[var(--drafting-ink-muted)]">
                                    {preset.primaryUse}
                                  </span>
                                </span>
                              </OptionCard>
                            )
                          })}
                        </div>

                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0 border-t border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-hover)] p-3">
                    <Button
                      data-slot="drafting-download-submit"
                      disabled={!canDownload}
                      type="button"
                      className="h-9 w-full rounded-[8px] bg-[var(--drafting-ink)] text-[var(--drafting-ink-inverse)] shadow-[var(--drafting-shadow-rest)] transition-[background-color,box-shadow,transform] hover:-translate-y-px hover:bg-[var(--drafting-ink)] hover:shadow-[var(--drafting-shadow-hover)] active:translate-y-0"
                      onClick={() => {
                        void handleDownload()
                      }}
                    >
                      <DownloadIcon data-icon="inline-start" />
                      Download {selectedDownloadExtension.toUpperCase()}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_var(--new-mobile-rail-height)_minmax(0,1fr)] lg:grid-cols-[var(--new-left-rail-width)_var(--new-middle-rail-width)_minmax(0,1fr)] lg:grid-rows-1">
        <nav
          aria-label="Primary navigation frame"
          data-slot="drafting-nav"
          className="relative isolate order-2 min-h-0 min-w-0 overflow-hidden border-y border-transparent bg-[var(--drafting-panel-bg)] lg:order-none lg:border-y-0 lg:bg-transparent"
        >
          <ScrollArea
            data-scrollbar-visibility="while-scrolling"
            data-slot="drafting-nav-scroll-area"
            scrollHideDelay={500}
            type="scroll"
            className="h-[var(--new-mobile-rail-height)] min-h-0 w-full min-w-0 lg:h-full"
          >
            <ScrollAreaViewport
              data-slot="drafting-nav-scroll"
              className="h-full w-full overflow-x-auto overflow-y-hidden scroll-fade-effect-x lg:overflow-x-hidden lg:scroll-fade-effect-y"
            >
              <div
                data-slot="drafting-nav-scroll-content"
                className="flex h-full min-w-max flex-row items-center gap-1.5 px-3 py-2 lg:min-h-full lg:min-w-0 lg:flex-col lg:items-center lg:gap-4 lg:px-0 lg:py-4"
              >
                {DRAFTING_TOOLS.map((tool) => {
                  const isActive = tool.id === activeTool

                  return (
                    <Button
                      key={tool.id}
                      aria-label={`Open ${tool.title}`}
                      aria-pressed={isActive}
                      data-drafting-tool-button="true"
                      className={cn(
                        "group flex h-7 w-auto min-w-fit flex-row items-center justify-center rounded-[5px] border-0 bg-[var(--drafting-control-bg)] px-2.5 py-0 text-center text-[var(--drafting-ink-muted)] shadow-[var(--drafting-shadow-rest)] transition-[background-color,box-shadow,color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[var(--drafting-control-bg-hover)] hover:text-[var(--drafting-ink-strong-muted)] hover:shadow-[var(--drafting-shadow-hover)] active:translate-y-0 active:bg-[var(--drafting-control-bg-active)] active:shadow-[var(--drafting-shadow-active)] dark:bg-[var(--drafting-button-bg)] dark:text-[var(--drafting-button-label)] dark:shadow-[var(--drafting-button-shadow-rest)] dark:hover:bg-[var(--drafting-button-bg-hover)] dark:hover:text-[var(--drafting-button-label-hover)] dark:hover:shadow-[var(--drafting-button-shadow-hover)] dark:active:bg-[var(--drafting-button-bg-active)] dark:active:shadow-[var(--drafting-button-shadow-active)] lg:h-auto lg:w-20 lg:min-w-0 lg:flex-col lg:justify-center lg:gap-3 lg:rounded-none lg:bg-transparent lg:px-2 lg:py-2.5 lg:text-center lg:shadow-none lg:hover:bg-transparent lg:hover:shadow-none lg:active:bg-transparent dark:lg:bg-transparent dark:lg:hover:bg-transparent dark:lg:hover:shadow-none dark:lg:active:bg-transparent",
                        isActive &&
                          "bg-[var(--drafting-ink)] text-[var(--drafting-ink-inverse)] shadow-[var(--drafting-shadow-rest)] hover:bg-[var(--drafting-ink)] hover:text-[var(--drafting-ink-inverse)] hover:shadow-[var(--drafting-shadow-hover)] active:bg-[var(--drafting-ink)] active:text-[var(--drafting-ink-inverse)] dark:bg-[var(--drafting-button-bg-selected)] dark:text-[var(--drafting-button-icon-selected)] dark:shadow-[var(--drafting-button-shadow-selected)] dark:hover:bg-[var(--drafting-button-bg-selected)] dark:hover:text-[var(--drafting-button-icon-selected)] dark:hover:shadow-[var(--drafting-button-shadow-selected-hover)] dark:active:bg-[var(--drafting-button-bg-selected)] dark:active:text-[var(--drafting-button-icon-selected)] lg:bg-transparent lg:text-[var(--drafting-ink)] lg:shadow-none lg:hover:bg-transparent lg:hover:text-[var(--drafting-ink)] lg:hover:shadow-none dark:lg:bg-transparent dark:lg:text-[var(--drafting-button-label-selected)] dark:lg:hover:bg-transparent dark:lg:hover:text-[var(--drafting-button-label-selected)] dark:lg:hover:shadow-none",
                      )}
                      size="default"
                      type="button"
                      variant="ghost"
                      onClick={() => setActiveTool(tool.id)}
                    >
                      <span
                        data-slot="drafting-tool-button-icon"
                        className={cn(
                          "hidden size-7 shrink-0 items-center justify-center rounded-[4px] bg-transparent text-current shadow-none transition-[background-color,box-shadow,transform,color] duration-150 ease-out dark:text-[var(--drafting-button-icon)] lg:flex lg:size-10 lg:rounded-[6px] lg:bg-[var(--drafting-control-bg)] lg:shadow-[var(--drafting-shadow-rest)] lg:group-hover:-translate-y-px lg:group-hover:bg-[var(--drafting-control-bg-hover)] lg:group-hover:shadow-[var(--drafting-shadow-hover)] lg:group-active:translate-y-0 lg:group-active:bg-[var(--drafting-control-bg-active)] lg:group-active:shadow-[var(--drafting-shadow-active)] dark:lg:bg-[var(--drafting-button-bg)] dark:lg:shadow-[var(--drafting-button-shadow-rest)] dark:lg:group-hover:bg-[var(--drafting-button-bg-hover)] dark:lg:group-hover:shadow-[var(--drafting-button-shadow-hover)] dark:lg:group-active:bg-[var(--drafting-button-bg-active)] dark:lg:group-active:shadow-[var(--drafting-button-shadow-active)]",
                          isActive &&
                            "lg:bg-[var(--drafting-ink)] lg:text-[var(--drafting-ink-inverse)] lg:shadow-[var(--drafting-shadow-rest)] lg:group-hover:bg-[var(--drafting-ink)] lg:group-hover:text-[var(--drafting-ink-inverse)] lg:group-hover:shadow-[var(--drafting-shadow-hover)] lg:group-active:translate-y-0 lg:group-active:bg-[var(--drafting-ink)] lg:group-active:text-[var(--drafting-ink-inverse)] lg:group-active:shadow-[var(--drafting-shadow-active)] dark:lg:bg-[var(--drafting-button-bg-selected)] dark:lg:text-[var(--drafting-button-icon-selected)] dark:lg:shadow-[var(--drafting-button-shadow-selected)] dark:lg:group-hover:bg-[var(--drafting-button-bg-selected)] dark:lg:group-hover:text-[var(--drafting-button-icon-selected)] dark:lg:group-hover:shadow-[var(--drafting-button-shadow-selected-hover)] dark:lg:group-active:bg-[var(--drafting-button-bg-selected)] dark:lg:group-active:text-[var(--drafting-button-icon-selected)] dark:lg:group-active:shadow-[var(--drafting-button-shadow-active)]",
                        )}
                      >
                        {tool.renderIcon()}
                      </span>
                      <span
                        data-slot="drafting-tool-button-label"
                        className={cn(
                          "text-[0.62rem] font-medium uppercase leading-none tracking-[0.12em] text-[var(--drafting-ink-muted)] transition-colors duration-150 group-hover:text-[var(--drafting-ink-strong-muted)] dark:text-[var(--drafting-button-label)] dark:group-hover:text-[var(--drafting-button-label-hover)] lg:text-[0.58rem] lg:leading-[1.15] lg:tracking-[0.16em]",
                          isActive && "font-semibold text-current dark:text-[var(--drafting-button-label-selected)]",
                        )}
                      >
                        {tool.title}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar
              orientation="horizontal"
              data-slot="drafting-nav-scrollbar"
              className="h-2 border-none p-[1px] lg:hidden"
            >
              <ScrollAreaThumb className="bg-[var(--drafting-line-hover)] hover:bg-[var(--drafting-line-strong)]" />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </nav>
        <aside
          aria-label="Middle scroll frame"
          data-slot="drafting-scroll-area"
          className="order-3 min-h-0 min-w-0 overflow-hidden bg-[var(--drafting-panel-bg)] lg:order-none lg:bg-transparent"
        >
          <Tabs
            className="h-full min-h-0 min-w-0 gap-0 overflow-hidden"
            value={activePanelTab}
            onValueChange={(value) =>
              setActivePanelTabs((current) => ({ ...current, [activeTool]: value }))
            }
          >
            <div
              data-slot="drafting-tabs-sticky"
              className="sticky top-0 z-10 min-w-0 px-3 py-3 sm:px-4 sm:py-4"
            >
              <TabsList
                aria-label={`${activeToolConfig.title} settings groups`}
                className={DRAFTING_PANEL_TAB_TRAY_CLASS_NAME}
              >
                {activeToolTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={DRAFTING_PANEL_TAB_TRIGGER_CLASS_NAME}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div data-slot="drafting-tab-panels" className="min-h-0 min-w-0 flex-1 overflow-hidden">
              {activeToolTabs.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="mt-0 h-full min-h-0 min-w-0 data-[state=inactive]:hidden"
                >
                  <ScrollArea
                    data-scrollbar-visibility="while-scrolling"
                    data-slot="drafting-tab-panel-scroll-area"
                    scrollHideDelay={500}
                    type="scroll"
                    className="h-full min-h-0 min-w-0 overflow-hidden"
                  >
                    <ScrollAreaViewport
                      aria-label={`${activeToolConfig.title} ${tab.label} panel`}
                      data-active-tab={tab.id}
                      data-active-tool={activeTool}
                      data-slot="drafting-tab-panel-scroll"
                      className="h-full w-full overflow-x-hidden scroll-fade-effect-y"
                    >
                      <div className="min-w-0 max-w-full overflow-x-hidden px-3 pb-4 sm:px-4">
                        {renderPanelContent(activeTool, tab.id)}
                      </div>
                    </ScrollAreaViewport>
                    <ScrollAreaScrollbar
                      data-slot="drafting-tab-panel-scrollbar"
                      className="w-2 border-none p-[1px]"
                    >
                      <ScrollAreaThumb className="bg-[var(--drafting-line-hover)] hover:bg-[var(--drafting-line-strong)]" />
                    </ScrollAreaScrollbar>
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </aside>
        <section
          aria-label="Workspace frame"
          data-slot="drafting-workspace"
          className="order-1 min-h-0 min-w-0 overflow-hidden lg:order-none"
        >
          <div
            data-slot="drafting-workspace-inset"
            className="h-full min-h-0 p-0 sm:p-5 lg:p-6"
          >
            <DashboardComposeSurface
              allowDirectNodeTransforms
              errorMessage={composeErrorMessage}
              isEditMode={false}
              showEditModeToggle={false}
              onEditModeChange={() => {}}
              onAddQrCode={() => {
                void handleAddQrCode()
              }}
              onReset={resetDraftingWorkspace}
              onQrSizeChange={setSelectedQrSize}
              onSceneChange={setDraftingScene}
              onSelectedNodeChange={handleComposeNodeSelection}
              qrSize={selectedQrSize}
              scene={draftingScene}
              selectedNodeId={selectedComposeNodeId}
              surfaceAppearance="neutral"
            />
          </div>
        </section>
      </div>
    </section>
  )
}

function getNextDraftingQrLayerName(scene: DashboardComposeScene) {
  return `QR Code ${getDashboardQrNodes(scene).length + 1}`
}

function getDraftingQrNodeDownloadTarget(nodeId: string): DraftingDownloadTarget {
  return `qr:${nodeId}`
}

async function downloadDraftingSvgExport({
  name,
  state,
}: {
  name: string
  state: QrStudioState
}) {
  const payload = await buildDashboardQrNodePayload(state)
  const blob = new Blob([payload.markup], { type: "image/svg+xml;charset=utf-8" })

  downloadBlob(blob, `${name}.svg`)
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.download = fileName
  anchor.href = objectUrl
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}
