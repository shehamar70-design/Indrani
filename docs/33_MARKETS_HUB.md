# 33 — Markets Hub (news-site side)

> `/markets` — the Bloomberg.com "Markets" section equivalent: the data-rich public page. Phase 2. Reuses terminal data APIs with a light theme.

---

## Page structure (`/markets`)

```
[Ticker tape strip — global, persists across news site, 15s refresh]
[H1: Markets + "as of HH:MM IST" live timestamp]

[Overview band — 4 index hero cards]
  Nifty 50 | Sensex | S&P 500 | Nasdaq — big price, chg, 1D sparkline

[Main grid: 2/3 + 1/3]
LEFT:
  - Featured chart: tabbed big chart (Nifty/S&P/USDINR/Gold/BTC),
    ranges 1D 5D 1M 6M 1Y 5Y
  - Markets news feed (RSS markets category, docs/30 pipeline)
  - Daily Markets Wrap card (docs/28 layout C) when published
RIGHT:
  - Movers: top gainers / losers tabs (US free coverage; India if source
    supports, else omit — never fake)
  - FX board (majors, docs/32 registry)
  - Commodities mini-board
  - Crypto mini-board
  - Today's economic calendar (top 3, docs/31)
```

## Sub-pages

| Route | Content |
|---|---|
| `/markets/stocks` | Index boards by region + movers + sector performance (compute from constituent ETFs, e.g. XLK/XLF; label methodology) |
| `/markets/currencies` | Full FX boards + cross matrix (light theme) |
| `/markets/commodities` | Energy / metals / agriculture boards + featured charts |
| `/markets/crypto` | Crypto boards, 24h stats, BTC dominance if computable from live caps |
| `/markets/quote/[symbol]` | PUBLIC quote page: price header, chart, key stats (range, 52wk, mcap, P/E from Yahoo quoteSummary), company profile, related news (docs/30 CN pipeline) |

## Quote page (`/markets/quote/[symbol]`) — most important sub-page

- SEO: `generateMetadata` with live-less template ("AAPL Stock Price & News — Akash"); JSON-LD
- Price header updates client-side (15s); everything below is server-rendered with 5-min revalidate
- "Open in Terminal" button → `/terminal?cmd=AAPL GP` (deep link, docs/07 URL command param)
- Invalid symbol → clean 404 with search box

## Shared with terminal

- SAME API routes (`/api/quote`, `/api/chart`, `/api/news`) — no duplicate data layer
- SAME symbol registries (docs/32)
- Different theme: light surface, editorial typography (docs/15 news tokens)

## Ticker tape strip (site-wide component)

- Symbols: `^NSEI, ^BSESN, ^GSPC, ^IXIC, USDINR=X, GC=F, CL=F, BTC-USD`
- Marquee pause on hover; click → quote page; keyboard accessible (it's a list, not just animation); respects `prefers-reduced-motion` (static grid fallback)
