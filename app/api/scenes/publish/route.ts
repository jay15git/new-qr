import { NextResponse } from "next/server"

import { migrateSceneDocument } from "@new-qr/qr-internal/scene"
import { publishSceneDocument } from "@/lib/scene-publish-store"

export async function POST(request: Request) {
  const body = await request.json()
  const scene = migrateSceneDocument(body.scene)

  if (!scene) {
    return NextResponse.json({ error: "Invalid scene document." }, { status: 400 })
  }

  const sceneId =
    typeof body.sceneId === "string" && body.sceneId.trim().length > 0
      ? body.sceneId.trim()
      : crypto.randomUUID().slice(0, 8)

  const published = publishSceneDocument(sceneId, scene)

  return NextResponse.json({
    sceneId,
    publishedVersion: published.publishedVersion,
    sceneUrl: published.sceneUrl,
    latestUrl: `/api/scenes/${sceneId}/latest`,
    scene: published,
  })
}
