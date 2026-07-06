# 36 — Documentation Roadmap & Build Phases

> The master execution roadmap. Maps every phase to its docs, deliverables, and exit criteria. This is what STATE.md tracks against.

---

## Phase 1 — Foundation

**Docs:** 01, 12, 13, 15, 18
**Deliverables:**
- Next.js skeleton, Tailwind tokens (both themes), fonts
- `safeFetch` fallback engine + Yahoo/Finnhub/Binance/FRED/RSS adapters
- API routes: `/api/quote`, `/api/chart`, `/api/news`, `/api/search`
- Neon DB + Drizzle schema + Better Auth (email+password)
- i18n dictionary scaffold (en/hi keys from day one, docs/35 §2)
**Exit criteria:** `/api/quote?symbols=AAPL,^NSEI,BTC-USD` returns live data with source+stale fields; login/register works; docs/19 critical tests 1–8 pass.

## Phase 2 — News site

**Docs:** 02, 03, 04, 28, 33
**Deliverables:** site shell + nav + ticker tape; homepage; article layouts A–E + external card; verticals; `/markets` hub + all sub-pages + quote page; search
**Exit criteria:** homepage fully live-data; article + quote pages pass Lighthouse budgets (docs/17); mobile clean at 375px.

## Phase 3 — Terminal core

**Docs:** 06, 07, 08
**Deliverables:** `/terminal` shell (dark theme lock), command line + parser + autocomplete, panel grid (1/2/4/6 layouts, linked panel groups), functions: `DES` (quote), `GP` (chart), `TOP`, `WEI`, `HELP`; all keyboard shortcuts
**Exit criteria:** `AAPL GP` flow works end-to-end by keyboard only; 6-panel layout updates without jank.

## Phase 4 — Terminal user features

**Docs:** 09, 30, 31, 32
**Deliverables:** watchlists (W), alerts (ALRT) incl. news alerts, portfolio (PORT), news functions (N/CN/NH/READ), calendar (ECO), boards (FX/CMDT/FUT/CRYP), screener basics
**Exit criteria:** user data survives reload + is userId-scoped (verified by test); alert fires on a real price cross.

## Phase 5 — Media & Hindi

**Docs:** 05, 29, 34, 35
**Deliverables:** newsletters (3 lineups, on-site issues, subscribe), `/tv` + Markets Now broadcast, `/podcasts` directory + player + progress, Hindi locale live + `/hindi` section
**Exit criteria:** Markets Now runs 10 min without stall; hi locale passes docs/35 §5 checks.

## Phase 6 — Polish & audit

**Docs:** 16, 17, 19, 26
**Deliverables:** motion polish (price flashes, transitions, reduced-motion), perf pass to budgets, full docs/19 bug audit, security sweep (docs/18 §1 grep checks), STATE.md final, README
**Exit criteria:** all audits green; fresh-clone bootstrap (docs/21 §5) works.

---

## Rules for this roadmap

1. Phases are sequential. No Phase N+1 work while Phase N exit criteria are unmet.
2. Every phase: plan mode (docs/22) → approval → execution (docs/23) → audit → STATE.md.
3. Scope changes go to STATE.md backlog, not into the current phase.
4. Each phase gets its own git branch, merged on exit criteria.

## Document index (complete set — 37 files)

| # | File | # | File |
|---|---|---|---|
| 00 | RESEARCH_OVERVIEW | 19 | TESTING_QA_AND_BUG_AUDIT |
| 01 | PROJECT_VISION_AND_SCOPE | 20 | GITHUB_MCP_PLUGINS_AND_SKILLS |
| 02 | NEWS_RESEARCH | 21 | CIVILIZATION_HANDOVER_AND_CONTINUITY |
| 03 | NEWS_HOME_PAGE_AND_ARTICLES | 22 | PLAN_MODE_PROMPT |
| 04 | NEWS_MARKETS_VERTICALS_AND_SEARCH | 23 | EXECUTION_MODE_PROMPT |
| 05 | NEWS_TV_AUDIO_HINDI | 24 | MASTER_PROMPT |
| 06 | TERMINAL_RESEARCH | 25 | USER_GUIDE |
| 07 | TERMINAL_LAYOUT_COMMANDS_AND_SHORTCUTS | 26 | MAINTENANCE_GUIDE |
| 08 | TERMINAL_MARKET_DATA_CHARTS_SCREENERS | 27 | SOURCE_NOTES_AND_LIMITATIONS |
| 09 | TERMINAL_WATCHLISTS_ALERTS_PORTFOLIO | 28 | NEWS_ARTICLE_LAYOUTS |
| 10 | FEATURE_MATRIX | 29 | NEWS_NEWSLETTERS_AND_BTV |
| 11 | COMPETITOR_COMPARISON | 30 | TERMINAL_NEWS_INTEGRATION |
| 12 | API_AND_DATA_SOURCES | 31 | TERMINAL_ECONOMIC_CALENDAR |
| 13 | AUTH_LOGIN_REGISTER_VERIFY | 32 | TERMINAL_FUTURES_FX_COMMODITIES |
| 14 | AI_ASSISTANT_AKASH | 33 | MARKETS_HUB |
| 15 | DESIGN_SYSTEM | 34 | LIVE_TV_AND_PODCASTS |
| 16 | MOTION_3D_AND_VISUAL_POLISH | 35 | HINDI_CONTENT_AND_AUDIO_RULES |
| 17 | PERFORMANCE_AND_CACHE | 36 | DOCUMENTATION_ROADMAP (this file) |
| 18 | SECURITY_AND_FALLBACKS | | |
