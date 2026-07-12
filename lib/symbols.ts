/**
 * Symbol directory — docs/04 §4. Static module instead of a DB table
 * (deliberate deviation, logged in DECISIONS.md): same data, zero query
 * latency, versioned with code. Used for search, related rows, and
 * validating symbols before hitting quote APIs.
 * ponytail: ~190 curated entries; move to Postgres when editorial tooling needs SQL.
 */

export interface SymbolEntry {
  symbol: string;
  name: string;
  exchange: string;
  type: "EQUITY" | "INDEX" | "CURRENCY" | "FUTURE" | "CRYPTOCURRENCY" | "ETF";
  sector?: string;
}

const EQ = "EQUITY" as const;
const IX = "INDEX" as const;
const FX = "CURRENCY" as const;
const FU = "FUTURE" as const;
const CR = "CRYPTOCURRENCY" as const;
const ET = "ETF" as const;

export const SYMBOLS: SymbolEntry[] = [
  // ── Global indices ──────────────────────────────────────────────
  { symbol: "^GSPC", name: "S&P 500", exchange: "SNP", type: IX },
  { symbol: "^IXIC", name: "Nasdaq Composite", exchange: "NASDAQ", type: IX },
  { symbol: "^DJI", name: "Dow Jones Industrial Average", exchange: "DJI", type: IX },
  { symbol: "^RUT", name: "Russell 2000", exchange: "FTSE", type: IX },
  { symbol: "^VIX", name: "CBOE Volatility Index", exchange: "CBOE", type: IX },
  { symbol: "^NSEI", name: "Nifty 50", exchange: "NSE", type: IX },
  { symbol: "^BSESN", name: "S&P BSE Sensex", exchange: "BSE", type: IX },
  { symbol: "^NSEBANK", name: "Nifty Bank", exchange: "NSE", type: IX },
  { symbol: "^FTSE", name: "FTSE 100", exchange: "LSE", type: IX },
  { symbol: "^GDAXI", name: "DAX", exchange: "XETRA", type: IX },
  { symbol: "^FCHI", name: "CAC 40", exchange: "Euronext", type: IX },
  { symbol: "^N225", name: "Nikkei 225", exchange: "TSE", type: IX },
  { symbol: "^HSI", name: "Hang Seng Index", exchange: "HKEX", type: IX },
  { symbol: "000001.SS", name: "Shanghai Composite", exchange: "SSE", type: IX },
  { symbol: "^TNX", name: "US 10-Year Treasury Yield", exchange: "CBOE", type: IX },
  // ── US mega/large caps (S&P 100 core) ───────────────────────────
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", exchange: "NASDAQ", type: EQ, sector: "Communication Services" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", type: EQ, sector: "Communication Services" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "BRK-B", name: "Berkshire Hathaway (Class B)", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "UNH", name: "UnitedHealth Group", exchange: "NYSE", type: EQ, sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", type: EQ, sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly and Company", exchange: "NYSE", type: EQ, sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", exchange: "NYSE", type: EQ, sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corporation", exchange: "NYSE", type: EQ, sector: "Energy" },
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE", type: EQ, sector: "Consumer Defensive" },
  { symbol: "PG", name: "Procter & Gamble", exchange: "NYSE", type: EQ, sector: "Consumer Defensive" },
  { symbol: "KO", name: "The Coca-Cola Company", exchange: "NYSE", type: EQ, sector: "Consumer Defensive" },
  { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ", type: EQ, sector: "Consumer Defensive" },
  { symbol: "COST", name: "Costco Wholesale", exchange: "NASDAQ", type: EQ, sector: "Consumer Defensive" },
  { symbol: "HD", name: "The Home Depot", exchange: "NYSE", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "MCD", name: "McDonald's Corporation", exchange: "NYSE", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "NKE", name: "Nike Inc.", exchange: "NYSE", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE", type: EQ, sector: "Communication Services" },
  { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", type: EQ, sector: "Communication Services" },
  { symbol: "CRM", name: "Salesforce Inc.", exchange: "NYSE", type: EQ, sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corporation", exchange: "NYSE", type: EQ, sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "INTC", name: "Intel Corporation", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "QCOM", name: "Qualcomm Inc.", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "TXN", name: "Texas Instruments", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "IBM", name: "IBM Corporation", exchange: "NYSE", type: EQ, sector: "Technology" },
  { symbol: "CSCO", name: "Cisco Systems", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "BAC", name: "Bank of America", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "WFC", name: "Wells Fargo & Company", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "GS", name: "The Goldman Sachs Group", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "MS", name: "Morgan Stanley", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "C", name: "Citigroup Inc.", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "BLK", name: "BlackRock Inc.", exchange: "NYSE", type: EQ, sector: "Financial Services" },
  { symbol: "T", name: "AT&T Inc.", exchange: "NYSE", type: EQ, sector: "Communication Services" },
  { symbol: "VZ", name: "Verizon Communications", exchange: "NYSE", type: EQ, sector: "Communication Services" },
  { symbol: "PFE", name: "Pfizer Inc.", exchange: "NYSE", type: EQ, sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co.", exchange: "NYSE", type: EQ, sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", exchange: "NYSE", type: EQ, sector: "Healthcare" },
  { symbol: "TMO", name: "Thermo Fisher Scientific", exchange: "NYSE", type: EQ, sector: "Healthcare" },
  { symbol: "CAT", name: "Caterpillar Inc.", exchange: "NYSE", type: EQ, sector: "Industrials" },
  { symbol: "BA", name: "The Boeing Company", exchange: "NYSE", type: EQ, sector: "Industrials" },
  { symbol: "GE", name: "GE Aerospace", exchange: "NYSE", type: EQ, sector: "Industrials" },
  { symbol: "UPS", name: "United Parcel Service", exchange: "NYSE", type: EQ, sector: "Industrials" },
  { symbol: "HON", name: "Honeywell International", exchange: "NASDAQ", type: EQ, sector: "Industrials" },
  { symbol: "UBER", name: "Uber Technologies", exchange: "NYSE", type: EQ, sector: "Technology" },
  { symbol: "PLTR", name: "Palantir Technologies", exchange: "NASDAQ", type: EQ, sector: "Technology" },
  { symbol: "ENPH", name: "Enphase Energy", exchange: "NASDAQ", type: EQ, sector: "Energy" },
  // ── NSE large caps (Yahoo .NS suffix) ───────────────────────────
  { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE", type: EQ, sector: "Energy" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE", type: EQ, sector: "Technology" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", exchange: "NSE", type: EQ, sector: "Financial Services" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", exchange: "NSE", type: EQ, sector: "Financial Services" },
  { symbol: "INFY.NS", name: "Infosys", exchange: "NSE", type: EQ, sector: "Technology" },
  { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE", type: EQ, sector: "Financial Services" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", exchange: "NSE", type: EQ, sector: "Communication Services" },
  { symbol: "ITC.NS", name: "ITC Limited", exchange: "NSE", type: EQ, sector: "Consumer Defensive" },
  { symbol: "LT.NS", name: "Larsen & Toubro", exchange: "NSE", type: EQ, sector: "Industrials" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", exchange: "NSE", type: EQ, sector: "Consumer Defensive" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", exchange: "NSE", type: EQ, sector: "Financial Services" },
  { symbol: "AXISBANK.NS", name: "Axis Bank", exchange: "NSE", type: EQ, sector: "Financial Services" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", exchange: "NSE", type: EQ, sector: "Financial Services" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki India", exchange: "NSE", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", exchange: "NSE", type: EQ, sector: "Consumer Cyclical" },
  // M&M.NS excluded: "&" fails the docs/18 ticker regex, so the API can never serve it
  { symbol: "HEROMOTOCO.NS", name: "Hero MotoCorp", exchange: "NSE", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical", exchange: "NSE", type: EQ, sector: "Healthcare" },
  { symbol: "WIPRO.NS", name: "Wipro", exchange: "NSE", type: EQ, sector: "Technology" },
  { symbol: "HCLTECH.NS", name: "HCL Technologies", exchange: "NSE", type: EQ, sector: "Technology" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises", exchange: "NSE", type: EQ, sector: "Industrials" },
  { symbol: "ADANIPORTS.NS", name: "Adani Ports & SEZ", exchange: "NSE", type: EQ, sector: "Industrials" },
  { symbol: "TATASTEEL.NS", name: "Tata Steel", exchange: "NSE", type: EQ, sector: "Basic Materials" },
  { symbol: "JSWSTEEL.NS", name: "JSW Steel", exchange: "NSE", type: EQ, sector: "Basic Materials" },
  { symbol: "NTPC.NS", name: "NTPC Limited", exchange: "NSE", type: EQ, sector: "Utilities" },
  { symbol: "POWERGRID.NS", name: "Power Grid Corporation", exchange: "NSE", type: EQ, sector: "Utilities" },
  { symbol: "ONGC.NS", name: "Oil & Natural Gas Corporation", exchange: "NSE", type: EQ, sector: "Energy" },
  { symbol: "COALINDIA.NS", name: "Coal India", exchange: "NSE", type: EQ, sector: "Energy" },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints", exchange: "NSE", type: EQ, sector: "Basic Materials" },
  { symbol: "TITAN.NS", name: "Titan Company", exchange: "NSE", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "ULTRACEMCO.NS", name: "UltraTech Cement", exchange: "NSE", type: EQ, sector: "Basic Materials" },
  { symbol: "BAJAJFINSV.NS", name: "Bajaj Finserv", exchange: "NSE", type: EQ, sector: "Financial Services" },
  { symbol: "NESTLEIND.NS", name: "Nestlé India", exchange: "NSE", type: EQ, sector: "Consumer Defensive" },
  { symbol: "DRREDDY.NS", name: "Dr. Reddy's Laboratories", exchange: "NSE", type: EQ, sector: "Healthcare" },
  { symbol: "CIPLA.NS", name: "Cipla", exchange: "NSE", type: EQ, sector: "Healthcare" },
  { symbol: "TECHM.NS", name: "Tech Mahindra", exchange: "NSE", type: EQ, sector: "Technology" },
  { symbol: "INDUSINDBK.NS", name: "IndusInd Bank", exchange: "NSE", type: EQ, sector: "Financial Services" },
  { symbol: "HINDALCO.NS", name: "Hindalco Industries", exchange: "NSE", type: EQ, sector: "Basic Materials" },
  { symbol: "GRASIM.NS", name: "Grasim Industries", exchange: "NSE", type: EQ, sector: "Basic Materials" },
  { symbol: "EICHERMOT.NS", name: "Eicher Motors", exchange: "NSE", type: EQ, sector: "Consumer Cyclical" },
  { symbol: "DMART.NS", name: "Avenue Supermarts (DMart)", exchange: "NSE", type: EQ, sector: "Consumer Defensive" },
  // ── FX majors + INR crosses ─────────────────────────────────────
  { symbol: "EURUSD=X", name: "Euro / US Dollar", exchange: "CCY", type: FX },
  { symbol: "GBPUSD=X", name: "British Pound / US Dollar", exchange: "CCY", type: FX },
  { symbol: "USDJPY=X", name: "US Dollar / Japanese Yen", exchange: "CCY", type: FX },
  { symbol: "USDINR=X", name: "US Dollar / Indian Rupee", exchange: "CCY", type: FX },
  { symbol: "EURINR=X", name: "Euro / Indian Rupee", exchange: "CCY", type: FX },
  { symbol: "GBPINR=X", name: "British Pound / Indian Rupee", exchange: "CCY", type: FX },
  { symbol: "AUDUSD=X", name: "Australian Dollar / US Dollar", exchange: "CCY", type: FX },
  { symbol: "USDCAD=X", name: "US Dollar / Canadian Dollar", exchange: "CCY", type: FX },
  { symbol: "USDCHF=X", name: "US Dollar / Swiss Franc", exchange: "CCY", type: FX },
  { symbol: "USDCNY=X", name: "US Dollar / Chinese Yuan", exchange: "CCY", type: FX },
  // ── Futures ─────────────────────────────────────────────────────
  { symbol: "CL=F", name: "Crude Oil WTI Futures", exchange: "NYMEX", type: FU },
  { symbol: "BZ=F", name: "Brent Crude Futures", exchange: "ICE", type: FU },
  { symbol: "GC=F", name: "Gold Futures", exchange: "COMEX", type: FU },
  { symbol: "SI=F", name: "Silver Futures", exchange: "COMEX", type: FU },
  { symbol: "HG=F", name: "Copper Futures", exchange: "COMEX", type: FU },
  { symbol: "NG=F", name: "Natural Gas Futures", exchange: "NYMEX", type: FU },
  { symbol: "ZC=F", name: "Corn Futures", exchange: "CBOT", type: FU },
  { symbol: "ZW=F", name: "Wheat Futures", exchange: "CBOT", type: FU },
  { symbol: "ES=F", name: "S&P 500 E-Mini Futures", exchange: "CME", type: FU },
  { symbol: "NQ=F", name: "Nasdaq 100 E-Mini Futures", exchange: "CME", type: FU },
  // ── Sector ETFs (docs/33 sector performance methodology) ────────
  { symbol: "XLK", name: "Technology Select Sector SPDR", exchange: "NYSEArca", type: ET, sector: "Technology" },
  { symbol: "XLF", name: "Financial Select Sector SPDR", exchange: "NYSEArca", type: ET, sector: "Financial Services" },
  { symbol: "XLE", name: "Energy Select Sector SPDR", exchange: "NYSEArca", type: ET, sector: "Energy" },
  { symbol: "XLV", name: "Health Care Select Sector SPDR", exchange: "NYSEArca", type: ET, sector: "Healthcare" },
  { symbol: "XLI", name: "Industrial Select Sector SPDR", exchange: "NYSEArca", type: ET, sector: "Industrials" },
  { symbol: "XLY", name: "Consumer Discretionary SPDR", exchange: "NYSEArca", type: ET, sector: "Consumer Cyclical" },
  { symbol: "XLP", name: "Consumer Staples Select SPDR", exchange: "NYSEArca", type: ET, sector: "Consumer Defensive" },
  { symbol: "XLU", name: "Utilities Select Sector SPDR", exchange: "NYSEArca", type: ET, sector: "Utilities" },
  { symbol: "XLB", name: "Materials Select Sector SPDR", exchange: "NYSEArca", type: ET, sector: "Basic Materials" },
  { symbol: "XLC", name: "Communication Services SPDR", exchange: "NYSEArca", type: ET, sector: "Communication Services" },
  { symbol: "XLRE", name: "Real Estate Select Sector SPDR", exchange: "NYSEArca", type: ET, sector: "Real Estate" },
  { symbol: "ICLN", name: "iShares Global Clean Energy ETF", exchange: "NASDAQ", type: ET, sector: "Energy" },
  // ── Crypto (Yahoo -USD notation; Binance handles via chain) ─────
  { symbol: "BTC-USD", name: "Bitcoin", exchange: "CCC", type: CR },
  { symbol: "ETH-USD", name: "Ethereum", exchange: "CCC", type: CR },
  { symbol: "SOL-USD", name: "Solana", exchange: "CCC", type: CR },
  { symbol: "BNB-USD", name: "BNB", exchange: "CCC", type: CR },
  { symbol: "XRP-USD", name: "XRP", exchange: "CCC", type: CR },
  { symbol: "ADA-USD", name: "Cardano", exchange: "CCC", type: CR },
  { symbol: "DOGE-USD", name: "Dogecoin", exchange: "CCC", type: CR },
  { symbol: "AVAX-USD", name: "Avalanche", exchange: "CCC", type: CR },
  { symbol: "DOT-USD", name: "Polkadot", exchange: "CCC", type: CR },
  { symbol: "LINK-USD", name: "Chainlink", exchange: "CCC", type: CR },
  { symbol: "MATIC-USD", name: "Polygon", exchange: "CCC", type: CR },
  { symbol: "LTC-USD", name: "Litecoin", exchange: "CCC", type: CR },
];

const bySymbol = new Map(SYMBOLS.map((s) => [s.symbol, s]));

export function findSymbol(symbol: string): SymbolEntry | undefined {
  return bySymbol.get(symbol.toUpperCase());
}

/** Prefix match on symbol, substring match on name. Symbol hits rank first. */
export function searchSymbols(query: string, limit = 8): SymbolEntry[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const symHits: SymbolEntry[] = [];
  const nameHits: SymbolEntry[] = [];
  for (const s of SYMBOLS) {
    if (s.symbol.startsWith(q)) symHits.push(s);
    else if (s.name.toUpperCase().includes(q)) nameHits.push(s);
  }
  return [...symHits, ...nameHits].slice(0, limit);
}

/** Same-sector (equities/ETFs) or same-type peers, excluding self. */
export function relatedSymbols(symbol: string, limit = 6): SymbolEntry[] {
  const self = findSymbol(symbol);
  if (!self) return [];
  const pool = SYMBOLS.filter(
    (s) =>
      s.symbol !== self.symbol &&
      (self.sector ? s.sector === self.sector : s.type === self.type),
  );
  return pool.slice(0, limit);
}
