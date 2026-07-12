/**
 * Footer — docs/03 §1.12: sitemap, Hindi link, terminal link, legal,
 * data attribution.
 */

import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "News",
    links: [
      { label: "Markets", href: "/markets" },
      { label: "Economics", href: "/economics" },
      { label: "Technology", href: "/technology" },
      { label: "Politics", href: "/politics" },
      { label: "Crypto", href: "/crypto" },
      { label: "AI", href: "/ai" },
      { label: "Green", href: "/green" },
      { label: "Wealth", href: "/wealth" },
      { label: "Opinion", href: "/opinion" },
    ],
  },
  {
    heading: "Market Data",
    links: [
      { label: "Markets Hub", href: "/markets" },
      { label: "Stocks", href: "/markets/stocks" },
      { label: "Currencies", href: "/markets/currencies" },
      { label: "Commodities", href: "/markets/commodities" },
      { label: "Crypto", href: "/markets/crypto" },
    ],
  },
  {
    heading: "Indrani",
    links: [
      { label: "Terminal", href: "/terminal" },
      { label: "Search", href: "/search" },
      { label: "हिंदी", href: "/hindi" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div>
          <p className="font-serif text-2xl font-bold">Indrani</p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Real-time market data, financial news and a keyboard-first
            terminal. English + Hindi.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {col.heading}
            </p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-foreground/80 hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>© {new Date().getFullYear()} Indrani. Not investment advice.</p>
          <p>
            Market data by Yahoo Finance, Finnhub, Binance, FRED &amp;
            Frankfurter. Headlines from attributed RSS sources. Quotes may be
            delayed.
          </p>
        </div>
      </div>
    </footer>
  );
}
