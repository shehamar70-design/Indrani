/**
 * docs/44 §1.1 regression tests: tick labels must be identical regardless of
 * the environment timezone (the hydration-mismatch root cause). Node lets us
 * simulate "server UTC vs browser IST" by flipping process.env.TZ per call is
 * unreliable mid-process, so we assert against fixed expected strings — the
 * suite runs on UTC CI and IST-like dev boxes and must pass on both.
 */

import { describe, expect, it } from "vitest";
import { symbolTimeZone, tickLabel } from "./chart-ticks";

// 2026-07-17 09:15 IST NSE open == 03:45 UTC.
const NSE_OPEN = Date.UTC(2026, 6, 17, 3, 45) / 1000;

describe("symbolTimeZone", () => {
  it("maps NSE/BSE symbols to IST", () => {
    expect(symbolTimeZone("RELIANCE.NS")).toBe("Asia/Kolkata");
    expect(symbolTimeZone("TCS.BO")).toBe("Asia/Kolkata");
    expect(symbolTimeZone("^NSEI")).toBe("Asia/Kolkata");
    expect(symbolTimeZone("^BSESN")).toBe("Asia/Kolkata");
  });

  it("maps 24h markets to UTC and US listings to New York", () => {
    expect(symbolTimeZone("BTC-USD")).toBe("UTC");
    expect(symbolTimeZone("USDINR=X")).toBe("UTC");
    expect(symbolTimeZone("GC=F")).toBe("UTC");
    expect(symbolTimeZone("AAPL")).toBe("America/New_York");
    expect(symbolTimeZone("^GSPC")).toBe("America/New_York");
  });
});

describe("tickLabel is environment-TZ independent", () => {
  it("renders the NSE open as 9:15 AM IST wherever it runs", () => {
    expect(tickLabel(NSE_OPEN, "1d", symbolTimeZone("RELIANCE.NS"))).toBe("9:15 AM");
  });

  it("renders the same instant as 11:45 PM previous-day in New York", () => {
    expect(tickLabel(NSE_OPEN, "1d", "America/New_York")).toBe("11:45 PM");
  });

  it("pins date labels too (midnight-boundary candles can differ by a day)", () => {
    // 2026-01-01 00:30 IST == 2025-12-31 19:00 UTC: date differs by TZ.
    const t = Date.UTC(2025, 11, 31, 19, 0) / 1000;
    expect(tickLabel(t, "1mo", "Asia/Kolkata")).toBe("Jan 1");
    expect(tickLabel(t, "1mo", "America/New_York")).toBe("Dec 31");
    expect(tickLabel(t, "max", "Asia/Kolkata")).toBe("Jan 2026");
  });
});
