# 19 — Testing, QA & Bug Audit

> How Claude Code verifies every feature before marking it done.

---

## 1. Definition of Done (every feature)

A feature is DONE only when ALL of these pass:
1. TypeScript compiles with zero errors (`pnpm exec tsc --noEmit`)
2. Lint passes (`pnpm exec next lint` or eslint)
3. Page renders in browser without console errors
4. Loading / stale / unavailable states all render correctly (test by disabling network)
5. Mobile viewport (375px) works — no horizontal scroll, no overlapping elements
6. Keyboard navigation works (terminal: all shortcuts; news: tab order)

## 2. Test layers

| Layer | Tool | What to test |
|---|---|---|
| Unit | Vitest | fallback chain (`safeFetch`), formatters (price, %, large numbers), command parser, ticker validation regex |
| API | Vitest + fetch | each route handler: happy path, invalid input (400), provider failure (returns stale/unavailable, never 500 with fake data) |
| E2E smoke | agent-browser / Playwright | homepage loads with real ticker data; article page opens; terminal command `AAPL GP` renders chart; login → watchlist add → persists after reload |

## 3. Critical test cases (write these first)

```
1. safeFetch: primary fails → secondary used → source recorded
2. safeFetch: both fail + cache exists → stale=true returned
3. safeFetch: both fail + no cache → data=null (never throws to UI)
4. Ticker validation rejects: "<script>", "AAPL; DROP", 20-char strings
5. Command parser: "AAPL GP" → {ticker:"AAPL", fn:"GP"}, "TOP" → {fn:"TOP"}, garbage → error state
6. Watchlist API: request without session → 401; with session → only that user's rows
7. Quote formatter: 1234.5 → "1,234.50"; -0.0234 → "-2.34%"; null → "—"
8. RSS sanitizer strips <script>, <iframe>, event handlers
```

## 4. Bug audit checklist (run before each phase completes)

- [ ] No hardcoded API keys anywhere (`grep -r "api_key\|apikey" --include="*.ts"` shows only env reads)
- [ ] No mock/fake numbers rendered as real data (search for hardcoded prices)
- [ ] All user-data queries filter by `userId`
- [ ] No `any` types in data-layer code
- [ ] Every fetch has a timeout
- [ ] No memory leaks: intervals/websockets cleaned up in useEffect returns
- [ ] Images have alt text; interactive elements are focusable
- [ ] Dark theme (terminal) and light theme (news) don't bleed into each other

## 5. Performance audit

- Lighthouse on homepage and one article page: LCP < 2.5s, CLS < 0.1
- Terminal grid with 6 panels: no jank while quotes update (use React DevTools profiler)
- API route p95 latency < 500ms with warm cache

## 6. When a bug is found

1. Reproduce it, write the failing test FIRST
2. Fix, confirm test passes
3. Add entry to `docs/27_SOURCE_NOTES_AND_LIMITATIONS.md` if it was a data-source quirk
