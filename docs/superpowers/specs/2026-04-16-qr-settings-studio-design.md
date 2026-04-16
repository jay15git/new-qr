# QR Settings Studio Design

## Summary

Redesign the QR settings workspace as a premium split-studio editor that preserves the full existing control surface while making the experience feel intuitive for mixed-skill users. The new layout should replace the current stacked-card settings form with a three-zone composition: section navigation on the left, a stable live preview in the center, and a focused control panel on the right. The first design deliverable is a high-fidelity Pencil concept for desktop only.

## Goals

- Make the QR settings page feel like a modern creative tool instead of a long form.
- Preserve every existing QR configuration capability currently exposed in `components/qr/qr-control-sections.tsx`.
- Support a mixed audience: approachable for first-time users, but efficient for users who want precise control.
- Use a premium editorial visual language rather than generic SaaS dashboard styling.
- Keep the preview visually central so changes are easy to understand.
- Produce a focused Pencil design artifact that can be reviewed before implementation.

## Non-Goals

- No homepage input redesign in this phase.
- No mobile design pass in this phase.
- No implementation of the new settings layout in React yet.
- No exhaustive state coverage for every dropdown, hover state, or export variant in the first design pass.
- No changes to the underlying QR generation behavior or state model.

## Current Context

- The existing `/settings` route renders `QrStudio` inside the current page shell.
- `components/qr/qr-control-sections.tsx` currently exposes six stacked card sections: `Content`, `Dots`, `Corners`, `Background`, `Logo`, and `QR settings`.
- `components/qr/qr-studio-state.ts` defines the full editable state, including content, sizing, gradients, logo behavior, and encoding options.
- The current UI is functionally complete, but the interaction model is a vertical form stack rather than a focused creative workspace.
- The homepage input/search flow will eventually feed into this editor, but that entry experience is out of scope for this design phase.

## Chosen Approach

Use a split creative studio layout with a strong editorial aesthetic:

1. A persistent left rail provides orientation and section switching.
2. A large center stage presents the QR preview as the primary object being crafted.
3. A right-side control panel displays the active section's controls only, using progressive disclosure for advanced options.

This approach creates a clearer editing workflow than the current stacked cards, scales cleanly to the existing control set, and avoids hiding advanced functionality behind a separate mode.

## Alternatives Considered

### 1. Editorial Canvas

This would emphasize a highly art-directed composition with less tool-like structure. It is visually strong, but it is slower for users who want to move between settings quickly.

### 2. Split Creative Studio

This is the selected approach. It balances clarity, power, and premium presentation without turning the page into a dense workstation.

### 3. Progressive Atelier

This would reveal controls in sequence below the preview. It is friendly for beginners, but it adds friction for users who want direct access to deeper settings and makes the page less predictable as a reusable workspace.

## Audience And UX Positioning

The page is for a mixed audience:

- users who want a polished QR code without understanding the rendering internals
- users who want direct access to gradients, logo behavior, corner styling, and encoding controls

The experience should therefore feel simple first, but not simplified. Basic decisions should read clearly at a glance, while advanced controls remain available in place rather than hidden in a separate advanced screen.

## Layout Design

### Left Rail

The left rail acts as a navigation and status column.

- It lists the workspace sections in editing order.
- It provides a clear active state.
- It can surface subtle configured-state indicators when a section differs from defaults.
- It should be narrow and quiet, giving orientation without competing with the preview.

Recommended navigation labels:

- `Content`
- `Style`
- `Corners`
- `Background`
- `Logo`
- `Encoding`

`Style` replaces the current `Dots` label in navigation because it is more intuitive. `Encoding` replaces `QR settings` for the same reason.

### Center Stage

The center column is the visual anchor of the page.

- It contains the live QR preview.
- The preview should be large, stable, and framed as the object being designed.
- Export and reset actions should live near the preview rather than inside the form panel.
- Lightweight metadata such as current size or export format should sit beneath the preview in a subdued secondary row.

This zone should remain visually stable as the user switches settings sections so the page feels continuous.

### Right Panel

The right panel is the active editing surface.

- It displays only the selected section's controls.
- It begins with a section heading and a short description.
- It uses grouped rows and inset subsections instead of repeated full cards.
- It uses progressive disclosure so primary controls are visible first and advanced controls expand within the same panel.

## Interaction Model

The page should use focused editing rather than exposing every control at once.

