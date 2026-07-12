/**
 * UtilityBar — docs/03 §1.1. Sticky top bar: brand, vertical nav, omnibox,
 * sign in, terminal CTA. Server component; only the search box is a client island.
 */

import Link from "next/link";
import SearchBox from "./search-box";

const NAV = [
  { label: "Markets", href: "/markets" },
  { label: "Economics", href: "/economics" },
  { label: "Tech", href: "/technology" },
  { label: "Politics", href: "/politics" },
  { label: "Crypto", href: "/crypto" },
  { label: "AI", href: "/ai" },
  { label: "Opinion", href: "/opinion" },
  { label: "हिंदी", href: "/hindi" },
];

export default function UtilityBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <Link
          href="/"
          className="shrink-0 font-serif text-xl font-bold tracking-tight"
        >
          Indrani
        </Link>
        <nav
          aria-label="Sections"
          className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded px-2 py-1 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SearchBox />
          <Link
            href="/login"
            className="rounded px-2 py-1 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/terminal"
            className="rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
          >
            Open Terminal
          </Link>
        </div>
      </div>
    </header>
  );
}
