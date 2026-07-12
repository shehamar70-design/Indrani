/**
 * QuoteHeader — docs/04 §2.1. Server component: identity row + LivePrice
 * client island + "Open in Terminal" deep link.
 */

import Link from "next/link";
import type { Quote } from "@/lib/data/types";
import type { SymbolEntry } from "@/lib/symbols";
import LivePrice from "@/components/markets/live-price";

export default function QuoteHeader({
  quote,
  entry,
}: {
  quote: Quote;
  entry?: SymbolEntry;
}) {
  const name = entry?.name ?? quote.shortName ?? quote.symbol;
  const exchange = entry?.exchange ?? quote.exchange;

  return (
    <header className="border-b border-border pb-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {quote.symbol}
            {exchange && <> · {exchange}</>}
            {quote.quoteType && <> · {quote.quoteType.charAt(0) + quote.quoteType.slice(1).toLowerCase()}</>}
          </p>
        </div>
        <Link
          href={`/terminal?fn=DES&s=${encodeURIComponent(quote.symbol)}`}
          className="rounded bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-80"
        >
          Open in Terminal
        </Link>
      </div>
      <div className="mt-4">
        <LivePrice initial={quote} />
      </div>
    </header>
  );
}
