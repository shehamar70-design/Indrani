/**
 * Public quote page — docs/04 §2. Server component, ISR 60s; live price is
 * the only client-polled element. Unknown symbol → not-found. Known symbol
 * with all sources down → explicit unavailable state (docs/18 §2).
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getQuotes, getChart } from "@/lib/data/chain";
import { findSymbol, relatedSymbols } from "@/lib/symbols";
import { formatPrice, formatPercentPoints } from "@/lib/format";
import QuoteHeader from "@/components/markets/quote-header";
import RangeChart from "@/components/markets/range-chart";
import { StatsSection, NewsSection, RelatedSection } from "@/components/markets/quote-sections";

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

  // Only the header + chart block the first paint (docs/44 §1.8); the rest
  // streams behind Suspense so a slow fallback chain can't freeze the page.
  const [quotesRes, chartRes] = await Promise.all([
    getQuotes([symbol]),
    getChart(symbol, "1d", "5m"),
  ]);

  const quote = quotesRes.data?.[symbol];
  // Symbol neither in our directory nor known to any provider → 404.
  if (!quote && !entry) notFound();

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
          {quote && (
            <Suspense fallback={<div className="h-40 animate-pulse rounded bg-muted/40" aria-label="Loading key statistics" />}>
              <StatsSection quote={quote} wantsFundamentals={wantsFundamentals} />
            </Suspense>
          )}
        </div>

        <aside className="space-y-10">
          <section aria-label={`${symbol} news`}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Latest news</h2>
            <Suspense fallback={<div className="h-40 animate-pulse rounded bg-muted/40" aria-label="Loading news" />}>
              <NewsSection symbol={symbol} />
            </Suspense>
          </section>

          {related.length > 0 && (
            <section aria-label="Related symbols">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Related</h2>
              <Suspense fallback={<div className="h-32 animate-pulse rounded bg-muted/40" aria-label="Loading related symbols" />}>
                <RelatedSection symbol={symbol} />
              </Suspense>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
