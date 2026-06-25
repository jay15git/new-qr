"use client"

import { useCallback, useEffect, useState } from "react"

import type { SceneDocumentV1 } from "@new-qr/qr-scene-schema"
import {
  buildSceneEmbedSnippet,
  buildSceneReactLiveCode,
  downloadSceneDocument,
} from "@/features/qr-code/export/scene-document-export"

type DesktopEmbedInspectorProps = {
  buildSceneDocument: () => Promise<SceneDocumentV1>
}

export function DesktopEmbedInspector({ buildSceneDocument }: DesktopEmbedInspectorProps) {
  const [scene, setScene] = useState<SceneDocumentV1 | null>(null)
  const [publishedSceneId, setPublishedSceneId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    refreshScene()
  }, [refreshScene])

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
      </div>

      {publishedSceneId ? (
        <p className="text-xs opacity-70">
          Published scene ID: <code>{publishedSceneId}</code>
        </p>
      ) : null}
    </div>
  )
}
