/**
 * Better Auth server config — docs/13. Email+password only.
 * No SMTP in Phase 1: verification links are logged server-side in dev;
 * login is allowed while unverified (UI shows a "verify your email" banner).
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { account, session, user, verification } from "./db/schema";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
}

export const auth = betterAuth({
  secret: requireEnv("BETTER_AUTH_SECRET"),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false, // approved: allow login + banner, no SMTP yet
  },
  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({ user: u, token }) {
      // No SMTP configured (docs/13 §2): surface the link in server logs.
      const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
      console.log(`[indrani auth] verification link for ${u.email}: ${base}/verify?token=${token}`);
    },
  },
  rateLimit: {
    // docs/18 §1: 5 attempts / 15 min per IP on auth endpoints.
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 900, max: 5 },
      "/sign-up/email": { window: 900, max: 5 },
    },
  },
  plugins: [nextCookies()], // must stay last (docs: better-auth next-js)
});

export type Session = typeof auth.$Infer.Session;
