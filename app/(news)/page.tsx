/**
 * Home page — docs/03 §1. Server component, ISR 300s. Block order comes
 * from lib/home-layout.ts; every block renders real data or an honest
 * empty/unavailable state (docs/18 §2). Live prices are client islands on
 * the shared batched poller only.
 */

import type { Metadata } from "next";
import { getNews } from "@/lib/data/chain";
import { getVertical } from "@/lib/verticals";
import {
  HOME_BLOCKS,
  HOME_SECTIONS,
  SNAPSHOT_SYMBOLS,
  BREAKING_KEYWORDS,
  BREAKING_WINDOW_MIN,
  type HomeBlockId,
} from "@/lib/home-layout";
import type { NewsItem } from "@/lib/data/types";
import BreakingBanner from "@/components/news/breaking-banner";
import LeadModule from "@/components/news/lead-module";
import MarketSnapshot from "@/components/news/market-snapshot";
import SectionBand from "@/components/news/section-band";
import ExternalCard from "@/components/news/external-card";
import BigTakeBand from "@/components/news/big-take-band";
import LiveTVModule from "@/components/news/live-tv-module";
import OpinionBand from "@/components/news/opinion-band";
import NewsletterBand from "@/components/news/newsletter-band";
import MostReadRail from "@/components/news/most-read-rail";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Indrani — Markets, Money and News",
  description:
    "Live markets, financial news and analysis across India and the world — stocks, economics, technology, crypto and more.",
};

/** docs/03 §1.3: newest item whose headline hits a breaking keyword within the window. */
function pickBreaking(items: NewsItem[]): NewsItem | null {
  const cutoff = Date.now() - BREAKING_WINDOW_MIN * 60_000;
  return (
    items.find(
      (i) =>
        new Date(i.publishedAt).getTime() >= cutoff &&
        BREAKING_KEYWORDS.some((k) => i.title.toLowerCase().includes(k)),
    ) ?? null
  );
}

export default async function Home() {
  const [allRes, opinionRes, ...sectionResults] = await Promise.all([
    getNews({ limit: 30 }),
    getNews({ category: "opinion", limit: 8 }),
    ...HOME_SECTIONS.map((slug) =>
      getNews({ category: getVertical(slug)!.category, limit: 6 }),
    ),
  ]);

  const all = allRes.data ?? [];
  const breaking = pickBreaking(all);
  const leadItems = all.slice(0, 5);
  const bigTakeItems = all.slice(5).filter((i) => i.imageUrl).slice(0, 2);

  const usedIds = new Set([...leadItems, ...bigTakeItems].map((i) => i.id));
  const latest = all.filter((i) => !usedIds.has(i.id)).slice(0, 5);

  const sections = HOME_SECTIONS.map((slug, i) => ({
    vertical: getVertical(slug)!,
    items: (sectionResults[i].data ?? []).slice(0, 4),
  })).filter((s) => s.items.length > 0);

  const blocks: Record<HomeBlockId, React.ReactNode> = {
    breaking: <BreakingBanner key="breaking" item={breaking} />,
    lead: <LeadModule key="lead" items={leadItems} />,
    "market-snapshot": (
      <div key="market-snapshot" className="mt-8">
        <MarketSnapshot symbols={SNAPSHOT_SYMBOLS} />
      </div>
    ),
    sections: sections.map(({ vertical, items }) => (
      <SectionBand
        key={vertical.slug}
        title={vertical.name}
        accent={vertical.accent}
        href={`/${vertical.slug}`}
      >
        <div className="grid gap-x-8 sm:grid-cols-2">
          <ExternalCard item={items[0]} />
          {items.slice(1).map((item) => (
            <ExternalCard key={item.id} item={item} variant="compact" />
          ))}
        </div>
      </SectionBand>
    )),
    "big-take": <BigTakeBand key="big-take" items={bigTakeItems} />,
    "live-tv": <LiveTVModule key="live-tv" />,
    opinion: <OpinionBand key="opinion" items={opinionRes.data ?? []} />,
    newsletter: <NewsletterBand key="newsletter" />,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">{HOME_BLOCKS.map((id) => blocks[id])}</div>
        <div className="lg:pt-1">
          {/* Real most-read arrives with news_items persistence (F8) — until
              then this is honestly labeled "Latest" (docs/18 §2). */}
          <MostReadRail items={latest} title="Latest" />
        </div>
      </div>
    </div>
  );
}
