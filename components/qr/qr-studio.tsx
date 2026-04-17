"use client"

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import type { FileExtension } from "qr-code-styling"
import QRCodeStyling from "qr-code-styling"

import { DashboardSidebar } from "@/components/sidebar-03/app-sidebar"
import {
  getActiveCustomDotShape,
  type CustomDotShape,
} from "@/components/qr/custom-dot-shapes"
import {
  DEFAULT_QR_EDITOR_SECTION,
  getQrEditorSection,
  type QrEditorSectionId,
} from "@/components/qr/qr-sections"
import {
  type LogoSourceMode,
  QrControlSections,
} from "@/components/qr/qr-control-sections"
import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import { createCustomDotShapeExtension } from "@/components/qr/qr-svg-custom-shape-extension"
import {
  createDefaultQrStudioState,
  type QrStudioState,
  toQrCodeOptions,
} from "@/components/qr/qr-studio-state"
import { SidebarProvider } from "@/components/ui/sidebar"

const DEFAULT_DOWNLOAD_NAME = "new-qr-studio"
const DASHBOARD_SIDEBAR_STYLE = {
  "--sidebar-width": "12rem",
  "--sidebar-width-icon": "3.25rem",
} as CSSProperties

type QrStudioProps = {
  variant?: "settings" | "dashboard"
}

export function QrStudio({ variant = "settings" }: QrStudioProps) {
  const [state, setState] = useState(() => createDefaultQrStudioState())
  const [downloadName, setDownloadName] = useState(DEFAULT_DOWNLOAD_NAME)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [logoSourceMode, setLogoSourceMode] = useState<LogoSourceMode>("none")
  const [activeSection, setActiveSection] =
    useState<QrEditorSectionId>(DEFAULT_QR_EDITOR_SECTION)

  const deferredState = useDeferredValue(state)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialStateRef = useRef(state)
  const qrCodeRef = useRef<QRCodeStyling | null>(null)
  const qrExtensionKeyRef = useRef(getQrExtensionKey(state))
  const uploadedLogoUrlRef = useRef<string | null>(null)

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
      cleanupUploadedLogo(uploadedLogoUrlRef)
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

  function handleLogoModeChange(mode: LogoSourceMode) {
    cleanupUploadedLogo(uploadedLogoUrlRef)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    setLogoSourceMode(mode)
    setState((current) => ({
      ...current,
      image: undefined,
    }))
  }

  function handleLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      cleanupUploadedLogo(uploadedLogoUrlRef)
      const nextUrl = URL.createObjectURL(file)
      uploadedLogoUrlRef.current = nextUrl
      setLogoSourceMode("upload")
      setState((current) => ({ ...current, image: nextUrl }))
      setErrorMessage(null)
    } catch {
      setErrorMessage("The logo file could not be read. Try another image.")
    }
  }

  function handleReset() {
    cleanupUploadedLogo(uploadedLogoUrlRef)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    setLogoSourceMode("none")
    setDownloadName(DEFAULT_DOWNLOAD_NAME)
    setState(createDefaultQrStudioState())
    setErrorMessage(null)
  }

  const previewCard = (
    <QrPreviewCard
      canDownload={Boolean(state.data.trim())}
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
    fileInputRef,
    logoSourceMode,
    onLogoFileChange: handleLogoFileChange,
    onLogoModeChange: handleLogoModeChange,
    onPickLogoFile: () => fileInputRef.current?.click(),
    setState,
    state,
  }

  if (variant === "dashboard") {
    const activeSectionMeta = getQrEditorSection(activeSection)

    return (
      <SidebarProvider className="min-h-screen w-full" style={DASHBOARD_SIDEBAR_STYLE}>
        <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_top_left,oklch(0.3_0.05_66/0.18),transparent_28%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,black_8%),var(--color-background))]">
          <DashboardSidebar
            activeSection={activeSection}
            onSectionChange={(section) => {
              startTransition(() => setActiveSection(section))
            }}
          />

          <main className="min-w-0 flex-1" aria-labelledby="dashboard-title">
            <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-6 px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
              <header className="flex max-w-3xl flex-col gap-3">
                <div className="flex max-w-3xl flex-col gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary/72">
                    Brand-safe QR design studio
                  </p>
                  <h1
                    id="dashboard-title"
                    className="font-heading text-4xl font-semibold tracking-[-0.04em] text-balance text-foreground sm:text-5xl"
                  >
                    QR Studio
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                    Tune content, geometry, background, and logo treatment in a
                    focused three-panel workspace built for campaign handoff.
                  </p>
                </div>
              </header>

              <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(17.5rem,0.82fr)_minmax(0,1.5fr)] lg:items-start 2xl:grid-cols-[minmax(18.5rem,0.8fr)_minmax(0,1.56fr)]">
                <aside
                  className="min-w-0 rounded-[1.85rem] border border-border/70 bg-[color-mix(in_oklch,var(--color-card)_82%,transparent)] px-4 py-4 shadow-[0_24px_80px_-60px_rgba(0,0,0,0.85)] sm:px-5 sm:py-5 lg:max-w-[28rem]"
                  aria-labelledby="settings-panel-title"
                >
                  <div className="mb-5 flex flex-col gap-1 border-b border-border/70 pb-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/72">
                      Settings panel
                    </p>
                    <h2
                      id="settings-panel-title"
                      className="font-heading text-2xl font-medium tracking-[-0.03em] text-foreground"
                    >
                      {activeSectionMeta.title}
                    </h2>
                    <p className="max-w-[34ch] text-sm leading-6 text-muted-foreground">
                      {activeSectionMeta.detail}
                    </p>
                  </div>

                  <div className="min-h-0 lg:max-h-[calc(100svh-13rem)] lg:overflow-y-auto lg:pr-1">
                    <QrControlSections
                      {...controlSectionProps}
                      activeSection={activeSection}
                    />
                  </div>
                </aside>

                <section className="min-w-0 space-y-4" aria-labelledby="preview-panel-title">
                  <div className="flex flex-col gap-1 px-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/72">
                      QR code panel
                    </p>
                    <h2
                      id="preview-panel-title"
                      className="font-heading text-2xl font-medium tracking-[-0.03em] text-foreground"
                    >
                      Review the live QR at final size.
                    </h2>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                      The code stays visually dominant while export actions
                      remain directly below the preview for final delivery.
                    </p>
                  </div>

                  <div className="lg:sticky lg:top-6">{previewCard}</div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-6 xl:self-start">{previewCard}</div>
      <QrControlSections {...controlSectionProps} />
    </div>
  )
}

function cleanupUploadedLogo(uploadedLogoUrlRef: React.MutableRefObject<string | null>) {
  if (!uploadedLogoUrlRef.current) {
    return
  }

  URL.revokeObjectURL(uploadedLogoUrlRef.current)
  uploadedLogoUrlRef.current = null
}

function createQrCodeInstance(state: QrStudioState) {
  const qrCode = new QRCodeStyling(toQrCodeOptions(state))
  const customDotShape = getSvgCustomDotShape(state)

  if (customDotShape) {
    qrCode.applyExtension(createCustomDotShapeExtension(customDotShape))
  }

  return qrCode
}

function getSvgCustomDotShape(state: QrStudioState): CustomDotShape | null {
  if (state.type !== "svg") {
    return null
  }

  return getActiveCustomDotShape(state.dotsOptions.type)
}

function getQrExtensionKey(state: QrStudioState) {
  return getSvgCustomDotShape(state) ?? "none"
}
