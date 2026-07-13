/**
 * Markets hub symbol registries — docs/33. Static lists referencing
 * lib/symbols.ts entries; boards render only symbols whose quote resolves
 * (docs/18 §2 — a failed symbol is omitted, never faked).
 */

/** Overview band — 4 index hero cards (docs/33 page structure). */
export const HERO_INDICES = ["^NSEI", "^BSESN", "^GSPC", "^IXIC"];

/** Featured chart tabs (docs/33): Nifty / S&P / USDINR / Gold / BTC. */
export const FEATURED_TABS: { symbol: string; label: string }[] = [
  { symbol: "^NSEI", label: "Nifty 50" },
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "USDINR=X", label: "USD/INR" },
  { symbol: "GC=F", label: "Gold" },
  { symbol: "BTC-USD", label: "Bitcoin" },
];

/** Index boards by region (docs/33 /markets/stocks). */
export const INDEX_BOARDS: { region: string; symbols: string[] }[] = [
  { region: "India", symbols: ["^NSEI", "^BSESN", "^NSEBANK"] },
  { region: "Americas", symbols: ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX"] },
  { region: "Europe", symbols: ["^FTSE", "^GDAXI", "^FCHI"] },
  { region: "Asia-Pacific", symbols: ["^N225", "^HSI", "000001.SS"] },
];

/** FX majors board (docs/32 registry subset present in lib/symbols.ts). */
export const FX_MAJORS = [
  "EURUSD=X",
  "GBPUSD=X",
  "USDJPY=X",
  "USDINR=X",
  "EURINR=X",
  "GBPINR=X",
  "AUDUSD=X",
  "USDCAD=X",
];

/** Commodity boards by group (docs/33 /markets/commodities). */
export const COMMODITY_BOARDS: { group: string; symbols: string[] }[] = [
  { group: "Energy", symbols: ["CL=F", "BZ=F", "NG=F"] },
  { group: "Metals", symbols: ["GC=F", "SI=F", "HG=F"] },
  { group: "Agriculture", symbols: ["ZC=F", "ZW=F"] },
];

/** Hub right-rail mini-boards. */
export const COMMODITIES_MINI = ["CL=F", "GC=F", "SI=F", "NG=F"];
export const CRYPTO_MINI = ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD"];

/** Full crypto board (docs/33 /markets/crypto) — all tracked coins. */
export const CRYPTO_BOARD = [
  "BTC-USD",
  "ETH-USD",
  "SOL-USD",
  "BNB-USD",
  "XRP-USD",
  "ADA-USD",
  "DOGE-USD",
  "AVAX-USD",
  "DOT-USD",
  "LINK-USD",
  "MATIC-USD",
  "LTC-USD",
];

/** Sector performance via sector ETF proxies (docs/33 — label methodology). */
export const SECTOR_ETFS: { symbol: string; sector: string }[] = [
  { symbol: "XLK", sector: "Technology" },
  { symbol: "XLF", sector: "Financials" },
  { symbol: "XLE", sector: "Energy" },
  { symbol: "XLV", sector: "Health Care" },
  { symbol: "XLI", sector: "Industrials" },
  { symbol: "XLY", sector: "Consumer Discretionary" },
  { symbol: "XLP", sector: "Consumer Staples" },
  { symbol: "XLU", sector: "Utilities" },
  { symbol: "XLB", sector: "Materials" },
  { symbol: "XLC", sector: "Communication Services" },
  { symbol: "XLRE", sector: "Real Estate" },
];

/** Cross-rate matrix currencies (docs/33 /markets/currencies). */
export const MATRIX_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "CNY"];
