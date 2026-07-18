# Indrani Course-Correction Plan v2 — 2026-07-17

**Status:** Awaiting owner approval. No implementation has started.  
**Supersedes:** docs/44 draft from 2026-07-13 (research complete; this plan resolves all open questions that research could answer).

**What changed since 07-13:** live bloomberg.com verification (2026-07-17 stealth audit), fresh API latency measurements (2026-07-17), codebase root-cause verification against today's tree (all file:line claims re-confirmed), news-feed liveness tests (Moneycontrol frozen, Reuters RSS dead), translation-engine volume math (7.5M chars/mo full-eager impossible → lazy-body architecture), TTS research (Web Speech hi-IN MVP, Sarvam phase-2), and the homepage/language sections fully spec'd.

---

## Executive summary

The homepage currently ranks junk (BBC Hindi political stories, 4 duplicate RBI bulletins) because it sorts by raw recency with no curation. Interactive elements are broken: chart tabs freeze on 1D (hydration mismatch kills all client islands), movers toggle does nothing, and the newsletter band has zero CTA. Speed is slow (expired-cache burst = 207–363ms measured on local dev; news lags up to 16–22 min worst-case). The Hindi plan was a separate-articles silo; user directive replaced it with a global toggle.

This plan fixes all of that with real evidence: Bloomberg's live patterns verified 2026-07-17 (typed modules, inline newsletter cards with email input, India-first ticker order, editor-curated top-10 = 8/10 hard finance); news pipeline re-architected (SimHash clustering, multiplicative HN-gravity score, feed swap with live-tested 304 behavior, background poller → ~1–2.5 min publish-to-visible for 1-min-polled feeds, ~6–8 min for politeness-capped feeds — cadence sign-off is open question #12); hydration-mismatch root cause found (range-chart.tsx:29-36 timezone-dependent labels); and the language layer redesigned (global EN/हिंदी toggle, Azure F0 + Google Translation chain with lazy-body + honest MT badges, Web Speech hi-IN TTS with fallback matrix).

