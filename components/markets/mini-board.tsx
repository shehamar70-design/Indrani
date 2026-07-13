/**
 * MiniBoard — docs/33. Generic compact quote table (server component) used
 * for FX / commodities / crypto / index boards. Parent passes pre-fetched
 * quotes; symbols whose quote failed are omitted (docs/18 §2). FX pairs
 * render 4 decimals — a 2-decimal EURUSD is useless.
 */

import Link from "next/link";
import type { Quote } from "@/lib/data/types";
import { findSymbol } from "@/lib/symbols";
import { formatPrice, formatNumber, formatPercentPoints } from "@/lib/format";

function boardPrice(q: Quote): string {
  if (q.quoteType === "CURRENCY" || findSymbol(q.symbol)?.type === "CURRENCY") {
    return formatNumber(Math.round(q.price * 1e4) / 1e4);
  }
  return formatPrice(q.price);
}

export default function MiniBoard({
  title,
  symbols,
  quotes,
  nameFirst = false,
}: {
  title?: string;
  symbols: string[];
  quotes: Record<string, Quote>;
  /** Show the human name as the primary line (FX/commodities boards). */
  nameFirst?: boolean;
}) {
  const rows = symbols.map((s) => quotes[s]).filter((q): q is Quote => Boolean(q));

  return (
    <section aria-label={title ?? "Quote board"}>
      {title && <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">{title}</h2>}
      {rows.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">Data unavailable right now.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((q) => {
            const entry = findSymbol(q.symbol);
            const name = entry?.name ?? q.shortName ?? q.symbol;
            const primary = nameFirst ? name : q.symbol;
            const secondary = nameFirst ? q.symbol : name;
            const up = q.changePercent >= 0;
            return (
              <li key={q.symbol}>
                <Link
                  href={`/markets/quote/${encodeURIComponent(q.symbol)}`}
                  className="flex items-baseline justify-between gap-3 py-2 hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{primary}</span>
                    <span className="block truncate text-xs text-muted-foreground">{secondary}</span>
                  </span>
                  <span className="shrink-0 text-right tabular-nums">
                    <span className="block text-sm font-semibold">{boardPrice(q)}</span>
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
