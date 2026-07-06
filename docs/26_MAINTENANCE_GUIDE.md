# 26 — Maintenance Guide (after the build)

> How to keep Akash healthy once phases 1–6 are done.

---

## 1. Weekly routine (5 minutes)

Paste into Claude Code:
```
Maintenance check. Read STATE.md. Then:
1. pnpm outdated — list major updates only, don't install
2. Run the /verify command
3. Hit /api/quote?symbols=AAPL,BTC-USD and /api/news — confirm live data
4. Check docs/27 for any sources marked "watch" — retest them
Report findings, fix only breakages, commit.
```

## 2. When a data source breaks (most likely maintenance event)

Symptoms: quotes stuck stale, empty news, console 401/403/429.

```
Data source issue: <describe what you see>.
Diagnose per docs/18 fallback chain. Confirm which provider fails and why.
If the endpoint changed, update the provider adapter only — do not touch
the safeFetch interface. If provider is permanently dead, promote the
secondary and research a new free secondary (docs/12 criteria).
Log everything in docs/27. Test, commit.
```

## 3. Adding a new feature later

1. Write/extend the relevant docs/NN file FIRST (or ask Claude to draft it)
2. Then normal loop: plan mode (docs/22) → approve → execute (docs/23)
3. Never let code get ahead of docs — docs are the spec of record

## 4. Dependency updates

- Patch/minor: fine in weekly routine
- Major (Next.js, Drizzle, Better Auth): separate session, own branch, run the full docs/19 audit before merging
- Never update >2 major deps in one session

## 5. Database changes

- All schema changes through Drizzle migrations — never hand-edit the DB
- Before any migration: Claude explains what changes and what data is affected; you approve explicitly
- Neon free tier has branch feature — test migration on a branch first

## 6. Backups & safety

- GitHub is the backup — push at end of every session (docs/23 rule 8)
- Neon: enable point-in-time restore awareness (free tier keeps history)
- Never run destructive git commands (`push --force`, `reset --hard`) without a reason you understand

## 7. Performance regression check (monthly)

```
Run Lighthouse on / and /news/<any-article> and /terminal.
Compare against docs/17 budgets (LCP<2.5s, CLS<0.1, API p95<500ms warm).
If regressed, profile and fix the top offender only. Commit.
```

## 8. Signs you need a bigger session

- Same bug returning 3+ times → dedicated debugging session, plan mode first
- Multiple sources failing together → re-research the data landscape (docs/12 refresh)
- STATE.md "known issues" list > 8 items → dedicate a cleanup phase
