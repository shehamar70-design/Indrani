"use client";

/**
 * BreakingBanner — docs/03 §1.3. Server picks the candidate item (keyword +
 * recency rule in app/(news)/page.tsx); this island only handles dismissal.
 * Session-scoped dismiss keyed by item id so a NEW breaking story reappears.
 */

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/data/types";

export default function BreakingBanner({ item }: { item: NewsItem | null }) {
  const [dismissed, setDismissed] = useState(true); // avoid flash before sessionStorage read

  useEffect(() => {
    if (!item) return;
    setDismissed(sessionStorage.getItem("breaking-dismissed") === item.id);
  }, [item]);

  if (!item || dismissed) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-center gap-3 rounded bg-[var(--accent-down)] px-4 py-2.5 text-white"
    >
      <span className="shrink-0 animate-pulse text-[11px] font-bold uppercase tracking-widest">
        Breaking
      </span>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline"
      >
        {item.title} <span className="font-normal opacity-80">— {item.source} ↗</span>
      </a>
      <button
        type="button"
        aria-label="Dismiss breaking news banner"
        className="shrink-0 rounded px-1.5 text-lg leading-none opacity-80 hover:opacity-100"
        onClick={() => {
          sessionStorage.setItem("breaking-dismissed", item.id);
          setDismissed(true);
        }}
      >
        ×
      </button>
    </div>
  );
}
