# DECISIONS — append-only architectural decision log

Format: `YYYY-MM-DD — decision — why`. Never rewrite or delete entries.

- 2026-07-06 — Product is named **Indrani**; all "AKASH" references in docs/ are read as "Indrani" — user directive, single naming source of truth.
- 2026-07-06 — Spec files moved from repo root into `docs/` — user prompt and docs/21 both reference a `docs/` folder; root layout was accidental.
- 2026-07-06 — Scaffolded with create-next-app defaults: Next.js 16.2.10, React 19.2.4, Tailwind v4 (PostCSS plugin), ESLint 9, no `src/` dir, `@/*` import alias — matches docs/01 stack; nothing extra installed.
- 2026-07-06 — pnpm build scripts explicitly approved for `sharp` and `unrs-resolver` only (pnpm-workspace.yaml) — pnpm 11 blocks postinstall scripts by default; these two are required by Next/ESLint tooling.
