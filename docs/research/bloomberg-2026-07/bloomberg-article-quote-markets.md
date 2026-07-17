# Bloomberg.com Public News Website — Mobile (375px) Design Research

Redesign reference for a competing financial news site. Covers the **Article page**, **Quote/security page**, and **Markets hub**. Scope: public news website only (not the Terminal app).

> **Sourcing note:** Bloomberg's live site + Wayback are behind Akamai/bot walls from our IP, and the session's `WebFetch` is intercepted by the context-mode hook, so no page DOM could be fetched directly. Findings below are triangulated from Code and Theory's own case study, published UX teardowns (Blue Label Labs, Medium critiques), Bloomberg's help/pricing pages, Nieman Lab, and Mobbin. Values shown are representative, not scraped live. Treat component structure as high-confidence and exact pixel/hex tokens as inference.

---

## 0. Global design language (applies to all three surfaces)

- **Modular, non-grid system** ("Lego blocks"). Code and Theory + Josh Topolsky built the page from snap-together modules (breaker modules, pull-quotes, package groupings) rather than a fixed grid or infinite feed. Layout changes section-to-section and day-to-day. On mobile this collapses to a **single-column stack of modules**.
- **Type:** primary UI face is **Neue Haas Grotesk / Helvetica-class sans**; Businessweek editorial uses the serif **Publico** for display/body. On the news site, expect **sans-serif for chrome/data and headlines**; body copy is the sans family (not a book serif). Known for *many* type styles per page (criticized for it) — high contrast between huge headlines and small metadata.
- **Motion + bold color** as wayfinding: gradient/animated headline treatments, white highlight behind headlines, orange/purple accents. Use color to signal story importance.
- **"Pathing" philosophy:** every module exists to move the reader down the page — a **reading-progress line at the very top of article pages**, and adjacent "relevant content" groupings next to each story package.
- **Metered paywall (dynamic):** ~10 free stories/month baseline, but *personalized* — a first-party cookie scores ~20 behavioral attributes and adjusts the meter per user. Free registered account extends the count. Video is not gated. Plan for a **dynamic meter + inline/overlay gate**, not a hard wall.

---

## 1. ARTICLE PAGE (mobile stack, top → bottom)

1. **Reading-progress indicator** — thin line at the very top tracking scroll position through the story. Distinctive Bloomberg signature; cheap to build, high polish.
2. **Kicker / eyebrow** — small caps category or franchise label above the headline (links to vertical). Colored accent.
3. **Headline** — large, tight-leading sans, dominant element. Single column full-bleed on 375px.
4. **Sub-headline / dek** — one or two lines, lighter weight.
5. **Byline + timestamp row** — author name(s), often with small avatar; publish/updated timestamp; sometimes reading time. Compact, small type, muted color.
6. **Share row** — horizontal icon row (X/Twitter, LinkedIn, Facebook, email, copy-link, gift-article). Often sticky or repeated at article end.
7. **Hero image** — full-bleed edge-to-edge on mobile, followed by a small **caption + credit** line in muted small type below.
8. **Body** — sans body copy, generous size for mobile readability, sentence case. Paragraphs interrupted by "breaker modules":
   - **Inline related-ticker chips** — small pill/chip showing `TICKER  price  ±change%` (color-coded green/red) linking to the quote page. Bloomberg's equivalent of Terminal "RELS."
   - **Pull-quotes** — large-type breaker module, a core wayfinding device.
   - **Inline images / charts** — full-bleed with caption.
   - **Inline newsletter card** mid-article — a boxed CTA ("Get [newsletter] in your inbox") with email field; part of the free-funnel/prospecting strategy.
   - **Ad slots** — in-body units between paragraphs; "scroll-connected" motion ad units are part of the design spec.
