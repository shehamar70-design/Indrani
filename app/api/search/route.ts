import { getSearch } from "@/lib/data/chain";
import { badRequest, chainResponse, rateLimit, searchQuerySchema, tooMany } from "@/lib/api";

export async function GET(req: Request) {
  if (!rateLimit(req)) return tooMany();
  const parsed = searchQuerySchema.safeParse(
    new URL(req.url).searchParams.get("q") ?? "",
  );
  if (!parsed.success) return badRequest(parsed.error.issues);
  return chainResponse(await getSearch(parsed.data), 300);
}
