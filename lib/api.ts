/**
 * Shared API-route plumbing — Zod schemas, rate limiting, response shape.
 * docs/18 §1: every route validates input; responses carry meta {source, fetchedAt, stale}.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import type { ChainResult } from "@/lib/data/types";

/** docs/18 §1 ticker rule. */
export const tickerSchema = z
  .string()
  .regex(/^[A-Z0-9.^=\-]{1,15}$/, "invalid symbol");

export const symbolsSchema = z
  .string()
  .transform((s) => s.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean))
  .pipe(z.array(tickerSchema).min(1).max(50));

export const searchQuerySchema = z
  .string()
  .min(1)
  .max(100)
  .transform((s) => s.replace(/<[^>]*>/g, "").trim())
  .pipe(z.string().min(1));

export const rangeSchema = z.enum(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]);
export const intervalSchema = z.enum(["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo"]);
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

/**
 * Fixed-window in-memory rate limiter (per lambda instance). Public data
 * routes get a generous window; auth routes use their own stricter one (docs/18).
 */
const hits = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;

export function rateLimit(req: Request, max = MAX_PER_WINDOW): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const nowMs = Date.now();
  const entry = hits.get(ip);
  if (!entry || nowMs - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: nowMs });
    return true;
  }
  entry.count++;
  if (hits.size > 10_000) hits.clear(); // crude memory guard; resets all windows
  return entry.count <= max;
}

export function tooMany(): NextResponse {
  return NextResponse.json(
    { error: "rate limit exceeded" },
    { status: 429, headers: { "retry-after": "60" } },
  );
}

export function badRequest(detail: unknown): NextResponse {
  return NextResponse.json({ error: "invalid input", detail }, { status: 400 });
}

/** ChainResult → HTTP: data 200; stale data 200 (meta says so); no data 503. */
export function chainResponse<T>(result: ChainResult<T>, cacheSeconds = 10): NextResponse {
  if (result.data === null) {
    return NextResponse.json(
      { data: null, meta: null, error: "unavailable" },
      { status: 503, headers: { "retry-after": "30" } },
    );
  }
  return NextResponse.json(
    { data: result.data, meta: result.meta },
    {
      headers: {
        "cache-control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 6}`,
      },
    },
  );
}