9. **Paywall gate** — after the free intro (often headline + byline + first sentence/graf visible), body fades into a **subscribe module** (price points historically **$34.99/mo** all-digital; **$39.99/mo** + Businessweek). Dynamic per-user positioning.
10. **"Read next" / related rail** — grouping of relevant content adjacent to the story package to entice continued reading (the "pathing" module). On mobile this is a stacked or horizontally-scrolling card list.
11. **More-from-vertical / most-read** modules, then footer.

**Buildable takeaways:** progress bar, kicker→headline→dek→byline→share→full-bleed hero→captioned, then a body that *interleaves* breaker modules (ticker chips, pull-quotes, newsletter card, ads) rather than a plain text column. Gate is dynamic, not fixed.

---

## 2. QUOTE / SECURITY PAGE (e.g. `/quote/AAPL:US`)

Documented to include: **stock price, stock chart, company news, key statistics, fundamentals, and company profile.** Mobile single-column order:

1. **Quote header** — Company name + exchange (`Apple Inc — NASDAQ GS`), ticker. Large **last price**, **absolute change** and **% change** color-coded green/red, with an up/down arrow. State/time flag (e.g. "As of…/ At close / Pre-market").
2. **Secondary price stats row** — Open, Prev Close, **Day Range** (low–high), 52-wk range, Volume. Often a compact 2-col label/value strip.
3. **Chart** with **timeframe tabs**: `1D / 5D / 1M / 6M / YTD / 1Y / 5Y` (horizontal pill/tab row above the chart). Sparkline-to-full-chart on tap; line chart primary.
4. **Key-stats grid** — 2-column label/value cells: **Market Cap, P/E (trailing/forward), EPS, Dividend / Yield, Beta, Shares Outstanding, 52-wk high/low, Volume / Avg Volume**. (Representative AAPL values seen elsewhere: mkt cap ~$4.6T, trailing P/E ~38, yield ~0.33%, beta ~1.10 — for realism only.)
5. **Company news list** — vertical list of headline + source + timestamp rows scoped to the security (e.g. "iPhone Price Hikes Will Come — Bloomberg Technology").
6. **Company profile / About** — short business description paragraph, sector/industry, sometimes HQ/employees.
7. **Related securities rail** — peer tickers as chips/cards with mini price + change (Bloomberg "RELS" analog), horizontally scrollable on mobile.

**Buildable takeaways:** header (price/Δ/%/range) → timeframe-tabbed chart → 2-col key-stats grid → security-scoped news list → profile → related-securities chip rail. The `1D/5D/1M/6M/YTD/1Y/5Y` tab set is the canonical timeframe control to replicate.

---

## 3. MARKETS HUB (`/markets`) + asset sub-hubs

**Mission framing:** "what's happening in stocks, bonds, currencies and commodities right now — and what will move them next."

**Sub-navigation pills (consistent across markets pages):**
`Stocks · Commodities · Rates & Bonds · Currencies · Futures · Sectors · Economic Calendar`
Plus top-level nav siblings: `News · Markets · Economics · Technology · Politics · Green · Crypto · AI`. Each asset class also has its own landing hub: `/markets/currencies`, `/markets/commodities`, `/crypto`, `/fx-center`, `/markets/watchlist`.

**Mobile hub organization (single-column module stack):**
1. **Index cards row** — key indices (S&P 500, Dow, Nasdaq, and regional/global indices) as cards showing **level, ± change, %**, color-coded, each with a **sparkline**. Horizontally scrollable card strip at top.
2. **Sub-nav pill bar** — the Stocks/Currencies/Commodities/Rates/Crypto pills (scrollable horizontal tab bar) that filter or jump to the asset board.
3. **Movers board** — gainers / losers / most-active, as sortable rows: `symbol + name | price | ±%` (color-coded), often with a small volatility/volume indicator.
4. **FX board** — major currency pairs with rates + change (from `/markets/currencies` + FX Center).
5. **Commodities board** — futures prices (oil, gold, etc.) with change + index comparison charts.
6. **Crypto board** — top coins price + change (`/crypto`).
7. **Rates & Bonds** — key yields (e.g. UST 10Y) rows.
8. **Sector performance** — sector list with % change heat-style rows (from `Sectors`).
9. **Interleaved markets news** modules between boards.

