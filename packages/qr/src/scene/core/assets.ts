import type { SceneAsset, SceneDocumentV1 } from "../schema"

export type NormalizedAsset = SceneAsset & {
  resolvedUrl: string
}

export function isBlobUrl(value: string) {
  return value.startsWith("blob:")
}

export function isDataUrl(value: string) {
  return value.startsWith("data:")
}

export async function blobUrlToDataUrl(blobUrl: string): Promise<string | null> {
  if (typeof fetch === "undefined") {
    return null
  }

  try {
    const response = await fetch(blobUrl)
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function normalizeAssetUrl(
  url: string,
  options: { inlineBlobs?: boolean } = {},
): Promise<string> {
  if (!url) {
    return url
  }

  if (options.inlineBlobs !== false && isBlobUrl(url)) {
    const dataUrl = await blobUrlToDataUrl(url)
    return dataUrl ?? url
  }

  return url
}

export async function inlineSceneAssets(
  scene: SceneDocumentV1,
): Promise<SceneDocumentV1> {
  const assets: Record<string, SceneAsset> = {}

  for (const [id, asset] of Object.entries(scene.assets)) {
    const resolvedUrl = await normalizeAssetUrl(asset.url)
    assets[id] = {
      ...asset,
      source: isDataUrl(resolvedUrl) ? "data" : asset.source === "blob" ? "url" : asset.source,
      url: resolvedUrl,
    }
  }

  return {
    ...scene,
    assets,
  }
}

export function collectSceneAssetIds(scene: SceneDocumentV1) {
  return Object.keys(scene.assets)
}
