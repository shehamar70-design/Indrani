# 00 — RESEARCH OVERVIEW

> Project: **AKASH** — a Bloomberg-class financial news website + professional terminal.
> This documentation package is written for **Claude Code**, which is the single orchestrator.
> All planning, questions, file reading, merging, and execution flow through Claude Code only.

---

## 1. What was researched

| Area | What was studied | Doc |
|---|---|---|
| Bloomberg.com | Homepage, navigation, verticals (Markets, Economics, Tech, Politics, Green, Crypto, AI, Wealth, Pursuits, Businessweek, CityLab), article pages, Big Take, newsletters, live TV/radio, paywall, quizzes, games | 02, 03, 04, 05, 28, 29 |
| Bloomberg Terminal | Command line, function codes (GP, TOP, WEI, ECO, N, DES, FA, EQS...), panels/windows, keyboard model, market monitors, charts, screeners, watchlists, alerts, portfolio | 06, 07, 08, 09, 30, 31, 32 |
| Competitors | Reuters, CNBC, WSJ, FT, TradingView, Koyfin, Refinitiv Eikon, Yahoo Finance, Investing.com, Google Finance | 11 |
| Data sources | Yahoo Finance (unofficial), Finnhub, Binance public WS/REST, FRED, RSS feeds, fallback chains | 12 |
| Claude Code tooling | Plugins, skills, subagents, hooks, MCP servers, marketplaces on GitHub | 20 |
| Design | Bloomberg's modular non-grid editorial layout, dark terminal aesthetic, typography, motion | 15, 16 |

## 2. Key research findings (summary)

1. **Bloomberg.com structure**: modular "building block" homepage (editor-resizable blocks, not a fixed grid), a persistent market ticker strip, breaking-news banner, live TV integration, and deep verticals. Articles use large readable fonts, wide columns, and heavy use of embedded charts.
2. **Bloomberg Terminal model**: everything is a *function code* typed into a command line (`AAPL US <Equity> GP <GO>`). The terminal is multi-panel, keyboard-first, dark-themed with amber/green/red accents.
3. **Competitor best features worth absorbing**:
   - TradingView → world-class charting, drawing tools, multi-timeframe, community ideas.
   - Koyfin → beautiful dashboards, fundamental graphs, multi-factor screener, watchlist analytics.
   - CNBC → live TV front-and-center, pre/post-market coverage.
   - Reuters → speed and terse wire-style headlines.
   - FT/WSJ → premium article design, newsletters, opinion sections.
   - Yahoo Finance → simple quote pages that rank on every search, portfolio tracking.
4. **Data reality**: Yahoo Finance has NO official API; use `yahoo-finance2` (unofficial) with heavy server-side caching + a documented fallback chain (Finnhub free tier 60 req/min → Binance public for crypto → FRED for macro → cached copy → "unavailable" state). **Never show fake data.**
5. **Claude Code**: plugins bundle commands, agents, hooks and MCP servers; install via `/plugin marketplace add <user>/<repo>` then `/plugin install`. Recommended stack in doc 20.

## 3. Non-negotiable rules (apply to ALL docs)

- **REAL DATA ONLY.** Never invent quotes, prices, charts, headlines, calendar values. If a value cannot be fetched or verified → show a clean "unavailable" state, never a fake number.
- **MULTI-SOURCE REDUNDANCY.** Every critical data area has a primary source, a fallback source, a server-side cache, and a graceful failure state.
- **FREE + FAST FIRST.** Free sources with aggressive caching/batching. Paid APIs only if free sources are proven insufficient.
- **Claude Code is the only orchestrator.** No separate coordination layer.
- **Legal note**: This is a Bloomberg-*inspired* product named AKASH. Do not copy Bloomberg logos, trademarks, article text, or proprietary data.

## 4. How to read this documentation set

```
00-01  → What we are building and why
02-05  → News website research + specs
06-09  → Terminal research + specs
10-12  → Feature matrix, competitors, data sources
13-21  → Systems: auth, AI, design, perf, security, QA, tooling, handover
22-24  → Prompts: plan mode, execution mode, master prompt
25-27  → User guide, maintenance, source notes
28-36  → Extended feature specs (articles, newsletters, terminal modules, TV, Hindi, roadmap)
```

Claude Code should read `24_MASTER_PROMPT.md` first, then `22_PLAN_MODE_PROMPT.md`, then pull in feature docs as needed per phase (build order in `36_DOCUMENTATION_ROADMAP.md`).
