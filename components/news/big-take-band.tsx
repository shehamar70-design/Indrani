/**
 * BigTakeBand — docs/03 §1.7. Dark full-width band, 1–2 longform features
 * with large art. Motion hero: pure-CSS drifting gradient (keyframes in
 * globals.css, disabled under prefers-reduced-motion) — no JS shipped.
 * Until own features exist (F6), items are aggregated RSS: attributed,
 * linking out. `data-motion-slot` is the Phase 6 WebGL upgrade hook.
 */

import RemoteImage from "@/components/news/remote-image";
import { timeAgo } from "@/lib/format";
import type { NewsItem } from "@/lib/data/types";

export default function BigTakeBand({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;
  const features = items.slice(0, 2);

  return (
    <section
      aria-label="The Big Take"
      data-motion-slot="big-take"
      className="bigtake-motion relative -mx-4 mt-10 overflow-hidden bg-[#0a0e1a] px-4 py-10 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <header className="relative mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5b8def]">
          The Big Take
        </p>
        <p className="mt-1 text-sm text-white/60">Deep reads on markets and money.</p>
      </header>

      <div className={`relative grid gap-8 ${features.length > 1 ? "md:grid-cols-2" : ""}`}>
        {features.map((item) => (
          <article key={item.id}>
            {item.imageUrl && (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded bg-white/5">
                  <RemoteImage src={item.imageUrl} />
                </div>
              </a>
            )}
            <h3 className="font-serif text-2xl font-bold leading-tight [text-wrap:balance] sm:text-3xl">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.title}
              </a>
            </h3>
            {item.summary && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/70">
                {item.summary}
              </p>
            )}
            <p className="mt-2 text-xs text-white/50">
              <span className="font-semibold uppercase tracking-wider">
                {item.source} <span aria-hidden="true">↗</span>
              </span>{" "}
              · <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
