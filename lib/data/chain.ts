/**
 * chain.ts — typed fallback chains per data type. docs/12 §2–3.
 * The ONLY entry point route handlers use; no component/route calls a provider directly.
 * Ordering: crypto → binance first, else yahoo → finnhub. Everything through safeFetch.
 */

import { safeFetch } from "./safe-fetch";
import {
  quoteCache,
  chartCache,
  newsCache,
  searchCache,
  macroCache,
  fxCache,
  TtlCache,
} from "./cache";
import type {
  CalendarEvent,
  ChainResult,
  ChartData,
  Fundamentals,
  NewsItem,
  Quote,
  SearchResult,
  FxRates,
} from "./types";
import { yahooChart, yahooFundamentals, yahooMovers, yahooQuotes, yahooSearch, type MoverKind } from "./providers/yahoo";
import { finnhubQuotes } from "./providers/finnhub";
import { binanceChart, binanceQuotes, isCryptoSymbol } from "./providers/binance";
import { fredCalendar } from "./providers/fred";
import { frankfurterRates } from "./providers/fx";
import { fetchFeeds, FEEDS, yahooTickerFeed } from "./providers/rss";

/** TTLs per docs/12 §3. */
const TTL = {
  quotesOpen: 15_000,
  quotesMaxStale: 15 * 60_000, // quotes max-stale window: 15 min
  intradayChart: 30_000,
  dailyChart: 10 * 60_000,
  fundamentals: 24 * 3600_000,
  news: 5 * 60_000,
  calendar: 3600_000,
  fx: 60_000,
  search: 3600_000,
} as const;

const INTRADAY = new Set(["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h"]);

/**
 * Batched quotes. The symbol set is split crypto/non-crypto so Binance leads
 * for crypto while Yahoo leads for everything else; results are merged and
 * the worst (stalest) meta wins so the UI never over-promises freshness.
 */
export async function getQuotes(
  symbols: string[],
): Promise<ChainResult<Record<string, Quote>>> {
  const unique = [...new Set(symbols)];
  const crypto = unique.filter(isCryptoSymbol);
  const rest = unique.filter((s) => !isCryptoSymbol(s));
  const cache = quoteCache as TtlCache<Record<string, Quote>>;

  const parts = await Promise.all([
    rest.length
      ? safeFetch<Record<string, Quote>>({
          key: `quotes:${rest.sort().join(",")}`,
          cache,
          ttlMs: TTL.quotesOpen,
          maxStaleMs: TTL.quotesMaxStale,
          sources: [
            { name: "yahoo", fn: () => yahooQuotes(rest) },
            { name: "finnhub", fn: () => finnhubQuotes(rest) },
          ],
        })
      : null,
    crypto.length
      ? safeFetch<Record<string, Quote>>({
          key: `quotes:${crypto.sort().join(",")}`,
          cache,
          ttlMs: TTL.quotesOpen,
          maxStaleMs: TTL.quotesMaxStale,
          sources: [
            { name: "binance", fn: () => binanceQuotes(crypto) },
            { name: "yahoo", fn: () => yahooQuotes(crypto) },
          ],
        })
      : null,
  ]);

  const data: Record<string, Quote> = {};
  let meta: ChainResult<unknown>["meta"] = null;
  const errors: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.data) Object.assign(data, part.data);
    if (part.error) errors.push(part.error);
    // stalest meta wins
    if (part.meta && (!meta || part.meta.isStale)) meta = part.meta;
  }
  if (Object.keys(data).length === 0)
    return { data: null, meta: null, error: errors.join("; ") || "no data" };
  return { data, meta, error: errors.length ? errors.join("; ") : undefined };
}

export async function getChart(
  symbol: string,
  range: string,
  interval: string,
): Promise<ChainResult<ChartData>> {
  const ttlMs = INTRADAY.has(interval) ? TTL.intradayChart : TTL.dailyChart;
  const sources = isCryptoSymbol(symbol)
    ? [
        { name: "binance" as const, fn: () => binanceChart(symbol, interval) },
        { name: "yahoo" as const, fn: () => yahooChart(symbol, range, interval) },
      ]
    : [{ name: "yahoo" as const, fn: () => yahooChart(symbol, range, interval) }];

  const result = await safeFetch({
    key: `chart:${symbol}:${range}:${interval}`,
    cache: chartCache as TtlCache<ChartData["candles"]>,
    ttlMs,
    sources,
  });
  if (!result.data)
    return { data: null, meta: null, error: result.error };
  return {
    data: { symbol, range, interval, candles: result.data, meta: result.meta! },
    meta: result.meta,
    error: result.error,
  };
}

export async function getFundamentals(
  symbol: string,
): Promise<ChainResult<Fundamentals>> {
  return safeFetch({
    key: `fund:${symbol}`,
    cache: macroCache as TtlCache<Fundamentals>,
    ttlMs: TTL.fundamentals,
    sources: [{ name: "yahoo", fn: () => yahooFundamentals(symbol) }],
  });
}

export async function getNews(opts: {
  category?: string;
  symbol?: string;
  limit?: number;
}): Promise<ChainResult<NewsItem[]>> {
  const { category, symbol, limit = 50 } = opts;
  const key = symbol ? `news:sym:${symbol}` : `news:cat:${category ?? "all"}`;
  const result = await safeFetch({
    key,
    cache: newsCache as TtlCache<NewsItem[]>,
    ttlMs: TTL.news,
    timeoutMs: 8_000, // multi-feed fan-out needs more than the 3s default
    sources: [
      {
        name: "rss",
        fn: async () => {
          const items = symbol
            ? await fetchFeeds([yahooTickerFeed(symbol)])
            : await fetchFeeds(
                category && category !== "all"
                  ? FEEDS.filter((f) => f.category === category)
                  : FEEDS,
              );
          if (items.length === 0) throw new Error("no items"); // empty = failure → try cache
          return items;
        },
      },
    ],
  });
  if (!result.data) return result;
  return { ...result, data: result.data.slice(0, limit) };
}

export async function getSearch(
  query: string,
): Promise<ChainResult<SearchResult[]>> {
  return safeFetch({
    key: `search:${query.toLowerCase()}`,
    cache: searchCache as TtlCache<SearchResult[]>,
    ttlMs: TTL.search,
    sources: [{ name: "yahoo", fn: () => yahooSearch(query) }],
  });
}

export async function getFx(base: string): Promise<ChainResult<FxRates>> {
  return safeFetch({
    key: `fx:${base}`,
    cache: fxCache as TtlCache<FxRates>,
    ttlMs: TTL.fx,
    sources: [{ name: "frankfurter", fn: () => frankfurterRates(base) }],
  });
}

export async function getCalendar(
  from: string,
  to: string,
): Promise<ChainResult<CalendarEvent[]>> {
  return safeFetch({
    key: `cal:${from}:${to}`,
    cache: macroCache as TtlCache<CalendarEvent[]>,
    ttlMs: TTL.calendar,
    sources: [{ name: "fred", fn: () => fredCalendar(from, to) }],
  });
}

export async function getMovers(kind: MoverKind): Promise<ChainResult<Quote[]>> {
  return safeFetch({
    key: `movers:${kind}`,
    cache: quoteCache as TtlCache<Quote[]>,
    ttlMs: 60_000, // movers list churns slowly; 1-min TTL balances freshness vs Yahoo load
    sources: [{ name: "yahoo", fn: () => yahooMovers(kind) }],
  });
}
