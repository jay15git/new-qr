---
target: /desktop
total_score: 22
p0_count: 0
p1_count: 2
timestamp: 2026-06-02T14-11-06Z
slug: app-desktop-page-tsx
---
**Design Health Score**

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Selection handles, resize value, active content type, and validity are visible. Theme state is less clear because dark is the default while light is the intended source direction. |
| 2 | Match System / Real World | 2 | The product wants an industrial drafting surface, but the shell reads like generic dark glass design software. |
| 3 | User Control and Freedom | 3 | Canvas zoom, reset, undo/redo, layer actions, content reset, and theme toggle exist. Disabled undo/redo are visible. |
| 4 | Consistency and Standards | 2 | Controls share a vocabulary, but the vocabulary conflicts with the documented design system: rounded glass panels, soft shadows, and pill-like controls. |
| 5 | Error Prevention | 2 | Payload validation exists, but QR scan safety/readability is not surfaced strongly enough for a heavily stylized QR. |
| 6 | Recognition Rather Than Recall | 2 | Icon-only vertical navigation depends on tooltip discovery. The inspector helps after selection, but tool groups are not self-evident at a glance. |
| 7 | Flexibility and Efficiency | 3 | Dense tool access and canvas controls support power use, but keyboard paths are not visible in the live surface. |
| 8 | Aesthetic and Minimalist Design | 2 | The page is visually coherent, but over-soft glass, large radii, and heavy shadow mass fight the drafting-tool brief. |
| 9 | Error Recovery | 2 | Reset Content and Reset defaults exist. There is no visible recovery path for invalid/scanning-risk states. |
| 10 | Help and Documentation | 1 | Tooltips are present, but there is no inline help for QR content choice, scan quality, or export readiness. |
| **Total** | | **22/40** | **Usable prototype, but not yet aligned to product identity** |

**Anti-Patterns Verdict**

**LLM assessment**: This does not read as careless AI output; it has real product work in it. The problem is a register mismatch. The live default looks like a polished dark glass creative app: floating soft panels, translucent black, rounded 24px shells, glow-like shadow mass, and pill icon buttons. That directly contradicts the project brief: light industrial drafting tool, monochrome field, sharp geometry, structural linework, dense black active states, no soft cards, no rounded pills, no glass.

The strongest AI-slop tell is not layout sameness. It is aesthetic drift: the code has a documented identity, but `/desktop` falls back to a saturated 2026 tool trope, dark translucent chrome.

**Deterministic scan**: `detect.mjs --json app/desktop/page.tsx components/desktop components/new/drafting-surface.tsx` returned `[]`. No bundled detector findings.

The detector missed the main issue because it is contextual: glass and roundness are not always wrong, but they are wrong for this product brief.

**Visual overlays**: No reliable user-visible overlay is available. Browser preflight attempted to mutate `document.title` and inject a script; the Browser runtime exposed the page scope as read-only and returned `Cannot set property title... which has only a getter`. Fallback signal used: live screenshots plus DOM/source inspection.

**Overall Impression**

The page is close to being a strong tool surface, but it is wearing the wrong material system. In dark mode it feels like a generic design-app HUD. In light mode it moves closer to the intended drafting direction, but still keeps the same soft glass panels and large rounded shells. The single biggest opportunity: make light the default and replace glassy floating chrome with printed, mechanical, high-contrast drafting controls.

**What's Working**

1. **The core canvas composition is strong**. The QR card is centered with direct manipulation handles, resize affordances, rotation, and a compact action toolbar. Users can see what is selected and what they can manipulate.

2. **The left tool rail plus inspector model is appropriate**. Dense icon navigation and a contextual inspector fit a creation tool better than a page-based form.

3. **The content inspector has enough structure**. QR type, category filter, search, selected content mode, validity, payload, encoded value, and reset are all present. The surface is functional, not just decorative.

**Priority Issues**

**[P1] Default theme contradicts product direction**

**Why it matters**: PRODUCT.md says light mode is the source of truth. The actual `/desktop` first viewport defaults to a dark glass shell. First impression sets the product identity, and right now it says "generic dark creative app" instead of "industrial drafting QR surface."

**Fix**: Change `DesktopWorkspace` default theme from `"dark"` to `"light"`. Align `app/desktop/page.tsx` shell with the light surface instead of hardcoding `bg-[#07080a] text-white`. Keep dark as an optional mode only after light has been tightened.

