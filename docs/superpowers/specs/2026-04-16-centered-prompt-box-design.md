# Centered Prompt Box CTA Design

## Goal

Change the `/` homepage so the `PromptInputBox` reads like a single call-to-action instead of a full-width app surface.

## Scope

- Update `app/page.tsx` only.
- Keep `PromptInputBox` behavior and styling unchanged.
- Center the prompt box both vertically and horizontally in the viewport.
- Reduce the visual width to a reasonable CTA size on desktop while keeping it fluid on mobile.

## Layout

- Wrap the page in a full-height container using `min-h-screen`.
- Center content with flex or grid centering.
- Constrain the prompt box with `w-full max-w-lg`.
- Add small horizontal padding such as `px-4` so the layout still fits on narrow screens.

## Non-Goals

- No headline, description, card shell, or decorative background changes.
- No changes inside `components/ui/ai-prompt-box.tsx`.
- No interaction or state changes.

## Testing

- Update the existing page-level test so it still verifies the homepage renders the prompt box.
- Run lint, tests, typecheck, and build after the layout change.
