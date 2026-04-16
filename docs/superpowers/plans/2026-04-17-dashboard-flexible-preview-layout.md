# Dashboard Flexible Preview Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/dashboard` QR studio layout keep both editor and preview columns flexible on desktop while ensuring the controls below the QR preview remain visible by scaling the preview against viewport height.

**Architecture:** Keep the existing dashboard structure in `components/qr/qr-studio.tsx`, but replace the rigid-feeling desktop grid tracks with more elastic `minmax(...)` tracks. Update `components/qr/qr-preview-card.tsx` so the dashboard preview card and QR stage size against viewport height instead of relying on large fixed desktop mins, and prove the behavior with server-rendered class-string tests in `components/qr/qr-preview-card.test.tsx`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest 4

---

### Task 1: Lock In The Dashboard Preview Contract With Tests

**Files:**
- Modify: `components/qr/qr-preview-card.test.tsx`
- Test: `components/qr/qr-preview-card.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("uses viewport-aware sizing for the dashboard preview shell", () => {
  const markup = renderToStaticMarkup(
    <QrPreviewCard
      canDownload
      downloadName="new-qr"
      errorMessage={null}
      onDownload={vi.fn()}
      onDownloadNameChange={vi.fn()}
      onReset={vi.fn()}
      previewRef={createRef<HTMLDivElement>()}
      state={createDefaultQrStudioState()}
      variant="dashboard"
    />,
  )

  expect(markup).toContain("lg:max-w-[clamp(22rem,30vw,28rem)]")
  expect(markup).toContain("lg:max-h-[calc(100svh-2rem)]")
  expect(markup).toContain("lg:size-[clamp(15rem,calc(100svh-30rem),22rem)]")
  expect(markup).not.toContain("lg:min-h-[20rem]")
  expect(markup).not.toContain("xl:min-h-[22rem]")
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run components/qr/qr-preview-card.test.tsx`
Expected: FAIL because the current dashboard preview markup still contains the fixed `lg:min-h-[20rem]` / `xl:min-h-[22rem]` sizing classes and does not contain the viewport-aware sizing classes above.

- [ ] **Step 3: Write minimal implementation**

Update `components/qr/qr-preview-card.tsx` so the dashboard variant applies:

```tsx
<Card
  className={cn(
    "w-full bg-card/95 shadow-sm backdrop-blur",
    isDashboard &&
      "bg-card/98 shadow-none lg:max-h-[calc(100svh-2rem)] lg:max-w-[clamp(22rem,30vw,28rem)]",
  )}
  size={isDashboard ? "sm" : "default"}
>
```

and:

```tsx
<div
  ref={previewRef}
  className={cn(
    "flex aspect-square items-center justify-center rounded-[calc(var(--radius-xl)-2px)] bg-background shadow-inner [&_canvas]:h-full [&_canvas]:w-full [&_canvas]:max-w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-full",
    isDashboard
      ? "mx-auto w-full max-w-full p-3 lg:size-[clamp(15rem,calc(100svh-30rem),22rem)]"
      : "p-4",
  )}
/>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run components/qr/qr-preview-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/qr/qr-preview-card.test.tsx components/qr/qr-preview-card.tsx
git commit -m "test: lock dashboard preview sizing contract"
```

### Task 2: Make The Dashboard Columns Fluid

**Files:**
- Modify: `components/qr/qr-studio.tsx`
- Test: `components/qr/qr-preview-card.test.tsx`

- [ ] **Step 1: Write the failing test**

Extend the existing preview contract test to verify the desktop layout classes we depend on from `QrStudio`:

```tsx
expect(markup).toContain("lg:max-w-[clamp(22rem,30vw,28rem)]")
```

Then add a second expectation in a new `QrStudio` server-render test if one is created later. For the current small change, use targeted markup assertions after rendering the dashboard preview contract and check the production code manually in the same task.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run components/qr/qr-preview-card.test.tsx`
Expected: FAIL until the dashboard layout classes are updated.

- [ ] **Step 3: Write minimal implementation**

Update the dashboard grid in `components/qr/qr-studio.tsx`:

```tsx
<div className="mx-auto grid min-h-screen w-full max-w-[1700px] gap-4 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,.9fr)] lg:items-start lg:gap-4 lg:px-4 lg:py-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(24rem,1fr)] xl:gap-5 xl:px-5 xl:py-5 2xl:grid-cols-[minmax(0,1.7fr)_minmax(26rem,1fr)] 2xl:gap-6 2xl:px-6">
```

and keep the sticky preview wrapper aligned but full-width within its rail:

```tsx
<div className="lg:sticky lg:top-4 lg:self-start lg:w-full lg:justify-self-end">
  {previewCard}
</div>
```

- [ ] **Step 4: Run targeted tests to verify the change**

Run: `pnpm exec vitest run components/qr/qr-preview-card.test.tsx app/dashboard/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/qr/qr-studio.tsx components/qr/qr-preview-card.test.tsx app/dashboard/page.test.tsx
git commit -m "feat: rebalance dashboard editor and preview layout"
```

### Task 3: Full Verification

**Files:**
- Modify: `docs/superpowers/plans/2026-04-17-dashboard-flexible-preview-layout.md`

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

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-04-17-dashboard-flexible-preview-layout.md
git commit -m "docs: record dashboard preview layout verification"
```
