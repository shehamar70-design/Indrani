/**
 * Core data types — docs/12 §2.
 * Every value the UI renders carries SourceMeta so data age is always visible.
 */

export type DataSource =
  | "yahoo"
  | "finnhub"
  | "binance"
  | "fred"
  | "frankfurter"
  | "rss"
  | "cache";

export interface SourceMeta {
  source: DataSource;
  fetchedAt: string; // ISO timestamp of the underlying fetch
  isStale: boolean; // true when served from cache past its TTL
}

export interface Quote {
  symbol: string;
  shortName?: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
  marketState?: "PRE" | "REGULAR" | "POST" | "CLOSED";
  previousClose?: number;
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  exchange?: string;
  quoteType?: string; // EQUITY | INDEX | CRYPTOCURRENCY | CURRENCY | FUTURE | ETF
  meta: SourceMeta;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface ChartData {
  symbol: string;
  range: string;
  interval: string;
  candles: Candle[];
  meta: SourceMeta;
}

export interface Fundamentals {
  symbol: string;
  peRatio?: number;
  forwardPE?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  sector?: string;
  industry?: string;
  description?: string;
  employees?: number;
  website?: string;
  meta: SourceMeta;
}

export interface NewsItem {
  id: string; // hash of url
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO
  category: string;
  symbols?: string[];
  imageUrl?: string;
  summary?: string;
}

export interface CalendarEvent {
  id: string;
  name: string;
  date: string; // ISO
  region: string;
  seriesId?: string;
  actual?: number | null;
  previous?: number | null;
  unit?: string;
}

export interface FxRates {
  base: string;
  date: string;
  rates: Record<string, number>;
  meta: SourceMeta;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
}

/** Result wrapper for the fallback chain — data is null only when every source and the cache failed. */
export interface ChainResult<T> {
  data: T | null;
  meta: SourceMeta | null;
  error?: string;
}
