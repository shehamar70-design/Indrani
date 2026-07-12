/**
 * Section header band — docs/03 §2. Accent-tinted kicker + rule + optional
 * "More" link. Server component; accent comes from lib/verticals.ts.
 */

import Link from "next/link";
import type { ReactNode } from "react";

interface SectionBandProps {
  title: string;
  /** Hex accent (VerticalConfig.accent). Defaults to brand blue. */
  accent?: string;
  href?: string;
  moreLabel?: string;
  children?: ReactNode;
}

export default function SectionBand({
  title,
  accent = "var(--accent-brand)",
  href,
  moreLabel = "More",
  children,
}: SectionBandProps) {
  return (
    <section className="mt-8 first:mt-0">
      <header
        className="mb-4 flex items-baseline justify-between border-t-2 pt-2"
        style={{ borderTopColor: accent }}
      >
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: accent }}>
          {href ? <Link href={href}>{title}</Link> : title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            {moreLabel} →
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
