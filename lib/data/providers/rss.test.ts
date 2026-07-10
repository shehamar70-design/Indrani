import { describe, it, expect } from "vitest";
import { sanitizeSummary, parseFeed, dedupeItems } from "./rss";
import type { NewsItem } from "../types";

const RSS_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Fed holds rates steady</title>
      <link>https://example.com/fed-holds</link>
      <pubDate>Tue, 07 Jul 2026 12:00:00 GMT</pubDate>
      <description><![CDATA[<p>The Fed <script>alert(1)</script>kept rates unchanged.</p>]]></description>
    </item>
    <item>
      <title>Oil climbs 2%</title>
      <link>https://example.com/oil-climbs</link>
      <pubDate>Tue, 07 Jul 2026 11:00:00 GMT</pubDate>
      <description>Brent crude rose on supply worries.</description>
    </item>
  </channel>
</rss>`;

const ATOM_SAMPLE = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Feed</title>
  <entry>
    <title>RBI policy update</title>
    <link href="https://example.com/rbi-policy"/>
    <updated>2026-07-07T10:00:00Z</updated>
    <summary>Repo rate unchanged.</summary>
  </entry>
</feed>`;

describe("sanitizeSummary (docs/19 test 8)", () => {
  it("strips <script> tags and their content", () => {
    const out = sanitizeSummary('before<script>alert("x")</script>after');
    expect(out).not.toContain("script");
    expect(out).not.toContain("alert");
    expect(out).toContain("before");
    expect(out).toContain("after");
  });

  it("strips <iframe> tags", () => {
    const out = sanitizeSummary('a<iframe src="https://evil.example"></iframe>b');
    expect(out).not.toContain("iframe");
    expect(out).not.toContain("evil.example");
  });

  it("strips event handlers", () => {
    const out = sanitizeSummary('<b onclick="steal()">bold</b><img src=x onerror="steal()">');
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("steal");
    expect(out).toContain("bold");
  });

  it("keeps plain text intact and collapses whitespace", () => {
    expect(sanitizeSummary("<p>Markets  rallied\n today.</p>")).toBe(
      "Markets rallied today.",
    );
  });
});

describe("parseFeed", () => {
  it("normalizes RSS 2.0 items to NewsItem", () => {
    const items = parseFeed(RSS_SAMPLE, {
      url: "https://example.com/rss",
      source: "Test Feed",
      category: "markets",
    });
    expect(items).toHaveLength(2);
    const [first] = items;
    expect(first.title).toBe("Fed holds rates steady");
    expect(first.url).toBe("https://example.com/fed-holds");
    expect(first.source).toBe("Test Feed");
    expect(first.category).toBe("markets");
    expect(first.id).toMatch(/^[a-f0-9]{16}$/);
    expect(new Date(first.publishedAt).toISOString()).toBe(first.publishedAt);
    expect(first.summary).not.toContain("script");
    expect(first.summary).toContain("kept rates unchanged");
  });

  it("normalizes Atom entries to NewsItem", () => {
    const items = parseFeed(ATOM_SAMPLE, {
      url: "https://example.com/atom",
      source: "RBI",
      category: "economy",
    });
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("RBI policy update");
    expect(items[0].url).toBe("https://example.com/rbi-policy");
    expect(items[0].summary).toBe("Repo rate unchanged.");
  });

  it("skips items with no link (an item we cannot attribute is not shown)", () => {
    const xml = `<rss version="2.0"><channel><item><title>orphan</title></item></channel></rss>`;
    expect(
      parseFeed(xml, { url: "u", source: "s", category: "c" }),
    ).toHaveLength(0);
  });

  it("returns [] for malformed XML instead of throwing", () => {
    expect(
      parseFeed("not xml at all <<<", { url: "u", source: "s", category: "c" }),
    ).toEqual([]);
  });
});

describe("dedupeItems", () => {
  const make = (url: string, publishedAt: string, title = "t"): NewsItem => ({
    id: url,
    title,
    url,
    source: "s",
    publishedAt,
    category: "c",
  });

  it("drops duplicate URLs keeping one copy, sorted newest first", () => {
    const items = [
      make("https://a", "2026-07-07T10:00:00.000Z", "headline a"),
      make("https://b", "2026-07-07T12:00:00.000Z", "headline b"),
      make("https://a", "2026-07-07T10:00:00.000Z", "headline a"),
    ];
    const out = dedupeItems(items);
    expect(out).toHaveLength(2);
    expect(out[0].url).toBe("https://b");
    expect(out[1].url).toBe("https://a");
  });

  it("drops same-title items from different URLs (syndicated copies)", () => {
    const items = [
      make("https://a/1", "2026-07-07T10:00:00.000Z", "Same headline"),
      make("https://b/2", "2026-07-07T09:00:00.000Z", "Same headline"),
    ];
    expect(dedupeItems(items)).toHaveLength(1);
  });
});
