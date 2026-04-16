# QR Settings Studio Design

## Summary

Redesign the QR settings workspace as a premium, editing-first studio that preserves the full existing control surface while making the experience feel faster and more intuitive for mixed-skill users. The new layout replaces the oversized preview concept with a tighter three-zone composition: section navigation on the left, the active section content immediately beside it, and a compact sticky live preview on the far right. The first design deliverable is a high-fidelity Pencil concept for desktop only.

## Goals

- Make the QR settings page feel like a modern creative tool instead of a long form.
- Preserve every existing QR configuration capability currently exposed in `components/qr/qr-control-sections.tsx`.
- Support a mixed audience: approachable for first-time users, but efficient for users who want precise control.
- Use a premium editorial visual language rather than generic SaaS dashboard styling.
- Keep the preview persistently visible without allowing it to dominate the page.
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
- The current UI is functionally complete, but the interaction model is still unresolved: the original concept over-allocated width to the preview and pushed the active controls too far away from the section navigation.
- The homepage input/search flow will eventually feed into this editor, but that entry experience is out of scope for this design phase.

## Chosen Approach

Use an editing-first studio layout with a strong editorial aesthetic:

1. A compact left rail provides orientation and section switching.
2. The active section content sits directly beside the rail so changing sections feels immediate.
3. A compact sticky preview sits on the far right with export/reset actions attached to it.

This approach creates a faster editing workflow than both the original stacked cards and the oversized-preview concept, scales cleanly to the existing control set, and avoids hiding advanced functionality behind a separate mode.

## Alternatives Considered

### 1. Stacked Sections

This would show all sections in one scrolling column. It is faster than section switching, but it changes the interaction model too much for this phase and reduces the value of the section navigation structure the user wants to keep.

### 2. Oversized Preview Split

This was the first direction, with a large center-stage preview. It created too much dead space, made the preview heavier than the actual editing workflow, and separated the section list from the active controls too aggressively.

### 3. Editing-First Split

This is the selected approach. It keeps the existing section-switching model while making the page read clearly as edit-left / verify-right.

## Audience And UX Positioning

The page is for a mixed audience:

- users who want a polished QR code without understanding the rendering internals
- users who want direct access to gradients, logo behavior, corner styling, and encoding controls

The experience should therefore feel simple first, but not simplified. Basic decisions should read clearly at a glance, while advanced controls remain available in place rather than hidden in a separate advanced screen.

## Layout Design

### Left Rail

The left rail acts as a compact navigation and status column.

- It lists the workspace sections in editing order.
- It provides a clear active state.
- It includes mini summaries so the list is informative, not merely navigational.
- It should remain visually quiet and avoid pills, cards, or large background blocks around each item.

Recommended navigation labels:

- `Content`
- `Style`
- `Corners`
- `Background`
- `Logo`
- `Encoding`

Recommended summary style:

- short, scannable phrases such as `SVG · 320×320`, `Rounded · Gradient on`, `Transparent`, or `Logo uploaded`

`Style` replaces the current `Dots` label in navigation because it is more intuitive. `Encoding` replaces `QR settings` for the same reason.

### Active Content Region

The primary editing region sits immediately after the left rail.

- It displays only the selected section's controls.
- It should be visually grouped with the section rail so the page reads as one editing block.
- It should receive most of the page width.
- It should prioritize fast scanning and direct editing over theatrical presentation.

This region should feel like the working surface of the page.

### Sticky Preview

The preview should move to the far-right edge of the layout.

- It remains visible while users edit the active section.
- It should be compact and proportionate to the actual QR object size.
- It functions as a live reference, not as the dominant page stage.
- Export and reset actions should stay attached to this column.
- Lightweight metadata such as current size or export format should sit beneath the preview in a subdued secondary row.

This keeps the output close at hand without wasting horizontal space.

### Section Navigation + Content Relationship

The section rail and active content should behave as one editing system.

- Clicking a section updates the adjacent content immediately.
- The distance between navigation and content should be small enough that the relationship is obvious.
- The left rail should avoid feeling like a detached sidebar.

## Interaction Model

The page should use focused editing rather than exposing every control at once.

- Clicking a section in the left rail updates the adjacent content panel.
- The sticky preview remains fixed during section changes.
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
- Keep the active content region legible without making users scroll through unrelated controls.

## Visual Direction

The visual language should be editorial-premium, not dashboard-premium.

- Background: white or near-white as the dominant page surface
- Panels: only where they are needed for inputs, preview containment, or subtle grouping
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
- oversized empty preview stages
- detached sidebars that repeat information without helping the edit flow

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
- the left rail with section states and mini summaries
- the adjacent active-content structure
- the compact sticky preview with nearby actions
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
- strength of the edit-left / verify-right workflow
- visual distinctiveness
- preservation of the existing control set
- whether the page feels intuitive for both new and advanced users

No React implementation, linting, or build verification is part of this phase.

## Risks And Mitigations

### Risk: the design becomes a prettier version of the current spaced-out concept

Mitigation: enforce the tighter `sections + active content + sticky preview` structure and remove any area that does not directly support editing or verification.

### Risk: the layout feels too tool-like and loses warmth

Mitigation: use editorial spacing, restrained surfaces, and typography-led hierarchy rather than dense app chrome.

### Risk: advanced controls become hard to discover

Mitigation: keep them in the active content region with clear subgrouping and progressive disclosure, rather than burying them in a separate mode.

### Risk: the first Pencil pass becomes too broad to evaluate cleanly

Mitigation: keep the first deliverable desktop-only and focus on the highest-value panel states and micro-states.

## Success Criteria

- The settings workspace reads as a premium creative studio rather than a settings form.
- The layout clearly reads as edit-left / verify-right.
- All existing settings categories remain represented in the design.
- The design feels approachable without removing advanced control.
- The Pencil artifact is specific enough to guide later UI implementation.
