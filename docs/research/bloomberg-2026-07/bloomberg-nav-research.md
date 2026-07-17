# Bloomberg.com Public News Site — Navigation, Sub-Nav Pills & Personalization (2026 research)

**Scope:** Public news website only (NOT Terminal), desktop ~1440px.
**Methods & reliability:**
- LIVE `https://www.bloomberg.com/` — **BLOCKED** by Akamai "Are you a robot?" wall from our IP (both context-fetch and headless Chrome hung/returned the bot interstitial). Documented, not usable.
- **Wayback `/markets` capture — FULLY RENDERED** real page (2.7 MB, 24 chunks). Primary source: `https://web.archive.org/web/20251231121702/https://www.bloomberg.com/markets` (captured 2025-12-31).
- **CSS-stripped DOM screenshots** confirm exact IA order: `/home/ubuntu/pw-audit/out/wb-home-00.png`, `wb-home-01.png`, `wb-home-04.png`, `wb-home-05.png`.
- WebSearch + `https://www.bloomberg.com/sitemap/` for cross-check.

---

## 1. TOP NAV BAR (desktop, in order)

**Row 0 — thin black utility strip (very top):**
`Bloomberg the Company & Its Products ▾` | `Bloomberg Terminal Demo Request` | `Bloomberg Anywhere Remote Login` (orange text) | `Bloomberg Customer Support`

**Row 1 — masthead:** Bloomberg wordmark logo (blue on white / white on black), right side: `Sign In` (button) · `Subscribe` (link/CTA) · `Search` (magnifier icon) · account/profile avatar icon · `Live TV` link. Region selector `US Edition ▾` (options: **US / UK / Asia / Europe** editions).

**Row 2 — primary category nav (exact order, confirmed via aria-labels + screenshot):**
`Markets ▾` · `Economics` · `Industries` · `Tech` · `Politics` · `Businessweek` · `Opinion` · `More ▾`
- Only **Markets** and **More** have dropdown chevrons in the slim bar; the rest are direct links.
- A **hamburger "Menu"** button (aria-label "Menu" / "Mobile Menu Button") opens the full mega-menu.

### Hamburger mega-menu contents (full IA, grouped — confirmed from rendered nav component)
- **Utility/top:** Home · Market Data · Opinion · Audio · Originals · Magazine · Events · Live TV (BTV+)
- **News categories:** News · Markets · Economics · Technology · Politics · Green · Crypto
- **Work & Life cluster:** Work & Life · Wealth · Pursuits · Businessweek · CityLab · Sports · Equality · Management & Work
- **Market Data sub-links:** Stocks · Commodities · Rates & Bonds · Currencies · Futures · Sectors · Economic Calendar
- **Explore:** Newsletters · Explainers · Pointed News Quiz · Alphadots Game · The Big Take · Graphics · Submit a Tip · About Us

**Buildable takeaway:** slim always-visible bar (7 categories + More + hamburger), with a full grouped mega-menu behind the hamburger. Subscribe is a persistent high-contrast CTA; Sign In is a lower-emphasis button beside it.

---

## 2. SUB-NAV PILLS (section fronts)

Under **Markets**, the section sub-nav is a horizontal pill/tab row, each linking to `/markets/<slug>`:
`Stocks` · `Commodities` · `Rates & Bonds` · `Currencies` · `Futures` · `Sectors` · `Economic Calendar`
Also present in the Markets universe: `Fixed Income` (`/markets/fixed-income`), `ETFs` (`/markets/etfs`), `Watchlist` (`/markets/watchlist`), `Markets Magazine`, `Market Data`.

- **Behavior:** horizontal, single row, left-aligned under the section header; active pill emphasized; they are real navigation links (server routes `/markets/stocks` etc.), not client-only filters.
- **Pattern to copy:** each vertical (Markets, Economics, Tech, Politics…) gets its own pill row of child topics directly beneath the section H1.

---

## 3. PERSISTENT MARKETS TICKER STRIP

