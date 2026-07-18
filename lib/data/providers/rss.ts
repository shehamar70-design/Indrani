/**
 * RSS provider — multi-feed fetcher/parser/normalizer/dedup. docs/12 §5.
 * No keys. Feeds polled politely (5-min TTL lives in chain.ts, not here).
 * Summaries pass through sanitizeSummary — never render raw feed HTML (docs/19 test 8).
 */

import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";
import type { NewsItem } from "../types";

export interface FeedConfig {
  url: string;
  source: string;
  category: string;
  lang?: "en" | "hi";
}

/**
 * Feed list per docs/12 §1. Reuters dropped: its public RSS was discontinued —
 * a dead feed is just noise, and we never substitute fake content (docs/18 §2).
 */
export const FEEDS: FeedConfig[] = [
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC", category: "top" },
  { url: "https://www.cnbc.com/id/20910258/device/rss/rss.html", source: "CNBC", category: "markets" },
  { url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", source: "MarketWatch", category: "markets" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk", category: "crypto" },
  { url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms", source: "Economic Times", category: "india" },
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", source: "ET Markets", category: "markets" },
  { url: "https://feeds.bbci.co.uk/hindi/rss.xml", source: "BBC Hindi", category: "india", lang: "hi" },
  { url: "https://www.rbi.org.in/pressreleases_rss.xml", source: "RBI", category: "economy" },
  // Phase 2 vertical feeds (docs/04 §1) — all free/public RSS
  { url: "https://www.cnbc.com/id/19854910/device/rss/rss.html", source: "CNBC", category: "technology" },
  { url: "https://www.cnbc.com/id/10000113/device/rss/rss.html", source: "CNBC", category: "politics" },
  { url: "https://www.cnbc.com/id/10001054/device/rss/rss.html", source: "CNBC", category: "wealth" },
  { url: "https://www.cnbc.com/id/100370673/device/rss/rss.html", source: "CNBC", category: "opinion" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", source: "TechCrunch", category: "ai" },
  { url: "https://www.theguardian.com/environment/rss", source: "The Guardian", category: "green" },
];

/** Every category present in FEEDS + the ticker pseudo-category — single source for route validation. */
export const NEWS_CATEGORIES = [
  ...new Set(FEEDS.map((f) => f.category)),
  "ticker",
] as string[];

/** Yahoo per-ticker headlines feed (docs/12 §1). */
export function yahooTickerFeed(symbol: string): FeedConfig {
  return {
    url: `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`,
    source: "Yahoo Finance",
    category: "ticker",
  };
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  copy: "©",
  reg: "®",
  trade: "™",
};

/**
 * Decode HTML entities exactly once (docs/44 §1.7). Feeds double-encode and
 * sanitize-html re-encodes its output, so without this summaries render
 * literal "&amp;". Single-pass by design: never loops, so intentional
 * entity-looking text survives one level deep.
 */
export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      return Number.isNaN(code) || code < 0 || code > 0x10ffff
        ? match
        : String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/** Strip everything executable/embedded; keep readable, entity-decoded plain text only. */
export function sanitizeSummary(html: string): string {
  return decodeEntities(
    sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: "discard",
    }),
  )
    .replace(/\s+/g, " ")
    .trim();
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const asArray = (v: unknown): unknown[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

const rec = (v: unknown): Record<string, unknown> | undefined =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : undefined;

const text = (v: unknown): string | undefined => {
  if (typeof v === "string") return v.trim() || undefined;
  if (typeof v === "number") return String(v);
  // fast-xml-parser wraps nodes with attributes as { "#text": ... }
  if (v && typeof v === "object" && "#text" in v)
    return text((v as Record<string, unknown>)["#text"]);
  return undefined;
};

const hashId = (input: string): string =>
  createHash("sha256").update(input).digest("hex").slice(0, 16);

function toIso(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

interface RawEntry {
  title?: unknown;
  link?: unknown;
  pubDate?: unknown;
  updated?: unknown;
  published?: unknown;
  description?: unknown;
  summary?: unknown;
  enclosure?: unknown;
  "media:content"?: unknown;
  "media:thumbnail"?: unknown;
}

function entryLink(e: RawEntry): string | undefined {
  const direct = text(e.link);
  if (direct) return direct;
  // Atom: <link href="..."/> possibly repeated
  for (const l of asArray(e.link)) {
    const node = rec(l);
    if (!node) continue;
    const href = text(node["@_href"]);
    if (href && node["@_rel"] !== "self") return href;
  }
  return undefined;
}

function entryImage(e: RawEntry): string | undefined {
  for (const m of [e["media:content"], e["media:thumbnail"], e.enclosure]) {
    for (const n of asArray(m)) {
      const node = rec(n);
      if (!node) continue;
      const type = text(node["@_type"]);
      if (type && !type.startsWith("image/")) continue;
      const url = text(node["@_url"]);
      if (url) return url;
    }
  }
  return undefined;
}

/** Parse one RSS 2.0 / Atom document into normalized NewsItems. Malformed XML → []. */
export function parseFeed(xml: string, cfg: FeedConfig): NewsItem[] {
  let doc: Record<string, unknown>;
  try {
    doc = parser.parse(xml) as Record<string, unknown>;
  } catch {
    return [];
  }

  const rss = doc.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as RawEntry & { item?: unknown } | undefined;
  const feed = doc.feed as { entry?: unknown } | undefined;
  const entries = (
    channel ? asArray(channel.item) : asArray(feed?.entry)
  ) as RawEntry[];

  const items: NewsItem[] = [];
  for (const e of entries) {
    const title = text(e.title);
    const url = entryLink(e);
    if (!title || !url) continue; // unattributable item — never shown
    const publishedAt =
      toIso(text(e.pubDate)) ??
      toIso(text(e.published)) ??
      toIso(text(e.updated)) ??
      new Date().toISOString();
    const rawSummary = text(e.description) ?? text(e.summary);
    items.push({
      id: hashId(url),
      title: sanitizeSummary(title),
      url,
      source: cfg.source,
      publishedAt,
      category: cfg.category,
      imageUrl: entryImage(e),
      summary: rawSummary ? sanitizeSummary(rawSummary) : undefined,
    });
  }
  return items;
}

/** Drop duplicate URLs and same-headline syndicated copies; newest first. */
export function dedupeItems(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  const sorted = [...items].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  for (const item of sorted) {
    const urlKey = `u:${item.url}`;
    const titleKey = `t:${item.title.toLowerCase()}`;
    if (seen.has(urlKey) || seen.has(titleKey)) continue;
    seen.add(urlKey);
    seen.add(titleKey);
    out.push(item);
  }
  return out;
}

/** Fetch all configured feeds in parallel (5s timeout each); a failed feed is skipped, never fatal. */
export async function fetchFeeds(
  configs: FeedConfig[] = FEEDS,
): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    configs.map(async (cfg) => {
      const res = await fetch(cfg.url, {
        signal: AbortSignal.timeout(5000),
        headers: { "user-agent": "IndraniNews/1.0 (+https://indrani.news)" },
      });
      if (!res.ok) throw new Error(`${cfg.source} ${res.status}`);
      return parseFeed(await res.text(), cfg);
    }),
  );
  return dedupeItems(
    results.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
  );
}
