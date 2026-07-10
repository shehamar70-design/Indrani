/**
 * Finnhub provider — SECONDARY quotes fallback. docs/12 §1. 60 req/min free tier.
 * Key stays server-side in FINNHUB_API_KEY.
 */

import type { Quote, SourceMeta } from "../types";

const BASE = "https://finnhub.io/api/v1";

function key(): string {
  const k = process.env.FINNHUB_API_KEY;
  if (!k) throw new Error("FINNHUB_API_KEY not set");
  return k;
}

const now = (): SourceMeta => ({
  source: "finnhub",
  fetchedAt: new Date().toISOString(),
  isStale: false,
});

interface FinnhubQuote {
  c: number; // current
  d: number | null; // change
  dp: number | null; // change percent
  h: number;
  l: number;
  o: number;
  pc: number; // previous close
  t: number;
}

/** Finnhub has no batch endpoint — fan out (bounded by the ≤50 route cap and 60/min limit). */
export async function finnhubQuotes(
  symbols: string[],
): Promise<Record<string, Quote>> {
  const k = key();
  const out: Record<string, Quote> = {};
  await Promise.all(
    symbols.map(async (symbol) => {
      const res = await fetch(
        `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${k}`,
        { signal: AbortSignal.timeout(2500) },
      );
      if (!res.ok) return;
      const q = (await res.json()) as FinnhubQuote;
      // Finnhub returns c=0 for unknown symbols — that is "no data", not a price.
      if (!q.c) return;
      out[symbol] = {
        symbol,
        price: q.c,
        change: q.d ?? q.c - q.pc,
        changePercent: q.dp ?? ((q.c - q.pc) / q.pc) * 100,
        previousClose: q.pc || undefined,
        open: q.o || undefined,
        dayHigh: q.h || undefined,
        dayLow: q.l || undefined,
        meta: now(),
      };
    }),
  );
  return out;
}
