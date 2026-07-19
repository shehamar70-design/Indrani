/**
 * Movers direction/order tests — docs/44 §1.2. Yahoo's day_gainers/day_losers
 * screener rows arrive unfiltered and unsorted (observed 07-13: −7.9% names
 * inside Gainers; 07-17: unsorted either way). The provider must enforce
 * sign-purity and ordering itself — never trust Yahoo's ordering.
 */

import { describe, expect, it } from "vitest";
import { enforceMoverOrder } from "./providers/yahoo";
import type { Quote } from "./types";

const q = (symbol: string, changePercent: number): Quote => ({
  symbol,
  price: 100,
  change: changePercent,
  changePercent,
  meta: { source: "yahoo", fetchedAt: "2026-07-18T00:00:00.000Z", isStale: false },
});

describe("enforceMoverOrder", () => {
  it("gainers: drops non-positive rows and sorts descending", () => {
    const rows = [q("A", 7.92), q("B", -7.9), q("C", 12.67), q("D", 0), q("E", 9.74)];
    const out = enforceMoverOrder("gainers", rows);
    expect(out.map((r) => r.symbol)).toEqual(["C", "E", "A"]);
    expect(out.every((r) => r.changePercent > 0)).toBe(true);
  });

  it("losers: drops non-negative rows and sorts ascending (worst first)", () => {
    const rows = [q("A", 2.5), q("B", -11.0), q("C", -0.4), q("D", -7.9), q("E", 0)];
    const out = enforceMoverOrder("losers", rows);
    expect(out.map((r) => r.symbol)).toEqual(["B", "D", "C"]);
    expect(out.every((r) => r.changePercent < 0)).toBe(true);
  });

  it("actives: passes rows through untouched (volume list, mixed signs valid)", () => {
    const rows = [q("A", -1), q("B", 2)];
    expect(enforceMoverOrder("actives", rows)).toEqual(rows);
  });

  it("empty input stays empty — no fabricated rows ever", () => {
    expect(enforceMoverOrder("gainers", [])).toEqual([]);
    expect(enforceMoverOrder("losers", [])).toEqual([]);
  });
});
