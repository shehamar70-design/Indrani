# 13 — AUTH: LOGIN, REGISTER, VERIFY (SPEC)

Stack: **Better Auth + Neon Postgres + Drizzle** (Next.js App Router). Email + password only — no OAuth/magic links/social unless explicitly requested later.

## 1. Setup

- Env: `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET` (generate: `openssl rand -base64 32`). Verify BOTH exist before writing auth code.
- Better Auth server config in `lib/auth.ts` (emailAndPassword enabled, Drizzle adapter), client in `lib/auth-client.ts`, route handler at `app/api/auth/[...all]/route.ts`.
- Better Auth manages its own tables (users, sessions, accounts, verifications) via its Drizzle schema generator.

## 2. Routes & flows

| Route | Content |
|---|---|
| `/login` | Email + password, error states (invalid credentials, unverified), link to register/forgot. Redirect back to `?next=` target (e.g. `/terminal?fn=W`) |
| `/register` | Name, email, password (min 8, strength hint), confirm; on success → verification notice |
| `/verify` | Handles email verification token; success → sign in |
| `/forgot-password`, `/reset-password` | Standard Better Auth reset flow |
| `/account` | Profile (name), change password, active sessions list + revoke, default terminal layout, language preference, delete account (confirm modal) |

- Email delivery: MVP uses Better Auth's token flows; if no SMTP is configured, log verification links server-side in dev and mark email verification optional (allow login, show "verify your email" banner). Do NOT block MVP on an email provider; roadmap (doc 36) adds Resend later.

## 3. Session & protection

- `middleware`/`proxy.ts` guards: `/account` requires session; `/terminal` loads for guests but W/PORT/ALRT/saved layouts require session (inline sign-in prompt preserving state).
- Server components read session via Better Auth server API; never trust client-provided user ids.
- Every DB query for user data scoped by session `user_id` (Neon has no RLS — this is the security boundary; doc 18).

## 4. UI design

- Auth pages use the news-site light theme, centered card (max-w-400px), AKASH wordmark, terminal-style amber accent on focus rings. Clean, minimal, fast.
- All forms: zod validation client+server, disabled submit while pending, accessible labels + aria-describedby error text.

## 5. Acceptance checklist

- [ ] Register → verify → login → session persists across refresh.
- [ ] Guest visits `/terminal?fn=W` → sign-in prompt → after login lands back on W.
- [ ] Password hashing/session handling entirely via Better Auth (never hand-rolled).
- [ ] Session revoke from /account kills other devices.
- [ ] No user-scoped query without session user_id.