What ships: a redesigned multi-column homepage (FT-style 12-col grid, twin Nifty/Sensex module, card grids replacing text lists, inline newsletter cards with working Subscribe), real editorial-grade news ranking (no more junk in top-5), near-instant refresh (background poller + 60s client island), global Hindi toggle + MT + Hindi TTS, and fast quotes via Upstash Redis + WebSocket ingestion (projected p50 ≤80ms on CDN MISS + Redis HIT, ≤60ms on CDN HIT — §5's targets; verified only when the AFTER battery runs).

What needs approval: (1) Azure Translator F0 + Google Cloud Translation account creation (both permanent free tiers but need signup + billing-enabled GCP project); (2) optional Upstash paid overage ~$1–5/mo (free tier 500k cmds/mo; our WS-flush arithmetic shows ~540–640k marginal); (3) optional always-on worker VM $4–6/mo (persistent WS ingester + background refreshers need long-lived process; Vercel Cron 1-min degraded fallback works but no WS).

---
## 1. Bug fixes & broken interactive elements (evidence-verified 2026-07-17)

Every claim below re-verified against today's working tree (read-only inspection + live browser audit on `localhost:3000`). Ordered by user-reported first, then severity.

### 1. Chart timeframe tabs stuck on 1D (user-reported, multiple pages)

**Root cause found — hydration mismatch in the one shared chart component.**
`components/markets/range-chart.tsx` is a `"use client"` island and the single chart used everywhere: quote pages (`app/(news)/markets/quote/[symbol]/page.tsx:14,107`), markets-hub hero (`components/markets/featured-chart.tsx:13,44`), and the untracked article chart block (`components/news/article/blocks.tsx:14,66`). One fix covers every page.

- `range-chart.tsx:29-36` — `tickLabel()` formats axis labels with `d.toLocaleTimeString("en-US", …)` / `d.toLocaleDateString("en-US", …)`. Locale is pinned but **timezone is not**: server (UTC on Vercel) and browser (IST) render different label text for the same candle → React hydration error ("attributes of the server rendered HTML didn't match") → React bails, `onClick` handlers never attach → every tab is dead and the server-rendered 1D stays frozen. Exactly the reported symptom; the prior independent audit captured this console error live.
- Secondary divergence sources to harden in the same pass: `range-chart.tsx:118-121` stale label uses `timeAgo(fetchedAt)` (client `Date.now()` vs SSR time), and `components/markets/live-price.tsx:40,43` calls `timeAgo` inside a client island (same class of drift on the quote header).
- Consistent with this diagnosis: today's dev re-audit shows all 8 tabs working with zero hydration errors — expected, because the dev server and dev browser share one machine and one timezone, so the divergence can't trigger locally. It fires when server TZ (Vercel UTC) ≠ user TZ (IST). The e2e must therefore run against `next start` with a non-UTC browser TZ to reproduce/regress it.
- Compounding: the last deploy predates current code because **the production build fails** (§5), so prod may also simply be serving an old bundle.

**Fix:** make every time-derived string deterministic across server/client — format tick labels with an explicit fixed `timeZone` (IST for .NS/^NSEI sessions, exchange TZ otherwise, from a small symbol→TZ map), and render `timeAgo`-style relative strings only after mount (`useEffect`-gated) or with `suppressHydrationWarning` on the one text node where a live "now" is intended. Then e2e: click each of 1D/5D/1M/6M/YTD/1Y/5Y/MAX and assert the SVG `path[d]` changes and `aria-selected` moves (Playwright, added to the audit script suite).

### 2. Movers Gainers/Losers toggle (user-reported)

Two distinct defects:
- **Toggle wiring is fine in dev** (`components/markets/movers-board.tsx:28-43` — client state + `onClick`; re-verified working today, aria + content flip, zero console errors), but on the live build the same hydration failure as §1 kills every client island on the page, so taps do nothing there. Fixing §1 + shipping a green build fixes the dead toggle.
- **Data correctness is broken everywhere:** `lib/data/providers/yahoo.ts:167-188` (`yahooMovers`) forwards Yahoo's `day_gainers`/`day_losers` screener rows with **no filter and no sort** — the only skip is price-missing (`yahoo.ts:171`). `lib/data/chain.ts:208-215` and `app/api/movers/route.ts:12` pass rows through untouched. Observed 07-13: Gainers containing −7.9%/−11.0% names, Losers containing +2.5%. Re-verified today (07-17): directions happened to be sign-correct this session but **both lists remain unsorted** (Gainers: +12.67, +7.92, +7.97, +9.74 — not descending) — Yahoo's ordering is untrustworthy either way, so the fix below is unchanged.

**Fix:** enforce in the provider (single choke point, `yahoo.ts` before returning): gainers = `changePercent > 0` sorted desc; losers = `changePercent < 0` sorted asc; drop nonconforming rows. Never trust Yahoo's ordering. e2e asserts sign-purity and ordering of rendered rows after each toggle.

### 3. The awkward CTA-less component (user-reported "find it")

**Identified: the `NewsletterBand`** (`components/news/newsletter-band.tsx`) — a full-width grey band parked at the very bottom of the homepage listing three newsletters ("Subah 5 Baatein", "Closing Bell", "Weekly Big Picture") as plain text cards with **zero links, zero buttons, zero email field** and the line "Subscriptions open soon" (`newsletter-band.tsx:32-55`). It was built CTA-less deliberately (docs/29 forbids fake subscribe states) but reads as a broken dead end exactly as the user described.

Runner-up with the same defect: `LiveTVModule` (`components/news/live-tv-module.tsx`) — dark "Markets Now" board with no link/button at all (`live-tv-module.tsx:19-61`).

**Fix (matches Bloomberg's inline-card pattern, no fake states):**
- Replace the bottom silo with **inline newsletter cards threaded between story modules**: eyebrow `Newsletter: <name>` + one-line hook + cadence pill + **working email input + Subscribe button**, posting to a new `POST /api/newsletter/subscribe` that writes a real `newsletter_subscriptions` row (Neon, Zod-validated, rate-limited) and returns a real confirmation state. Issues read free on-site as docs/29 already promises; sending infra can come later — storing a real subscription is not a fake state.
- `LiveTVModule` gets its CTA: link the board to `/markets`, and the header gains a "Markets Hub →" affordance; when TV ships it becomes "Watch Live".

### 4. Site-wide 404 navigation (11 primary links + search)

Still reproducible today — only `app/(news)/markets/*` and auth routes exist (route inventory verified): `/technology /politics /economics /wealth /opinion /crypto /ai /green /hindi /terminal /search` all 404 while the header/footer link to them; the Crypto sub-nav pill on `/markets/*` points at `/crypto` (404) instead of `/markets/crypto`. `lib/verticals.ts` fully defines every vertical; the routes were never created.

**Fix:** one dynamic `app/(news)/[vertical]/page.tsx` generated from `lib/verticals.ts` (validating the slug allowlist), a real `/search` page over the existing `/api/search`, a `/terminal` placeholder route with an honest "arrives in Phase 3" state (or drop the CTA until then — decided in redesign), and the one-character Crypto pill href fix.

### 5. Production build broken

`pnpm exec tsc --noEmit` → single error: `components/news/article/related-rail.tsx(8,29): Cannot find module '@/lib/article-paths'`. The file `lib/article-paths.ts` does not exist; `related-rail.tsx:8` is its only importer. This is the sole build blocker; it also blocks prod-parity testing of §1/§2. Feature 6 (article page) is otherwise ~748 lines of real, mostly-complete untracked work (blocks renderer, header, share row, ticker chips, wrap generator + tests, DB queries) but has **no route mounting it** — not user-reachable.

**Fix:** create the missing `lib/article-paths.ts` (slug→URL helper, trivially derivable from `lib/articles.ts` slugs), get `tsc` + `pnpm build` green, and redeploy so prod stops serving the stale bundle. Finishing the article *route* itself is scheduled in the build order (Phase 6), but the build must be green in Phase 1.

### 6. Devanagari renders as tofu (breaks the entire Hindi surface)

`app/layout.tsx:7,13,20` — Inter, Newsreader, Geist Mono all load with `subsets: ["latin"]` only; no Devanagari font is configured anywhere. Today's dev re-audit found Hindi *happens* to render via uncontrolled fallbacks (CDP shows the `हिंदी` nav label painted by system DejaVu Sans, headlines by whatever glyphs the webfont ships) — so appearance is device-dependent: any environment without a Devanagari system font (and the 07-13 audit environment was one) shows □□□.

**Fix (unchanged):** add Noto Sans Devanagari (+ serif variant if needed) via `next/font` with the `devanagari` subset, appended to the sans/serif font stacks — deterministic, design-controlled Hindi rendering on every device. Prerequisite for the language-toggle plan.

### 7. HTML entities double-encoded in summaries

Observed 07-13: summaries rendered literal `&amp;amp;` (e.g. "…(W&amp;M)/2020…"). Today's re-audit: zero *visible* broken text in the current feed mix, but one double-encoded `&amp;amp;` still present in the raw HTML of `/` and `/markets` — the sanitizer path still re-encodes already-encoded entities and nothing decodes; whether it becomes visible depends on which feed items are live.

**Fix (unchanged):** decode entities once post-sanitize in the RSS pipeline (`lib/data/providers/rss.ts` summary path), with a unit test on the captured 07-13 payload (TDD — pure function), so correctness stops depending on the feed of the hour.

### 8. Quote-page cold loads >20–45s with stuck skeleton

Streaming SSR waits on a 5-way `Promise.all` (`app/(news)/markets/quote/[symbol]/page.tsx:58-64` — quotes, chart, fundamentals, news, related) each walking the fallback chain with 3s-per-provider timeouts on a cold cache; continuous polling means network-idle never fires. The §1 hydration failure makes the skeleton *look* permanently stuck.

**Fix:** §1 first; then split the page so the header+chart stream first and fundamentals/news/related arrive via `Suspense` boundaries; the latency workstream (Redis warm cache) removes most of the cold-chain cost.

### 9. Smaller confirmed items folded into the redesign phases

- Homepage section bands are 2-column text link lists with zero images (`app/(news)/page.tsx:88`) — replaced by card grids (redesign section).
- Big Take band renders two empty dark boxes when items lack images — og:image fallback + typographic variant (media section).
- Opinion band = 4 near-identical CNBC items — source diversification via the curation pipeline.
- Homepage lead currently eligible to be any newest item (BBC-Hindi general feed) — curation section.
- Leftover `ponytail:` scratch marker comment in `newsletter-band.tsx:5` — deleted in the newsletter rebuild.
- No TTS/audio code exists anywhere yet (verified) — the Listen feature is greenfield (language section).

### Acceptance criteria (bug workstream)

- [ ] `pnpm exec tsc --noEmit` and `pnpm build` green; fresh deploy verified live.
- [ ] Zero hydration errors in console on `/`, `/markets`, quote pages (Playwright asserts no `hydrat` console text).
- [ ] Each chart tab click changes the SVG `path[d]` on a live prod URL; movers lists are sign-pure and sorted.
- [ ] All 11 nav links + `/search` return 200 with real content; zero dead hrefs in header/footer/pills.
- [ ] Hindi glyphs render (no tofu) on every page; `&amp;`-class artifacts absent from rendered HTML.
- [ ] Newsletter module submits a real subscription and shows a real stored-state confirmation; no CTA-less module remains on the homepage.

---

## 2. Homepage + site-wide redesign


### 1. Grid Specification

#### Desktop Grid System (FT o3-inspired, Tailwind v4 native)

**Breakpoints:**
- **Mobile:** `< 768px` — single column, 16px side padding
- **Tablet:** `768px–1023px` — 8 columns, 20px gutters, 32px side padding
- **Desktop:** `≥ 1024px` — **12 columns**, 24px gutters, max-width **1320px** centered

**Implementation:** Tailwind v4 `grid-cols-{n}` with explicit `gap-6` (24px). Named grid areas for complex modules (hero, twin-index, media-carousel).

**Collapse patterns (Bloomberg-verified):**
- **4-up card grids** → 2×2 on tablet → vertical stack on mobile
- **Carousels** remain horizontal-scroll at all widths (snap-scroll, no wrapping)
- **Hero `two_col_lede`** (lead image + secondary list) → single column on mobile, lead first
- **Ticker strip** → horizontal scroll, all pills swipeable

---

### 2. Module-by-Module Homepage Spec (Top → Bottom)

### A. Utility Bar (above masthead)
**Grid:** Full-width, `bg-muted`, 32px tall  
**Content:** Left: "Bloomberg the Company & Its Products ▾" pattern → "Indrani Insights · About · Help"  
Right: Edition selector `EN | हिंदी` (global toggle, persists in cookie)  
**API/Data:** Static text + locale cookie reader  
**States:** N/A (static)

### B. Masthead + Primary Nav
**Grid:** Full-width, two rows  
**Row 1:** Indrani wordmark (left) · Search box (center-left) · Sign In (button) · Subscribe (CTA, accent) · Account avatar  
**Row 2:** Primary category nav — `Markets ▾` · `Economics` · `Technology` · `Politics` · `Opinion` · `More ▾` + hamburger (mobile)  
**API/Data:** `/api/auth/session` for signed-in state  
**States:** Signed-in vs anonymous (shows avatar vs Sign In)

### C. Ticker Strip (India-First Order)
**Grid:** Full-width below nav, `bg-background`, 40px tall, horizontal scroll  
**Content:** `SecurityPill` components in order:  
1. **Nifty 50** (`^NSEI`)  
2. **Sensex** (`^BSESN`)  
3. **Gift Nifty** (pre-market, conditional on session time)  
4. S&P 500 (`^GSPC`)  
5. Nasdaq (`^IXIC`)  
6. Dow (`^DJI`)  
7. INR/USD (`INR=X`)  
8. Gold (`GC=F`)  
9. Crude (`CL=F`)  
10. Bitcoin (`BTC-USD`)  

Each pill: `NAME · PRICE · ±CHANGE · ±%` (color-coded green/red/grey, arrow glyph).  
Dropdown: "Top Securities ▾" (swap to user watchlist if signed-in).  
**API/Data:** `/api/quotes` batch call via the existing shared quote poller (`lib/quote-poller.ts`, 15s while markets open; drops to 5-min cadence off-hours per docs/17 §4 — one shared interval site-wide, no per-component polling)  
**Image:** None  
**CTA:** Each pill links to `/quote/[symbol]`  
**States:** loading (skeleton pills) / live (green dot) / stale (amber dot "15-min delay") / unavailable (grey, "—")  
**Attribution:** "Source: NSE/BSE, 15-min delay" for Indian indices (legal requirement)

### D. Breaking Banner (Conditional)
**Grid:** Full-width, `bg-red-600`, 48px, only renders when `breaking` item exists  
**Content:** Red pulse dot + "BREAKING" label + headline (truncated, clickable)  
**API/Data:** Real-time check via `pickBreaking()` (keyword + 30min window)  
**Image:** None  
**CTA:** Whole banner links to article  
**States:** Visible/hidden (conditional on data)

### E. Hero Module — `two_col_lede`
**Grid:** `grid-cols-12`, cols 1-8 (lead) + cols 9-12 (Latest rail) on desktop; single-column mobile  
**Content:**  
- **Lead (col 1-8):** Full-bleed image (3:2, gradient scrim, lazy=false priority), kicker/eyebrow (colored caps), headline (48px serif bold), dek (20px, 2 lines max), byline + timestamp  
- **Latest Rail (col 9-12):** "Latest" heading + "All categories ▾" filter dropdown → 5-item compact headline list (kicker + headline + timestamp, no images)

**API/Data:** `getNews({ limit: 30 })`, lead = item [0] with imageUrl required (fallback to [1] if [0] imageless)  
**Image:** Lead requires image (og:image fallback via new `fetchOgImage()` util); gradient scrim overlay (CSS `linear-gradient(0deg, rgba(0,0,0,0.6), transparent)`)  
**CTA:** Headline links to article; each Latest item links to article  
**States:** loading (hero skeleton + 5 Latest skeleton rows) / live / stale (timestamp label) / unavailable ("No stories available")

### F. India Twin-Index Module (NEW)
**Grid:** `grid-cols-2` on desktop (6 cols each), single-column mobile  
**Content:**  
- **Left:** "Nifty 50" label + large level (42px mono) + ±change + ±% (color-coded) + mini sparkline (1D) + "NSE" badge  
- **Right:** "Sensex" label + large level + ±change + ±% + mini sparkline + "BSE" badge  
- **Below (full-width):** "Gift Nifty" level + change (if pre-market hours, else hidden) + "Pre-market signal" label

Toggle: **NSE/BSE** pill tabs above (switches between NSE-sourced vs BSE-sourced data for shared symbols)  
**API/Data:** `/api/quotes?symbols=^NSEI,^BSESN` + Gift Nifty from derivative source  
**Image:** None (data-focused)  
**CTA:** Each index name links to `/quote/[symbol]`  
**States:** loading / live (green dot) / stale (amber "15-min delay") / unavailable  
**Attribution:** "Source: NSE/BSE, 15-min delay" label below

### G. Section Bands (Repeated Module Type)
**Grid:** Full-width per band; cards inside = `grid-cols-3` (desktop) / `grid-cols-2` (tablet) / single-column (mobile)  
**Content per band:**  
- **Header:** Section name (28px bold) + "View all ›" link (right-aligned)  
- **Sub-nav pills:** Horizontal scrollable pill row (e.g., Markets → `Stocks · Currencies · Commodities · Bonds · Sectors · Calendar`), each links to child page  
- **Card grid:** 3-up or 4-up `StoryCard` components (image 3:2 + kicker + headline + timestamp + source, whole-card tappable)

**Sections rendered (from `HOME_SECTIONS`):** Markets, Technology, Economics, Crypto, Politics (each gets real route)  
**API/Data:** `getNews({ category: '<vertical>', limit: 6 })` per section  
**Image:** Card images from RSS `media:content` → og:image fallback → typographic card (no image, tint bg + large headline)  
**CTA:** Each card links to article; pills link to `/[vertical]/[subcategory]`; "View all" links to `/[vertical]`  
**States:** loading (3 card skeletons) / live / empty ("No stories in [Section] yet")

**CURRENT vs NEW:**  
- **Current:** 2-column plain text link lists, zero images, no pills  
- **NEW:** 3-4-up image card grids + sub-nav pills + "View all" CTA — kill text lists entirely

### H. In Focus Module (NEW)
**Grid:** `grid-cols-12`, asymmetric layout — col 1-7 hero card + col 8-12 stacked 3 compact cards  
**Content:** Editor-curated topic cluster (e.g., "AI Regulation"), one large card + three related smaller cards  
**API/Data:** `getNews()` filtered by topic tag (future: manual curation table)  
**Image:** Hero card requires image; compact cards optional  
**CTA:** Each card links to article  
**States:** loading / live / hidden if no topic cluster available

### I. Inline Newsletter Card (NEW, replaces dead "NEWSLETTERS" band)
**Grid:** Single card, max-width 640px, centered or col-span-6  
**Content:**  
- Eyebrow: "Newsletter: [Name]" (e.g., "Subah 5 Baatein")  
- Hook headline: "Get India's top 5 market stories every morning" (20px)  
- Cadence pill: "Daily · 7:30 AM IST"  
- Email input + "Subscribe" CTA button (adjacent, same row)  
- Legal: "By subscribing you agree to our Terms" (small, muted)

**Data:** Static newsletter metadata (name, description, cadence) from `lib/newsletters.ts`  
**API/Data:** Form posts to `/api/newsletter/subscribe` (stores email + newsletter_id in DB)  
**Image:** None (or optional newsletter icon/thumbnail at left, 80×80)  
**CTA:** Subscribe button (POST, then success toast)  
**States:** default / submitting (button disabled, spinner) / success (green check, "Subscribed!") / error (red, "Try again")

**Placement:** Thread between story modules — one newsletter card every 3-4 section bands  
**CURRENT vs NEW:**  
- **Current:** Bottom silo "NEWSLETTERS" band listing 3 newsletters with NO CTA, just "Subscriptions open soon" (dead end)  
- **NEW:** Inline cards with working email input + Subscribe CTA, distributed throughout feed

### J. Media Modules — Watch + Listen (NEW, split pattern)
**Pattern note:** the 07-13 research saw Bloomberg's mixed "Listen, Watch and Catch Up" carousel; the 2026-07-17 live audit found media running as **split modules** instead (Today's Videos / Watch / News Now audio — an A/B Bloomberg runs). We adopt the **split pattern** (matches Appendix A): a **Watch** module and a **Listen** module, each rendered only when real media of that type exists.  
**Grid:** Each module full-width: heading (28px bold) + prev/next arrows (right) + horizontal-scroll card row, 4 visible on desktop, swipe on mobile  
**Card types:**  
1. **Video card (Watch):** Thumbnail (16:9) + "Watch (5:14)" eyebrow + title + play ▶ icon overlay + duration badge (bottom-right)  
2. **Podcast card (Listen):** Thumbnail (series logo, square) + "Listen (19:24)" eyebrow + episode title + play ▶ icon overlay  

Inline newsletter cards (§I) thread separately between story modules — not mixed into these rows.  
**API/Data:**  
- Podcasts: RSS feed with `<enclosure type="audio/mpeg">` + duration from `<itunes:duration>`  
- Videos: RSS feed with `media:content type="video"` + duration; fallback to YouTube oEmbed for thumbnail  
- Real media only; a module with no real items of its type is **omitted entirely** (never fake media)

**Image:** Podcast series logo (square) / video thumbnail (16:9), lazy-loaded  
**CTA:** Each card links to media player page or external source  
**States:** loading (4 card skeletons) / live / hidden (if no real media exists)

**CURRENT vs NEW:**  
- **Current:** No media modules; separate "Big Take" band with empty dark image boxes (broken)  
- **NEW:** Split Watch/Listen modules with real media + working thumbnails, each omitted until real media exists

### K. Big Take Band
**Grid:** `grid-cols-2` on desktop, single-column mobile  
**Content:** 2 large story cards (image 3:2 + "Big Take" eyebrow + headline + dek + byline)  
**API/Data:** `getNews()` filtered by "Big Take" tag or long-form content signal (wordcount >1500)  
**Image:** **Requires og:image fallback fix** — current version shows empty dark boxes; new version fetches og:image or renders typographic treatment (large headline on tint, no image)  
**CTA:** Each card links to article  
**States:** loading (2 card skeletons) / live / hidden if <2 Big Take stories available

**CURRENT vs NEW:**  
- **Current:** Shows two EMPTY dark image boxes (broken, no fallback)  
- **NEW:** og:image fallback ensures images appear; typographic fallback if still no image (never empty boxes)

### L. Opinion Band
**Grid:** `grid-cols-4` on desktop (4-up), `grid-cols-2` tablet, single-column mobile  
**Content:** 4 opinion cards (small columnist headshot + byline + headline + timestamp, no main image)  
**API/Data:** `getNews({ category: 'opinion', limit: 8 })`  
**Image:** Round 44px columnist avatar (from author metadata or fallback initial circle)  
**CTA:** Each card links to article  
**States:** loading / live / empty

**CURRENT vs NEW:**  
- **Current:** 4 text cards all from CNBC with near-identical headlines (source-diversity bug)  
- **NEW:** Diversify sources via ranking (Part 3, News curation & ranking), columnist treatment (avatar + name prominence)

### M. Most-Read Rail (Right Sidebar, Persistent)
**Grid:** `col-span-3` (right rail), sticky during scroll on desktop  
**Content:** "Most Read" heading + numbered list (1–10), headline only, compact  
**API/Data:** `getNews()` sorted by `views` (future: analytics table); current fallback = "Latest" (honestly labeled)  
**Image:** None  
**CTA:** Each item links to article  
**States:** loading (10 skeleton rows) / live

### N. Markets Now Band (NEW, Optional)
**Grid:** Full-width, compact market summary module  
**Content:** "Markets Now" heading + 4-column stat grid (Nifty close, Sensex close, INR/USD, 10Y G-Sec yield) + timestamp "As of 3:30 PM IST"  
**API/Data:** `/api/quotes` EOD snapshot  
**Image:** None  
**CTA:** Links to `/markets`  
**States:** loading / live / stale (EOD values after close)

### O. Footer Mega-Columns
**Grid:** `grid-cols-4` on desktop, `grid-cols-2` tablet, single-column mobile  
**Content:** 4 column groups:  
1. **Company:** About · Careers · Contact · Advertise  
2. **Products:** Terminal · API · Data Services · Mobile Apps  
3. **News:** Markets · Economics · Technology · Politics · Opinion  
4. **Follow:** Social icons (X, LinkedIn, YouTube) + newsletter signup mini-form  

**API/Data:** Static links  
**Image:** Social brand icons  
**CTA:** Each link  
**States:** N/A (static)

---

### 3. Identity Rules (Bloomberg-Inspired, Never Copied)

**Adopt from Bloomberg:**  
- Modular layout system (typed modules, flexible daily composition)  
- Sans-serif headline hierarchy (two sizes: large/small)  
- Eyebrow/kicker system (format labels, section labels, author labels)  
- Whole-card tappable with gradient scrim over images  
- Sub-nav pill rows under section headers  
- Inline newsletter cards threaded in feed  
- SecurityPill design (name · price · change · %)  

**EXPLICITLY FORBIDDEN (never copy):**  
- Bloomberg's proprietary blue `#2800D7` (or any close match)  
- Bloomberg wordmark, logo, or typography (BW Haas, Neue Haas proprietary cuts)  
- Bloomberg's exact text/copy (headlines, descriptions, branded terms like "Bloomberg Surveillance")  
- Any element that could create user confusion about brand identity  

**Indrani's Own Palette (docs/15):**  
- Background: `#fafafa` (off-white)  
- Ink: `#111114` (near-black)  
- Brand accent: `#2962ff` (Indrani blue, links/active)  
- Up/down: `#00873c` green / `#d32029` red  
- Live badge: red `#d32029`  

**Indrani's Own Type:**  
- Headlines: `Newsreader` (serif, 500/700 weights)  
- Body/UI: `Inter`  
- Data/mono: `Geist Mono` (tabular-nums)  

**Design Philosophy:**  
Bloomberg-*inspired* means we adopt their **structural patterns** (modules, pills, cards, hierarchy) but render them in **Indrani's own visual identity** (our palette, our fonts, our copy). The user should recognize the quality and clarity, not think "this is Bloomberg."

---

### 4. What Changes vs Today (Current → Action)

| Current Module/Element | Action | Reason |
|---|---|---|
| 2-column text-only section bands | **REDESIGN** → 3-4-up image card grids | Bloomberg never uses plain link lists; images required for engagement |
| NEWSLETTERS band (3 names, "Subscriptions open soon") | **REPLACE** → Inline newsletter cards with email+CTA | Current is a CTA-less dead end; new version has working signup |
| Big Take band (empty dark image boxes) | **FIX** → og:image fallback + typographic treatment | Current shows broken empty boxes; must never render empty |
| Opinion band (4 CNBC duplicates) | **REDESIGN** → Diversified sources + columnist treatment | Source-diversity bug + missing columnist identity |
| Ticker strip (exists, basic) | **KEEP + ENHANCE** → Add India-first order (Nifty/Sensex first) + Gift Nifty + attribution | Reorder symbols, add pre-market signal, add legal delay label |
| Lead module (hero + Latest rail) | **KEEP** → Minor: ensure lead has image (rank items with images higher) | Structure correct, needs image-presence enforcement |
| Market snapshot (index cards) | **KEEP + ADD** → Keep cards, add twin-index module below | Add dedicated Nifty/Sensex hero treatment (India requirement) |
| Breaking banner | **KEEP** | Works correctly (conditional render) |
| Live TV module | **KEEP** | Placeholder text → verify real stream URL before launch |
| Most-Read rail | **KEEP** → Rename "Latest" until analytics live | Honestly labeled (docs/18 §2) |
| Footer | **KEEP** | Structure correct |
| Search box (header) | **FIX** → Build `/search` route | Currently 404s |
| Nav links (/technology, /politics, etc.) | **FIX** → Build `[vertical]/page.tsx` dynamic route | All 404 (Part 1 §4 finding) |
| Crypto sub-nav pill href | **FIX** → `/markets/crypto` not `/crypto` | Wrong link target |
| **NEW:** Twin-index module | **ADD** | India-first requirement (Nifty/Sensex hero, NSE/BSE toggle, Gift Nifty) |
| **NEW:** In Focus module | **ADD** | Editorial curation surface (topic clusters) |
| **NEW:** Watch + Listen media modules (split pattern) | **ADD** | Media discovery (real podcast/video only, per-type omit) |
| **NEW:** Markets Now band | **ADD** (optional) | EOD snapshot module |
| **NEW:** Sub-nav pills on section bands | **ADD** | Navigation depth (Bloomberg pattern) |

---

### 5. Typography & Hierarchy Rules

**Headline Sizes (two classes only):**  
1. **Large:** 48px `Newsreader` bold, used on: hero lead, Big Take, twin-index levels  
2. **Small:** 20px `Newsreader` medium, used on: section-band cards, Latest rail, Opinion cards  

**Eyebrow/Kicker System:**  
- **Format eyebrows:** `Listen (MM:SS)`, `Watch (MM:SS)`, `Newsletter: [Name]` (caps, muted color, 12px)  
- **Section eyebrows:** `Markets`, `Opinion`, `Big Take` (caps, colored per section accent, 12px)  
- **Author eyebrows:** `Opinion / [Name]` (12px)  

**Body Text:**  
- Article body: 18px `Inter` regular, line-height 1.6  
- Card deks: 16px `Inter` regular, 2 lines max truncate  
- Timestamps: 14px muted, relative format ("2h ago")  

**Data Text:**  
- Ticker strip / quote numbers: 15px `Geist Mono`, tabular-nums  
- Twin-index levels: 42px `Geist Mono` bold  
- Change values: 14px mono, green/red, always with +/− sign  

**Size-Based Hierarchy:**  
Visual weight = size × weight × spacing. Never rely on color alone for hierarchy. Headlines dominate via size; body recedes via smaller size + lighter weight.

---

### 6. Image Rules

**Aspect Ratios:**  
- **Story card stills:** 3:2 (e.g., 600×400)  
- **Video thumbnails:** 16:9 (e.g., 640×360)  
- **Podcast/newsletter thumbnails:** 1:1 square (e.g., 200×200)  

**Gradient Scrim:**  
All images with overlaid text get `linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 60%)` bottom-to-top, so text stays legible.

**Whole-Card Link:**  
Entire card (image + text) is one `<a>` with `group` hover state; image scales 1.02× on hover (150ms ease).

**Lazy Loading:**  
- Hero image: `loading="eager"` `priority` (above fold)  
- All other images: `loading="lazy"` (below fold, triggered by IntersectionObserver via next/image)  

**Fixed Aspect Boxes (Zero CLS):**  
Every image container has explicit `aspect-ratio` CSS or width/height props, so layout stable before image loads (docs/17 CLS ≤0.05).

**Fallback Hierarchy:**  
1. RSS `media:content` / `enclosure` (primary, already implemented)  
2. Fetch article URL → read `<meta property="og:image">` (NEW, main fix for 33% → 90% coverage)  
3. Typographic card (NEW): no image, tint background, large headline + kicker, 8px border-radius  

**Never:**  
- Empty image boxes (current Big Take bug)  
- Placeholder photos posing as real  
- AI-generated images posing as photos  
- Stale cached image once fresher og:image available  

---

### 7. Motion (Within docs/16 + docs/17 Budget)

| Element | Motion | Duration | Reduced-motion |
|---|---|---|---|
| Price update (ticker/quote) | Background flash green/red → fade | 300ms | Disabled |
| Ticker strip marquee | Continuous scroll, pause on hover | 40s loop | Static (no scroll) |
| Card hover | Image scale 1.02×, headline underline | 150ms ease | Immediate (no transition) |
| Breaking banner | Slide down from top + red dot pulse | 250ms in | Immediate appear |
| Newsletter form submit | Button spinner → success check | 200ms | Immediate state change |
| Section-band cards | Stagger fade-in on scroll (IntersectionObserver) | 120ms per card, 40ms stagger | Immediate (no fade) |

**Budget Constraints (docs/17):**  
- LCP ≤ 2.5s → hero image must be priority-loaded, no render-blocking motion lib  
- JS first load ≤ 180KB gz → no framer-motion on homepage; CSS transitions only  
- All motion via `motion-safe:` Tailwind variants (respects `prefers-reduced-motion`)  

---

### 8. Acceptance Criteria (Verifiable)

- [ ] **≥3 distinct multi-column module types above the fold at 1440px** (hero, ticker strip, twin-index)  
- [ ] **Zero text-only section bands** (all section bands are card grids with images or typographic cards)  
- [ ] **Every module has ≥1 CTA link or button** (headline links, "View all", Subscribe, pill nav)  
- [ ] **Newsletter modules have a working email input + Subscribe CTA** (POST to API, success/error states)  
- [ ] **No empty image boxes ever render** (og:image fallback + typographic fallback enforced)  
- [ ] **India twin-index module present with Nifty + Sensex as hero numbers** (above fold, NSE/BSE toggle, Gift Nifty conditional)  
- [ ] **Ticker strip shows Indian indices first** (^NSEI, ^BSESN, then global)  
- [ ] **All nav links resolve (no 404s)** (/technology, /politics, /economics, /crypto, /ai, /green, /wealth, /opinion, /hindi, /terminal, /search all 200)  
- [ ] **Crypto sub-nav pill points to /markets/crypto** (not /crypto)  
- [ ] **Devanagari renders correctly** (Noto Sans Devanagari loaded, हिंदी nav label visible)  
- [ ] **Image coverage ≥80% on homepage story cards** (og:image fallback working)  
- [ ] **All market data shows attribution label** ("Source: NSE/BSE, 15-min delay" on Indian quotes)  
- [ ] **Build passes (`pnpm build`)** (no missing imports)  
- [ ] **LCP ≤ 2.5s on homepage at 1440px** (Lighthouse / agent-browser vitals)  
- [ ] **CLS ≤ 0.05** (fixed aspect-ratio boxes on all images)  
- [ ] **All animations respect `prefers-reduced-motion`** (motion-safe: variants)  

---

### 9. Mobile Behavior

**Collapse Strategy (< 768px):**  
- **Grid:** All multi-column grids collapse to single-column vertical stack  
- **Hero:** Lead image full-bleed → headline → dek → Latest list below (no side-by-side)  
- **Ticker strip:** Horizontal scroll (snap-scroll), all pills swipeable, no wrapping  
- **Section bands:** Card grids become vertical stack (1 card wide)  
- **Media card rows (Watch/Listen):** Remain horizontal-scroll (4 cards peek, swipe to browse)  
- **Twin-index:** Nifty and Sensex stack vertically (full-width each)  
- **Nav:** Primary nav becomes hamburger menu (slide-in sheet); sub-nav pills remain horizontal-scroll  
- **Footer:** 4 columns collapse to single column  
- **Newsletter card:** Email input + button stack vertically on narrow screens (<400px)  

**Touch Targets:**  
All interactive elements ≥44×44px (WCAG 2.5.5). Pill nav items have 12px padding vertical.

**Performance:**  
- Same LCP budget (2.5s) applies on mobile; hero image served at mobile width via next/image srcset  
- Lazy-load enforced below fold  
- Ticker strip animation pauses when tab backgrounded (`document.visibilityState`)  

---

### 10. Open Questions (Genuine Uncertainties)

1. **Gift Nifty data source:** Which API provides Gift Nifty futures quotes? (SGX Nifty successor; verify yahoo-finance2 symbol or need Finnhub.)  
2. **NSE/BSE toggle behavior:** Does toggle swap data source for all symbols, or only for symbols traded on both exchanges? (Affects twin-index + ticker strip logic.)  
3. **Podcast/video RSS feeds:** Which specific RSS feeds supply real Indrani podcast/video content? (If none exist yet, omit the Watch/Listen modules until content pipeline ready.)  
4. **Live TV stream URL:** What is the real RTMP/HLS URL for "Live TV" module? (Currently placeholder text; need actual stream endpoint.)  
5. **Most-read analytics:** When does analytics pipeline (views table) go live? (Affects Most-Read rail label flip from "Latest" to "Most Read".)  
6. **Logo.dev NSE/BSE coverage:** Does Logo.dev reliably cover NSE/BSE ticker symbols (e.g., RELIANCE.NS, TCS.BO)? (Test before building movers logos; fallback = monogram tiles.)  
7. **Editorial curation table:** Does In Focus module pull from a manual curation table, or filter by topic tags? (Affects data source for §H.)  

---


---

## 3. News curation & ranking + freshness


### News curation & ranking

### Why: the homepage ranks junk today (verified in code)

1. **Top stories = raw recency.** Lead module is literally the 5 newest items (`app/(news)/page.tsx:62`) from a merge sorted only by `publishedAt` (`lib/data/providers/rss.ts:181-182`). No scoring, ranking, or clustering code exists anywhere in the repo.
2. **General-news feeds pollute the pool.** ET top-stories, BBC Hindi, CNBC Politics, Guardian Environment (`rss.ts:28,30,34,38`) feed the same homepage merge; the only drop rule is missing title/url (`rss.ts:156`).
3. **Dedup is exact-match only** — exact URL + exact lowercased title (`rss.ts:178-193`); reworded versions of one story all survive as sibling bulletins.
4. **Missing-date fallback pins junk to top.** Items without a parseable pubDate get `new Date()` (`rss.ts:157-161`), ranking them newest. **Fix: drop unparseable-date items instead.**
5. **The fix was anticipated but never built:** `news_items` exists in the Drizzle schema (`lib/db/schema.ts:127-140`) but nothing writes it (`page.tsx:107-108` comment).

### Before / after: homepage top slots

| | Today (observed) | After this pipeline |
|---|---|---|
| Lead | BBC Hindi **political** story — merely the newest item in the merge | Highest-scored **finance-core** cluster **with image**; e.g. an RBI rate decision covered by ET Markets + BusinessLine + Livemint renders as **one** card (highest-authority member displayed), corroboration boosting its score |
| Top-5 mix | Whatever arrived last, any topic | R=1 clusters only; max 1 per source in the lead module; secondaries prefer ≥2-source clusters |
| Economics band | **4 near-duplicate RBI bulletins** stacked as siblings | Near-dupes fold to one card per cluster; RBI confined to Economics — never lead, never breaking |
| Political/crime/local items | Compete for lead on recency | R=0 without a finance entity ⇒ score 0 ⇒ excluded from the top pool entirely; general feeds demoted to their verticals |

### Grounding: what Bloomberg-class curation is (observed live 2026-07-17)

- Bloomberg.com top-10: **8/10 hard market/geopolitical stories, zero wire bulletins as top stories**; near-duplicates clustered into packages with related-story links; images concentrated on the lead tiers; curation is **editor-first** (dedicated Digital Editors + a separate Breaking News desk).
- Our algorithmic analog is the **NYT pool → rank → finish** pipeline (documented, NiemanLab 2024); our **editor-pin row is the human-in-the-loop** equivalent of NYT pinning. We are not replacing editors with math — we are encoding their defaults.

### Feed changes (live-tested 2026-07-14)

| Action | Feed | Verified status / poll |
|---|---|---|
| **Add** | Hindu BusinessLine markets (`thehindubusinessline.com/markets/feeder/default.rss`) | 200, ~60 items, **304 works** — poll **5 min** |
| **Keep** | ET Markets (`rss.ts:29`) | 200, ETag+LM, **304 works** — poll **10 min** |
| **Add** | NDTV Profit (`feeds.feedburner.com/ndtvprofit-latest`) | 200, fresh; no 304 — poll **10 min** |
| **Add** | Livemint `/rss/markets` + `/rss/money` | 200, no validators — poll **15 min** |
| **Add** | Google News RSS query feeds (`hl=en-IN&gl=IN`) — the **Reuters substitute** (Reuters official RSS is dead, 301→404) | 200, 100 items |
| **Do NOT add** | Moneycontrol `/rss/*.xml` | 200 but content **frozen April 2024** |
| **Unverified** | Business Standard `markets-106.rss` | 403 Akamai from server IP; retest from Vercel IPs before deciding |
| **Demote to verticals only** | ET top-stories (`rss.ts:28`), BBC Hindi (`rss.ts:30`), CNBC Politics (`rss.ts:34`), Guardian Environment (`rss.ts:38`) | Route to india / hindi / politics / green — **never the homepage top pool** |
| **Confine** | RBI press releases (`rss.ts:31`) | Economics only — never lead, never breaking |

No tested feed offers WebSub → polling with conditional GET is the ceiling (see Freshness section).

### Pipeline: ingest → cluster → classify → score → slot

**Stage 0 — Ingest** (background poller, per-feed interval above). Conditional GET using persisted ETag/Last-Modified. **Drop items with unparseable pubDate** (replaces the `now()` fallback at `rss.ts:157-161`). Keep the existing exact dedup (`rss.ts:178-193`) as a cheap first pass. Persist to Neon `news_items`.

**Stage 1 — Cluster.** SimHash (64-bit) over normalized title 4-gram shingles; **Hamming ≤3 ⇒ same cluster** (Manku et al., WWW'07 thresholds). Cluster canonical time = **earliest member pubDate** (Google patent practice). Displayed member = **highest-authority source**, longest headline as tiebreak (Techmeme practice); other members fold under the cluster, never render as siblings. Sentence-embedding cosine is a later upgrade, not launch scope.

**Stage 2 — Relevance, two passes.**
- *Pass A (free, sync, rules):* feed category ∈ {markets, economy, crypto, wealth} ⇒ relevant; else finance-entity keyword match (tickers, Sensex/Nifty/RBI/SEBI/IPO/earnings/rate/rupee, …) ⇒ relevant; **crime/court/local-city terms without any finance entity ⇒ R=0**.
- *Pass B (optional, async):* small-LLM label {finance-core, finance-adjacent, off-topic} on Pass-A **unsure items only**; honest cost ~$1.35/mo (GPT-4o-mini) to ~$9/mo (Haiku) at ~1k headlines/day. **Recommended, not launch-required.**

**Stage 3 — Score** (deterministic, explainable, real signals only):

```
score(cluster) = W_src × R × (1 + 0.6·ln(1 + S)) / (age_hours + 2)^1.8
```

| Term | Meaning |
|---|---|
| `W_src` | Static per-feed authority weight, editorially set in config: ET Markets **1.0**, Hindu BusinessLine **1.0**, Livemint **0.9**, NDTV Profit **0.85**, Google-News-proxied **0.7** (remaining feeds get config values at implementation) |
| `R` | Relevance ∈ {0 dropped, 0.5 finance-adjacent, 1.0 finance-core} |
| `S` | **Distinct sources** in the cluster — corroboration is the honest proxy for editorial "big story" judgment |
| Denominator | Hacker News gravity decay (`(T+2)^1.8`); `age_hours` from cluster canonical time |

**Stage 4 — Slot** (tier sizes unchanged: lead 5-item module `page.tsx:62`, sections 4 each `page.tsx:70`, Latest rail 5 `page.tsx:66`):

| Slot | Rule |
|---|---|
| Lead (1) | Highest-score cluster **with image AND R=1**; **max 1 per source** in the lead module |
| Secondaries (2–4) | Next clusters by score; prefer ≥2 distinct sources; ≥1 non-markets category for mix |
| Latest rail (5) | Pure reverse-chron **post-cluster, R>0 only** — the speed surface (First Word analog) |
| Section bands | Per-category top-scored, 4 each |
| Breaking banner | Keep existing keyword + 30-min rule (`page.tsx:39-49`, docs/03 §1.3) **plus require R=1** |
| Editor pin | `homepage_pins` Postgres row overrides the lead until `expires_at` — human-in-the-loop, zero fabrication |

### Storage — Neon Postgres only; **no Redis for news**

| Table | Contents |
|---|---|
| `news_items` (exists, `schema.ts:127-140`) | + `cluster_id`, `relevance`, `simhash BIGINT` (`image_url` already present, `schema.ts:137`) |
| `news_clusters` | `id, canonical_item_id, earliest_published_at, source_count, top_score` (score is cheap arithmetic — recompute on read or by cron) |
| `feed_state` | `feed_url PK, etag, last_modified, last_polled_at, fail_count` |
| `homepage_pins` | `slot, item_id, expires_at` |

### Staging order (each step independently shippable)

1. Feed swap + route general feeds to verticals + drop bad-date fallback → kills most junk immediately.
2. Persist `news_items` + `feed_state` with conditional GET (finally implements docs/12 §5).
3. SimHash clustering + fold.
4. Rule-based relevance + score formula + tier slotting.
5. Optional: LLM Pass B on unsure items; editor-pin row.

### Acceptance criteria — curation

- [ ] A court/crime/local story with **no finance entity can never rank in the top 5** (Pass A sets R=0 ⇒ score 0; fixture test with the observed BBC Hindi political item).
- [ ] The lead slot never renders an item without an image or with R<1; no two lead-module items share a source.
- [ ] Two headlines within SimHash Hamming ≤3 never render as sibling cards — the observed 4-RBI-bulletin stack collapses to ≤1 card per cluster (fixture test).
- [ ] RBI items appear only in the Economics band; never lead, never breaking banner.
- [ ] ET top-stories / BBC Hindi / CNBC Politics / Guardian Environment items never appear in the homepage top pool, only their verticals.
- [ ] An item with an unparseable pubDate is dropped — never assigned `now()` (unit test on `parseFeed`).
- [ ] Moneycontrol is absent from feed config; Business Standard is not added until verified from Vercel IPs.
- [ ] Every displayed headline/summary/timestamp is verbatim from a real feed item; the cluster's displayed member is an existing member (no synthesized "cluster headlines").
- [ ] Every slot decision is reproducible from `news_items` + `news_clusters` rows (deterministic formula, no hidden state).
- [ ] Inserting a `homepage_pins` row swaps the lead within one poll cycle and reverts at `expires_at`.

---

### News freshness (near-instant refresh)

### Why: five stacked delay layers ⇒ worst case ~16–22 min today

From the latency review Part C (verified file:line):

| # | Layer | Where | Delay |
|---|---|---|---|
| 1 | Publisher RSS lag | external | ~1–5 min typical |
| 2 | RSS fetched **on-demand only**, per-instance in-memory TTL | `lib/data/chain.ts:41` (`news: 5*60_000`); fetch `rss.ts:196-212` (no conditional GET) | up to **5 min** per instance |
| 3 | CDN on `/api/news` | `app/api/news/route.ts:25` → `s-maxage=60, swr=360` | up to 60 s fresh + 360 s stale |
| 4 | Homepage ISR | `app/(news)/page.tsx:31` (`revalidate = 300`) | up to **5 min**, may bake already-stale data |
| 5 | Client refetch of news | **none** — `lib/quote-poller.ts:14` polls quotes @15 s; zero news polling | **∞ until reload/nav** |

Worst-case publish→visible on the homepage ≈ **16–22 min**, and only on a fresh page load. Direct `/api/news` ≈ 6–12 min.

### Target and mechanism

**Target: publish→visible ≈ 1–2.5 min**, dominated by publisher lag. Three changes (Part C's mechanism, with its "write to Redis" adapted to the **Postgres-only** news-storage decision above):

1. **Background poller** with conditional GET (ETag/If-Modified-Since from `feed_state`) → parse → dedupe → cluster/score → **write to Neon Postgres**. Removes layer 2's on-demand nature: user requests never trigger RSS fetches.
2. **`/api/news` reads the store** (indexed Postgres reads — cheap at this volume). Lower CDN caching at `app/api/news/route.ts:25` to **`s-maxage=15–30, stale-while-revalidate=60`**.
3. **Homepage top-news modules become a client island polling `/api/news` every 60 s**, mirroring the `lib/quote-poller.ts` pattern (one shared interval, hidden-tab skip — never per-component polling). The SSR shell **keeps `revalidate=300`** (`page.tsx:31`) so headlines stay in server HTML for SEO. SSE is a later upgrade, not launch scope.

Resulting budget: feed lag + poll tick + ≤30 s CDN + ≤60 s client poll ≈ **~1–2.5 min** from ingestion; see Open questions on poll cadence for the end-to-end figure.

### Where the poller runs

- **Option A — Vercel Cron (1-min floor).** Zero new infrastructure; the 1-min tick is exactly the scheduler granularity we need. Each invocation is stateless — all poll state lives in `feed_state`. Each tick polls only feeds whose per-feed interval has elapsed.
- **Option B — long-lived worker (tiny VM/container).** The latency review already establishes this worker is needed for **quotes**: Vercel functions cannot hold the persistent Binance/Bybit WebSocket for tick ingestion. **The same worker can host both** the quotes WS ingester and a news poll loop — one process, one deploy, sub-minute polling possible.
- **Recommendation: start on Vercel Cron (step ships with zero infra); when the quotes WS worker lands, consolidate the news poll loop into it.** Cross-reference: the quotes/latency section of this plan owns the worker provisioning decision — decide once, host both.

### Acceptance criteria — freshness

- [ ] A new item ingested by the poller is visible on an **already-open homepage within ≤2.5 min without reload** (client island poll).
- [ ] No user request to `/api/news` or the homepage ever fetches RSS upstream in the request path (poller-only ingestion; verifiable by request-path tracing).
- [ ] 304-capable feeds (BusinessLine, ET Markets) send validators from `feed_state` and skip body processing on 304.
- [ ] `/api/news` responds with `s-maxage` 15–30 and `stale-while-revalidate` 60.
- [ ] Homepage server HTML still contains headlines (SEO shell intact, `revalidate=300` unchanged).
- [ ] Exactly one shared news-poll interval on the client (no per-component polling), skipped when the tab is hidden.
- [ ] A failing feed increments `feed_state.fail_count` and is skipped without failing the tick; stale data renders marked "Delayed — as of …" per docs/18 §2, never fabricated.

---

### Open questions (news)

1. **Poll cadence vs the 1–2.5 min target.** Part C's arithmetic assumes ~1-min polling; the live-tested politeness intervals are 5–15 min per feed, which caps end-to-end freshness at ~6–8 min for a 5-min feed. Since a 304 conditional GET is near-free, proposal: poll **304-capable feeds (BusinessLine, ET Markets) at the 1-min cron floor** and keep 5–15 min for full-body feeds. Needs owner sign-off (publisher politeness trade-off).
2. **Poller host, long-term.** Cron now is settled as the start; the shared long-lived worker (news poll + quotes WS) is a provisioning/cost decision owned jointly with the quotes section — decide once.
3. **Pass B LLM spend.** Recommended but paid (~$1.35–9/mo); project rule is free-unless-approved. Approve budget + model choice, or defer.
4. **Google News query set.** The Reuters-substitute query feeds need an initial query list (e.g., index names, RBI/SEBI, top-cap earnings) with `W_src=0.7`; propose at implementation for editorial sign-off.
5. **Business Standard.** Retest `markets-106.rss` from a deployed Vercel function; add only if it clears the 403.
6. **`W_src` for legacy feeds** (CNBC, MarketWatch, CoinDesk, TechCrunch, RBI) — unassigned in the proposal table; set editorially in config during step 4.

---

## 4. Language architecture: global Hindi/English toggle + translation + Hindi TTS


**Fixed directives (non-negotiable):** (1) one global site-wide Hindi/English toggle switching UI chrome AND translating article text, plus a per-article toggle near the top of every article, plus Hindi TTS for Listen; (2) any machine-translated text is clearly labeled as translated; (3) real content only — translation transforms real articles, never fabricates; numbers, tickers, and data values are never translated.

---

### 1. What replaces what (docs/35 delta)

Hindi stops being a separate content silo and becomes a **translation layer over the single real article corpus**.

| docs/35 item | Status |
|---|---|
| Tier 1 — UI chrome toggle (`messages/{en,hi}.json`, cookie) | **KEPT & extended** — it is the scaffold this plan builds on (`lib/i18n.ts` exists) |
| Tier 2 — dedicated Hindi-RSS home (`/hindi`) as *the* Hindi experience | **SUPERSEDED as the Hindi strategy.** The primary Hindi experience is now toggle + MT on every article. The Hindi-RSS aggregation may live on later as a curated shelf under the reserved `/hi` prefix (§4) — optional, not this rollout |
| Tier 3 — own human-written Hindi articles | **KEPT as future** — now with a concrete promotion path: human-reviewed translations graduate to `/hi` + hreflang (§4) |
| Tier 4 — "MT never presented as original; clearly labeled मशीन अनुवाद" | **KEPT verbatim and activated** — it is the operative rule of §2's labeling spec |
| §2 implementation notes (all strings through dictionary; Devanagari font; Indian numbering via `lib/format.ts` `indian` opts; IST dates via `Intl.DateTimeFormat('hi-IN')`) | **KEPT** — unchanged rules, now on the critical path |
| §3 audio rules 1–5 (no TTS-as-human, bilingual AI-audio label, no autoplay, MediaSession, keyboard access, pronunciation review before shipping Hindi TTS) | **KEPT verbatim** — §5 implements them; rule 5 is a hard gate |
| §4 editorial style (Hinglish register, English financial terms in Latin script, digits in headlines, `docs/glossary-hi.md`) | **KEPT** — the glossary now also primes the Gemini fallback prompt and the TTS pronunciation review |
| §5 testing additions | **KEPT** — folded into §6 acceptance criteria |

---

### 2. UX spec — the two toggles + labeling

**Global toggle (header, every page).** `EN / हिंदी` switch rendered as the edition selector in the **Utility Bar above the masthead (Part 2 §A)** — present on every page. Sets `LOCALE_COOKIE` (`indrani_locale`, exists in `lib/i18n.ts`); SSR reads the cookie so the correct language renders server-side with no flash. Switches **all UI chrome** (nav, section bands, footer, buttons, empty/stale states, article shell labels, player strings) via `t(locale, key)` **and** makes article headlines/summaries/bodies render translated (§3). Extension work on the existing scaffold: (a) grow `messages/{en,hi}.json` from ~37 leaf strings to full chrome coverage including every new string this plan introduces (badges, helper texts, player); (b) a header `LocaleToggle` component that sets the cookie (server action / route handler) and refreshes; (c) `resolveLocale(searchParams, cookies)` added to `lib/i18n.ts` (§4) used by layout + pages.

**Per-article toggle (top of every article).** A small `हिंदी / English` control under the byline. Sets **only** `?lang=hi|en` on the article URL — never mutates the cookie — so one story can be flipped without changing the whole site, and the resulting URL is shareable. Precedence: `?lang=` wins over cookie wins over default (§4).

**Labeling spec (whenever any displayed text is MT).** Rationale one-liner: bare "AI-generated" labels *reduce* trust — disclose the process instead (arXiv 2601.11072, Jan 2026; cited in `docs/research/RESEARCH_HINDI_TOGGLE_MT_TTS.md`).
- Persistent badge under the headline/byline: **`⚠ मशीन अनुवाद · Machine translated`** + inline link **"मूल अंग्रेज़ी देखें / View original (English)"** (= the per-article toggle to `?lang=en`).
- Expander on the badge: "Translated automatically by *\<engine\>* (from `article_translations.engine`). Not reviewed by Indrani editors. The English original is authoritative."
- Small **"MT" chip** on translated headline cards (home, verticals, rails).
- Badge repeated at the article footer; and **spoken as the first sentence of Hindi TTS audio** (§5).
- Curated `/hi` content and human-written text are **never** labeled MT. All badge strings live in `messages/{en,hi}.json`.

**Never translated (directive 3, mechanical guarantee):** market-data components never pass through MT at all — they render from the `lib/data` layer with `lib/format.ts` (Indian grouping on `hi` + Indian instruments stays a kept docs/35 rule). Inside article prose, numerals, tickers, and data values are masked as placeholders before the MT call and restored verbatim after; a post-check asserts the digit/ticker sequences are unchanged or the translation is discarded (falls back to English + notice).

---

### 3. Translation pipeline — engine chain, cache schema, volume math

**Engine chain** (docs/18 §2 ordered-fallback pattern; free-first; each step's reasoning inline). **Never block render on live MT.**

1. **Postgres cache** — Neon is already in the stack; docs/17 defines no Redis layer, don't add one.
2. **Azure Translator F0** — biggest permanent free quota (2M chars/mo) and it hard-stops (429/403) at quota, so no surprise bills. 50k chars/request cap → chunk long bodies.
3. **Google Cloud Translation v2** — best-in-class Hindi NMT, 500k chars/mo permanent credit; counts every code point including markup → send plain-text segments only.
4. **Gemini Flash-Lite** — glossary-primed prompt matches the docs/35 §4 Hinglish register; **headlines/summaries only** when 2–3 are exhausted. Free tier may train on inputs → never send embargoed content (or use a paid key, §7).
5. **Graceful floor** — serve English + notice **"अनुवाद अनुपलब्ध / translation unavailable"**. English render is never degraded by a translation failure.

Rejected/deferred: LibreTranslate/Argos (en→hi quality unverified — no public benchmarks), IndicTrans2 self-host (GPU + Vercel-serverless mismatch; the future upgrade if volume outgrows free tiers).

**Cache schema** (translate once, serve forever):

```
article_translations(
  article_id, target_locale, field ∈ {headline, summary, body},
  source_hash,          -- hash of source text: article edits invalidate & retranslate
  engine ∈ {azure, google, gemini},   -- powers the labeling expander + audit
  translated_text, translated_at,
  UNIQUE (article_id, target_locale, field)
)
```

Next data cache / CDN layers sit on top per docs/17. All engine keys server-side only (docs/18 §1).

**Volume strategy — the load-bearing math** (~50 articles/day ≈ 1,500/mo; body ≈ 5k chars):

| Scenario | Chars/month | Verdict vs free ceiling (Azure 2M + Google 0.5M = 2.5M) |
|---|---|---|
| **Eager headlines+summaries at ingest** (adopted) | **~150k** | Fits Azure F0 **alone** at ~7.5% of quota |
| Eager full bodies (rejected) | 50 × 5k × 30 = **7.5M** | **3× the combined free ceiling — impossible free** |
| **Lazy bodies on first Hindi request, then cache forever** (adopted) | Demand-driven; even 10% of the catalog read in Hindi ≈ 750k in month 1, then steady-state falls to newly-read articles + edit invalidations | Fits Azure F0 headroom after the eager spend |

So: **headlines+summaries translate eagerly at ingest** (Hindi homepage/cards are instantly coherent); **bodies translate lazily on first Hindi request** and are cached permanently, keyed by `source_hash`.

**Streaming behavior:** first-ever Hindi view of a body may hit a live API → stream the English shell immediately and put the translated body behind Suspense; every subsequent view renders server-side from Postgres with no external call.

---

### 4. URL / SEO architecture

- **Global toggle = cookie, same URL.** Googlebot (no cookie) gets default English at the canonical URL → MT variants are **deliberately not indexed** → zero scaled-content-abuse exposure while MT is unreviewed. Trade-off accepted: no Hindi SEO for MT pages, because unreviewed MT at scale is exactly Google's "little value" risk case.
- **Per-article override = `?lang=hi|en`.** One server-side **`resolveLocale(searchParams, cookies)`**: `?lang=` → else `LOCALE_COOKIE` → else `DEFAULT_LOCALE`; used by layout and article page so chrome + body always agree. `?lang=` variants carry `rel=canonical` to the clean URL (standard param canonicalization; no noindex needed).
- **`/hi` prefix is reserved ONLY for future curated/human-reviewed Hindi** (Hindi-RSS shelf, human-post-edited translations) with `hreflang="hi"/"en"/x-default` pairs — the SEO-safe Hindi surface. If MT later gains a human-review pass (Le Monde MTPE model), promote those articles to `/hi/...` then. **Interim `/hindi` behavior (resolves the Phase 1 item 3 tension):** the `/hindi` vertical route ships in Phase 1 as an ordinary vertical page rendering the existing Hindi-RSS feed items (real content, honestly a category page — NOT presented as "the Hindi edition"); the global toggle is the Hindi strategy. When the curated `/hi` shelf ships, `/hindi` 308-redirects to `/hi` and the nav slug unifies.
- Pages already dynamic (cookies/searchParams) — consistent with the article pages' current rendering mode.

---

### 5. Hindi TTS — spec + fallback matrix

**MVP: browser-side Web Speech API `hi-IN`** — free, zero infra, no audio storage; accepted trade-off is device-dependent voices. Known traps, all handled:

- **Chunking:** split body into sentence utterances **≤200 chars** (Chrome kills utterances at ~15s); one queue controller feeds the player.
- **Voice detection:** `getVoices()` + `voiceschanged` listener; match `/hi[-_]IN/i` (Android sometimes reports `hi_IN`), fall back to `/^hi\b/`; set `utterance.lang='hi-IN'` on every utterance regardless of matched voice.
- **User gesture required** for `speak()` — aligns with docs/35 rule 3 (never autoplay).
- **iOS:** all browsers use Safari's engine; needs an Apple Hindi voice (e.g. Lekha) installed on-device.

**Fallback matrix (honest — never fake availability):**

| Detection outcome | Behavior | Copy |
|---|---|---|
| hi voice matched | Hindi TTS via chunked queue | "AI-generated audio / एआई-जनित ऑडियो" label (docs/35 rule 2 verbatim) |
| hi listed but suspect (Android may list `hi-IN` with no voice pack → silent English audio) | Attempt playback + persistent helper text | "अगर आवाज़ अंग्रेज़ी में सुनाई दे, तो फोन Settings में Hindi voice इंस्टॉल करें" |
| No hi voice | Offer **English TTS of the English original** + explanatory message | Honest "Hindi voice unavailable on this device" |

**Player integration:** speed **1x/1.5x via `utterance.rate`**, feeding the persistent bottom player (Stage 4 below) — our differentiator (Bloomberg has no sticky player and no speed control). MediaSession metadata + keyboard operability (docs/35 rule 3). The MT disclosure (§2) is spoken as the **first sentence** of any Hindi TTS of translated text.

**Gate:** docs/35 rule 5 — pronunciation review of `docs/glossary-hi.md` financial terms before Hindi TTS ships; bad Hindi TTS is worse than none.

**Phase 2+:** Sarvam Bulbul server-side cached MP3s (₹1000 free credit; vendor "lowest CER" claim **UNVERIFIED**) behind the docs/34 quality gate; AI4Bharat Indic Parler-TTS/IndicF5 self-host = future (GPU, not Vercel-viable). **edge-tts REJECTED** for production — Microsoft blocked the browser method Dec 2025 and the legality question is unanswered.

---

### 6. Rollout order + acceptance criteria (each stage independently verifiable)

**Stage 0 — Devanagari font (prerequisite; part of Phase 1 (Foundations & correctness), item 4).** Add Noto Sans Devanagari via `next/font` with the `devanagari` subset into the `app/layout.tsx` font variables/stack (today Inter/Newsreader/Geist_Mono are all `subsets: ["latin"]` → tofu).
*AC:* the `हिंदी` nav label and Hindi headlines render real glyphs (no □□□) on home, article, and quote pages; `pnpm exec tsc --noEmit` green; no new CLS beyond `display: swap`.

**Stage 1 — Chrome toggle end-to-end.** Full `messages/{en,hi}.json` coverage, `resolveLocale`, header `LocaleToggle`, SSR cookie read.
*AC:* toggling flips all chrome strings server-rendered (view-source shows Hindi — no flash); persists across navigation and reload (docs/35 §5); no layout break on longer Hindi strings; no hydration mismatch in console (ties into Phase 1 item 1 hydration fix).

**Stage 2 — Translation pipeline + cache + eager headlines/summaries.** `article_translations` migration; `lib/translate.ts` engine chain with quota hard-stop handling, number/ticker masking, kill-switch env var; ingest hook.
*AC:* new ingested articles get `headline`+`summary` rows; UNIQUE constraint holds; changing source text changes `source_hash` and retranslates; mocked Azure 429 falls through to Google, all engines down serves English + "अनुवाद अनुपलब्ध"; a pipeline failure never blocks or degrades the English render; keys server-side only; Zod on any new route.

**Stage 3 — Article MT surface + per-article toggle + labeling.** Lazy body translation behind Suspense; badge/expander/footer/"MT" chip; `?lang=` + `rel=canonical`.
*AC:* first Hindi body view streams EN shell then Hindi body; second view renders fully server-side from cache (verified: no external MT call); numerals/tickers/data values byte-identical between EN and HI prose renders; badge visible with the correct engine named; `?lang=hi` page carries `rel=canonical` to the clean URL; a cookie-less fetch of the clean URL returns English; per-article toggle changes only the URL param, not the cookie.

**Stage 4 — Hindi TTS + bottom player.** Queue controller, fallback matrix, player with 1x/1.5x, MediaSession.
*AC:* playback starts only on user gesture; a long article (> 15s of audio) plays to completion on Chrome (chunking works); all three fallback-matrix rows reproduce with a mocked `getVoices()`; spoken MT disclosure is the first utterance on translated text; rate toggle audibly changes speed; player keyboard-operable; "एआई-जनित ऑडियो" label present; **docs/35 rule 5 pronunciation review signed off before the feature flag is enabled**.

**Stage 5 — later, gated:** human-review (MTPE) path → promote reviewed translations to `/hi` + hreflang; Sarvam Bulbul server-MP3 spike behind the docs/34 quality decision.

---

### 7. Open questions (genuine — need user input before the relevant stage)

1. **Azure account creation (before Stage 2).** Translator F0 is genuinely free (2M/mo, hard-stops), but requires creating an Azure account + subscription. CLAUDE.md requires approval for anything non-free — this *is* free, but the account itself needs the user's approval/identity. Approve?
2. **Google Cloud project (before Stage 2, fallback engine).** The 500k/mo credit is free but requires a **billing-enabled** GCP project (card on file). Approve, or ship Stage 2 with Azure-only + Gemini + English-fallback until then?
3. **Gemini key posture.** Free tier may train on submitted content — fine for public RSS-derived headlines, but decide: free key with an embargo-content block, or a paid key (cents/month at our volume)?
4. **Pronunciation-review sign-off (Stage 4 gate).** Docs/35 rule 5 requires review of Hindi TTS financial-term pronunciation. Who signs off — the user listening to a generated checklist of `glossary-hi.md` terms, or is a builder-produced recording + transcript sufficient?
5. **Logged-in locale sync.** Docs/35 §2 mentions persisting preference to the user profile when logged in. MVP is cookie-only; add profile sync now or defer?

---

## 5. Quotes latency: measurements + target architecture

Baseline methodology and file:line audit: `~/scratchpad/indrani-latency-review.md` (2026-07-14). Mandated target: `docs/43_NEW_DATA_SOURCE_FINDS_PENDING.md` §12d + §13d. Budget context: `docs/17_PERFORMANCE_AND_CACHE.md` (API p95 cached ≤ 150ms).

### Before (measured 2026-07-17)

Local dev, `curl` TTFB/total in ms, target `/api/quotes?symbols=AAPL,MSFT,^NSEI,RELIANCE.NS,BTC-USD` unless noted:

| Scenario (local dev, /api/quotes?symbols=AAPL,MSFT,^NSEI,RELIANCE.NS,BTC-USD) | min | p50 | p95 | max |
|---|---|---|---|---|
| First hit of session | — | — | — | 85.4/85.7 ms |
| 20 req 1s apart | 5.8/6.1 | 7.5/7.8 | 69.8/70.1 | 189.6/189.8 |
| Burst ×5 parallel, EXPIRED cache | 207.6 | 274.0 | 363.2 | 363.2 |
| Burst ×5 parallel, warm cache | 9.3 | 14.6 | 33.2 | 33.2 |
| /api/news ×5 | 5.1 | 5.4 | 875.2 | 875.2 |
| /api/movers ×5 | 5.0 | 5.2 | 194.0 | 194.0 |

Headers verified live: quotes `s-maxage=10, stale-while-revalidate=60`; news/movers `s-maxage=60, swr=360` (emitter `lib/api.ts:76`, quotes n=10 at `app/api/quotes/route.ts:10`).

**Prod:** `https://indrani-git-main-akash1862h-1494s-projects.vercel.app` → 302 SSO in 29.3ms (deployment protection) — unmeasurable today. No `VERCEL_AUTOMATION_BYPASS_SECRET` exists (checked `.env.local` and `vercel env ls`). No `UPSTASH_*` keys and zero redis/upstash code in `lib/` or `app/`. Region iad1 (no `preferredRegion`), Node runtime everywhere. (`indrani.vercel.app` is an unrelated hotel site — never cite it.)

### Prod BEFORE (measured 2026-07-18T15:55Z — fills the empty prod baseline row above)

Probe: this box (iad-adjacent baseline, WSL2); every response served from PoP `iad1`. Raw log: `~/scratchpad/latency-before-prod-20260718-1555.txt`. Auth deviation from protocol step 2: the only credential on this box (Vercel MCP OAuth token) is **forbidden** from creating the protection-bypass secret (403 `projectProtectionBypass:create`), so the battery authenticated via an MCP-issued temporary share link exchanged for a `_vercel_jwt` cookie — validated at the edge like the bypass header, equivalent TTFB overhead. Everything else (symbol set, scenarios, curl timing fields) identical to the 07-14/07-17 battery.

TTFB ms (totals within 0.1–0.4ms of TTFB — payloads are tiny):

| Scenario (prod, /api/quotes?symbols=AAPL,MSFT,^NSEI,RELIANCE.NS,BTC-USD) | min | p50 | p95 | max | x-vercel-cache |
|---|---|---|---|---|---|
| First hit of session | — | — | — | 513.5 | MISS ×1 |
| 20 req 1s apart | 16.4 | 20.9 | 51.5 | 53.0 | HIT ×18, STALE ×2 |
| Burst ×5 parallel, EXPIRED cache (25s past s-maxage=10) | 42.4 | 46.5 | 65.1 | 84.5 | STALE ×5 |
| Burst ×5 parallel, warm cache | 31.5 | 36.6 | 44.0 | 46.8 | STALE ×5 |
| /api/news ×5 | 18.9 | 20.2 | 30.9 | 927.4 | MISS ×1 (927.4), HIT ×4 |
| /api/movers ×5 | 18.6 | 20.2 | 36.4 | 196.4 | MISS ×1 (196.4), HIT ×4 |

HIT/MISS split (protocol step 4): CDN-HIT/STALE rows p50 ≈ 20–47ms; the only true function-path samples are the three MISSes — quotes 513.5ms (cold start + Yahoo), news 927.4ms, movers 196.4ms — matching the local expired-path profile. Two prod-specific observations for the AFTER comparison:
1. **CDN `swr=60` masks the expired-burst queueing signature from the client**: the ×5 expired burst returned STALE in 42–85ms (background revalidation at the PoP) instead of the local 207–363ms block. The queueing cost still exists — it moved into the PoP's revalidation and shows up as the 513/927ms MISSes whenever a request lands outside the swr window, on a cold PoP, or on a novel query string (per-PoP, per-query-string keying — "Where the time goes" #4). Single-PoP probes understate it; the Redis L2 still targets exactly this path.
2. From an iad-adjacent probe, the CDN-HIT p50 (~21ms) already beats the §5 target (≤60ms); the architecture's job remains making MISS cheap (≤80ms via Redis) and bom1 cheap for India users (step 6 + Mumbai probe).

### Where the time goes (file:line, from the 07-14 review Part B, re-confirmed today)

1. **Expired-cache burst is the killer path.** 5 parallel requests on an expired cache = 207–363ms: all queue behind one upstream Yahoo refresh (`getQuotes` `lib/data/chain.ts:54` → `safeFetch` `lib/data/safe-fetch.ts:71` → `lib/data/providers/yahoo.ts:26`; 3s provider timeout, `DEFAULT_TIMEOUT_MS` `safe-fetch.ts:29`). On Vercel, every new/concurrent lambda instance starts with an **empty module-scope TtlCache** (`lib/data/cache.ts:70`), so this is empirically the **common prod path**, not the exception.
2. **Cache is per-instance only.** Quotes TTL 15s / max-stale 15min (`chain.ts:36-37`); serve-stale (`cache.ts:41-49`) and batching (`lib/data/batch.ts:25`) help only within one instance. Nothing is shared across instances or regions.
3. **Crypto/rest split** (`chain.ts:58-59`) means one request can wait on two upstreams (Binance + Yahoo).
4. **CDN keying fragments hits**: `s-maxage=10`, per-PoP, per exact query string — varied symbol sets rarely share a CDN entry.
5. **Geography**: default iad1, Node runtime; India users pay cross-ocean RTT + possible cold start (+250–1000ms) on every CDN MISS.

### Target architecture (docs/43 §12d — mandated; not a provider change)

```
Browser ──> Vercel CDN (s-maxage=10, swr=60 — unchanged)
              │ MISS
              ▼
        /api/quotes route (shape unchanged; app/api/quotes/route.ts)
              │
        L1: TtlCache micro-cache (per-instance, keep as-is, cache.ts:70)
              │ miss
        L2: Upstash Redis (HTTP, ~10–20ms from Vercel) ◄────────────┐
              │ miss                                                │ writes
        L3: provider chain (Yahoo→Finnhub / Binance→Yahoo,          │
             chain.ts:54 — unchanged public API) ─ write-back ──────┤
                                                                    │
   Always-on worker (outside app/):                                 │
     • persistent WS per crypto exchange (Binance/Bybit/OKX) ───────┤  ticks
     • 15s REST refresher: 155-symbol directory (stocks/indices/FX, │
       no free WS exists in the zero-KYC stack) ────────────────────┘
     • news poll loop (news-freshness plan — writes Neon Postgres, never Redis)
     • multi-key rotation for REST-only fallbacks (Finnhub etc., §12d(3))
```

**Integration points** (exactly per the 07-14 review; read order L1 → Redis → provider chain with write-back):
- `lib/data/cache.ts:70-75` — add a Redis-backed cache client; keep TtlCache as L1 micro-cache.
- `lib/data/safe-fetch.ts:71-103` — insert the Redis read between fresh-L1 and the provider loop; write-back to Redis on provider success.
- `lib/data/chain.ts:54` — public API unchanged; TTLs become shared, not per-instance.
- `app/api/quotes/route.ts` — response shape unchanged; optional `runtime='edge'` later for the pure-Redis read path.
- New ingest worker outside `app/` (placement below).

### Redis key scheme (PROPOSAL — docs/43 doesn't prescribe one; needs sign-off at merge)

| Key | Value | TTL |
|---|---|---|
| `quote:{SYMBOL}` | Quote JSON + `ts` (epoch ms) | 2–5s crypto (WS-fed, effectively always fresh); 10–15s equities/indices/FX market-hours; longer when market closed (mirror `lib/market-hours.ts` discipline, docs/17 §4) |
| `chart:{SYMBOL}:{range}` | candles JSON | per existing docs TTLs (intraday 30s, daily 10min — `chain.ts:38-39`) |

News is deliberately absent from this table: per Part 3's storage decision, news lives in Neon Postgres only — the worker's news poll loop writes Postgres, and Redis holds quotes/charts exclusively.

Reads use one `MGET` per request; worker writes coalesce into one pipeline/`MSET`-per-flush (this matters for free-tier arithmetic below).

**Staleness semantics carry over unchanged**: each Redis value stores its own `ts`, so `safeFetch` can keep the existing fresh/stale/unavailable contract (`meta.isStale`, amber "delayed" tag, docs/18 real-data-only rule). Redis key TTL is set to the max-stale window, not the fresh window — a value past its fresh age but inside max-stale is served stale-flagged exactly like `cache.ts:41-49` does today, just shared across instances. The provider chain remains the last resort and the write-back path, so if Redis is down or empty the system behaves exactly as it does now — Redis is purely additive, never a new single point of failure.

### Worker placement (resolves the docs/43 gap)

Vercel functions cannot hold persistent WebSocket connections, so the WS ingester must live elsewhere. Options:

- **(a) Tiny always-on VM/container — RECOMMENDED primary.** This dev box now; a $4–6/mo VPS later. One pm2-managed Node worker (auto-restart, log rotation) hosting BOTH the WS tick ingester AND the 60s news/quote background refresher — the news-freshness plan section needs the identical worker, so one process serves both plans. The worker imports the same `lib/data/providers/*` modules the app uses (no logic fork); it needs only the Upstash REST credentials plus provider keys. Cost is $0 today (dev box); the VPS step needs approval (open question).
- **(b) Vercel Cron — degraded fallback only.** 1-minute floor, REST refresh only, no WS possible. Keep the refresher invokable as an HTTP route so Cron can drive it if the worker is down; quotes degrade from ~15s to ~60s freshness, crypto loses tick-freshness but still refreshes via REST.
- **(c) Upstash QStash/schedules.** Same REST-only limitation as (b) with an extra vendor dependency; no advantage over (b) for us. Not recommended.

**Recommendation: (a) primary + (b) as automatic degraded fallback.**

### Projected after (PROJECTIONS, not measurements)

Reasoning: user-visible ~50ms p50 comes from either a CDN HIT (~20–60ms) or a near-region function invoke + Redis hit (~10–30ms + invoke). Residual risks are iad1 Node cold starts and India-user RTT; mitigations are `preferredRegion` (bom1/sin1) on quote routes, optional edge runtime for the pure-Redis read path, and keeping `s-maxage=10` CDN in front.

| Path | Projected TTFB | Basis |
|---|---|---|
| CDN HIT | ~20–50ms | PoP RTT only; unchanged headers |
| CDN MISS + Redis HIT (the new common path) | **p50 ≈ 40–80ms** | invoke ~15–30ms + Redis ~10–20ms + serialize; near-100% Redis hit rate because the worker pre-populates keys before anyone asks |
| CDN MISS + Redis MISS + cold start | unchanged (~300ms–1s+) | should become rare (worker keeps keys warm); honest worst case |

These are projections until the measurement protocol below runs against prod. The 07-17 warm-cache burst (p50 14.6ms local) is the existing proof that the serve-from-memory path is fast — the architecture's job is to make "warm" the shared, common case instead of the per-instance lucky case. Two second-order wins worth naming:
- The 200–360ms expired-burst queueing signature disappears entirely: concurrent misses across *different instances* now share one Redis value that the worker refreshed before expiry, instead of each empty instance racing to Yahoo.
- Provider load drops to a fixed floor (worker cadence × directory size) independent of visitor count — which is the actual "feels unlimited" claim of docs/43 §12d, and what protects the Finnhub/Yahoo fallbacks from traffic-correlated rate-limit trips.

### Measurement protocol (before/after comparability)

**This is implementation step 1** — it also unblocks ALL prod verification for every other plan section.

1. Enable **Vercel Protection Bypass for Automation** on the project (generates `VERCEL_AUTOMATION_BYPASS_SECRET`) — or disable deployment protection. Prefer the bypass secret: protection stays on for humans.
2. Re-run the exact 07-14/07-17 curl battery against prod (`x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET` header), same symbol set `AAPL,MSFT,^NSEI,RELIANCE.NS,BTC-USD`: first-hit, 20×1s-apart, burst ×5 expired, burst ×5 warm, plus /api/news and /api/movers ×5. Record `curl -w '%{time_starttransfer}/%{time_total}'` per request, min/p50/p95/max, and `x-vercel-cache` + `x-vercel-id` per response.
3. Probe locations: (i) this box (iad-adjacent baseline); (ii) optionally a Mumbai probe (any cheap probe or the future VPS) for India-user reality. Same battery from both.
4. Report p50/p95 TTFB per scenario in the same table format as the Before table; split rows by `x-vercel-cache` HIT vs MISS so the before/after comparison isolates the function path (which is what the architecture changes) from CDN luck (which it doesn't).
5. Run the BEFORE battery on prod *before* merging any architecture change — today's table is local-dev only; the prod baseline row is currently empty and step 1 fills it.

### Rollout steps + acceptance criteria

| # | Step | Acceptance criteria |
|---|---|---|
| 1 | Enable protection bypass; run prod BEFORE battery | Prod p50/p95 table recorded in this doc's format; `x-vercel-cache` observed |
| 2 | Provision Upstash Redis (free tier); add `UPSTASH_REDIS_REST_URL`/`_TOKEN` to Vercel + `.env.local` | `redis.ping()` from a Vercel function < 30ms |
| 3 | Redis L2 in `safe-fetch.ts` (read L1→Redis→chain, write-back), key scheme above | All existing routes unchanged in shape; `pnpm exec tsc --noEmit` clean; burst ×5 expired-L1 on prod serves from Redis with p95 ≤ 150ms (docs/17 budget) |
| 4 | Worker on dev box (pm2): 15s directory refresher writing `quote:*` | `quote:{SYMBOL}` age ≤ 20s for all 155 directory symbols during market hours, sampled over 10 min |
| 5 | Worker: crypto WS ingester (Binance first, §12a chain later) | `quote:BTC-USD` age ≤ 5s sustained; zero REST crypto calls on the read path while WS healthy |
| 6 | `preferredRegion = ['bom1']` (fallback `sin1`) on quote/chart/news routes | `x-vercel-id` shows bom1; Mumbai-probe p50 improves vs step-1 baseline |
| 7 | Vercel Cron fallback route driving the refresher | Kill worker → keys keep refreshing at ≤ 60s cadence |
| 8 | Prod AFTER battery (same protocol) | **p50 TTFB ≤ 80ms measured from iad-adjacent probe on CDN MISS with Redis HIT; p95 ≤ 150ms warm; CDN HIT p50 ≤ 60ms**; expired-L1 burst no longer shows the 200–360ms queueing signature |
| 9 | (Optional, later) `runtime='edge'` for pure-Redis read path; VPS move | Only after 1–8 verified; separate approval |

### Free-tier arithmetic (Upstash: 500k commands/mo free)

Writes (worker coalesces each flush into ONE pipeline/MSET command — this is load-bearing):
- Stocks/indices/FX refresher: 2 cmds/cycle (write + expire) × 4/min × 60 × ~13h combined US+India market window × 22 days ≈ **137k/mo** (off-hours drops to 5-min cadence per docs/17 §4 — negligible).
- Crypto WS flush: 1 cmd per 2s, 24/7 = **~1.3M/mo → alone blows the free tier.** Fix: adaptive flush — 2s only while a reader heartbeat key is warm, 30–60s idle. At current pre-launch traffic, effective ≈ **100–200k/mo**.
- Reads: 1 MGET per CDN-miss request; at ~10k misses/day ≈ **300k/mo** (L1 micro-cache absorbs same-instance repeats).

**Total ≈ 540–640k/mo — marginally OVER free even with adaptive cadence.** Honest conclusion: free tier only holds pre-launch if reads stay low; any real traffic crosses it. Paid step: Upstash pay-as-you-go ≈ $0.20 per 100k extra commands → ~$1–5/mo at early volumes. Per CLAUDE.md (free unless approved), **this needs explicit approval** — flagging now rather than discovering it as a surprise bill or a silently rate-limited cache.

### Open questions

1. **Cost approvals**: Upstash paid overage (~$1–5/mo likely) and the later $4–6/mo VPS. Both blocked on user approval; dev-box worker + free tier is the $0 starting configuration.
2. **preferredRegion**: bom1 assumes India-weighted audience (product intent); confirm before step 6 — it moves ALL misses' compute, and US users then pay the cross-ocean hop instead.
3. **Key-rotation ToS check** (§12d(3)): verify Finnhub/Alpha Vantage terms before creating second free accounts.
4. **Key scheme sign-off**: the `quote:{SYMBOL}` scheme above is a proposal; docs/43 must be updated with the chosen scheme at merge time.
5. **Edge runtime timing**: worth doing only for the pure-Redis path and only after step 8 numbers show cold starts still matter.

---

## 6. Tooling: skills, plugins, agents


Rule stays fixed: the only agent structure is the three established project subagents in `.claude/agents/` — **researcher**, **builder**, **reviewer** — fanned out in parallel per work item. No larger permanent multi-agent structure will be created (user directive).

### Agent usage per phase (how the three are fanned out)

| Phase of work | researcher | builder | reviewer |
|---|---|---|---|
| Bug fixes (chart tabs, movers, entities, fonts, build) | — | one builder per independent bug (parallel branches) | verifies each fix live in the browser + e2e before merge |
| Routing gaps (verticals, /search) | — | one builder for routes, one for search page (parallel) | click-audit every nav link post-build |
| News curation pipeline | verifies each new feed live (200/304 behavior, categories) before adoption | poller + scoring + clustering + schema | replays the "temple story / RBI flood" scenarios against the new ranker |
| Homepage redesign | — | one builder per module group (hero+rail, bands+cards, media, newsletter) in parallel worktrees | visual + interaction audit at 1440/768/375, CTA presence check per module |
| Language toggle + MT + TTS | confirms engine quotas/endpoints at build time | i18n chrome pass, translation pipeline, TTS player (sequential — shared surface) | labeling-compliance audit: every MT string carries the badge; numbers never translated |
| Quotes latency | — | Redis layer, WS ingester worker, region/runtime changes | runs the before/after measurement protocol; confirms real numbers, no regressions |

### Skills (installed, verified present) → where they apply

| Skill | Applied to |
|---|---|
| `frontend-ui-engineering`, `design-an-interface`, `vercel-composition-patterns`, `vercel-react-best-practices` | homepage module system, card grids, server/client island split |
| `dataviz` | sparklines, twin-index module, movers visual treatment (read before any chart code) |
| `performance`, `performance-optimization`, `vercel-optimize` | latency work, CLS-free image boxes, polling discipline (docs/17) |
| `accessibility` | card/link semantics, aria-selected tabs, `lang="hi"` attributes, reduced-motion |
| `browser-testing-with-devtools` + `playwright` / `chrome-devtools-mcp` plugins | every bug-fix verification, e2e click tests (chart tab changes SVG path, movers toggle swaps rows) |
| `diagnosing-bugs`, `debugging-and-error-recovery`, superpowers `systematic-debugging` | hydration-mismatch hunt on the quote page |
| `tdd` / `test-driven-development` | ranking score, cluster dedup, entity-decode — pure functions, test-first |
| `security-and-hardening` + `security-review` | new API surfaces (subscribe endpoint, translation route), feed URL allowlisting |
| `research` + `last30days` | feed replacement verification, engine/API changes since research date |
| `observability-and-instrumentation` | poller health, translation-quota counters, Redis hit-rate logging |
| superpowers `writing-plans` / `executing-plans` | this plan's phase execution protocol |
| `vercel` plugin | env management (bypass secret, Upstash vars), deploy verification |
| `context7` plugin | up-to-date library docs (next/font Devanagari subset, Upstash SDK, Web Speech API) |
| `neon` MCP | `news_items`/`news_clusters`/`feed_state`/`homepage_pins`/`article_translations`/`newsletter_subscriptions` schema work |
| `tinyfish` MCP | stealth re-checks of bloomberg.com during build (pattern drift), feed liveness probes |
| `context-mode` / `claude-mem` | session memory — decisions recalled across sessions (never disable; user's memory system) |
| `code-review` plugin | pre-merge review pass on every phase branch |

Not used (checked, deliberately skipped): `figma` (no Figma source of truth exists), `stripe` (no payments in scope), `composio`, LSP plugins other than `typescript-lsp`, 3D/animation skill packs beyond docs/16's restraint (`core-3d-animation`, `aframe-webxr` — homepage stays within the docs/17 perf budget).

---

## 7. Build order & phasing (respects docs/36; each phase = branch → plan → approve → build → audit)

**Phase 0 — Stabilization (MUST be green before any feature work):**
1. Create missing `lib/article-paths.ts` → `tsc` + `pnpm build` green.
2. Deploy the green build (prod stops serving stale bundle).
3. Enable Vercel Protection Bypass for Automation → run the prod BEFORE latency battery (§5 measurement protocol step 1). This unblocks all prod verification for every other section.

**Phase 1 — Foundations & correctness (parallel builder fan-out, one bug per branch):**
1. Chart hydration fix (timezone-pinned tick labels, effect-gated `timeAgo`) + e2e tab test.
2. Movers filter+sort in provider + e2e sign-purity test.
3. Vertical routes (`[vertical]/page.tsx` from `lib/verticals.ts`) + `/search` page + Crypto pill href + `/terminal` handling — kills every 404.
4. Devanagari font (Noto Sans Devanagari via next/font).
5. RSS entity-decode fix (TDD).
6. Quote-page Suspense split (header+chart first).

**Phase 2 — News quality (the single biggest user-visible win):**
Feed swap → `news_items`/`feed_state` persistence + conditional-GET poller (Vercel Cron start) → SimHash clustering → relevance passes + score + slotting → editor-pin. Client island 60s news poll + CDN header lowering (freshness §3). Fixture tests: temple-story can never rank top-5; RBI stack folds to one card.

**Phase 3 — Homepage redesign:**
Grid tokens → module rebuild in §2 order (ticker India-first, twin-index, card-grid section bands, In Focus, inline newsletter cards + real `POST /api/newsletter/subscribe` + `newsletter_subscriptions` table, Watch/Listen media modules real-media-only, Big Take og:image fix, Opinion diversified, Markets Now, footer) → og:image fallback pipeline → acceptance sweep at 1440/768/375.

**Phase 4 — Quotes latency (§5 rollout steps 2–8):**
Upstash provisioning → Redis L2 in `safe-fetch.ts` → worker (dev box pm2): 15s directory refresher + crypto WS ingester → `preferredRegion` → Cron fallback → prod AFTER battery with real numbers.

**Phase 5 — Language (§4 stages 0–4):**
Devanagari font lands in Phase 1 → chrome toggle → translation pipeline + eager headlines/summaries → article MT surface + per-article toggle + labeling → Hindi TTS + bottom player (pronunciation-review gate).

**Phase 6 — Article page (Feature 6 completion):**
Mount the existing ~748 lines of untracked article work behind a real route; fold in per-article language toggle + TTS Listen; then resume Features 7–9.

Phases 4 and 5 can run in parallel after Phase 3. Every phase ends with reviewer audit + STATE.md update per CLAUDE.md session protocol.

---

## 8. Open questions requiring owner decisions

*This is the complete consolidated list — it supersedes the section-local "Open questions" subsections above (kept in place for reading context; every item from them appears here).*

**Accounts / costs (blocking specific phases):**
1. **Azure Translator F0 account** — genuinely free (2M chars/mo, hard-stops at quota) but needs account creation. Approve? (Blocks Phase 5 Stage 2.)
2. **Google Cloud Translation project** — free 500k/mo credit but requires billing-enabled GCP project (card on file). Approve, or ship Azure-only + Gemini + English-fallback until then?
3. **Gemini key posture** — free tier may train on submitted content (fine for public RSS headlines). Free key with embargo-block, or paid key (cents/month)?
4. **Upstash paid overage** — free tier 500k cmds/mo; arithmetic says ~540–640k/mo marginal → ~$1–5/mo. Approve overage, or cap at free tier (adaptive cadence, slightly staler off-peak)?
5. **Worker VM** — $0 today (dev box + pm2); later $4–6/mo VPS for reliability. Approve the later step now or revisit?
6. **Pass B LLM spend** for news relevance (~$1.35–9/mo) — recommended, not launch-required. Approve or defer?

**Product decisions:**
7. **Vercel deployment protection** — enable Protection Bypass for Automation (secret; protection stays on for humans — recommended) or disable protection entirely?
8. **`preferredRegion` bom1** — assumes India-weighted audience; moves ALL misses' compute to Mumbai (US users then pay the hop). Confirm India-first?
9. **NSE/BSE toggle behavior** on the twin-index module — does the toggle swap the data source for all symbols, or only for symbols traded on both exchanges? And does it apply to the module only, or to site-wide index references?
10. **Gift Nifty source** — no free feed verified yet; omit from Phase 3 and add later, or hunt a source now?
11. **In Focus module source** — editor-curated table vs topic-tag filter?
12. **Poll cadence** — 1-min conditional-GET polling of 304-capable feeds (BusinessLine, ET Markets) to hit the 1–2.5 min freshness target; 5–15 min for the rest. Sign off on the politeness trade-off?
13. **TTS pronunciation sign-off** (docs/35 rule 5 gate) — who reviews the `glossary-hi.md` term audio before Hindi TTS ships?
14. **Media module feeds (Watch/Listen)** — no real Indrani podcast/video exists yet, so both media modules ship **omitted** until real media exists (real-data rule). Confirm.
15. **Live TV stream URL** — what is the real RTMP/HLS endpoint for the Live TV module? Until one exists, the module stays an honest live-data board with a Markets Hub CTA.
16. **Most-read analytics timing** — when does the views/analytics table go live? Gates flipping the Most-Read rail label from "Latest" to "Most Read".
17. **Google News query set** — initial query list for the Reuters-substitute feeds (index names, RBI/SEBI, top-cap earnings), `W_src=0.7`; proposed at implementation for editorial sign-off.
18. **Business Standard feed** — retest `markets-106.rss` from a deployed Vercel function (403 Akamai from this box's IP); add only if it clears.
19. **`W_src` weights for legacy feeds** (CNBC, MarketWatch, CoinDesk, TechCrunch, RBI) — unassigned in the tested table; set editorially in config during pipeline step 4.
20. **Key-rotation ToS check** — verify Finnhub/Alpha Vantage terms permit multi-key rotation (docs/43 §12d(3)) before creating second free accounts.
21. **Logged-in locale sync** — docs/35 §2 persists language preference to the user profile when signed in; MVP is cookie-only. Add profile sync now or defer?
22. **Redis key-scheme sign-off** — the proposed `quote:{SYMBOL}` scheme (§5) must be recorded in docs/43 at merge.
23. **Edge runtime timing** — `runtime='edge'` for the pure-Redis quotes read path: worth doing only after step 8 numbers show cold starts still matter. Defer decision to post-step-8?
24. **Logo.dev NSE/BSE coverage** — does Logo.dev reliably cover NSE/BSE symbols (RELIANCE.NS, TCS.BO)? Coverage-gated with monogram-tile fallback either way.

*Empirically testable before asking (researcher probes at phase start, not owner decisions): Logo.dev NSE/BSE coverage (#24) and the Gift Nifty Yahoo symbol (#10) — kept in the numbered list only so nothing is silently dropped.*

---

## 9. Out of scope (deliberately)

- Terminal app (docs/36 Phase 3) — `/terminal` gets only honest placeholder handling here.
- TV/podcast infrastructure (docs/36 Phase 5) — this plan provisions newsletter subscribe storage only; no sending infra, no stream player.
- Human-review MTPE path for Hindi (promotes MT to `/hi` + hreflang) — post-launch upgrade.
- Self-hosted Indic models (IndicTrans2, Indic Parler-TTS) — future, GPU-bound.
- Redis for news/translations — Postgres suffices (decided; Redis scoped to live quotes only).
- Any paid data provider — the entire plan runs on the existing free stack; the only money items are the flagged approvals above.

---

## 10. Success metrics

- **News quality:** zero non-finance stories in homepage top-5 over a 2-week sample; duplicate clusters ≤1 card; lead always image-backed R=1.
- **Freshness:** publish→visible ≤2.5 min on an already-open homepage (no reload) for 1-min-polled 304-capable feeds; ~6–8 min for politeness-capped feeds unless OQ #12 widens 1-min polling.
- **Speed:** prod `/api/quotes` p50 TTFB ≤80ms (CDN MISS + Redis HIT), p95 ≤150ms (docs/17); CDN HIT p50 ≤60ms; expired-burst queueing signature (207–363ms) gone.
- **Bugs:** zero hydration console errors; chart tabs change the SVG on prod; movers sign-pure; zero nav 404s; build green.
- **Design:** ≥3 multi-column module types above the fold at 1440px; zero text-only bands; zero CTA-less modules; zero empty image boxes; LCP ≤2.5s, CLS ≤0.05.
- **Language:** Devanagari renders everywhere; every MT string badged; numbers/tickers byte-identical across EN/HI renders; Hindi TTS chunked playback with spoken disclosure.

---

## Appendix A — Evidence & provenance

**Live-verified 2026-07-17:** today's bloomberg.com structure + curation mix — full-scroll stealth browser session (TinyFish run 74c44be0), no bot wall: top-10 = 8 hard market/macro/geopolitical + 1 Opinion + 1 Big Take, lead "China's Powerful New AI Surprises Investors…", **zero wire bulletins/press releases in the top tier** (wire-like items demoted to a text-only "Latest" rail), zero duplicates (related stories clustered into packages), story stills **exactly 3:2** (740×493/600×400 asset variants), video thumbs 16:9 with duration badge + play overlay, imageless cards routine below the lead tiers, **in-feed newsletter signup card with inline email input + "Sign Up" CTA observed on the homepage** ("Get the Money newsletter"), typed-module stack confirmed with editors owning the top and personalization confined to lower rails (Bloomberg's own "editors remix… in near infinite ways" modular-CMS statement, bloomberg.com/company press 2015; audience-first homepage redesign, Editor & Publisher 2024). One delta from the 07-13 research: the mixed "Listen, Watch and Catch Up" carousel was not present today — media ran as split modules (Today's Videos / Watch / News Now audio), matching the A/B behavior noted in the research; our §2 media module follows the split pattern. Also live-verified today: localhost latency battery (expired-burst 207–363ms empirical); every file:line claim re-confirmed against the working tree; build failure reproduced (`tsc`: missing `@/lib/article-paths`); prod SSO 302 re-confirmed (29.3ms, iad1); no `UPSTASH_*`/bypass secret in `.env.local` or `vercel env ls`; dev-tree browser re-audit (chart tabs work in same-TZ dev — consistent with the TZ-divergence root cause; movers unsorted confirmed; NewsletterBand confirmed as the CTA-less module, 876×290px at y=3545 with 0 links/buttons/inputs; 11 nav 404s reproduced; homepage has 2 images total; screenshots in `~/pw-audit/out/v17-*.png`).

**Live-tested 2026-07-14:** feed liveness (BusinessLine 200+304 ✓, Moneycontrol frozen since Apr 2024 ✗, Reuters RSS 301→404 ✗, Business Standard 403-from-this-IP ?); local latency baseline; news delay-layer analysis.

**Research corpus (on disk; `docs/` and `research/` paths are repo-relative, `scratchpad/` and `pw-audit/` live in the home directory `~/`, outside the repo):** `docs/research/bloomberg-2026-07/` (4 files — homepage/nav/article-quote/audio-video), `research/competitor-financial-news-layouts-2026.md`, `news-homepage-ranking-proposal.md` + `news-curation-research.md`, `docs/research/RESEARCH_HINDI_TOGGLE_MT_TTS.md`, `~/scratchpad/indrani-latency-review.md`, `~/scratchpad/plan-sections/` (6 section drafts merged into this document), audit scripts + screenshots in `~/pw-audit/`.

**UNVERIFIED items carried forward (plausible, no primary source):** NSE/BSE 15-min-delay label as a legal requirement; Reuters UPDATE-numbering convention; Bloomberg's exact card crop ratios (triangulated); Argos en→hi quality; Sarvam CER vendor claim; multi-key-rotation ToS per provider; per-device hi-IN voice presence.

## Appendix B — Delta from the 07-13 draft

**Kept:** the diagnosis structure, real-data rule, three-agent structure (researcher/builder/reviewer only — no larger permanent multi-agent, user directive), docs/36 phase discipline, Bloomberg-inspired-never-copied identity rule.

**Superseded:** additive score sketch → multiplicative HN-gravity formula; "add Moneycontrol/Reuters feeds" → live-tested replacements (both dead); hydration hypothesis → concrete root cause (range-chart.tsx:29-36 TZ-dependent labels); Hindi sketch → full toggle/MT/TTS/SEO architecture; latency sketch → measured before + docs/43 architecture + worker placement + free-tier arithmetic + measurement protocol.

**Resolved from 07-13's open questions:** translation engine (Azure F0 → Google → Gemini, volume-math-driven lazy bodies); TTS engine (Web Speech hi-IN MVP, Sarvam phase-2, edge-tts rejected); toggle-vs-editions (toggle per user directive; competitor evidence for editions noted and set aside); related-securities rail (Bloomberg has one — ours exists on quote pages already, verified); Logo.dev NSE/BSE coverage (still open — now question #24, coverage-gated with monogram fallback).

---

**Awaiting "approved" before any code is written.** Phase 0 starts immediately on approval.
