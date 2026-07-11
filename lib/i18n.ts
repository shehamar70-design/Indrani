// Minimal homegrown dictionary per docs/35 §18 — all UI strings go through t()
// from Phase 1 even though Hindi ships Phase 5. Locale persisted in a cookie;
// server components read it via cookies().get(LOCALE_COOKIE).

import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];

export const LOCALE_COOKIE = "indrani_locale";
export const DEFAULT_LOCALE: Locale = "en";

type Dict = { [key: string]: string | Dict };
const dictionaries: Record<Locale, Dict> = { en, hi };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

function lookup(dict: Dict, path: string[]): string | undefined {
  let node: string | Dict | undefined = dict;
  for (const part of path) {
    if (typeof node !== "object" || node === undefined) return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** Dot-path lookup with en fallback; returns the key itself if missing everywhere. */
export function t(locale: Locale, key: string): string {
  const path = key.split(".");
  return lookup(dictionaries[locale], path) ?? lookup(dictionaries.en, path) ?? key;
}
