# Dashboard Flexible Preview Layout Design

## Summary

Adjust the `/dashboard` QR studio layout so both the editor region and the preview region stay fluid across desktop displays. The preview column should become visually larger when there is room, but the preview card must also respect viewport height so the controls below the QR canvas remain visible on desktop screens without requiring the user to scroll past the sticky card.

## Goals

- Make the QR preview side feel larger and more prominent on desktop.
- Reduce the relative width of the middle preview rail compared with the editor surface while keeping both columns fluid.
- Keep the export filename, encoded-content summary, download actions, and reset action visible within the preview card on desktop screens.
- Preserve the current `/dashboard` section-switching workflow and sticky preview behavior.

## Non-Goals

- No changes to QR generation logic or state mapping.
- No redesign of the sidebar navigation model.
- No mobile-first rework of the dashboard.
- No introduction of internal scrolling inside the preview card unless viewport constraints make it unavoidable later.

## Current Context

- `app/dashboard/page.tsx` renders `QrStudio` with `variant="dashboard"`.
- `components/qr/qr-studio.tsx` currently uses a two-column desktop grid with a wide editor column and a capped sticky preview column.
- `components/qr/qr-preview-card.tsx` currently gives the QR stage fixed desktop minimum sizes that can grow large enough to push the lower controls down on shorter desktop viewports.
- The user wants both the editor and QR areas to remain flexible rather than making one side rigid.

## Chosen Approach

Use a fluid two-column dashboard layout with viewport-aware preview sizing:

1. Keep the dashboard on a two-column desktop grid.
2. Make both columns elastic with `minmax(...)` sizing so the editor and preview areas scale together across desktop widths.
3. Let the editor column retain the larger share of horizontal space.
4. Constrain the preview card and QR stage with viewport-height-aware sizing so the QR canvas yields space before the controls below it are pushed out of view.

This approach satisfies the user requirement better than a pure width rebalance because desktop usability depends on height as much as width.

## Alternatives Considered

### 1. Width-only rebalance

Increase the preview column width and shrink the editor column using static grid values. Rejected because it does not reliably keep the lower preview controls visible on shorter laptop screens.

### 2. Fixed-height preview rail with internal scrolling

Constrain the preview card and allow internal scroll for overflow. Rejected for now because it solves access mechanically but makes the preview rail feel heavier and less natural.

### 3. Fluid columns plus viewport-aware preview sizing

This is the selected approach. It keeps the page feeling flexible while preserving visibility of the lower preview controls.

## Layout Design

### Dashboard Grid

In `components/qr/qr-studio.tsx`, the desktop grid should move from a mostly fixed preview rail to a more elastic split:

- the editor column should use a larger flexible track
- the preview column should keep a healthy minimum width but avoid a large hard maximum
- gaps and outer padding should remain compact enough to avoid wasting horizontal space on standard laptop screens

The page should still collapse to one column below the current desktop breakpoint.

### Sticky Preview Column

The preview column should remain sticky on desktop, but the card should no longer assume unlimited vertical space. The column should align to the top of the page shell and leave a small top offset consistent with the current dashboard spacing.

### Preview Card Sizing

In `components/qr/qr-preview-card.tsx`, the QR stage should become responsive to viewport height:

- on taller desktop screens, the QR stage can expand and read as more prominent
- on shorter desktop screens, the QR stage should shrink first
- the filename field, encoded-content block, download buttons, and reset action should stay visible without relying on internal card scrolling

The card itself should remain full-width within its desktop rail.

## Interaction Model

- Section switching in the left dashboard rail remains unchanged.
- The preview remains live and sticky while the user edits the active section.
- The preview card content order remains unchanged.
- No new collapse, accordion, or modal behavior is introduced.

## Responsiveness Rules

- Below desktop, keep the existing stacked flow.
- At desktop widths, use fluid grid tracks instead of fixed-feeling column caps.
- Use viewport-height-aware sizing only for the dashboard preview variant, so the settings variant keeps its current presentation unless a later change intentionally aligns both.

## Error Handling And Edge Cases

- If the viewport height is unusually short for a desktop browser window, the QR stage should continue shrinking down to a sensible minimum rather than overflowing aggressively.
- Very wide desktop monitors should not let the preview card become disproportionately large compared with the editor column.
- Existing error messaging and disabled download behavior remain unchanged.

## Testing Strategy

- Run `pnpm lint`.
- Run `pnpm exec tsc --noEmit`.
- Run `pnpm test`.
- Run `pnpm build`.

Manual verification should also confirm:

- the preview controls remain visible on shorter desktop windows
- the QR stage feels larger on roomy desktop screens
- the editor and preview columns both resize smoothly across desktop widths

## Success Criteria

- The `/dashboard` layout keeps both the editor and preview areas flexible on desktop.
- The QR preview feels larger than it does today on standard and large desktop widths.
- The options below the QR preview remain visible on desktop displays without awkward clipping.
- The dashboard still passes lint, typecheck, tests, and production build.
