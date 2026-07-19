"use client";

/**
 * LivePrice — client island on the quote page. Server passes the initial
 * quote; the shared batched poller (lib/quote-poller.ts) keeps it live.
 * Poller misses leave the last known value on screen (docs/18 §2).
 */

import type { Quote } from "@/lib/data/types";
import { useQuotes } from "@/lib/quote-poller";
import { formatPrice, formatPercentPoints } from "@/lib/format";
import TimeAgo from "@/components/markets/time-ago";

export default function LivePrice({ initial }: { initial: Quote }) {
  const { quotes, meta } = useQuotes([initial.symbol]);
  const quote = quotes[initial.symbol] ?? initial;
  const up = quote.changePercent >= 0;
  const color = up ? "var(--accent-up)" : "var(--accent-down)";
  const state = quote.marketState;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-bold tabular-nums tracking-tight">
          {formatPrice(quote.price)}
          {quote.currency && (
            <span className="ml-2 text-base font-medium text-muted-foreground">{quote.currency}</span>
          )}
        </span>
        <span className="text-lg font-semibold tabular-nums" style={{ color }}>
          {up ? "+" : ""}
          {formatPrice(quote.change)} ({formatPercentPoints(quote.changePercent)})
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {state === "PRE" && "Pre-market · "}
        {state === "POST" && "After hours · "}
        {state === "CLOSED" && "Market closed · "}
        {quote.meta.isStale ? (
          <span className="uppercase text-[var(--accent-down)]">
            Delayed — as of <TimeAgo iso={meta?.fetchedAt ?? quote.meta.fetchedAt} />
          </span>
        ) : (
          <>Updated <TimeAgo iso={meta?.fetchedAt ?? quote.meta.fetchedAt} /></>
        )}
      </p>
    </div>
  );
}
