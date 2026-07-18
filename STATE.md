# STATE — updated 2026-07-18

## Phase: docs/44 APPROVED by owner → Phase 0 in progress (0.1 ✅, 0.2 ✅, 0.3 blocked on Vercel auth)

## Owner approvals (2026-07-18, verbatim intent — full record in DECISIONS.md)
- Azure Translator F0 ONLY (skip Google Cloud — no billing-enabled GCP). Chain: cache → Azure F0 → Gemini → EN-fallback.
- Free tier ONLY for quotes infra: no paid Upstash overage, no VPS. Worker (crypto WS + 15s refresher + news poller)
  runs on the existing EC2 dev box (pm2). Push for real p50 ~60–70ms within free tier (TTL tuning, batching/coalescing,
  warm WS, free CDN/edge). Report measured best-case BEFORE asking for any paid upgrade.
- Protection Bypass for Automation: APPROVED.
- 1-min conditional-GET polling APPROVED for BusinessLine + ET Markets (304-capable); others stay 5–15 min.
- NSE/BSE toggle scope, Gift Nifty source, In Focus curation, Live TV stream: builder best-judgment defaults, flag each when done.
- Hindi TTS pronunciation: owner signs off AFTER build (gate stays before feature-flag enable).

## Phase 0 progress
- 0.1 ✅ `lib/article-paths.ts` committed (3da5d22, 07-18 10:14): tsc 0 errors, 73/73 vitest, build 20/20 routes.
- 0.2 ✅ Deployed: local `main` FF'd to `phase-2-news`, GitHub's README-only initial commit absorbed via
  `--allow-unrelated-histories -X ours` (no force push), pushed (0dcf9a1) → Vercel git-integration prod deploy SUCCESS
  (GitHub commit status ✓). Prod no longer serves the stale bundle.
- 0.3 ⏳ BLOCKED: no Vercel CLI auth on this box (no auth.json, no VERCEL_TOKEN; .env.local has only expired
  VERCEL_OIDC_TOKEN). Need `vercel login` (device flow) or a VERCEL_TOKEN, then: enable Protection Bypass via API,
  add `VERCEL_AUTOMATION_BYPASS_SECRET` to .env.local, run `~/scratchpad/latency-battery.sh` (prod BEFORE battery,
  mirrors the 07-14/07-17 local battery; saves to ~/scratchpad/latency-before-prod-*.txt), record table in docs/44 §5.

## Key verified facts (do not re-derive)
- Vercel project: prj_ASNEl74uvlTDhyNx4g0XDfxJHo4K, team_kxkYUvh4agZrO728NerWSMJU, git integration ACTIVE
  (push → auto-deploy; preview per branch). Prod URL: indrani-git-main-akash1862h-1494s-projects.vercel.app (SSO 302 until bypass).
- Remote: https://github.com/shehamar70-design/Indrani.git — main, phase-1-foundation, phase-2-news all pushed; tree clean.
- Chart-tab bug root cause: TZ-unpinned toLocale* in `components/markets/range-chart.tsx:29-36`. Movers unsorted/unfiltered
  in `lib/data/providers/yahoo.ts:167-188`. CTA-less module = NewsletterBand. 11 nav routes + /search 404.
- Local latency (07-17): warm p50 14.6ms; expired-burst 207–363ms. Prod BEFORE battery not yet run (blocked, see 0.3).

## Next
1. Finish 0.3 (bypass + prod BEFORE battery) once Vercel auth exists.
2. Phase 1 (parallel, one bug per branch): chart TZ fix, movers sort/filter, vertical routes + /search,
   Devanagari font, RSS entity decode, quote-page Suspense split — per docs/44 §7.
3. Then Phase 2 (news quality) → 3 (homepage redesign) → 4 (quotes latency, free-tier-max variant) → 5 (language) → 6 (article page).

## Commands to resume
pnpm dev  # http://localhost:3000 (needs .env.local: DATABASE_URL, BETTER_AUTH_SECRET, FINNHUB_API_KEY, FRED_API_KEY)
pnpm exec vitest run && pnpm exec tsc --noEmit  # both green as of 0dcf9a1
VERCEL_AUTOMATION_BYPASS_SECRET=... ~/scratchpad/latency-battery.sh  # Phase 0.3 battery
