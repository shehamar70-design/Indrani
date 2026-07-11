import { z } from "zod";
import { getChart } from "@/lib/data/chain";
import {
  badRequest,
  chainResponse,
  intervalSchema,
  rangeSchema,
  rateLimit,
  tickerSchema,
  tooMany,
} from "@/lib/api";

const paramsSchema = z.object({
  symbol: tickerSchema,
  range: rangeSchema.default("1mo"),
  interval: intervalSchema.default("1d"),
});

export async function GET(req: Request) {
  if (!rateLimit(req)) return tooMany();
  const sp = new URL(req.url).searchParams;
  const parsed = paramsSchema.safeParse({
    symbol: sp.get("symbol")?.toUpperCase() ?? "",
    range: sp.get("range") ?? undefined,
    interval: sp.get("interval") ?? undefined,
  });
  if (!parsed.success) return badRequest(parsed.error.issues);
  const { symbol, range, interval } = parsed.data;
  return chainResponse(await getChart(symbol, range, interval), 30);
}