Component: **`TickerBarWithPill`** with a **`Top Securities` dropdown** (`role="combobox"`, "Top Securities ▾") that lets the user switch which watchlist the bar shows. Sits **directly below the primary nav bar**, horizontally scrollable (`scrollSnap`), has an `isDark` (dark background) variant.

**Each item = a `SecurityPill`:** `name` + `price` + `change value` + `percent change` + directional `MarketArrow`.

**Color coding (class-confirmed):**
- `SecurityPill_positive` / `Change_positive` + `MarketArrow_marketUp` → **green / up arrow**
- `SecurityPill_negative` / `Change_negative` + `MarketArrow_marketDown` → **red / down arrow**
- `Change_neutral` / `MarketArrow` neutral → **flat / grey** (aria e.g. "Current percentage change is 0.00%")

**Default symbols (names + Bloomberg IDs found):**
S&P 500 (`SPX:IND`) · Nasdaq (`CCMP:IND`) · Dow (`INDU:IND`) · Russell 2000 (`RTY:IND`) · FTSE 100 (`UKX:IND`) · DAX (`DAX:IND`) · Nikkei 225 (`NKY:IND`) · Hang Seng (`HSI:IND`) · Crude Oil · Gold · Euro (`URUSD:CUR`) · British Pound (`BPUSD:CUR`).

**Buildable takeaway:** sticky strip under nav, name + price + Δ + Δ% + arrow per pill, green/red/grey, a dropdown to swap the symbol set (Top Securities / user watchlist), dark theme optional.

---

## 4. PERSONALIZATION — "Follow" / "Your News" / "Stories for You"

Bloomberg's follow-topics system is present but **primarily surfaces on article/section pages**, not the anonymous homepage:
- **Follow module** (`bb-that-category__title = "Follow"`): a labeled block listing related topics/people/companies each with a **Follow** button (topic chips). Placed in the article/section rail.
- **Article-level follow:** strings `media-ui-article_following = "Following"` and `article_followAllNewStories` → per-story "Follow" toggle + "Follow all new stories" for a topic. (`Follow` appears 346×, `Following` 171× in the markets front — a pervasive topic-follow layer.)
- **"Your News":** the personalized feed built from followed topics; shown to **logged-in** users (anonymous view falls back to curated rails).

**Homepage curated rails (anonymous, from `wb-home-04/05.png`):**
- **"Latest"** — reverse-chron feed with an **"All categories ▾" filter dropdown** and a **"See all latest ›"** link.
- **"In Focus"** — editor-curated cluster (image lead + headline stack).
- **"Listen, Watch and Catch Up"** — mixed-media carousel (Newsletter / Watch / Listen cards with durations, prev/next arrows).

**Buildable takeaway:** ship a **Follow button on every topic/company/author** + a **"Your News" feed** for signed-in users, with anonymous fallback to curated **Latest / In Focus / Listen-Watch** rails. "Stories for You" = the personalized card rail driven by follows; card = thumbnail + kicker/topic tag + headline + timestamp.

---

## 5. FOOTER MEGA-COLUMNS

Column headers (H3): **Bloomberg · For Customers · Support · Company · Communications · Follow · Products · Industry Products · Media · Media Services · Markets**.
Representative **Company** links: About · Careers · Inclusion at Bloomberg · Tech at Bloomberg · Philanthropy · Sustainability · Bloomberg Beta · Press Announcements · Press Contacts · News Bureaus.
Plus **Explore** links repeated in footer: Newsletters · Explainers · Graphics.

---

## Sources
- Wayback `/markets` (rendered): https://web.archive.org/web/20251231121702/https://www.bloomberg.com/markets
- Wayback home: https://web.archive.org/web/20251231211006/https://www.bloomberg.com/
- Live (bot-walled): https://www.bloomberg.com/
- Sitemap: https://www.bloomberg.com/sitemap/
- DOM screenshots: /home/ubuntu/pw-audit/out/wb-home-00.png, wb-home-01.png, wb-home-04.png, wb-home-05.png
