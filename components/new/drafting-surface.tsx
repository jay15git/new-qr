"use client"

import { Image02Icon, SignalIcon, SquareIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import type {
  CornerDotType,
  CornerSquareType,
  DrawType,
  ErrorCorrectionLevel,
  TypeNumber,
} from "qr-code-styling"

import {
  DraftingBackgroundColorTab,
  DraftingBrandIconTab,
  DraftingContentTab,
  DraftingBackgroundUploadTab,
  DraftingCornerDotColorTab,
  DraftingCornerDotStyleTab,
  DraftingCornerSquareColorTab,
  DraftingCornerSquareStyleTab,
  DraftingDotsColorTab,
  DraftingEncodingTab,
  DraftingLogoColorTab,
  DraftingLogoSizeTab,
  DraftingLogoUploadTab,
  DraftingStyleTab,
} from "@/components/new/drafting-style-tab"
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
import { DashboardComposeSurface } from "@/components/qr/dashboard-compose-surface"
import {
  createDashboardComposeScene,
  DASHBOARD_QR_NODE_ID,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"
import {
  createDefaultQrStudioState,
  type AssetSourceMode,
  type DotsColorMode,
  type QrStudioState,
  type StudioDotType,
  type StudioGradient,
} from "@/components/qr/qr-studio-state"
import { LinkIcon, PieChart, Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const OUTER_MARKERS = [
  "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
] as const

const JUNCTION_MARKERS = [
  "left-0 top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "left-[var(--new-left-rail-width)] top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] top-[var(--new-header-height)] -translate-x-1/2 -translate-y-1/2",
  "right-0 top-[var(--new-header-height)] translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-[var(--new-left-rail-width)] -translate-x-1/2 translate-y-1/2",
  "bottom-0 left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] -translate-x-1/2 translate-y-1/2",
] as const

type DraftingBinaryColorMode = "solid" | "gradient"
type DraftingAssetSourceMode = Extract<AssetSourceMode, "upload" | "url">
type DraftingBrandIconCategoryFilter = BrandIconCategory | "all"

type DraftingPanelTab = {
  id: string
  label: string
}

type DraftingTool = {
  id: QrEditorSectionId
  title: string
  renderIcon: () => ReactNode
}

const DRAFTING_PANEL_TABS: Record<QrEditorSectionId, DraftingPanelTab[]> = {
  content: [{ id: "content", label: "Content" }],
  style: [
    { id: "style", label: "Style" },
    { id: "color", label: "Color" },
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
}

const DEFAULT_DRAFTING_PANEL_TABS: Record<QrEditorSectionId, string> = {
  content: "content",
  style: "style",
  "corner-square": "style",
  "corner-dot": "style",
  background: "colors",
  logo: "brand-icons",
  encoding: "encoding",
}

const DRAFTING_PANEL_TAB_TRAY_CLASS_NAME =
  "grid h-auto w-full auto-cols-fr grid-flow-col items-stretch gap-2 rounded-[4px] bg-[#00000008] p-1 shadow-none"

const DRAFTING_PANEL_TAB_TRIGGER_CLASS_NAME =
  "min-w-0 rounded-[4px] border border-transparent bg-transparent px-3 py-2 text-[0.72rem] font-medium tracking-[0.04em] text-[#00000073] shadow-none transition-[color,box-shadow,background-color,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[#FFFFFFF2] hover:text-[#000000A6] hover:shadow-[0_0_24px_3px_rgba(0,0,0,0.08),0_4px_10px_1px_rgba(0,0,0,0.025)] active:translate-y-0 active:bg-[#FFFFFFF2] active:font-medium active:text-[#262626] active:shadow-[0_0_14px_1px_rgba(0,0,0,0.07)] data-[state=active]:bg-[#FFFFFF] data-[state=active]:font-semibold data-[state=active]:text-[#262626] data-[state=active]:shadow-[0_0_24px_3px_rgba(0,0,0,0.08),0_4px_10px_1px_rgba(0,0,0,0.025)] data-[state=active]:hover:-translate-y-px data-[state=active]:hover:bg-[#FFFFFF] data-[state=active]:hover:text-[#262626] data-[state=active]:hover:shadow-[0_0_28px_4px_rgba(0,0,0,0.10),0_4px_10px_1px_rgba(0,0,0,0.03)] data-[state=active]:active:translate-y-0"

const DEFAULT_DRAFTING_STUDIO_STATE = createDefaultQrStudioState()
const IGNORE_DRAFTING_UPLOAD_ERROR: (message: string) => void = () => undefined

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
]

function PlusMarker({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="drafting-plus-marker"
      className={cn("pointer-events-none absolute size-4 text-black/42", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2.25" />
    </svg>
  )
}

export function DraftingSurface() {
  const [activeTool, setActiveTool] = useState<QrEditorSectionId>(
    DEFAULT_QR_EDITOR_SECTION,
  )
  const [selectedContentValue, setSelectedContentValue] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.data,
  )
  const [selectedRenderType, setSelectedRenderType] = useState<DrawType>(
    DEFAULT_DRAFTING_STUDIO_STATE.type,
  )
  const [selectedQrMargin, setSelectedQrMargin] = useState(
    DEFAULT_DRAFTING_STUDIO_STATE.margin,
  )
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
  const [isComposeEditMode, setIsComposeEditMode] = useState(false)
  const [selectedComposeNodeId, setSelectedComposeNodeId] = useState<string | null>(null)
  const [composeErrorMessage, setComposeErrorMessage] = useState<string | null>(null)
  const [activePanelTabs, setActivePanelTabs] = useState<Record<QrEditorSectionId, string>>(
    DEFAULT_DRAFTING_PANEL_TABS,
  )
  const dashboardPayloadRequestRef = useRef(0)
  const activeToolConfig =
    DRAFTING_TOOLS.find((section) => section.id === activeTool) ?? DRAFTING_TOOLS[0]
  const activeToolTabs = DRAFTING_PANEL_TABS[activeTool]
  const activePanelTab = activePanelTabs[activeTool]
  const filteredBrandIcons = filterBrandIcons(brandIconQuery, brandIconCategory)
  const draftingStudioState = useMemo<QrStudioState>(
    () => ({
      ...DEFAULT_DRAFTING_STUDIO_STATE,
      data: selectedContentValue,
      type: selectedRenderType,
      width: selectedQrSize,
      height: selectedQrSize,
      margin: selectedQrMargin,
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
      selectedQrMargin,
      selectedQrSize,
      selectedRenderType,
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

  function resetDraftingWorkspace() {
    const nextState = createDefaultQrStudioState()

    setActiveTool(DEFAULT_QR_EDITOR_SECTION)
    setSelectedContentValue(nextState.data)
    setSelectedRenderType(nextState.type)
    setSelectedQrMargin(nextState.margin)
    setSelectedQrSize(nextState.width)
    setSelectedDotType(nextState.dotsOptions.type)
    setSelectedDotsColorMode(nextState.dotsColorMode)
    setSelectedDotColor(nextState.dotsOptions.color)
    setSelectedDotsGradient(structuredClone(nextState.dotsGradient))
    setOpenDotsColorItems(["solid"])
    setSelectedCornerSquareType(nextState.cornersSquareOptions.type)
    setSelectedCornerSquareColorMode(
      nextState.cornersSquareGradient.enabled ? "gradient" : "solid",
    )
    setSelectedCornerSquareColor(nextState.cornersSquareOptions.color)
    setSelectedCornerSquareGradient(structuredClone(nextState.cornersSquareGradient))
    setOpenCornerSquareColorItems(["solid"])
    setSelectedCornerDotType(nextState.cornersDotOptions.type)
    setSelectedCornerDotColorMode(nextState.cornersDotGradient.enabled ? "gradient" : "solid")
    setSelectedCornerDotColor(nextState.cornersDotOptions.color)
    setSelectedCornerDotGradient(structuredClone(nextState.cornersDotGradient))
    setOpenCornerDotColorItems(["solid"])
    setSelectedBackgroundColorMode(
      nextState.backgroundGradient.enabled ? "gradient" : "solid",
    )
    setSelectedBackgroundColor(nextState.backgroundOptions.color)
    setSelectedBackgroundGradient(structuredClone(nextState.backgroundGradient))
    setOpenBackgroundColorItems(["solid"])
    setSelectedBackgroundAssetSourceMode(
      nextState.backgroundImage.source === "url" ? "url" : "upload",
    )
    setSelectedBackgroundRemoteUrl(
      nextState.backgroundImage.source === "url"
        ? (nextState.backgroundImage.value ?? "")
        : "",
    )
    setOpenBackgroundUploadItems(["upload"])
    setSelectedLogoColorMode(nextState.logoGradient.enabled ? "gradient" : "solid")
    setSelectedLogoSourceMode(nextState.logo.source)
    setSelectedLogoColor(nextState.logo.presetColor ?? DEFAULT_BRAND_ICON_COLOR)
    setSelectedLogoGradient(structuredClone(nextState.logoGradient))
    setOpenLogoColorItems(["solid"])
    setBrandIconQuery("")
    setBrandIconCategory("all")
    setSelectedLogoPresetId(nextState.logo.presetId)
    setSelectedLogoPresetValue(nextState.logo.value)
    setSelectedLogoAssetSourceMode(nextState.logo.source === "url" ? "url" : "upload")
    setSelectedLogoRemoteUrl(
      nextState.logo.source === "url" ? (nextState.logo.value ?? "") : "",
    )
    setOpenLogoUploadItems(["upload"])
    setSelectedLogoSize(nextState.imageOptions.imageSize * 100)
    setSelectedLogoMargin(nextState.imageOptions.margin)
    setSelectedHideBackgroundDots(nextState.imageOptions.hideBackgroundDots)
    setSelectedSaveAsBlob(nextState.imageOptions.saveAsBlob)
    setSelectedTypeNumber(nextState.qrOptions.typeNumber)
    setSelectedErrorCorrectionLevel(nextState.qrOptions.errorCorrectionLevel)
    setIsComposeEditMode(false)
    setSelectedComposeNodeId(null)
    setComposeErrorMessage(null)
    setDraftingScene(createDashboardComposeScene())
    setActivePanelTabs({ ...DEFAULT_DRAFTING_PANEL_TABS })
  }

  useEffect(() => {
    const requestId = ++dashboardPayloadRequestRef.current

    void buildDashboardQrNodePayload(draftingStudioState)
      .then((payload) => {
        if (dashboardPayloadRequestRef.current !== requestId) {
          return
        }

        setDraftingScene((current) => upsertDashboardQrNode(current, payload))
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
  }, [draftingStudioState])

  const renderPanelContent = (toolId: QrEditorSectionId, tabId: string) => {
    if (toolId === "content" && tabId === "content") {
      return (
        <DraftingContentTab
          contentValue={selectedContentValue}
          margin={selectedQrMargin}
          renderType={selectedRenderType}
          size={selectedQrSize}
          onContentValueChange={setSelectedContentValue}
          onMarginChange={setSelectedQrMargin}
          onRenderTypeChange={setSelectedRenderType}
          onSizeChange={setSelectedQrSize}
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
      data-qr-render-type={selectedRenderType}
      data-qr-size={selectedQrSize}
      data-qr-type-number={selectedTypeNumber}
      data-slot="drafting-surface"
      className="relative grid h-[calc(100dvh-3rem)] w-full grid-rows-[var(--new-header-height)_minmax(0,1fr)] overflow-visible border border-dashed border-black/18 bg-[#f4f6f8] shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:h-[calc(100dvh-4rem)] [--new-header-height:4.5rem] [--new-left-rail-width:clamp(6.25rem,10vw,7.5rem)] [--new-middle-rail-width:clamp(15rem,24vw,18.5rem)]"
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
        className="pointer-events-none absolute bottom-0 left-[var(--new-left-rail-width)] top-[var(--new-header-height)] z-20 w-0"
      />
      <div
        aria-hidden="true"
        data-slot="drafting-divider-vertical"
        className="pointer-events-none absolute bottom-0 left-[calc(var(--new-left-rail-width)+var(--new-middle-rail-width))] top-[var(--new-header-height)] z-20 w-0"
      />

      <header
        aria-label="Header frame"
        data-slot="drafting-header"
        className="min-h-0 px-4 py-3"
      >
        <div className="flex h-full items-start justify-end">
          <ModeToggle className="border-black/8 bg-white/70 text-black shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm" />
        </div>
      </header>

      <div className="grid min-h-0 grid-cols-[var(--new-left-rail-width)_var(--new-middle-rail-width)_minmax(0,1fr)]">
        <nav
          aria-label="Primary navigation frame"
          data-slot="drafting-nav"
          className="min-h-0 pl-3 pr-0 py-4"
        >
          <ScrollArea
            data-slot="drafting-nav-scroll-area"
            className="h-full min-h-0"
          >
            <ScrollAreaViewport
              data-slot="drafting-nav-scroll"
              className="h-full w-full overflow-x-hidden"
            >
              <div className="flex min-h-full flex-col items-center gap-4 pt-0">
                {DRAFTING_TOOLS.map((tool) => {
                  const isActive = tool.id === activeTool

                  return (
                    <Button
                      key={tool.id}
                      aria-label={`Open ${tool.title}`}
                      aria-pressed={isActive}
                      data-drafting-tool-button="true"
                      className={cn(
                        "group flex h-auto w-20 flex-col items-center gap-3 rounded-none border-0 bg-transparent px-2 py-2.5 text-center text-black/45 shadow-none transition-[color,transform] duration-150 ease-out hover:bg-transparent hover:text-black/72 active:bg-transparent",
                        isActive && "text-black",
                      )}
                      size="default"
                      type="button"
                      variant="ghost"
                      onClick={() => setActiveTool(tool.id)}
                    >
                      <span
                        data-slot="drafting-tool-button-icon"
                        className={cn(
                          "flex size-10 items-center justify-center rounded-[6px] bg-black/[0.03] text-current shadow-[0_0_18px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.03)] transition-[background-color,box-shadow,transform,color] duration-150 ease-out group-hover:-translate-y-px group-hover:bg-black/[0.06] group-hover:shadow-[0_0_24px_rgba(0,0,0,0.10),0_4px_10px_rgba(0,0,0,0.06)] group-active:translate-y-0 group-active:bg-black/[0.07] group-active:shadow-[0_0_14px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]",
                          isActive &&
                            "bg-[#111111] text-white shadow-[0_0_24px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.10)] group-hover:bg-[#111111] group-hover:text-white group-hover:shadow-[0_0_28px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.14)] group-active:translate-y-0 group-active:bg-[#111111] group-active:text-white group-active:shadow-[0_0_24px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.10)]",
                        )}
                      >
                        {tool.renderIcon()}
                      </span>
                      <span
                        data-slot="drafting-tool-button-label"
                        className={cn(
                          "text-[0.58rem] font-medium uppercase leading-[1.15] tracking-[0.16em] text-black/45 transition-colors duration-150 group-hover:text-black/72",
                          isActive && "font-semibold text-current",
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
              data-slot="drafting-nav-scrollbar"
              forceMount
              className="w-2 border-none p-[1px]"
            >
              <ScrollAreaThumb className="bg-black/16 hover:bg-black/24" />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </nav>
        <aside
          aria-label="Middle scroll frame"
          data-slot="drafting-scroll-area"
          className="min-h-0"
        >
          <Tabs
            className="h-full min-h-0 gap-0"
            value={activePanelTab}
            onValueChange={(value) =>
              setActivePanelTabs((current) => ({ ...current, [activeTool]: value }))
            }
          >
            <div
              data-slot="drafting-tabs-sticky"
              className="sticky top-0 z-10 px-4 py-4"
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

            <div data-slot="drafting-tab-panels" className="min-h-0 flex-1">
              {activeToolTabs.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="mt-0 h-full min-h-0 data-[state=inactive]:hidden"
                >
                  <ScrollArea
                    data-slot="drafting-tab-panel-scroll-area"
                    className="h-full min-h-0"
                  >
                    <ScrollAreaViewport
                      aria-label={`${activeToolConfig.title} ${tab.label} panel`}
                      data-active-tab={tab.id}
                      data-active-tool={activeTool}
                      data-slot="drafting-tab-panel-scroll"
                      className="h-full w-full overflow-x-hidden"
                    >
                      <div className="px-4 pb-4">{renderPanelContent(activeTool, tab.id)}</div>
                    </ScrollAreaViewport>
                    <ScrollAreaScrollbar
                      data-slot="drafting-tab-panel-scrollbar"
                      forceMount
                      className="w-2 border-none p-[1px]"
                    >
                      <ScrollAreaThumb className="bg-black/16 hover:bg-black/24" />
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
          className="min-h-0 overflow-hidden"
        >
          <div
            data-slot="drafting-workspace-inset"
            className="h-full min-h-0 p-4 sm:p-5 lg:p-6"
          >
            <DashboardComposeSurface
              errorMessage={composeErrorMessage}
              isEditMode={isComposeEditMode}
              onEditModeChange={(checked) => {
                setIsComposeEditMode(checked)
                setSelectedComposeNodeId(checked ? DASHBOARD_QR_NODE_ID : null)
              }}
              onReset={resetDraftingWorkspace}
              onQrSizeChange={setSelectedQrSize}
              onSceneChange={setDraftingScene}
              onSelectedNodeChange={setSelectedComposeNodeId}
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
