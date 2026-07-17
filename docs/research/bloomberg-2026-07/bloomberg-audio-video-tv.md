# Bloomberg.com Audio / Video / TV / Newsletter Surfaces — Desktop (~1440px) Research Report

**Date captured:** 2026-07-13. **Scope:** Public Bloomberg.com news website only (NOT the Terminal).
**Methods (cross-verified, 4 independent sources):**
1. **TinyFish real-browser fetch** of live `bloomberg.com` (`/`, `/audio`, `/newsletters`, `/oddlots`) — bypassed the Akamai "Press & Hold" wall that blocked WebFetch and plain headless Chrome.
2. **TinyFish web automation** (scrolling real browser) on live `/` and `/audio` for rendered-component detail.
3. **Headless Chrome (Playwright-core, 1440×900)** against Wayback Machine — clean captures of `/live/us` (Bloomberg TV+) and homepage `Listen, Watch and Catch Up` module + inline audio player.
4. **WebSearch** for corroboration (podcast cadence, Feb 2026 "Stream" video redesign, Live TV free-tier limit).

> **Bot-wall note:** Live `bloomberg.com/*` returns Akamai "Are you a robot?" to WebFetch and to plain headless Chrome (both our IP and the Wayback proxy of Bloomberg's own pages 403'd on `/podcasts`, `/oddlots`, `/newsletters`, `/`). TinyFish's managed stealth browser got through. Wayback served clean copies of `/live/us` and an Oct 2025 homepage.

---

## 1. Inline AUDIO player

### A. In-feed "Listen (MM:SS)" item (homepage news feed)
Individual story cards in the feed carry an audio affordance as a **text prefix on the headline**, two observed formats:
- `Listen (25:29) — Bloomberg Surveillance TV: July 13th, 2026`
- `Listen: 55:25 — Odd Lots: Why AI Might Actually Create More Work for Lawyers`

- **Duration format:** `MM:SS` (e.g., `25:29`, `31:13`, `55:25`), light text.
- The card itself has **no embedded play button** — the whole card is the click target. Odd Lots cards add a **headphones icon** next to the series logo/thumbnail.
- Thumbnail: none on plain feed items; podcast-section cards show the **series logo** at left.

