/**
 * Markets Wrap auto-generator — docs/28 layout C, user answer 3. Builds a
 * daily wrap article from REAL quotes only: templated sentences around actual
 * numbers, sections skipped entirely when their data is unavailable (docs/18
 * §2 — never invent). Pure module; DB/fetch composition lives in
 * lib/articles.ts so this stays testable without network.
 */

import type { Quote } from "@/lib/data/types";
import type { ArticleBlock } from "@/lib/article-blocks";
import { formatPrice, formatPercentPoints } from "@/lib/format";

export const WRAP_SECTIONS: { heading: string; symbols: string[] }[] = [
  { heading: "Stocks", symbols: ["^GSPC", "^DJI", "^IXIC", "^NSEI", "^BSESN"] },
  { heading: "Bonds & Rates", symbols: ["^TNX"] },
  { heading: "Currencies", symbols: ["USDINR=X", "EURUSD=X", "GBPUSD=X"] },
  { heading: "Commodities", symbols: ["CL=F", "GC=F", "SI=F"] },
  { heading: "Crypto", symbols: ["BTC-USD", "ETH-USD"] },
];

export const WRAP_SYMBOLS = WRAP_SECTIONS.flatMap((s) => s.symbols);

/** Chips shown in the wrap header. */
export const WRAP_CHIP_SYMBOLS = ["^GSPC", "^NSEI", "^TNX", "USDINR=X", "GC=F", "BTC-USD"];

function verb(changePercent: number): string {
  const abs = Math.abs(changePercent);
  if (changePercent >= 0) {
    if (abs < 0.05) return "was little changed at";
    return abs >= 1.5 ? "jumped to" : abs >= 0.5 ? "rose to" : "edged up to";
  }
  if (abs < 0.05) return "was little changed at";
  return abs >= 1.5 ? "tumbled to" : abs >= 0.5 ? "fell to" : "slipped to";
}

/** One sentence per quote — real numbers only. */
export function quoteSentence(q: Quote): string {
  const name = q.shortName ?? q.symbol;
  return `${name} ([[${q.symbol}]]) ${verb(q.changePercent)} ${formatPrice(q.price)}, ${
    q.changePercent >= 0 ? "up" : "down"
  } ${formatPercentPoints(Math.abs(q.changePercent))} on the day.`;
}

export interface WrapContent {
  title: string;
  dek: string;
  blocks: ArticleBlock[];
}

/**
 * Assemble the wrap from whatever real quotes arrived. Returns null when no
 * usable index quote exists — a wrap with no market data must not exist.
 */
export function buildWrapContent(
  quotes: Record<string, Quote>,
  dateLabel: string,
): WrapContent | null {
  const lead = quotes["^GSPC"] ?? quotes["^NSEI"] ?? quotes["^DJI"];
  if (!lead) return null;

  const leadName = lead.shortName ?? lead.symbol;
  const up = lead.changePercent >= 0;
  const title = `Markets Wrap: ${leadName} ${up ? "gains" : "slips"} ${formatPercentPoints(
    Math.abs(lead.changePercent),
  )} — ${dateLabel}`;
  const dek = `A data-driven tour of the session: stocks, rates, currencies, commodities and crypto as of the latest prices.`;

  const blocks: ArticleBlock[] = [
    { type: "indexChips", symbols: WRAP_CHIP_SYMBOLS.filter((s) => quotes[s]) },
  ];

  const keyPoints = WRAP_SECTIONS.map((s) => quotes[s.symbols[0]])
    .filter((q): q is Quote => Boolean(q))
    .slice(0, 3)
    .map((q) => quoteSentence(q));
  if (keyPoints.length > 0) blocks.push({ type: "keyPoints", items: keyPoints });

  for (const section of WRAP_SECTIONS) {
    const present = section.symbols
      .map((s) => quotes[s])
      .filter((q): q is Quote => Boolean(q));
    if (present.length === 0) continue; // unavailable → section omitted, never faked
    blocks.push({ type: "h2", text: section.heading });
    blocks.push({ type: "p", text: present.map((q) => quoteSentence(q)).join(" ") });
    if (section.heading === "Stocks") {
      blocks.push({ type: "chart", symbol: present[0].symbol, title: `${present[0].shortName ?? present[0].symbol} — today` });
      blocks.push({ type: "movers", kind: "gainers", title: "Top gainers" });
      blocks.push({ type: "movers", kind: "losers", title: "Top losers" });
    }
  }

  return { title, dek, blocks };
}
