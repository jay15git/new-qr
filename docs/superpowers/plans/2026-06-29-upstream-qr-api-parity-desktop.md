# Upstream QR API Parity (Desktop) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every gap between vendored `ReactQRCode` / portable `NewQrCodeProps` and the `/desktop` studio, with controls in the desktop settings toolbar (`FloatingToolbar` inspectors wired through `WorkspaceSurface`).

**Architecture:** Extend canonical `QrStudioState` first, wire both render adapters (`toPortableQrConfig`, `toReactQrCodeProps`), then expose desktop-local settings types + inspector UI. Package `map-props.ts` already maps most portable fields — app state + UI are the bottleneck. Keep one render truth: `draftingStudioState` in `WorkspaceSurface` must include every new field.

**Tech Stack:** Next.js 16, React 19, `@new-qr/qr`, vendored `ReactQRCode`, Vitest 4, desktop shell (`FloatingToolbar`, `WorkspaceSurface`).

---

## Gap inventory (what this plan closes)

| Area | Upstream / portable | App today |
|------|---------------------|-----------|
| ECC boost | `boostLevel` | Hardcoded `true` |
| Module size | `dataModulesSettings.size` → `moduleSize` | Missing |
| Module line width | `dataModulesSettings.lineWidth` → `moduleLineWidth` | Missing |
| Uniform random module size | `randomSize` → `moduleRoundSize` | Default only; no desktop UI |
| Logo opacity | `imageSettings.opacity` | Missing |
| Logo pixel size | `width` / `height` | Ratio only (`imageSize`) |
| Logo position | `x` / `y` | Missing |
| Logo margin UI | N/A upstream | UI exists, **not wired** to renderer |
| Cross-origin | `anonymous` \| `use-credentials` \| `""` | Locked to `anonymous` |
| ARIA label | `svgProps['aria-label']` → `ariaLabel` | Missing |
| Multi-segment value | `value: string[]` | Single string |
| Unified gradient | upstream `gradient` on modules + finders | Split dot/finder gradients only |
| Imperative download | `ref.download()` | Export popover only (acceptable if documented) |

---

## File map

| File | Responsibility |
|------|----------------|
| `features/qr-code/model/state.ts` | Canonical `QrStudioState` + defaults + clamp helpers |
| `features/qr-code/adapters/portable-config.ts` | Studio → `NewQrCodeProps` |
| `features/qr-code/adapters/react-qr-adapter.ts` | Studio → `ReactQRCodeProps` (live canvas) |
| `features/qr-code/adapters/portable-config.test.ts` | Portable mapping tests |
| `features/qr-code/model/state.test.ts` | Adapter + default tests |
| `features/desktop-shell/components/FloatingToolbar.tsx` | Desktop settings types + inspector UI |
| `features/desktop-shell/components/FloatingToolbar.test.tsx` | Inspector interaction tests |
| `features/workspace/components/WorkspaceSurface.tsx` | Desktop settings ↔ `draftingStudioState` sync |
| `features/workspace/components/WorkspaceSurface.test.tsx` | End-to-end desktop wiring tests |
| `features/workspace/model/document.ts` | Persist/parse new fields (spread merge) |
| `packages/qr/src/types.ts` | Optional: `gradientMode`, export types |
| `packages/qr/src/core/map-props.ts` | Optional unified-gradient branch |
| `features/studio-hub/model/templates.ts` | Template defaults for new fields |

---

## Phase 1 — State model & adapters

### Task 1: Extend `QrStudioState`

**Files:**
- Modify: `features/qr-code/model/state.ts`
- Test: `features/qr-code/model/state.test.ts`

- [ ] **Step 1: Write failing tests for new defaults**

Add to `features/qr-code/model/state.test.ts`:

```typescript
it("defaults boostLevel to true and exposes module tuning fields", () => {
  const state = createDefaultQrStudioState()
  expect(state.qrOptions.boostLevel).toBe(true)
  expect(state.dataModulesSettings.moduleSize).toBeUndefined()
  expect(state.dataModulesSettings.lineWidth).toBeUndefined()
  expect(state.dataModulesSettings.roundSize).toBe(true)
  expect(state.ariaLabel).toBeUndefined()
  expect(state.imageOptions.opacity).toBe(1)
  expect(state.imageOptions.crossOrigin).toBe("anonymous")
  expect(state.imageOptions.logoPositionMode).toBe("center")
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm exec vitest run features/qr-code/model/state.test.ts -t "defaults boostLevel"`

