import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TtlCache } from "./cache";

describe("TtlCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns fresh entries within TTL", () => {
    const cache = new TtlCache<number>({ maxEntries: 10 });
    cache.set("a", 1, 1000);
    expect(cache.get("a")).toEqual({ value: 1, isStale: false });
  });

  it("marks entries stale after TTL but keeps them within maxStale", () => {
    const cache = new TtlCache<number>({ maxEntries: 10 });
    cache.set("a", 1, 1000, 5000);
    vi.advanceTimersByTime(2000);
    expect(cache.get("a")).toEqual({ value: 1, isStale: true });
  });

  it("drops entries past maxStale", () => {
    const cache = new TtlCache<number>({ maxEntries: 10 });
    cache.set("a", 1, 1000, 5000);
    vi.advanceTimersByTime(6001);
    expect(cache.get("a")).toBeNull();
  });

  it("evicts least-recently-used entries at capacity", () => {
    const cache = new TtlCache<number>({ maxEntries: 2 });
    cache.set("a", 1, 10_000);
    cache.set("b", 2, 10_000);
    cache.get("a"); // a is now most recent
    cache.set("c", 3, 10_000); // evicts b
    expect(cache.get("b")).toBeNull();
    expect(cache.get("a")).toEqual({ value: 1, isStale: false });
    expect(cache.get("c")).toEqual({ value: 3, isStale: false });
  });
});
