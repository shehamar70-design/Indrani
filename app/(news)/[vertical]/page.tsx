/**
 * Vertical pages — docs/44 §1.4. One dynamic template driven by
 * lib/verticals.ts kills the header/footer 404s (/technology, /politics,
 * /economics, /wealth, /opinion, /crypto, /ai, /green). Slug allowlist via
 * getVertical; /markets never reaches here (its static hub wins routing).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNews } from "@/lib/data/chain";
import { getVertical, VERTICALS } from "@/lib/verticals";
import ExternalCard from "@/components/news/external-card";
import MarketSnapshot from "@/components/news/market-snapshot";

export const revalidate = 300;

type Props = { params: Promise<{ vertical: string }> };

export function generateStaticParams() {
  return VERTICALS.filter((v) => v.slug !== "markets").map((v) => ({
    vertical: v.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = getVertical((await params).vertical);
  if (!v) return { title: "Not found" };
  return {
    title: `${v.name} — Indrani`,
    description: v.description,
    alternates: { canonical: `/${v.slug}` },
  };
}

export default async function VerticalPage({ params }: Props) {
  const v = getVertical((await params).vertical);
  if (!v) notFound();

  const newsRes = await getNews({ category: v.category, limit: 25 });
  const items = newsRes.data ?? [];
  const [lead, ...rest] = items;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b-2 pb-4" style={{ borderColor: v.accent }}>
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: v.accent }}
        >
          {v.nameHi}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{v.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {items.length === 0 ? (
            <p className="py-10 text-sm text-muted-foreground">
              No {v.name} headlines available right now. Please check back shortly.
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
          <MarketSnapshot symbols={v.snapshotSymbols} />
        </aside>
      </div>
    </div>
  );
}
