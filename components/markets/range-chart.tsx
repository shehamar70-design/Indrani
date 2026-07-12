"use client";

/**
 * RangeChart — docs/04 §2.2. Range tabs 1D–MAX over a custom SVG area chart,
 * fill green/red by direction. Server passes initial 1D data; other ranges
 * fetch /api/chart on demand and are memoised per range for the page's life.
 * States: loading / live / stale ("delayed") / unavailable (docs/18 §2).
 */

import { useEffect, useRef, useState } from "react";
import type { ChartData } from "@/lib/data/types";
import { formatPrice, timeAgo } from "@/lib/format";

const RANGES: { label: string; range: string; interval: string }[] = [
  { label: "1D", range: "1d", interval: "5m" },
  { label: "5D", range: "5d", interval: "15m" },
  { label: "1M", range: "1mo", interval: "1d" },
  { label: "6M", range: "6mo", interval: "1d" },
  { label: "YTD", range: "ytd", interval: "1d" },
  { label: "1Y", range: "1y", interval: "1d" },
  { label: "5Y", range: "5y", interval: "1wk" },
  { label: "MAX", range: "max", interval: "1mo" },
];

const W = 720;
const H = 260;
const PAD = { top: 12, right: 56, bottom: 22, left: 8 };

function tickLabel(time: number, range: string): string {
  const d = new Date(time * 1000);
  if (range === "1d" || range === "5d")
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (range === "5y" || range === "max")
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RangeChart({ symbol, initial }: { symbol: string; initial: ChartData | null }) {
  const [active, setActive] = useState("1d");
  const [byRange, setByRange] = useState<Record<string, ChartData | null>>({ "1d": initial });
  const [loading, setLoading] = useState(false);
  const fetched = useRef(new Set(["1d"]));

  useEffect(() => {
    if (fetched.current.has(active)) return;
    fetched.current.add(active);
    const cfg = RANGES.find((r) => r.range === active)!;
    setLoading(true);
    fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${cfg.range}&interval=${cfg.interval}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data: ChartData | null } | null) =>
        setByRange((prev) => ({ ...prev, [active]: body?.data ?? null })),
      )
      .catch(() => setByRange((prev) => ({ ...prev, [active]: null })))
      .finally(() => setLoading(false));
  }, [active, symbol]);

  const chart = byRange[active];
  const candles = chart?.candles ?? [];

  let body: React.ReactNode;
  if (loading && !chart) {
    body = <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">Loading chart…</div>;
  } else if (!chart || candles.length < 2) {
    body = (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Chart unavailable for this range.
      </div>
    );
  } else {
    const closes = candles.map((c) => c.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const span = max - min || 1;
    const iw = W - PAD.left - PAD.right;
    const ih = H - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (i / (candles.length - 1)) * iw;
    const y = (v: number) => PAD.top + (1 - (v - min) / span) * ih;
    const up = closes[closes.length - 1] >= closes[0];
    const color = up ? "var(--accent-up)" : "var(--accent-down)";
    const line = closes.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
    const area = `${line}L${x(closes.length - 1).toFixed(1)},${(H - PAD.bottom).toFixed(1)}L${PAD.left},${(H - PAD.bottom).toFixed(1)}Z`;
    const gid = `qc-${symbol.replace(/[^A-Za-z0-9]/g, "")}`;

    body = (
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${symbol} price chart`} className="w-full">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[max, (max + min) / 2, min].map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(v)}
                y2={y(v)}
                stroke="var(--border)"
                strokeDasharray="2 4"
              />
              <text x={W - PAD.right + 6} y={y(v) + 3.5} fontSize="11" fill="var(--muted-foreground)" className="tabular-nums">
                {formatPrice(v)}
              </text>
            </g>
          ))}
          <path d={area} fill={`url(#${gid})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="1.75" />
          <text x={PAD.left} y={H - 6} fontSize="11" fill="var(--muted-foreground)">
            {tickLabel(candles[0].time, active)}
          </text>
          <text x={W - PAD.right} y={H - 6} fontSize="11" fill="var(--muted-foreground)" textAnchor="end">
            {tickLabel(candles[candles.length - 1].time, active)}
          </text>
        </svg>
        {chart.meta.isStale && (
          <p className="mt-1 text-[11px] uppercase text-[var(--accent-down)]">
            Delayed — as of {timeAgo(chart.meta.fetchedAt)}
          </p>
        )}
      </div>
    );
  }

  return (
    <section aria-label="Price chart">
      <div role="tablist" aria-label="Chart range" className="mb-3 flex flex-wrap gap-1">
        {RANGES.map((r) => (
          <button
            key={r.range}
            role="tab"
            aria-selected={active === r.range}
            onClick={() => setActive(r.range)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              active === r.range
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {body}
    </section>
  );
}
