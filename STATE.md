# STATE — updated 2026-07-17 (evening)

## Phase: Course-correction PLANNING COMPLETE — awaiting owner "approved"

## What exists now
- **`docs/44_COURSE_CORRECTION_PLAN.md` v2 (2026-07-17) is the deliverable**: bug fixes, homepage redesign,
  news curation + freshness, language architecture (global HI/EN toggle + MT + TTS), quotes latency
  (Upstash Redis + WS worker per docs/43 §12d), tooling map, build order (Phases 0–6), 24 consolidated
  open questions (§8), success metrics, evidence appendix.
- Plan was triple-reviewed (3 parallel reviewer agents: merge fidelity, goal coverage, internal consistency).
  Goal coverage: 16/16 requirements COVERED. All found issues fixed same day:
  - BLOCKER fixed: `news:latest` Redis key removed — news storage is Neon Postgres ONLY (Redis = quotes/charts only).
  - Exec-summary "sub-50ms" corrected to the doc's real targets (p50 ≤80ms MISS+Redis-HIT, ≤60ms CDN HIT, projections).
  - Freshness claim now carries the poll-cadence contingency (OQ #12).
  - §2.J media module rewritten to the split Watch/Listen pattern (matches 07-17 live Bloomberg audit).
  - Global toggle placement fixed to §A Utility Bar; §8 renumbered (24 items, incl. edge-runtime + Logo.dev);
    NSE/BSE OQ restored to original dual question; /hindi interim behavior defined; evidence paths clarified (~/).
- ~25 file:line claims in the plan re-verified against tree with 0 mismatches (reviewer pass).

## Key verified facts (do not re-derive)
- Build broken: sole tsc error = missing `lib/article-paths.ts` (only importer `components/news/article/related-rail.tsx:8`).
- Chart-tab bug root cause: TZ-unpinned toLocale* in `components/markets/range-chart.tsx:29-36` → hydration
  mismatch on prod (works in same-TZ dev). Movers: unsorted/unfiltered in `lib/data/providers/yahoo.ts:167-188`.
- CTA-less module = NewsletterBand (`components/news/newsletter-band.tsx`), 0 links/buttons/inputs.
- 11 nav routes + /search 404 (no `[vertical]` route). Homepage = sparse text lists, 2 images total.
- Latency (local dev 07-17): warm p50 14.6ms; expired-burst 207–363ms. Prod unmeasurable (SSO 302) until
  Protection Bypass enabled (Phase 0.3).
- Evidence: `~/pw-audit/out/` (screenshots + v17-findings.txt), `~/scratchpad/plan-sections/` (6 drafts),
  `docs/research/bloomberg-2026-07/` (live Bloomberg audit, TinyFish run 74c44be0).

## In progress
- Nothing. NO implementation code written (user directive: wait for "approved").

## Next (on owner approval)
- Phase 0 (stabilization): create `lib/article-paths.ts` → green build → deploy → enable bypass secret →
  prod BEFORE latency battery. Then Phases 1–6 per docs/44 §7. Owner must also answer docs/44 §8 (24 OQs);
  minimum blocking set: #1–2 (translation accounts), #4–5 (Upstash/VM cost), #7 (bypass), #12 (poll cadence).

## Known issues
- Working tree has uncommitted prior work (article components, schema.ts, package.json) on branch `phase-2-news`.
- No git remote configured — pushes need one.

## Commands to resume
pnpm dev  # http://localhost:3000 (needs .env.local: DATABASE_URL, BETTER_AUTH_SECRET, FINNHUB_API_KEY, FRED_API_KEY)
pnpm exec vitest run && pnpm exec tsc --noEmit  # tsc currently fails: missing lib/article-paths.ts (known, Phase 0)
