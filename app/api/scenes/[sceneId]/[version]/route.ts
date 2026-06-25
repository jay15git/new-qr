import { NextResponse } from "next/server"

import { getPublishedSceneVersion } from "@/lib/scene-publish-store"

export async function GET(
  _request: Request,
  context: { params: Promise<{ sceneId: string; version: string }> },
) {
  const { sceneId, version } = await context.params
  const parsedVersion = Number(version.replace(/^v/, ""))

  if (!Number.isFinite(parsedVersion)) {
    return NextResponse.json({ error: "Invalid scene version." }, { status: 400 })
  }

  const scene = getPublishedSceneVersion(sceneId, parsedVersion)

  if (!scene) {
    return NextResponse.json({ error: "Scene not found." }, { status: 404 })
  }

  return NextResponse.json(scene)
}
