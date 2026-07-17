# Financial News Website Layout Patterns 2026 — Cross-Referenced for Indrani

Research date: 2026-07-13. Goal: give Indrani (India + global financial news, Hindi toggle) a cross-referenced set of best desktop patterns without cloning any single site.

Method per site: `ctx_fetch_and_index` (real browser render of live homepage + markets page + article) plus WebSearch design writeups. Reuters (DataDome captcha) and FT (Cloudflare) blocked full DOM fetch — FT structure recovered from its design-system CSS; Reuters from search + prior knowledge, flagged below.

---

## Per-site findings (buildable specifics)

### Yahoo Finance — finance.yahoo.com  (best data-module reference)
- **Markets modules**: `Trending tickers`, `Top gainers`, `Top losers`, `Most active`, each a compact list row = `SYMBOL · Name · Price · +/-Change (Change%)`, change color-coded green/red. World Indices, **sector heatmap** + **crypto heatmap** as separate leaves.
- **Live plumbing**: dedicated `sparkLine`, `ticker`, `streamer` JS modules → real-time streaming quotes + inline sparklines. Refresh 20s.
- **Right rail = "dock"**: portfolio, watchlist, recently-viewed, top gainers modules; sign-in gated. Modules are position-ordered (marketSummary→portfolio→watchlist→recentlyViewed→topGainers).
- **Dark mode** first-class (`enableDarkMode`). Newsletter modules: *Morning Brief*, *Daily Movers*.
- Movers pages are their own routes: `/markets/stocks/gainers`, `/losers`, `/most-active`, `/trending`, plus crypto equivalents. Good IA to copy.
- Source: https://finance.yahoo.com/ , https://finance.yahoo.com/markets/

### WSJ — wsj.com/market-data  (best data-integrity + edition-toggle reference)
- **FactSet-powered**, explicitly labeled: Stocks, Indexes, **Markets Diary**, **Stock Movers** (gainers/decliners/most actives), **ETF Movers**, Bonds, Currencies, Commodities/Futures. Data-source attribution shown (FactSet, Dow Jones, Tullett Prebon, Lipper) — trust signal.
- **Table-driven** market-data layout (`display:table`), max content width **1500px**.
- **Edition toggle in masthead**: English / 中文 / 日本語 (separate localized sites, not inline translation) — the cleanest model for Indrani's Hindi/English switch.
- Type: Retina / Retina Narrow (narrow face for dense number tables).
- Source: https://www.wsj.com/market-data

