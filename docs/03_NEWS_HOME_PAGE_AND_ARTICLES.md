# 03 — NEWS: HOME PAGE AND ARTICLES (SPEC)

Routes covered: `/` (home), `/news/[slug]` (article), `/live/[slug]` (live blog).
Extended layout variants in `28_NEWS_ARTICLE_LAYOUTS.md`.

## 1. Home page `/`

### Layout (top → bottom)
1. **UtilityBar** — AKASH logo, nav (Markets, Economics, Tech, Politics, Crypto, AI, Opinion, हिंदी), omnibox search, Sign in, "Open Terminal" CTA.
2. **TickerStrip** — auto-scrolling strip; ~14 instruments (^GSPC, ^IXIC, ^DJI, ^NSEI, ^BSESN, ^FTSE, ^N225, CL=F, GC=F, BTC-USD, EURUSD=X, USDINR=X, ^TNX, ETH-USD). Each: symbol, last, change%, green/red. Click → `/quote/[symbol]`. Data from `/api/quotes?symbols=...` (cached 15s server-side). If a symbol fails → omit it, never show a fake value.
3. **BreakingBanner** — hidden by default; shown when a feed item is tagged breaking (rule: headline contains configured breaking keywords within last 30 min). Red band, single headline, dismissible.
4. **LeadModule** — hero story (large image, 40-56px headline) + 4 stacked secondary stories with source + relative time.
5. **MarketSnapshotBand** — 4-6 cards: index name, sparkline (last 1D from chart API), last, change%. Links to `/markets`.
6. **SectionBands** — Markets, Technology, Economics, Crypto, Politics. Each: section header link + 4 story cards (1 with image, 3 text). Powered by categorized RSS ingestion.
7. **BigTakeBand** — dark background band, 1-2 longform features with large art.
8. **LiveTVModule** — embedded/linked live stream card (see doc 34) + schedule preview.
9. **OpinionBand** — 3-4 opinion cards with author avatar + name emphasized.
10. **NewsletterBand** — 3 newsletter cards + email input (see doc 29).
11. **MostReadRail** — right rail on desktop (numbered 1-5), inline block on mobile.
12. **Footer** — full sitemap, Hindi link, terminal link, legal, "data by" attribution.

### Home data flow
- Server component. RSS ingestion runs in a route handler with `revalidate: 300` (5 min). Quotes cached 15s. Layout config in `lib/home-layout.ts` so editors (or Claude Code) can reorder blocks without touching components.

## 2. Article page `/news/[slug]`

### Anatomy
1. Kicker (vertical name, colored) → Headline (display font, text-balance) → Dek → Byline row (source attribution, published + updated timestamps, reading time) → Share row.
2. Hero media (image with caption/credit).
3. **KeyPoints** — 3-bullet wire-style summary at top (Reuters pattern).
4. Body column ~680px, 18px+ body text, leading-relaxed. Supports: paragraphs, subheads, pull quotes, embedded charts (`<ArticleChart symbol="AAPL" range="1mo" />`), inline **TickerChip** (live price pill inside sentences), image blocks, related-link callouts.
5. Right rail: MostRead, related stories, newsletter card, market snapshot mini.
6. Bottom: "More from [vertical]" band, previous/next.

### Aggregated vs original
- **Aggregated story page**: shows source, excerpt (short, attributed), key points, link out prominently ("Read full story at Reuters →"). We do not republish full third-party text.
- **Auto market recap** (original): template-composed from real fetched data only; labeled "AKASH Market Recap — auto-generated from live data".

## 3. Live blog `/live/[slug]`

- Pinned summary card at top (what's happening, updated timestamp).
- Reverse-chron entries: timestamp, headline, 1-3 paragraphs, optional chart/quote chip.
- Auto-refresh via polling (30s) with "N new updates" pill; do not jump scroll position.
- Red "LIVE" pulse badge in header and on cards linking here.

## 4. Components to build (news side)

```
components/news/
  utility-bar.tsx        ticker-strip.tsx       breaking-banner.tsx
  lead-module.tsx        story-card.tsx         section-band.tsx
  market-snapshot.tsx    big-take-band.tsx      opinion-band.tsx
  newsletter-band.tsx    most-read-rail.tsx     live-tv-module.tsx
  article/key-points.tsx article/ticker-chip.tsx article/article-chart.tsx
  article/pull-quote.tsx article/byline.tsx     live/live-entry.tsx
```

## 5. Acceptance checklist

- [ ] Ticker strip shows only real quotes; failed symbols disappear gracefully.
- [ ] Home renders with zero layout shift from ticker/quote loads (fixed heights + skeletons).
- [ ] Article inline ticker chips show live price and link to quote page.
- [ ] Live blog polls without scroll jumps.
- [ ] All timestamps are real feed timestamps, relative format ("14 min ago").
- [ ] Aggregated content always attributes and links to the source.
