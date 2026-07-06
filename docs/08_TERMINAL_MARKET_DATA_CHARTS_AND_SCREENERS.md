# 08 — TERMINAL: MARKET DATA, CHARTS AND SCREENERS (SPEC)

Functions covered: DES, GP, GIP, HP, BQ, RV, FA, WEI, MOST, EQS, SECF.

## 1. DES — security description

- Header: symbol, full name, exchange, currency, session state, giant last price + change (tick-flash animation on update: brief green/red background pulse).
- Blocks: price stats (O/H/L, prev close, 52w range with position slider, volume vs avg), valuation (mkt cap, P/E, EPS, div yield — only returned fields), company profile (sector, industry, employees, summary when available), mini 1D sparkline, latest 5 headlines for the ticker.
- Poll live quote every 10s while panel visible (pause on hidden tab via `document.visibilityState`).

## 2. GP / GIP — charts

- Library: **lightweight-charts** (TradingView OSS) — candlestick, line, area; volume histogram sub-pane.
- GP ranges: 1D 5D 1M 3M 6M YTD 1Y 5Y MAX; intervals auto-selected (1m→1D ... 1wk→MAX). GIP = fixed 1D/1m-5m.
- Indicators (computed client-side from OHLCV): SMA(20/50/200), EMA(12/26), RSI(14) sub-pane, MACD sub-pane, Bollinger(20,2), VWAP (intraday only).
- Compare mode: `GP AAPL vs MSFT` overlays normalized % lines.
- Crosshair with OHLC readout; chart type toggle (candles/line/area); export PNG.
- Data: `/api/chart?symbol=&range=&interval=` (Yahoo chart endpoint via yahoo-finance2, cached: 1m data 30s, daily 10 min).

## 3. HP — historical prices

- Paginated OHLCV table (date desc), range picker, CSV download (client-side blob from fetched real data). Change% column colored.

## 4. BQ — quote montage

- Composite: big quote + 1D mini chart + key stats + depth-style bid/ask (only if source provides bid/ask; otherwise omit the block).

## 5. RV — relative value

- Peer table: symbol vs 4-8 peers (same sector from symbol directory). Columns: last, chg%, mkt cap, P/E, 1M %, YTD % — sortable. Missing metric = "—".

## 6. FA — financial analysis

- Tabs: Overview · Income · Balance · Cash Flow · Ratios. Source: yahoo-finance2 `quoteSummary` modules (incomeStatementHistory, balanceSheetHistory, financialData, defaultKeyStatistics).
- Render only returned periods/fields. Simple bar mini-charts for revenue/net income trend (Recharts).

## 7. WEI — world equity indices

- Regions grid: Americas (^GSPC ^IXIC ^DJI ^GSPTSE ^BVSP), EMEA (^FTSE ^GDAXI ^FCHI ^STOXX50E), APAC (^N225 ^HSI ^NSEI ^BSESN ^AXJO ^KS11). Each row: index, last, chg, chg%, tiny sparkline, local market open/closed dot.
- One batched quotes call; 15s cache.

## 8. MOST — most active / movers

- Tabs: Gainers · Losers · Most Active. Source: Yahoo predefined screeners (day_gainers, day_losers, most_actives) via yahoo-finance2 `screener`; region toggle US/India. Rows click → DES.

## 9. EQS — equity screener

- Filters: region, sector, mkt cap range, P/E range, div yield min, price range, % change. Runs against Yahoo screener API where supported; otherwise filters the seeded symbol universe with batched real quotes (clearly labeled "universe: AKASH 300").
- Save screens (per user, DB). Result table sortable, export CSV.

## 10. SECF — security finder

- Fuzzy search over symbol directory + yahoo-finance2 `search` for anything unknown. Grouped results: Equities, Indices, FX, Futures, Crypto. Enter → DES in active panel.

## 11. Acceptance checklist

- [ ] Charts render 10 years of daily data smoothly (lightweight-charts handles this natively).
- [ ] Indicator math verified against known values (unit tests, doc 19).
- [ ] All tables sortable, keyboard-navigable (arrow keys move row focus, Enter opens DES).
- [ ] Every function has loading/live/stale/unavailable states.
- [ ] No fabricated fields anywhere; absent data renders "—".
