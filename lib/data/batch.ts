/**
 * Request coalescing — docs/12 §2. N symbols requested within one window
 * become 1 upstream call; duplicate in-flight symbols share the same promise.
 * The acceptance test: a 30-symbol watchlist = exactly 1 batched upstream call.
 */

interface Waiter<T> {
  resolve: (value: T | null) => void;
  reject: (err: unknown) => void;
}

interface BatcherOptions<T> {
  /** Fetch many symbols at once; returns a symbol→value map. Missing symbols → null. */
  fetchMany: (symbols: string[]) => Promise<Record<string, T>>;
  /** Collection window in ms before the batch fires. */
  windowMs?: number;
  /** Max symbols per upstream call; overflow rolls into the next batch. */
  maxBatchSize?: number;
}

export interface Batcher<T> {
  get(symbol: string): Promise<T | null>;
}

export function createBatcher<T>(opts: BatcherOptions<T>): Batcher<T> {
  const { fetchMany, windowMs = 10, maxBatchSize = 50 } = opts;
  let pending = new Map<string, Waiter<T>[]>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function flush(): Promise<void> {
    timer = null;
    const batch = pending;
    pending = new Map();

    const symbols = [...batch.keys()];
    for (let i = 0; i < symbols.length; i += maxBatchSize) {
      const slice = symbols.slice(i, i + maxBatchSize);
      try {
        const results = await fetchMany(slice);
        for (const symbol of slice) {
          const value = symbol in results ? results[symbol] : null;
          for (const w of batch.get(symbol) ?? []) w.resolve(value);
        }
      } catch (err) {
        for (const symbol of slice) {
          for (const w of batch.get(symbol) ?? []) w.reject(err);
        }
      }
    }
  }

  return {
    get(symbol: string): Promise<T | null> {
      return new Promise<T | null>((resolve, reject) => {
        const waiters = pending.get(symbol);
        if (waiters) {
          waiters.push({ resolve, reject });
        } else {
          pending.set(symbol, [{ resolve, reject }]);
        }
        if (!timer) timer = setTimeout(flush, windowMs);
      });
    },
  };
}
