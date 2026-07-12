/**
 * MarketSnapshotBand — docs/03 §1.5. Server component: batched quotes + 1D
 * sparklines via the chain (never per-card fetches). A symbol whose quote
 * failed is omitted entirely — no fake values (docs/18 §2). Stale data gets
 * a "delayed" marker. Fixed card height → zero CLS.
 */

import Link from "next/link";
import { getChart, getQuotes } from "@/lib/data/chain";
import { formatPrice, formatPercentPoints } from "@/lib/format";
import Sparkline from "@/components/news/sparkline";

export default async function MarketSnapshot({ symbols }: { symbols: string[] }) {
  const [quotesRes, ...charts] = await Promise.all([
    getQuotes(symbols),
    ...symbols.map((s) => getChart(s, "1d", "5m")),
  ]);
  const quotes = quotesRes.data ?? {};

  const cards = symbols
    .map((symbol, i) => ({ symbol, quote: quotes[symbol], chart: charts[i].data }))
    .filter((c) => c.quote);

  if (cards.length === 0) {
    return (
      <p className="rounded border border-border py-6 text-center text-sm text-muted-foreground">
        Market data unavailable right now.
      </p>
    );
  }

  return (
    <section aria-label="Market snapshot" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ symbol, quote, chart }) => {
        const up = quote!.changePercent >= 0;
        return (
          <Link
            key={symbol}
            href={`/markets/quote/${encodeURIComponent(symbol)}`}
            className="flex h-28 flex-col justify-between rounded border border-border p-3 transition-colors hover:border-foreground/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{quote!.shortName ?? symbol}</p>
                <p className="text-[11px] text-muted-foreground">
                  {symbol}
                  {quote!.meta.isStale && (
                    <span className="ml-1 text-[10px] uppercase text-[var(--accent-down)]">delayed</span>
                  )}
                </p>
              </div>
              {chart && chart.candles.length > 1 && (
                <Sparkline values={chart.candles.map((c) => c.close)} width={64} height={24} />
              )}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold tabular-nums">{formatPrice(quote!.price)}</span>
              <span
                className="text-xs font-semibold tabular-nums"
                style={{ color: up ? "var(--accent-up)" : "var(--accent-down)" }}
              >
                {formatPercentPoints(quote!.changePercent)}
              </span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
