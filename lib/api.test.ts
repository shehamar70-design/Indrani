import { describe, it, expect } from "vitest";
import { tickerSchema, symbolsSchema, searchQuerySchema } from "./api";

describe("ticker validation (docs/19 test 4)", () => {
  it("rejects <script>", () => {
    expect(tickerSchema.safeParse("<script>").success).toBe(false);
  });
  it("rejects SQL injection attempt", () => {
    expect(tickerSchema.safeParse("AAPL; DROP").success).toBe(false);
  });
  it("rejects 20-char strings", () => {
    expect(tickerSchema.safeParse("A".repeat(20)).success).toBe(false);
  });
  it("accepts valid symbols", () => {
    for (const s of ["AAPL", "^NSEI", "BTC-USD", "BRK.B", "EURUSD=X"]) {
      expect(tickerSchema.safeParse(s).success).toBe(true);
    }
  });
});

describe("symbolsSchema", () => {
  it("splits, trims, uppercases, caps at 50", () => {
    const r = symbolsSchema.safeParse(" aapl , msft ");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual(["AAPL", "MSFT"]);
    expect(symbolsSchema.safeParse(Array(51).fill("AAPL").join(",")).success).toBe(false);
  });
  it("rejects empty input", () => {
    expect(symbolsSchema.safeParse("").success).toBe(false);
  });
});

describe("searchQuerySchema", () => {
  it("strips HTML and enforces max 100 chars", () => {
    const r = searchQuerySchema.safeParse("apple <b>inc</b>");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("apple inc");
    expect(searchQuerySchema.safeParse("x".repeat(101)).success).toBe(false);
  });
  it("rejects query that is only HTML", () => {
    expect(searchQuerySchema.safeParse("<script></script>").success).toBe(false);
  });
});