- Clicking a section in the left rail updates the right panel.
- The center preview remains fixed during section changes.
- The default section on load should be `Content`.
- The section order should follow the natural creative sequence:
  1. `Content`
  2. `Style`
  3. `Corners`
  4. `Background`
  5. `Logo`
  6. `Encoding`

This order mirrors how most users think: what the QR encodes, how it looks, how it is branded, and finally how it is technically encoded.

### Progressive Disclosure Rules

- Show 2-4 primary decisions at the top of each section.
- Keep advanced controls in compact subsections below the primary ones.
- Treat technical or rare options with less visual emphasis.
- Keep the right panel legible without making users scroll through unrelated controls.

## Visual Direction

The visual language should be editorial-premium, not dashboard-premium.

- Background: warm neutral or stone-tinted off-white with subtle tonal depth
- Panels: quiet paper-like surfaces with hairline borders
- Accent color: deep, muted, and deliberate rather than bright or synthetic
- Typography: refined, hierarchy-led, with strong section titling and restrained field text
- Shape language: medium radii, architectural rather than playful
- Dividers: subtle rules and spacing rhythm instead of heavy box separation

The design should avoid:

- stacked generic cards
- loud gradients used decoratively
- purple/cyan AI-tool aesthetics
- excessive icon decoration
- equal visual weight for every setting

## Control Mapping

The design must preserve the current editable features while reorganizing them.

### Content

Maps the current base QR object setup:

- text or URL
- render type
- width
- height
- outer margin

This section should open by default.

### Style

Maps the current dot styling controls:

- dot style
- solid color
- round dot sizes
- dot gradient toggle
- gradient type
- gradient rotation
- gradient color stops and offsets

This is the most expressive section and should feel visually rich without becoming busy.

### Corners

Maps the two-part corner configuration:

- corner square style
- corner square color
- corner square gradient controls
- corner dot style
- corner dot color
- corner dot gradient controls

Within the panel, separate this into two clearly named subgroups so users understand the difference between the outer frames and inner centers.

### Background

Maps the current background treatments:

- transparent background
- background color
- background gradient toggle
- background gradient controls

This section should remain compact and visually quiet.

### Logo

Maps the logo source and image treatment controls:

- logo source mode
- remote logo URL or upload area
- remove logo action
- logo size
- logo margin
- hide background dots
- save embedded image as blob

This section should receive stronger layout attention because upload state, removal, and compatibility decisions are easier to understand through composition than through plain fields.

### Encoding

Maps the current technical QR options:

- mode
- type number
- error correction level

This section should be visually quieter and clearly read as advanced or technical.

## Pencil Deliverable Scope

The first Pencil design should be a high-fidelity desktop concept focused on the settings workspace only.

It should include:

- the full page shell
- the left rail with section states
- the center preview stage with nearby actions
- the right panel structure
- a fully designed `Content` panel state
- a fully designed `Style` panel state
- a fully designed `Logo` panel state
- lightweight representation of the remaining sections so the full system is visible

It should also include two key micro-states:

- `Style` with gradient controls expanded
- `Logo` with an upload state populated

These are the most interaction-sensitive parts of the current settings surface and are enough to validate the design system before broader expansion.

## Testing And Validation Strategy

This phase is design-only, so validation is based on review rather than runtime behavior.

The Pencil design should be reviewed for:

- clarity of the section model
- strength of the center-preview-first workflow
- visual distinctiveness
- preservation of the existing control set
- whether the page feels intuitive for both new and advanced users

No React implementation, linting, or build verification is part of this phase.

## Risks And Mitigations

### Risk: the design becomes a prettier version of the current stacked form

Mitigation: enforce the three-zone structure and move to single-section editing in the right panel rather than preserving all sections in one scroll.

### Risk: the layout feels too tool-like and loses warmth

Mitigation: use editorial spacing, restrained surfaces, and typography-led hierarchy rather than dense app chrome.

### Risk: advanced controls become hard to discover

Mitigation: keep them in the active section panel with clear subgrouping and progressive disclosure, rather than burying them in a separate mode.

### Risk: the first Pencil pass becomes too broad to evaluate cleanly

Mitigation: keep the first deliverable desktop-only and focus on the highest-value panel states and micro-states.

## Success Criteria

- The settings workspace reads as a premium creative studio rather than a settings form.
- The layout clearly separates navigation, preview, and active controls.
- All existing settings categories remain represented in the design.
- The design feels approachable without removing advanced control.
- The Pencil artifact is specific enough to guide later UI implementation.
