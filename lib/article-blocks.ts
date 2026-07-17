/**
 * Article block content model — docs/28. Own articles store an ordered
 * ArticleBlock[] (jsonb); the renderer in components/news/article/blocks.tsx
 * maps each block to a component. Pure module (no server deps) so the wrap
 * generator and tests can build/inspect blocks without a DB.
 */

export type ArticleBlock =
  | { type: "p"; text: string } // supports inline [[SYMBOL]] ticker chips
  | { type: "h2"; text: string }
  | { type: "keyPoints"; items: string[] }
  | { type: "pullQuote"; text: string; attribution?: string }
  | { type: "chart"; symbol: string; title?: string }
  | { type: "image"; url: string; caption?: string; credit: string }
  | { type: "movers"; kind: "gainers" | "losers"; title?: string }
  | { type: "indexChips"; symbols: string[] };

export type ArticleType = "standard" | "live" | "wrap" | "feature" | "opinion";

/** Inline segment of a paragraph: plain text or a [[SYMBOL]] ticker chip. */
export type InlineSegment =
  | { kind: "text"; text: string }
  | { kind: "ticker"; symbol: string };

const INLINE_TICKER_RE = /\[\[([A-Z0-9.^=\-]{1,15})\]\]/g;

/** Split paragraph text into text/ticker segments ("[[AAPL]]" → chip). */
export function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_TICKER_RE)) {
    if (m.index > last) segments.push({ kind: "text", text: text.slice(last, m.index) });
    segments.push({ kind: "ticker", symbol: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", text: text.slice(last) });
  return segments;
}

/** Words across all readable block text (ticker markers count as one word). */
export function wordCount(blocks: ArticleBlock[]): number {
  let text = "";
  for (const b of blocks) {
    if (b.type === "p" || b.type === "h2" || b.type === "pullQuote") text += ` ${b.text}`;
    else if (b.type === "keyPoints") text += ` ${b.items.join(" ")}`;
  }
  return text.split(/\s+/).filter(Boolean).length;
}

/** Read time at ~220 wpm, minimum 1 minute. */
export function readMinutes(blocks: ArticleBlock[]): number {
  return Math.max(1, Math.round(wordCount(blocks) / 220));
}
