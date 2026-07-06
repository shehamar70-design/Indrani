# 16 — MOTION, 3D AND VISUAL POLISH

Polish pass spec. Applied AFTER features work (never block function on polish). Principle: **motion communicates data change; it is never decoration.**

## 1. Motion inventory (CSS-first; framer-motion only if truly needed)

| Element | Motion | Duration |
|---|---|---|
| Price update | Background flash green/red → fade | 300ms |
| Ticker strip | Continuous marquee, pause on hover | 40s loop |
| Breaking banner | Slide down + red pulse on dot | 250ms in |
| Panel open/close | Scale 0.98→1 + fade | 150ms |
| Command suggestions | Fade/slide 4px | 120ms |
| Chart range change | Crossfade series (lightweight-charts native) | — |
| Toast/alert trigger | Slide-in + subtle bounce | 200ms |
| Live blog new entry | Highlight background fade (amber→transparent) | 1.5s |
| Number counters (portfolio totals) | Tween to new value | 400ms |
| News card hover | Headline underline + image 1.02 scale | 150ms |

Rules: nothing longer than 400ms except marquee; everything honors `prefers-reduced-motion` (single utility: `motion-safe:` variants); no parallax, no scroll-jacking.

## 2. 3D policy

- **No 3D in MVP.** A globe/hero 3D scene adds bundle weight against the perf budget (doc 17).
- If later desired (marketing/landing only): react-three-fiber lazy-loaded, never on data pages. Roadmap item, doc 36.

## 3. Visual polish checklist (run as a dedicated pass)

- [ ] Skeletons match final layout exactly (zero CLS on load).
- [ ] All tables: tabular-nums, right-aligned numbers, consistent decimal places (2 for prices, 2 for %, 0 for volume with K/M/B).
- [ ] Empty states designed (not blank): icon + one line + action.
- [ ] Error states: honest message + retry button, consistent component.
- [ ] Focus states visible on every interactive element.
- [ ] Dark terminal reviewed for contrast; light news reviewed for hierarchy.
- [ ] Favicon, OG images, loading.tsx per route group.
- [ ] Mobile: ticker strip scrollable, terminal compact mode usable, nav sheet clean.
- [ ] Screenshot review at 360px / 768px / 1280px / 1920px widths (agent-browser).
