"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { FrameworkTarget } from "@new-qr/qr-scene-codegen"
import type { SceneDocumentV1 } from "@new-qr/qr-scene-schema"
import {
  buildSceneEmbedSnippet,
  buildSceneReactLiveCode,
  downloadSceneDocument,
} from "@/features/qr-code/export/scene-document-export"

type CodegenOption = {
  id: string
  label: string
  target: FrameworkTarget
}

const CODEGEN_OPTIONS: CodegenOption[] = [
  { id: "svg", label: "SVG", target: { framework: "svg" } },
  {
    id: "react-jsx-static",
    label: "React JSX (static)",
    target: { framework: "react", dialect: "jsx", mode: "static", componentName: "QrCard" },
  },
  {
    id: "react-tsx-static",
    label: "React TSX (static)",
    target: { framework: "react", dialect: "tsx", mode: "static", componentName: "QrCard" },
  },
  {
    id: "react-jsx-live",
    label: "React JSX (live)",
    target: { framework: "react", dialect: "jsx", mode: "live", componentName: "QrCard" },
  },
  {
    id: "react-tsx-live",
    label: "React TSX (live)",
    target: { framework: "react", dialect: "tsx", mode: "live", componentName: "QrCard" },
  },
]

type DesktopEmbedInspectorProps = {
  buildSceneDocument: () => Promise<SceneDocumentV1>
  buildCodegenExport?: (target: FrameworkTarget) => Promise<{ code: string }>
}

export function DesktopEmbedInspector({
  buildSceneDocument,
  buildCodegenExport,
}: DesktopEmbedInspectorProps) {
  const [scene, setScene] = useState<SceneDocumentV1 | null>(null)
  const [publishedSceneId, setPublishedSceneId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCodegenId, setSelectedCodegenId] = useState(CODEGEN_OPTIONS[0].id)
  const [codegenPreview, setCodegenPreview] = useState<string>("")
  const [codegenLoading, setCodegenLoading] = useState(false)

  const selectedCodegen = useMemo(
    () => CODEGEN_OPTIONS.find((option) => option.id === selectedCodegenId) ?? CODEGEN_OPTIONS[0],
    [selectedCodegenId],
  )

  const refreshScene = useCallback(() => {
    void buildSceneDocument()
      .then((nextScene) => {
        setScene(nextScene)
        setError(null)
      })
      .catch(() => {
        setError("Failed to build scene document.")
      })
  }, [buildSceneDocument])

  const refreshCodegen = useCallback(() => {
    if (!buildCodegenExport) {
      return
    }

    setCodegenLoading(true)
    void buildCodegenExport(selectedCodegen.target)
      .then((result) => {
        setCodegenPreview(result.code)
      })
      .catch(() => {
        setCodegenPreview("Failed to generate export code.")
      })
      .finally(() => {
        setCodegenLoading(false)
      })
  }, [buildCodegenExport, selectedCodegen.target])

  useEffect(() => {
    refreshScene()
  }, [refreshScene])

  useEffect(() => {
    refreshCodegen()
  }, [refreshCodegen])

  async function handlePublish() {
    if (!scene) {
      return
    }

    const response = await fetch("/api/scenes/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scene, sceneId: publishedSceneId ?? undefined }),
    })

    if (!response.ok) {
      setError("Failed to publish scene.")
      return
    }

    const payload = await response.json()
    setPublishedSceneId(payload.sceneId)
    setScene(payload.scene)
    setError(null)
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  if (!scene) {
    return <p className="text-sm opacity-70">Preparing embed snippet...</p>
  }

  const liveSnippet = buildSceneEmbedSnippet({
    ...scene,
    sceneId: publishedSceneId ?? scene.sceneId ?? "abc123",
  })
  const lockedSnippet = buildSceneEmbedSnippet(
    {
      ...scene,
      sceneUrl:
        scene.sceneUrl ??
        `/api/scenes/${publishedSceneId ?? scene.sceneId ?? "abc123"}/v${scene.publishedVersion ?? 1}`,
    },
    { locked: true },
  )
  const reactLiveCode = buildSceneReactLiveCode(scene)

  return (
    <div className="grid gap-4" data-slot="desktop-embed-inspector">
      {buildCodegenExport ? (
        <section className="grid gap-2" data-slot="desktop-codegen-inspector">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Copy code</p>
          <div className="flex flex-wrap gap-2">
            {CODEGEN_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`rounded-md border px-2 py-1 text-xs ${option.id === selectedCodegenId ? "bg-black/10" : ""}`}
                type="button"
                onClick={() => setSelectedCodegenId(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <pre className="max-h-56 overflow-auto rounded-md bg-black/5 p-3 text-xs">
            {codegenLoading ? "Generating..." : codegenPreview}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border px-3 py-2 text-sm"
              type="button"
              onClick={() => navigator.clipboard.writeText(codegenPreview)}
              disabled={!codegenPreview || codegenLoading}
            >
              Copy {selectedCodegen.label}
            </button>
            <button
              className="rounded-md border px-3 py-2 text-sm"
              type="button"
              onClick={() => refreshCodegen()}
            >
              Refresh preview
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Install</p>
        <pre className="overflow-x-auto rounded-md bg-black/5 p-3 text-xs">{liveSnippet.installCommand}</pre>
      </section>

      <section className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Live embed</p>
        <pre className="overflow-x-auto rounded-md bg-black/5 p-3 text-xs">{liveSnippet.reactCode}</pre>
      </section>

      <section className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Locked version URL</p>
        <pre className="overflow-x-auto rounded-md bg-black/5 p-3 text-xs">{lockedSnippet.reactCode}</pre>
      </section>

      <section className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Copy React live</p>
        <pre className="max-h-56 overflow-auto rounded-md bg-black/5 p-3 text-xs">{reactLiveCode}</pre>
      </section>

      <div className="flex flex-wrap gap-2">
        <button className="rounded-md border px-3 py-2 text-sm" type="button" onClick={() => downloadSceneDocument(scene)}>
          Download scene.json
        </button>
        <button className="rounded-md border px-3 py-2 text-sm" type="button" onClick={() => void handlePublish()}>
          Publish scene
        </button>
        <button
          className="rounded-md border px-3 py-2 text-sm"
          type="button"
          onClick={() => navigator.clipboard.writeText(liveSnippet.reactCode)}
        >
          Copy live embed
        </button>
        <button
          className="rounded-md border px-3 py-2 text-sm"
          type="button"
          onClick={() => navigator.clipboard.writeText(reactLiveCode)}
        >
          Copy React live
        </button>
      </div>

      {publishedSceneId ? (
        <p className="text-xs opacity-70">
          Published scene ID: <code>{publishedSceneId}</code>
        </p>
      ) : null}
    </div>
  )
}
