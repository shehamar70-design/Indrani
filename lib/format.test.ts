import { describe, it, expect } from "vitest";
import { formatNumber, formatPrice, formatPercent, formatCompact } from "./format";

describe("formatPrice (docs/19 test 7)", () => {
  it("formats 1234.5 as 1,234.50", () => {
    expect(formatPrice(1234.5)).toBe("1,234.50");
  });
  it("returns em dash for null/undefined/NaN", () => {
    expect(formatPrice(null)).toBe("—");
    expect(formatPrice(undefined)).toBe("—");
    expect(formatPrice(NaN)).toBe("—");
  });
  it("uses Indian grouping when indian=true", () => {
    expect(formatPrice(1234567.8, { indian: true })).toBe("12,34,567.80");
  });
});

describe("formatPercent (docs/19 test 7)", () => {
  it("formats -0.0234 as -2.34%", () => {
    expect(formatPercent(-0.0234)).toBe("-2.34%");
  });
  it("formats positive with sign", () => {
    expect(formatPercent(0.0151)).toBe("+1.51%");
  });
  it("returns em dash for null", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatCompact", () => {
  it("international compact by default", () => {
    expect(formatCompact(1_230_000)).toBe("1.23M");
    expect(formatCompact(4_560_000_000)).toBe("4.56B");
  });
  it("lakh/crore when indian=true", () => {
    expect(formatCompact(12_345_678, { indian: true })).toBe("1.23 Cr");
    expect(formatCompact(456_000, { indian: true })).toBe("4.56 L");
    expect(formatCompact(-250_000, { indian: true })).toBe("-2.50 L");
  });
  it("small values fall back to plain grouping", () => {
    expect(formatCompact(950, { indian: true })).toBe("950");
  });
  it("returns em dash for null", () => {
    expect(formatCompact(null)).toBe("—");
  });
});

describe("formatNumber", () => {
  it("plain decimal with grouping", () => {
    expect(formatNumber(1234.5)).toBe("1,234.5");
  });
  it("indian grouping", () => {
    expect(formatNumber(1234567, { indian: true })).toBe("12,34,567");
  });
  it("returns em dash for null", () => {
    expect(formatNumber(null)).toBe("—");
  });
});
