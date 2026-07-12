/**
 * OpinionBand — docs/03 §1.9. Author-forward cards: source name emphasized
 * above a serif headline (RSS gives no avatars — source is the byline).
 * Aggregated: attributed, links out.
 */

import SectionBand from "@/components/news/section-band";
import { timeAgo } from "@/lib/format";
import { getVertical } from "@/lib/verticals";
import type { NewsItem } from "@/lib/data/types";

export default function OpinionBand({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;
  const accent = getVertical("opinion")?.accent;

  return (
    <SectionBand title="Opinion" accent={accent} href="/opinion">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((item) => (
          <article key={item.id}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
              {item.source} <span aria-hidden="true">↗</span>
            </p>
            <h3 className="mt-1 font-serif text-lg font-bold leading-snug">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.title}
              </a>
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground">
              <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time>
            </p>
          </article>
        ))}
      </div>
    </SectionBand>
  );
}
