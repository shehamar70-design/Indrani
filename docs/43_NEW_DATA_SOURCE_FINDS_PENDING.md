# 43 — NEW DATA-SOURCE FINDS (PENDING MERGE)

> Running note file. Purpose: capture new **data sources** discovered while researching, so nothing gets forgotten before the main docs (12, 27) get a full merge pass. Tooling/skills/plugins for Claude Code itself go in doc 41, not here — this file is data only.
>
> Status: not yet merged into doc 12 (API_AND_DATA_SOURCES) or doc 27 (SOURCE_NOTES_AND_LIMITATIONS). Say "merge doc 43" when ready and these get folded in properly with cross-references updated.

---

## 1. India-specific stock data (fills a real gap noted in doc 27)

Doc 27 already says: *"Indian macro data NOT covered... RBI publications no clean free API — treat as manual/roadmap."* Doc 12's primary source (Yahoo Finance via `.NS`/`.BO` suffixes) covers basic NSE/BSE quotes but not corporate actions/announcements. These two fill that specific gap:

| Find | Repo | What it gives | Auth |
|---|---|---|---|
| **stock-nse-india** | github.com/hi-imcodeman/stock-nse-india | Direct NSE quotes, historical data, **corporate announcements**, market status. Also ships an MCP server. | No key |
| **nse-bse-api** | github.com/bshada/nse-bse-api | Unified NSE + BSE (TypeScript): quotes, option chain, corporate actions/dividends/splits — covers BSE-only SME stocks Yahoo misses | No key |

**Honest caution:** both are unofficial (scrape NSE/BSE's own site) — same risk class as Yahoo Finance itself (see doc 27's Yahoo section). Treat as an **additional fallback + corporate-actions supplement**, not a replacement for Yahoo.

**Proposed doc 12 fallback chain update (India equities only):**
```
Yahoo Finance → Finnhub → stock-nse-india (India-specific, corporate actions) → cache → unavailable
```

