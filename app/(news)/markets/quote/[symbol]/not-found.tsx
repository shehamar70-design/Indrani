/**
 * Unknown symbol — docs/04 §5: clean "Symbol not found" with a search path.
 */

import Link from "next/link";
import SearchBox from "@/components/news/search-box";

export default function SymbolNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Symbol not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We couldn&apos;t find that ticker. Try searching for a company name or symbol.
      </p>
      <div className="mx-auto mt-6 max-w-sm">
        <SearchBox />
      </div>
      <p className="mt-6 text-sm">
        <Link href="/markets" className="font-semibold underline underline-offset-4">
          Browse markets →
        </Link>
      </p>
    </div>
  );
}
