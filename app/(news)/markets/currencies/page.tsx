/**
 * /markets/currencies — docs/33. FX majors + INR crosses (live Yahoo quotes)
 * plus the ECB-reference cross-rate matrix (docs/32).
 */

import type { Metadata } from "next";
import { getQuotes, getFx } from "@/lib/data/chain";
import { FX_MAJORS, MATRIX_CURRENCIES } from "@/lib/markets";
import type { FxRates } from "@/lib/data/types";
import MarketsNav from "@/components/markets/markets-nav";
import MiniBoard from "@/components/markets/mini-board";
import FxBoard from "@/components/markets/fx-board";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Currencies — Indrani Markets",
  description:
    "Live currency markets: FX majors, rupee crosses and a USD/EUR/GBP/JPY/INR/CNY cross-rate matrix.",
  alternates: { canonical: "/markets/currencies" },
};

export default async function CurrenciesPage() {
  const [quotesRes, ...fxResults] = await Promise.all([
    getQuotes(FX_MAJORS),
    ...MATRIX_CURRENCIES.map((base) => getFx(base)),
  ]);

  const tables: Record<string, FxRates | null> = {};
  MATRIX_CURRENCIES.forEach((base, i) => {
    tables[base] = fxResults[i].data;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Currencies</h1>
      <MarketsNav active="currencies" />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <FxBoard currencies={MATRIX_CURRENCIES} tables={tables} />
        </div>
        <aside className="space-y-10">
          <MiniBoard title="Majors & INR crosses" symbols={FX_MAJORS} quotes={quotesRes.data ?? {}} nameFirst />
        </aside>
      </div>
    </div>
  );
}
