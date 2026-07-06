# 34 — Live TV & Podcasts

> `/tv` and `/podcasts`. Phase 5. Extends docs/29 §2. Honest media strategy: our own data broadcast + properly embedded third-party media.

---

## 1. `/tv` — Akash TV

### Player priority order
1. **Markets Now** (default) — our own auto-generated data broadcast (below)
2. Curated embeddable live streams (official YouTube embeds that permit embedding) — registry in `config/tv-sources.ts`, each with attribution + link to original channel

### Markets Now (`/tv/markets-now`) — the crown jewel of Phase 5
A full-screen, self-rotating "broadcast" of live data. Segments (each 10–12s, crossfade):

```
1. GLOBAL BOARD   — WEI board, oversized type
2. INDIA FOCUS    — Nifty/Sensex + top India headlines ticker
3. MOVERS         — top gainers/losers cards
4. FX & RATES     — majors board
5. COMMODITIES    — gold/oil hero numbers + sparklines
6. CRYPTO         — BTC/ETH hero + 24h stats
7. HEADLINES      — latest 5 headlines, large type, source tags
8. CALENDAR       — today's remaining high-importance events + countdown
```

- Bottom persistent bar: scrolling ticker + clock (IST) + "AKASH MARKETS NOW" bug top-right
- Design: terminal-dark tokens, broadcast-scale typography (64–120px numbers)
- All numbers live (standard cadences); a segment with unavailable data is skipped — never shown with stale numbers unlabeled
- Keyboard: space pause rotation, ←/→ manual segment nav
- Also works as a TV dashboard: any device fullscreen

### Schedule rail
Static rotation schedule + curated stream slots. No fake "programming".

## 2. `/podcasts`

We produce no podcasts in MVP. The page is a curated financial podcast directory + player:

- Registry `config/podcasts.ts`: public RSS podcast feeds (e.g. well-known markets podcasts with public feeds)
- Parse feed → show cover, latest episodes, description, official links
- Playback: native `<audio>` with the feed's enclosure URL (public podcast RSS is built for this); attribution + "via <show> RSS" always shown
- Episode page: `/podcasts/[show]/[episode]` — notes, timestamps if provided
- "Continue listening" (position saved per user, DB) — real feature, our value-add
- Roadmap note: own "Akash Daily Brief" audio (docs/35 audio rules) once TTS quality decision is made — NOT in MVP

## 3. Shared player component

`MediaPlayer` handles both audio (podcasts) and the TV frame: play/pause, seek, volume, playback rate (audio), keyboard accessible, MediaSession API for lock-screen controls on mobile.

## 4. DB additions

```
listening_progress(user_id, episode_guid, position_seconds, updated_at)
```
