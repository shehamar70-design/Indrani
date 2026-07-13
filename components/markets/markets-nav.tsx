/**
 * MarketsNav — docs/33. Sub-nav shared by /markets and its four sub-pages.
 * Server component; active page highlighted via prop (no usePathname —
 * keeps every hub page fully static/ISR).
 */

import Link from "next/link";

const PAGES = [
  { slug: "", label: "Overview" },
  { slug: "stocks", label: "Stocks" },
  { slug: "currencies", label: "Currencies" },
  { slug: "commodities", label: "Commodities" },
  { slug: "crypto", label: "Crypto" },
] as const;

export type MarketsPage = (typeof PAGES)[number]["slug"];

export default function MarketsNav({ active }: { active: MarketsPage }) {
  return (
    <nav aria-label="Markets sections" className="mb-6 flex flex-wrap gap-1 border-b border-border pb-3">
      {PAGES.map((p) => (
        <Link
          key={p.slug}
          href={p.slug ? `/markets/${p.slug}` : "/markets"}
          aria-current={active === p.slug ? "page" : undefined}
          className={`rounded px-3 py-1.5 text-sm font-semibold transition-colors ${
            active === p.slug
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