- [ ] **Step 3: Extend types and defaults in `state.ts`**

```typescript
// qrOptions
export type QrStudioState["qrOptions"] = {
  typeNumber: QrTypeNumber
  mode: QrMode
  errorCorrectionLevel: QrErrorCorrectionLevel
  boostLevel: boolean  // NEW
}

// dataModulesSettings
export type QrStudioState["dataModulesSettings"] = {
  type: StudioDataModulesStyle
  color: string
  roundSize: boolean
  moduleSize?: number      // NEW 0.75–1
  lineWidth?: number       // NEW 0.25–1
}

// imageOptions
export type QrStudioState["imageOptions"] = {
  hideBackgroundDots: boolean
  imageSize: number
  margin: number
  saveAsBlob: boolean
  crossOrigin: CrossOrigin // widen from literal "anonymous"
  opacity: number          // NEW 0–1
  widthPx?: number         // NEW optional override
  heightPx?: number        // NEW optional override
  logoPositionMode: "center" | "custom"  // NEW
  x?: number               // NEW px offset
  y?: number               // NEW px offset
}

// top-level
ariaLabel?: string         // NEW
valueSegments?: string[]  // NEW advanced encoding
gradientLinkMode?: "split" | "unified"  // NEW
```

Add clamp helpers:

```typescript
export const QR_MODULE_SIZE_MIN = 0.75
export const QR_MODULE_SIZE_MAX = 1
export const QR_MODULE_LINE_WIDTH_MIN = 0.25
export const QR_MODULE_LINE_WIDTH_MAX = 1
export const QR_LOGO_OPACITY_MIN = 0
export const QR_LOGO_OPACITY_MAX = 1

export function clampModuleSize(value: number) {
  return Math.min(QR_MODULE_SIZE_MAX, Math.max(QR_MODULE_SIZE_MIN, value))
}
```

