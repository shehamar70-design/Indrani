/**
 * IndexHeroCard — docs/33 overview band. Server component: big price, change,
 * 1D sparkline. Parent fetches quote+chart (batched); card only renders.
 */

import Link from "next/link";
import type { Quote, ChartData } from "@/lib/data/types";
import { findSymbol } from "@/lib/symbols";
import { formatPrice, formatPercentPoints } from "@/lib/format";
import Sparkline from "@/components/news/sparkline";

export default function IndexHeroCard({
  quote,
  chart,
}: {
  quote: Quote;
  chart: ChartData | null;
}) {
  const up = quote.changePercent >= 0;
  const color = up ? "var(--accent-up)" : "var(--accent-down)";
  const name = findSymbol(quote.symbol)?.name ?? quote.shortName ?? quote.symbol;
  const closes = chart?.candles.map((c) => c.close) ?? [];

  return (
    <Link
      href={`/markets/quote/${encodeURIComponent(quote.symbol)}`}
      className="flex h-36 flex-col justify-between rounded border border-border p-4 transition-colors hover:border-foreground/30"
    >
      <div>
        <p className="truncate text-sm font-bold">{name}</p>
        <p className="text-[11px] text-muted-foreground">
          {quote.symbol}
          {quote.meta.isStale && (
            <span className="ml-1 text-[10px] uppercase text-[var(--accent-down)]">delayed</span>
          )}
        </p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xl font-bold tabular-nums tracking-tight">{formatPrice(quote.price)}</p>
          <p className="text-sm font-semibold tabular-nums" style={{ color }}>
            {formatPercentPoints(quote.changePercent)}
          </p>
        </div>
        <Sparkline values={closes} width={88} height={32} fill />
      </div>
    </Link>
  );
}
