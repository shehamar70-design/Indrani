/**
 * /hindi — docs/44 §1.4 (nav 404 kill). Real Hindi-language headlines from
 * the BBC Hindi feed only; never machine-generated content here. The full
 * site-wide Hindi surface (toggle + MT + TTS) is the Phase 5 language plan —
 * this page is honest real data until that ships.
 */

import type { Metadata } from "next";
import { getNews } from "@/lib/data/chain";
import ExternalCard from "@/components/news/external-card";
import MarketSnapshot from "@/components/news/market-snapshot";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "हिंदी — Indrani",
  description: "बाज़ार, अर्थव्यवस्था और कारोबार की ताज़ा हिंदी ख़बरें।",
  alternates: { canonical: "/hindi" },
};

const HINDI_SOURCES = new Set(["BBC Hindi"]);

export default async function HindiPage() {
  const newsRes = await getNews({ category: "india", limit: 50 });
  const items = (newsRes.data ?? [])
    .filter((i) => HINDI_SOURCES.has(i.source))
    .slice(0, 25);
  const [lead, ...rest] = items;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b-2 border-foreground pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Hindi
        </p>
        <h1 lang="hi" className="mt-1 text-3xl font-bold tracking-tight">
          हिंदी
        </h1>
        <p lang="hi" className="mt-1 text-sm text-muted-foreground">
          बाज़ार, अर्थव्यवस्था और कारोबार की ताज़ा ख़बरें।
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0" lang="hi">
          {items.length === 0 ? (
            <p className="py-10 text-sm text-muted-foreground">
              हिंदी ख़बरें अभी उपलब्ध नहीं हैं। कृपया थोड़ी देर में फिर देखें।
            </p>
          ) : (
            <>
              <ExternalCard item={lead} />
              <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
                {rest.map((item) => (
                  <ExternalCard key={item.id} item={item} variant="compact" />
                ))}
              </div>
            </>
          )}
        </div>
        <aside className="lg:pt-1">
          <MarketSnapshot symbols={["^NSEI", "^BSESN", "USDINR=X", "GC=F"]} />
        </aside>
      </div>
    </div>
  );
}