### B. Standalone inline audio player widget (confirmed visually, Wayback homepage)
Appears as a dedicated module (e.g., under "Bloomberg News Now"). Concrete layout, left→right:
- **Round black circular Play button** (▶), ~72px diameter, white icon.
- **Horizontal scrubber**: thin gray track, a filled **progress dot/knob** near the left (start position).
- **Time readout** at right of the track: `5:58` (total/elapsed, `M:SS`).
- **Equalizer/wave glyph** (three vertical bars ⦀) at far right — animated playing indicator.
- Kicker above: series name (bold, e.g., "Bloomberg News Now"), one-line description, and a timestamp below (`Updated 2 hr ago`).
- Player sits on a **white card**; on `/audio` the theme is dark (black/#1a1a1a, white text).

### C. `/audio` hub live "Radio Player" (top of page)
Embedded live-radio player, **~50–60px control bar**, dark background. Controls: progress bar (`Loaded: 100.00%`), **mute (speaker)**, **skip-back 10s**, **skip-forward 10s**, **"Seek to live"** button, **play/pause** (circular), a **LIVE** label + red dot, plus station dropdown ("National") and current-show title.

### D. Sticky/persistent bottom bar
**Not present** on `/audio` or homepage in these captures — playback stays in the inline/embedded module rather than docking a global bottom bar. (Design implication: Bloomberg currently relies on inline players, not a site-wide sticky bar. A competitor could differentiate with a true persistent bar.) Bloomberg's Feb 2026 press release describes a new proprietary media player with PIP for video — audio bottom-bar behavior not confirmed.

### Speed control
No `1x/1.5x` playback-speed control was visible in-feed or on the inline widget.

---

## 2. VIDEO carousels

Three distinct rendered video modules on the homepage (all `MM:SS` duration badges):

| Module | Heading | Cards visible @1440 | Arrows / paging | Duration badge | Title prefix |
|---|---|---|---|---|---|
| **Today's Videos** | `Today's Videos` + `Explore More` | **6** (`LineupContentCarousel3UpVideo`) | ‹ › arrows far-right + **6 dots** | bottom-right, dark translucent, white `MM:SS` | none |
| **Watch** (right rail) | `Watch` | **5** (`LineupContentCarousel5UpVideo`) | Previous/Next + 2 page dots | **top-left** of thumb | `Video:` (+ optional `Opinion`) |
| **Bloomberg Originals** | `Bloomberg Originals` | **4** | none (static) | bottom-right | none |

- **Card anatomy:** rectangular thumbnail; centered translucent-circle **▶ play overlay**; duration badge; 1–2-line truncated title below.
- **In-feed "Watch:" items** (2-up): `Watch: Qatar, UAE Can Weather Hormuz Closure` with a `7:16` badge — "Watch:" is prepended to the headline text.
- Example durations seen: `18:33`, `5:14`, `11:52`, `1:14`, `2:51`, `76:09`.
- **Autoplay:** not observed in feed cards; Bloomberg's Feb 2026 redesign press release advertises **"preview-on-hover" discovery on web** (hover-to-preview) as the new pattern.

---

## 3. "Listen, Watch and Catch Up" mixed carousel

**Confirmed** (Wayback homepage, exact heading text: **`Listen, Watch and Catch Up`**), bold ~28–32px black on white.
- Horizontal **carousel of rounded-corner cards** (~8px radius, thin light-gray border, white fill), partial next-card peeking at the right edge (signals horizontal scroll).
- Card observed: **kicker** `Newsletter: Evening Briefing: Americas` (regular gray) + **bold headline** `Oracle Shares Take a Hit on Profit Margins Report`.
- This module **mixes card types** — newsletter, watch (video), and podcast/listen cards grouped under one heading, which is the pattern the redesign brief references.
- On the **live** homepage the equivalent grouping was rendered as separate sections (Odd Lots `LineupContent4UpPodcast` 4-up, `Today's Videos`, newsletter story-cards) — Bloomberg A/B's between a single mixed carousel and split lineup modules.

---

## 4. Inline NEWSLETTER signup

**Two distinct patterns — important nuance:**

**(a) In-feed newsletter *story* cards** (main homepage feed): NOT a signup form. Headline prefixed `Newsletter:` linking to that edition. Examples: `Newsletter: Markets Daily — ...`, `Newsletter: Power On — ...`, `Newsletter: Balance of Power — ...`, `Newsletter: Money Stuff` (Matt Levine). No email field in-feed.

**(b) Dedicated signup cards on `/newsletters` hub** (`bloomberg.com/newsletters`): grid of boxed cards, each with:
- **Newsletter name** + **one-line description** (verbatim copy captured):
  - **Markets Daily** — "What's happening in stocks, bonds, currencies and commodities right now — and what will move them next."
  - **AI Today** — "Chronicling the disruptions and threats of AI on businesses, workers, finance and economies…"
  - **Money Stuff (with Matt Levine)** — "A newsletter about Wall Street, finance and other stuff."
  - **Money** — "Insights, ideas and tools for doing more with your money."
  - **Morning/Evening Briefing: Americas** — "Catch up on everything you need to know, from overnight news to the big stories that will shape your day."
- Page intro copy: **"Get more of Bloomberg in your inbox."** and **"Newsletters you sign up for will be sent to [email]."** (email bound to signed-in account).
- **Cadence labels** appear as small pills (`Daily` / `Weekly`) — corroborated by the homepage Games cards which show the identical pattern: bold name + `Daily`/`Weekly` sub-label + rounded-pill CTA (`Play Puzzle`). A yellow `NEW` badge variant exists.
- **CTA:** pill-shaped button; on account pages a toggle/"Sign up" per newsletter. Canonical signup URL pattern `bloomberg.com/subscriptions/<name>` (e.g., `/subscriptions/oddlots`). Odd Lots newsletter switched **weekly → daily in Oct 2024** (use "Daily").

**Buildable takeaway:** boxed card, ~8px radius, thin border on light bg; row 1 = name + cadence pill; row 2 = 1-line description; row 3 = email input + adjacent solid CTA button ("Sign Up"). Bloomberg gates delivery behind sign-in rather than an anonymous inline field in the feed.

---

## 5. Live TV / Bloomberg TV+ entry points

**Homepage entry point:** first item in the sticky top nav — **`Live TV`** with a **red dot/pill indicator (●)** to its left, ~14–16px, links to `/live/us`. No inline video preview in the nav.

**`/live/us` player page (Bloomberg TV+, captured clean via Wayback, 1440×900):**
- **Large left video stage** (~66% width) with `Tap to unmute` overlay (starts muted) and controls **Play / Fullscreen / Replay** (3 `<video>` elements in DOM).
- **Right rail (~33%)** = schedule panel:
  - Tabs: **`For You` | `Live TV`**.
  - **`Current Stream: U.S. BTV+`** with a dropdown chevron (stream switcher).
  - **`● LIVE NOW`** (red) → show title (e.g., "Bloomberg: The China Show") + description.
  - **`UP NEXT`** with start time `03:00` + next show.
  - **`SEE FULL SCHEDULE ›`** link.
  - **`BTV CHANNEL FINDER` / `WATCH BTV IN YOUR AREA ›`**.
- **Free-tier limit:** 15 min/day free streaming from Bloomberg.com; unlimited requires Digital/All-Access subscription.
- **Feb 4, 2026 redesign** (Bloomberg Media press): unified "Stream" experience — cinematic web player, newsroom-curated layout that pivots breaking-news→explainer→documentary, mobile-first vertical video, PIP, preview-on-hover, and (new) subscriber-exclusive video. Hours-watched +25% YoY, >55M avg monthly video audience.

---

## Buildable summary for the Indrani redesign

- **Inline audio:** headline prefix `Listen (MM:SS)`; separate rich widget = round play + scrubber-with-dot + `M:SS` + equalizer glyph. Consider adding the sticky bottom bar Bloomberg lacks.
- **Video:** 3 carousel densities (3-up "Today's Videos" w/ arrows+dots, 5-up right-rail "Watch", 4-up "Originals"); duration badge `MM:SS` bottom-right (top-left on narrow cards); ▶ overlay; hover-preview.
- **Mixed module:** one heading **"Listen, Watch and Catch Up"** over a horizontal rounded-card carousel mixing newsletter/video/podcast, with the next card peeking.
- **Newsletter:** boxed card w/ name + `Daily`/`Weekly` pill + 1-line desc + email + solid CTA on a hub; in-feed it degrades to `Newsletter:`-prefixed story cards.
- **Live TV:** nav item `● Live TV` → split player (video stage + For You/Live TV schedule rail, Current Stream switcher, Live Now / Up Next / full schedule).

## Sources
- Live (via TinyFish real browser): https://www.bloomberg.com/ , https://www.bloomberg.com/audio , https://www.bloomberg.com/newsletters , https://www.bloomberg.com/oddlots
- Wayback (headless Chrome 1440×900): https://web.archive.org/web/2025/https://www.bloomberg.com/live/us ; homepage Oct 8 2025 capture (`Listen, Watch and Catch Up` + inline player)
- https://www.bloomberg.com/live/us (US BTV+) ; https://www.bloomberg.com/help/question/bloomberg-tv/ (15-min free limit)
- https://www.bloombergmedia.com/press/bloomberg-launches-new-premium-global-video-experience-to-unify-live-and-on-demand-news-original-and-short-form-content/ (Feb 4 2026 "Stream" video redesign)
- https://www.bloomberg.com/account/newsletters ; https://www.bloomberg.com/oddlots (Odd Lots newsletter weekly→daily Oct 2024)
- Screenshots saved: `/home/ubuntu/pw-audit/out/aud-live-00.png`, `aud-live-01.png`, `aud-audio-01.png`, `wbg-home-05.png`, `wbg-home-06.png`
