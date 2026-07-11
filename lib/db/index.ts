/**
 * Neon serverless + Drizzle client. Server-side only — never import from
 * client components (docs/18: DATABASE_URL stays on the server).
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
}

export const db = drizzle(neon(requireEnv("DATABASE_URL")), { schema });
export { schema };
