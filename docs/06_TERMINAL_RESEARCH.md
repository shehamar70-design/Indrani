# 06 — TERMINAL RESEARCH (Bloomberg Terminal + peers)

How the Bloomberg Terminal actually works, and what AKASH Terminal should replicate or improve.

## 1. The Bloomberg Terminal mental model

- **Everything is a function.** ~30,000 function codes. Syntax: `[SECURITY] [MARKET SECTOR] [FUNCTION] <GO>`. Example: `AAPL US <Equity> GP <GO>` charts Apple.
- **Command line is the top of every panel.** You type into it constantly; the mouse is optional.
- **Multi-window**: pros run 2-4 monitors, each with 4 panels. Each panel is independent (own security context + function).
- **Color language**: near-black background; **amber/orange** for the command line and emphasis, **green** = up/positive, **red** = down/negative, **blue/cyan** links, white data text. Yellow market-sector keys (F8 Equity, F9 Govt, F10 Currency, F11 Corp...).
- **News is integrated**: TOP/N functions, plus headlines panels streaming beside market data.
- **HELP key** (twice = live human chat) — cultural signature.

## 2. Core function codes to replicate (AKASH set)

| Code | Bloomberg meaning | AKASH implementation |
|---|---|---|
| `DES` | Security description | Quote overview: price, stats, profile, key data |
| `GP` | Graph price | Interactive chart with ranges, intervals, compare |
| `GIP` | Intraday graph | 1D intraday chart (1m/5m candles) |
| `TOP` | Top news | Ranked news wire (all sources) |
| `N` | News menu | News browser by category/ticker |
| `WEI` | World equity indices | Global indices monitor (regions grid) |
| `MOST` | Most active | Top gainers/losers/volume (screener API) |
| `ECO` | Economic calendar | Calendar with importance, actual/forecast/prior |
| `EQS` | Equity screener | Filterable screener |
| `FA` | Financial analysis | Fundamentals: income/balance/ratios (fields available from source) |
| `FXC` | FX rates matrix | Currency cross matrix |
| `CTM` | Contract table menu | Futures board (energy, metals, ags, indices) |
| `W` | Watchlist | User watchlists (persisted) |
| `PORT` | Portfolio | Holdings, P&L (user-entered positions × real prices) |
| `ALRT` | Alerts | Price/percent alerts (in-app) |
| `BQ` | Quote montage | Composite quote view |
| `HP` | Historical prices | OHLCV table, downloadable CSV |
| `RV` | Relative value | Peer comparison table |
| `SECF` | Security finder | Symbol search |
| `HELP` | Help | Function directory + keyboard guide |
| `S` / `SET` | — | Settings (theme, density, home function) |

## 3. What peers add (absorb into terminal)

- **TradingView**: drawing tools, indicator library (SMA/EMA/RSI/MACD/Bollinger/VWAP), multi-pane charts, symbol compare overlay. → GP should support indicators + compare at minimum.
- **Koyfin**: dashboard "views" (saved layouts), beautiful fundamental graphs. → saveable panel layouts.
- **Refinitiv Eikon**: news sentiment tags, monitor grids. → color-coded news importance.
- **thinkorswim**: flexible grid layouts, hotkeys. → layout presets (1/2/4 panels).

## 4. Layout research conclusion

AKASH Terminal = full-viewport dark app at `/terminal`:
```
┌──────────────────────────────────────────────────────┐
│ CommandBar: [ AKASH ]  fn input («GO»)   clock  user │
├──────────────┬───────────────────────┬───────────────┤
│ Panel 1      │ Panel 2               │ Panel 3       │
│ (function)   │ (function)            │ (function)    │
├──────────────┴───────────────────────┴───────────────┤
│ StatusBar: connection · data age · alerts · shortcuts│
└──────────────────────────────────────────────────────┘
```
- Layout presets: 1, 2, 2x2, 3-column. Active panel highlighted (amber border). Commands execute into the active panel.
- Mobile: single panel + bottom function switcher.

## 5. Keyboard research (Bloomberg-style, browser-safe)

- `Ctrl+K` or `` ` `` → focus command line (F-keys clash with browsers; avoid as primary).
- `Enter` = GO. `Esc` = clear/cancel (Bloomberg red CANCL).
- `Alt+1..4` switch active panel. `Ctrl+Arrow` cycle panels.
- Typing a bare ticker then Enter → DES for that ticker (Bloomberg behavior).
- `?` in command line → HELP overlay.

Full command grammar + shortcut spec: doc 07.
