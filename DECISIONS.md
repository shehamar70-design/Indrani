# DECISIONS — append-only architectural decision log

Format: `YYYY-MM-DD — decision — why`. Never rewrite or delete entries.

- 2026-07-06 — Product is named **Indrani**; all "AKASH" references in docs/ are read as "Indrani" — user directive, single naming source of truth.
- 2026-07-06 — Spec files moved from repo root into `docs/` — user prompt and docs/21 both reference a `docs/` folder; root layout was accidental.
- 2026-07-06 — Scaffolded with create-next-app defaults: Next.js 16.2.10, React 19.2.4, Tailwind v4 (PostCSS plugin), ESLint 9, no `src/` dir, `@/*` import alias — matches docs/01 stack; nothing extra installed.
- 2026-07-06 — pnpm build scripts explicitly approved for `sharp` and `unrs-resolver` only (pnpm-workspace.yaml) — pnpm 11 blocks postinstall scripts by default; these two are required by Next/ESLint tooling.
- 2026-07-06 — Batched `/api/quotes?symbols=` per docs/12 §4 wins over docs/36's `/api/quote` — docs/12 is the detailed data spec; one batched route enforces the coalescing rule.
- 2026-07-06 — Phase 1 auth pages = login/register/verify only; `/account`, forgot/reset deferred — exit criteria only require login/register; keeps phase small (user approved).
- 2026-07-06 — No SMTP in MVP: verification links logged server-side in dev, login allowed with "verify your email" banner per docs/13 §2 — user approved.
- 2026-07-06 — Vitest added for unit tests (docs/19 layer 1); e2e deferred past Phase 1 — user approved.
- 2026-07-06 — Default create-next-app files (layout/page/globals/favicon) deleted intentionally by user; Phase 1 recreates them from the docs/15 design system.
- 2026-07-12 — Ticker regex length widened `{1,12}` → `{1,15}` (char class unchanged) in lib/api.ts, docs/18 §1, CLAUDE.md — NSE Yahoo symbols like BHARTIARTL.NS/HINDUNILVR.NS are 13 chars; 12 rejected valid tickers.
- 2026-07-12 — M&M.NS dropped from lib/symbols.ts directory (HEROMOTOCO.NS added) — "&" is outside the docs/18 ticker whitelist, API can never serve it; widening the char class for one symbol not worth the injection-surface review.
- 2026-07-12 — Symbol directory is a static TS module (lib/symbols.ts, 155 entries), no `symbols` DB table yet — nothing in Phase 2 queries symbols relationally; add the table when the Terminal (Phase 3+) needs joins. Plan's "+ symbols table seed" satisfied in-code.
- 2026-07-12 — /api/news category enum replaced by NEWS_CATEGORIES derived from FEEDS (rss.ts) — single source of truth; new vertical feeds (technology/politics/wealth/opinion/ai/green) auto-validate.