**Watchlist:** custom lists (app caps ~2 lists), each row = symbol + business name on the left, real-time price/change on the right; add via search + "Watch" action. Good pattern for a saved-symbols module.

**Buildable takeaways:** top scrollable **index-card strip with sparklines** → **scrollable asset sub-nav pill bar** → repeating **board modules** (movers, FX, commodities, crypto, rates, sectors), each a compact row list of `symbol | price | ±%` color-coded, with news modules interleaved.

---

## 4. Nav / tabs / toggles behavior summary

- **Top-level nav:** hamburger or condensed bar on mobile; sections listed above.
- **Markets sub-nav pills:** horizontal scrollable pill/tab bar; selecting filters the board / routes to the asset hub.
- **Quote-page timeframe tabs:** `1D/5D/1M/6M/YTD/1Y/5Y` pill row controlling the chart in place.
- **Article progress bar:** passive top-of-page scroll indicator.
- **Index/movers strips:** horizontal-scroll card carousels.
- **Paywall:** dynamic inline/overlay gate, personalized meter — not a fixed toggle.

---

## 5. Confidence & gaps

- **High confidence:** module taxonomy, sub-nav labels, timeframe tab set, paywall mechanics, "pathing"/progress-bar/breaker-module philosophy, price-quote field set.
- **Inferred (verify visually via Mobbin Bloomberg iOS flow / archived CSS):** exact pixel spacing, hex tokens, precise mobile ordering of boards, whether ticker chips render inline vs. end-of-article.
- **Could not fetch:** live/Wayback DOM (bot wall + hook-blocked WebFetch). Recommend a follow-up pass through Mobbin's Bloomberg flow for screenshot-level confirmation.

### Cited sources
- Code and Theory — [Bloomberg Business case study](https://www.codeandtheory.com/things-we-make/bloomberg-business)
- [Bloomberg.com's redesign — Jordan Crone, Medium](https://medium.com/@jordantheleast/bloomberg-com-s-redesign-the-good-the-bad-and-the-meh-c16bfa6b8ece) · [Mark Alexander critique](https://markofalexander.com/2017/02/21/bloombergs-redesign-is-a-fiasco/)
- [Markets — Bloomberg](https://www.bloomberg.com/markets) · [Currencies](https://www.bloomberg.com/markets/currencies) · [Commodities](https://www.bloomberg.com/commodities) · [Crypto](https://www.bloomberg.com/crypto) · [FX Center](https://www.bloomberg.com/fx-center) · [Watchlist](https://www.bloomberg.com/markets/watchlist)
- [AAPL:US Quote — Bloomberg](https://www.bloomberg.com/quote/AAPL:US)
- Paywall: [Talking Biz News](https://talkingbiznews.com/they-talk-biz-news/the-strategy-behind-bloombergs-subscription-paywall/) · [Nieman Lab pricing](https://www.niemanlab.org/reading/bloombergs-new-paywall-will-charge-users-34-99-a-month/) · [Bloomberg Help](https://www.bloomberg.com/help/question/how-can-i-get-full-access-to-all-of-the-articles-on-the-website/)
- UX teardown: [Blue Label Labs — Bloomberg app](https://www.bluelabellabs.com/blog/a-look-at-the-bloomberg-news-app-for-mobile/) · Screenshots: [Mobbin Bloomberg iOS flow](https://mobbin.com/flows/39d1b0ea-d3fc-4c58-a139-f8b031f0ccbd)
- Type: [Commercial Type — Businessweek](https://commercialtype.com/custom/bloomberg_businessweek) · [Fonts In Use](https://fontsinuse.com/uses/10/bloomberg-businessweek)
