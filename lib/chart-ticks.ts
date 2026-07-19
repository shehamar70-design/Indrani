/**
 * Chart tick-label formatting — docs/44 §1.1. Extracted from RangeChart so
 * labels are pure and unit-testable. The old tickLabel left timeZone unset,
 * so Vercel (UTC) and an IST browser rendered different text for the same
 * candle → React hydration mismatch → every chart tab dead. Labels here are
 * pinned to the symbol's exchange timezone: identical output on server and
 * client regardless of environment TZ.
 */

/** Exchange session timezone by symbol convention (default: US listings). */
export function symbolTimeZone(symbol: string): string {
  const s = symbol.toUpperCase();
  if (s.endsWith(".NS") || s.endsWith(".BO") || s === "^NSEI" || s === "^BSESN" || s === "^NSEBANK")
    return "Asia/Kolkata"; // NSE/BSE sessions
  if (s.endsWith("-USD") || s.endsWith("=X") || s.endsWith("=F") || s === "^TNX")
    return "UTC"; // 24h markets: crypto, FX, futures, yields
  if (s.endsWith(".L")) return "Europe/London";
  if (s.endsWith(".T")) return "Asia/Tokyo";
  if (s.endsWith(".HK")) return "Asia/Hong_Kong";
  return "America/New_York"; // NYSE/Nasdaq + US indices
}

/** Deterministic axis label for a candle time (unix seconds) at a given range. */
export function tickLabel(time: number, range: string, timeZone: string): string {
  const d = new Date(time * 1000);
  if (range === "1d" || range === "5d")
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone });
  if (range === "5y" || range === "max")
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone });
}
