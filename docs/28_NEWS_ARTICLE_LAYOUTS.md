# 28 — News Article Layouts

> Detailed layout specs for every article type. Extends docs/03. Bloomberg-style patterns adapted for Akash.

---

## Layout types (5)

### A. Standard article (`/news/[slug]`)
```
[Section kicker — red, uppercase, 12px, links to vertical]
[Headline — serif-feel display, 32–44px, text-balance, max 12 words shown]
[Dek/subheadline — 18–20px, muted, 1–2 lines]
[Byline row: author avatar? no — name + "Updated HH:MM IST" + read time]
[Share row: copy link, X, WhatsApp (India audience), email]
[Hero image 16:9 with caption + credit — REQUIRED credit line]
[Body: 680px max-width column, 18px/1.6, drop cap optional]
  - Inline components allowed: pull quote, inline chart (live ticker chart
    embed), key-points box ("What you need to know" — 3 bullets at top),
    inline ticker chip (hover → mini quote card)
[Related articles — 3-up grid]
[Next article in section — full-width teaser]
```

### B. Live blog (`/news/live/[slug]`)
- Red "LIVE" pulsing badge in header
- Reverse-chronological update cards, each with timestamp anchor link
- New updates appear via polling (30s) with a "3 new updates" pill → click to reveal (no jarring auto-insert)
- Pinned "What's happening" summary box at top, editor-maintained
- Key moments sidebar (desktop) — anchors to important updates

### C. Markets wrap (daily) (`/news/markets-wrap/[date]`)
- Auto-assembled scaffold + editorial text: header shows the day's index performance chips (live data)
- Sections: Stocks / Bonds-Rates / FX / Commodities / Crypto — each with a small embedded sparkline of that day
- "Movers" table: top 5 gainers/losers with live links to quote pages

### D. Explainer / Big Take style (`/news/features/[slug]`)
- Full-bleed hero (image or dark chart motif), title overlaid
- Wider body (760px), section dividers, larger pull quotes
- Sticky progress bar at top
- "Listen to this article" placeholder slot (Phase 5, docs/35 audio rules)

### E. Opinion (`/news/opinion/[slug]`)
- Distinct visual: author-forward header (larger author name, "Columnist" label), italic dek
- Top-of-body disclosure: "The views expressed are the author's own."

## Shared components (build once)

| Component | Used by | Notes |
|---|---|---|
| `ArticleHeader` | all | variant prop per type |
| `TickerChip` | body inline | `<TickerChip symbol="AAPL">` → live price, green/red, links to quote page |
| `InlineChart` | A, C, D | 1D/1M/1Y toggle, real data via /api/chart |
| `KeyPoints` | A, D | 3-bullet summary box |
| `PullQuote` | A, D, E | oversized quote with rule lines |
| `RelatedRail` | all | same-section, exclude current |
| `ShareRow` | all | Web Share API on mobile, buttons on desktop |

## Content source reality (important)

We do not employ journalists. Article pages render:
1. **Aggregated headlines** (RSS) → link OUT to original source with attribution — these use a compact "external article" card, NOT layout A
2. **Own content** (markets wraps auto-scaffolded from real data + your own written pieces) → full layouts A–E
Store own articles in the DB (`articles` table, docs/13 schema section) with MDX-like block content.

## SEO per article

- `generateMetadata`: title (≤60 chars), description (dek), OpenGraph image (hero), `article:published_time`
- JSON-LD `NewsArticle` schema
- Canonical URL; for aggregated items canonical points to the ORIGINAL source (never claim others' content)
