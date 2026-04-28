"use client"

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import { ChevronDownIcon, DownloadIcon } from "lucide-react"
import type { FileExtension } from "qr-code-styling"
import QRCodeStyling from "qr-code-styling"

import {
  DEFAULT_QR_EDITOR_SECTION,
  getQrEditorSectionChangeDirection,
  type QrEditorSectionDirection,
  type QrEditorSectionId,
} from "@/components/qr/qr-sections"
import { QrSectionRail } from "@/components/qr/qr-section-rail"
import { QrControlSections } from "@/components/qr/qr-control-sections"
import { DashboardComposeSurface } from "@/components/qr/dashboard-compose-surface"
import {
  createDashboardComposeScene,
  getDashboardComposeNode,
  type DashboardComposeScene,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"
import { decodeDashboardQrScene } from "@/components/qr/qr-quality-decode"
import {
  analyzeQrQuality,
  applyQrQualitySuggestionPath,
  mergeQrQualityReportWithDecode,
  type QrQualityDecodeResult,
  type QrQualitySuggestionPath,
} from "@/components/qr/qr-quality"
import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import {
  downloadDashboardRasterExport,
  formatDashboardExportFileSize,
  isRasterExportExtension,
  measureDashboardRasterExport,
  type DashboardRasterExportMeasurement,
} from "@/components/qr/dashboard-raster-export"
import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import { buildQrExtension, getQrExtensionKey } from "@/components/qr/qr-rendering"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import {
  DOWNLOAD_EXTENSIONS,
  type AssetSourceMode,
  createDefaultQrStudioState,
  type QrStudioState,
  setRasterExportQualityPercent,
  setSquareQrSize,
  toQrCodeOptions,
} from "@/components/qr/qr-studio-state"
import { DEFAULT_BRAND_ICON_COLOR } from "@/components/qr/brand-icon-svg"
import { ModeToggle } from "@/components/mode-toggle"

const DEFAULT_DOWNLOAD_NAME = "new-qr-studio"
type UploadedAssetKey = "logo" | "backgroundImage"
type ComposeImageUrlRegistry = Record<string, string>
type DashboardExportSizePreview =
  | { status: "error" }
  | { status: "idle" }
  | { status: "pending" }
  | ({ status: "ready" } & DashboardRasterExportMeasurement)

const DASHBOARD_SECTION_PANE_VARIANTS = {
  active: {
    filter: "blur(0px)",
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: (direction: QrEditorSectionDirection) => ({
    filter: "blur(4px)",
    opacity: 0,
    scale: 0.992,
    y: direction === 0 ? 0 : direction * -24,
  }),
  initial: (direction: QrEditorSectionDirection) => ({
    filter: "blur(4px)",
    opacity: 0,
    scale: 0.992,
    y: direction === 0 ? 0 : direction * 24,
  }),
} as const

type QrStudioProps = {
  variant?: "settings" | "dashboard"
  initialActiveSection?: QrEditorSectionId
}

export function QrStudio({
  variant = "settings",
  initialActiveSection = DEFAULT_QR_EDITOR_SECTION,
}: QrStudioProps) {
  const [state, setState] = useState(() => createDefaultQrStudioState())
  const [downloadName, setDownloadName] = useState(DEFAULT_DOWNLOAD_NAME)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeSection, setActiveSection] =
    useState<QrEditorSectionId>(initialActiveSection)
  const [dashboardScene, setDashboardScene] = useState<DashboardComposeScene>(() =>
    createDashboardComposeScene(),
  )
  const [sectionDirection, setSectionDirection] =
    useState<QrEditorSectionDirection>(0)
  const [selectedDashboardNodeId, setSelectedDashboardNodeId] = useState<string | null>(null)
  const [selectedDashboardExportExtension, setSelectedDashboardExportExtension] =
    useState<FileExtension>("svg")
  const [dashboardExportSizePreview, setDashboardExportSizePreview] =
    useState<DashboardExportSizePreview>({
      status: "idle",
    })

  const deferredState = useDeferredValue(state)
  const deferredDashboardScene = useDeferredValue(dashboardScene)
  const previewRef = useRef<HTMLDivElement>(null)
  const initialStateRef = useRef(state)
  const qrCodeRef = useRef<QRCodeStyling | null>(null)
  const qrExtensionKeyRef = useRef(getQrExtensionKey(state))
  const dashboardPayloadRequestRef = useRef(0)
  const dashboardQualityRequestRef = useRef(0)
  const dashboardExportPreviewRequestRef = useRef(0)
  const dashboardExportPreviewTimeoutRef = useRef<number | null>(null)
  const latestStateRef = useRef(state)
  const uploadedAssetUrlsRef = useRef<Record<UploadedAssetKey, string | null>>({
    logo: null,
    backgroundImage: null,
  })
  const composeImageUrlsRef = useRef<ComposeImageUrlRegistry>({})
  const latestDashboardSceneRef = useRef(dashboardScene)
  const dashboardFilenameId = useId()
  const canDownload = Boolean(state.data.trim())
  const [qrQualityDecodeState, setQrQualityDecodeState] = useState<{
    key: string
    result: QrQualityDecodeResult
  }>({
    key: "",
    result: {
      kind: "pending",
    },
  })
  const hasDashboardQrNode = Boolean(getDashboardComposeNode(deferredDashboardScene))
  const qrQualityDecodeKey =
    variant === "dashboard"
      ? JSON.stringify({
          scene: deferredDashboardScene,
          state: deferredState,
        })
      : ""
  const effectiveQrQualityDecodeResult =
    variant === "dashboard" && !hasDashboardQrNode
      ? ({
          kind: "pending",
        } satisfies QrQualityDecodeResult)
      : qrQualityDecodeState.key === qrQualityDecodeKey
        ? qrQualityDecodeState.result
        : ({
            kind: "pending",
          } satisfies QrQualityDecodeResult)

  const qrQualityReport =
    variant === "dashboard"
      ? mergeQrQualityReportWithDecode(
          analyzeQrQuality(deferredState, deferredDashboardScene),
          effectiveQrQualityDecodeResult,
        )
      : null
  const isDashboardRasterExport =
    variant === "dashboard" &&
    isRasterExportExtension(selectedDashboardExportExtension)
  const effectiveDashboardExportSizePreview: DashboardExportSizePreview =
    variant === "dashboard" && canDownload && isDashboardRasterExport
      ? dashboardExportSizePreview
      : {
          status: "idle",
        }

  function handleQrSizeChange(nextSize: number) {
    setState((current) => setSquareQrSize(current, nextSize))
  }

  useEffect(() => {
    const previewElement = previewRef.current
    const qrCode = createQrCodeInstance(initialStateRef.current)
    qrCodeRef.current = qrCode
    qrExtensionKeyRef.current = getQrExtensionKey(initialStateRef.current)
    previewElement?.replaceChildren()

    if (previewElement) {
      qrCode.append(previewElement)
    }

    return () => {
      previewElement?.replaceChildren()
      qrCodeRef.current = null
      if (dashboardExportPreviewTimeoutRef.current !== null) {
        window.clearTimeout(dashboardExportPreviewTimeoutRef.current)
      }
      cleanupUploadedAssets(uploadedAssetUrlsRef)
      cleanupComposeImageUrls(composeImageUrlsRef)
    }
  }, [])

  useEffect(() => {
    latestStateRef.current = state
    latestDashboardSceneRef.current = dashboardScene
  }, [dashboardScene, state])

  useEffect(() => {
    if (variant !== "dashboard") {
      return
    }

    cleanupRemovedComposeImageUrls(composeImageUrlsRef, dashboardScene)
  }, [dashboardScene, variant])

  useEffect(() => {
    if (!qrCodeRef.current) {
      return
    }

    try {
      const nextExtensionKey = getQrExtensionKey(deferredState)

      if (nextExtensionKey !== qrExtensionKeyRef.current) {
        const qrCode = createQrCodeInstance(deferredState)
        const previewElement = previewRef.current

        qrCodeRef.current = qrCode
        qrExtensionKeyRef.current = nextExtensionKey

        if (previewElement) {
          previewElement.replaceChildren()
          qrCode.append(previewElement)
        }
      } else {
        qrCodeRef.current.update(toQrCodeOptions(deferredState))
      }

      queueMicrotask(() => setErrorMessage(null))
    } catch {
      queueMicrotask(() => {
        setErrorMessage("The preview could not be updated with the current settings.")
      })
    }
  }, [deferredState])

  useEffect(() => {
    if (variant !== "dashboard") {
      return
    }

    const requestId = ++dashboardPayloadRequestRef.current

    void buildDashboardQrNodePayload(deferredState)
      .then((payload) => {
        if (dashboardPayloadRequestRef.current !== requestId) {
          return
        }

        setDashboardScene((current) => upsertDashboardQrNode(current, payload))
        queueMicrotask(() => setErrorMessage(null))
      })
      .catch(() => {
        if (dashboardPayloadRequestRef.current !== requestId) {
          return
        }

        queueMicrotask(() => {
          setErrorMessage("The preview could not be updated with the current settings.")
        })
      })
  }, [deferredState, variant])

  useEffect(() => {
    if (variant !== "dashboard") {
      return
    }

    if (!hasDashboardQrNode) {
      return
    }

    const requestId = ++dashboardQualityRequestRef.current

    void decodeDashboardQrScene(deferredState, deferredDashboardScene)
      .then((result) => {
        if (dashboardQualityRequestRef.current !== requestId) {
          return
        }

        setQrQualityDecodeState({
          key: qrQualityDecodeKey,
          result,
        })
      })
      .catch(() => {
        if (dashboardQualityRequestRef.current !== requestId) {
          return
        }

        setQrQualityDecodeState({
          key: qrQualityDecodeKey,
          result: {
            kind: "unverified",
            reason: "The composed dashboard scene could not be verified.",
          },
        })
      })
  }, [
    deferredDashboardScene,
    deferredState,
    hasDashboardQrNode,
    qrQualityDecodeKey,
    variant,
  ])

  useEffect(() => {
    if (variant !== "dashboard") {
      return
    }

    if (dashboardExportPreviewTimeoutRef.current !== null) {
      window.clearTimeout(dashboardExportPreviewTimeoutRef.current)
    }

    const requestId = ++dashboardExportPreviewRequestRef.current

    if (!canDownload || !isRasterExportExtension(selectedDashboardExportExtension)) {
      return
    }

    queueMicrotask(() => {
      if (dashboardExportPreviewRequestRef.current !== requestId) {
        return
      }

      setDashboardExportSizePreview({
        status: "pending",
      })
    })

    dashboardExportPreviewTimeoutRef.current = window.setTimeout(() => {
      void measureDashboardRasterExport({
        extension: selectedDashboardExportExtension,
        qualityPercent: latestStateRef.current.rasterExportQualityPercent,
        state: latestStateRef.current,
      })
        .then((result) => {
          if (dashboardExportPreviewRequestRef.current !== requestId) {
            return
          }

          setDashboardExportSizePreview({
            ...result,
            status: "ready",
          })
        })
        .catch(() => {
          if (dashboardExportPreviewRequestRef.current !== requestId) {
            return
          }

          setDashboardExportSizePreview({
            status: "error",
          })
        })
    }, 250)

    return () => {
      if (dashboardExportPreviewTimeoutRef.current !== null) {
        window.clearTimeout(dashboardExportPreviewTimeoutRef.current)
      }
    }
  }, [canDownload, selectedDashboardExportExtension, state, variant])

  async function handleDownload(extension: FileExtension) {
    if (!qrCodeRef.current) {
      return
    }

    try {
      const exportName = downloadName.trim() || DEFAULT_DOWNLOAD_NAME

      if (variant === "dashboard" && isRasterExportExtension(extension)) {
        await downloadDashboardRasterExport({
          extension,
          name: exportName,
          qualityPercent: latestStateRef.current.rasterExportQualityPercent,
          state: latestStateRef.current,
        })
      } else {
        await qrCodeRef.current.download({
          extension,
          name: exportName,
        })
      }

      setErrorMessage(null)
    } catch {
      setErrorMessage("The QR image could not be exported. Try another format.")
    }
  }

  function handleAssetModeChange(assetKey: UploadedAssetKey, mode: AssetSourceMode) {
    cleanupUploadedAsset(uploadedAssetUrlsRef, assetKey)
    setState((current) => ({
      ...current,
      [assetKey]: {
        presetColor:
          assetKey === "logo" && mode === "preset"
            ? DEFAULT_BRAND_ICON_COLOR
            : undefined,
        presetId: undefined,
        source: mode,
        value: undefined,
      },
    }))
  }

  function handleAssetUploadSuccess(assetKey: UploadedAssetKey, file: File) {
    try {
      cleanupUploadedAsset(uploadedAssetUrlsRef, assetKey)
      const nextUrl = URL.createObjectURL(file)
      uploadedAssetUrlsRef.current[assetKey] = nextUrl
      setState((current) => ({
        ...current,
        [assetKey]: {
          presetColor: undefined,
          presetId: undefined,
          source: "upload",
          value: nextUrl,
        },
      }))
      setErrorMessage(null)
    } catch {
      const assetLabel = assetKey === "logo" ? "logo" : "background image"
      setErrorMessage(`The ${assetLabel} file could not be read. Try another image.`)
    }
  }

  function handleReset() {
    cleanupUploadedAssets(uploadedAssetUrlsRef)
    cleanupComposeImageUrls(composeImageUrlsRef)
    setDownloadName(DEFAULT_DOWNLOAD_NAME)
    setSelectedDashboardExportExtension("svg")
    setDashboardExportSizePreview({
      status: "idle",
    })
    setSelectedDashboardNodeId(null)
    setDashboardScene(createDashboardComposeScene())
    setState(createDefaultQrStudioState())
    setErrorMessage(null)
  }

  function handleApplyQrQualitySuggestionPath(path: QrQualitySuggestionPath) {
    const nextResult = applyQrQualitySuggestionPath(
      latestStateRef.current,
      latestDashboardSceneRef.current,
      path,
    )

    setState(nextResult.state)
    setDashboardScene(nextResult.scene)
  }

  const previewCard = (
    <QrPreviewCard
      canDownload={canDownload}
      downloadName={downloadName}
      errorMessage={errorMessage}
      onDownload={handleDownload}
      onDownloadNameChange={setDownloadName}
      onReset={handleReset}
      previewRef={previewRef}
      state={state}
    />
  )

  const controlSectionProps = {
    backgroundSourceMode: state.backgroundImage.source,
    logoSourceMode: state.logo.source,
    onBackgroundModeChange: (mode: AssetSourceMode) =>
      handleAssetModeChange("backgroundImage", mode),
    onBackgroundUploadError: (message: string) => setErrorMessage(message),
    onBackgroundUploadSuccess: (file: File) =>
      handleAssetUploadSuccess("backgroundImage", file),
    onLogoModeChange: (mode: AssetSourceMode) => handleAssetModeChange("logo", mode),
    onLogoUploadError: (message: string) => setErrorMessage(message),
    onLogoUploadSuccess: (file: File) => handleAssetUploadSuccess("logo", file),
    setState,
    state,
  }

  if (variant === "dashboard") {
    return (
      <div className="flex min-h-screen w-full bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_98%,white_2%),color-mix(in_oklch,var(--color-background)_94%,black_6%))] lg:h-screen lg:overflow-hidden">
        <main
          className="flex min-h-screen min-w-0 flex-1 flex-col lg:h-screen"
          aria-label="QR editor dashboard"
        >
          <div className="flex min-h-screen w-full flex-col lg:h-full lg:min-h-0">
            <section
              data-slot="dashboard-top-strip"
              className="border-b border-white/6 bg-[color-mix(in_oklch,var(--color-card)_32%,transparent)] px-4 py-3 sm:px-6 lg:px-8"
              aria-label="Export controls"
            >
              <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)_minmax(0,1fr)]">
                <div className="hidden md:block" />

                <div className="flex justify-center">
                  <div className="w-full max-w-xl">
                    <label htmlFor={dashboardFilenameId} className="sr-only">
                      Export filename
                    </label>
                    <Input
                      id={dashboardFilenameId}
                      value={downloadName}
                      onChange={(event) => setDownloadName(event.target.value)}
                      placeholder="new-qr"
                      className="h-10 rounded-full border-white/8 bg-white/[0.03] px-5 text-center text-sm shadow-none focus-visible:border-white/14 focus-visible:ring-white/10"
                    />
                  </div>
                </div>

                <div className="flex justify-center md:justify-end">
                  <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Popover>
                      <PopoverTrigger asChild>
                        <SecondaryButton disabled={!canDownload}>
                          <DownloadIcon data-icon="inline-start" />
                          Download
                          <ChevronDownIcon data-icon="inline-end" />
                        </SecondaryButton>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-80 rounded-2xl border-white/10 bg-[color-mix(in_oklch,var(--color-popover)_90%,black_10%)] p-3"
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                Export format
                              </p>
                              <p className="text-xs text-foreground/60">
                                Choose a format, adjust raster quality, then download.
                              </p>
                            </div>
                            <div
                              role="radiogroup"
                              aria-label="Export format"
                              data-slot="dashboard-export-format-options"
                              className="grid grid-cols-2 gap-2"
                            >
                              {DOWNLOAD_EXTENSIONS.map((extension) => (
                                <SecondaryButton
                                  key={extension}
                                  aria-checked={
                                    extension === selectedDashboardExportExtension
                                  }
                                  data-slot="dashboard-export-format-option"
                                  disabled={!canDownload}
                                  role="radio"
                                  type="button"
                                  selected={
                                    extension === selectedDashboardExportExtension
                                  }
                                  className="justify-center"
                                  onClick={() => {
                                    setSelectedDashboardExportExtension(extension)
                                  }}
                                >
                                  {extension.toUpperCase()}
                                </SecondaryButton>
                              ))}
                            </div>
                          </div>

                          {isDashboardRasterExport ? (
                            <div
                              data-slot="dashboard-raster-quality-controls"
                              className="border-t border-white/8 pt-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-foreground">
                                    Raster quality
                                  </p>
                                  <p className="text-xs text-foreground/60">
                                    Measured file size for{" "}
                                    {selectedDashboardExportExtension.toUpperCase()}.
                                  </p>
                                </div>
                                <div
                                  data-slot="dashboard-raster-quality-value"
                                  className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-foreground/70"
                                >
                                  {state.rasterExportQualityPercent}%
                                </div>
                              </div>
                              <div className="mt-4 px-1">
                                <Slider
                                  aria-label="Raster quality"
                                  data-slot="dashboard-raster-quality-slider"
                                  disabled={!canDownload}
                                  max={100}
                                  min={25}
                                  step={1}
                                  value={[state.rasterExportQualityPercent]}
                                  className="[&_[data-slot=slider-range]]:bg-white/70 [&_[data-slot=slider-thumb]]:border-white/20 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-track]]:bg-white/10"
                                  onValueChange={(values) => {
                                    const [qualityPercent] = values

                                    if (typeof qualityPercent !== "number") {
                                      return
                                    }

                                    setState((current) =>
                                      setRasterExportQualityPercent(
                                        current,
                                        qualityPercent,
                                      ),
                                    )
                                  }}
                                />
                              </div>
                              <div
                                data-slot="dashboard-export-size-preview"
                                className="mt-4 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-foreground/70"
                              >
                                {effectiveDashboardExportSizePreview.status === "pending" ? (
                                  <p>Calculating size…</p>
                                ) : effectiveDashboardExportSizePreview.status === "ready" ? (
                                  <p>
                                    {formatDashboardExportFileSize(
                                      effectiveDashboardExportSizePreview.blobSizeBytes,
                                    )}{" "}
                                    <span className="text-foreground/45">
                                      • {effectiveDashboardExportSizePreview.width} ×{" "}
                                      {effectiveDashboardExportSizePreview.height}
                                    </span>
                                  </p>
                                ) : effectiveDashboardExportSizePreview.status === "error" ? (
                                  <p>Size preview unavailable.</p>
                                ) : (
                                  <p>Adjust quality to preview the export size.</p>
                                )}
                              </div>
                            </div>
                          ) : null}

                          <div className="border-t border-white/8 pt-3">
                            <SecondaryButton
                              data-slot="dashboard-export-submit"
                              disabled={!canDownload}
                              type="button"
                              className="w-full"
                              onClick={() => {
                                void handleDownload(selectedDashboardExportExtension)
                              }}
                            >
                              <DownloadIcon data-icon="inline-start" />
                              Download {selectedDashboardExportExtension.toUpperCase()}
                            </SecondaryButton>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </section>

            <section
              data-slot="dashboard-workspace"
              className="flex flex-1 flex-col lg:h-full lg:min-h-0 lg:grid lg:grid-cols-[5.75rem_minmax(22rem,29rem)_minmax(24rem,1fr)] lg:overflow-hidden xl:grid-cols-[6rem_minmax(24rem,31rem)_minmax(26rem,1fr)]"
            >
              <QrSectionRail
                activeSection={activeSection}
                onSectionChange={(section) => {
                  if (section === activeSection) {
                    return
                  }

                  const nextDirection = getQrEditorSectionChangeDirection(
                    activeSection,
                    section,
                  )

                  startTransition(() => {
                    setSectionDirection(nextDirection)
                    setActiveSection(section)
                  })
                }}
              />

              <aside
                data-slot="dashboard-settings-panel"
                className="min-w-0 border-t border-white/6 bg-[color-mix(in_oklch,var(--color-card)_18%,transparent)] lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:border-t-0"
                aria-label="QR editor settings"
              >
                <MotionConfig
                  transition={{ duration: 0.26, type: "spring", bounce: 0.06 }}
                >
                  <motion.div
                    data-slot="dashboard-settings-stage"
                    className="relative flex min-h-0 flex-1 flex-col"
                    initial={false}
                  >
                    <div
                      data-slot="dashboard-settings-measure"
                      className="relative flex min-h-0 flex-1 flex-col"
                    >
                      <AnimatePresence
                        initial={false}
                        mode="popLayout"
                        custom={sectionDirection}
                      >
                        <motion.div
                          key={activeSection}
                          data-slot="dashboard-settings-motion"
                          data-direction={sectionDirection}
                          className="flex min-h-0 flex-1 flex-col"
                          custom={sectionDirection}
                          variants={DASHBOARD_SECTION_PANE_VARIANTS}
                          initial="initial"
                          animate="active"
                          exit="exit"
                        >
                          <div
                            data-slot="dashboard-settings-scroll"
                            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 pb-10 sm:px-6 lg:px-8 lg:py-8 lg:pb-12"
                          >
                            <QrControlSections
                              {...controlSectionProps}
                              activeSection={activeSection}
                            />
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </MotionConfig>
              </aside>

              <section
                data-slot="dashboard-preview-pane"
                className="min-w-0 overflow-hidden border-t border-white/6 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-muted)_14%,transparent),color-mix(in_oklch,var(--color-background)_92%,black_8%))] lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:border-l lg:border-white/6 lg:border-t-0"
                aria-label="Preview"
              >
                <DashboardComposeSurface
                  errorMessage={errorMessage}
                  onApplyQualitySuggestionPath={handleApplyQrQualitySuggestionPath}
                  onReset={handleReset}
                  onQrSizeChange={handleQrSizeChange}
                  onSceneChange={setDashboardScene}
                  onSelectedNodeChange={setSelectedDashboardNodeId}
                  qualityReport={qrQualityReport}
                  qrSize={state.width}
                  scene={dashboardScene}
                  selectedNodeId={selectedDashboardNodeId}
                />
              </section>
            </section>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-6 xl:self-start">{previewCard}</div>
      <QrControlSections {...controlSectionProps} />
    </div>
  )
}

