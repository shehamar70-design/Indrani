/**
 * safeFetch — the fallback engine every data value flows through. docs/12 §2, docs/18.
 *
 * Order: fresh cache → primary → secondary → ... → stale cache → UNAVAILABLE (data: null).
 * - 3s timeout per provider (configurable)
 * - Circuit breaker: 5 consecutive failures → skip that provider for 60s
 * - Never throws to the caller; never fabricates data.
 */

import type { ChainResult, DataSource, SourceMeta } from "./types";
import type { TtlCache } from "./cache";

interface Source<T> {
  name: DataSource;
  fn: () => Promise<T>;
}

interface SafeFetchOptions<T> {
  key: string;
  cache: TtlCache<T>;
  ttlMs: number;
  maxStaleMs?: number;
  timeoutMs?: number;
  sources: Source<T>[];
}

const BREAKER_THRESHOLD = 5;
const BREAKER_COOLDOWN_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 3_000;

interface BreakerState {
  consecutiveFailures: number;
  openUntil: number;
}

const breakers = new Map<string, BreakerState>();

/** Test hook + ops escape hatch. */
export function resetBreakers(): void {
  breakers.clear();
}

function breakerFor(name: string): BreakerState {
  let s = breakers.get(name);
  if (!s) {
    s = { consecutiveFailures: 0, openUntil: 0 };
    breakers.set(name, s);
  }
  return s;
}

function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout after ${ms}ms`)),
      ms,
    );
    fn().then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export async function safeFetch<T>(
  opts: SafeFetchOptions<T>,
): Promise<ChainResult<T>> {
  const {
    key,
    cache,
    ttlMs,
    maxStaleMs = ttlMs * 4,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    sources,
  } = opts;

  // 1. Fresh cache
  const cached = cache.get(key);
  if (cached && !cached.isStale) {
    return {
      data: cached.value,
      meta: { source: "cache", fetchedAt: new Date().toISOString(), isStale: false },
    };
  }

  // 2. Providers in order
  const errors: string[] = [];
  for (const source of sources) {
    const breaker = breakerFor(source.name);
    if (Date.now() < breaker.openUntil) {
      errors.push(`${source.name}: circuit open`);
      continue;
    }
    try {
      const value = await withTimeout(source.fn, timeoutMs);
      breaker.consecutiveFailures = 0;
      cache.set(key, value, ttlMs, maxStaleMs);
      const meta: SourceMeta = {
        source: source.name,
        fetchedAt: new Date().toISOString(),
        isStale: false,
      };
      return { data: value, meta };
    } catch (e) {
      breaker.consecutiveFailures++;
      if (breaker.consecutiveFailures >= BREAKER_THRESHOLD) {
        breaker.openUntil = Date.now() + BREAKER_COOLDOWN_MS;
        breaker.consecutiveFailures = 0;
      }
      errors.push(`${source.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // 3. Stale cache within max-stale window
  if (cached) {
    return {
      data: cached.value,
      meta: { source: "cache", fetchedAt: new Date().toISOString(), isStale: true },
    };
  }

  // 4. Honest UNAVAILABLE — never fake data
  return { data: null, meta: null, error: errors.join("; ") || "no sources" };
}
