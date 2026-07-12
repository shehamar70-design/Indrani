/**
 * Home page layout config — docs/03 §1. Editors reorder/disable blocks here
 * without touching components. `sections` drives the mid-page SectionBands.
 */

export type HomeBlockId =
  | "breaking"
  | "lead"
  | "market-snapshot"
  | "sections"
  | "big-take"
  | "live-tv"
  | "opinion"
  | "newsletter";

/** Render order for the main column. Remove an id to hide the block. */
export const HOME_BLOCKS: HomeBlockId[] = [
  "breaking",
  "lead",
  "market-snapshot",
  "sections",
  "big-take",
  "live-tv",
  "opinion",
  "newsletter",
];

/** Vertical slugs rendered as SectionBands, in order (docs/03 §1.6). */
export const HOME_SECTIONS = ["markets", "technology", "economics", "crypto", "politics"];

/** Indices/assets in the MarketSnapshot band (docs/03 §1.5). */
export const SNAPSHOT_SYMBOLS = ["^GSPC", "^IXIC", "^NSEI", "^BSESN", "BTC-USD"];

/** Breaking banner rule (docs/03 §1.3): keyword hit within the last N minutes. */
export const BREAKING_KEYWORDS = [
  "breaking",
  "crash",
  "plunge",
  "halts trading",
  "emergency",
  "rate cut",
  "rate hike",
  "default",
];
export const BREAKING_WINDOW_MIN = 30;
