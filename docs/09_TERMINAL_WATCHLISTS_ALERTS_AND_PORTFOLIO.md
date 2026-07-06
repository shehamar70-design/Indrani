# 09 — TERMINAL: WATCHLISTS, ALERTS AND PORTFOLIO (SPEC)

Functions: W, ALRT, PORT. All three require auth (doc 13) and Neon persistence. Guests see a preview + sign-in prompt.

## 1. Database schema (Drizzle on Neon)

```
watchlists(id, user_id, name, position, created_at)
watchlist_items(id, watchlist_id, symbol, position, note, added_at)
alerts(id, user_id, symbol, kind price|percent_day, direction above|below, threshold numeric,
       status active|triggered|dismissed, triggered_at, created_at)
portfolios(id, user_id, name, base_currency, created_at)
positions(id, portfolio_id, symbol, quantity numeric, avg_cost numeric, opened_at, note)
terminal_layouts(id, user_id, name, layout_json, is_default)
```
Every query scoped by `user_id` from the Better Auth session — no exceptions.

## 2. W — watchlists

- Multiple named lists; tabs across the top. Default "My List" created on first sign-in.
- Row: symbol, name, last, chg, chg%, sparkline (1D), volume, 52w position bar. Live poll 10s (single batched call for all visible symbols).
- Actions: add via inline SECF search, drag-reorder, remove, per-symbol note, move between lists. Row click → DES; keyboard: arrows + Enter, `x` remove with undo toast.
- Column of tiny alert bells showing active alerts per symbol.

## 3. ALRT — alerts

- Create: symbol, condition (price above/below X, or day-change % beyond ±Y), one-shot.
- Evaluation: client-side check against live quotes while terminal is open (MVP) — when a condition hits: status→triggered (DB), toast + status-bar badge + optional browser Notification (permission-gated) + sound (user setting).
- List view: Active / Triggered / History tabs; re-arm or dismiss triggered alerts.
- Honest limitation, documented in UI: alerts evaluate while the app is open (no server-side push in MVP; see doc 36 roadmap for cron upgrade).

## 4. PORT — portfolio

- User-entered positions (symbol, quantity, avg cost) × **real live prices** = market value, day P&L, total P&L, weight%.
- Summary header: total value, day change, total return (₹/$ per base currency), donut of allocation by sector (from symbol directory).
- Table: position rows with live pricing; add/edit/delete positions; CSV import (symbol,qty,cost) and export.
- All valuations computed from live/cached real quotes; if a symbol's quote is unavailable → row shows "—" and is excluded from totals with a visible note ("1 position unpriced").

## 5. Acceptance checklist

- [ ] All three functions fully scoped per user; cross-user access impossible.
- [ ] Watchlist with 30 symbols = 1 batched quote request per poll, not 30.
- [ ] Alert triggers exactly once, persists across refresh.
- [ ] Portfolio totals recompute live; unpriced rows excluded honestly.
- [ ] Guest → sign-in → returns to the same function (redirect preserved).
