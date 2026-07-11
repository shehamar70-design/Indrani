# STATE — updated 2026-07-11

## Phase: 1 COMPLETE (Foundation) — exit criteria verified

## Done (Phase 1, all 8 features per docs/superpowers/plans/2026-07-06-phase-1-foundation.md)
1. Theme tokens + fonts + shell layout + security headers
2. Data-layer core: safeFetch (timeout/breaker/stale), TtlCache (LRU+TTL), batcher — TDD
3. Providers: yahoo, finnhub, binance, fred, fx (frankfurter), rss (+sanitizer)
4. chain.ts typed fallback chains: quotes/chart/news/search/fx/calendar/fundamentals
5. 8 API routes: /api/{quotes,chart,news,search,movers,fx,calendar,fundamentals} — Zod + rate limit + meta{source,fetchedAt,stale} + CDN cache headers
6. Neon+Drizzle schema, Better Auth server/client, /api/auth/[...all], 5/15min auth rate limit
7. Auth pages: /login, /register, /verify (no SMTP — dev logs verification link; login allowed with "verify email" banner)
8. i18n scaffold: messages/{en,hi}.json, lib/i18n.ts (t(), LOCALE_COOKIE), lib/format.ts (price/percent/compact incl. lakh/crore)

## Exit criteria verified 2026-07-11
- /api/quotes?symbols=AAPL,^NSEI,BTC-USD → 200 live (AAPL 315.32 yahoo, isStale:false)
- sign-up → 200 token; sign-in → 200 + session cookie (Origin header required — CSRF check active)
- vitest 56/56 (8 files), tsc clean, eslint clean
- docs/19 critical tests: 1-4, 7, 8 covered; 5 (command parser) → Phase 3; 6 (watchlist API) → Phase 4

## In progress
- nothing — Phase 1 closed

## Next
- Phase 2 per docs/36 roadmap: read roadmap + relevant docs/NN, plan mode → approval → execute
- User guidance: full feature freedom, MORE features fine never fewer; premium chart-rich within docs/17 budget; missing/extra features web-searched at end after core

## Known issues
- No git remote configured — pushes need one
- github + memory MCP servers from docs/20 not installed
- Rate limiter is per-lambda-instance in-memory (fine for dev; note for Vercel scale)

## Commands to resume
pnpm dev  # http://localhost:3000 (needs .env.local: DATABASE_URL, BETTER_AUTH_SECRET, FINNHUB_API_KEY, FRED_API_KEY)
pnpm exec vitest run && pnpm exec tsc --noEmit
