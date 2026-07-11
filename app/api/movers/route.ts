import { z } from "zod";
import { getMovers } from "@/lib/data/chain";
import { badRequest, chainResponse, rateLimit, tooMany } from "@/lib/api";

const kindSchema = z.enum(["gainers", "losers", "actives"]).default("gainers");

export async function GET(req: Request) {
  if (!rateLimit(req)) return tooMany();
  const raw = new URL(req.url).searchParams.get("kind");
  const parsed = kindSchema.safeParse(raw ?? undefined);
  if (!parsed.success) return badRequest(parsed.error.issues);
  return chainResponse(await getMovers(parsed.data), 60);
}
