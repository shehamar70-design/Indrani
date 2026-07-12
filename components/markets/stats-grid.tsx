/**
 * StatsGrid — docs/04 §2.3. Only fields the APIs actually returned;
 * missing value renders "—" (docs/18 §2). Pure props, server-rendered.
 */

import type { Quote, Fundamentals } from "@/lib/data/types";
import { formatPrice, formatNumber, formatCompact, formatPercent } from "@/lib/format";

export default function StatsGrid({
  quote,
  fundamentals,
}: {
  quote: Quote;
  fundamentals: Fundamentals | null;
}) {
  const rows: [string, string][] = [
    ["Open", formatPrice(quote.open)],
    ["Day high", formatPrice(quote.dayHigh)],
    ["Day low", formatPrice(quote.dayLow)],
    ["Previous close", formatPrice(quote.previousClose)],
    ["Volume", formatCompact(quote.volume)],
    ["Market cap", formatCompact(quote.marketCap)],
    ["P/E ratio", formatNumber(fundamentals?.peRatio)],
    ["EPS", formatNumber(fundamentals?.eps)],
    ["52-week high", formatPrice(quote.fiftyTwoWeekHigh)],
    ["52-week low", formatPrice(quote.fiftyTwoWeekLow)],
    ["Dividend yield", formatPercent(fundamentals?.dividendYield)],
    ["Beta", formatNumber(fundamentals?.beta)],
  ];

  return (
    <section aria-label="Key statistics">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Key statistics</h2>
      <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-2 border-b border-border py-2">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
