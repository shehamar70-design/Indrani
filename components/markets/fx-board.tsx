/**
 * FxBoard — docs/33 /markets/currencies cross-rate matrix. Server component:
 * parent fetches one FxRates table per base (frankfurter/ECB reference rates,
 * docs/32). A base whose fetch failed renders "—" across its row — never a
 * stale-looking fake (docs/18 §2). ECB publishes once per business day.
 */

import type { FxRates } from "@/lib/data/types";
import { formatNumber } from "@/lib/format";

function cell(v: number | undefined): string {
  if (v == null) return "—";
  // Small rates (EURUSD ~1.08) need 4 decimals; big ones (USDJPY ~150) read fine at 2.
  return formatNumber(v < 10 ? Math.round(v * 1e4) / 1e4 : Math.round(v * 100) / 100);
}

export default function FxBoard({
  currencies,
  tables,
}: {
  currencies: string[];
  tables: Record<string, FxRates | null>;
}) {
  const asOf = Object.values(tables).find((t) => t)?.date;

  return (
    <section aria-label="Cross rates">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">Cross rates</h2>
        {asOf && (
          <span className="text-[10px] uppercase text-muted-foreground">ECB ref · {asOf}</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm tabular-nums">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-semibold">
                1 unit →
              </th>
              {currencies.map((c) => (
                <th key={c} scope="col" className="py-2 pr-3 text-right font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currencies.map((base) => (
              <tr key={base}>
                <th scope="row" className="py-2 pr-3 text-left font-bold">
                  {base}
                </th>
                {currencies.map((quote) => (
                  <td key={quote} className="py-2 pr-3 text-right">
                    {base === quote ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      cell(tables[base]?.rates[quote])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