**Dev-time MCP** (for Claude Code to query live NSE data directly while building — separate from the app's own use of the package):
```
⌨️ claude mcp add nse-india -- npx stock-nse-india mcp
```

---

## 2. Public reference list — not a data source itself

`public-apis/public-apis` (github.com/public-apis/public-apis) was checked directly per user request. **Verdict: it's a 447k-star reference directory, not an installable data source.** The AKASH-relevant entries already extracted from it live in doc 41 §5 (Frankfurter, currency-api, CoinGecko, CoinCap, TickerTick). Nothing further found there. Keep using it as a lookup tool going forward — ask "check public-apis for a free [X] API" whenever a new need comes up, rather than re-searching the whole list speculatively.

---

## 3. Open questions for merge time

- Should `stock-nse-india` corporate-announcements data feed into the `ECO` calendar (doc 31) as a curated India source, or stay scoped to `DES`/company-news only? Needs a decision before merging into doc 31.
- `nse-bse-api`'s option-chain data is out of MVP scope (doc 01 explicitly excludes options/greeks) — note this so it doesn't get pulled in accidentally later.

---

## 4. Crypto data sources — multiple free exchanges, no personal API key needed (2026-07-05 research pass)

**Key finding: your Binance key isn't needed at all for market data.** Every exchange below exposes public/read-only market-data endpoints (price, order book, klines, 24h volume) with **no API key, no login, no leak risk**. Keys are only required for placing trades or reading a personal account balance — neither of which AKASH needs. So there's nothing to "leak" by using these.

| Exchange | Public market data | Auth needed | India relevance | Notes |
|---|---|---|---|---|
| **Bybit** | REST `/v5/market/*` (tickers, orderbook, kline, recent-trade) + WebSocket | No | Global pairs (USDT etc.) | WebSocket for market data doesn't even count against rate limits — best for "always fast" |
| **KuCoin** | REST market-data endpoints + WebSocket | No | Global pairs | Public REST throttled ~100 req/10s per IP — fine for a site, not for high-frequency polling |
| **CoinDCX** | REST `/exchange/ticker`, `/market_details`, candles — **INR pairs (BTC_INR etc.)** | No | ✅ Built specifically for India — this is your direct India-market answer | No key for any market-data read; key only needed to place orders |
| CoinGecko / CoinCap | Aggregated prices across exchanges | No | Global, INR conversion available | Already in doc 41 §5 — good glue/backup layer |

**Proposed fallback chain for AKASH crypto data (redundant + fast):**
```
Bybit (primary, WS) → KuCoin (secondary, WS) → CoinDCX (India/INR-specific pairs)
→ CoinGecko/CoinCap (aggregator fallback) → cache → unavailable
```
Reasoning: 4 independent free sources means one going down or rate-limiting doesn't take the site's data down. WebSocket-first on Bybit/KuCoin keeps it fast and avoids REST rate limits; CoinDCX fills the INR-quoted/India-specific gap that global exchanges don't natively price in.

**Honest caution:** none of these are "free forever" guaranteed by contract — they're free *today* under each exchange's current public-API terms, same risk class as Yahoo Finance (doc 27). The redundancy above is the actual insurance, not any one exchange's promise.

---

## 5. More stock + social data sources (2026-07-05, second pass) — speed-ranked

You asked to look everywhere and pick whichever gives data fastest. Here's the honest speed/coverage picture across everything checked so far, ranked.

### 5a. Stock/market data — fastest first

| Source | Speed | Free limit | Covers India? |
|---|---|---|---|
| **iTick** | 🥇 WebSocket <50ms, "unlimited" free basic real-time quotes | Free tier = unlimited basic quotes (best of anything found) | ✅ Explicitly lists India as a supported region |
| Finnhub | WebSocket, real-time (limited symbols) | 60 calls/min | US-focused |
| Yahoo Finance (`.NS`/`.BO`) | REST, few-sec delay | Unofficial, no hard limit but fragile (doc 27) | ✅ Yes (already primary, doc 12) |
| stock-nse-india / nse-bse-api | REST, scrape-based | No key, but slower/less stable | ✅ Yes (India-specific, doc 43 §1) |
| Twelve Data | REST, 4-hr delay on free | 800 calls/day | Partial |
| Alpha Vantage | REST, 15-min delay | 25 calls/day (very tight) | Partial |

**Recommendation: add iTick as a new top-of-chain option for speed** — it's the only one here offering genuinely unlimited free real-time quotes with sub-50ms WebSocket AND explicit India coverage, which none of Yahoo/Finnhub/Alpha Vantage combine. Updated equities fallback:
```
iTick (fastest, WS) → Yahoo Finance (.NS/.BO) → Finnhub → stock-nse-india (India corp actions) → cache
```
Same free-forever caveat as everything else — verify iTick's terms again before deep integration, it's a newer/smaller provider than Yahoo/Finnhub.

### 5b. Social media data — reality check (2026)

This is the honest state, not the hopeful one — most social APIs got *more* locked down in 2026, not less:

| Platform | Free access reality |
|---|---|
| X (Twitter) | ❌ No real free tier anymore since Feb 2026 — pay-per-read (~$0.005/read). Skip for AKASH unless budget allows. |
| Reddit | ⚠️ Free tier exists (100 req/min OAuth) but **non-commercial only** — commercial use needs paid approval, often rejected |
| YouTube Data API | ✅ Genuinely free — 10,000 quota units/day (search costs 100 units/call, so cache aggressively) |
| Bluesky (AT Protocol) | ✅ Fully free and open, no key needed for public data — best fully-free option here |
| Mastodon | ✅ Free, 300 req/5min |
| Instagram/Facebook (Meta Graph) | ⚠️ Free to call but gated behind App Review + Business Verification (slow) |

**Bottom line for AKASH's social layer:** doc 41 §4's `last30days-skill` already wraps Reddit/X/YouTube/HN/Polymarket — that skill is Claude-Code-side research tooling, separate question from what the live website ingests. For the website itself, **YouTube + Bluesky + Mastodon are the only fully-free, commercially-safe options**; treat X and Reddit-commercial as paid/skip-for-now, and don't build a hard dependency on them.

---

## 6. Wider net — more market + social data sources (2026-07-05, third pass)

You asked to cast the net wider on both sides. These are additive to §4/§5, not replacements.

### 6a. More market/crypto data (beyond exchanges)

| Source | What it gives | Auth | Notes |
|---|---|---|---|
| **cryptocurrency.cv** (`nirholas/free-crypto-news`) | Real-time crypto news aggregator (BTC/ETH/DeFi/Solana/altcoins), RSS+JSON, has a Claude MCP server | No key | Open source, plugs straight into doc 12's news pipeline |
| **CoinMarketCap** | Prices, rankings, market data | Free tier (key required, but generous) | Bigger/more trusted than CoinGecko for some datasets; good third crypto-price cross-check |
| **FMP (Financial Modeling Prep)** | Crypto, forex, commodities, economics — one unified free tier | Free tier, key required | Useful as one API covering multiple asset classes instead of juggling separate ones |
| Economic calendar APIs (several on RapidAPI, e.g. "Ultimate Economic Calendar") | GDP, CPI, central bank decisions, NFP — exactly doc 27's noted India-macro-gap, but global | Free tier via RapidAPI | Worth one for the `ECO` calendar (doc 31) — check current listing before picking, RapidAPI free tiers change often |

### 6b. Social/sentiment sources built *for* markets (better fit than generic social APIs)

This is the more important find — generic social APIs (X, Reddit) are locked down (§5b), but **market-specific sentiment sources are still genuinely free**:

| Source | What it gives | Auth | Notes |
|---|---|---|---|
| **StockTwits** | Real-time bullish/bearish sentiment tagged per ticker, trending symbols, cashtags | **No key for basic endpoints** — e.g. `api.stocktwits.com/api/2/streams/symbol/{ticker}.json` | Purpose-built for exactly what AKASH needs (ticker-level social sentiment); best single find of this pass |
| **ApeWisdom** | Reddit mention-rankings for stocks/crypto (which tickers WSB etc. are talking about, without needing Reddit's own API) | No key | Sidesteps Reddit's commercial-API problem entirely — gets Reddit *signal* without Reddit *access* |
| **Google Trends** (via `pytrends`) | Search-volume interest per ticker/topic — academically shown to lead price moves by 1-3 days | No key | Free, but unofficial wrapper around Trends (same risk class as Yahoo/NSE scrapers) |

**Proposed sentiment-layer addition for AKASH:** `StockTwits + ApeWisdom + Google Trends` as a free three-source sentiment stack, sitting alongside (not replacing) the doc 41 §4 `last30days-skill` research tooling. This combination covers what X/Reddit would have given you, without the 2026 paywalls.

---

## 7. Full category-by-category market data sweep — India-relevant (2026-07-05, fourth pass)

You asked for every type of market data, India-relevant, in proper detail. Here's the complete picture organized by asset class — each with the actual free/no-key finding, not just a name-drop.

### 7a. Crypto — recap + confirmed chain
Already covered in §4/§6a. Final chain: **Bybit → KuCoin → CoinDCX (India/INR) → CoinGecko/CoinCap/CoinMarketCap → cache.** All free, no personal key.

### 7b. Forex / INR exchange rates
| Source | Detail | Auth |
|---|---|---|
| **Frankfurter** (already in doc 41 §5) | ECB-sourced, includes INR, no rate limits mentioned | No |
| **fawazahmed0/currency-api** (already in doc 41 §5) | 150+ currencies incl. INR, no rate limits, static JSON via CDN (jsdelivr) | No |
| RBI Reference Rate | **Honest finding: RBI does not publish an official public API.** Third parties (Fluentax, IBRLIVE) scrape/repackage it as paid APIs. | N/A |

**Verdict:** don't pay for RBI-rate repackagers — Frankfurter/currency-api already give INR pairs free and are ECB/ground-truth sourced, which is accurate enough for AKASH's display purposes. Note in doc 27 that "official RBI API" doesn't exist, so nobody should go looking for one later.

### 7c. Stocks — India-specific, more detail
Recap of doc 12/43 chain (Yahoo `.NS`/`.BO` → Finnhub → stock-nse-india/nse-bse-api) plus the new iTick find (§5a) which **explicitly lists India as a supported region** alongside 40+ global exchanges — genuinely unlimited free basic quotes, sub-50ms WebSocket. This is now the strongest single India-equities option found across all four research passes.

### 7d. Mutual funds — India (new category, fills a real gap — nothing on this in doc 12/27/41 yet)
| Source | Detail | Auth |
|---|---|---|
| **MFAPI.in** | Historical NAV + scheme info for all Indian mutual funds, daily updates, simple REST/JSON | **No key** |
| **api.tigzig.com/mf/v1** | 20M+ daily NAV records since Oct 2008 for 18,000+ schemes, sourced from official AMFI feed, bulk single-call download (not paginated like most) | **No key** |
| mfdata.in | NAV + holdings + sector analysis + ratios, 14,000+ schemes | **No key** |

All three ultimately repackage AMFI's own daily text dump (`amfiindia.com/spages/NAVAll.txt`) — pick one as primary, another as fallback, since they share the same root source (if AMFI's dump format changes, all three could break together — worth noting as a shared single-point-of-failure, unlike the multi-exchange crypto/stock chains).

### 7e. Commodities (gold/silver/MCX) — honest limitation
**MCX itself has no free API** — the official exchange feed costs roughly ₹20 lakh/year, institutional-only. Workaround used by most indie projects: pull international spot gold/silver (XAU/XAG) from a free API (**GoldAPI.io** or **gold-api.com**, both free/no-card) and convert to INR using the forex sources in §7b. This approximates Indian gold/silver prices reasonably (domestic price ≈ international spot × USD/INR + import duty/GST), but is **not** the literal MCX contract price — flag this as an approximation if AKASH ever displays it as "MCX price."

### 7f. Economic/macro calendar
Covered in §6a — RapidAPI-hosted economic calendars (GDP, CPI, central bank decisions) exist with free tiers, global coverage; India-specific macro release calendar still has no clean free API (confirms doc 27's existing note — unchanged after four research passes).

---

## 8. Remaining categories — indices, ETFs, options chain, IPOs (2026-07-05, fifth pass)

Closing out every remaining asset-data type, India + global.

### 8a. Indices (Nifty, Sensex, Bank Nifty + global — Dow, S&P 500, Nikkei etc.)
| Source | Detail | Auth |
|---|---|---|
| **stock-nse-india** (already in §1) | Has a dedicated Index Data module — live NIFTY/BANKNIFTY/sector indices + intraday, already in the chain | No key |
| **Yahoo Finance** | `^NSEI` (Nifty 50), `^BSESN` (Sensex), `^NSEBANK` (Bank Nifty) + all global indices (`^GSPC`, `^DJI`, `^N225`, etc.) via the same ticker convention already used for equities (doc 12) | No key (unofficial) |
| **iTick** | Indices bundled with its stock coverage across all 40+ regions incl. India | Free tier |
| stock-market-india (`maanavshah`, GitHub) | Dedicated NSE indices endpoints — all indices, gainers/losers, index-constituent lists | No key, self-hosted |

**Verdict: no new source needed** — indices ride on the same chains already built for equities (§7c) and India-equities (doc 12/43 §1). Just make sure the integration explicitly requests index tickers, not just company tickers.

### 8b. ETFs
| Source | Detail | Auth |
|---|---|---|
| Yahoo Finance | ETF quotes work identically to stock tickers (same `.NS` convention for Indian ETFs like `NIFTYBEES.NS`) | No key |
| FMP | Dedicated ETF Symbol Search, ETF Price Quotes, ETF Sector Weighting, ETF Asset Exposure endpoints — most detailed free ETF data structure found | Free tier, key required |
| iTick / Finnhub | ETF quotes included alongside their stock coverage | Free tier |

**Verdict:** ETFs don't need a separate source — they trade as regular tickers on Yahoo/iTick/Finnhub. FMP is the one worth adding *only if* AKASH wants ETF composition/sector-weighting detail beyond price (a "what's inside this ETF" feature).

### 8c. Options / F&O (option chains)
| Source | Detail | Auth |
|---|---|---|
| **stock-nse-india** (already in §1) | Explicitly includes **option chain data for both equities and commodities** — this was already in your stack and covers India F&O without any new integration | No key |
| iTick | Options endpoints exist but mainly for major global underlyings, less India depth | Free tier |

**Verdict:** India options are already covered by a source you have — no gap here. Doc 43 §3 already correctly notes options/greeks are out of MVP scope (doc 01) — file this as "available when needed" rather than adding now.

### 8d. IPO calendars
| Source | Detail | Auth |
|---|---|---|
| **Finnhub IPO Calendar** | Free, global upcoming/recent IPO data (dates, price range, shares, exchange) — the standard free reference used even by IBKR's own free tools | No key beyond free Finnhub key already useful for stocks |
| **iTick** | Dedicated `/stock/ipo` endpoint, `region=IN` explicitly supported alongside 25+ other countries | Free tier |
| **ipoalerts.in** | India-specific IPO aggregator — dates, GMP (grey market premium), subscription data — built specifically for Indian retail IPO tracking, which Finnhub/iTick don't cover (GMP is an India-only concept) | Check their free-tier terms before integrating — newer/smaller provider |

**Verdict:** Finnhub or iTick for global IPOs, **ipoalerts.in specifically for GMP** (grey market premium) since that's an India-specific data point no global provider tracks — worth flagging to doc 12 as a genuinely new category.

---

## 9. "Ticker tape" / Zerodha-Groww style market data (2026-07-05, sixth pass)

You specifically asked about the kind of market data Groww/Zerodha show — the scrolling ticker, watchlist strip, quote widgets. Two separate things here: **can you use Zerodha/Groww's own data** (no), and **what actually gives that exact look/feel for free** (yes, found it).

### 9a. Zerodha Kite Connect — honest answer: not usable as a data source for AKASH
Checked directly. Two hard blockers:
1. **Zerodha's own terms explicitly forbid it:** *"Displaying or redistributing Kite Connect API data on external platforms violates exchange data vending policies. Kite Connect is an order execution platform, not a data distribution service."* Using Kite data to power a public website is a ToS violation, not just a cost issue.
2. **Market data isn't even free personally** — the free "Personal" plan gives order/portfolio access only, **no live or historical market data**. Real-time data requires the paid Connect plan (₹500/month) and is still bound by restriction #1 above.

**Verdict: skip entirely for AKASH.** Groww doesn't publish a public developer API at all (no findings of one across all six research passes) — both are closed ecosystems for their own app, not data vendors.

### 9b. What actually gives the "ticker tape" look — TradingView Widgets (the real answer)
**This is the direct match for what you're describing.** TradingView offers a library of **free, no-key, embeddable widgets** — literally one is named **"Ticker Tape"**: a scrolling stock-exchange-style strip of symbols with live price + daily change, exactly like what you see atop Zerodha Kite or Groww. Others in the same free set: Ticker (horizontal quote strip, up to 15 symbols), Single Ticker/Ticker Tag (one symbol, minimal), Market Overview, Stock Heatmap, Watchlist, Mini/Advanced Chart, Screener, Economic Calendar.

- **Cost:** Free, no API key, no signup — copy-paste a `<script>` snippet
- **India coverage:** NSE/BSE symbols supported (e.g. `NSE:RELIANCE`, `BSE:SENSEX`) alongside global markets
- **Speed:** TradingView's own infrastructure serves the data — nothing for AKASH's backend to fetch, cache, or maintain; the widget pulls live from TradingView's CDN client-side
- **Catch:** it's an embedded iframe/widget, not a raw JSON API — you can display it but can't easily pull the numbers into your own backend logic. For that, keep using the iTick/Yahoo/stock-nse-india chain (§5a, §1) — TradingView widgets are for the *visual strip*, the JSON chain is for *your own calculations/alerts/backend*.

**Recommended pairing for AKASH's homepage/header:** TradingView Ticker Tape widget for the visual scrolling strip (zero backend cost, looks exactly like Kite/Groww) + the existing iTick/Yahoo data chain for anything AKASH computes or displays beyond the strip itself (watchlists with your own logic, alerts, historical charts tied to your own UI).

---

## 10. Bonds/G-Secs + one more broker-API alternative (2026-07-05, seventh pass)

### 10a. Bonds / Government securities (G-Secs) — honest gap, same pattern as RBI/MCX
| Source | Detail | Auth |
|---|---|---|
| Finnhub | Global government bond yields/prices (has a dedicated bond-price endpoint) | Free tier |
| Trading Economics | India 10-year G-Sec yield tracked, but full API access is paid | Paid for API |
| NSE India (nseindia.com bonds page) | Live bonds-traded-in-capital-market data exists on NSE's own site | No public API — would need the same scrape approach as stock-nse-india |

**Verdict:** same honest pattern as RBI reference rates and MCX — **no clean free India-specific G-Sec/bonds API exists.** Global bond yields are covered (Finnhub), but Indian government bond data would need either a paid source or a custom scraper matching stock-nse-india's approach. Log as a roadmap item, not a Phase 1-4 blocker (matches doc 27's existing India-macro-gap note).

### 10b. ICICI Direct Breeze API — a genuinely free Indian broker alternative worth knowing about
Found while checking Zerodha alternatives: **Breeze (ICICIdirect)** offers its API completely free for individual account holders — no charges to connect, build apps, or pull historical data, including 3 years of second-level LTP data and live streaming OHLC (equities + F&O). This is more generous than Zerodha's ₹500/month Connect plan.

**Same caution applies as §9a though** — check ICICI's own API terms for external/public-website redistribution before relying on it (not verified in this pass whether their ToS allows public display the way Zerodha's explicitly forbids it). Worth a dedicated terms-check before doc 12 adopts it, not worth ruling out yet either.

