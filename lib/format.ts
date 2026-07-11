// Number formatters per docs/19 test 7 and docs/35 (Indian numbering).
// All formatters render null/undefined/NaN as an em dash — never a fake number.

const DASH = "—";

export interface FormatOptions {
  /** Indian digit grouping (12,34,567) and lakh/crore compact units. */
  indian?: boolean;
}

function invalid(value: number | null | undefined): value is null | undefined {
  return value === null || value === undefined || Number.isNaN(value);
}

function groupLocale(opts?: FormatOptions): string {
  return opts?.indian ? "en-IN" : "en-US";
}

/** Plain number with digit grouping, no forced decimals: 1234.5 → "1,234.5". */
export function formatNumber(
  value: number | null | undefined,
  opts?: FormatOptions,
): string {
  if (invalid(value)) return DASH;
  return new Intl.NumberFormat(groupLocale(opts), {
    maximumFractionDigits: 6,
  }).format(value);
}

/** Quote price, always 2 decimals: 1234.5 → "1,234.50". */
export function formatPrice(
  value: number | null | undefined,
  opts?: FormatOptions,
): string {
  if (invalid(value)) return DASH;
  return new Intl.NumberFormat(groupLocale(opts), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Fractional change to signed percent: -0.0234 → "-2.34%", 0.0151 → "+1.51%". */
export function formatPercent(value: number | null | undefined): string {
  if (invalid(value)) return DASH;
  const pct = (value * 100).toFixed(2);
  const sign = value > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

/**
 * Compact large numbers. International: 1.23M / 4.56B.
 * indian=true: lakh/crore — 4.56 L / 1.23 Cr (docs/35: hi locale + Indian instruments only).
 */
export function formatCompact(
  value: number | null | undefined,
  opts?: FormatOptions,
): string {
  if (invalid(value)) return DASH;
  if (opts?.indian) {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1e7) return `${sign}${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}${(abs / 1e5).toFixed(2)} L`;
    return formatNumber(value, opts);
  }
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
