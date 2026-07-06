# STATE — updated 2026-07-06

## Phase: 1 ready (bootstrap complete, no app code yet)

## Done
- Spec files 00–43 moved into `docs/`
- Next.js skeleton: App Router, TypeScript, Tailwind v4, ESLint 9, pnpm (Next 16.2.10 / React 19.2.4) — nothing beyond docs/01
- CLAUDE.md (spec-of-record pointers, real-data + fallback rules, security summary, session protocol), STATE.md, DECISIONS.md
- `.claude/` per docs/20: commands verify/audit/new-func + subagents researcher/builder/reviewer
- MCP verified connected: context7, playwright, figma, chrome-devtools
- Dev server confirmed: `GET /` → 200 (default Next.js page)
- git init (main) + bootstrap commit

## In progress
- nothing — awaiting Phase 1 plan mode

## Next
- Phase 1 (Foundation, docs/36): read docs/01, 12, 13, 15, 18 → plan → safeFetch fallback engine + Yahoo/Finnhub/Binance/FRED/RSS providers, API routes (quote/chart/news/search), Neon + Drizzle + Better Auth, Tailwind theme tokens, en/hi i18n scaffold
- Phase 1 needs env vars: DATABASE_URL, BETTER_AUTH_SECRET (required); FINNHUB_API_KEY, FRED_API_KEY (free registrations)

## Known issues
- github + memory MCP servers from docs/20 not installed (only the 4 above); add if needed
- No git remote configured yet — pushes will need one

## Commands to resume
pnpm dev  # then open http://localhost:3000