### CNBC — cnbc.com / cnbc.com/markets  (best homepage-package + article reference)
- **Homepage grid = named "Column packages"**: `singleLeadRightPackage` (dark navy #071d39 hero: one lead story + stacked right list), `imageDenseLeft` / `imageDenseRight` (image + tight text column at 33%/66% splits), `standardBreakerCard`, `squareMedia`. Card titles font-weight 500.
- **Article "Key Points" box** (`Summary` module): 960px, navy #002f6c uppercase title, bulleted takeaways above the body — signature scannable summary. Body width 960→630px responsive. Auto-links `tickerSymbols`.
- Inline **PRO / Investing Club** upsells + newsletter signup. Mini-quote + AddToWatchlist widgets. Proxima Nova.
- Markets overview module placed front-and-center per their own redesign principle (larger feature image + larger scannable text).
- Sources: https://www.cnbc.com/markets/ , https://product.cnbc.com/post/149425679653/preview-our-new-homepage

### FT — ft.com  (best editorial-grid + brand reference)
- **Origami "o3" design system**: responsive grid **4 cols (mobile) → 8 (≥740px) → 12 (≥1024px)**, max content **1320px**, gutter 16px→24px. CSS grid with named bleed areas.
- **Signature "paper" background** `#fff1e5` (salmon/pink) + teal `#0d7680` accent — instant brand recognition without a logo.
- Type pairing: **Financier Display** (serif headlines) + **Metric** (sans body/UI). Editorial, asymmetric, type-first heroes.
- Full DOM blocked (Cloudflare); grid + palette above are from live o3 CSS.
- Source: https://www.ft.com/

### Reuters — reuters.com/markets  (blocked; from search + known patterns)
- Full fetch blocked by DataDome captcha. Known current pattern: speed-first wire layout — dense reverse-chron headline list with small thumbnails, minimal chrome, prominent timestamps ("ago"), topic rails (Markets/Business/World). Treat as *secondary* reference given no primary DOM capture.
- Source: https://www.reuters.com/markets/ (captcha-gated), https://www.tradingview.com/news/providers/reuters/

### Livemint — livemint.com/market  (India: best index-header + article reference)
- **Index header**: **Nifty** and **Sensex** as large headline numbers up top, with **NSE/BSE toggle**, then a scannable index list (India VIX, NIFTY 100, NIFTY 50, NIFTY LargeMidCap 250, BSE 100) each = name + level + %change, "View More" → `/market/india-indices-nse`. Schema.org `Table` "Markets Dashboard".
- **Sticky market strip** on articles (`market-strip-container`, 69px).
- **Featured mutual-fund cards** with inline "Invest" CTA (monetized product row).
- **Article**: 992px container, body = `calc(100% - 320px)` + **320px right rail**. Inter font. Round 44px author avatars, multi-author row; **"X min read · date"** timestamp; `sepStory` separators for stacked/continuous next-story scroll; labeled inline ads; analyst **disclaimer** block.
- **Hindi**: same template via `hindiContent` class / livemint.com/hindi (separate edition).
- Sources: https://www.livemint.com/market , https://www.livemint.com/market/stock-market-news/spacex-extends-losses-hovers-near-ipo-price-after-39-plunge-from-peak-11783959405363.html

### Moneycontrol — moneycontrol.com/markets  (India: best breadth/IA reference)
- **4-column mega-menu** (`market_menu li{width:25%}`) covering FII & DII Activity, Corporate Action, PRO Stock Lists, Seasonality Analysis, ETFs, Crypto Dashboard, Technicals.
- **Ticker** (relaunched): user-configurable — Nifty, Sensex, Watchlist, Portfolio. **Gift Nifty** dedicated page. **Stock Score** (40+ params) badge on stocks.
- Heavy **PRO / AD-Lite / Super PRO** tiering baked into layout (multiple logo variants swap by membership). Lato font. Sticky bottom nav (6 tabs) on mobile/wap.
- Sources: https://www.moneycontrol.com/markets/ , https://www.moneycontrol.com/news/business/markets/

### Economic Times Markets — economictimes.indiatimes.com/markets  (India: best movers-widget reference)
- **Market band** with **Top Gainers / Top Losers** tab toggle; **Sensex/Nifty live-blog** ("Sensex Today | Nifty 50 Live Updates") pinned. Indices leaf with gainers/losers.
- **Carousel/slider** component (arrow buttons, dots) for story packages. Thumbnails via `img.etimg.com/thumb/width-115,height-86` (server-side crop params).
- Rich sub-sections: Screener, Technicals, Mind Over Money, Web Stories, Markets Data, The Golden Thumb Rule.
- **Hindi**: ET Hindi sister edition (separate site).
- Source: https://economictimes.indiatimes.com/markets

---

## Company logos on movers/quote rows  (important 2026 change)
- **Clearbit Logo API is SUNSET (Dec 2025)** after HubSpot acquisition — do **not** build on `logo.clearbit.com`.
- Use ticker-aware replacements:
  - **Logo.dev** — `img.logo.dev/ticker/AAPL` (built by ex-Clearbit team; dark/light variants; crypto + ticker + name lookup; free tier 500K/mo). Recommended default.
  - **LogoKit** — 50M+ logos incl. ETFs/crypto, NYSE/NASDAQ/LSE/**BSE-relevant exchanges**, ticker + ISIN, <100ms.
  - **Ticker Logos (AllInvestView)** — free, no API key, lookup by ticker or domain.
- Note: none of the 8 sites expose a public third-party logo CDN on movers rows (they self-host); logos are optional polish, not table stakes. For Indian tickers verify NSE/BSE symbol coverage before committing.
- Sources: https://clearbit.com/changelog/2025-06-10 , https://www.logo.dev/clearbit , https://logokit.com/clearbit-alternative , https://www.allinvestview.com/ticker-logos-vs-clearbit/

---

## Indian-specific patterns (Sensex/Nifty, rupee, Hindi)
- **Index header treatment** (Mint + MC + ET all agree): Nifty + Sensex as the two hero numbers, level + point change + %, color-coded, with **NSE/BSE source toggle** and **Gift Nifty** (pre-market signal) — India expects these two named indices front-and-center, not a generic "S&P 500" slot.
- **Movers as tabbed widget** (ET, MC): Top Gainers ⇄ Top Losers toggle in one card.
- **Rupee / bonds**: prominent bonds + FX rail (Mint has dedicated Bonds section; rupee moves headlined with oil/RBI context). Give INR/USD + 10Y G-Sec a fixed strip slot.
- **Vernacular**: all three run **separate Hindi editions** (subdomain/edition, shared template), *not* an inline translate button. 70%+ of Indian internet users prefer native-language content; finance is a high-preference category (Tier-2/3). Model Indrani's toggle as a **hi/en edition switch** (like WSJ's language switch), sharing one component template.
- Sources: https://www.livemint.com/market , https://www.moneycontrol.com/markets/ , https://economictimes.indiatimes.com/markets , https://www.justwords.in/blog/regional-language-content-marketing-india/

---

## Cross-cutting 2026 design consensus (writeups)
Grid-based structured layouts; strong visual hierarchy (size/space/weight); **dark mode** for dense data; mobile-first (~63% traffic); trust signals + data-source attribution near numbers; restrained **micro-interactions** on live tickers (numbers animate softly on change); **static hero over carousel** (carousels hurt CTR/SEO — note ET still uses one). "Top sites share conviction, not an aesthetic."
- Sources: https://www.stripedhorse.com/blog/best-financial-website-designs , https://www.ballistic.media/blog/fintech-website-designs , https://www.webstacks.com/blog/fintech-websites , https://lexingtonthemes.com/blog/stunning-hero-sections-2026

---

## Patterns ranked by usefulness for Indrani

| # | Pattern | Steal from | Why |
|---|---------|-----------|-----|
| 1 | **Nifty+Sensex hero index header** with NSE/BSE toggle + Gift Nifty | Mint / MC / ET | Non-negotiable for an India audience; unanimous across Indian leaders |
| 2 | **Compact mover row** `logo · SYMBOL · Name · Price · Δ%` color-coded | Yahoo | Cleanest reusable atom; drives watchlist/quote/movers/ticker |
| 3 | **Tabbed Gainers⇄Losers card** + dedicated movers routes | ET / Yahoo | Dense info in one slot; SEO-friendly leaf pages |
| 4 | **Hindi as edition switch** on shared templates | WSJ / MC-ET-Mint | Matches proven Indian vernacular model; avoids brittle inline translate |
| 5 | **CNBC "Key Points" summary box** on articles | CNBC | Scannability; high perceived quality; cheap to build |
| 6 | **Article: ~960–992px body + 320px right rail**, min-read+timestamp, round author avatar, disclaimer | Mint / CNBC | Standard, trusted financial article shell |
| 7 | **Live ticker strip + sparklines** via streaming module; soft number animation | Yahoo | Signals "live"; use SSE/WebSocket + 15–20s poll fallback |
| 8 | **Data-source attribution** (e.g. "Source: NSE/BSE, 15-min delay") | WSJ | Trust + legal cover; India exchanges require delay labels |
| 9 | **FT-style 12-col / 1320px editorial grid** + distinct brand paper color & serif/sans pairing | FT | Own-able identity so Indrani isn't a Yahoo clone |
| 10 | **CNBC "Column packages"** (single-lead + dense image columns) for homepage bands | CNBC | Flexible homepage grid vocabulary |
| 11 | **Logo.dev/LogoKit ticker logos** (NOT Clearbit) | — | Clearbit dead Dec 2025; verify NSE/BSE symbol coverage |
| 12 | **Dark mode + restrained micro-interactions** | consensus | 2026 baseline for dense financial UI |

Deliberately *not* recommended: homepage carousels (ET's slider — low CTR/SEO), heavy membership-tier logo swapping (Moneycontrol's PRO/AD-Lite complexity), Reuters as a primary layout reference (couldn't capture DOM).
