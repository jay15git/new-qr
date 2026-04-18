"use client"

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import type { FileExtension } from "qr-code-styling"
import QRCodeStyling from "qr-code-styling"

import {
  DEFAULT_QR_EDITOR_SECTION,
  getQrEditorSection,
  getQrEditorSectionChangeDirection,
  type QrEditorSectionDirection,
  type QrEditorSectionId,
} from "@/components/qr/qr-sections"
import { QrSectionRail } from "@/components/qr/qr-section-rail"
import { QrControlSections } from "@/components/qr/qr-control-sections"
import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import { buildQrExtension, getQrExtensionKey } from "@/components/qr/qr-rendering"
import {
  type AssetSourceMode,
  createDefaultQrStudioState,
  type QrStudioState,
  toQrCodeOptions,
} from "@/components/qr/qr-studio-state"

const DEFAULT_DOWNLOAD_NAME = "new-qr-studio"
type UploadedAssetKey = "logo" | "backgroundImage"
const DASHBOARD_SECTION_PANE_VARIANTS = {
  active: {
    filter: "blur(0px)",
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: (direction: QrEditorSectionDirection) => ({
    filter: "blur(6px)",
    opacity: 0,
    scale: 0.985,
    y: direction === 0 ? 0 : direction * -48,
  }),
  initial: (direction: QrEditorSectionDirection) => ({
    filter: "blur(6px)",
    opacity: 0,
    scale: 0.985,
    y: direction === 0 ? 0 : direction * 48,
  }),
} as const

type QrStudioProps = {
  variant?: "settings" | "dashboard"
}

export function QrStudio({ variant = "settings" }: QrStudioProps) {
  const [state, setState] = useState(() => createDefaultQrStudioState())
  const [downloadName, setDownloadName] = useState(DEFAULT_DOWNLOAD_NAME)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeSection, setActiveSection] =
    useState<QrEditorSectionId>(DEFAULT_QR_EDITOR_SECTION)
  const [sectionDirection, setSectionDirection] =
    useState<QrEditorSectionDirection>(0)

  const deferredState = useDeferredValue(state)
  const previewRef = useRef<HTMLDivElement>(null)
  const initialStateRef = useRef(state)
  const qrCodeRef = useRef<QRCodeStyling | null>(null)
  const qrExtensionKeyRef = useRef(getQrExtensionKey(state))
  const uploadedAssetUrlsRef = useRef<Record<UploadedAssetKey, string | null>>({
    logo: null,
    backgroundImage: null,
  })
  const canDownload = Boolean(state.data.trim())

  useEffect(() => {
    const previewElement = previewRef.current

    if (!previewElement) {
      return
    }

    const qrCode = createQrCodeInstance(initialStateRef.current)
    qrCodeRef.current = qrCode
    qrExtensionKeyRef.current = getQrExtensionKey(initialStateRef.current)
    previewElement.replaceChildren()
    qrCode.append(previewElement)

    return () => {
      previewElement.replaceChildren()
      qrCodeRef.current = null
      cleanupUploadedAssets(uploadedAssetUrlsRef)
    }
  }, [])

  useEffect(() => {
    const previewElement = previewRef.current

    if (!qrCodeRef.current || !previewElement) {
      return
    }

    try {
      const nextExtensionKey = getQrExtensionKey(deferredState)

      if (nextExtensionKey !== qrExtensionKeyRef.current) {
        const qrCode = createQrCodeInstance(deferredState)

        qrCodeRef.current = qrCode
        qrExtensionKeyRef.current = nextExtensionKey
        previewElement.replaceChildren()
        qrCode.append(previewElement)
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
    setDownloadName(DEFAULT_DOWNLOAD_NAME)
    setState(createDefaultQrStudioState())
    setErrorMessage(null)
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
      variant={variant}
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
    const activeSectionMeta = getQrEditorSection(activeSection)

    return (
      <div className="flex min-h-screen w-full bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_96%,black_4%),var(--color-background))] lg:h-screen lg:overflow-hidden">
        <main
          className="flex min-h-screen min-w-0 flex-1 flex-col lg:h-screen"
          aria-labelledby="dashboard-title"
        >
          <div className="flex min-h-screen w-full flex-col lg:h-full lg:min-h-0">
            <header className="border-b border-border/70 px-4 py-4 sm:px-5 lg:px-6">
              <h1
                id="dashboard-title"
                className="font-heading text-2xl font-semibold tracking-[-0.04em] text-balance text-foreground sm:text-3xl"
              >
                QR Studio
              </h1>
            </header>

            <section
              data-slot="dashboard-workspace"
              className="flex flex-1 flex-col lg:h-full lg:min-h-0 lg:grid lg:grid-cols-[6.5rem_minmax(20rem,26rem)_minmax(22rem,1fr)] lg:overflow-hidden xl:grid-cols-[6.5rem_minmax(21rem,28rem)_minmax(24rem,1fr)]"
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
                className="min-w-0 border-t border-border/70 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:border-t-0"
                aria-label="QR editor settings"
              >
                <MotionConfig
                  transition={{ duration: 0.32, type: "spring", bounce: 0.16 }}
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
                          <div className="border-b border-border/70 px-4 py-5 sm:px-5 lg:px-6">
                            <h2
                              className="font-heading text-2xl font-medium tracking-[-0.03em] text-foreground"
                            >
                              {activeSectionMeta.title}
                            </h2>
                          </div>

                          <div
                            data-slot="dashboard-settings-scroll"
                            className="min-h-0 flex-1 overflow-x-visible overflow-y-auto px-4 py-5 pb-8 sm:px-5 lg:px-6 lg:py-6 lg:pb-10"
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
                className="min-w-0 border-t border-border/70 bg-muted/10 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:border-l lg:border-t-0"
                aria-label="Preview"
              >
                <div className="h-full min-h-[22rem] lg:h-full">{previewCard}</div>
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

function createQrCodeInstance(state: QrStudioState) {
  const qrCode = new QRCodeStyling(toQrCodeOptions(state))
  const extension = buildQrExtension(state)

  if (extension) {
    qrCode.applyExtension(extension)
  }

  return qrCode
}
