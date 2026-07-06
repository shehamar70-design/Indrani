# 32 — Terminal: Futures, FX & Commodities

> Bloomberg's WEI/FXC/CMDT equivalents. Phase 4. All symbols resolve through Yahoo (primary) with the standard fallback chain.

---

## Commands

| Command | Panel |
|---|---|
| `WEI` | World Equity Indices board |
| `FX` | FX rates matrix + majors board |
| `CMDT` | Commodities board |
| `FUT` | Futures board (equity index + commodity futures) |
| `CRYP` | Crypto board (Binance primary) |

## Symbol registries (config/symbols.ts — single source of truth)

```ts
export const WEI_SYMBOLS = [
  { s: "^GSPC", name: "S&P 500", region: "US" },
  { s: "^DJI", name: "Dow Jones", region: "US" },
  { s: "^IXIC", name: "Nasdaq", region: "US" },
  { s: "^NSEI", name: "Nifty 50", region: "IN" },
  { s: "^BSESN", name: "Sensex", region: "IN" },
  { s: "^FTSE", name: "FTSE 100", region: "EU" },
  { s: "^GDAXI", name: "DAX", region: "EU" },
  { s: "^N225", name: "Nikkei 225", region: "AS" },
  { s: "^HSI", name: "Hang Seng", region: "AS" },
  // GIFT Nifty if resolvable, else omit — never fake
]
export const FX_MAJORS = ["USDINR=X","EURUSD=X","GBPUSD=X","USDJPY=X","AUDUSD=X","USDCNY=X","DX-Y.NYB"]
export const COMMODITIES = ["CL=F","BZ=F","GC=F","SI=F","HG=F","NG=F","ZW=F"]
export const FUTURES = ["ES=F","NQ=F","YM=F","RTY=F"]
export const CRYPTO = ["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT"] // Binance pairs
```

## Board layout (shared `MarketBoard` component)

```
NAME          LAST      CHG      %CHG    SPARK(1D)   TIME
S&P 500     5,432.10   +23.45   +0.43%   ▁▂▄▅▆      16:00 ET
Nifty 50   24,010.60  −112.30   −0.47%   ▆▅▃▂▁      15:30 IST
```

- Region group headers in WEI (Americas / EMEA / Asia-Pacific) — Bloomberg WEI style
- Price flash on change: green up-tick / red down-tick background pulse 300ms
- Sparkline from 1D chart data (cached 5 min) — omit if unavailable
- Market open/closed dot per instrument (compute from exchange hours config)
- Click row → loads full quote (`DES`-style) and chart in linked panel

## FX matrix mode (`FX` second tab)

- 6×6 cross-rate grid (USD, EUR, GBP, JPY, INR, CNY) computed from USD pairs — mark as "derived cross" in tooltip; only compute from live values, "—" if any leg unavailable

## Crypto specifics

- Binance websocket miniTicker for live updates where connected; REST polling fallback (5s)
- 24/7 market: no open/closed dot; show 24h high/low columns instead

## Refresh cadences

| Board | Cadence |
|---|---|
| WEI/FUT | 15s poll (batched single request) |
| FX | 30s |
| CMDT | 30s |
| CRYP | ws live / 5s poll fallback |
