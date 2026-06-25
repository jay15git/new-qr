export type ShaderSnapshotTarget = {
  canvas: HTMLCanvasElement
  width: number
  height: number
}

export async function captureShaderCanvasSnapshot(
  target: ShaderSnapshotTarget,
  mimeType = "image/png",
  quality = 0.92,
) {
  return target.canvas.toDataURL(mimeType, quality)
}

export function injectShaderSnapshotIntoSvg(svg: string, snapshotUrl: string, width: number, height: number) {
  const imageTag = `<image href="${snapshotUrl.replaceAll('"', "&quot;")}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />`

  if (svg.includes("</svg>")) {
    return svg.replace("</svg>", `${imageTag}</svg>`)
  }

  return svg
}
