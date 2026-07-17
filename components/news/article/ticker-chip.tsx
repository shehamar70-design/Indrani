"use client";

/**
 * Inline ticker chip — docs/28 layout A. Renders inside paragraph text for
 * [[SYMBOL]] markers; links to the quote page and shows a live change via the
 * shared batched poller. No quote yet → symbol-only chip (never a number).
 */

import Link from "next/link";
import { useQuotes } from "@/lib/quote-poller";
import { formatPercentPoints } from "@/lib/format";

export default function TickerChip({ symbol }: { symbol: string }) {
  const { quotes } = useQuotes([symbol]);
  const quote = quotes[symbol];
  const up = quote ? quote.changePercent >= 0 : null;

  return (
    <Link
      href={`/markets/quote/${encodeURIComponent(symbol)}`}
      className="mx-0.5 inline-flex items-baseline gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5 align-baseline text-[0.8em] font-semibold tabular-nums no-underline hover:border-foreground"
    >
      {symbol}
      {quote && (
        <span style={{ color: up ? "var(--accent-up)" : "var(--accent-down)" }}>
          {formatPercentPoints(quote.changePercent)}
        </span>
      )}
    </Link>
  );
}
