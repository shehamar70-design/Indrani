import { z } from "zod";
import { getNews } from "@/lib/data/chain";
import { badRequest, chainResponse, rateLimit, tickerSchema, tooMany } from "@/lib/api";

const paramsSchema = z.object({
  category: z
    .enum(["all", "top", "markets", "crypto", "india", "economy", "ticker"])
    .default("all"),
  symbol: tickerSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(req: Request) {
  if (!rateLimit(req)) return tooMany();
  const sp = new URL(req.url).searchParams;
  const parsed = paramsSchema.safeParse({
    category: sp.get("category") ?? undefined,
    symbol: sp.get("symbol")?.toUpperCase() || undefined,
    limit: sp.get("limit") ?? undefined,
  });
  if (!parsed.success) return badRequest(parsed.error.issues);
  const { category, symbol, limit } = parsed.data;
  return chainResponse(await getNews({ category, symbol, limit }), 60);
}
