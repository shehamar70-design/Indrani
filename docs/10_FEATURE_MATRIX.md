# 10 — FEATURE MATRIX

Master checklist of every feature. P1 = MVP must-have, P2 = fast-follow, P3 = later. "Doc" = where the spec lives.

## News website

| # | Feature | Pri | Doc | Status |
|---|---|---|---|---|
| N01 | Utility bar + nav + omnibox | P1 | 03 | ☐ |
| N02 | Live ticker strip (all pages) | P1 | 03 | ☐ |
| N03 | Breaking news banner | P1 | 03 | ☐ |
| N04 | Homepage modular blocks (lead, bands, most-read) | P1 | 03 | ☐ |
| N05 | RSS ingestion pipeline (multi-source, categorized) | P1 | 12 | ☐ |
| N06 | Article page (aggregated + attribution) | P1 | 03, 28 | ☐ |
| N07 | Auto market recap pages (real data, EN+HI) | P2 | 02, 35 | ☐ |
| N08 | Live blog | P2 | 03 | ☐ |
| N09 | Vertical pages (9 verticals) | P1 | 04 | ☐ |
| N10 | Public quote pages /quote/[symbol] | P1 | 04 | ☐ |
| N11 | Search (news + symbols) | P1 | 04 | ☐ |
| N12 | Big Take longform band + layout | P2 | 28 | ☐ |
| N13 | Opinion vertical (author-forward) | P2 | 04 | ☐ |
| N14 | Newsletters center + signup | P2 | 29 | ☐ |
| N15 | Live TV page (embedded real streams + schedule) | P2 | 05, 34 | ☐ |
| N16 | Podcasts (real RSS + audio player) | P2 | 05, 34 | ☐ |
| N17 | Hindi section /hi (full mirror) | P2 | 05, 35 | ☐ |
| N18 | Markets hub /markets | P1 | 33 | ☐ |
| N19 | Economic calendar (news-site view) | P2 | 31 | ☐ |
| N20 | SEO metadata, OG images, sitemap | P1 | 17 | ☐ |

## Terminal

| # | Feature | Pri | Doc | Status |
|---|---|---|---|---|
| T01 | Shell: command bar, panels, status bar | P1 | 07 | ☐ |
| T02 | Command parser + function registry | P1 | 07 | ☐ |
| T03 | Keyboard shortcut system | P1 | 07 | ☐ |
| T04 | DES quote view | P1 | 08 | ☐ |
| T05 | GP/GIP charts + indicators + compare | P1 | 08 | ☐ |
| T06 | TOP/N news wire | P1 | 30 | ☐ |
| T07 | WEI world indices | P1 | 08 | ☐ |
| T08 | MOST movers | P1 | 08 | ☐ |
| T09 | ECO economic calendar | P1 | 31 | ☐ |
| T10 | EQS screener (+saved screens) | P2 | 08 | ☐ |
| T11 | FA fundamentals | P2 | 08 | ☐ |
| T12 | HP historical + CSV export | P2 | 08 | ☐ |
| T13 | RV peer comparison | P3 | 08 | ☐ |
| T14 | BQ quote montage | P3 | 08 | ☐ |
| T15 | FXC currency matrix | P2 | 32 | ☐ |
| T16 | CTM futures board | P2 | 32 | ☐ |
| T17 | W watchlists (persisted) | P1 | 09 | ☐ |
| T18 | ALRT alerts | P2 | 09 | ☐ |
| T19 | PORT portfolio | P2 | 09 | ☐ |
| T20 | HELP overlay + function directory | P1 | 07 | ☐ |
| T21 | Layout presets + saved layouts | P2 | 07 | ☐ |
| T22 | Deep-link URLs (?fn=&s=) | P1 | 07 | ☐ |
| T23 | Mobile compact terminal | P2 | 07 | ☐ |

## Systems

| # | Feature | Pri | Doc | Status |
|---|---|---|---|---|
| S01 | Data layer: providers, fallback chain, cache | P1 | 12, 18 | ☐ |
| S02 | Auth: register/login/verify/sessions | P1 | 13 | ☐ |
| S03 | Design system: tokens, themes, typography | P1 | 15 | ☐ |
| S04 | Motion & polish pass | P2 | 16 | ☐ |
| S05 | Performance: caching, ISR, bundle budget | P1 | 17 | ☐ |
| S06 | Security: headers, rate limits, validation | P1 | 18 | ☐ |
| S07 | Testing: unit + e2e + bug audit | P2 | 19 | ☐ |
| S08 | AI assistant ASKB (deferred) | P3 | 14 | ☐ |

Claude Code: update the Status column (☐ → ☑) as features land, in the same commit as the feature.
