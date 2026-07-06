# 29 — Newsletters & Akash TV (Bloomberg-TV-style surface)

> Newsletter system + the TV-style live/video hub. Phase 5.

---

## 1. Newsletters

Bloomberg's newsletter lineup (Five Things, Points of Return, Money Stuff, etc.) is a core retention feature. Akash equivalent:

### Launch lineup (3 newsletters, all auto-scaffolded from real data + editable)

| Name | Cadence | Content |
|---|---|---|
| **Subah 5 Baatein** (Five Things India edition) | Daily 7:30 AM IST | 5 numbered items: overnight US close, GIFT Nifty cue, top 3 headlines (RSS), FX check (USDINR), day's calendar events |
| **Closing Bell** | Daily post-market | Index performance, top movers table, sector heat summary, tomorrow's watch |
| **Weekly Big Picture** | Sunday | Week's index chart, best/worst performers, macro releases recap (FRED), next week preview |

### Pages & flows
- `/newsletters` — index page: card per newsletter (name, description, sample, cadence, subscribe button)
- `/newsletters/[slug]` — archive list + latest issue rendered as a clean web page
- Subscribe: email input → stored in `newsletter_subscriptions` (userId nullable — allow non-account subscribes with email verify)
- Sending email is OUT of MVP scope — issues render on-site; actual delivery (Resend etc.) is a roadmap item. Do NOT fake "email sent" states.

### Issue generation
- A route `/api/newsletters/generate?slug=subah-5` assembles the issue scaffold from live data (real numbers only) + latest RSS headlines with attribution; store as draft; render on site.
- Cron via Vercel Cron (or manual trigger button in an admin-only page) — admin = your userId.

## 2. Akash TV (`/tv`)

Bloomberg has bloomberg.com/live/us — a 24/7 live player + schedule. We have no broadcast, so Akash TV is an honest hybrid:

### Page layout
```
[Large player area]
  - Plays: curated live YouTube embeds of freely embeddable financial
    streams (respect embed permissions), OR our "Markets Now" data show
[Markets Now — our own "channel"]
  - A full-screen auto-rotating dashboard: index board (10s) → top movers
    (10s) → FX board → commodities → latest headlines ticker. All real
    live data. This is the default player content. Think airport
    departure-board meets Bloomberg TV graphics package.
[Schedule rail] — static schedule of the rotation segments
[Latest video/clips rail] — curated embeddable clips (YouTube embeds with
  attribution), tagged by topic
```

### Rules
- Never rip or re-host anyone's stream. Only official embeds that allow embedding.
- "Markets Now" is the differentiator: pure data broadcast — build it as a full-screen route `/tv/markets-now` reused inside the player frame.
- Mute by default, keyboard accessible player controls.

## 3. Podcasts (`/podcasts`) — see docs/34 for full spec

Cross-link only in this doc: newsletter issues embed the day's podcast episode card if available.

## 4. DB additions

```
newsletters(id, slug, name, description, cadence)
newsletter_issues(id, newsletter_id, issue_date, title, blocks_json, status draft|published)
newsletter_subscriptions(id, email, newsletter_id, user_id?, verified_at?)
```
