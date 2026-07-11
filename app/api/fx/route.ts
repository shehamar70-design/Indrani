import { z } from "zod";
import { getFx } from "@/lib/data/chain";
import { badRequest, chainResponse, rateLimit, tooMany } from "@/lib/api";

const baseSchema = z.string().regex(/^[A-Z]{3}$/, "expected ISO currency code").default("USD");

export async function GET(req: Request) {
  if (!rateLimit(req)) return tooMany();
  const raw = new URL(req.url).searchParams.get("base");
  const parsed = baseSchema.safeParse(raw ? raw.toUpperCase() : undefined);
  if (!parsed.success) return badRequest(parsed.error.issues);
  return chainResponse(await getFx(parsed.data), 60);
}
