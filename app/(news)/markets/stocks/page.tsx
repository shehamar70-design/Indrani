/**
 * /markets/stocks — docs/33. Index boards by region + movers + sector
 * performance computed from sector ETF proxies (methodology labeled — these
 * are US-listed SPDR ETFs, not the sectors themselves).
 */

import type { Metadata } from "next";
import { getQuotes, getMovers } from "@/lib/data/chain";
import { INDEX_BOARDS, SECTOR_ETFS } from "@/lib/markets";
import type { Quote } from "@/lib/data/types";
import { formatPercentPoints } from "@/lib/format";
import MarketsNav from "@/components/markets/markets-nav";
import MiniBoard from "@/components/markets/mini-board";
import MoversBoard from "@/components/markets/movers-board";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Stocks — Indrani Markets",
  description:
    "Global equity markets: Indian, American, European and Asian index boards, top movers and sector performance.",
  alternates: { canonical: "/markets/stocks" },
};

/** Sorted sector bars — width scaled to the day's biggest absolute move. */
function SectorPerformance({ quotes }: { quotes: Record<string, Quote> }) {
  const rows = SECTOR_ETFS.map((s) => ({ ...s, quote: quotes[s.symbol] }))
    .filter((s): s is (typeof s) & { quote: Quote } => Boolean(s.quote))
    .sort((a, b) => b.quote.changePercent - a.quote.changePercent);
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.quote.changePercent)), 0.01);

  return (
    <section aria-label="Sector performance">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">Sector performance</h2>
        <span className="text-[10px] uppercase text-muted-foreground">via US sector ETFs</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">Sector data unavailable right now.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => {
            const up = r.quote.changePercent >= 0;
            const color = up ? "var(--accent-up)" : "var(--accent-down)";
            return (
              <li key={r.symbol} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 truncate font-semibold">{r.sector}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-sm bg-muted">
                  <span
                    className="block h-full"
                    style={{
                      width: `${(Math.abs(r.quote.changePercent) / maxAbs) * 100}%`,
                      background: color,
                    }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right font-semibold tabular-nums" style={{ color }}>
                  {formatPercentPoints(r.quote.changePercent)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default async function StocksPage() {
  const boardSymbols = INDEX_BOARDS.flatMap((b) => b.symbols);
  const [quotesRes, gainersRes, losersRes] = await Promise.all([
    getQuotes([...boardSymbols, ...SECTOR_ETFS.map((s) => s.symbol)]),
    getMovers("gainers"),
    getMovers("losers"),
  ]);
  const quotes = quotesRes.data ?? {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Stocks</h1>
      <MarketsNav active="stocks" />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <div className="grid gap-10 sm:grid-cols-2">
            {INDEX_BOARDS.map((b) => (
              <MiniBoard key={b.region} title={b.region} symbols={b.symbols} quotes={quotes} nameFirst />
            ))}
          </div>
          <SectorPerformance quotes={quotes} />
        </div>

        <aside className="space-y-10">
          <MoversBoard gainers={gainersRes.data ?? []} losers={losersRes.data ?? []} limit={10} />
        </aside>
      </div>
    </div>
  );
}
