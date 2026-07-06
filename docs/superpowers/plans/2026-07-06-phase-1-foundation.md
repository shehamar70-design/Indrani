# Phase 1 — Foundation Implementation Plan (approved 2026-07-06)

> Executing inline per docs/23. Verification per feature: `pnpm exec tsc --noEmit` → lint → vitest → browser check → commit.

**Goal:** Data layer (safeFetch fallback engine + 6 providers), 4 API routes, Neon+Drizzle+Better Auth, design tokens (both themes), en/hi i18n scaffold.

**Stack:** Next.js 16.2.10 (App Router), React 19.2.4, TypeScript, Tailwind v4, pnpm, vitest. Deps to add: `yahoo-finance2`, `better-auth`, `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `zod`, `fast-xml-parser`, `sanitize-html`, `vitest`.

## Global constraints (docs/18)

- REAL DATA ONLY — never fake numbers; every value flows through `safeFetch`: primary → secondary → stale cache ("delayed") → explicit unavailable.
- 3s provider timeout; circuit breaker: 5 consecutive failures → skip source 60s.
- Zod on every API route; tickers `^[A-Z0-9.^=\-]{1,12}$`; search ≤100 chars, HTML stripped.
- Keys in env vars only, server-side only. Session cookies httpOnly/secure/sameSite=lax. User-data queries always scoped by session userId.
- Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Performance budget docs/17: news LCP ≤2.5s, JS ≤180KB gz/route, API p95 (cached) ≤150ms.

## Features (in order)

1. **Theme + shell** — `app/globals.css` (@theme tokens, both palettes per docs/15 §1), `app/layout.tsx` (Newsreader/Inter/Geist Mono via next/font), `app/page.tsx` placeholder, `next.config.ts` security headers, `.env.example`.
2. **Data-layer core (TDD)** — vitest setup; `lib/data/types.ts` (Quote, Candle, NewsItem, CalendarEvent, SourceMeta…), `lib/data/cache.ts` (LRU+TTL), `lib/data/safe-fetch.ts` (timeout, breaker, stale fallback — docs/19 tests 1–3), `lib/data/batch.ts` (in-flight dedup + symbol batching).
3. **Providers** — `lib/data/providers/{yahoo,finnhub,binance,fred,fx,rss}.ts`; RSS sanitizer (docs/19 test 8).
4. **Chain** — `lib/data/chain.ts`: getQuotes (Yahoo→Finnhub, crypto Binance→Yahoo), getChart (Yahoo→Finnhub), getNews (RSS→cache), getMacro (FRED→cache), getFx (frankfurter→cache); TTLs per docs/12 §3.
5. **API routes** — `lib/validate.ts` (docs/19 test 4) + `/api/quotes` (batched ≤50), `/api/chart`, `/api/news`, `/api/search`; responses carry `meta {source, fetchedAt, stale}`; CDN cache headers per docs/17 §3.
6. **DB + auth** — `drizzle.config.ts`, `lib/db/{index,schema}.ts` (Better Auth tables + `news_items`), `lib/auth.ts` + `lib/auth-client.ts` + `app/api/auth/[...all]/route.ts`, auth rate limit 5/15min/IP.
7. **Auth pages** — `/login`, `/register`, `/verify` only (account/forgot/reset deferred). No SMTP: log verification links in dev, allow login with "verify your email" banner.
8. **i18n + formatters** — `messages/{en,hi}.json`, `lib/i18n.ts` (dictionary + locale cookie), `lib/format.ts` (`formatNumber` incl. lakh/crore, price/percent — docs/19 test 7).

## Exit criteria (docs/36)

`/api/quotes?symbols=AAPL,^NSEI,BTC-USD` returns live data with source+stale fields; register→login works; docs/19 critical tests 1–8 pass (6 = deferred to Phase 4 watchlist API, 5 = Phase 3 command parser — noted).

## Approved decisions

- Default Next template files were deleted intentionally; recreate from scratch.
- `/api/quotes` (batched, docs/12) wins over docs/36's `/api/quote`.
- Auth: login/register/verify now; /account + forgot/reset later phase.
- Vitest, unit tests only in Phase 1.
- Feature freedom: more features fine, never fewer; premium chart-rich result within docs/17 budget.
