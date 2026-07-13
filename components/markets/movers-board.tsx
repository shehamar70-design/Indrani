"use client";

/**
 * MoversBoard — docs/33 right rail. Client tabs over server-fetched
 * gainers/losers lists (US coverage via Yahoo screener; India omitted —
 * no free source, never fake, docs/33). Empty list → explicit message.
 */

import { useState } from "react";
import Link from "next/link";
import type { Quote } from "@/lib/data/types";
import { formatPrice, formatPercentPoints } from "@/lib/format";

const TABS = [
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
] as const;

export default function MoversBoard({
  gainers,
  losers,
  limit = 6,
}: {
  gainers: Quote[];
  losers: Quote[];
  limit?: number;
}) {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("gainers");
  const rows = (active === "gainers" ? gainers : losers).slice(0, limit);

  return (
    <section aria-label="Market movers">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">Movers</h2>
        <span className="text-[10px] uppercase text-muted-foreground">US markets</span>
      </div>
      <div role="tablist" aria-label="Movers type" className="mb-2 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              active === t.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">Movers unavailable right now.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((q) => {
            const up = q.changePercent >= 0;
            return (
              <li key={q.symbol}>
                <Link
                  href={`/markets/quote/${encodeURIComponent(q.symbol)}`}
                  className="flex items-baseline justify-between gap-3 py-2 hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{q.symbol}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {q.shortName ?? "—"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right tabular-nums">
                    <span className="block text-sm font-semibold">{formatPrice(q.price)}</span>
                    <span
                      className="block text-xs font-semibold"
                      style={{ color: up ? "var(--accent-up)" : "var(--accent-down)" }}
                    >
                      {formatPercentPoints(q.changePercent)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
