/**
 * /search — docs/44 §1.4. Server-rendered results over the same chain the
 * existing /api/search uses (Yahoo symbol search). Plain GET form so the
 * utility-bar omnibox ("/" shortcut) finally has a destination.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getSearch } from "@/lib/data/chain";
import { searchQuerySchema } from "@/lib/api";

export const metadata: Metadata = {
  title: "Search — Indrani",
  description: "Search stocks, indices, currencies and crypto symbols.",
  alternates: { canonical: "/search" },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q ?? "";
  const parsed = searchQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : null;
  const results = query ? (await getSearch(query)).data : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">Search</h1>

      <form action="/search" role="search" className="mt-4 flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={raw}
          placeholder="Search stocks, indices, currencies, crypto…"
          autoComplete="off"
          maxLength={100}
          className="h-10 w-full rounded border border-border bg-muted px-3 text-sm outline-none focus:border-ring"
        />
        <button
          type="submit"
          className="h-10 shrink-0 rounded bg-foreground px-4 text-sm font-semibold text-background"
        >
          Search
        </button>
      </form>

      {query === null ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Type a company name or ticker — e.g. “Reliance”, “AAPL”, “Nifty”.
        </p>
      ) : results === null ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Search is temporarily unavailable. Please try again shortly.
        </p>
      ) : results.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No symbols found for “{query}”.
        </p>
      ) : (
        <section aria-label="Symbol results" className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Symbols</h2>
          <ul className="divide-y divide-border">
            {results.map((r) => (
              <li key={r.symbol}>
                <Link
                  href={`/markets/quote/${encodeURIComponent(r.symbol)}`}
                  className="flex items-baseline justify-between gap-3 py-2.5 hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{r.symbol}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.name}</span>
                  </span>
                  <span className="shrink-0 text-xs uppercase text-muted-foreground">
                    {[r.exchange, r.type].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
