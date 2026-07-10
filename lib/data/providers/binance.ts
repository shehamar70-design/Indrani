/**
 * Binance public API provider — PRIMARY for crypto. docs/12 §1. No key needed.
 * Symbols arrive in Yahoo style ("BTC-USD") and are mapped to Binance pairs ("BTCUSDT").
 */

import type { Candle, Quote, SourceMeta } from "../types";

const BASE = "https://api.binance.com/api/v3";

const now = (): SourceMeta => ({
  source: "binance",
  fetchedAt: new Date().toISOString(),
  isStale: false,
});

/** "BTC-USD" → "BTCUSDT"; returns null when the symbol isn't crypto-shaped. */
export function toBinancePair(symbol: string): string | null {
  const m = /^([A-Z0-9]{2,10})-(USD|USDT)$/.exec(symbol);
  if (!m) return null;
  return `${m[1]}USDT`;
}

export function isCryptoSymbol(symbol: string): boolean {
  return toBinancePair(symbol) !== null;
}

interface Binance24h {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  prevClosePrice: string;
}

export async function binanceQuotes(
  symbols: string[],
): Promise<Record<string, Quote>> {
  const pairs = new Map<string, string>(); // binance pair → original symbol
  for (const s of symbols) {
    const p = toBinancePair(s);
    if (p) pairs.set(p, s);
  }
  if (pairs.size === 0) return {};

  const url = `${BASE}/ticker/24hr?symbols=${encodeURIComponent(
    JSON.stringify([...pairs.keys()]),
  )}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
  if (!res.ok) throw new Error(`binance ${res.status}`);
  const list = (await res.json()) as Binance24h[];

  const out: Record<string, Quote> = {};
  for (const t of list) {
    const original = pairs.get(t.symbol);
    if (!original) continue;
    const price = parseFloat(t.lastPrice);
    if (!price) continue;
    out[original] = {
      symbol: original,
      price,
      change: parseFloat(t.priceChange),
      changePercent: parseFloat(t.priceChangePercent),
      currency: "USD",
      marketState: "REGULAR", // crypto never closes
      previousClose: parseFloat(t.prevClosePrice) || undefined,
      open: parseFloat(t.openPrice) || undefined,
      dayHigh: parseFloat(t.highPrice) || undefined,
      dayLow: parseFloat(t.lowPrice) || undefined,
      volume: parseFloat(t.volume) || undefined,
      quoteType: "CRYPTOCURRENCY",
      meta: now(),
    };
  }
  return out;
}

const INTERVAL_MAP: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "1d": "1d",
  "1wk": "1w",
  "1mo": "1M",
};

export async function binanceChart(
  symbol: string,
  interval: string,
  limit = 500,
): Promise<Candle[]> {
  const pair = toBinancePair(symbol);
  if (!pair) throw new Error(`not a crypto symbol: ${symbol}`);
  const binanceInterval = INTERVAL_MAP[interval] ?? "1d";
  const res = await fetch(
    `${BASE}/klines?symbol=${pair}&interval=${binanceInterval}&limit=${limit}`,
    { signal: AbortSignal.timeout(2500) },
  );
  if (!res.ok) throw new Error(`binance ${res.status}`);
  const rows = (await res.json()) as [
    number, string, string, string, string, string, ...unknown[],
  ][];
  return rows.map((r) => ({
    time: Math.floor(r[0] / 1000),
    open: parseFloat(r[1]),
    high: parseFloat(r[2]),
    low: parseFloat(r[3]),
    close: parseFloat(r[4]),
    volume: parseFloat(r[5]),
  }));
}
