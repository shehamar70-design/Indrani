/**
 * MostReadRail — docs/03 §1.11. Numbered 1–5 rail. Real read-counts arrive
 * with news_items persistence (F8); until then callers pass latest items
 * with title="Latest" — never mislabeled as "Most Read" (docs/18 §2).
 */

import { timeAgo } from "@/lib/format";
import type { NewsItem } from "@/lib/data/types";

export default function MostReadRail({
  items,
  title = "Most Read",
}: {
  items: NewsItem[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <aside aria-label={title}>
      <h2 className="border-t-2 border-foreground pt-2 text-sm font-bold uppercase tracking-widest">
        {title}
      </h2>
      <ol className="mt-3">
        {items.slice(0, 5).map((item, i) => (
          <li key={item.id} className="flex gap-3 border-b border-border py-3 last:border-b-0">
            <span
              aria-hidden="true"
              className="font-serif text-2xl font-bold leading-none text-muted-foreground/50"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-snug">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {item.title}
                </a>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">
                  {item.source} <span aria-hidden="true">↗</span>
                </span>{" "}
                · <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
