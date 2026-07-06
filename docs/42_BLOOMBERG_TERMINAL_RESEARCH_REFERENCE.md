# 42_BLOOMBERG_TERMINAL_RESEARCH_REFERENCE.md

**Purpose:** Everything publicly researchable about Bloomberg Terminal — features, function language, design system, and network effects — gathered via web search on 2026-07-05, to inform AKASH's doc 11 (competitor comparison), doc 15 (design system), and doc 08/09/33 (terminal features). Sources: Bloomberg's own professional pages, Wikipedia, and university library guides (NYU, Columbia, Dartmouth, Imperial, CMU) that train students on the real Terminal — not secondhand summaries.

**What this is NOT:** access to the live Terminal software itself. See Section 8 for why that's not possible for anyone without a paid seat, and why that's fine.

---

## 1. What It Actually Is

Bloomberg Terminal is a subscription software system that gives finance professionals real-time market data, news, analytics, and a built-in trading/messaging network, all in one interface. Michael Bloomberg built it in 1981 after leaving Salomon Brothers, initially to give bond traders better pricing data than phone calls could provide. Today it has roughly 325,000–350,000 subscribers worldwide and Bloomberg L.P. earns most of its revenue from it.

**Cost (2026):** around $24,000–$32,000/year per seat depending on the source and number of licenses, two-year minimum contract, no free trial (university libraries are the main way to try it without paying). This single fact is why AKASH's audience is different by definition — you're building for people who will never have a $2,000/month budget for this.

## 2. Core Feature Categories (What AKASH's Terminal Docs Should Cover)

Every source agrees the Terminal breaks down into these functional areas — useful as a checklist against your own docs 06-09:

| Category | What it does | Maps to your doc |
|---|---|---|
| **Security analysis** | Company description, financials, filings, historical prices, all tied to a "load a ticker, then run a function" pattern | doc 06/07 |
| **Charting** | Price charts with overlays, indicators, comparisons, annotations | doc 08 |
| **Screening** | Build custom stock lists from financial criteria (their EQS) | doc 08 |
| **Portfolio analytics** | Track a portfolio, run risk/scenario/attribution analysis on it | doc 09 |
| **Alerts** | Price-movement and news alerts, forwarded to email | doc 09 |
| **News** | Bloomberg's own reporters feed stories directly into the terminal, integrated into charts | doc 02/03/30 |
| **Fixed income / FX / commodities** | Yield curves, bond pricing, currency forecasting | doc 31/32 |
| **Messaging (Instant Bloomberg / "IB")** | Verified private chat network between subscribers — see Section 5 |
| **Excel/API integration** | Pull Terminal data into Excel or code (BQL query language, Desktop API) | doc 12 |

## 3. The Function-Code Language (Their Actual "UX")

Bloomberg's whole interaction model is: type a ticker, press a yellow market-sector key (Equity/Govt/Corp/etc.), then type a short function code, then press the green `<GO>` key. No menus required once you know the codes. A few of the most-cited ones across every source:

| Code | What it pulls up |
|---|---|
| `DES` | Company description — overview, sector, market cap, key ratios (the standard starting point) |
| `GP` | Price chart with overlays and annotations |
| `FA` | Financial analysis / statements |
| `RV` | Relative valuation vs. peers |
| `ANR` | Analyst recommendations and price targets |
| `EQS` | Equity screener — build a custom stock list from criteria |
| `PORT` | Portfolio creation and analytics |
| `TOP` | Day's top world news in one place |
| `WEI` | World Equity Indices — global market overview, no ticker needed |
| `BI` | Bloomberg Intelligence — analyst research |
| `WIRP` | Fed rate-hike probability (checked before every FOMC meeting) |
| `ALRT` | Set a price/news alert |
| `HP` | Historical price table |

One tip repeated across sources: `DES → FA → RV` in sequence covers most of what a research session needs — description, financials, peer comparison. Worth considering as a guided "quick research" flow in AKASH's own terminal (doc 06/07).

## 4. News — Direct Parallel to Your doc 02/03/30

Bloomberg's news layer has named sub-products worth studying:
- **First Word** — breaking news condensed into instant bullet-point digests
- **Daybreak** — one curated a.m. briefing of overnight developments
- **Morning Report** — auto-generated daily report customized to a user's own security list
- **News Trends** — tracks which companies/topics are getting the most media attention **and social-media sentiment/velocity**, to flag potential market impact

