import { describe, expect, it } from "vitest";
import { SYMBOLS, findSymbol, searchSymbols, relatedSymbols } from "./symbols";
import { VERTICALS, getVertical } from "./verticals";
import { NEWS_CATEGORIES } from "./data/providers/rss";

const TICKER_RE = /^[A-Z0-9.^=\-]{1,15}$/;

describe("symbol directory", () => {
  it("every symbol passes the API ticker regex (docs/18)", () => {
    for (const s of SYMBOLS) expect(s.symbol, s.name).toMatch(TICKER_RE);
  });

  it("has no duplicate symbols", () => {
    expect(new Set(SYMBOLS.map((s) => s.symbol)).size).toBe(SYMBOLS.length);
  });

  it("findSymbol is case-insensitive", () => {
    expect(findSymbol("aapl")?.name).toContain("Apple");
    expect(findSymbol("NOPE123")).toBeUndefined();
  });

  it("searchSymbols ranks symbol prefix over name substring", () => {
    const hits = searchSymbols("V");
    expect(hits[0].symbol).toBe("V"); // exact/prefix beats "Visa"-in-name style hits
    expect(searchSymbols("")).toEqual([]);
    expect(searchSymbols("reliance").some((s) => s.symbol === "RELIANCE.NS")).toBe(true);
  });

  it("relatedSymbols excludes self and matches sector or type", () => {
    const rel = relatedSymbols("AAPL");
    expect(rel.length).toBeGreaterThan(0);
    expect(rel.every((s) => s.symbol !== "AAPL" && s.sector === "Technology")).toBe(true);
    const relIdx = relatedSymbols("^GSPC");
    expect(relIdx.every((s) => s.type === "INDEX")).toBe(true);
  });
});

describe("vertical registry", () => {
  it("has 9 verticals with unique slugs", () => {
    expect(VERTICALS.length).toBe(9);
    expect(new Set(VERTICALS.map((v) => v.slug)).size).toBe(9);
  });

  it("every vertical category has a matching RSS feed category", () => {
    for (const v of VERTICALS) expect(NEWS_CATEGORIES, v.slug).toContain(v.category);
  });

  it("every snapshot symbol exists in the symbol directory", () => {
    for (const v of VERTICALS)
      for (const sym of v.snapshotSymbols) expect(findSymbol(sym), `${v.slug}:${sym}`).toBeDefined();
  });

  it("getVertical resolves slug", () => {
    expect(getVertical("crypto")?.name).toBe("Crypto");
    expect(getVertical("sports")).toBeUndefined();
  });
});
