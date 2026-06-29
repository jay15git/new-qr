# @new-qr/qr

Three React component families for designed QR cards:

- **QR rendering** — `NewQrCode`
- **Paper shaders** — `PaperShaderLayer`
- **Animated QR** — `AnimatedQr`

## Install

```bash
pnpm add @new-qr/qr
```

Shader backgrounds also need Paper (emitted in copied canvas code):

```bash
pnpm add @paper-design/shaders @paper-design/shaders-react
```

## Usage

```tsx
import { NewQrCode } from "@new-qr/qr/react"
import { AnimatedQr } from "@new-qr/qr/animated"
import { PaperShaderLayer } from "@new-qr/qr/shaders"
```

Copied canvas React export uses `@new-qr/qr/react`, `@new-qr/qr/animated`, and `@paper-design/shaders-react` directly.

## Public exports

| Import | Components |
|--------|------------|
| `@new-qr/qr` | Shared types, `NewQrCode` |
| `@new-qr/qr/react` | `NewQrCode`, `QrScene`, `ReactQRCode` (upstream primitive) |
| `@new-qr/qr/shaders` | `PaperShaderLayer`, shader helpers |
| `@new-qr/qr/animated` | `AnimatedQr` |

`NewQrCode` is a flat portable API over vendored `@lglab/react-qr-code`. For full upstream parity (nested props, `ref.download`), use `ReactQRCode` from `@new-qr/qr/react`.

### Portable props (upstream-aligned)

| Portable | Upstream |
|----------|----------|
| `value` | `value` (`string \| string[]`) |
| `level` | `level` |
| `minVersion` | `minVersion` |
| `boostLevel` | `boostLevel` |
| `margin` | `marginSize` |
| `module` | `dataModulesSettings.style` |
| `moduleSize` | `dataModulesSettings.size` |
| `moduleLineWidth` | `dataModulesSettings.lineWidth` |
| `moduleRoundSize` | `!dataModulesSettings.randomSize` |
| `foreground` | `dataModulesSettings.color` |
| `finderOuter` / `finderInner` | `finderPattern*Settings.style` |
| `backgroundGradient` | `background` (gradient) |
| `logo` | `imageSettings` |
| `ariaLabel` | `svgProps['aria-label']` |

## Build

```bash
pnpm --filter @new-qr/qr build
```
