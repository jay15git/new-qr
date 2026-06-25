import {
  SCENE_DOCUMENT_VERSION,
  type SceneDocumentV1,
  isSceneDocumentV1,
} from "./scene-document"

export function migrateSceneDocument(value: unknown): SceneDocumentV1 | null {
  if (isSceneDocumentV1(value)) {
    return value
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    (value as { version: number }).version === 1
  ) {
    return value as SceneDocumentV1
  }

  return null
}

export function createEmptySceneDocument(): SceneDocumentV1 {
  return {
    version: SCENE_DOCUMENT_VERSION,
    width: 1,
    height: 1,
    nodes: [],
    activeNodeId: "",
    layersByNodeId: {},
    cardStateByNodeId: {},
    qrStateByNodeId: {},
    assets: {},
    fonts: [],
  }
}
