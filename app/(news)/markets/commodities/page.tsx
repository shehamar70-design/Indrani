/**
 * /markets/commodities — docs/33. Energy / metals / agriculture boards
 * (front-month futures) + featured chart tabs for the headline contracts.
 */

import type { Metadata } from "next";
import { getQuotes, getChart } from "@/lib/data/chain";
import { COMMODITY_BOARDS } from "@/lib/markets";
import type { ChartData } from "@/lib/data/types";
import MarketsNav from "@/components/markets/markets-nav";
import MiniBoard from "@/components/markets/mini-board";
import FeaturedChart from "@/components/markets/featured-chart";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Commodities — Indrani Markets",
  description:
    "Live commodity markets: crude oil, natural gas, gold, silver, copper and agriculture futures with charts.",
  alternates: { canonical: "/markets/commodities" },
};

const CHART_TABS = [
  { symbol: "GC=F", label: "Gold" },
  { symbol: "CL=F", label: "Crude (WTI)" },
  { symbol: "SI=F", label: "Silver" },
  { symbol: "NG=F", label: "Nat Gas" },
];

export default async function CommoditiesPage() {
  const boardSymbols = COMMODITY_BOARDS.flatMap((b) => b.symbols);
  const [quotesRes, ...chartResults] = await Promise.all([
    getQuotes(boardSymbols),
    ...CHART_TABS.map((t) => getChart(t.symbol, "1d", "5m")),
  ]);

  const charts: Record<string, ChartData | null> = {};
  CHART_TABS.forEach((t, i) => {
    charts[t.symbol] = chartResults[i].data;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Commodities</h1>
      <MarketsNav active="commodities" />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <FeaturedChart tabs={CHART_TABS} initial={charts} />
        </div>
        <aside className="space-y-10">
          {COMMODITY_BOARDS.map((b) => (
            <MiniBoard key={b.group} title={b.group} symbols={b.symbols} quotes={quotesRes.data ?? {}} nameFirst />
          ))}
        </aside>
      </div>
    </div>
  );
}
