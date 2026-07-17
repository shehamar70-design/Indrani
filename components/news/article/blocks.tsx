/**
 * Article block renderer — docs/28. Server component: maps ArticleBlock[]
 * (lib/article-blocks.ts) to markup. Data blocks (chart, movers) fetch live
 * data server-side via chain.ts at render/ISR time; unavailable data renders
 * an explicit state, never placeholders (docs/18 §2).
 */

import Link from "next/link";
import type { ArticleBlock } from "@/lib/article-blocks";
import { parseInline } from "@/lib/article-blocks";
import { getChart, getMovers, getQuotes } from "@/lib/data/chain";
import { formatPrice, formatPercentPoints } from "@/lib/format";
import TickerChip from "@/components/news/article/ticker-chip";
import RangeChart from "@/components/markets/range-chart";
import RemoteImage from "@/components/news/remote-image";

function Paragraph({ text }: { text: string }) {
  return (
    <p className="my-5 text-lg leading-relaxed">
      {parseInline(text).map((seg, i) =>
        seg.kind === "ticker" ? (
          <TickerChip key={i} symbol={seg.symbol} />
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}

function KeyPoints({ items }: { items: string[] }) {
  return (
    <aside className="my-6 rounded-lg border border-border bg-muted/30 p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">What you need to know</h2>
      <ul className="list-disc space-y-2 pl-5 text-base">
        {items.map((item, i) => (
          <li key={i}>
            {parseInline(item).map((seg, j) =>
              seg.kind === "ticker" ? (
                <TickerChip key={j} symbol={seg.symbol} />
              ) : (
                <span key={j}>{seg.text}</span>
              ),
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PullQuote({ text, attribution }: { text: string; attribution?: string }) {
  return (
    <blockquote className="my-8 border-l-4 pl-6" style={{ borderColor: "var(--accent-brand)" }}>
      <p className="text-2xl font-semibold leading-snug">&ldquo;{text}&rdquo;</p>
      {attribution && <footer className="mt-2 text-sm text-muted-foreground">— {attribution}</footer>}
    </blockquote>
  );
}

async function InlineChart({ symbol, title }: { symbol: string; title?: string }) {
  const chart = await getChart(symbol, "1d", "5m");
  return (
    <figure className="my-8 rounded-lg border border-border p-4">
      {title && <figcaption className="mb-2 text-sm font-semibold">{title}</figcaption>}
      <RangeChart symbol={symbol} initial={chart.data} />
    </figure>
  );
}

async function MoversBlock({ kind, title }: { kind: "gainers" | "losers"; title?: string }) {
  const res = await getMovers(kind);
  const rows = (res.data ?? []).slice(0, 5);
  const heading = title ?? (kind === "gainers" ? "Top gainers" : "Top losers");
  return (
    <section aria-label={heading} className="my-6 rounded-lg border border-border p-4">
      <h3 className="mb-2 flex items-baseline justify-between text-sm font-bold uppercase tracking-wide">
        {heading}
        <span className="text-[10px] font-normal normal-case text-muted-foreground">US markets</span>
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Movers data unavailable right now.</p>
      ) : (
        <ol className="divide-y divide-border">
          {rows.map((q) => (
            <li key={q.symbol} className="flex items-baseline justify-between gap-3 py-2 text-sm">
              <Link
                href={`/markets/quote/${encodeURIComponent(q.symbol)}`}
                className="min-w-0 truncate font-semibold hover:underline"
              >
                {q.symbol}
                {q.shortName && (
                  <span className="ml-2 font-normal text-muted-foreground">{q.shortName}</span>
                )}
              </Link>
              <span className="shrink-0 tabular-nums">
                {formatPrice(q.price)}{" "}
                <span
                  style={{
                    color: q.changePercent >= 0 ? "var(--accent-up)" : "var(--accent-down)",
                  }}
                >
                  {formatPercentPoints(q.changePercent)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

async function IndexChips({ symbols }: { symbols: string[] }) {
  const res = await getQuotes(symbols);
  const quotes = res.data ?? {};
  const present = symbols.filter((s) => quotes[s]);
  if (present.length === 0) return null;
  return (
    <div className="my-4 flex flex-wrap gap-2">
      {present.map((s) => {
        const q = quotes[s];
        const up = q.changePercent >= 0;
        return (
          <Link
            key={s}
            href={`/markets/quote/${encodeURIComponent(s)}`}
            className="rounded border border-border px-2.5 py-1.5 text-xs font-semibold tabular-nums hover:border-foreground"
          >
            {q.shortName ?? s}{" "}
            <span style={{ color: up ? "var(--accent-up)" : "var(--accent-down)" }}>
              {formatPercentPoints(q.changePercent)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function ArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return <Paragraph key={i} text={block.text} />;
          case "h2":
            return (
              <h2 key={i} className="mt-10 mb-3 text-2xl font-bold tracking-tight">
                {block.text}
              </h2>
            );
          case "keyPoints":
            return <KeyPoints key={i} items={block.items} />;
          case "pullQuote":
            return <PullQuote key={i} text={block.text} attribution={block.attribution} />;
          case "chart":
            return <InlineChart key={i} symbol={block.symbol} title={block.title} />;
          case "image":
            return (
              <figure key={i} className="my-8">
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <RemoteImage src={block.url} />
                </div>
                <figcaption className="mt-2 text-sm text-muted-foreground">
                  {block.caption} <span className="uppercase">Credit: {block.credit}</span>
                </figcaption>
              </figure>
            );
          case "movers":
            return <MoversBlock key={i} kind={block.kind} title={block.title} />;
          case "indexChips":
            return <IndexChips key={i} symbols={block.symbols} />;
        }
      })}
    </div>
  );
}
