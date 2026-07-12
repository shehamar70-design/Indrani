/**
 * NewsletterBand — docs/03 §1.10, lineup from docs/29 §1. Subscription
 * storage is Phase 5 (`newsletter_subscriptions`); docs/29 forbids faking
 * subscribe states, so no dead email input — an honest "opens soon" note.
 * ponytail: static config inline; move to `newsletters` table in Phase 5.
 */

const NEWSLETTERS = [
  {
    slug: "subah-5",
    name: "Subah 5 Baatein",
    cadence: "Daily · 7:30 AM IST",
    description:
      "Five things before the open: overnight US close, GIFT Nifty cue, top headlines, USDINR and the day's calendar.",
  },
  {
    slug: "closing-bell",
    name: "Closing Bell",
    cadence: "Daily · post-market",
    description:
      "Index performance, top movers, sector heat and tomorrow's watchlist — in your inbox at the close.",
  },
  {
    slug: "weekly-big-picture",
    name: "Weekly Big Picture",
    cadence: "Sunday",
    description:
      "The week's index chart, best and worst performers, macro recap and the week ahead.",
  },
];

export default function NewsletterBand() {
  return (
    <section aria-label="Newsletters" className="mt-10 rounded border border-border bg-muted/40 p-6">
      <header className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--accent-brand)]">
          Newsletters
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Built from live market data. Subscriptions open soon — issues will also read free on-site.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {NEWSLETTERS.map((n) => (
          <article key={n.slug} className="rounded border border-border bg-background p-4">
            <h3 className="font-serif text-lg font-bold">{n.name}</h3>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {n.cadence}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
