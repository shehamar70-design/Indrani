# 35 — Hindi Content & Audio Rules

> Hindi/Hinglish support strategy + audio content rules. Phase 5.

---

## 1. Language strategy (honest scope)

| Tier | What | MVP? |
|---|---|---|
| 1 | UI chrome in Hindi (nav, buttons, labels, empty states) via locale toggle | YES |
| 2 | Hindi news feeds aggregated (Hindi business RSS: e.g. ET Hindi, Moneycontrol Hindi, BBC Hindi business) with attribution | YES |
| 3 | Own Hindi articles/newsletters (human-written) | Later |
| 4 | Machine translation of English articles | NEVER presented as original — if ever added, clearly labeled "मशीन अनुवाद" |

## 2. Implementation (Tier 1 + 2)

- `next-intl` (or minimal homegrown dictionary) with locales `en`, `hi`; toggle in site header; preference persisted (cookie + user profile if logged in)
- Strings files: `messages/en.json`, `messages/hi.json` — ALL UI strings from day one go through the dictionary (retrofit is painful — enforce from Phase 1 even though Hindi ships Phase 5)
- Hindi section `/hindi`: dedicated home aggregating Hindi feeds (docs/30 pipeline, feeds tagged `lang: "hi"`)
- Numbers: Indian numbering format toggle (12,34,567 lakh/crore) for `hi` locale on Indian instruments; international format elsewhere — use a single `formatNumber(value, locale, style)` util
- Fonts: ensure Devanagari coverage — `Noto Sans Devanagari` loaded only for `hi` locale (subset)
- Dates: IST always; `hi` locale renders Hindi month names via `Intl.DateTimeFormat('hi-IN')`

## 3. Audio rules (applies to any audio feature, now or later)

1. No auto-generated TTS audio presented as human narration.
2. If TTS is used ("Listen to this article"), label clearly: "AI-generated audio / एआई-जनित ऑडियो".
3. Audio player must be keyboard accessible, MediaSession-enabled, never autoplay with sound.
4. Podcast audio: only public RSS enclosures, full attribution (docs/34).
5. Any Hindi TTS must be reviewed for pronunciation of financial terms before shipping — bad Hindi TTS is worse than none.

## 4. Editorial style (Hindi)

- Register: simple business Hindi, common English financial terms kept in Latin script (जैसे: "Nifty 50 आज 0.4% गिरा") — Hinglish mix is acceptable and expected by the audience
- Numbers in headlines: digits, not words
- Glossary file `docs/glossary-hi.md` (Claude creates when Phase 5 starts): consistent translations for ~50 core terms (bull/bear market, yield, mcap...)

## 5. Testing additions (extends docs/19)

- [ ] Locale toggle persists across navigation and reload
- [ ] No layout break with longer Hindi strings (buttons, nav)
- [ ] Devanagari renders on quote pages and boards
- [ ] lakh/crore formatting only on `hi` + Indian instruments
