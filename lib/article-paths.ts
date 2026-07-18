/**
 * Canonical article URL per layout type (docs/28): standard `/news/[slug]`,
 * live `/news/live/[slug]`, wrap `/news/markets-wrap/[date]` (slug is
 * `markets-wrap-<date>`), feature `/news/features/[slug]`, opinion
 * `/news/opinion/[slug]`. Safe for client imports (no db).
 */

const WRAP_SLUG_PREFIX = "markets-wrap-";

export function articlePath(article: { type: string; slug: string }): string {
  const slug = encodeURIComponent(article.slug);
  switch (article.type) {
    case "live":
      return `/news/live/${slug}`;
    case "wrap":
      return `/news/markets-wrap/${encodeURIComponent(
        article.slug.startsWith(WRAP_SLUG_PREFIX)
          ? article.slug.slice(WRAP_SLUG_PREFIX.length)
          : article.slug,
      )}`;
    case "feature":
      return `/news/features/${slug}`;
    case "opinion":
      return `/news/opinion/${slug}`;
    default:
      return `/news/${slug}`;
  }
}
