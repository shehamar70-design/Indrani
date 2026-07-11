/**
 * Yahoo Finance provider — PRIMARY for quotes/charts/search. docs/12 §1.
 * Unofficial API: server-side only, always called through safeFetch.
 */

import YahooFinance from "yahoo-finance2";
import type { Candle, Fundamentals, Quote, SearchResult, SourceMeta } from "../types";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

const now = (): Omit<SourceMeta, "isStale"> & { isStale: false } => ({
  source: "yahoo",
  fetchedAt: new Date().toISOString(),
  isStale: false,
});

function normalizeMarketState(state?: string): Quote["marketState"] {
  if (!state) return undefined;
  if (state.startsWith("PRE")) return "PRE";
  if (state === "REGULAR") return "REGULAR";
  if (state.startsWith("POST")) return "POST";
  return "CLOSED";
}

/** Batched quote fetch — the whole point of /api/quotes. Missing symbols are simply absent. */
export async function yahooQuotes(
  symbols: string[],
): Promise<Record<string, Quote>> {
  const results = await yf.quote(symbols);
  const list = Array.isArray(results) ? results : [results];
  const out: Record<string, Quote> = {};
  for (const r of list) {
    if (r.regularMarketPrice === undefined) continue; // no price = no quote, never fake it
    out[r.symbol] = {
      symbol: r.symbol,
      shortName: r.shortName ?? r.longName ?? undefined,
      price: r.regularMarketPrice,
      change: r.regularMarketChange ?? 0,
      changePercent: r.regularMarketChangePercent ?? 0,
      currency: r.currency ?? undefined,
      marketState: normalizeMarketState(r.marketState),
      previousClose: r.regularMarketPreviousClose ?? undefined,
      open: r.regularMarketOpen ?? undefined,
      dayHigh: r.regularMarketDayHigh ?? undefined,
      dayLow: r.regularMarketDayLow ?? undefined,
      volume: r.regularMarketVolume ?? undefined,
      marketCap: r.marketCap ?? undefined,
      fiftyTwoWeekHigh: r.fiftyTwoWeekHigh ?? undefined,
      fiftyTwoWeekLow: r.fiftyTwoWeekLow ?? undefined,
      exchange: r.fullExchangeName ?? r.exchange ?? undefined,
      quoteType: r.quoteType ?? undefined,
      meta: now(),
    };
  }
  return out;
}

const RANGE_MS: Record<string, number> = {
  "1d": 1 * 864e5,
  "5d": 5 * 864e5,
  "1mo": 31 * 864e5,
  "3mo": 92 * 864e5,
  "6mo": 184 * 864e5,
  "1y": 366 * 864e5,
  "2y": 731 * 864e5,
  "5y": 1827 * 864e5,
  "10y": 3653 * 864e5,
};

/** yahoo-finance2 v3 dropped the `range` chart option — derive period1 from it. */
function rangeToPeriod1(range: string): Date {
  if (range === "ytd") return new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));
  if (range === "max") return new Date(0);
  return new Date(Date.now() - (RANGE_MS[range] ?? RANGE_MS["1mo"]));
}

export async function yahooChart(
  symbol: string,
  range: string,
  interval: string,
): Promise<Candle[]> {
  const result = await yf.chart(symbol, {
    period1: rangeToPeriod1(range),
    interval: interval as never,
  });
  const candles: Candle[] = [];
  for (const q of result.quotes) {
    if (
      q.open == null ||
      q.high == null ||
      q.low == null ||
      q.close == null
    )
      continue;
    candles.push({
      time: Math.floor(new Date(q.date).getTime() / 1000),
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume ?? undefined,
    });
  }
  return candles;
}

export async function yahooSearch(query: string): Promise<SearchResult[]> {
  const result = await yf.search(query, { quotesCount: 10, newsCount: 0 });
  return result.quotes
    .filter(
      (q): q is typeof q & { symbol: string } =>
        "symbol" in q && typeof q.symbol === "string",
    )
    .map((q) => {
      const r = q as Record<string, unknown>;
      const str = (v: unknown): string | undefined =>
        typeof v === "string" && v ? v : undefined;
      return {
        symbol: q.symbol,
        name: str(r.shortname) ?? str(r.longname) ?? q.symbol,
        exchange: str(r.exchDisp),
        type: str(r.typeDisp),
      };
    });
}

export async function yahooFundamentals(symbol: string): Promise<Fundamentals> {
  const r = await yf.quoteSummary(symbol, {
    modules: ["summaryDetail", "assetProfile", "defaultKeyStatistics"],
  });
  const sd = r.summaryDetail;
  const ap = r.assetProfile;
  const ks = r.defaultKeyStatistics;
  return {
    symbol,
    peRatio: sd?.trailingPE ?? undefined,
    forwardPE: sd?.forwardPE ?? ks?.forwardPE ?? undefined,
    eps: ks?.trailingEps ?? undefined,
    dividendYield: sd?.dividendYield ?? undefined,
    beta: sd?.beta ?? undefined,
    sector: ap?.sector ?? undefined,
    industry: ap?.industry ?? undefined,
    description: ap?.longBusinessSummary ?? undefined,
    employees: ap?.fullTimeEmployees ?? undefined,
    website: ap?.website ?? undefined,
    meta: now(),
  };
}

const SCREENER_IDS = {
  gainers: "day_gainers",
  losers: "day_losers",
  actives: "most_actives",
} as const;

export type MoverKind = keyof typeof SCREENER_IDS;

export async function yahooMovers(kind: MoverKind, count = 25): Promise<Quote[]> {
  const result = await yf.screener({ scrIds: SCREENER_IDS[kind], count });
  const out: Quote[] = [];
  for (const r of result.quotes) {
    if (r.regularMarketPrice === undefined) continue;
    out.push({
      symbol: r.symbol,
      shortName: r.shortName ?? r.longName ?? undefined,
      price: r.regularMarketPrice,
      change: r.regularMarketChange ?? 0,
      changePercent: r.regularMarketChangePercent ?? 0,
      currency: r.currency ?? undefined,
      marketState: normalizeMarketState(r.marketState),
      volume: r.regularMarketVolume ?? undefined,
      marketCap: r.marketCap ?? undefined,
      exchange: r.fullExchangeName ?? r.exchange ?? undefined,
      quoteType: r.quoteType ?? undefined,
      meta: now(),
    });
  }
  return out;
}
