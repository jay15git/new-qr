<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack
- Single-package `pnpm` app using Next.js `16.2.3`, React `19`, Tailwind CSS `4`, Vitest `4`, shadcn/ui (`radix-nova`), and `qr-code-styling`.
- Use `pnpm`; the repo is locked with `pnpm-lock.yaml`.

## Commands
- Dev server: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm exec tsc --noEmit` (`package.json` has no `typecheck` script)
- Tests: `pnpm test`
- Production build: `pnpm build`
- Single test file: `pnpm exec vitest run components/qr/qr-studio-state.test.ts`
- Single test by name: `pnpm exec vitest run components/qr/qr-studio-state.test.ts -t "builds svg options from the default state"`

## App Structure
- `app/layout.tsx` defines the root shell, Geist/Bricolage Grotesque/Manrope fonts, and global CSS.
- `app/page.tsx` is the home route; renders `HomePromptShell` from `components/home/`.
- **`/new` and `/dashboard` are deprecated.** Do not add features or fixes there unless explicitly asked.
- `app/settings/page.tsx` is the **active workspace**. It renders `<QrStudio />` (default variant) and is where all QR studio work should happen.
- `components/qr/qr-studio.tsx` is the main client entrypoint for QR generation. It owns the `QRCodeStyling` instance lifecycle, deferred preview updates, download flow, reset flow, and uploaded logo object URL cleanup.
- `components/qr/qr-studio-state.ts` is the core state and mapper layer. Update this first when adding new controls, defaults, or `qr-code-styling` options.
- `components/qr/qr-control-sections.tsx` is the large control-surface form. Follow its existing inline `setState` pattern unless there is a clear reason to refactor.
- `components/qr/qr-preview-card.tsx` is display/export UI only.
- `components/new/drafting-surface.tsx` is the standalone drafting UI; do not confuse it with the dashboard/settings QR studio.
- `lib/utils.ts` only provides `cn()`.

## MCP Tools
- **Use available MCP tools for every task** instead of falling back to raw bash commands. This includes:
  - `gitnexus_*` tools for codebase exploration and impact analysis
  - `context7_*` tools for library/framework documentation lookups
  - `pencil_*` tools if working with `.pen` design files in `designs/`
- **Do not use these MCPs in this repo:** `paper`, `react-grab-mcp`, `supabase_*`
- If a tool exists for the job, use it. Do not manually `cat`, `grep`, or `sed` when a structured tool is available.

## Testing Notes
- Current tests only cover `components/qr/qr-studio-state.ts` and a growing set of adjacent modules.
- Vitest is configured with `environment: "node"`, so browser/client behavior in `qr-studio.tsx` is not covered by default.
- If you change React UI behavior, do not assume existing tests cover it.

## Repo Conventions
- Use the `@/*` import alias from `tsconfig.json`.
- Tailwind theme tokens and shadcn CSS variables live in `app/globals.css`.
- shadcn config lives in `components.json` and uses the `radix-nova` style.
- There is no checked-in CI workflow, formatter config, or pre-commit hook config in this repo, so verify locally with lint, typecheck, tests, and build before claiming completion.

## Search / Editing Gotchas
- Exclude `.next` and `node_modules` when searching; they create noisy false positives.
- Ignore generated/runtime directories and local artifacts covered by `.gitignore`, especially `.next/`, `node_modules/`, `coverage/`, `build/`, and `.env*`.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **new-qr** (3134 symbols, 5814 relationships, 208 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/new-qr/context` | Codebase overview, check index freshness |
| `gitnexus://repo/new-qr/clusters` | All functional areas |
| `gitnexus://repo/new-qr/processes` | All execution flows |
| `gitnexus://repo/new-qr/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