function cleanupUploadedAsset(
  uploadedAssetUrlsRef: React.MutableRefObject<
    Record<UploadedAssetKey, string | null>
  >,
  assetKey: UploadedAssetKey,
) {
  if (!uploadedAssetUrlsRef.current[assetKey]) {
    return
  }

  URL.revokeObjectURL(uploadedAssetUrlsRef.current[assetKey] as string)
  uploadedAssetUrlsRef.current[assetKey] = null
}

function cleanupUploadedAssets(
  uploadedAssetUrlsRef: React.MutableRefObject<
    Record<UploadedAssetKey, string | null>
  >,
) {
  cleanupUploadedAsset(uploadedAssetUrlsRef, "logo")
  cleanupUploadedAsset(uploadedAssetUrlsRef, "backgroundImage")
}

export function cleanupRemovedComposeImageUrls(
  composeImageUrlsRef: React.MutableRefObject<ComposeImageUrlRegistry>,
  scene: DashboardComposeScene,
) {
  const activeImageNodeIds = new Set(
    scene.nodes.filter((node) => node.kind === "image").map((node) => node.id),
  )

  for (const [nodeId, imageUrl] of Object.entries(composeImageUrlsRef.current)) {
    if (activeImageNodeIds.has(nodeId)) {
      continue
    }

    URL.revokeObjectURL(imageUrl)
    delete composeImageUrlsRef.current[nodeId]
  }
}

export function cleanupComposeImageUrls(
  composeImageUrlsRef: React.MutableRefObject<ComposeImageUrlRegistry>,
) {
  for (const imageUrl of Object.values(composeImageUrlsRef.current)) {
    URL.revokeObjectURL(imageUrl)
  }

  composeImageUrlsRef.current = {}
}

function createQrCodeInstance(state: QrStudioState) {
  const qrCode = new QRCodeStyling(toQrCodeOptions(state))
  const extension = buildQrExtension(state)

  if (extension) {
    qrCode.applyExtension(extension)
  }

  return qrCode
}

export function getComposeImageLayerName(fileName: string) {
  const normalizedName = fileName.replace(/\.[^./\\]+$/, "").trim()

  return normalizedName || "Image"
}
