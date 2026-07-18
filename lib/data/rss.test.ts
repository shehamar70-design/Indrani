/**
 * RSS sanitize/decode tests — docs/44 §1.7 (TDD on the captured 07-13 payload).
 * The sanitizer re-encodes already-encoded entities and nothing decoded them,
 * so summaries rendered literal "&amp;" ("W&amp;M"). sanitizeSummary must
 * return plain text with entities decoded exactly once.
 */

import { describe, expect, it } from "vitest";
import { parseFeed, sanitizeSummary } from "./providers/rss";

const CFG = { url: "https://example.com/rss", source: "Test", category: "top" };

describe("sanitizeSummary entity decoding", () => {
  it("decodes the captured 07-13 double-encoded ampersand payload", () => {
    // Feed XML held "(W&amp;amp;M)/2020"; the XML parser already turned it
    // into "(W&amp;M)" by the time sanitizeSummary sees it.
    expect(sanitizeSummary("(W&amp;M)/2020")).toBe("(W&M)/2020");
  });

  it("decodes numeric and named entities to plain text", () => {
    expect(sanitizeSummary("Fed &#8212; RBI&#x2019;s call")).toBe("Fed — RBI’s call");
    expect(sanitizeSummary("Q1 profit &gt; estimates &amp; up 5%")).toBe(
      "Q1 profit > estimates & up 5%",
    );
    expect(sanitizeSummary("A&nbsp;&nbsp;B")).toBe("A B");
  });

  it("still strips tags; decoded markup stays inert text", () => {
    expect(sanitizeSummary("<script>alert(1)</script>safe")).toBe("safe");
    // Double-encoded markup decodes to literal text, never to a tag.
    expect(sanitizeSummary("use &lt;b&gt; wisely")).toBe("use <b> wisely");
  });

  it("is a no-op on already-plain text", () => {
    expect(sanitizeSummary("Sensex up 1.2% as RBI holds rates")).toBe(
      "Sensex up 1.2% as RBI holds rates",
    );
  });
});

describe("parseFeed applies decoding to title and summary", () => {
  it("returns decoded plain text end-to-end", () => {
    const xml = `<?xml version="1.0"?>
      <rss version="2.0"><channel>
        <item>
          <title>M&amp;amp;M results &#8211; Q4</title>
          <link>https://example.com/a</link>
          <pubDate>Fri, 17 Jul 2026 10:00:00 GMT</pubDate>
          <description>Profit at M&amp;amp;M &gt;&gt; street view &#8212; details inside.</description>
        </item>
      </channel></rss>`;
    const [item] = parseFeed(xml, CFG);
    expect(item.title).toBe("M&M results – Q4");
    expect(item.summary).toBe("Profit at M&M >> street view — details inside.");
  });
});
