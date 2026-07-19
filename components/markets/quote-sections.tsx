/**
 * Quote-page async sections — docs/44 §1.8 Suspense split. Each section
 * awaits its own data so the header+chart stream first and slow chains
 * (fundamentals, news, related) fill in behind Suspense boundaries.
 */

import Link from "next/link";
import { getQuotes, getFundamentals, getNews } from "@/lib/data/chain";
import { relatedSymbols } from "@/lib/symbols";
import type { Quote } from "@/lib/data/types";
import { formatPrice, formatPercentPoints } from "@/lib/format";
import StatsGrid from "@/components/markets/stats-grid";
import ExternalCard from "@/components/news/external-card";

export async function StatsSection({ quote, wantsFundamentals }: { quote: Quote; wantsFundamentals: boolean }) {
  const fund = wantsFundamentals ? await getFundamentals(quote.symbol) : null;
  return <StatsGrid quote={quote} fundamentals={fund?.data ?? null} />;
}

export async function NewsSection({ symbol }: { symbol: string }) {
  const res = await getNews({ symbol, limit: 6 });
  const news = res.data ?? [];
  return news.length ? (
    <div className="space-y-4">
      {news.map((item) => (
        <ExternalCard key={item.id} item={item} variant="compact" />
      ))}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">No recent headlines for {symbol}.</p>
  );
}

export async function RelatedSection({ symbol }: { symbol: string }) {
  const related = relatedSymbols(symbol);
  if (!related.length) return null;
  const res = await getQuotes(related.map((r) => r.symbol));
  const quotes = res.data ?? {};
  return (
    <ul className="divide-y divide-border">
      {related.map((r) => {
        const rq = quotes[r.symbol];
        const up = rq ? rq.changePercent >= 0 : true;
        return (
          <li key={r.symbol}>
            <Link
              href={`/markets/quote/${encodeURIComponent(r.symbol)}`}
              className="flex items-baseline justify-between gap-3 py-2 hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{r.symbol}</span>
                <span className="block truncate text-xs text-muted-foreground">{r.name}</span>
              </span>
              {rq ? (
                <span className="shrink-0 text-right tabular-nums">
                  <span className="block text-sm font-semibold">{formatPrice(rq.price)}</span>
                  <span
                    className="block text-xs font-semibold"
                    style={{ color: up ? "var(--accent-up)" : "var(--accent-down)" }}
                  >
                    {formatPercentPoints(rq.changePercent)}
                  </span>
                </span>
              ) : (
                <span className="shrink-0 text-sm text-muted-foreground">—</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
