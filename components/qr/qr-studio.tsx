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
        <div className="flex min-h-screen w-full bg-muted/20">
          <DashboardSidebar
            activeSection={activeSection}
            onSectionChange={(section) => {
              startTransition(() => setActiveSection(section))
            }}
          />

          <main className="flex-1">
            <div className="mx-auto grid min-h-screen w-full max-w-[1700px] gap-4 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,.9fr)] lg:items-start lg:gap-4 lg:px-4 lg:py-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(24rem,1fr)] xl:gap-5 xl:px-5 xl:py-5 2xl:grid-cols-[minmax(0,1.7fr)_minmax(26rem,1fr)] 2xl:gap-6 2xl:px-6">
              <div className="min-w-0 space-y-3">
                <section className="border-b border-border/60 pb-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Active section
                  </p>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                    {activeSectionMeta.title}
                  </h1>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                    {activeSectionMeta.detail}
                  </p>
                </section>

                <QrControlSections
                  {...controlSectionProps}
                  activeSection={activeSection}
                />
              </div>

              <div className="lg:sticky lg:top-4 lg:self-start lg:w-full lg:justify-self-end">
                {previewCard}
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