That last one is the important one for your "should we track social media" question — Bloomberg itself already does this, at the professional level, and separately integrates live Twitter/X search and alerting directly into the terminal for the same reason. Your last30days-skill idea (Section 9 of doc 41) is the same concept, just broader — it adds Reddit, YouTube, TikTok, and Instagram on top of X, where Bloomberg's own built-in version only covers X natively.

## 5. Instant Bloomberg (IB) — The Network Effect, Not Just a Feature

This is worth understanding even though AKASH won't replicate it at launch: IB is Bloomberg's built-in verified messaging system. It's reportedly the reason many subscribers can't leave even when they want to — if your trading counterparties are all on Bloomberg, you need to be too, regardless of the data quality elsewhere. It's a genuine case study in how a "boring" feature (chat) can be a product's real moat. Not actionable for AKASH now, but worth remembering if you ever add any user-to-user feature: the value can come from who else is on it, not the feature itself.

## 6. Design System — Directly Actionable for Your doc 15

This is the most useful section for you right now, and it's backed by Bloomberg's own design team writing about their own choices, not guesswork:

- **Amber text on black background** is the signature look. It started in the 1980s simply because color monitors were rare and orange/green-on-black was standard for terminals of that era — it survived as a deliberate brand choice, not a technical constraint anymore.
- **Colored keyboard keys** (especially the yellow market-sector keys) are treated as part of the brand identity, not just ergonomics.
- **Important, verified detail for your dashboards:** Bloomberg deliberately does **not** use plain red/green for down/up market status. Their own accessibility research found colorblind users still associate red/orange with "down" and blue/green with "up," so their newer color-vision-deficiency-friendly scheme uses **blue for up, red for down** rather than green/red — while keeping amber as the neutral/informational color throughout. This is a genuinely good, tested pattern AKASH could adopt directly in doc 15, especially since you're building for a broad public audience, not trained professionals.
- Their own stated design philosophy: surface only what the user needs to know, when they need to know it — not "add more data," but "add the right data." Worth quoting as a north star for doc 15, in your own words in the doc itself.

## 7. What Bloomberg Gets Criticized For — Your Opportunities

Every independent review converges on the same three complaints, and each one is a natural opening for AKASH:

1. **Dated, command-line-only interface** — fast for trained power users, intimidating for anyone else. AKASH's chance: a modern UI that doesn't require memorizing function codes.
2. **Walled garden** — data is hard to get out into your own tools/models; strict control over export. AKASH's chance: openness is a feature you can actually offer.
3. **Feature bloat** — 30,000+ functions, most unused, hard to discover what's relevant. AKASH's chance: a focused, curated feature set beats an overwhelming one for your actual audience.

## 8. Why "Just Browse the Live Terminal" Isn't Possible (Confirmed)

Bloomberg Terminal requires a dedicated login tied to a paid subscription (~$24-32k/year), runs through Bloomberg's own network/router hardware, and has no public URL — one source states explicitly there is no remote access without a subscription. University library terminals are the only no-cost way to see it live, and even those require an in-person booking. This isn't a research gap on our end — it's genuinely not publicly accessible to anyone without an institutional seat, which is exactly why every competitor and clone project (including this one) is built from public reviews, screenshots, and demo videos rather than the live product.

## 9. Comparison Set (Feeds Directly Into doc 11)

Named alternatives that appear across every source, with approximate 2026 pricing where stated: Refinitiv/LSEG Eikon Workspace (~$1,800–22,000/year depending on tier), FactSet (~$12,000/year), S&P Capital IQ (~$15,000/year). All are still institutional-priced. Free/prosumer tools mentioned as covering "80-90% of individual use cases" at a fraction of the cost: Koyfin, TradingView, and data APIs like Alpha Vantage/Polygon.io — this is effectively the tier AKASH is entering, per your own doc 01 vision.

---

## 10. Your Ongoing Research Tool: last30days-skill

Already set up per doc 41 Section 9 — this is your practical way to keep researching sentiment across platforms yourself, going forward, without needing me to run a fresh search every time. Confirmed useful, specific prompts for AKASH:

```
/last30days Bloomberg Terminal complaints and feature requests
/last30days sentiment on [ticker] this month across Reddit and X
/last30days what retail traders wish Bloomberg-style platforms did differently
```

Free tier (Reddit/HN/Polymarket) is enough to start; only add the paid X/Instagram keys if you find yourself wanting that specific data regularly. This runs inside Claude Code, separately from this chat.
