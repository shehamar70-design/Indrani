import { getFundamentals } from "@/lib/data/chain";
import { badRequest, chainResponse, rateLimit, tickerSchema, tooMany } from "@/lib/api";

export async function GET(req: Request) {
  if (!rateLimit(req)) return tooMany();
  const parsed = tickerSchema.safeParse(
    new URL(req.url).searchParams.get("symbol")?.toUpperCase() ?? "",
  );
  if (!parsed.success) return badRequest(parsed.error.issues);
  return chainResponse(await getFundamentals(parsed.data), 3600);
}
