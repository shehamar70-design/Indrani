import { describe, it, expect, vi, beforeEach } from "vitest";
import { safeFetch, resetBreakers } from "./safe-fetch";
import { TtlCache } from "./cache";

describe("safeFetch (docs/19 critical tests 1-3)", () => {
  beforeEach(() => {
    resetBreakers();
  });

  it("1. primary fails → secondary used → source recorded", async () => {
    const cache = new TtlCache<string>({ maxEntries: 10 });
    const result = await safeFetch<string>({
      key: "t1",
      cache,
      ttlMs: 1000,
      sources: [
        {
          name: "yahoo",
          fn: async () => {
            throw new Error("yahoo down");
          },
        },
        { name: "finnhub", fn: async () => "from-finnhub" },
      ],
    });
    expect(result.data).toBe("from-finnhub");
    expect(result.meta?.source).toBe("finnhub");
    expect(result.meta?.isStale).toBe(false);
  });

  it("2. both fail + cache exists → stale=true returned", async () => {
    const cache = new TtlCache<string>({ maxEntries: 10 });
    // seed the cache via a successful call
    await safeFetch<string>({
      key: "t2",
      cache,
      ttlMs: 0, // expires immediately → next read is stale
      maxStaleMs: 60_000,
      sources: [{ name: "yahoo", fn: async () => "cached-value" }],
    });
    const fail = async (): Promise<string> => {
      throw new Error("down");
    };
    const result = await safeFetch<string>({
      key: "t2",
      cache,
      ttlMs: 0,
      maxStaleMs: 60_000,
      sources: [
        { name: "yahoo", fn: fail },
        { name: "finnhub", fn: fail },
      ],
    });
    expect(result.data).toBe("cached-value");
    expect(result.meta?.isStale).toBe(true);
    expect(result.meta?.source).toBe("cache");
  });

  it("3. both fail + no cache → data=null, never throws", async () => {
    const cache = new TtlCache<string>({ maxEntries: 10 });
    const fail = async (): Promise<string> => {
      throw new Error("down");
    };
    const result = await safeFetch<string>({
      key: "t3",
      cache,
      ttlMs: 1000,
      sources: [
        { name: "yahoo", fn: fail },
        { name: "finnhub", fn: fail },
      ],
    });
    expect(result.data).toBeNull();
    expect(result.meta).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it("serves fresh cache without calling any source", async () => {
    const cache = new TtlCache<string>({ maxEntries: 10 });
    const spy = vi.fn(async () => "v1");
    const opts = {
      key: "t4",
      cache,
      ttlMs: 60_000,
      sources: [{ name: "yahoo" as const, fn: spy }],
    };
    await safeFetch<string>(opts);
    const second = await safeFetch<string>(opts);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(second.data).toBe("v1");
    expect(second.meta?.isStale).toBe(false);
  });

  it("times out slow providers (3s) and falls through", async () => {
    vi.useFakeTimers();
    const cache = new TtlCache<string>({ maxEntries: 10 });
    const slow = () =>
      new Promise<string>((resolve) => setTimeout(() => resolve("late"), 10_000));
    const p = safeFetch<string>({
      key: "t5",
      cache,
      ttlMs: 1000,
      timeoutMs: 3000,
      sources: [
        { name: "yahoo", fn: slow },
        { name: "finnhub", fn: async () => "fast" },
      ],
    });
    await vi.advanceTimersByTimeAsync(3001);
    const result = await p;
    expect(result.data).toBe("fast");
    expect(result.meta?.source).toBe("finnhub");
    vi.useRealTimers();
  });

  it("circuit breaker: 5 consecutive failures → provider skipped for 60s", async () => {
    const cache = new TtlCache<string>({ maxEntries: 10 });
    const failing = vi.fn(async (): Promise<string> => {
      throw new Error("down");
    });
    const good = async () => "ok";
    for (let i = 0; i < 5; i++) {
      await safeFetch<string>({
        key: `b${i}`,
        cache,
        ttlMs: 1000,
        sources: [
          { name: "yahoo", fn: failing },
          { name: "finnhub", fn: good },
        ],
      });
    }
    expect(failing).toHaveBeenCalledTimes(5);
    // 6th call: breaker open, yahoo must be skipped entirely
    await safeFetch<string>({
      key: "b6",
      cache,
      ttlMs: 1000,
      sources: [
        { name: "yahoo", fn: failing },
        { name: "finnhub", fn: good },
      ],
    });
    expect(failing).toHaveBeenCalledTimes(5);
  });
});
