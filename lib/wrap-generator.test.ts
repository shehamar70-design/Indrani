import { describe, expect, it } from "vitest";
import { buildWrapContent, quoteSentence } from "./wrap-generator";
import type { Quote } from "./data/types";

const meta = { source: "yahoo" as const, fetchedAt: new Date().toISOString(), isStale: false };

function q(symbol: string, price: number, changePercent: number, shortName?: string): Quote {
  return { symbol, shortName, price, change: (price * changePercent) / 100, changePercent, meta };
}

describe("quoteSentence", () => {
  it("embeds real numbers and a ticker chip marker", () => {
    const s = quoteSentence(q("^GSPC", 6412.34, 0.82, "S&P 500"));
    expect(s).toContain("[[^GSPC]]");
    expect(s).toContain("6,412.34");
    expect(s).toContain("up");
  });

  it("uses falling verbs for negative moves", () => {
    expect(quoteSentence(q("^NSEI", 24100, -1.8))).toContain("tumbled");
  });
});

describe("buildWrapContent", () => {
  it("returns null with no index data — never a data-free wrap", () => {
    expect(buildWrapContent({}, "July 13, 2026")).toBeNull();
    expect(buildWrapContent({ "GC=F": q("GC=F", 3300, 0.1) }, "July 13, 2026")).toBeNull();
  });

  it("omits sections whose data is missing", () => {
    const content = buildWrapContent({ "^GSPC": q("^GSPC", 6400, 0.5, "S&P 500") }, "July 13, 2026");
    expect(content).not.toBeNull();
    const h2 = content!.blocks.filter((b) => b.type === "h2").map((b) => (b as { text: string }).text);
    expect(h2).toEqual(["Stocks"]); // no FX/crypto quotes → no FX/crypto sections
    expect(content!.title).toContain("S&P 500");
  });

  it("includes movers and chart blocks under Stocks", () => {
    const content = buildWrapContent({ "^GSPC": q("^GSPC", 6400, 0.5, "S&P 500") }, "July 13, 2026");
    const types = content!.blocks.map((b) => b.type);
    expect(types).toContain("chart");
    expect(types.filter((t) => t === "movers")).toHaveLength(2);
  });
});
