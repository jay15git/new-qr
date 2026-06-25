import type { SceneDocumentV1 } from "@new-qr/qr-scene-schema"

type PublishedSceneRecord = {
  latestVersion: number
  versions: Record<number, SceneDocumentV1>
}

const sceneStore = new Map<string, PublishedSceneRecord>()

export function publishSceneDocument(sceneId: string, scene: SceneDocumentV1) {
  const current = sceneStore.get(sceneId)
  const nextVersion = (current?.latestVersion ?? 0) + 1
  const publishedScene: SceneDocumentV1 = {
    ...scene,
    sceneId,
    publishedVersion: nextVersion,
    sceneUrl: `/api/scenes/${sceneId}/v${nextVersion}`,
  }

  sceneStore.set(sceneId, {
    latestVersion: nextVersion,
    versions: {
      ...(current?.versions ?? {}),
      [nextVersion]: publishedScene,
    },
  })

  return publishedScene
}

export function getLatestPublishedScene(sceneId: string) {
  const record = sceneStore.get(sceneId)

  if (!record) {
    return null
  }

  return record.versions[record.latestVersion] ?? null
}

export function getPublishedSceneVersion(sceneId: string, version: number) {
  return sceneStore.get(sceneId)?.versions[version] ?? null
}
