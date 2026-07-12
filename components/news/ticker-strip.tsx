"use client";

/**
 * Site-wide ticker tape — docs/03 §1.2 + docs/33.
 * Marquee via CSS keyframes (list duplicated once for a seamless loop);
 * pause on hover/focus; prefers-reduced-motion gets a static scrollable row.
 * Failed symbols are omitted, never faked (docs/18 §2).
 */

import Link from "next/link";
import { useQuotes } from "@/lib/quote-poller";
import { formatPrice, formatPercentPoints } from "@/lib/format";
import type { Quote } from "@/lib/data/types";

/** docs/03 §1.2 instrument list. */
const TICKER_SYMBOLS = [
  "^GSPC", "^IXIC", "^DJI", "^NSEI", "^BSESN", "^FTSE", "^N225",
  "CL=F", "GC=F", "BTC-USD", "ETH-USD", "EURUSD=X", "USDINR=X", "^TNX",
];

const LABELS: Record<string, string> = {
  "^GSPC": "S&P 500", "^IXIC": "Nasdaq", "^DJI": "Dow", "^NSEI": "Nifty 50",
  "^BSESN": "Sensex", "^FTSE": "FTSE 100", "^N225": "Nikkei", "CL=F": "Crude",
  "GC=F": "Gold", "BTC-USD": "Bitcoin", "ETH-USD": "Ether",
  "EURUSD=X": "EUR/USD", "USDINR=X": "USD/INR", "^TNX": "US 10Y",
};

function TickerItem({ q }: { q: Quote }) {
  const up = q.change >= 0;
  return (
    <li className="shrink-0">
      <Link
        href={`/markets/quote/${encodeURIComponent(q.symbol)}`}
        className="flex items-baseline gap-1.5 px-3 text-xs hover:bg-muted"
      >
        <span className="font-semibold">{LABELS[q.symbol] ?? q.symbol}</span>
        <span className="font-mono text-muted-foreground">
          {formatPrice(q.price)}
        </span>
        <span className={`font-mono ${up ? "text-up" : "text-down"}`}>
          {up ? "▲" : "▼"} {formatPercentPoints(q.changePercent)}
        </span>
      </Link>
    </li>
  );
}

export default function TickerStrip() {
  const { quotes, meta } = useQuotes(TICKER_SYMBOLS);
  const live = TICKER_SYMBOLS.map((s) => quotes[s]).filter(Boolean) as Quote[];

  return (
    <div
      className="ticker-strip h-9 overflow-hidden border-b border-border bg-card"
      aria-label="Market ticker"
    >
      {live.length === 0 ? (
        <div className="flex h-full items-center px-4">
          <span className="h-3 w-64 animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <div className="ticker-viewport flex h-full items-center">
          {meta?.isStale && (
            <span className="z-10 mr-1 shrink-0 rounded bg-amber/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber">
              Delayed
            </span>
          )}
          <ul className="ticker-track flex items-center">
            {live.map((q) => (
              <TickerItem key={q.symbol} q={q} />
            ))}
          </ul>
          <ul className="ticker-track flex items-center" aria-hidden="true">
            {live.map((q) => (
              <TickerItem key={q.symbol} q={q} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
