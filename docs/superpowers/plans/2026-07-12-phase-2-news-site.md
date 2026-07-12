# Phase 2 — News Site Implementation Plan (approved 2026-07-12)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Executed inline, one feature at a time: tsc + tests + browser verify, commit per working feature (docs/23).

**Goal:** Public Indrani News site: shell + nav + ticker tape, modular homepage, article layouts A–E + external card, 9 verticals, /markets hub + sub-pages + public quote pages, search.

**Architecture:** Server components + ISR (home/verticals 300s, articles 3600s, quotes 60s); live prices are small client islands sharing one batched poller. All data via Phase 1 `lib/data/chain.ts` + existing 8 API routes — zero new fetch code. Own articles in Postgres (`articles` table, block content); aggregated RSS renders external cards linking out.

**Tech stack:** Next.js 16 App Router, Tailwind v4, Drizzle/Neon, custom SVG charts (no chart dep on news side), custom poller hook (no swr dep).

## Global constraints
- Real data only; states loading/live/stale/unavailable; missing stat = "—" (docs/18 §2).
- Perf budget (docs/17): LCP ≤2.5s, CLS ≤0.05, JS ≤180KB gz/route; batched quote calls only.
- Canonical quote route `/markets/quote/[symbol]`; `/quote/[symbol]` redirects (user answer 1).
- Search over in-memory RSS cache now; `news_items` DB persistence + ingest cron at END of phase (answer 2).
- Markets Wrap auto-generator built now, labeled "auto-generated" (answer 3).
- Demo live blog clearly marked demo (answer 4).
- Motion: CSS/canvas only on Big Take band + featured chart; no three.js; clean hooks for Phase 6 WebGL (answer 5).
- Aggregated content: attribute + link out, canonical → original source. `prefers-reduced-motion` fallbacks everywhere.

## Features (order + deps)
1. **News shell**: `app/(news)/layout.tsx`, `components/news/{utility-bar,ticker-strip,footer}.tsx`, `lib/quote-poller.ts`. Move `app/page.tsx` into `(news)`.
2. **Primitives + symbol directory**: `components/news/{story-card,external-card,section-band,sparkline}.tsx`, `lib/verticals.ts`, `lib/symbols.ts` (+ `symbols` table seed).
3. **Homepage**: `lib/home-layout.ts` + blocks: lead-module, breaking-banner, market-snapshot, big-take-band (motion hero), opinion-band, newsletter-band, most-read-rail, live-tv-module.
4. **Quote page**: `components/markets/{quote-header,stats-grid,range-chart}.tsx`, `app/(news)/markets/quote/[symbol]/page.tsx`, `/quote/[symbol]` redirect. generateMetadata + JSON-LD; unknown symbol → clean not-found.
5. **Markets hub + sub-pages**: `app/(news)/markets/page.tsx` + stocks/currencies/commodities/crypto; `components/markets/{index-hero-card,featured-chart,movers-board,fx-board,mini-board,calendar-mini}.tsx`.
6. **Article system**: `articles` table + block renderer; `components/news/article/*` (article-header variants, key-points, ticker-chip, inline-chart, pull-quote, byline, share-row, related-rail); routes `/news/[slug]`, `/news/live/[slug]`, `/news/markets-wrap/[date]`, `/news/features/[slug]`, `/news/opinion/[slug]`; Markets Wrap generator; seeds (1/layout + demo live blog).
7. **Verticals + search**: `app/(news)/[vertical]/page.tsx` (9 slugs from `lib/verticals.ts`); `app/(news)/search/page.tsx` (tabs All/News/Symbols); global `/` key omnibox.
8. **news_items persistence + ingest cron + most-read**: ingest route handler, most-read backed by table; `app/sitemap.ts`, `app/robots.ts`.
9. **Perf audit**: `pnpm build` size table, vitals on /, /markets, quote page; record in docs/19 log.

## Data (reuse only)
quotes/sparklines→`/api/quotes`,`/api/chart` (yahoo→finnhub→binance); news→`/api/news` (RSS); movers→`/api/movers`; fx→`/api/fx`; calendar→`/api/calendar`; stats→`/api/fundamentals`+quotes; symbol search→`/api/search`.

## Reuse
`lib/data/*` entire, `lib/api.ts` route plumbing, `lib/format.ts`, `lib/i18n.ts`, auth, globals.css tokens (light default = news theme), `newsItems` schema already present.
