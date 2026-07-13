/**
 * Markets hub — docs/33 page structure. Server component, ISR 60s.
 * Overview band (4 index heroes) → main grid: featured chart + markets news
 * (left), movers/FX/commodities/crypto/calendar rails (right). All quotes in
 * one batched getQuotes call; failed symbols are omitted, never faked
 * (docs/18 §2). Markets Wrap card lands with the article system (feature 6).
 */

import type { Metadata } from "next";
import { getQuotes, getChart, getMovers, getNews, getCalendar } from "@/lib/data/chain";
import {
  HERO_INDICES,
  FEATURED_TABS,
  FX_MAJORS,
  COMMODITIES_MINI,
  CRYPTO_MINI,
} from "@/lib/markets";
import type { ChartData, Quote } from "@/lib/data/types";
import MarketsNav from "@/components/markets/markets-nav";
import IndexHeroCard from "@/components/markets/index-hero-card";
import FeaturedChart from "@/components/markets/featured-chart";
import MoversBoard from "@/components/markets/movers-board";
import MiniBoard from "@/components/markets/mini-board";
import CalendarMini from "@/components/markets/calendar-mini";
import ExternalCard from "@/components/news/external-card";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Markets — Indrani",
  description:
    "Live markets overview: Indian and global indices, movers, currencies, commodities, crypto and today's economic calendar.",
  alternates: { canonical: "/markets" },
};

export default async function MarketsPage() {
  const chartSymbols = [...new Set([...HERO_INDICES, ...FEATURED_TABS.map((t) => t.symbol)])];
  const today = new Date().toISOString().slice(0, 10);

  const [quotesRes, gainersRes, losersRes, newsRes, calendarRes, ...chartResults] =
    await Promise.all([
      getQuotes([...HERO_INDICES, ...FX_MAJORS, ...COMMODITIES_MINI, ...CRYPTO_MINI]),
      getMovers("gainers"),
      getMovers("losers"),
      getNews({ category: "markets", limit: 8 }),
      getCalendar(today, today),
      ...chartSymbols.map((s) => getChart(s, "1d", "5m")),
    ]);

  const quotes = quotesRes.data ?? {};
  const charts: Record<string, ChartData | null> = {};
  chartSymbols.forEach((s, i) => {
    charts[s] = chartResults[i].data;
  });

  const heroes = HERO_INDICES.map((s) => quotes[s]).filter((q): q is Quote => Boolean(q));
  const news = newsRes.data ?? [];

  const asOf = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
        <p className="text-xs text-muted-foreground">as of {asOf} IST</p>
      </header>

      <MarketsNav active="" />

      {/* Overview band — docs/33 */}
      {heroes.length > 0 ? (
        <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {heroes.map((q) => (
            <IndexHeroCard key={q.symbol} quote={q} chart={charts[q.symbol] ?? null} />
          ))}
        </div>
      ) : (
        <p className="mb-10 py-4 text-sm text-muted-foreground">
          Index data is currently unavailable. Please try again shortly.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <FeaturedChart tabs={FEATURED_TABS} initial={charts} />

          <section aria-label="Markets news">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Markets news</h2>
            {news.length ? (
              <div className="space-y-4">
                {news.map((item) => (
                  <ExternalCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No markets headlines right now.</p>
            )}
          </section>
        </div>

        <aside className="space-y-10">
          <MoversBoard gainers={gainersRes.data ?? []} losers={losersRes.data ?? []} />
          <MiniBoard title="Currencies" symbols={FX_MAJORS.slice(0, 5)} quotes={quotes} nameFirst />
          <MiniBoard title="Commodities" symbols={COMMODITIES_MINI} quotes={quotes} nameFirst />
          <MiniBoard title="Crypto" symbols={CRYPTO_MINI} quotes={quotes} nameFirst />
          <CalendarMini events={calendarRes.data ?? []} />
        </aside>
      </div>
    </div>
  );
}
