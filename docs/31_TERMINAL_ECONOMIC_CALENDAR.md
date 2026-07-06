# 31 — Terminal: Economic Calendar (ECO)

> Bloomberg's ECO function equivalent. Phase 4.

---

## Command & layout

`ECO` opens the calendar panel:

```
[Week strip: Mon–Fri chips, today highlighted, ←/→ weeks]
[Filter row: region (US | India | Global), importance (High/Med/Low)]
[Event table]
 TIME IST | REGION | EVENT                    | IMPORTANCE | PRIOR | ACTUAL
 18:00    | US     | CPI YoY (May)            | ●●●        | 3.1%  | —
 11:00    | IN     | RBI Policy Decision      | ●●●        | 6.50% | —
```

- Importance dots: red 3-dot high, amber 2 medium, gray 1 low
- "ACTUAL" fills in when data releases (FRED refresh); until then "—" (never guess)
- Past events show actual vs prior; surprise highlighted (green better / red worse where direction is meaningful — else neutral)
- Countdown chip on today's next high-importance event ("in 2h 14m")

## Data strategy (per docs/27 calendar note)

1. **US events (auto)**: FRED release-dates API → map key releases (CPI, NFP via BLS series in FRED, GDP, FOMC-related series, retail sales, PCE) to calendar entries; actual values fetched from the series after release time.
2. **India + global recurring (curated)**: static config `config/calendar-curated.ts` — RBI MPC dates, Fed meeting dates, quarterly GDP dates, budget day, etc. Updated by maintenance sessions (docs/26). Each entry marked `source: "curated"`.
3. UI shows a subtle "auto"/"curated" origin tag — honesty about data provenance.

## API

```
GET /api/calendar?from=2026-07-01&to=2026-07-07&region=all
→ { events: [{ id, datetimeUtc, region, title, importance, prior, actual,
    unit, source: "fred"|"curated", seriesId? }] }
```

- Cache 1 hour; on a release day, poll the released series every 10 min for actual value between scheduled time and +2h.

## Integration

- Homepage "Today's calendar" mini-widget (top 3 high-importance)
- Newsletter "Subah 5 Baatein" pulls today's events (docs/29)
- Alerts: "notify when RBI decision actual posts" → news/alert bridge (docs/30)

## Explicit non-goals (MVP)

- No consensus/forecast column (no reliable free source) — column omitted entirely rather than faked
- No non-US automated coverage beyond curated list