**Suggested command**: `$impeccable polish /desktop`

**[P1] Toolbar material system is too soft and glassy**

**Why it matters**: The nav, inspector, theme toggle, resize toolbar, and text/action bars use translucent fills, `backdrop-blur-2xl`, 24px radii, and 36-65px blur shadows. That creates atmosphere, not mechanical structure. It also violates the project's stated bans: avoid soft cards, rounded pills, glass, and generic dashboard chrome.

**Fix**: Replace the glass vocabulary with a drafting vocabulary: opaque light surfaces or transparent printed panels, 1px structural borders, tighter radii around 8-12px, hard-edged or short shadows, clear separators, dense black active states. Remove blur on default panels. Use linework and alignment to show layers.

**Suggested command**: `$impeccable polish /desktop`

**[P2] Tool discovery depends too much on icon memory**

**Why it matters**: The vertical rail has thirteen icon-only tools. Tooltips help, but first-time users must hover to understand the tool model. This is acceptable for expert tools only after the grouping is visually legible.

**Fix**: Make groups visibly structural, not just separated by faint 1px lines. Use small group brackets, divider labels on hover/expanded state, or a rail mode that reveals names when inspector is closed. Keep icon buttons, but make tool grouping more self-evident.

**Suggested command**: `$impeccable clarify /desktop`

**[P2] QR scan reliability is under-communicated**

**Why it matters**: The visible QR is heavily stylized: heart dots, shaped corners, yellow background, white decorative blob, and overlapping text below. It may be valid, but users making QR codes need confidence that styling has not harmed scan quality.

**Fix**: Surface a scan-readiness indicator near the canvas or export controls, not only a generic content validity badge. Distinguish payload validity from scan/design safety. Give direct feedback when dot style, contrast, logo, shape, or error correction creates risk.

**Suggested command**: `$impeccable harden /desktop`

**[P3] Light mode improves direction but not identity**

**Why it matters**: The light screenshot is more on-brief, but the components are still glass cards: washed translucent panels, blurred background, and soft large shadows. It feels like the dark mode was inverted, not designed as the primary mode.

**Fix**: Treat light mode as the canonical design. Tune controls for light first: off-white/chrome panels, black selected states, charcoal text, subtle drafted grid/linework, sharper frames, and no atmospheric blur.

**Suggested command**: `$impeccable colorize /desktop`

**Persona Red Flags**

**Jordan (First-Timer QR Creator)**: Jordan sees thirteen icon-only tools immediately. "Content" is open, but the distinction between payload validity and QR scan readiness is unclear. They may assume the visible green "Valid" means the final QR is safe to scan, even though styling choices can still create scanning risk.

**Alex (Power User / Designer)**: Alex benefits from dense tools and canvas handles, but the interface feels more like a generic dark HUD than a precise drafting surface. The soft panels and pill buttons reduce the sense of precision. Keyboard or quick-command affordances are not visible.

**Print/Brand Operator**: This user cares about export confidence. They can reach export from the rail, but the main canvas gives no persistent print/readability status. The highly stylized QR needs stronger assurance before download.

**Project-specific Normal User**: This user wants a usable visual asset, not a dense enterprise console. The canvas succeeds; the dark atmospheric shell makes the task feel more advanced than necessary. Light default would reduce intimidation and match the documented product stance.

**Minor Observations**

- `app/desktop/page.tsx` hardcodes dark shell classes at line 22.
- `components/desktop/desktop-workspace.tsx` defaults `desktopTheme` to `"dark"` at line 16.
- Light mode CSS still uses `rgba(255,255,255,0.72)` plus `0 24px 64px` shadows at lines 96-99 and 139-143.
- The toolbar and inspector use `rounded-[24px]` at `desktop-toolbar-prototype.tsx` lines 1042 and 1093.
- The theme toggle remains a round floating pill. It works, but it is off-register for the mechanical system.
- The browser role click on the theme toggle timed out, while coordinate click worked. Worth rechecking interaction reliability after polish.

**Questions to Consider**

- What if `/desktop` always opened in the light drafting surface, and dark mode became a secondary inspection mode?
- What if active tools became dense black mechanical blocks instead of translucent glowing circles?
- What if QR validity were split into two statuses: content valid and scan safe?
- What if the inspector looked attached to the drafting surface through linework, not floating above it through blur?
