import { afterEach, describe, expect, it, vi } from "vitest";
import {
  _reset,
  activeSymbols,
  pollOnce,
  register,
  unregister,
} from "./quote-poller";

afterEach(() => {
  _reset();
  vi.unstubAllGlobals();
});

describe("quote-poller registry", () => {
  it("refcounts symbols across register/unregister", () => {
    register(["AAPL", "BTC-USD"]);
    register(["AAPL"]);
    expect(activeSymbols()).toEqual(["AAPL", "BTC-USD"]);
    unregister(["AAPL"]);
    expect(activeSymbols()).toEqual(["AAPL", "BTC-USD"]); // still held once
    unregister(["AAPL", "BTC-USD"]);
    expect(activeSymbols()).toEqual([]);
  });

  it("pollOnce issues ONE batched call for all active symbols", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { AAPL: { symbol: "AAPL", price: 100 } },
        meta: { source: "yahoo", fetchedAt: "x", isStale: false },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    register(["AAPL", "^NSEI"]); // register triggers the initial poll
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain(
      encodeURIComponent("AAPL,^NSEI"),
    );
  });

  it("survives a failed fetch without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    register(["AAPL"]);
    await expect(pollOnce()).resolves.toBeUndefined();
  });
});
