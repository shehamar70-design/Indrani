/**
 * Internal story card — docs/03 §2 sizes: lead (hero), standard, compact
 * (headline-only row). For Indrani-authored articles (internal hrefs).
 * Aggregated RSS uses external-card.tsx instead.
 */

import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "@/lib/format";

export interface StoryCardProps {
  href: string;
  title: string;
  kicker?: string;
  /** Kicker/accent hex, usually VerticalConfig.accent. */
  accent?: string;
  summary?: string;
  imageUrl?: string;
  publishedAt?: string;
  byline?: string;
  variant?: "lead" | "standard" | "compact";
}

function Kicker({ text, accent }: { text?: string; accent?: string }) {
  if (!text) return null;
  return (
    <span
      className="text-[11px] font-bold uppercase tracking-widest"
      style={{ color: accent ?? "var(--accent-brand)" }}
    >
      {text}
    </span>
  );
}

function MetaRow({ byline, publishedAt }: { byline?: string; publishedAt?: string }) {
  if (!byline && !publishedAt) return null;
  return (
    <p className="mt-1.5 text-xs text-muted-foreground">
      {byline && <span className="font-medium">{byline}</span>}
      {byline && publishedAt && <span aria-hidden="true"> · </span>}
      {publishedAt && <time dateTime={publishedAt}>{timeAgo(publishedAt)}</time>}
    </p>
  );
}

export default function StoryCard({
  href,
  title,
  kicker,
  accent,
  summary,
  imageUrl,
  publishedAt,
  byline,
  variant = "standard",
}: StoryCardProps) {
  if (variant === "compact") {
    return (
      <article className="border-b border-border py-2.5 last:border-b-0">
        <Kicker text={kicker} accent={accent} />
        <h3 className="text-sm font-semibold leading-snug">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </h3>
        <MetaRow publishedAt={publishedAt} />
      </article>
    );
  }

  const lead = variant === "lead";
  return (
    <article className={lead ? "" : "flex gap-4"}>
      {imageUrl && (
        <div
          className={
            lead
              ? "relative mb-3 aspect-[16/9] w-full overflow-hidden rounded bg-muted"
              : "relative aspect-[3/2] w-28 shrink-0 overflow-hidden rounded bg-muted sm:w-36"
          }
        >
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes={lead ? "(max-width: 768px) 100vw, 720px" : "144px"}
            className="object-cover"
            priority={lead}
          />
        </div>
      )}
      <div className="min-w-0">
        <Kicker text={kicker} accent={accent} />
        <h3
          className={
            lead
              ? "font-serif text-2xl font-bold leading-tight sm:text-4xl"
              : "text-base font-semibold leading-snug"
          }
        >
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </h3>
        {summary && (
          <p
            className={`mt-2 text-sm leading-relaxed text-muted-foreground ${lead ? "sm:text-base" : "line-clamp-2"}`}
          >
            {summary}
          </p>
        )}
        <MetaRow byline={byline} publishedAt={publishedAt} />
      </div>
    </article>
  );
}
