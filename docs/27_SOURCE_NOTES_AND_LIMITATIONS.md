# 27 — Source Notes & Limitations (living document)

> Known quirks, limits, and legal notes for every data source. Claude Code APPENDS here whenever it discovers something new while building. Never delete entries — mark them resolved.

---

## Yahoo Finance (primary — quotes, charts, search)

- Unofficial API — no SLA, endpoints can change without notice. That's why the fallback chain exists.
- Some endpoints need a "crumb" + cookie handshake; the `yahoo-finance2` npm package handles this — prefer it over raw fetch.
- Rate limiting is soft; batch symbols in one request (`quote?symbols=A,B,C`) and cache 10–30s server-side. Never call from the client.
- Indices use `^` prefix (`^GSPC`, `^IXIC`, `^NSEI`), FX uses `=X` (`USDINR=X`), futures `=F` (`CL=F`, `GC=F`), crypto `-USD` (`BTC-USD`).
- Quotes may be delayed 15 min for some exchanges — always show the timestamp, label as "delayed" where applicable.
- Personal/educational use context; for a commercial launch, revisit licensing (paid data vendor). LOG THIS AS A LAUNCH BLOCKER for commercial use.

## Finnhub (secondary — quotes, fundamentals, some news)

- Free tier: 60 API calls/min. Enough for fallback duty, NOT for primary polling of many symbols.
- Free tier covers US stocks well; international coverage limited on free plan.
- Websocket available on free tier for US stocks trades — optional upgrade path for real-time.
- Requires free API key (`FINNHUB_API_KEY`).

## Binance public API (crypto primary)

- No key needed for public market data. Websocket streams: `wss://stream.binance.com:9443/ws/btcusdt@miniTicker`.
- REST weight limits are generous for our volume; respect `X-MBX-USED-WEIGHT` header.
- Symbols are pairs like `BTCUSDT` — map to display symbols in the adapter.
- Geo-restrictions exist in some regions; if blocked in deployment region, fall back to Yahoo `-USD` symbols.

## FRED (macro/economic)

- Free API key required. Very stable, official (St. Louis Fed).
- US-centric. Indian macro data NOT covered — for Indian data use RBI publications (no clean free API; treat as manual/roadmap).
- Release-dates endpoints power the economic calendar (docs/31).

## RSS news feeds

- Reuters, BBC Business, Economic Times, Moneycontrol, LiveMint, Business Standard etc. publish public RSS. Feeds occasionally change URLs — keep the feed registry in one config file.
- RSS gives headline/summary/link — NOT full article text. We link out; we do not scrape full articles (legal + quality).
- Sanitize all RSS HTML (docs/18 §1.4). Feed timestamps can be inconsistent — normalize to UTC.
- Attribution required: always show source name + link to original.

## Economic calendar

- No good free global calendar API. Strategy: FRED release dates (US) + curated static list of recurring events (RBI policy, Fed meetings) maintained in repo. Mark clearly what is auto vs curated.

## Bloomberg (design reference only)

- We study bloomberg.com and Terminal publicly documented behavior for UX inspiration ONLY. No Bloomberg data, no logo, no trademark use, no scraping bloomberg.com content. The product is "Akash", visually distinct branding.

## General limitations (accepted for MVP)

- "Real-time" means 5–30s polling, not tick-by-tick (except optional Binance WS)
- No options chains, no order book depth (free sources insufficient) — roadmap items
- Hindi content: UI strings + curated Hindi feeds only; no machine translation of articles presented as original journalism (docs/35 rules)

---

## Discovered during build (Claude Code appends below this line)

<!-- format: ## YYYY-MM-DD — <source> — <what was discovered> — <action taken> -->
