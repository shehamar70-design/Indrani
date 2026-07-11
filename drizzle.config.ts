import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // drizzle-kit runs outside Next.js — load .env.local via --env-file or dotenv
    url: process.env.DATABASE_URL!,
  },
});
