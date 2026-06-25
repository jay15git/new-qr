import { NextResponse } from "next/server"

import { getLatestPublishedScene } from "@/lib/scene-publish-store"

export async function GET(
  _request: Request,
  context: { params: Promise<{ sceneId: string }> },
) {
  const { sceneId } = await context.params
  const scene = getLatestPublishedScene(sceneId)

  if (!scene) {
    return NextResponse.json({ error: "Scene not found." }, { status: 404 })
  }

  return NextResponse.json({
    sceneId,
    sceneUrl: scene.sceneUrl,
    publishedVersion: scene.publishedVersion,
    scene,
  })
}
