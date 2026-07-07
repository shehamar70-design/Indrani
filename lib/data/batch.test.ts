import { describe, it, expect, vi } from "vitest";
import { createBatcher } from "./batch";

describe("batch (docs/12 §2 — request coalescing)", () => {
  it("N symbols requested together → 1 upstream call", async () => {
    const upstream = vi.fn(async (symbols: string[]) =>
      Object.fromEntries(symbols.map((s) => [s, `q-${s}`])),
    );
    const batcher = createBatcher<string>({ fetchMany: upstream, windowMs: 5 });
    const [a, b, c] = await Promise.all([
      batcher.get("AAPL"),
      batcher.get("MSFT"),
      batcher.get("TSLA"),
    ]);
    expect(upstream).toHaveBeenCalledTimes(1);
    expect(upstream).toHaveBeenCalledWith(["AAPL", "MSFT", "TSLA"]);
    expect([a, b, c]).toEqual(["q-AAPL", "q-MSFT", "q-TSLA"]);
  });

  it("in-flight dedup: same symbol requested twice → resolved from one call", async () => {
    const upstream = vi.fn(async (symbols: string[]) =>
      Object.fromEntries(symbols.map((s) => [s, `q-${s}`])),
    );
    const batcher = createBatcher<string>({ fetchMany: upstream, windowMs: 5 });
    const [a, b] = await Promise.all([batcher.get("AAPL"), batcher.get("AAPL")]);
    expect(upstream).toHaveBeenCalledTimes(1);
    expect(upstream).toHaveBeenCalledWith(["AAPL"]);
    expect(a).toBe("q-AAPL");
    expect(b).toBe("q-AAPL");
  });

  it("missing symbol in upstream response → null for that symbol only", async () => {
    const upstream = async (symbols: string[]) =>
      Object.fromEntries(
        symbols.filter((s) => s !== "BAD").map((s) => [s, `q-${s}`]),
      );
    const batcher = createBatcher<string>({ fetchMany: upstream, windowMs: 5 });
    const [good, bad] = await Promise.all([
      batcher.get("AAPL"),
      batcher.get("BAD"),
    ]);
    expect(good).toBe("q-AAPL");
    expect(bad).toBeNull();
  });

  it("upstream failure rejects all waiters, then recovers on next window", async () => {
    let calls = 0;
    const upstream = async (symbols: string[]) => {
      calls++;
      if (calls === 1) throw new Error("boom");
      return Object.fromEntries(symbols.map((s) => [s, `q-${s}`]));
    };
    const batcher = createBatcher<string>({ fetchMany: upstream, windowMs: 5 });
    await expect(batcher.get("AAPL")).rejects.toThrow("boom");
    await expect(batcher.get("AAPL")).resolves.toBe("q-AAPL");
  });
});
