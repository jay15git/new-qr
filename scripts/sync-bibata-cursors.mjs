#!/usr/bin/env node
/**
 * Sync Bibata Modern (Ice) SVG cursors into public/cursors/bibata-modern/.
 * Source: https://github.com/ful1e5/Bibata_Cursor (MIT)
 *
 * Run: node scripts/sync-bibata-cursors.mjs
 */

import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execSync } from "node:child_process"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")
const outDir = path.join(repoRoot, "public/cursors/bibata-modern")
const cloneDir = path.join(repoRoot, ".cache/bibata-cursor")
const repoUrl = "https://github.com/ful1e5/Bibata_Cursor.git"
const renderSize = 20
const viewBoxSize = 256
const scale = renderSize / viewBoxSize

const colors = [
  { match: "#00FF00", replace: "#FFFFFF" },
  { match: "#0000FF", replace: "#000000" },
  { match: "#FF0000", replace: "#FFFFFF" },
]

/** Bibata source file → web filename. Hotspots from configs/normal/x.build.toml @ 256px. */
const cursorMap = [
  { out: "default.svg", src: "svg/modern/left_ptr.svg", x: 55, y: 17 },
  { out: "pointer.svg", src: "svg/modern/hand2.svg", x: 114, y: 18 },
  { out: "text.svg", src: "svg/modern/xterm.svg", x: 128, y: 128 },
  { out: "openhand.svg", src: "svg/modern/hand1.svg", x: 144, y: 79 },
  { out: "closedhand.svg", src: "svg/modern/grabbing.svg", x: 128, y: 66 },
  { out: "dnd-move.svg", src: "svg/modern/move.svg", x: 128, y: 128 },
  { out: "not-allowed.svg", src: "svg/modern/crossed_circle.svg", x: 128, y: 128 },
  { out: "crosshair.svg", src: "svg/modern/crosshair.svg", x: 128, y: 128 },
  { out: "help.svg", src: "svg/modern/question_arrow.svg", x: 42, y: 86 },
  { out: "col-resize.svg", src: "svg/modern/sb_h_double_arrow.svg", x: 128, y: 128 },
  { out: "row-resize.svg", src: "svg/modern/sb_v_double_arrow.svg", x: 128, y: 128 },
  { out: "size_hor.svg", src: "svg/modern/sb_h_double_arrow.svg", x: 128, y: 128 },
  { out: "size_ver.svg", src: "svg/modern/sb_v_double_arrow.svg", x: 128, y: 128 },
  { out: "size_bdiag.svg", src: "svg/modern/fd_double_arrow.svg", x: 128, y: 128 },
  { out: "size_fdiag.svg", src: "svg/modern/bd_double_arrow.svg", x: 128, y: 128 },
  { out: "copy.svg", src: "svg/modern/copy.svg", x: 55, y: 17 },
  { out: "alias.svg", src: "svg/modern/dnd-link.svg", x: 100, y: 65 },
  { out: "zoom-in.svg", src: "svg/modern/zoom-in.svg", x: 116, y: 116 },
  { out: "zoom-out.svg", src: "svg/modern/zoom-out.svg", x: 116, y: 116 },
  { out: "all-scroll.svg", src: "svg/modern/move.svg", x: 128, y: 128 },
  { out: "no-drop.svg", src: "svg/modern/dnd_no_drop.svg", x: 100, y: 65 },
  { out: "wait.svg", src: "svg/groups/shared/wait/wait-01.svg", x: 128, y: 128 },
  { out: "progress.svg", src: "svg/groups/modern/left_ptr_watch/left_ptr_watch-01.svg", x: 55, y: 17 },
]

function hotspot(x, y) {
  return `${Math.round(x * scale)} ${Math.round(y * scale)}`
}

async function ensureRepo() {
  try {
    await readFile(path.join(cloneDir, "svg/modern/left_ptr.svg"))
  } catch {
    await mkdir(path.dirname(cloneDir), { recursive: true })
    execSync(`git clone --depth 1 ${repoUrl} ${cloneDir}`, { stdio: "inherit" })
  }
}

async function resolveSvg(relativePath) {
  let current = path.join(cloneDir, relativePath)
  for (let depth = 0; depth < 8; depth += 1) {
    const raw = (await readFile(current, "utf8")).trim()
    if (raw.startsWith("<svg")) {
      return raw
    }
    if (raw.startsWith("../")) {
      current = path.resolve(path.dirname(current), raw)
      continue
    }
    throw new Error(`Unrecognized SVG reference at ${relativePath}: ${raw.slice(0, 80)}`)
  }
  throw new Error(`Symlink depth exceeded for ${relativePath}`)
}

function paintSvg(svg) {
  let painted = svg
  for (const { match, replace } of colors) {
    painted = painted.replaceAll(match, replace)
  }
  return painted.replace(
    /<svg([^>]*)\bwidth="[^"]*"([^>]*)\bheight="[^"]*"/,
    `<svg$1width="${renderSize}"$2height="${renderSize}"`,
  )
}

async function main() {
  await ensureRepo()
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  const hotspots = {}
  const written = new Set()

  for (const entry of cursorMap) {
    const svg = paintSvg(await resolveSvg(entry.src))
    const outPath = path.join(outDir, entry.out)
    if (!written.has(entry.out)) {
      await writeFile(outPath, `${svg}\n`, "utf8")
      written.add(entry.out)
    }
    hotspots[entry.out.replace(/\.svg$/, "")] = hotspot(entry.x, entry.y)
  }

  await writeFile(
    path.join(outDir, "hotspots.json"),
    `${JSON.stringify({ renderSize, theme: "Bibata-Modern-Ice", hotspots }, null, 2)}\n`,
    "utf8",
  )

  const frames = await readdir(path.join(cloneDir, "svg/groups/shared/wait")).catch(() => [])
  console.log(`Wrote ${written.size} SVGs to public/cursors/bibata-modern/`)
  console.log(`Wait frames in upstream: ${frames.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
