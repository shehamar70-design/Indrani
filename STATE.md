# STATE — updated 2026-07-18 (evening)

## Phase: docs/44 APPROVED → Phase 0 COMPLETE (0.1 ✅ 0.2 ✅ 0.3 ✅) → next: Phase 1 bug fixes

## Owner approvals (2026-07-18, verbatim intent — full record in DECISIONS.md)
- Azure Translator F0 ONLY (skip Google Cloud — no billing-enabled GCP). Chain: cache → Azure F0 → Gemini → EN-fallback.
- Free tier ONLY for quotes infra: no paid Upstash overage, no VPS. Worker (crypto WS + 15s refresher + news poller)
  runs on the existing EC2 dev box (pm2). Push for real p50 ~60–70ms within free tier (TTL tuning, batching/coalescing,
  warm WS, free CDN/edge). Report measured best-case BEFORE asking for any paid upgrade.
- Protection Bypass for Automation: APPROVED.
- 1-min conditional-GET polling APPROVED for BusinessLine + ET Markets (304-capable); others stay 5–15 min.
- NSE/BSE toggle scope, Gift Nifty source, In Focus curation, Live TV stream: builder best-judgment defaults, flag each when done.
- Hindi TTS pronunciation: owner signs off AFTER build (gate stays before feature-flag enable).

## Phase 0 (complete)
- 0.1 ✅ `lib/article-paths.ts` (3da5d22): tsc 0 errors, 73/73 vitest, build 20/20 routes.
- 0.2 ✅ Deployed: main FF'd to phase-2-news, GitHub initial commit absorbed (0dcf9a1) → Vercel prod deploy SUCCESS.
- 0.3 ✅ Prod BEFORE battery recorded in docs/44 §5 "Prod BEFORE" (raw: ~/scratchpad/latency-before-prod-20260718-1555.txt).
  Headline (iad-adjacent probe, PoP iad1): quotes 20×1s p50 20.9ms (HIT); expired burst 42–85ms ALL STALE (CDN swr=60
  masks the local 207–363ms queueing); MISS outliers = function path: quotes 513ms cold, news 927ms, movers 196ms.
  AUTH DEVIATION: bypass SECRET not generated — MCP OAuth token (user's `claude mcp login vercel`) reads the project but
  403s on projectProtectionBypass:create. Used MCP share link → `_vercel_jwt` cookie (edge-validated, equivalent timing).

## RESIDUAL from 0.3 (carry forward, not blocking Phase 1)
- `VERCEL_AUTOMATION_BYPASS_SECRET` still does not exist; `.env.local` unchanged. Needs `vercel login` (device flow)
  or a VERCEL_TOKEN with full project scope. Required before the Phase 4 AFTER battery / CI prod checks.
  Until then: mint a fresh share link via Vercel MCP `get_access_to_vercel_url` (23h validity) and use
  ~/scratchpad session copy `latency-battery-cookie.sh` pattern (COOKIE_JAR= variant of latency-battery.sh).

## Key verified facts (do not re-derive)
- Vercel project: prj_ASNEl74uvlTDhyNx4g0XDfxJHo4K, team_kxkYUvh4agZrO728NerWSMJU, git integration ACTIVE.
  Prod: indrani-git-main-akash1862h-1494s-projects.vercel.app (SSO 302 for humans; ssoProtection all_except_custom_domains).
- Vercel MCP plugin authed and working (list_teams/get_project OK; token vca_*, short-lived, auto-refreshed by Claude Code).
- Remote: https://github.com/shehamar70-design/Indrani.git — main, phase-1-foundation, phase-2-news pushed; tree clean pre-0.3.
- Chart-tab bug root cause: TZ-unpinned toLocale* in `components/markets/range-chart.tsx:29-36`. Movers unsorted/unfiltered
  in `lib/data/providers/yahoo.ts:167-188`. CTA-less module = NewsletterBand. 11 nav routes + /search 404.
- Latency: local 07-17 warm p50 14.6ms / expired-burst 207–363ms; prod BEFORE 07-18 table now in docs/44 §5.

## Next
1. Phase 1 (parallel, one bug per branch): chart TZ fix, movers sort/filter, vertical routes + /search,
   Devanagari font, RSS entity decode, quote-page Suspense split — per docs/44 §7.
2. Then Phase 2 (news quality) → 3 (homepage redesign) → 4 (quotes latency free-tier-max; needs bypass secret residual
   resolved for AFTER battery) → 5 (language) → 6 (article page).

## Commands to resume
pnpm dev  # http://localhost:3000 (needs .env.local: DATABASE_URL, BETTER_AUTH_SECRET, FINNHUB_API_KEY, FRED_API_KEY)
pnpm exec vitest run && pnpm exec tsc --noEmit  # both green as of 0dcf9a1
# prod battery (until bypass secret exists): mint share link via Vercel MCP, exchange for cookie, run cookie-variant battery
