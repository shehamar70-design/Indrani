# 17 — PERFORMANCE AND CACHE

Speed is a product feature. Budgets are hard requirements, verified with `agent-browser vitals` / Lighthouse before calling any phase done.

## 1. Budgets

| Metric | News pages | Terminal |
|---|---|---|
| LCP | ≤ 2.5s | ≤ 3.0s (app shell) |
| CLS | ≤ 0.05 | ≤ 0.05 |
| INP | ≤ 200ms | ≤ 200ms |
| JS first load | ≤ 180KB gz per news route | ≤ 350KB gz (charts lazy) |
| API p95 (cached) | ≤ 150ms | ≤ 150ms |

## 2. Rendering strategy

- News pages: **server components + ISR** (`revalidate`: home 300s, verticals 300s, articles 3600s, quote pages 60s). Live bits (ticker, prices) are small client islands with SWR polling.
- Terminal: one client shell; every function component **lazy-loaded** (`next/dynamic`) so GP's chart lib doesn't load until first chart. lightweight-charts imported only inside chart components.
- Fonts: next/font (self-hosted, swap). Images: next/image, explicit sizes, priority only on hero.

## 3. Cache layers (matches doc 12)

1. **Browser/SWR** — client polling with `dedupingInterval`; SWR cache shared across components (one quote source of truth per symbol).
2. **Route handler cache** — in-memory LRU + Next data cache per TTL table (doc 12 §3).
3. **CDN** — `Cache-Control: s-maxage + stale-while-revalidate` on API responses (quotes: s-maxage=10, swr=60).
4. **DB** — news_items persisted; heavy RSS parsing happens on cron, not on request.

Request coalescing is mandatory: concurrent identical upstream fetches must share one promise (`lib/data/batch.ts`).

## 4. Polling discipline

- Only visible panels poll (IntersectionObserver + `document.visibilityState`).
- Global quote poller: components register symbols → single batched `/api/quotes` call per interval → fan out via SWR mutate. Never per-component polling loops.
- Market closed → poll interval drops to 5 min automatically (session calendar in `lib/market-hours.ts` for US + India sessions).

## 5. SEO & metadata

- `generateMetadata` on articles/quotes/verticals; JSON-LD (NewsArticle on articles, and FAQ where relevant); `sitemap.ts` + `robots.ts`; canonical URLs; OG image template (route handler generating simple branded OG cards).

## 6. Verification ritual (every phase)

1. `pnpm build` — check route sizes table against budget.
2. `agent-browser vitals` on /, /markets, /quote/AAPL, /terminal — record in doc 19 audit log.
3. Network tab: confirm batched quote calls, no waterfall of per-symbol requests.
4. Throttled 4G pass on home + terminal.
