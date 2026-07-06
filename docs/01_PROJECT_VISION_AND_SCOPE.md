# 01 — PROJECT VISION AND SCOPE

## Vision

**AKASH** is a two-surface financial platform:

1. **AKASH News** (public, Bloomberg.com-class) — a fast, beautiful financial news website: homepage, verticals, article pages, markets hub, live TV/audio, newsletters, search.
2. **AKASH Terminal** (app, Bloomberg-Terminal-class) — a keyboard-first professional workspace: command line + function codes, multi-panel layout, live quotes, charts, screeners, watchlists, alerts, portfolio, economic calendar, news wire.

One codebase, one design language, one data layer. Built with **Next.js (App Router)** and deployed on Vercel.

## Target users

- Retail investors and traders (India + global) who want Bloomberg-quality tools for free.
- News readers who want fast, dense, trustworthy market coverage — English + Hindi.
- Power users who want a terminal experience in the browser.

## Scope — IN (MVP)

| Surface | Included |
|---|---|
| News site | Homepage, ticker strip, verticals (Markets, Economics, Tech, Politics, Crypto, AI, Green, Wealth, Opinion), article pages, Big Take-style longform, live blog, search, newsletters signup, TV/audio pages, Hindi section |
| Terminal | Command line with function codes, quote page (DES), chart (GP), top news (TOP), world indices (WEI), economic calendar (ECO), screener (EQS), watchlist (W), alerts (ALRT), portfolio (PORT), monitor (MOST), FX/futures/commodities (FXC/CTM), settings |
| Data | Yahoo Finance primary, Finnhub/Binance/FRED fallbacks, RSS news ingestion, server-side cache, real data only |
| Systems | Auth (email+password, Better Auth on Neon), watchlist/portfolio persistence, responsive design, dark terminal theme + light news theme |

## Scope — OUT (for now)

- AI Copilot / ASKB (optional later phase — doc 14 keeps the spec ready).
- Paid data APIs, real brokerage/trading execution, options chains with greeks.
- Native mobile apps. Comment systems. Payment/paywall billing (paywall UI can be mocked as gating only).

## Success criteria

1. Every visible number is **real** and traceable to a source, or clearly marked unavailable.
2. Homepage LCP under 2.5s; quote updates feel live (≤15s staleness for cached quotes).
3. Terminal fully usable by keyboard alone.
4. Zero crashes when a data provider fails — graceful fallback every time.
5. Works on mobile (news site fully responsive; terminal has a usable compact mode).

## Guiding principles

- **Density with clarity** — Bloomberg's superpower is information density that never feels chaotic.
- **Speed is a feature** — cache aggressively, batch requests, stream where possible.
- **Keyboard-first terminal** — every function reachable by typing.
- **Honest data** — no mock data presented as real, ever.
- **Hindi as first-class** — not an afterthought (see doc 35).
