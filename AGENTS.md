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
- **`/new` is the active workspace** and the only route where QR studio work should happen.
- **`/dashboard` and `/settings` are deprecated.** Do not add features or fixes there unless explicitly asked.
- `app/settings/page.tsx` is deprecated. It renders `<QrStudio />` (default variant) for legacy access only.
- `components/qr/qr-studio.tsx` is the main client entrypoint for QR generation. It owns the `QRCodeStyling` instance lifecycle, deferred preview updates, download flow, reset flow, and uploaded logo object URL cleanup.
- `components/qr/qr-studio-state.ts` is the core state and mapper layer. Update this first when adding new controls, defaults, or `qr-code-styling` options.
- `components/qr/qr-control-sections.tsx` is the large control-surface form. Follow its existing inline `setState` pattern unless there is a clear reason to refactor.
- `components/qr/qr-preview-card.tsx` is display/export UI only.
- `components/new/drafting-surface.tsx` is the active drafting UI for `/new`.
- `lib/utils.ts` only provides `cn()`.

## MCP Tools
- **Use available MCP tools for every task** instead of falling back to raw bash commands. This includes:
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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
