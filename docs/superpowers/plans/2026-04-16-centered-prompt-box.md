# Centered Prompt Box CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the homepage `PromptInputBox` in the viewport and reduce its width so it reads like a focused CTA.

**Architecture:** Keep the existing `PromptInputBox` component unchanged and move the layout responsibility to `app/page.tsx`. Verify the change with the existing page-level test by asserting both the prompt box content and the new centering/width utility classes rendered by the page.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest

---

### Task 1: Add CTA Layout Around the Homepage Prompt Box

**Files:**
- Modify: `app/page.test.tsx`
- Modify: `app/page.tsx`
- Verify: `pnpm exec vitest run app/page.test.tsx`
- Verify: `pnpm lint`
- Verify: `pnpm test`
- Verify: `pnpm exec tsc --noEmit`
- Verify: `pnpm build`

- [ ] **Step 1: Write the failing test**

Update `app/page.test.tsx` to assert the homepage now renders the prompt box inside a centered full-screen CTA wrapper with a constrained width:

```tsx
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import Home from "./page"

describe("home page", () => {
  it("renders the ai prompt box inside a centered cta layout", () => {
    const markup = renderToStaticMarkup(<Home />)

    expect(markup).toContain("Type your message here...")
    expect(markup).toContain("min-h-screen")
    expect(markup).toContain("items-center")
    expect(markup).toContain("justify-center")
    expect(markup).toContain("max-w-lg")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run app/page.test.tsx`
Expected: FAIL because `app/page.tsx` currently renders only `<PromptInputBox />` and does not include the centering or width classes.

- [ ] **Step 3: Write minimal implementation**

Update `app/page.tsx` so the page owns the CTA layout and the prompt box stays unchanged:

```tsx
import type { Metadata } from "next"

import { PromptInputBox } from "@/components/ui/ai-prompt-box"

export const metadata: Metadata = {
  title: "QR Studio Home",
  description: "AI prompt input home screen.",
}

export default function Home() {
  return (
    <main className="min-h-screen px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-lg items-center justify-center">
        <PromptInputBox />
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run app/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Run project verification**

Run: `pnpm lint`
Expected: exit 0

Run: `pnpm test`
Expected: all tests pass

Run: `pnpm exec tsc --noEmit`
Expected: exit 0

Run: `pnpm build`
Expected: production build succeeds

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "refactor: center homepage prompt box"
```
