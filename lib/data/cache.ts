/**
 * In-memory LRU cache with TTL + max-stale window — docs/12 §2, §3.
 * Fresh (age < ttl): served as-is. Stale (ttl < age < maxStale): served with
 * isStale=true so the UI can render the amber "delayed" tag. Past maxStale: dropped.
 */

interface Entry<T> {
  value: T;
  storedAt: number;
  ttlMs: number;
  maxStaleMs: number;
}

export interface CacheHit<T> {
  value: T;
  isStale: boolean;
}

export class TtlCache<T> {
  private map = new Map<string, Entry<T>>();
  private maxEntries: number;

  constructor(opts: { maxEntries: number }) {
    this.maxEntries = opts.maxEntries;
  }

  set(key: string, value: T, ttlMs: number, maxStaleMs = ttlMs * 4): void {
    // Map preserves insertion order — delete+set moves the key to the tail (most recent).
    this.map.delete(key);
    this.map.set(key, { value, storedAt: Date.now(), ttlMs, maxStaleMs });
    if (this.map.size > this.maxEntries) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
  }

  get(key: string): CacheHit<T> | null {
    const entry = this.map.get(key);
    if (!entry) return null;
    const age = Date.now() - entry.storedAt;
    if (age > entry.ttlMs + entry.maxStaleMs) {
      this.map.delete(key);
      return null;
    }
    // LRU touch
    this.map.delete(key);
    this.map.set(key, entry);
    // >= so ttlMs=0 means "immediately stale" (used to force refetch attempts)
    return { value: entry.value, isStale: age >= entry.ttlMs };
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}

/**
 * Shared server-side caches, one per data type so TTL policy (docs/12 §3)
 * and capacity are independent. Module-level = per-server-instance, which is
 * what we want on Vercel (warm lambda reuse).
 */
export const quoteCache = new TtlCache<unknown>({ maxEntries: 2000 });
export const chartCache = new TtlCache<unknown>({ maxEntries: 500 });
export const newsCache = new TtlCache<unknown>({ maxEntries: 100 });
export const searchCache = new TtlCache<unknown>({ maxEntries: 500 });
export const macroCache = new TtlCache<unknown>({ maxEntries: 200 });
export const fxCache = new TtlCache<unknown>({ maxEntries: 50 });
