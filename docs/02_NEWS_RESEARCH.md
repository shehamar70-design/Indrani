# 02 — NEWS RESEARCH (Bloomberg.com + peers)

Deep research on how Bloomberg.com and its peers structure a financial news product. Use this to inform every news-side spec (03, 04, 05, 28, 29, 33, 34).

## 1. Bloomberg.com — site map (observed)

```
Home
├── News verticals: Markets · Economics · Industries · Technology · Politics · Green · Crypto · AI
├── Work & Life: Wealth · Pursuits · Businessweek · CityLab · Sports · Equality · Management & Work
├── Market Data: Stocks · Commodities · Rates & Bonds · Currencies · Futures · Sectors · Economic Calendar
├── Explore: Newsletters · Explainers · The Big Take · Quizzes · Games (Alphadots) · Pointed
├── Media: Live TV · Radio · Podcasts · Video · BTV schedule
└── Opinion
```

## 2. Bloomberg homepage anatomy

1. **Top utility bar** — logo, main nav, search, sign-in, subscribe CTA.
2. **Market ticker strip** — horizontally scrolling indices/futures/FX with green/red change (S&P, Nasdaq, Dow, FTSE, Nikkei, crude, gold, BTC, EUR/USD, 10Y yield).
3. **Breaking news banner** — appears only during breaking events; red/urgent styling.
4. **Lead module** — 1 hero story (huge headline + image) with 2-4 related stories stacked beside it.
5. **Modular blocks** — editor-resizable content blocks, NOT a rigid grid. Mixed sizes: single-story features, 3-up rows, list stacks with tiny thumbnails.
6. **Section bands** — Markets, Technology, Politics etc., each a horizontal band with a section header link.
7. **Live TV promo module** — thumbnail of current broadcast + "Watch Live".
8. **Newsletter promos**, **Big Take band** (longform, big art), **Opinion band** (columnist headshots), **most-read rail**.
9. **Footer** — massive sitemap, legal, terminal ad.

## 3. Bloomberg article page anatomy

- Kicker (section label) → Headline (very large serif/display) → dek (standfirst) → byline + timestamps (published/updated) → hero media.
- Body: wide readable column (~680px), larger fonts, inline tickers that show live price chips, embedded charts, pull quotes, "Read more" related links inline.
- Right rail: most-read, related, newsletter signup.
- Paywall: metered; subscriber-only badges on some content.
- Live blogs: reverse-chron updates with timestamps, pinned summary at top, auto-refresh.

## 4. What peers do better (features to absorb)

| Platform | Best feature | Absorb into AKASH |
|---|---|---|
| Reuters | Terse wire headlines, speed, "just the facts" summaries | Wire-style latest-news rail; 3-bullet summaries on articles |
| CNBC | Live TV front and center; pre-market/after-hours coverage | TV module on home; pre/post-market ticker states |
| WSJ | Clean typography, strong opinion section | Opinion vertical with columnist identity |
| FT | Premium newsletters, myFT following | Newsletter center; follow topics/tickers |
| TradingView | Charting, ideas feed, symbol pages | Terminal GP charts; rich symbol pages on news site |
| Koyfin | Dashboards, fundamental graphs | Markets hub dashboard cards; FA function in terminal |
| Yahoo Finance | Simple quote pages, portfolios, SEO | Public `/quote/[symbol]` pages on the news site |
| Investing.com | Economic calendar UX | ECO calendar design (importance stars, actual/forecast/previous) |

## 5. News content strategy (since we have no wire service)

AKASH aggregates **real headlines** from free RSS feeds and links to sources (aggregator model, like Techmeme/Google News):
- Reuters top news RSS, CNBC RSS, MarketWatch RSS, Yahoo Finance RSS per ticker, PIB/RBI press releases, Economic Times RSS (for India/Hindi), CoinDesk RSS (crypto), FRED releases (macro).
- Each story card shows: source name, real headline, real timestamp, link out (or summarized excerpt with attribution).
- Original "AKASH" content = auto-generated *market recap* pages built ONLY from real fetched numbers (e.g., "Sensex closed up 1.2% at 81,455") — every figure from the data layer, template-composed, clearly labeled as auto-generated.
- NEVER fabricate quotes from people or invent events.

## 6. Research takeaways → requirements

1. Ticker strip on every news page (shared component, cached quotes).
2. Modular homepage blocks driven by a layout config, not hardcoded.
3. Inline ticker chips inside article text that show live price + change.
4. Live blog machinery for breaking events.
5. Section bands must be reusable (one component, many verticals).
6. Search across articles + tickers + functions (one omnibox).
