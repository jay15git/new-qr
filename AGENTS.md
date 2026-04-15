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
- `app/layout.tsx` defines the root shell, Geist fonts, and global CSS.
- `app/page.tsx` is the only route entrypoint and renders the landing shell plus `<QrStudio />`.
- `components/qr/qr-studio.tsx` is the main client entrypoint. It owns the `QRCodeStyling` instance lifecycle, deferred preview updates, download flow, reset flow, and uploaded logo object URL cleanup.
- `components/qr/qr-studio-state.ts` is the core state and mapper layer. Update this first when adding new controls, defaults, or `qr-code-styling` options.
- `components/qr/qr-control-sections.tsx` is the large control-surface form. Follow its existing inline `setState` pattern unless there is a clear reason to refactor.
- `components/qr/qr-preview-card.tsx` is display/export UI only.
- `lib/utils.ts` only provides `cn()`.

## Testing Notes
- Current tests only cover `components/qr/qr-studio-state.ts`.
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
