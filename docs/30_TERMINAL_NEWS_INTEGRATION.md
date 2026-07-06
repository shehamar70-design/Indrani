# 30 — Terminal ↔ News Integration

> How news flows inside the terminal (Bloomberg's N, TOP, CN functions). Phase 4.

---

## Terminal news functions

| Command | Panel | Behavior |
|---|---|---|
| `TOP` | Top News | Ranked latest headlines across all feeds; auto-refresh 60s; each row: time, source tag, headline; Enter opens reader panel |
| `N` | News browser | Filterable news: by category (markets/economy/tech/crypto/india), by source; keyboard j/k navigation |
| `<TICKER> CN` | Company news | Headlines filtered to the ticker: match by symbol + company name aliases (maintain alias map, e.g. "RELIANCE" → "Reliance Industries") |
| `NH` | News on watchlist | Headlines matching any symbol in active watchlist |
| `READ` | Reader | Opens selected headline: full summary, source, link out; for our own articles, renders full body in-panel |

## Panel behaviors

- News panels are terminal-dark themed (docs/15 tokens) — amber headlines on hover, red "BREAKING" tag when feed item is <10 min old and matches breaking keywords list
- Every row shows relative time ("2m", "1h") + absolute on hover
- Click ticker symbol inside a headline row → loads that ticker in the active quote panel (linked panels, docs/07 group colors)
- Unread state per session: bold until viewed

## Breaking detection (honest, rule-based — no fake AI)

A headline is "BREAKING" if: published <10 min ago AND source marked tier-1 in feed registry AND title matches keywords (`breaking|urgent|just in|alert`) OR feed provides a breaking category. Never fabricate breaking status.

## Data flow

```
RSS registry (config/feeds.ts) → /api/news?category=&symbol=&limit=
  → server: fetch+parse (rss-parser), sanitize, normalize timestamps,
    dedupe by title-hash, cache 3–5 min
  → terminal panels poll /api/news every 60s (ETag/If-None-Match to save bytes)
```

- Symbol matching runs server-side: headline text scanned against alias map; matched symbols stored on the item → enables CN/NH cheaply.

## Reader panel rules

- External items: show summary + prominent "Read at <Source> ↗" — attribution mandatory (docs/27 RSS rules)
- Own articles (docs/28): render full content in-panel with inline TickerChips working
- Keyboard: Esc closes reader, ← back to list, o opens original in new tab

## Ties to alerts (docs/09)

- Alert type "news": trigger when a headline matches symbol X or keyword Y → toast in terminal + row in ALRT panel. Poll-based (60s), honest about latency.
