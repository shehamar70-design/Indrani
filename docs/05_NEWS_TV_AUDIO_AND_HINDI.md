# 05 — NEWS: TV, AUDIO AND HINDI (SPEC)

Routes: `/tv`, `/podcasts`, `/hi` (+ `/hi/...` mirrors). Deep specs: doc 34 (TV/podcasts), doc 35 (Hindi rules).

## 1. Live TV `/tv`

- **Player area**: embeds a real, legally embeddable live business stream (candidates that allow embedding: Bloomberg TV YouTube live, CNBC TV18 YouTube live, NDTV Profit YouTube live). Configurable in `lib/tv-config.ts` with an ordered fallback list — if the primary embed fails, try the next; if all fail show schedule + "stream unavailable".
- **"AKASH Markets Now" strip** under the player: live ticker data (real) rendered as a broadcast-style lower-third.
- **Schedule rail**: static configured schedule of embedded channel programming with "LIVE NOW" highlighting based on current time (IST + ET display).
- Never claim third-party streams are AKASH-owned — always show the channel/source name on the card.

## 2. Podcasts `/podcasts`

- Grid of real finance podcasts ingested via their public RSS (e.g., Odd Lots, Planet Money, Motley Fool Money, Paisa Vaisa) — artwork, latest episodes, native `<audio>` player streaming the real enclosure URL.
- Podcast config list in `lib/podcast-feeds.ts`; parse RSS server-side, cache 30 min.
- Player: play/pause, seek, playback speed, remembers position (localStorage is acceptable here — playback position is ephemeral UI state, not app data).

## 3. Hindi section `/hi`

- Mirrors home structure with Hindi-first content: Hindi RSS sources (Economic Times Hindi, BBC Hindi Business, Zee Business), Devanagari-optimized typography (Noto Sans Devanagari via next/font).
- UI chrome fully translated via `lib/i18n.ts` dictionary (nav, labels, timestamps in Hindi — "14 मिनट पहले").
- Market recap auto-pages also generated in Hindi from the same real data (number formatting: Indian system — 81,455.12; लाख/करोड़ labels).
- Language toggle in UtilityBar persists via cookie; detailed content + audio rules in doc 35.

## 4. Acceptance checklist

- [ ] TV page works even when all streams fail (schedule + graceful message).
- [ ] Podcast audio streams real episodes; no fake episode lists.
- [ ] `/hi` renders full Devanagari UI, Indian number formatting.
- [ ] Source/channel attribution visible on all embedded media.
