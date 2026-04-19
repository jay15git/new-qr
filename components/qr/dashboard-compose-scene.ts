export const DASHBOARD_COMPOSE_CANVAS_SIZE = 960
export const DASHBOARD_COMPOSE_CANVAS_HEIGHT = 640
export const DASHBOARD_QR_STAGE_FIT_RATIO = 0.74
export const DASHBOARD_QR_NODE_ID = "dashboard-qr-node"
const MIN_DASHBOARD_ZOOM = 0.2
const MAX_DASHBOARD_ZOOM = 4

export type DashboardComposeBackgroundMode = "transparent" | "solid"

export type DashboardComposeBackground = {
  mode: DashboardComposeBackgroundMode
  color: string
}

export type DashboardComposeCamera = {
  zoom: number
  panX: number
  panY: number
}

export type DashboardComposeNode = {
  id: string
  kind: "svg"
  originalSvgMarkup: string
  naturalWidth: number
  naturalHeight: number
  x: number
  y: number
  scale: number
  rotation: number
  zIndex: number
  opacity: number
  blendMode: string
}

export type DashboardComposeScene = {
  background: DashboardComposeBackground
  canvasSize: {
    width: number
    height: number
  }
  camera: DashboardComposeCamera
  nodes: DashboardComposeNode[]
}

export type DashboardQrNodePayload = {
  markup: string
  naturalWidth: number
  naturalHeight: number
}

const DEFAULT_CAMERA: DashboardComposeCamera = {
  zoom: 1,
  panX: 0,
  panY: 0,
}

const DEFAULT_BACKGROUND: DashboardComposeBackground = {
  mode: "transparent",
  color: "#ffffff",
}

export function createDashboardComposeScene(): DashboardComposeScene {
  return {
    background: { ...DEFAULT_BACKGROUND },
    canvasSize: {
      width: DASHBOARD_COMPOSE_CANVAS_SIZE,
      height: DASHBOARD_COMPOSE_CANVAS_HEIGHT,
    },
    camera: { ...DEFAULT_CAMERA },
    nodes: [],
  }
}

export function clampDashboardZoom(zoom: number) {
  if (!Number.isFinite(zoom)) {
    return DEFAULT_CAMERA.zoom
  }

  return Math.min(MAX_DASHBOARD_ZOOM, Math.max(MIN_DASHBOARD_ZOOM, zoom))
}

export function computeDashboardZoomedCamera(
  scene: DashboardComposeScene,
  nextZoom: number,
  anchor: { x: number; y: number },
) {
  const zoom = clampDashboardZoom(nextZoom)
  const worldX = (anchor.x - scene.camera.panX) / scene.camera.zoom
  const worldY = (anchor.y - scene.camera.panY) / scene.camera.zoom

  return {
    zoom,
    panX: anchor.x - worldX * zoom,
    panY: anchor.y - worldY * zoom,
  }
}

export function updateDashboardComposeCamera(
  scene: DashboardComposeScene,
  patch: Partial<DashboardComposeCamera>,
) {
  return {
    ...scene,
    camera: {
      ...scene.camera,
      ...patch,
      zoom: clampDashboardZoom(patch.zoom ?? scene.camera.zoom),
    },
  }
}

export function updateDashboardComposeNode(
  scene: DashboardComposeScene,
  nodeId: string,
  patch: Partial<DashboardComposeNode>,
) {
  return {
    ...scene,
    nodes: scene.nodes.map((node) =>
      node.id === nodeId ? normalizeDashboardComposeNode({ ...node, ...patch }) : node,
    ),
  }
}

export function getDashboardComposeNode(
  scene: DashboardComposeScene,
  nodeId = DASHBOARD_QR_NODE_ID,
) {
  return scene.nodes.find((node) => node.id === nodeId)
}

export function upsertDashboardQrNode(
  scene: DashboardComposeScene,
  payload: DashboardQrNodePayload,
) {
  const existingNode = getDashboardComposeNode(scene)

  if (!existingNode || !hasFiniteTransform(existingNode)) {
    return {
      ...scene,
      nodes: [createDashboardQrNode(scene, payload)],
    }
  }

  const nextWidth = payload.naturalWidth * existingNode.scale
  const nextHeight = payload.naturalHeight * existingNode.scale
  const previousCenterX =
    existingNode.x + existingNode.naturalWidth * existingNode.scale * 0.5
  const previousCenterY =
    existingNode.y + existingNode.naturalHeight * existingNode.scale * 0.5

  return {
    ...scene,
    nodes: [
      normalizeDashboardComposeNode({
        ...existingNode,
        originalSvgMarkup: payload.markup,
        naturalWidth: payload.naturalWidth,
        naturalHeight: payload.naturalHeight,
        x: previousCenterX - nextWidth * 0.5,
        y: previousCenterY - nextHeight * 0.5,
      }),
    ],
  }
}

export function resetDashboardComposeCamera(scene: DashboardComposeScene) {
  return {
    ...scene,
    camera: { ...DEFAULT_CAMERA },
  }
}

export function resetDashboardQrNodeTransform(scene: DashboardComposeScene) {
  const node = getDashboardComposeNode(scene)

  if (!node) {
    return scene
  }

  return {
    ...scene,
    nodes: [
      createDashboardQrNode(scene, {
        markup: node.originalSvgMarkup,
        naturalHeight: node.naturalHeight,
        naturalWidth: node.naturalWidth,
      }),
    ],
  }
}

function createDashboardQrNode(
  scene: DashboardComposeScene,
  payload: DashboardQrNodePayload,
): DashboardComposeNode {
  const fitScale = Math.min(
    (scene.canvasSize.width * DASHBOARD_QR_STAGE_FIT_RATIO) / payload.naturalWidth,
    (scene.canvasSize.height * DASHBOARD_QR_STAGE_FIT_RATIO) / payload.naturalHeight,
  )
  const scale = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1
  const width = payload.naturalWidth * scale
  const height = payload.naturalHeight * scale

  return normalizeDashboardComposeNode({
    id: DASHBOARD_QR_NODE_ID,
    kind: "svg",
    originalSvgMarkup: payload.markup,
    naturalWidth: payload.naturalWidth,
    naturalHeight: payload.naturalHeight,
    x: (scene.canvasSize.width - width) * 0.5,
    y: (scene.canvasSize.height - height) * 0.5,
    scale,
    rotation: 0,
    zIndex: 1,
    opacity: 1,
    blendMode: "normal",
  })
}

function normalizeDashboardComposeNode(
  node: DashboardComposeNode,
): DashboardComposeNode {
  return {
    ...node,
    naturalHeight: Math.max(1, node.naturalHeight),
    naturalWidth: Math.max(1, node.naturalWidth),
    opacity: clamp(node.opacity, 0, 1),
    rotation: normalizeRotation(node.rotation),
    scale: Number.isFinite(node.scale) && node.scale > 0 ? node.scale : 1,
    x: Number.isFinite(node.x) ? node.x : 0,
    y: Number.isFinite(node.y) ? node.y : 0,
    zIndex: Number.isFinite(node.zIndex) ? node.zIndex : 0,
    blendMode: node.blendMode || "normal",
  }
}

function hasFiniteTransform(node: DashboardComposeNode) {
  return (
    Number.isFinite(node.scale) &&
    node.scale > 0 &&
    Number.isFinite(node.rotation) &&
    Number.isFinite(node.x) &&
    Number.isFinite(node.y)
  )
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

function normalizeRotation(rotation: number) {
  if (!Number.isFinite(rotation)) {
    return 0
  }

  const normalized = rotation % 360

  return normalized < 0 ? normalized + 360 : normalized
}
