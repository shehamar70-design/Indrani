# 18 — Security & Fallbacks

> Non-negotiable security rules + the fallback chain that keeps the app alive when any data source fails.

---

## 1. Security Rules (MUST follow)

### 1.1 Secrets
- ALL API keys live in environment variables. NEVER hardcode a key in source code.
- NEVER expose keys to the client. All external API calls go through Next.js Route Handlers / Server Actions.
- `.env.local` is gitignored. Provide `.env.example` with variable names only.
- Required env vars (MVP): `DATABASE_URL`, `BETTER_AUTH_SECRET`. Optional: `FINNHUB_API_KEY`, `FRED_API_KEY`, `AI_GATEWAY_API_KEY`.

### 1.2 Input validation
- Every API route validates input with Zod before touching data.
- Ticker symbols: whitelist regex `^[A-Z0-9.^=\-]{1,12}$` — reject anything else.
- Search queries: max length 100, strip HTML.
- Parameterized queries only (Drizzle handles this) — never string-concatenate SQL.

### 1.3 Auth security
- Better Auth built-in password hashing (scrypt). Never roll your own.
- Session cookies: httpOnly, secure, sameSite=lax.
- Every query that touches user data (watchlists, alerts, portfolio, preferences) MUST filter by session `userId`. Neon has no RLS — per-query scoping is mandatory.
- Rate limit auth endpoints: 5 attempts / 15 min per IP (in-memory Map is fine for MVP).

### 1.4 Headers & misc
- Set security headers in `next.config.mjs`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- No `dangerouslySetInnerHTML` with unsanitized content. Sanitize RSS HTML with a whitelist (e.g. `sanitize-html`).
- External links: `rel="noopener noreferrer"`.

---

## 2. Fallback Chain (REAL DATA rule)

**Never show fake data as real. Never invent numbers.** For every data area:

```
primary source → secondary source → cached copy (marked "delayed") → "unavailable" state
```

| Data | Primary | Secondary | Cache TTL | Unavailable state |
|---|---|---|---|---|
| Stock quotes | Yahoo Finance | Finnhub | 10–30s | Gray dash "—" + "data unavailable" |
| Crypto | Binance WS/REST | Yahoo (`BTC-USD`) | 5s | same |
| Historical charts | Yahoo chart API | Finnhub candles | 5 min | Empty chart + retry button |
| News | RSS multi-feed | cached feed | 5 min | Last cached items + "as of HH:MM" |
| Macro/economic | FRED | cached | 1 hour | "—" |

### Rules
- If primary fails/times out (>3s), automatically try secondary.
- If both fail, serve cache but visually mark it: "Delayed — as of 10:42 AM".
- If no cache exists, render an explicit unavailable state. NEVER placeholder numbers.
- If two sources disagree on a value, prefer the most recently updated; log the discrepancy.
- Circuit breaker: after 5 consecutive failures for a source, skip it for 60s.

## 3. Error handling pattern

```ts
// lib/data/safe-fetch.ts — every provider call goes through this
export async function safeFetch<T>(
  providers: Array<() => Promise<T>>,
  cacheKey: string,
  ttlMs: number
): Promise<{ data: T | null; source: string; stale: boolean }> {
  // 1. fresh cache hit → return
  // 2. try providers in order with 3s timeout each
  // 3. on success → write cache, return { stale: false }
  // 4. all fail → return stale cache if any { stale: true }
  // 5. else → { data: null }
}
```

Every UI component that renders market data must handle: `loading`, `live`, `stale`, `unavailable`.
