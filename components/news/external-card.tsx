/**
 * External (aggregated RSS) card — docs/03 §2 + docs/27. Always attributes
 * the source, links OUT with noopener/noreferrer, shows an external marker.
 * Never styled to look like an Indrani-authored story (docs/18, legal).
 */

import { timeAgo } from "@/lib/format";
import type { NewsItem } from "@/lib/data/types";

interface ExternalCardProps {
  item: NewsItem;
  variant?: "standard" | "compact";
}

export default function ExternalCard({ item, variant = "standard" }: ExternalCardProps) {
  const compact = variant === "compact";
  return (
    <article className="border-b border-border py-2.5 last:border-b-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {item.source} <span aria-hidden="true">↗</span>
      </p>
      <h3 className={`${compact ? "text-sm" : "text-base"} font-semibold leading-snug`}>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {item.title}
        </a>
      </h3>
      {!compact && item.summary && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time>
      </p>
    </article>
  );
}
