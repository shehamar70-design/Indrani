"use client";

/**
 * FeaturedChart — docs/33 main-grid hero. Symbol tabs around RangeChart;
 * each tab remounts RangeChart with its server-fetched initial 1D data.
 * Motion (answer 5): CSS-only crossfade on tab switch, disabled under
 * prefers-reduced-motion. Phase 6 hook: swap the inner wrapper for a WebGL
 * hero here — data + tab plumbing stay unchanged.
 */

import { useState } from "react";
import type { ChartData } from "@/lib/data/types";
import RangeChart from "@/components/markets/range-chart";

export default function FeaturedChart({
  tabs,
  initial,
}: {
  tabs: { symbol: string; label: string }[];
  initial: Record<string, ChartData | null>;
}) {
  const [active, setActive] = useState(tabs[0].symbol);

  return (
    <section aria-label="Featured chart" className="rounded border border-border p-4">
      <div role="tablist" aria-label="Featured symbol" className="mb-4 flex flex-wrap gap-1 border-b border-border pb-3">
        {tabs.map((t) => (
          <button
            key={t.symbol}
            role="tab"
            aria-selected={active === t.symbol}
            onClick={() => setActive(t.symbol)}
            className={`rounded px-3 py-1.5 text-sm font-semibold transition-colors ${
              active === t.symbol
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div key={active} className="motion-safe:animate-[featured-fade_.35s_ease-out]">
        <RangeChart symbol={active} initial={initial[active] ?? null} />
      </div>
    </section>
  );
}
