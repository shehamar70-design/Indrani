/**
 * Vertical registry — docs/04 §1. One config drives the shared
 * `app/(news)/[vertical]` template, nav accents and snapshot rails.
 * `category` maps to the RSS feed categories in lib/data/providers/rss.ts.
 */

export interface VerticalConfig {
  slug: string;
  name: string;
  nameHi: string;
  description: string;
  /** Tailwind-safe hex accent used for kickers/headers. */
  accent: string;
  /** RSS category (lib/data/providers/rss.ts FEEDS). */
  category: string;
  /** Right-rail market snapshot symbols relevant to this vertical. */
  snapshotSymbols: string[];
}

export const VERTICALS: VerticalConfig[] = [
  {
    slug: "markets",
    name: "Markets",
    nameHi: "बाज़ार",
    description: "Stocks, bonds, currencies and commodities — live.",
    accent: "#2962ff",
    category: "markets",
    snapshotSymbols: ["^GSPC", "^NSEI", "^BSESN", "^IXIC"],
  },
  {
    slug: "economics",
    name: "Economics",
    nameHi: "अर्थव्यवस्था",
    description: "Central banks, inflation, growth and policy.",
    accent: "#00695c",
    category: "economy",
    snapshotSymbols: ["^TNX", "USDINR=X", "EURUSD=X", "GC=F"],
  },
  {
    slug: "technology",
    name: "Technology",
    nameHi: "टेक्नोलॉजी",
    description: "Big tech, chips, startups and the platforms economy.",
    accent: "#6200ea",
    category: "technology",
    snapshotSymbols: ["AAPL", "MSFT", "NVDA", "GOOGL"],
  },
  {
    slug: "politics",
    name: "Politics",
    nameHi: "राजनीति",
    description: "Policy, elections and geopolitics moving markets.",
    accent: "#c62828",
    category: "politics",
    snapshotSymbols: ["^GSPC", "CL=F", "^TNX", "USDINR=X"],
  },
  {
    slug: "crypto",
    name: "Crypto",
    nameHi: "क्रिप्टो",
    description: "Bitcoin, ether and the digital-asset economy.",
    accent: "#f57f17",
    category: "crypto",
    snapshotSymbols: ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD"],
  },
  {
    slug: "ai",
    name: "AI",
    nameHi: "एआई",
    description: "Artificial intelligence: models, chips and money.",
    accent: "#00838f",
    category: "ai",
    snapshotSymbols: ["NVDA", "MSFT", "GOOGL", "AMD"],
  },
  {
    slug: "green",
    name: "Green",
    nameHi: "ग्रीन",
    description: "Climate, energy transition and sustainable finance.",
    accent: "#2e7d32",
    category: "green",
    snapshotSymbols: ["ICLN", "CL=F", "NG=F", "ENPH"],
  },
  {
    slug: "wealth",
    name: "Wealth",
    nameHi: "संपत्ति",
    description: "Investing, personal finance and wealth management.",
    accent: "#4527a0",
    category: "wealth",
    snapshotSymbols: ["^GSPC", "^NSEI", "GC=F", "^TNX"],
  },
  {
    slug: "opinion",
    name: "Opinion",
    nameHi: "विचार",
    description: "Columns and commentary on markets and money.",
    accent: "#37474f",
    category: "opinion",
    snapshotSymbols: ["^GSPC", "^NSEI", "BTC-USD", "GC=F"],
  },
];

export function getVertical(slug: string): VerticalConfig | undefined {
  return VERTICALS.find((v) => v.slug === slug);
}
