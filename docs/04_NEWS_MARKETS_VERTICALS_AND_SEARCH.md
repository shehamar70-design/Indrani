# 04 — NEWS: MARKETS, VERTICALS AND SEARCH (SPEC)

Routes: `/markets` (hub — full spec in doc 33), `/quote/[symbol]`, `/[vertical]`, `/search`.

## 1. Vertical pages `/{markets|economics|technology|politics|crypto|ai|green|wealth|opinion}`

- Shared template: vertical header (name, one-line description, accent color), lead story module, story list (paginated, 20/page), right rail (most read in vertical, relevant market snapshot — e.g., crypto vertical shows BTC/ETH/SOL).
- Vertical config in `lib/verticals.ts`: `{ slug, name, nameHi, accent, feeds: [rssUrls], snapshotSymbols }`.
- Opinion vertical variant: author-forward cards (avatar, name, title above headline).

## 2. Public quote page `/quote/[symbol]` (Yahoo-Finance-style, SEO surface)

1. Header: name, symbol, exchange, live price (large), change/% (green/red), pre/post-market note when applicable, "Open in Terminal" button → `/terminal?fn=DES&s=SYMBOL`.
2. Chart: range tabs 1D · 5D · 1M · 6M · YTD · 1Y · 5Y · MAX (area chart, red/green fill by direction).
3. Stats grid: open, high, low, prev close, volume, avg volume, market cap, P/E, EPS, 52w high/low, dividend yield — **only fields the API actually returned**; missing fields render "—".
4. News: ticker-filtered headlines (Yahoo RSS per symbol).
5. Related symbols row (same sector/index membership when available).
- `generateMetadata` per symbol for SEO. ISR with 60s revalidate + client polling for the live price only.

## 3. Search `/search?q=` + omnibox

The omnibox (in UtilityBar and Terminal) resolves, in priority order:
1. **Ticker match** — exact/prefix symbol match (local symbol directory + Yahoo search API) → quote page.
2. **Function match** (terminal context) — `GP`, `TOP`, `ECO`... → run function.
3. **Article match** — full-text over ingested headlines/summaries (Postgres `tsvector` on Neon).

Search results page: tabs All · News · Symbols. Symbol results show live mini-quote. Keyboard: `/` focuses omnibox anywhere on the news site; arrows + Enter navigate results.

## 4. Symbol directory

`lib/symbols.ts` + DB table `symbols(symbol, name, name_hi, exchange, type, sector)` seeded with: major US stocks (S&P 100), NSE top 100, global indices, major FX pairs, futures (CL=F, GC=F, SI=F, NG=F...), top 50 crypto. Used for search, related rows, and validation before calling quote APIs (prevents junk API calls).

## 5. Acceptance checklist

- [ ] Every vertical uses the shared template with config-driven feeds.
- [ ] Quote page never renders invented stats; missing = "—".
- [ ] `/` key focuses search globally; Esc closes.
- [ ] Unknown symbol → clean 404-style "Symbol not found" with search suggestions.
- [ ] Quote pages have correct OpenGraph metadata (symbol, price snapshot).
