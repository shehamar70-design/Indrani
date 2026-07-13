/**
 * /markets/crypto — docs/33. Tracked-coin board + 24h stats. "BTC share" is
 * computed from live market caps of the coins we track only — labeled as
 * such, NOT global BTC dominance (no free full-market cap source; docs/18 §2
 * says label or omit, never fake).
 */

import type { Metadata } from "next";
import { getQuotes, getChart } from "@/lib/data/chain";
import { CRYPTO_BOARD } from "@/lib/markets";
import type { ChartData, Quote } from "@/lib/data/types";
import { formatCompact } from "@/lib/format";
import MarketsNav from "@/components/markets/markets-nav";
import MiniBoard from "@/components/markets/mini-board";
import FeaturedChart from "@/components/markets/featured-chart";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Crypto — Indrani Markets",
  description:
    "Live cryptocurrency markets: Bitcoin, Ethereum and major altcoin prices, 24h moves and tracked market-cap stats.",
  alternates: { canonical: "/markets/crypto" },
};

const CHART_TABS = [
  { symbol: "BTC-USD", label: "Bitcoin" },
  { symbol: "ETH-USD", label: "Ethereum" },
  { symbol: "SOL-USD", label: "Solana" },
];

function TrackedStats({ quotes }: { quotes: Record<string, Quote> }) {
  const caps = CRYPTO_BOARD.map((s) => quotes[s]?.marketCap).filter(
    (c): c is number => typeof c === "number" && c > 0,
  );
  // Stats need most caps present, else "share of tracked" is misleading.
  if (caps.length < CRYPTO_BOARD.length / 2) return null;
  const total = caps.reduce((a, b) => a + b, 0);
  const btcCap = quotes["BTC-USD"]?.marketCap;

  return (
    <section aria-label="Tracked coin stats">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">Tracked-coin stats</h2>
        <span className="text-[10px] uppercase text-muted-foreground">
          {caps.length} coins tracked
        </span>
      </div>
      <dl className="divide-y divide-border text-sm">
        <div className="flex items-baseline justify-between py-2">
          <dt className="text-muted-foreground">Combined market cap</dt>
          <dd className="font-semibold tabular-nums">${formatCompact(total)}</dd>
        </div>
        {btcCap && (
          <div className="flex items-baseline justify-between py-2">
            <dt className="text-muted-foreground">BTC share of tracked coins</dt>
            <dd className="font-semibold tabular-nums">{((btcCap / total) * 100).toFixed(1)}%</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export default async function CryptoPage() {
  const [quotesRes, ...chartResults] = await Promise.all([
    getQuotes(CRYPTO_BOARD),
    ...CHART_TABS.map((t) => getChart(t.symbol, "1d", "5m")),
  ]);
  const quotes = quotesRes.data ?? {};

  const charts: Record<string, ChartData | null> = {};
  CHART_TABS.forEach((t, i) => {
    charts[t.symbol] = chartResults[i].data;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Crypto</h1>
      <MarketsNav active="crypto" />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <FeaturedChart tabs={CHART_TABS} initial={charts} />
        </div>
        <aside className="space-y-10">
          <MiniBoard title="Coins · 24h" symbols={CRYPTO_BOARD} quotes={quotes} nameFirst />
          <TrackedStats quotes={quotes} />
        </aside>
      </div>
    </div>
  );
}
