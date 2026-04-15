"use client"

import { useDeferredValue, useEffect, useRef, useState } from "react"
import type { FileExtension } from "qr-code-styling"
import QRCodeStyling from "qr-code-styling"

import {
  type LogoSourceMode,
  QrControlSections,
} from "@/components/qr/qr-control-sections"
import { QrPreviewCard } from "@/components/qr/qr-preview-card"
import {
  createDefaultQrStudioState,
  toQrCodeOptions,
} from "@/components/qr/qr-studio-state"

const DEFAULT_DOWNLOAD_NAME = "new-qr-studio"

export function QrStudio() {
  const [state, setState] = useState(() => createDefaultQrStudioState())
  const [downloadName, setDownloadName] = useState(DEFAULT_DOWNLOAD_NAME)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [logoSourceMode, setLogoSourceMode] = useState<LogoSourceMode>("none")

  const deferredState = useDeferredValue(state)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialStateRef = useRef(state)
  const qrCodeRef = useRef<QRCodeStyling | null>(null)
  const uploadedLogoUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const previewElement = previewRef.current

    if (!previewElement) {
      return
    }

    const qrCode = new QRCodeStyling(toQrCodeOptions(initialStateRef.current))
    qrCodeRef.current = qrCode
    previewElement.replaceChildren()
    qrCode.append(previewElement)

    return () => {
      previewElement.replaceChildren()
      qrCodeRef.current = null
      cleanupUploadedLogo(uploadedLogoUrlRef)
    }
  }, [])

  useEffect(() => {
    if (!qrCodeRef.current) {
      return
    }

    try {
      qrCodeRef.current.update(toQrCodeOptions(deferredState))
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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-6 xl:self-start">
        <QrPreviewCard
          canDownload={Boolean(state.data.trim())}
          downloadName={downloadName}
          errorMessage={errorMessage}
          onDownload={handleDownload}
          onDownloadNameChange={setDownloadName}
          onReset={handleReset}
          previewRef={previewRef}
          state={state}
        />
      </div>
      <QrControlSections
        fileInputRef={fileInputRef}
        logoSourceMode={logoSourceMode}
        onLogoFileChange={handleLogoFileChange}
        onLogoModeChange={handleLogoModeChange}
        onPickLogoFile={() => fileInputRef.current?.click()}
        setState={setState}
        state={state}
      />
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
