/**
 * frankfurter.app provider — FX daily rates fallback for the FXC matrix. docs/12 §1.
 * Official free API, no key.
 */

import type { FxRates } from "../types";

export async function frankfurterRates(base: string): Promise<FxRates> {
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`,
    { signal: AbortSignal.timeout(2500) },
  );
  if (!res.ok) throw new Error(`frankfurter ${res.status}`);
  const data = (await res.json()) as {
    base: string;
    date: string;
    rates: Record<string, number>;
  };
  return {
    base: data.base,
    date: data.date,
    rates: data.rates,
    meta: {
      source: "frankfurter",
      fetchedAt: new Date().toISOString(),
      isStale: false,
    },
  };
}