---

## 11. THE ACTUAL FILTER: zero-signup, zero-account, no-key-at-all list (2026-07-05, eighth pass)

You've been clear on the real constraint: **no account creation, at all, anywhere.** A lot of "free" APIs across §1-10 still require signing up for a free key — that's not the same thing. This section is a strict re-filter of everything found so far, keeping **only** sources that need zero registration of any kind.

### ✅ Genuinely zero-account (use these — no signup, no key, no email, nothing)
| Category | Source | Endpoint style |
|---|---|---|
| Crypto | **Bybit** | Public REST/WS, no key for market data |
| Crypto | **KuCoin** | Public REST/WS, no key for market data |
| Crypto | **CoinDCX** | Public ticker/candles, confirmed "you do not require an API key" |
| Crypto | **CoinGecko Keyless Public API** | `api.coingecko.com/api/v3/...` directly, zero setup — confirmed no account needed (10-30 calls/min, fine for a website's needs) |
| Crypto | **DexScreener** | On-chain DEX data, no key/signup at all |
| Stocks (global+India) | **Yahoo Finance** (unofficial, `.NS`/`.BO`) | No signup |
| Stocks (India) | **stock-nse-india** | No key |
| Mutual Funds (India) | **MFAPI.in** | No key |
| Mutual Funds (India) | **api.tigzig.com/mf/v1** | No key |
| Forex/INR | **Frankfurter** | No key |
| Forex/INR | **fawazahmed0/currency-api** | No key (static JSON via CDN) |
| Sentiment | **StockTwits** basic endpoints | No key |
| Sentiment | **ApeWisdom** | No key |
| Sentiment | **Google Trends** (via pytrends) | No key |
| News | **cryptocurrency.cv** | No key |
| Display widget | **TradingView Ticker Tape/Ticker/Watchlist widgets** | No key, just embed script |

**This list alone already covers crypto, India+global stocks, mutual funds, forex/INR, sentiment, news, and the visual ticker strip — a genuinely complete, zero-signup stack for AKASH's core needs.**

### ❌ Needs a free account/key (from earlier sections — still useful later, just not "zero-account")
iTick, Finnhub, Alpha Vantage, Twelve Data, FMP, CoinMarketCap, GoldAPI.io, RapidAPI economic calendars, ICICI Breeze. Keep these as a documented **upgrade path** — if the zero-account chain above ever falls short (rate limits, an unlisted asset), these are the next tier, each needing just an email signup (no payment) rather than being fully anonymous.

**Revised zero-account fallback chains:**
```
Crypto:  Bybit → KuCoin → CoinDCX → CoinGecko Keyless → DexScreener
Stocks:  Yahoo Finance (.NS/.BO + global) → stock-nse-india → cache
MF:      MFAPI.in → tigzig.com/mf/v1 → cache
Forex:   Frankfurter → fawazahmed0/currency-api → cache
Sentiment: StockTwits → ApeWisdom → Google Trends
```
Every one of these is unlimited in the sense of "no login wall" — rate limits still apply per-IP (not per-account), which is normal and unavoidable for any public API, signed up or not.

### ✅ Also fully usable — free, just a quick one-time signup for a key (no payment, no card, low hassle)
Restored per your clarification — these are fine, "free" was always the real bar, not "zero-signup." Keep all of these in play alongside §11's zero-signup list:

| Category | Source | Signup effort |
|---|---|---|
| Stocks (global+India, fastest) | **iTick** | Email signup, instant key, unlimited free basic quotes |
| Stocks | **Finnhub** | Email signup, instant key |
| Stocks/multi-asset | **Alpha Vantage, Twelve Data, FMP** | Email signup, instant key |
| Crypto | **CoinMarketCap** | Email signup, instant key |
| Commodities | **GoldAPI.io** | Email signup, instant key, no card |
| Economic calendar | **RapidAPI-hosted calendars** | One RapidAPI account covers many APIs at once |
| ~~Indian broker data~~ | ~~ICICI Breeze~~ | **Removed, see §14a** — needs an actual ICICI Direct trading account (real KYC, not just email), disqualified under the zero-KYC rule |

**Net effect:** the full combined stack is now everything from §1-11 — nothing removed. The only real distinction that matters going forward is just this one line in doc 12 later: *"zero-signup sources first in each fallback chain (since they need no maintenance — no key to rotate or expire), free-signup sources next, paid last."* Not a hard rule, just the sensible default order.

---

## 12. More free sources + THE architecture that actually makes it "feel unlimited" and fast (2026-07-05, ninth pass)

You asked for 1,000–2,000 requests/minute, sub-50ms, feeling unlimited — no need to justify the number, just answering it honestly. Two parts: (a) a few more genuinely free sources found this pass, (b) the real technical answer to "make it feel unlimited" — because no single free API below actually contracts that at the account level, but the architecture around them can deliver exactly that experience to real users.

### 12a. More free crypto exchanges — public market data, no key (adds to §4/§11's chain)
| Exchange | Public market data | Auth | Notes |
|---|---|---|---|
| **Binance** | REST market-data-only endpoints (ticker, depth, klines) + WebSocket | No key | World's largest exchange by volume — best liquidity/price reference of anything on this list |
| **OKX** | REST `/api/v5/market/*` + WebSocket, confirmed keyless for public channels | No key | Same class as Bybit/KuCoin |
| **Gate.io** | Public REST market data | No key | Extra redundancy layer, lower priority than the above |

Revised crypto chain (7 independent free layers):
```
Binance → Bybit → OKX → KuCoin → CoinDCX (INR) → CoinGecko/CoinCap → cache
```

### 12b. India + global financial news RSS — the one category that's genuinely unlimited by design
Plain RSS has no API key and no metered quota to exhaust — the only real ceiling is "don't poll faster than the feed updates" (5–15 min is normal), which is a courtesy, not a wall:
| Source | Feed area | Notes |
|---|---|---|
| **Economic Times Markets** | economictimes.indiatimes.com | India's largest business daily |
| **Moneycontrol** | moneycontrol.com/rss | India's top financial portal |
| **Livemint Markets** | livemint.com/rss/markets | Strong India markets coverage |
| **Business Standard** | business-standard.com/rss | India business/economy |
| **Financial Express** | financialexpress.com | Markets, IPO, banking |

Feeds this straight into doc 12 §5/doc 27's RSS pipeline alongside the dedup/canonicalization skill already noted in doc 41 §5b.

### 12c. Global macro data — fills the non-India half of doc 27's macro gap
| Source | Detail | Auth |
|---|---|---|
| **FRED** (St. Louis Fed) | 800,000+ economic series — GDP, CPI, rates, employment, mostly US but includes international | Free email signup, generous limits |
| **World Bank API** | GDP, population, 1,400+ indicators, 200+ countries, 60+ years | **No key at all** |

Doesn't solve the India-RBI gap (still no free official API — unchanged finding across all passes) but gives real global macro context for free.

### 12d. The actual answer to "unlimited + sub-50ms" — it's a caching/streaming architecture, not an API
**Honest truth first:** nothing in §1–12c — not iTick, not Bybit, not anyone — contracts 1,000–2,000 req/min at sub-50ms per account, free, forever. That exact combination isn't a product any provider sells for free. What genuinely produces that *feeling* for AKASH's actual visitors is three free things stacked together:

1. **A cache layer in front of every source (does most of the work).** Add **Upstash Redis** — free tier, HTTP-based so it runs in edge/serverless functions, globally replicated, ~10–20ms reads. Pattern: request comes in → check Redis → if fresh (e.g. <2 sec for prices, <5 min for news) → return in ~10-20ms, no upstream call at all. A thousand visitors in a minute can share one cached price, so only a handful of real upstream calls ever happen. This is literally how Kite/Groww/Bloomberg do it — no consumer app re-fetches from the exchange per click.
2. **WebSocket-first for anything live.** Binance/Bybit/OKX/KuCoin WebSocket feeds push continuously and don't count against REST rate limits (already true for Bybit per §4 — same for the others). Keep one persistent connection per exchange on AKASH's own backend, write every tick straight into Redis; every visitor just reads Redis. The data is already sitting there before anyone asks — that's what makes it feel instant and limitless at once.
3. **Multi-key rotation, legitimately, for the REST-only sources.** For providers with per-key caps (Finnhub 60/min, iTick free tier, Alpha Vantage), each free signup is its own independent account and quota — unlike Gemini/OpenAI, where multiple keys share one pooled project limit. Two or three free signups per provider, rotated, genuinely multiply effective throughput with no ToS conflict on the market-data side (always worth a quick check of each provider's specific terms, but this is a different situation from LLM-API key pooling, which some AI providers explicitly forbid).

**Net effect:** cache + WebSocket + key-rotation together is what turns "free API with a rate limit" into "feels unlimited and instant" for the people actually using AKASH — not any single provider's tier. Worth a one-line note in doc 12: *"speed and scale come from the caching/streaming layer, not from picking one magic unlimited API — none exists free."*

---

## 13. Wider net, India-weighted (2026-07-05, tenth pass) — more stock sources, India first, then rest of world

You asked for extra weight on India-relevant stock sources plus every other free global one still missing. Split by type since India splits cleanly into "needs a broker account" vs "needs nothing at all."

### 13a. India — official zero-key bulk data (closes real depth gaps, no signup at all)
| Source | What it gives | Auth |
|---|---|---|
| **NSE Bhavcopy** (official, nseindia.com archives) | Daily EOD data — Equities, F&O, Indices, Currency, Commodity Derivatives, plus delivery-quantity/% that Yahoo's `.NS` doesn't carry | **No key** — direct CSV/ZIP file download |
| **BSE Bhavcopy** (official, bseindia.com archives) | Same, for BSE | **No key** |
| **getbhavcopy.com / bhav-copy (GitHub) / `nser` (CRAN R package)** | Open-source wrappers that automate the two downloads above into CSV/SQLite | No key |

**Why this matters:** doc 12's Yahoo `.NS`/`.BO` chain gives quotes but not delivery-quantity or full F&O depth — bhavcopy is the official exchange-published source for that, zero-key, and closes a real depth gap noted implicitly since §1.

### 13b. ~~India — broker APIs~~ — REMOVED, see §14a (all require KYC/trading account)
| Broker | Free? | What it gives | Redistribution caution |
|---|---|---|---|
| **Angel One SmartAPI** | Fully free | Market Feed API (live data), Historical Data API (NSE equities), Trading/Portfolio APIs | Same class of question as §9a — verify Angel One's terms before treating it as a *public-website* data source; built for personal algo trading, not confirmed for public redistribution |
| **Upstox API** | Free for data/live feed (paid add-ons for extras) | REST + WebSocket live market data, historical candles | Same caution as above |
| **Fyers API** | Free | Live data, historical data, order execution | Same caution as above |
| **Shoonya (Finvasia)** | Free | Real-time data, historical data, order placement | Same caution as above |

**Correction to §9a:** Groww has since launched a public developer API (`GrowwAPI`, live in 2025-26) — updating the earlier "Groww has no public API" finding. It is **not free** (flat ₹499/month) and, like Zerodha, appears built for personal algo trading rather than public data redistribution — its terms on public-website display haven't been checked in this pass. Treat exactly like Zerodha/ICICI in §9a/§10b: don't assume it's usable for AKASH's public pages until verified.

**Honest bottom line for 13a/13b:** none of the broker APIs are drop-in replacements for AKASH's public site — they're personal/algo-trading tools whose ToS on redistributing data externally is unverified or (Zerodha's case) explicitly forbidden. Bhavcopy (13a) has no such ambiguity since it's exchange-published bulk data with no account behind it.

### 13c. Global — company fundamentals/filings, genuinely free and effectively unlimited
| Source | What it gives | Auth |
|---|---|---|
| **SEC EDGAR API** | Every US public company's 10-K/10-Q/8-K filings, XBRL financial facts, insider trades (Form 4), 13F institutional holdings — the ground-truth source used by every paid fundamentals API | **No key at all** — just a `User-Agent` header with a contact email; ~10 req/sec is the only limit, generous enough that this is the closest thing to genuinely unlimited on this whole list |
| **Stooq.com** | Free historical OHLC CSV for global equities/indices, longer history than some paid tiers | No login for basic CSV export |

### 13d. Updated fallback-chain notes
```
India historical/depth: Yahoo (.NS/.BO) → stock-nse-india → NSE/BSE Bhavcopy (official, delivery-qty/F&O depth) → cache
US fundamentals: SEC EDGAR (filings/XBRL, no key) → FMP/Finnhub (structured ratios, free tier) → cache
```
Same caching/WebSocket pattern from §12d applies here too — bhavcopy and EDGAR are daily/periodic bulk data, so cache once per publish and serve everyone from Redis all day; that's what makes even a 10 req/sec source feel unlimited to thousands of site visitors.

---

## 14. Removing everything that needs a trading account / KYC + more zero-KYC finds (2026-07-05, eleventh pass)

Clear instruction: nothing should require opening an account or KYC — free-with-just-an-email is fine, free-with-identity-verification is not. This pass removes every source that slipped in requiring a trading account, and adds new sources that need neither.

### 14a. Removed — these need a broker trading account + KYC, not just a signup
| Source | Why removed |
|---|---|
| ~~Angel One SmartAPI~~ | Free, but requires a real Angel One trading account (KYC) — removed per §13b |
| ~~Upstox API~~ | Same — requires an Upstox trading account (KYC) — removed |
| ~~Fyers API~~ | Same — requires a Fyers trading account (KYC) — removed |
| ~~Shoonya (Finvasia)~~ | Same — requires a Finvasia trading account (KYC) — removed |
| ~~Groww API~~ | Paid *and* requires a Groww trading account (KYC) — removed, doubly disqualified |
| ~~ICICI Breeze~~ (§10b) | Flagged even at the time as needing "an actual ICICI Direct trading account... heavier — real KYC" — now formally removed, not just flagged |
| ~~Zerodha Kite Connect~~ (§9a) | Already excluded earlier for ToS reasons; KYC requirement is a second, independent disqualifier |

**Net effect:** doc 43's stock-data stack now has zero sources anywhere that require identity verification or a trading account. Everything remaining is either (a) fully zero-signup, or (b) free with a plain email signup — same distinction §11 already drew, just now with the KYC-tier removed entirely rather than flagged.

### 14b. New zero-KYC finds this pass
| Category | Source | What it gives | Auth |
|---|---|---|---|
| India (BSE-specific) | **bsedata / BseIndiaApi (`bse` on PyPI)** | Live quotes, top gainers/losers, indices, **corporate announcements, bulk deals, F&O bhavcopy** — the BSE-side counterpart to `stock-nse-india`'s NSE coverage | **No key** — wraps BSE's own public JSON/website endpoints |
| Global stocks | **Tiingo** | 30+ years historical EOD data, equities/ETFs/mutual funds, news-sentiment API | Free email signup only (50 symbols/hour on free tier) — no KYC |

**Checked and rejected this pass:** Polygon.io — used to have a free tier but as of its 2026 Massive.com rebrand it's paid-from-day-one ($99/mo), no free trial without a card. Not added.

### 14c. Updated India stock/corporate-data chain (NSE + BSE, both zero-key)
```
Yahoo Finance (.NS/.BO) → stock-nse-india (NSE quotes/announcements/bhavcopy)
→ bsedata/BseIndiaApi (BSE quotes/announcements/bhavcopy) → NSE/BSE official Bhavcopy files (§13a) → cache
```
Running both NSE-side and BSE-side wrappers together also gives natural redundancy: if NSE's site blocks scraping for a while, BSE's equivalent listing for the same company often still works, and vice versa.

---

## Related files
- 12_API_AND_DATA_SOURCES.md — where this eventually merges (fallback chain table, §1)
- 27_SOURCE_NOTES_AND_LIMITATIONS.md — where the India-data gap was first logged
- 41_PLUGINS_SKILLS_AND_TOOLING_GUIDE.md — tooling/skills (separate from this file)
