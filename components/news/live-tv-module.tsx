"use client";

/**
 * LiveTVModule — docs/03 §1.8 + docs/34. No broadcast exists yet (Akash TV
 * is Phase 5), so this is the honest "Markets Now" preview: a live index
 * board on the shared 15s batched poller — real numbers, clearly labeled.
 * Symbols whose quotes fail render nothing (docs/18 §2).
 */

import { useQuotes } from "@/lib/quote-poller";
import { formatPrice, formatPercentPoints } from "@/lib/format";

const BOARD_SYMBOLS = ["^GSPC", "^IXIC", "^NSEI", "BTC-USD"];

export default function LiveTVModule() {
  const { quotes } = useQuotes(BOARD_SYMBOLS);
  const rows = BOARD_SYMBOLS.map((s) => quotes[s]).filter(Boolean);

  return (
    <section
      aria-label="Markets Now"
      className="mt-10 overflow-hidden rounded border border-border bg-[#0a0e1a] text-white"
    >
      <header className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-up)] opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-up)]" />
        </span>
        <h2 className="text-sm font-bold uppercase tracking-widest">Markets Now</h2>
        <span className="ml-auto text-xs text-white/50">
          Live board · Indrani TV arrives in a later phase
        </span>
      </header>
      <div className="grid min-h-20 grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
        {rows.length === 0 ? (
          <p className="col-span-full self-center px-5 py-6 text-center text-sm text-white/50">
            Loading live board…
          </p>
        ) : (
          rows.map((q) => {
            const up = q.changePercent >= 0;
            return (
              <div key={q.symbol} className="px-5 py-4">
                <p className="truncate text-xs font-semibold text-white/70">
                  {q.shortName ?? q.symbol}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums">{formatPrice(q.price)}</p>
                <p
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: up ? "var(--accent-up)" : "var(--accent-down)" }}
                >
                  {formatPercentPoints(q.changePercent)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
