import { z } from "zod";
import { getCalendar } from "@/lib/data/chain";
import { badRequest, chainResponse, isoDateSchema, rateLimit, tooMany } from "@/lib/api";

const paramsSchema = z
  .object({ from: isoDateSchema, to: isoDateSchema })
  .refine((p) => p.from <= p.to, { message: "from must be <= to" });

function defaultRange(): { from: string; to: string } {
  const today = new Date();
  const to = new Date(today);
  to.setDate(to.getDate() + 14);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(today), to: iso(to) };
}

export async function GET(req: Request) {
  if (!rateLimit(req)) return tooMany();
  const sp = new URL(req.url).searchParams;
  const defaults = defaultRange();
  const parsed = paramsSchema.safeParse({
    from: sp.get("from") ?? defaults.from,
    to: sp.get("to") ?? defaults.to,
  });
  if (!parsed.success) return badRequest(parsed.error.issues);
  return chainResponse(await getCalendar(parsed.data.from, parsed.data.to), 600);
}
