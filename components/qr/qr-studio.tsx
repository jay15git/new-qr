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
import {
  DEFAULT_DASHBOARD_EDIT_SECTION,
  getDashboardEditSectionChangeDirection,
  getNextDashboardSectionStateForEditMode,
  type DashboardEditSectionDirection,
  type DashboardEditSectionId,
} from "@/components/qr/dashboard-edit-sections"
import { DashboardEditRail } from "@/components/qr/dashboard-edit-rail"
import { DashboardEditControls } from "@/components/qr/dashboard-edit-controls"
import { QrSectionRail } from "@/components/qr/qr-section-rail"
import { QrControlSections } from "@/components/qr/qr-control-sections"
import { DashboardComposeSurface } from "@/components/qr/dashboard-compose-surface"
import {
  addDashboardComposeImageNode,
  DASHBOARD_QR_NODE_ID,
  createDashboardComposeScene,
  type DashboardComposeScene,
  upsertDashboardQrNode,
} from "@/components/qr/dashboard-compose-scene"
import { buildDashboardQrNodePayload } from "@/components/qr/dashboard-qr-svg"
import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import { buildQrExtension, getQrExtensionKey } from "@/components/qr/qr-rendering"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DOWNLOAD_EXTENSIONS,
  type AssetSourceMode,
  createDefaultQrStudioState,
  type QrStudioState,
  setSquareQrSize,
  toQrCodeOptions,
} from "@/components/qr/qr-studio-state"
import { DEFAULT_BRAND_ICON_COLOR } from "@/components/qr/brand-icon-svg"
import { ModeToggle } from "@/components/mode-toggle"

const DEFAULT_DOWNLOAD_NAME = "new-qr-studio"
type UploadedAssetKey = "logo" | "backgroundImage"
type ComposeImageUrlRegistry = Record<string, string>
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
  initialDashboardEditMode?: boolean
  initialDashboardEditSection?: DashboardEditSectionId
}

