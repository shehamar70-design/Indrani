"use client";

/**
 * Global batched quote poller — docs/17 §4 polling discipline.
 * Components register symbols; ONE 15s interval issues ONE batched
 * /api/quotes call and fans results out. Never per-component polling.
 * ponytail: fixed 15s + hidden-tab skip; market-hours 5-min slowdown
 * (lib/market-hours.ts) arrives with the terminal phase.
 */

import { useEffect, useSyncExternalStore } from "react";
import type { Quote, SourceMeta } from "@/lib/data/types";

const POLL_MS = 15_000;

type QuoteMap = Record<string, Quote>;

const counts = new Map<string, number>();
const listeners = new Set<() => void>();
let quotes: QuoteMap = {};
let meta: SourceMeta | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let fetching = false;

export function activeSymbols(): string[] {
  return [...counts.keys()].sort();
}

function notify(): void {
  for (const l of listeners) l();
}

export async function pollOnce(): Promise<void> {
  const symbols = activeSymbols();
  if (symbols.length === 0 || fetching) return;
  fetching = true;
  try {
    const res = await fetch(
      `/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`,
    );
    if (res.ok) {
      const body = (await res.json()) as {
        data: QuoteMap | null;
        meta: SourceMeta | null;
      };
      if (body.data) {
        quotes = { ...quotes, ...body.data };
        meta = body.meta;
        notify();
      }
    }
  } catch {
    // network blip: keep last known quotes, next tick retries
  } finally {
    fetching = false;
  }
}

function schedule(): void {
  if (timer !== null) return;
  const tick = async () => {
    const hidden = typeof document !== "undefined" && document.hidden;
    if (!hidden) await pollOnce();
    timer = setTimeout(tick, POLL_MS);
  };
  timer = setTimeout(tick, POLL_MS);
}

export function register(symbols: string[]): void {
  let added = false;
  for (const s of symbols) {
    const n = counts.get(s) ?? 0;
    counts.set(s, n + 1);
    if (n === 0) added = true;
  }
  if (counts.size > 0) schedule();
  if (added) void pollOnce();
}

export function unregister(symbols: string[]): void {
  for (const s of symbols) {
    const n = counts.get(s) ?? 0;
    if (n <= 1) counts.delete(s);
    else counts.set(s, n - 1);
  }
  if (counts.size === 0 && timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

/** Test-only: wipe module state between vitest cases. */
export function _reset(): void {
  counts.clear();
  listeners.clear();
  quotes = {};
  meta = null;
  fetching = false;
  if (timer !== null) clearTimeout(timer);
  timer = null;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => quotes;

/**
 * Live quotes for a symbol list. Quotes for symbols that failed upstream are
 * simply absent — callers must render nothing for them (docs/18 §2).
 */
export function useQuotes(symbols: string[]): {
  quotes: QuoteMap;
  meta: SourceMeta | null;
} {
  const key = symbols.join(",");
  useEffect(() => {
    const list = key ? key.split(",") : [];
    register(list);
    return () => unregister(list);
  }, [key]);
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { quotes: snap, meta };
}
