import { getQuotes } from "@/lib/data/chain";
import { badRequest, chainResponse, rateLimit, symbolsSchema, tooMany } from "@/lib/api";

export async function GET(req: Request) {
  if (!rateLimit(req)) return tooMany();
  const parsed = symbolsSchema.safeParse(
    new URL(req.url).searchParams.get("symbols") ?? "",
  );
  if (!parsed.success) return badRequest(parsed.error.issues);
  return chainResponse(await getQuotes(parsed.data), 10);
}
