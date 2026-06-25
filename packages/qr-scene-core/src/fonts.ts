import type { SceneDocumentV1, SceneFont } from "@new-qr/qr-scene-schema"

export function collectSceneFonts(scene: SceneDocumentV1): SceneFont[] {
  return scene.fonts
}

export function buildFontFaceCss(fonts: SceneFont[]) {
  return fonts
    .filter((font) => font.url)
    .map(
      (font) => `@font-face {
  font-family: "${font.family}";
  src: url("${font.url}");
  font-weight: ${font.weight ?? "normal"};
  font-style: ${font.style ?? "normal"};
}`,
    )
    .join("\n")
}
