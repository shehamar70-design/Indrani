# 12 — API AND DATA SOURCES

The data layer is the foundation. **Real data only. Multi-source. Fallback chains. Aggressive caching.**

## 1. Source inventory (all free)

| Source | Data | Access | Limits | Notes |
|---|---|---|---|---|
| Yahoo Finance (via `yahoo-finance2` npm) | Quotes, charts/OHLCV, fundamentals, search, screeners, per-ticker news RSS | Unofficial, no key | Unofficial — can break/rate-limit | PRIMARY for quotes/charts/fundamentals. Server-side only, cached hard |
| Finnhub | Real-time quotes (stocks/FX/crypto), company profile, basic news | Official free key | 60 req/min | SECONDARY quotes fallback. `FINNHUB_API_KEY` env var |
| Binance public API + WS | Crypto spot prices, klines, 24h stats | Official, no key | Generous public limits | PRIMARY for crypto; websocket for live BTC/ETH on terminal |
| FRED | 800k+ macro series, release calendar | Official free key | 120 req/min | PRIMARY macro/economic data. `FRED_API_KEY` env var |
| RSS feeds | News headlines | Public | Poll politely (5 min) | Reuters, CNBC, MarketWatch, Yahoo per-ticker, CoinDesk, ET/ET-Hindi, BBC Hindi, RBI/PIB |
| exchangerate.host / frankfurter.app | FX daily rates | Official free | Generous | FX fallback for FXC matrix |

## 2. Provider abstraction (must-build)

```
lib/data/
  types.ts          — Quote, Candle, Fundamentals, NewsItem, CalendarEvent, SourceMeta
  providers/
    yahoo.ts        — yahoo-finance2 wrapper (quote, chart, quoteSummary, search, screener)
    finnhub.ts      — quote fallback
    binance.ts      — crypto REST + WS klines/tickers
    fred.ts         — series + releases calendar
    rss.ts          — multi-feed fetcher/parser/normalizer/dedup
    fx.ts           — frankfurter fallback
  chain.ts          — getQuote(symbol): try yahoo → finnhub → binance(crypto) → cache → UNAVAILABLE
  cache.ts          — in-memory LRU + Next.js data cache; per-type TTLs
  batch.ts          — request coalescing: N symbols → 1 upstream call; in-flight dedup
```

Every returned value carries `SourceMeta { source, fetchedAt, isStale }` — the UI renders data age from this.

### Fallback chain rules
1. Try primary. On error/timeout (3s) → try secondary.
2. On total failure → serve last cached copy flagged `isStale: true` (UI shows amber "delayed" tag) if within max-stale window (quotes: 15 min).
3. Beyond max-stale → return UNAVAILABLE; UI renders the honest empty state.
4. Circuit breaker: 5 consecutive provider failures → skip that provider for 60s.
5. If two sources disagree materially (>1% on same instrument), prefer the fresher timestamp and log the discrepancy (doc 27 source notes).

## 3. Cache TTL policy

| Data | TTL (server) | Client poll |
|---|---|---|
| Quotes (market open) | 10-15s | 10s (visible panels only) |
| Quotes (market closed) | 5 min | none |
| Intraday candles (1m) | 30s | 30s on GIP |
| Daily candles | 10 min | — |
| Fundamentals | 24h | — |
| RSS news | 5 min | 60s (TOP panel) |
| ECO calendar (FRED releases) | 1h | — |
| FX matrix | 60s | 60s |
| Symbol search | 1h | — |

## 4. API routes (Next.js route handlers — the ONLY way clients get data)

```
GET /api/quotes?symbols=A,B,C        → batched quotes (max 50)
GET /api/chart?symbol=&range=&interval=
GET /api/fundamentals?symbol=
GET /api/news?category=|symbol=&limit=
GET /api/calendar?from=&to=&region=
GET /api/movers?kind=gainers|losers|actives&region=
GET /api/search?q=
GET /api/fx?base=
WS/poll: crypto live via /api/crypto-stream (or client Binance WS direct — public, keyless)
```
Rules: keys never reach the client; validate inputs with zod; rate-limit per IP (doc 18); responses include `meta: { source, fetchedAt, stale }`.

## 5. RSS ingestion pipeline

- `lib/data/providers/rss.ts` fetches configured feeds (parallel, 5s timeout each), parses (fast-xml-parser), normalizes to `NewsItem { id(hash), title, url, source, publishedAt, category, symbols?, imageUrl?, summary? }`, dedups by URL/title-hash, sorts by time.
- Category mapping per feed config; ticker extraction by matching $SYMBOLS and known company names from the symbol directory.
- Persist recent items to Neon (`news_items` table) for search + most-read; serve from DB with 5-min refresh cron (Vercel cron) or on-demand revalidation.

## 6. Environment variables

```
DATABASE_URL              (Neon)
BETTER_AUTH_SECRET
FINNHUB_API_KEY           (free registration)
FRED_API_KEY              (free registration)
```
Yahoo/Binance/RSS/frankfurter need no keys.

## 7. Acceptance checklist

- [ ] Kill Yahoo (simulate) → quotes still serve via Finnhub/cache; UI shows delayed tag.
- [ ] 30-symbol watchlist = 1 upstream batched call.
- [ ] No API key ever appears in client bundle (verify with build output scan).
- [ ] Every UI number traceable to `SourceMeta`.
- [ ] All providers behind the chain — no component calls a provider directly.
