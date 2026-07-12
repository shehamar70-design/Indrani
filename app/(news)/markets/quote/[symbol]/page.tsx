/**
 * Public quote page — docs/04 §2. Server component, ISR 60s; live price is
 * the only client-polled element. Unknown symbol → not-found. Known symbol
 * with all sources down → explicit unavailable state (docs/18 §2).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuotes, getChart, getFundamentals, getNews } from "@/lib/data/chain";
import { findSymbol, relatedSymbols } from "@/lib/symbols";
import { formatPrice, formatPercentPoints } from "@/lib/format";
import QuoteHeader from "@/components/markets/quote-header";
import RangeChart from "@/components/markets/range-chart";
import StatsGrid from "@/components/markets/stats-grid";
import ExternalCard from "@/components/news/external-card";

export const revalidate = 60;

const TICKER_RE = /^[A-Z0-9.^=\-]{1,15}$/;

function parseSymbol(raw: string): string | null {
  const symbol = decodeURIComponent(raw).toUpperCase();
  return TICKER_RE.test(symbol) ? symbol : null;
}

type Props = { params: Promise<{ symbol: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const symbol = parseSymbol((await params).symbol);
  if (!symbol) return { title: "Symbol not found — Indrani Markets" };
  const entry = findSymbol(symbol);
  const quote = (await getQuotes([symbol])).data?.[symbol];
  const name = entry?.name ?? quote?.shortName ?? symbol;
  const price = quote
    ? ` — ${formatPrice(quote.price)} (${formatPercentPoints(quote.changePercent)})`
    : "";
  return {
    title: `${name} (${symbol}) Stock Price & News — Indrani Markets`,
    description: `Live ${name} (${symbol}) price${price}, charts, key statistics and latest news on Indrani Markets.`,
    openGraph: {
      title: `${name} (${symbol})${price}`,
      description: `Live price, charts, key statistics and news for ${name}.`,
    },
    alternates: { canonical: `/markets/quote/${encodeURIComponent(symbol)}` },
  };
}

export default async function QuotePage({ params }: Props) {
  const symbol = parseSymbol((await params).symbol);
  if (!symbol) notFound();

  const entry = findSymbol(symbol);
  const type = entry?.type;
  const wantsFundamentals = !type || type === "EQUITY" || type === "ETF";
  const related = relatedSymbols(symbol);

  const [quotesRes, chartRes, fundRes, newsRes, relatedRes] = await Promise.all([
    getQuotes([symbol]),
    getChart(symbol, "1d", "5m"),
    wantsFundamentals ? getFundamentals(symbol) : Promise.resolve(null),
    getNews({ symbol, limit: 6 }),
    related.length ? getQuotes(related.map((r) => r.symbol)) : Promise.resolve(null),
  ]);

  const quote = quotesRes.data?.[symbol];
  // Symbol neither in our directory nor known to any provider → 404.
  if (!quote && !entry) notFound();

  const news = newsRes.data ?? [];
  const relatedQuotes = relatedRes?.data ?? {};

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: entry?.name ?? quote?.shortName ?? symbol,
    tickerSymbol: symbol,
    ...(quote && {
      offers: { "@type": "Offer", price: quote.price, priceCurrency: quote.currency ?? "USD" },
    }),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* JSON-LD only; "<" escaped so provider strings can't close the script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {quote ? (
        <QuoteHeader quote={quote} entry={entry} />
      ) : (
        <header className="border-b border-border pb-5">
          <h1 className="text-2xl font-bold tracking-tight">{entry!.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {symbol} · {entry!.exchange}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Price data is currently unavailable. Please try again shortly.
          </p>
        </header>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <RangeChart symbol={symbol} initial={chartRes.data} />
          {quote && <StatsGrid quote={quote} fundamentals={fundRes?.data ?? null} />}
        </div>

        <aside className="space-y-10">
          <section aria-label={`${symbol} news`}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Latest news</h2>
            {news.length ? (
              <div className="space-y-4">
                {news.map((item) => (
                  <ExternalCard key={item.id} item={item} variant="compact" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent headlines for {symbol}.</p>
            )}
          </section>

          {related.length > 0 && (
            <section aria-label="Related symbols">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Related</h2>
              <ul className="divide-y divide-border">
                {related.map((r) => {
                  const rq = relatedQuotes[r.symbol];
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
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
