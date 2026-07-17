/**
 * Related rail — docs/28 layout A footer: recent Indrani articles from the
 * same vertical (3-up grid) + aggregated headlines (external cards, link out).
 */

import { getNews } from "@/lib/data/chain";
import { listArticles, type ArticleRow } from "@/lib/articles";
import { articlePath } from "@/lib/article-paths";
import { VERTICALS } from "@/lib/verticals";
import StoryCard from "@/components/news/story-card";
import ExternalCard from "@/components/news/external-card";

export default async function RelatedRail({ article }: { article: ArticleRow }) {
  const vertical = VERTICALS.find((v) => v.slug === article.vertical);
  const [related, newsRes] = await Promise.all([
    listArticles({ vertical: article.vertical, excludeId: article.id, limit: 3 }),
    getNews({ category: vertical?.category, limit: 4 }),
  ]);
  const external = newsRes.data ?? [];
  if (related.length === 0 && external.length === 0) return null;

  return (
    <section aria-label="Related coverage" className="mt-12 border-t border-border pt-8">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">More from {vertical?.name ?? "Indrani"}</h2>
      {related.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-3">
          {related.map((a) => (
            <StoryCard
              key={a.id}
              href={articlePath(a)}
              title={a.title}
              kicker={vertical?.name}
              accent={vertical?.accent}
              summary={a.dek ?? undefined}
              imageUrl={a.heroImageUrl ?? undefined}
              publishedAt={a.publishedAt.toISOString()}
              byline={a.byline}
            />
          ))}
        </div>
      )}
      {external.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            From around the web
          </h3>
          {external.map((item) => (
            <ExternalCard key={item.id} item={item} variant="compact" />
          ))}
        </div>
      )}
    </section>
  );
}
