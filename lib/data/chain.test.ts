import { afterEach, describe, expect, it, vi } from "vitest";
import { getQuotes, getChart } from "./chain";
import { quoteCache, chartCache } from "./cache";
import { resetBreakers } from "./safe-fetch";
import type { Quote } from "./types";

vi.mock("./providers/yahoo", () => ({
  yahooQuotes: vi.fn(),
  yahooChart: vi.fn(),
  yahooSearch: vi.fn(),
  yahooFundamentals: vi.fn(),
}));
vi.mock("./providers/finnhub", () => ({ finnhubQuotes: vi.fn() }));
vi.mock("./providers/binance", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./providers/binance")>()),
  binanceQuotes: vi.fn(),
  binanceChart: vi.fn(),
}));

import { yahooQuotes, yahooChart } from "./providers/yahoo";
import { finnhubQuotes } from "./providers/finnhub";
import { binanceQuotes } from "./providers/binance";

const quote = (symbol: string, price: number): Quote => ({
  symbol,
  price,
  change: 0,
  changePercent: 0,
  meta: { source: "yahoo", fetchedAt: new Date().toISOString(), isStale: false },
});

afterEach(() => {
  quoteCache.clear();
  chartCache.clear();
  resetBreakers();
  vi.clearAllMocks();
});

describe("getQuotes", () => {
  it("routes equities to yahoo and crypto to binance", async () => {
    vi.mocked(yahooQuotes).mockResolvedValue({ AAPL: quote("AAPL", 300) });
    vi.mocked(binanceQuotes).mockResolvedValue({ "BTC-USD": quote("BTC-USD", 60000) });

    const r = await getQuotes(["AAPL", "BTC-USD"]);
    expect(r.data?.AAPL.price).toBe(300);
    expect(r.data?.["BTC-USD"].price).toBe(60000);
    expect(vi.mocked(yahooQuotes)).toHaveBeenCalledWith(["AAPL"]);
    expect(vi.mocked(binanceQuotes)).toHaveBeenCalledWith(["BTC-USD"]);
  });

  it("falls back to finnhub when yahoo fails", async () => {
    vi.mocked(yahooQuotes).mockRejectedValue(new Error("yahoo down"));
    vi.mocked(finnhubQuotes).mockResolvedValue({ AAPL: quote("AAPL", 301) });

    const r = await getQuotes(["AAPL"]);
    expect(r.data?.AAPL.price).toBe(301);
  });

  it("returns UNAVAILABLE (data null) when every source fails and no cache", async () => {
    vi.mocked(yahooQuotes).mockRejectedValue(new Error("down"));
    vi.mocked(finnhubQuotes).mockRejectedValue(new Error("down"));

    const r = await getQuotes(["AAPL"]);
    expect(r.data).toBeNull();
    expect(r.error).toBeTruthy();
  });

  it("serves stale cache marked isStale when sources fail after a success", async () => {
    vi.mocked(yahooQuotes).mockResolvedValueOnce({ AAPL: quote("AAPL", 300) });
    await getQuotes(["AAPL"]);

    vi.useFakeTimers();
    vi.advanceTimersByTime(20_000); // past 15s TTL, inside 15-min max-stale
    vi.mocked(yahooQuotes).mockRejectedValue(new Error("down"));
    vi.mocked(finnhubQuotes).mockRejectedValue(new Error("down"));
    const r = await getQuotes(["AAPL"]);
    vi.useRealTimers();

    expect(r.data?.AAPL.price).toBe(300);
    expect(r.meta?.isStale).toBe(true);
  });
});

describe("getChart", () => {
  it("wraps candles in ChartData with meta", async () => {
    vi.mocked(yahooChart).mockResolvedValue([
      { time: 1, open: 1, high: 2, low: 0.5, close: 1.5 },
    ]);
    const r = await getChart("AAPL", "1mo", "1d");
    expect(r.data?.candles).toHaveLength(1);
    expect(r.data?.symbol).toBe("AAPL");
    expect(r.data?.meta.source).toBe("yahoo");
  });
});
