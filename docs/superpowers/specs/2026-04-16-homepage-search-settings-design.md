# Homepage Search And Settings Route Design

## Summary

Move the current homepage to `/settings` without changing its content, then replace `/` with a centered landing page built around the existing `components/kokonutui/ai-input-search.tsx` component. The new landing page will add icon shortcuts for `link`, `text`, `email`, `phone`, `whatsapp`, and `instagram` as visual affordances only. No redirects, routing side effects, or QR state wiring are part of this change.

## Goals

- Make `/` a clean, centered entry screen focused on the `ai-input-search` UI.
- Preserve the existing QR Studio homepage experience by moving it intact to `/settings`.
- Reuse the existing `ai-input-search` component rather than introducing a second search-bar implementation.
- Keep the icon shortcuts presentational only for now.

## Non-Goals

- No automatic redirect from `/` to `/settings`.
- No submit handling that changes routes, mutates QR Studio state, or preconfigures QR values.
- No restructuring of the existing QR Studio page.
- No extraction of shared route shell components unless needed by the implementation.

## Current Context

- `app/page.tsx` currently contains the full homepage hero plus `<QrStudio />`.
- `components/kokonutui/ai-input-search.tsx` already exists as a client component with a textarea-driven search surface and action chrome.
- The requested change is mostly routing and presentation; existing QR Studio logic in `components/qr/qr-studio.tsx` remains untouched.

## Chosen Approach

Use a direct route split:

1. Copy the current `app/page.tsx` content into a new `app/settings/page.tsx` route.
2. Replace `app/page.tsx` with a new landing page centered around the `ai-input-search` component.
3. Extend or wrap `ai-input-search` so it can render the requested icon shortcuts while preserving its current styling language.

This is the smallest clean change because it keeps the existing QR Studio page stable, avoids unnecessary abstraction, and makes the new homepage independent.

## Alternatives Considered

### 1. Copy current homepage to `/settings` and replace `/`

This is the selected approach. It is the least risky and keeps routing explicit.

### 2. Extract a shared page shell used by both routes

Rejected for now because the pages are diverging immediately: `/settings` keeps the full workstation while `/` becomes a focused landing screen. Shared extraction would add indirection before there is a demonstrated need.

### 3. Keep one route and conditionally swap layouts

Rejected because it complicates route semantics and does not satisfy the explicit request to move the current homepage to `/settings`.

## Route Design

### `/`

- Render a minimal landing page.
- Center the content both horizontally and with generous vertical breathing room.
- Make the `ai-input-search` component the primary focal element.
- Include the requested icons as a quick-action row associated with the search bar.
- Keep all actions UI-only with no navigation or submit side effects.

### `/settings`

- Preserve the current homepage exactly as it exists today.
- Keep the existing metadata unless implementation reveals a strong reason to differentiate titles and descriptions.

## Component Design

### `AI_Input_Search`

The component should be reused rather than replaced. The change should stay minimal:

- Add a prop for rendering an optional list of shortcut items.
- Each shortcut item will have a label and icon.
- The shortcuts remain decorative or local-interaction-only. They can support selected styling if useful, but they do not trigger route changes.

If adding props makes the existing component awkward, a thin wrapper component around `AI_Input_Search` is acceptable, but the default preference is to keep this in one place.

### Homepage Composition

The new homepage can remain server-rendered at the page level and import the client `ai-input-search` component inside it. Any surrounding copy should stay minimal so the search bar remains visually centered and dominant.

## Visual Behavior

- The page should feel intentionally centered, not like the QR Studio hero compressed into the middle.
- The search bar should remain the dominant element with icon shortcuts grouped closely enough to read as part of the same interaction.
- The shortcut icons should use the existing design language in the repo: subtle surfaces, rounded shapes, and muted defaults with clear hover states.
- Mobile layout should stack cleanly without horizontal overflow.

## Data Flow And Behavior

- Typing into the homepage search bar remains local component state.
- Submitting the form should not navigate or modify QR Studio state.
- Clicking icons should not navigate. If selection state is introduced, it stays local to the homepage component.

## Error Handling

- No new network or async behavior is introduced.
- The implementation should avoid throwing if shortcut props are omitted.
- The homepage must remain usable with the base search bar even if shortcut rendering is empty.

## Testing Strategy

- Run `pnpm lint`.
- Run `pnpm exec tsc --noEmit`.
- Run `pnpm test`.
- Run `pnpm build`.

Because current automated tests focus on `qr-studio-state`, this change is primarily verified through lint, typecheck, build, and manual route rendering.

## Risks And Mitigations

### Risk: duplicated page metadata or page structure drift

Mitigation: keep the copied `/settings` page intact and only extract shared code if duplication becomes a real maintenance issue.

### Risk: `ai-input-search` styling may not fit the site shell out of the box

Mitigation: make only local styling adjustments needed for the centered landing page instead of refactoring the component broadly.

### Risk: icon shortcut behavior may be overinterpreted later

Mitigation: keep the first implementation explicitly UI-only and document that they are presentational shortcuts for now.

## Implementation Notes

- Use `lucide-react` icons for the requested shortcut types to match the existing stack.
- Prefer a small prop-based extension to `components/kokonutui/ai-input-search.tsx` over creating a second search component.
- Do not touch `components/qr/qr-studio.tsx` unless an unexpected shared dependency requires it.

## Success Criteria

- Visiting `/` shows a centered page built around the `ai-input-search` component.
- The homepage visibly includes icons for `link`, `text`, `email`, `phone`, `whatsapp`, and `instagram`.
- The icons are UI-only and do not redirect.
- Visiting `/settings` shows the current homepage unchanged in structure and behavior.
- The app passes lint, typecheck, tests, and production build.