export function QrStudio({
  variant = "settings",
  initialActiveSection = DEFAULT_QR_EDITOR_SECTION,
  initialDashboardEditMode = false,
  initialDashboardEditSection = DEFAULT_DASHBOARD_EDIT_SECTION,
}: QrStudioProps) {
  const [state, setState] = useState(() => createDefaultQrStudioState())
  const [downloadName, setDownloadName] = useState(DEFAULT_DOWNLOAD_NAME)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeSection, setActiveSection] =
    useState<QrEditorSectionId>(initialActiveSection)
  const [isDashboardEditMode, setIsDashboardEditMode] =
    useState(initialDashboardEditMode)
  const [activeDashboardEditSection, setActiveDashboardEditSection] =
    useState<DashboardEditSectionId>(initialDashboardEditSection)
  const [dashboardScene, setDashboardScene] = useState<DashboardComposeScene>(() =>
    createDashboardComposeScene(),
  )
  const [sectionDirection, setSectionDirection] =
    useState<QrEditorSectionDirection>(0)
  const [dashboardEditSectionDirection, setDashboardEditSectionDirection] =
    useState<DashboardEditSectionDirection>(0)
  const [selectedDashboardNodeId, setSelectedDashboardNodeId] = useState<string | null>(
    initialDashboardEditMode ? DASHBOARD_QR_NODE_ID : null,
  )

  const deferredState = useDeferredValue(state)
  const previewRef = useRef<HTMLDivElement>(null)
  const initialStateRef = useRef(state)
  const qrCodeRef = useRef<QRCodeStyling | null>(null)
  const qrExtensionKeyRef = useRef(getQrExtensionKey(state))
  const dashboardPayloadRequestRef = useRef(0)
  const lastDashboardEditorSectionRef = useRef<QrEditorSectionId>(initialActiveSection)
  const uploadedAssetUrlsRef = useRef<Record<UploadedAssetKey, string | null>>({
    logo: null,
    backgroundImage: null,
  })
  const composeImageUrlsRef = useRef<ComposeImageUrlRegistry>({})
  const dashboardFilenameId = useId()
  const canDownload = Boolean(state.data.trim())

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
      cleanupUploadedAssets(uploadedAssetUrlsRef)
      cleanupComposeImageUrls(composeImageUrlsRef)
    }
  }, [])

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

  async function handleDownload(extension: FileExtension) {
    if (!qrCodeRef.current) {
      return
    }

    try {
      await qrCodeRef.current.download({
        extension,
        name: downloadName.trim() || DEFAULT_DOWNLOAD_NAME,
      })
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

  async function handleComposeImageUploadSuccess(file: File) {
    let objectUrl: string | null = null

    try {
      objectUrl = URL.createObjectURL(file)
      const naturalSize = await loadComposeImageDimensions(objectUrl)
      const nodeId = `dashboard-image-node-${crypto.randomUUID()}`
      const nextObjectUrl = objectUrl

      composeImageUrlsRef.current[nodeId] = nextObjectUrl
      setDashboardScene((current) =>
        addDashboardComposeImageNode(current, {
          id: nodeId,
          imageUrl: nextObjectUrl,
          name: getComposeImageLayerName(file.name),
          naturalHeight: naturalSize.height,
          naturalWidth: naturalSize.width,
        }),
      )
      setSelectedDashboardNodeId(nodeId)
      setErrorMessage(null)
    } catch {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }

      setErrorMessage("The image layer could not be added. Try another image.")
    }
  }

  function handleReset() {
    cleanupUploadedAssets(uploadedAssetUrlsRef)
    cleanupComposeImageUrls(composeImageUrlsRef)
    setDownloadName(DEFAULT_DOWNLOAD_NAME)
    setIsDashboardEditMode(false)
    setActiveDashboardEditSection(DEFAULT_DASHBOARD_EDIT_SECTION)
    setSelectedDashboardNodeId(null)
    setDashboardScene(createDashboardComposeScene())
    setState(createDefaultQrStudioState())
    setErrorMessage(null)
  }

  function handleDashboardEditModeChange(checked: boolean) {
    const nextState = getNextDashboardSectionStateForEditMode({
      activeSection,
      lastEditorSection: lastDashboardEditorSectionRef.current,
      nextIsEditMode: checked,
    })

    lastDashboardEditorSectionRef.current = nextState.lastEditorSection
    setActiveSection(nextState.activeSection)
    setIsDashboardEditMode(checked)
    setDashboardEditSectionDirection(0)

    if (checked) {
      setActiveDashboardEditSection(DEFAULT_DASHBOARD_EDIT_SECTION)
      setSelectedDashboardNodeId(DASHBOARD_QR_NODE_ID)
      return
    }

    setSelectedDashboardNodeId(null)
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
                        <Button
                          disabled={!canDownload}
                          variant="secondary"
                          className="rounded-full border border-white/10 bg-white/[0.08] px-4 text-foreground shadow-none hover:bg-white/[0.12]"
                        >
                          <DownloadIcon data-icon="inline-start" />
                          Download
                          <ChevronDownIcon data-icon="inline-end" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-52 rounded-2xl border-white/10 bg-[color-mix(in_oklch,var(--color-popover)_90%,black_10%)] p-2"
                      >
                        <div className="grid gap-1">
                          {DOWNLOAD_EXTENSIONS.map((extension) => (
                            <Button
                              key={extension}
                              disabled={!canDownload}
                              variant={extension === state.type ? "secondary" : "ghost"}
                              className={
                                extension === state.type
                                  ? "justify-start rounded-xl border border-white/10 bg-white/[0.08] text-foreground shadow-none hover:bg-white/[0.12]"
                                  : "justify-start rounded-xl border border-transparent text-foreground/70 shadow-none hover:border-white/8 hover:bg-white/[0.04] hover:text-foreground"
                              }
                              onClick={() => {
                                void handleDownload(extension)
                              }}
                            >
                              <DownloadIcon data-icon="inline-start" />
                              {extension.toUpperCase()}
                            </Button>
                          ))}
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
              {isDashboardEditMode ? (
                <DashboardEditRail
                  activeSection={activeDashboardEditSection}
                  onSectionChange={(section) => {
                    if (section === activeDashboardEditSection) {
                      return
                    }

                    const nextDirection = getDashboardEditSectionChangeDirection(
                      activeDashboardEditSection,
                      section,
                    )

                    startTransition(() => {
                      setDashboardEditSectionDirection(nextDirection)
                      setActiveDashboardEditSection(section)
                    })
                  }}
                />
              ) : (
                <QrSectionRail
                  activeSection={activeSection}
                  onSectionChange={(section) => {
                    if (section === activeSection) {
                      return
                    }

                    lastDashboardEditorSectionRef.current = section

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
              )}

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
                        custom={
                          isDashboardEditMode
                            ? dashboardEditSectionDirection
                            : sectionDirection
                        }
                      >
                        <motion.div
                          key={
                            isDashboardEditMode
                              ? activeDashboardEditSection
                              : activeSection
                          }
                          data-slot="dashboard-settings-motion"
                          data-direction={
                            isDashboardEditMode
                              ? dashboardEditSectionDirection
                              : sectionDirection
                          }
                          className="flex min-h-0 flex-1 flex-col"
                          custom={
                            isDashboardEditMode
                              ? dashboardEditSectionDirection
                              : sectionDirection
                          }
                          variants={DASHBOARD_SECTION_PANE_VARIANTS}
                          initial="initial"
                          animate="active"
                          exit="exit"
                        >
                          <div
                            data-slot="dashboard-settings-scroll"
                            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 pb-10 sm:px-6 lg:px-8 lg:py-8 lg:pb-12"
                          >
                            {isDashboardEditMode ? (
                              <DashboardEditControls
                                activeSection={activeDashboardEditSection}
                                onComposeImageUploadError={(message: string) =>
                                  setErrorMessage(message)
                                }
                                onComposeImageUploadSuccess={(file: File) => {
                                  void handleComposeImageUploadSuccess(file)
                                }}
                                onSceneChange={setDashboardScene}
                                onSelectedNodeChange={setSelectedDashboardNodeId}
                                scene={dashboardScene}
                                selectedNodeId={selectedDashboardNodeId}
                              />
                            ) : (
                              <QrControlSections
                                {...controlSectionProps}
                                activeSection={activeSection}
                              />
                            )}
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
                  isEditMode={isDashboardEditMode}
                  onEditModeChange={handleDashboardEditModeChange}
                  onReset={handleReset}
                  onQrSizeChange={handleQrSizeChange}
                  onSceneChange={setDashboardScene}
                  onSelectedNodeChange={setSelectedDashboardNodeId}
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

async function loadComposeImageDimensions(imageUrl: string) {
  return await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.onerror = () => reject(new Error("Failed to load image dimensions."))
    image.src = imageUrl
  })
}