Update `createDefaultQrStudioState()` with `boostLevel: true`, `opacity: 1`, `logoPositionMode: "center"`, `gradientLinkMode: "split"`.

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm exec vitest run features/qr-code/model/state.test.ts`

- [ ] **Step 5: Commit**

```bash
git add features/qr-code/model/state.ts features/qr-code/model/state.test.ts
git commit -m "feat(qr): extend studio state for upstream API parity fields"
```

---

### Task 2: Wire portable adapter

**Files:**
- Modify: `features/qr-code/adapters/portable-config.ts`
- Test: `features/qr-code/adapters/portable-config.test.ts`

- [ ] **Step 1: Write failing mapping tests**

```typescript
it("maps boostLevel, module tuning, logo advanced fields, and ariaLabel", () => {
  const state = createDefaultQrStudioState()
  state.qrOptions.boostLevel = false
  state.dataModulesSettings.moduleSize = 0.9
  state.dataModulesSettings.lineWidth = 0.75
  state.ariaLabel = "Scan to pay"
  state.imageOptions.opacity = 0.8
  state.imageOptions.widthPx = 48
  state.imageOptions.heightPx = 32
  state.imageOptions.x = 10
  state.imageOptions.y = 12
  state.logo = { source: "url", value: "https://example.com/logo.png" }

  expect(toPortableQrConfig(state)).toMatchObject({
    boostLevel: false,
    moduleSize: 0.9,
    moduleLineWidth: 0.75,
    ariaLabel: "Scan to pay",
    logo: {
      src: "https://example.com/logo.png",
      opacity: 0.8,
      width: 48,
      height: 32,
      x: 10,
      y: 12,
    },
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm exec vitest run features/qr-code/adapters/portable-config.test.ts -t "maps boostLevel"`

- [ ] **Step 3: Update `portable-config.ts`**

Replace hardcoded `boostLevel: true` with `state.qrOptions.boostLevel`.

Extend `mapLogo`:

```typescript
return {
  crossOrigin: state.imageOptions.crossOrigin,
  excavate: state.imageOptions.hideBackgroundDots,
  size: state.imageOptions.imageSize,
  src,
  ...(state.imageOptions.opacity !== 1 ? { opacity: state.imageOptions.opacity } : {}),
  ...(state.imageOptions.widthPx !== undefined ? { width: state.imageOptions.widthPx } : {}),
  ...(state.imageOptions.heightPx !== undefined ? { height: state.imageOptions.heightPx } : {}),
  ...(state.imageOptions.logoPositionMode === "custom" && state.imageOptions.x !== undefined
    ? { x: state.imageOptions.x } : {}),
  ...(state.imageOptions.logoPositionMode === "custom" && state.imageOptions.y !== undefined
    ? { y: state.imageOptions.y } : {}),
}
```

Add to return object:

```typescript
boostLevel: state.qrOptions.boostLevel,
moduleSize: state.dataModulesSettings.moduleSize,
moduleLineWidth: state.dataModulesSettings.lineWidth,
moduleRoundSize: state.dataModulesSettings.roundSize,
ariaLabel: state.ariaLabel,
value: state.valueSegments?.length ? state.valueSegments : state.data.trim(),
```

For `gradientLinkMode === "unified"` when dots are gradient: set portable `gradient` and disable separate finder gradients in portable output (finder colors stay solid upstream uses one gradient — handled in Task 4 package branch).

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

---

### Task 3: Wire live-canvas adapter

**Files:**
- Modify: `features/qr-code/adapters/react-qr-adapter.ts`
- Test: `features/qr-code/model/state.test.ts` (existing adapter tests)

- [ ] **Step 1: Write failing test**

```typescript
it("passes boostLevel, moduleSize, lineWidth, logo opacity, and aria-label to ReactQRCode", () => {
  const state = createDefaultQrStudioState()
  state.qrOptions.boostLevel = false
  state.dataModulesSettings.moduleSize = 0.85
  state.dataModulesSettings.lineWidth = 0.5
  state.ariaLabel = "Event ticket"
  state.imageOptions.opacity = 0.6
  state.logo = { source: "url", value: "https://example.com/logo.png" }

  const props = toReactQrCodeProps(state)
  expect(props.boostLevel).toBe(false)
  expect(props.dataModulesSettings?.size).toBe(0.85)
  expect(props.dataModulesSettings?.lineWidth).toBe(0.5)
  expect(props.svgProps?.["aria-label"]).toBe("Event ticket")
  expect(props.imageSettings?.opacity).toBe(0.6)
})
```

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Update `react-qr-adapter.ts`**

```typescript
boostLevel: state.qrOptions.boostLevel,
dataModulesSettings: {
  color: getDotsColor(state),
  randomSize: !state.dataModulesSettings.roundSize,
  style: state.dataModulesSettings.type,
  ...(state.dataModulesSettings.moduleSize !== undefined
    ? { size: state.dataModulesSettings.moduleSize } : {}),
  ...(state.dataModulesSettings.lineWidth !== undefined
    ? { lineWidth: state.dataModulesSettings.lineWidth } : {}),
},
imageSettings: logoImage ? {
  // existing fields...
  opacity: state.imageOptions.opacity,
  ...(state.imageOptions.widthPx !== undefined ? { width: state.imageOptions.widthPx } : {}),
  ...(state.imageOptions.heightPx !== undefined ? { height: state.imageOptions.heightPx } : {}),
  ...(state.imageOptions.logoPositionMode === "custom" && state.imageOptions.x !== undefined
    ? { x: state.imageOptions.x } : {}),
  ...(state.imageOptions.logoPositionMode === "custom" && state.imageOptions.y !== undefined
    ? { y: state.imageOptions.y } : {}),
} : undefined,
svgProps: {
  ...(state.ariaLabel ? { "aria-label": state.ariaLabel } : {}),
  // keep existing borderRadius styles
},
```

When `gradientLinkMode === "unified"` and dots gradient enabled: pass `gradient: buildGradient(state.dataModulesGradient)` and omit per-layer dot color (mirror upstream).

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

---

### Task 4 (optional package): Unified gradient in `map-props`

**Files:**
- Modify: `packages/qr/src/types.ts`
- Modify: `packages/qr/src/core/map-props.ts`
- Test: `packages/qr/src/core/map-props.test.ts`

Skip if you accept split-gradient-only on portable export. Include for full upstream parity.

- [ ] **Step 1: Add `gradientMode?: "split" | "unified"` to `NewQrCodeProps`**

- [ ] **Step 2: Test unified branch**

```typescript
it("maps unified gradientMode to upstream gradient prop", () => {
  const result = portablePropsToReactQrProps({
    value: "x",
    gradientMode: "unified",
    colorMode: "gradient",
    gradient: {
      type: "linear",
      rotation: 0,
      stops: [{ offset: 0, color: "#111" }, { offset: 1, color: "#999" }],
    },
    foreground: "#111",
  })
  expect(result.gradient).toMatchObject({ type: "linear" })
  expect(result.dataModulesSettings?.color).toBeUndefined()
})
```

- [ ] **Step 3: Implement in `map-props.ts`**

When `gradientMode === "unified"` and gradient active: set `gradient: toUpstreamGradient(...)`, clear module/finder solid colors.

- [ ] **Step 4: Run package tests**

Run: `pnpm exec vitest run packages/qr/src/core/map-props.test.ts`

- [ ] **Step 5: Commit**

---

## Phase 2 — Desktop settings UI (`/desktop`)

Desktop settings live in `FloatingToolbar` inspectors, controlled via `DesktopToolbarController` from `WorkspaceSurface`. No separate `/desktop/settings` route — the toolbar **is** the settings surface (`data-slot="desktop-layer-settings-toolbar"` on `Canvas.tsx`).

### Task 5: Extend desktop settings types

**Files:**
- Modify: `features/desktop-shell/components/FloatingToolbar.tsx`

- [ ] **Step 1: Extend types**

```typescript
export type DesktopPatternSettings = {
  // existing...
  moduleRoundSize: boolean
  moduleSize?: number
  moduleLineWidth?: number
  gradientLinkMode: "split" | "unified"
}

export type DesktopEncodingSettings = {
  errorCorrectionLevel: QrErrorCorrectionLevel
  typeNumber: QrTypeNumber
  boostLevel: boolean
  mode: QrMode                    // already in state, expose in UI
  valueSegments?: string[]        // advanced
}

export type DesktopLogoSettings = {
  // existing...
  opacity: number
  sizeMode: "ratio" | "pixels"
  widthPx?: number
  heightPx?: number
  lockAspect: boolean
  positionMode: "center" | "custom"
  offsetX: number
  offsetY: number
  crossOrigin: CrossOrigin
}

export type DesktopAccessibilitySettings = {
  ariaLabel: string
}
```

- [ ] **Step 2: Update `DEFAULT_DESKTOP_*` constants** to match `createDefaultQrStudioState()`.

- [ ] **Step 3: Extend `DesktopToolbarController`** with `accessibilitySettings`, handlers, reset callbacks.

- [ ] **Step 4: Commit**

---

### Task 6: Pattern inspector — module tuning + round size + unified gradient

**Files:**
- Modify: `features/desktop-shell/components/FloatingToolbar.tsx` (`DesktopPatternInspector`)
- Test: `features/desktop-shell/components/FloatingToolbar.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
it("exposes module size and line width sliders in pattern inspector", async () => {
  const surface = await renderFloatingToolbar({ activeTool: "pattern" })
  expect(surface.container.querySelector('[data-slot="desktop-module-size"]')).toBeTruthy()
  expect(surface.container.querySelector('[data-slot="desktop-module-line-width"]')).toBeTruthy()
  expect(surface.container.querySelector('[data-slot="desktop-module-round-size"]')).toBeTruthy()
})
```

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Add UI below module pattern grid in `DesktopPatternInspector`**

Use existing `DesktopMotionSliderRow` pattern:

| Control | data-slot | Range | Visible when |
|---------|-----------|-------|--------------|
| Module size | `desktop-module-size` | 0.75–1, step 0.05 | fillable styles (square, circle, diamond, …) |
| Line width | `desktop-module-line-width` | 0.25–1 | line/rounded/circuit-board styles |
| Uniform random size | `desktop-module-round-size` | switch | `circle` or legacy dots alias |
| Link gradients | `desktop-gradient-link-mode` | segmented split/unified | dots color mode = gradient |

Helper to show/hide sliders (mirror upstream docs):

```typescript
function supportsModuleSize(style: StudioDataModulesStyle) {
  return ["square", "pinched-square", "circle", "diamond", "heart", "star", "hashtag"].includes(style)
}
function supportsLineWidth(style: StudioDataModulesStyle) {
  return ["vertical-line", "horizontal-line", "rounded", "circuit-board"].includes(style)
}
```

- [ ] **Step 4: Run FloatingToolbar tests**

- [ ] **Step 5: Commit**

---

### Task 7: Encoding inspector — boostLevel + mode + advanced segments

**Files:**
- Modify: `features/desktop-shell/components/FloatingToolbar.tsx` (`DesktopEncodingInspector`)

- [ ] **Step 1: Add boostLevel switch**

```tsx
<DesktopInspectorSwitchRow
  checked={settings.boostLevel}
  data-slot="desktop-boost-level"
  label="Boost error correction"
  description="Raise ECC without increasing QR version when possible."
  onCheckedChange={(boostLevel) => onEncodingSettingsChange({ boostLevel })}
/>
```

- [ ] **Step 2: Add encoding mode segmented control** (Byte / Numeric / Alphanumeric / Kanji) — reuse `ControlsPanel` options from `encoding-options` if exported, or duplicate minimal list.

- [ ] **Step 3: Add collapsible “Advanced segments” `<details>`**

Textarea: one segment per line → maps to `valueSegments: string[]`. When non-empty, overrides single `data` string in adapters. Show live segment count + warning if empty lines.

- [ ] **Step 4: Test encoding inspector renders new controls**

- [ ] **Step 5: Commit**

---

### Task 8: Logo inspector — opacity, pixel size, position, crossOrigin, wire margin

**Files:**
- Modify: `features/desktop-shell/components/FloatingToolbar.tsx` (logo section ~line 2433)

- [ ] **Step 1: Fix logo margin wiring**

Decision: map `imageOptions.margin` to logo **excavation padding** via scaled offset in adapter OR remove misleading control. **Recommended:** treat margin as inner quiet zone — add `logoPadding` to state and pass as negative space in `getImageSettings` by adjusting effective logo box (document in adapter comment). Simpler interim: map margin → reduce effective `imageSize` coefficient in adapter:

```typescript
const marginFactor = 1 - coerceNumber(state.imageOptions.margin, 0, 40, 0) / qrSize
const logoSize = Math.round(qrSize * imageSize * marginFactor)
```

- [ ] **Step 2: Add logo controls**

| Control | Notes |
|---------|-------|
| Size mode | segmented `ratio` / `pixels` |
| Width / height px | two sliders when pixels mode; lock aspect toggle |
| Opacity | 0–100% slider |
| Position | segmented center / custom; X/Y px sliders when custom |
| Cross-origin | segmented: Default (omit) / Anonymous / Credentials |

- [ ] **Step 3: Write FloatingToolbar test** for logo opacity slider presence

- [ ] **Step 4: Commit**

---

### Task 9: Accessibility inspector (new tool or Content tab section)

**Files:**
- Modify: `features/desktop-shell/components/FloatingToolbar.tsx`
- Modify: `features/desktop-shell/components/FloatingToolbar.tsx` (`DESKTOP_TOOL_DEFINITIONS`)

- [ ] **Step 1: Add `ariaLabel` field under EC Content inspector** (bottom of `DesktopContentInspector`, before encoded value):

```tsx
<DesktopInspectorTextInput
  aria-label="QR code accessibility label"
  data-slot="desktop-qr-aria-label"
  label="Accessibility label"
  placeholder="QR Code"
  value={accessibilitySettings.ariaLabel}
  onChange={(e) => onAccessibilitySettingsChange({ ariaLabel: e.currentTarget.value })}
/>
<p className={DESKTOP_INSPECTOR_CAPTION_CLASS}>
  Sets SVG aria-label for screen readers. Empty uses renderer default.
</p>
```

Alternative: add under Encoding tool if Content tab is crowded.

- [ ] **Step 2: Test content inspector includes aria label input**

- [ ] **Step 3: Commit**

---

### Task 10: Wire `WorkspaceSurface` ↔ desktop settings

**Files:**
- Modify: `features/workspace/components/WorkspaceSurface.tsx`
- Test: `features/workspace/components/WorkspaceSurface.test.tsx`

This is the critical sync layer. Every new desktop field needs:
1. `useState` initializer from `DEFAULT_DRAFTING_STUDIO_STATE`
2. Entry in `desktop*Settings` object passed to toolbar
3. `updateDesktop*Settings` handler
4. Mapping inside `draftingStudioState` `useMemo`
5. `syncDrafting*` reset paths

- [ ] **Step 1: Write failing integration test**

```typescript
it("maps desktop module size to drafting studio state and rendered SVG", async () => {
  const surface = await renderWorkspaceSurface()
  // change module size slider to 0.9
  // assert draftingStudioState.dataModulesSettings.moduleSize === 0.9
  // assert exported markup reflects smaller modules (snapshot or attribute)
})
```

- [ ] **Step 2: Add state slices**

```typescript
const [selectedModuleRoundSize, setSelectedModuleRoundSize] = useState(
  DEFAULT_DRAFTING_STUDIO_STATE.dataModulesSettings.roundSize,
)
const [selectedModuleSize, setSelectedModuleSize] = useState<number | undefined>(undefined)
const [selectedModuleLineWidth, setSelectedModuleLineWidth] = useState<number | undefined>(undefined)
const [selectedBoostLevel, setSelectedBoostLevel] = useState(
  DEFAULT_DRAFTING_STUDIO_STATE.qrOptions.boostLevel,
)
const [selectedQrMode, setSelectedQrMode] = useState(DEFAULT_DRAFTING_STUDIO_STATE.qrOptions.mode)
const [selectedAriaLabel, setSelectedAriaLabel] = useState("")
const [selectedLogoOpacity, setSelectedLogoOpacity] = useState(1)
// ... etc
```

- [ ] **Step 3: Extend `draftingStudioState` useMemo**

```typescript
qrOptions: {
  ...DEFAULT_DRAFTING_STUDIO_STATE.qrOptions,
  typeNumber: selectedQrTypeNumber,
  errorCorrectionLevel: selectedQrErrorCorrectionLevel,
  boostLevel: selectedBoostLevel,
  mode: selectedQrMode,
},
dataModulesSettings: {
  ...DEFAULT_DRAFTING_STUDIO_STATE.dataModulesSettings,
  type: selectedDotType,
  color: selectedDotColor,
  roundSize: selectedModuleRoundSize,
  ...(selectedModuleSize !== undefined ? { moduleSize: selectedModuleSize } : {}),
  ...(selectedModuleLineWidth !== undefined ? { lineWidth: selectedModuleLineWidth } : {}),
},
ariaLabel: selectedAriaLabel || undefined,
imageOptions: {
  ...existing,
  opacity: selectedLogoOpacity,
  crossOrigin: selectedLogoCrossOrigin,
  logoPositionMode: selectedLogoPositionMode,
  x: selectedLogoOffsetX,
  y: selectedLogoOffsetY,
  widthPx: selectedLogoSizeMode === "pixels" ? selectedLogoWidthPx : undefined,
  heightPx: selectedLogoSizeMode === "pixels" ? selectedLogoHeightPx : undefined,
},
valueSegments: selectedValueSegments.length ? selectedValueSegments : undefined,
gradientLinkMode: selectedGradientLinkMode,
```

- [ ] **Step 4: Wire toolbar controller callbacks** (`updateDesktopPatternSettings`, `updateDesktopEncodingSettings`, `updateDesktopLogoSettings`, new accessibility handler).

- [ ] **Step 5: Update `syncDraftingFromState` / library load** to hydrate new selected* fields when opening saved designs.

- [ ] **Step 6: Run WorkspaceSurface + adapter tests**

Run: `pnpm exec vitest run features/workspace/components/WorkspaceSurface.test.tsx features/qr-code/adapters/portable-config.test.ts features/qr-code/model/state.test.ts`

- [ ] **Step 7: Commit**

---

## Phase 3 — Persistence, templates, export

### Task 11: Document parsing & templates

**Files:**
- Modify: `features/workspace/model/document.test.ts`
- Modify: `features/studio-hub/model/templates.ts`

- [ ] **Step 1: Test backward compat** — old saved JSON without new fields loads with defaults.

- [ ] **Step 2: Optionally set interesting template values** (e.g. circuit-board + lineWidth 0.5).

- [ ] **Step 3: Commit**

---

### Task 12: Codegen / portable export includes new props

**Files:**
- Modify: `packages/qr/src/core/format-props.ts`
- Test: existing codegen tests

- [ ] **Step 1: Add new keys to `formatPortableQrPropsForCodegen` entries list**

`ariaLabel`, `moduleSize`, `moduleLineWidth`, `boostLevel`, extended logo shape.

- [ ] **Step 2: Verify codegen omits defaults**

Run: `pnpm exec vitest run packages/qr/src/scene/codegen/codegen.test.ts`

- [ ] **Step 3: Commit**

---

### Task 13: Export UX note for `ref.download` parity

**Files:**
- Modify: `features/desktop-shell/components/FloatingToolbar.tsx` (export inspector copy)
- Optional: `packages/qr/README.md`

Desktop already exports SVG/PNG/JPEG via export popover — functionally equivalent to upstream `ref.download()`. No `NewQrCode` ref needed on canvas.

- [ ] **Step 1: Add caption under export target: “Matches ReactQRCode ref.download formats.”**

- [ ] **Step 2: README note** — app consumers use export; library consumers use `ReactQRCode` ref directly.

- [ ] **Step 3: Commit**

---

## Phase 4 — Verification

### Task 14: Full verification pass

- [ ] Run: `pnpm exec vitest run features/qr-code/adapters/portable-config.test.ts features/qr-code/model/state.test.ts features/qr-code/rendering/qr-svg.test.ts features/desktop-shell/components/FloatingToolbar.test.tsx features/workspace/components/WorkspaceSurface.test.tsx packages/qr/src/core/map-props.test.ts`

- [ ] Run: `pnpm exec tsc --noEmit`

- [ ] Run: `pnpm lint`

- [ ] Manual `/desktop` checklist:
  - [ ] Module size slider affects dot fill on square/circle styles
  - [ ] Line width affects circuit-board / vertical-line styles
  - [ ] Round size toggle affects circle random sizing
  - [ ] Boost level off/on changes encoded QR matrix (version/ECC)
  - [ ] Logo opacity, pixel size, custom XY position render correctly
  - [ ] Logo margin visibly affects logo footprint
  - [ ] Aria label appears on SVG (`aria-label` attr in DOM)
  - [ ] Unified gradient mode paints finders + modules same gradient
  - [ ] Advanced segments change encoded payload
  - [ ] Save → reload → all new settings restore

- [ ] Run: `pnpm build`

---

## UI placement summary (desktop toolbar tools)

| Tool tab | New controls |
|----------|--------------|
| **Content** | Accessibility label; advanced segments (or under Encoding) |
| **Pattern** | Module size, line width, uniform random size, gradient link mode |
| **Encoding** | Boost ECC, encoding mode, type number (existing) |
| **Logo** | Opacity, size mode (ratio/px), W/H, position, cross-origin, margin (wired) |
| **Export** | Doc note only |

---

## Out of scope (explicit)

- `ControlsPanel` (legacy/test-only) — desktop is canonical
- `NewQrCode` imperative ref on canvas — export popover covers download
- Mobile shell parity — separate follow-up
- Changing upstream vendor defaults (L vs Q, margin 0 vs 12) — app keeps studio defaults

---

## Suggested commit sequence

1. `feat(qr): extend studio state for upstream parity`
2. `feat(qr): wire portable and react adapters for new fields`
3. `feat(desktop): add pattern module tuning controls`
4. `feat(desktop): add encoding boost and mode controls`
5. `feat(desktop): expand logo inspector (opacity, position, crossOrigin)`
6. `feat(desktop): wire workspace surface sync for qr parity fields`
7. `docs(qr): note export parity with ReactQRCode ref.download`

---

## Self-review (spec coverage)

| Requirement | Task |
|-------------|------|
| boostLevel | 1, 3, 7, 10 |
| moduleSize / lineWidth | 1, 2, 3, 6, 10 |
| moduleRoundSize UI | 1, 6, 10 |
| logo opacity / W/H / x/y | 1, 2, 3, 8, 10 |
| logo margin wired | 8, 10 |
| crossOrigin | 1, 8, 10 |
| ariaLabel | 1, 2, 3, 9, 10 |
| value segments | 1, 2, 7, 10 |
| unified gradient | 4, 6, 10 |
| ref.download parity | 13 |
| /desktop UI | 5–10 |
| persistence | 11 |
| codegen | 12 |
