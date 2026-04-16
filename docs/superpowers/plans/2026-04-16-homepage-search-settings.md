# Homepage Search And Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the existing QR Studio homepage to `/settings` and replace `/` with a centered landing page that uses the existing `ai-input-search` component plus visual shortcut icons.

**Architecture:** Keep the route split explicit by adding a new `app/settings/page.tsx` that preserves the current homepage verbatim, then rebuild `app/page.tsx` as a small landing page. Extend `components/kokonutui/ai-input-search.tsx` with an optional shortcuts prop so the new homepage can render the requested icon row without creating a second search component.

**Tech Stack:** Next.js App Router, React 19 client/server components, TypeScript, Tailwind CSS 4, lucide-react, Vitest, ESLint

---

## File Map

- Modify: `app/page.tsx` to render the new centered homepage.
- Create: `app/settings/page.tsx` to preserve the current QR Studio homepage.
- Modify: `components/kokonutui/ai-input-search.tsx` to support optional visual shortcuts and align formatting with the repo.

### Task 1: Add The `/settings` Route

**Files:**
- Create: `app/settings/page.tsx`
- Reference: `app/page.tsx`

- [ ] **Step 1: Copy the existing homepage structure into the new route**

Create `app/settings/page.tsx` with the current hero, metadata, badges, and `<QrStudio />` composition so `/settings` preserves the current page behavior.

- [ ] **Step 2: Verify the new route compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no TypeScript errors from the new route file.

### Task 2: Extend `ai-input-search` With Optional Shortcut Icons

**Files:**
- Modify: `components/kokonutui/ai-input-search.tsx`

- [ ] **Step 1: Add a typed shortcuts prop**

Add a prop shaped like `{ label: string; icon: LucideIcon }[]` so callers can opt into shortcut rendering without affecting existing uses.

- [ ] **Step 2: Render the shortcuts as UI-only controls**

Render a compact row of rounded buttons associated with the search input. Buttons must be `type="button"`, must not navigate, and should only support local visual affordance.

- [ ] **Step 3: Keep the existing search surface behavior unchanged**

Do not alter submit behavior, textarea resizing, or existing footer actions beyond layout/styling needed to fit the shortcuts cleanly.

### Task 3: Replace `/` With The New Centered Landing Page

**Files:**
- Modify: `app/page.tsx`
- Reference: `components/kokonutui/ai-input-search.tsx`

- [ ] **Step 1: Replace the current QR Studio page with a minimal landing page**

Center the page vertically and horizontally, keep surrounding copy minimal, and make the search component the primary focal element.

- [ ] **Step 2: Pass the requested shortcut icons**

Use `lucide-react` icons for `link`, `text`, `email`, `phone`, `whatsapp`, and `instagram`, and pass them into `ai-input-search` as UI-only shortcuts.

- [ ] **Step 3: Keep homepage interactions local only**

Do not add redirects, route changes, or QR Studio state integration.

### Task 4: Verify The Change End To End

**Files:**
- Modify: none

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 2: Run typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 4: Run production build**

Run: `pnpm build`
Expected: PASS
