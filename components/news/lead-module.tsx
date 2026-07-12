/**
 * LeadModule — docs/03 §1.4: hero story + 4 stacked secondaries. Until own
 * articles exist (Phase 2 F6), items are aggregated RSS: always attributed,
 * linking out (docs/27). Hero prefers an item with an image.
 */

import RemoteImage from "@/components/news/remote-image";
import { timeAgo } from "@/lib/format";
import type { NewsItem } from "@/lib/data/types";

function ExternalMeta({ item }: { item: NewsItem }) {
  return (
    <p className="mt-1.5 text-xs text-muted-foreground">
      <span className="font-semibold uppercase tracking-wider">
        {item.source} <span aria-hidden="true">↗</span>
      </span>{" "}
      · <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time>
    </p>
  );
}

export default function LeadModule({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Top stories are unavailable right now.
      </p>
    );
  }

  const heroIdx = Math.max(0, items.findIndex((i) => i.imageUrl));
  const hero = items[heroIdx];
  const rest = items.filter((_, i) => i !== heroIdx).slice(0, 4);

  return (
    <section className="grid gap-8 lg:grid-cols-[2fr_1fr]" aria-label="Top stories">
      <article>
        {hero.imageUrl && (
          <a href={hero.url} target="_blank" rel="noopener noreferrer">
            <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded bg-muted">
              <RemoteImage src={hero.imageUrl} priority />
            </div>
          </a>
        )}
        <h1 className="font-serif text-3xl font-bold leading-tight [text-wrap:balance] sm:text-5xl">
          <a href={hero.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {hero.title}
          </a>
        </h1>
        {hero.summary && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {hero.summary}
          </p>
        )}
        <ExternalMeta item={hero} />
      </article>

      <div className="flex flex-col divide-y divide-border border-t border-border lg:border-t-0">
        {rest.map((item) => (
          <article key={item.id} className="py-3 first:lg:pt-0">
            <h2 className="text-base font-semibold leading-snug">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.title}
              </a>
            </h2>
            <ExternalMeta item={item} />
          </article>
        ))}
      </div>
    </section>
  );
}
